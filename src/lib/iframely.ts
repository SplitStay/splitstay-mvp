interface IframelyResponse {
  url: string;
  meta: {
    title?: string;
    description?: string;
    author?: string;
    site?: string;
    canonical?: string;
    date?: string;
  };
  links?: {
    thumbnail?: Array<{
      href: string;
      type: string;
      media?: {
        width?: number;
        height?: number;
      };
    }>;
    icon?: Array<{
      href: string;
      type: string;
      sizes?: string;
    }>;
  };
  html?: string;
  error?: string;
}

export interface AccommodationPreview {
  title: string;
  description: string;
  image: string;
  site: string;
  author: string;
  url: string;
  favicon: string;
  isLoading: boolean;
  error: string | null;
}

class IframelyService {
  private readonly baseUrl = 'https://iframe.ly/api/iframely';
  private readonly apiKey = import.meta.env.VITE_IFRAMELY_API_KEY || 'e7ef2fd691282a8112c2ce56874a1d24';
  private cache = new Map<string, AccommodationPreview>();
  
  // Fallback services
  private readonly linkPreviewApiKey = import.meta.env.VITE_LINK_PREVIEW_API_KEY;
  private readonly linkPreviewUrl = 'https://api.linkpreview.net';

  private createBookingSiteFallback(url: string): AccommodationPreview {
    const siteName = this.extractSiteName(url);
    return {
      title: `${siteName.charAt(0).toUpperCase() + siteName.slice(1)} Accommodation`,
      description: `This accommodation is available on ${siteName}. Due to security measures, we cannot display a preview, but you can click the link below to view full details, photos, and booking information.`,
      image: '',
      site: siteName.charAt(0).toUpperCase() + siteName.slice(1),
      author: '',
      url,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
      isLoading: false,
      error: null,
    };
  }

  async getAccommodationPreview(url: string, retryCount: number = 0): Promise<AccommodationPreview> {
    // Return cached result if available (but not if it was a 202 processing state)
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      if (!cached.isLoading || retryCount === 0) {
        return cached;
      }
    }

    // We'll return loading state inline when needed

    try {
      if (!this.apiKey) {
        // Return a demo preview when API key is not configured
        return {
          title: 'Demo Accommodation Preview',
          description: 'This is a demo preview. Configure VITE_IFRAMELY_API_KEY to see real accommodation previews from Booking.com, Airbnb, and other sites.',
          image: '',
          site: 'Demo Site',
          author: '',
          url,
          favicon: '',
          isLoading: false,
          error: null,
        };
      }

      if (!this.isValidUrl(url)) {
        throw new Error('Please enter a valid accommodation URL');
      }

      // Try different parameters for booking.com
      const isBookingCom = url.includes('booking.com');
      const params = new URLSearchParams({
        url: url,
        key: this.apiKey,
      });
      
      // For booking.com, try without iframe and omit_script parameters
      if (!isBookingCom) {
        params.append('iframe', '1');
        params.append('omit_script', '1');
      }

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      // Handle 202 (Accepted) - Iframely is processing the URL
      if (response.status === 202) {
        const processingPreview = {
          title: 'Processing accommodation...',
          description: 'Iframely is processing this accommodation link. This usually takes a few seconds for complex booking sites.',
          image: '',
          site: this.extractSiteName(url),
          author: '',
          url,
          favicon: '',
          isLoading: true,
          error: null,
        };
        
        // Cache the processing state
        this.cache.set(url, processingPreview);
        
        // Retry after 3 seconds, but only up to 3 times
        if (retryCount < 3) {
          setTimeout(async () => {
            try {
              await this.getAccommodationPreview(url, retryCount + 1);
            } catch (error) {
              // Ignore retry errors, user can manually refresh
            }
          }, 3000);
        }
        
        return processingPreview;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch preview: ${response.status}`);
      }

      const data: IframelyResponse = await response.json();

      // Debug logging can be enabled if needed
      // console.log('Iframely response:', { status: response.status, hasData: !!data.meta });

      // Handle errors from booking sites specially
      if (data.error) {
        const isBookingSite = ['booking.com', 'hotels.com', 'expedia.com'].some(site => url.includes(site));
        
        if (isBookingSite) {
          // Return fallback for booking sites instead of throwing error
          const fallback = this.createBookingSiteFallback(url);
          this.cache.set(url, fallback);
          return fallback;
        }
        
        throw new Error(data.error);
      }

      // Handle empty response or blocked content from booking sites
      if (!data.meta && !data.links && !data.html) {
        const isBookingSite = ['booking.com', 'hotels.com', 'expedia.com'].some(site => url.includes(site));
        
        if (isBookingSite) {
          const fallback = this.createBookingSiteFallback(url);
          this.cache.set(url, fallback);
          return fallback;
        }
        
        throw new Error('No preview data available for this URL. The site may be blocking preview generation.');
      }

      const preview: AccommodationPreview = {
        title: data.meta?.title || (url.includes('booking.com') ? 'Booking.com Property' : 'Accommodation'),
        description: this.truncateDescription(data.meta?.description || (url.includes('booking.com') ? 'Hotel or accommodation from Booking.com. Click to view full details on the booking site.' : '')),
        image: this.getBestThumbnail(data.links?.thumbnail) || '',
        site: data.meta?.site || this.extractSiteName(url),
        author: data.meta?.author || '',
        url: data.meta?.canonical || url,
        favicon: this.getBestIcon(data.links?.icon) || '',
        isLoading: false,
        error: null,
      };

      // Cache the result
      this.cache.set(url, preview);
      return preview;

    } catch (error) {
      const errorPreview: AccommodationPreview = {
        title: '',
        description: '',
        image: '',
        site: '',
        author: '',
        url,
        favicon: '',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load preview',
      };

      this.cache.set(url, errorPreview);
      return errorPreview;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private extractSiteName(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '').split('.')[0];
    } catch {
      return 'Accommodation Site';
    }
  }

  private getBestThumbnail(thumbnails?: Array<{ href: string; media?: { width?: number; height?: number } }>): string {
    if (!thumbnails || thumbnails.length === 0) return '';
    
    // Sort by size (prefer larger images)
    const sorted = thumbnails.sort((a, b) => {
      const aSize = (a.media?.width || 0) * (a.media?.height || 0);
      const bSize = (b.media?.width || 0) * (b.media?.height || 0);
      return bSize - aSize;
    });

    return sorted[0]?.href || '';
  }

  private getBestIcon(icons?: Array<{ href: string; sizes?: string }>): string {
    if (!icons || icons.length === 0) return '';
    
    // Prefer larger icons
    const sorted = icons.sort((a, b) => {
      const aSize = this.parseIconSize(a.sizes);
      const bSize = this.parseIconSize(b.sizes);
      return bSize - aSize;
    });

    return sorted[0]?.href || '';
  }

  private parseIconSize(sizes?: string): number {
    if (!sizes) return 0;
    const match = sizes.match(/(\d+)x(\d+)/);
    if (match) {
      return parseInt(match[1]) * parseInt(match[2]);
    }
    return 0;
  }

  private truncateDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const iframelyService = new IframelyService();
