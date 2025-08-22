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
  
  // Server-side extraction via Supabase
  private readonly supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  private readonly supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  private createBookingSiteFallback(url: string): AccommodationPreview {
    const siteName = this.extractSiteName(url);
    
    // Try to extract hotel name from URL
    let hotelName = '';
    try {
      const urlPath = new URL(url).pathname;
      const pathParts = urlPath.split('/');
      
      // Look for hotel name in URL path (usually after /hotel/)
      const hotelIndex = pathParts.findIndex(part => part === 'hotel');
      if (hotelIndex !== -1 && hotelIndex + 2 < pathParts.length) {
        const hotelSlug = pathParts[hotelIndex + 2];
        hotelName = hotelSlug
          .replace(/\.html.*$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .trim();
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
    
    const title = hotelName || `${siteName.charAt(0).toUpperCase() + siteName.slice(1)} Accommodation`;
    
    return {
      title,
      description: `${hotelName ? hotelName + ' - ' : ''}Available on ${siteName.charAt(0).toUpperCase() + siteName.slice(1)}. Click to view full details, photos, pricing, and book your stay.`,
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

    if (!this.isValidUrl(url)) {
      throw new Error('Please enter a valid accommodation URL');
    }

    // Check if this is a known blocked booking site
    const isBlockedBookingSite = ['booking.com', 'hotels.com', 'expedia.com', 'agoda.com'].some(site => url.includes(site));

    try {
      // For blocked booking sites, try our server-side extraction first
      if (isBlockedBookingSite && this.supabaseUrl) {
        console.log('Attempting server-side extraction for blocked booking site:', url);
        try {
          const serverResult = await this.extractMetaViaSupabase(url);
          console.log('Server extraction result:', serverResult);
          
          if (serverResult.success) {
            // Even if we don't get image/title, we got a successful response
            // Let's create a better fallback with URL parsing
            let title = serverResult.title;
            let description = serverResult.description;
            
            // If no title extracted, try to parse from URL
            if (!title && url.includes('booking.com')) {
              const urlParts = url.split('/');
              const hotelSlug = urlParts.find(part => part.includes('hotel') || part.length > 10);
              if (hotelSlug) {
                title = hotelSlug
                  .replace(/hotel-|hotel\//, '')
                  .replace(/\.html.*$/, '')
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase());
              }
            }
            
            if (!description) {
              description = `${title ? title + ' - ' : ''}View this accommodation on ${serverResult.site || 'Booking.com'} for full details, photos, and booking information.`;
            }
            const preview: AccommodationPreview = {
              title: title || 'Accommodation',
              description: description,
              image: serverResult.image || '',
              site: serverResult.site || this.extractSiteName(url),
              author: '',
              url: serverResult.url || url,
              favicon: serverResult.favicon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
              isLoading: false,
              error: null,
            };
            console.log('Using server-extracted preview:', preview);
            this.cache.set(url, preview);
            return preview;
          }
        } catch (serverError) {
          console.log('Server-side extraction failed, falling back to Iframely:', serverError);
        }
      }

      // Try Iframely as primary method (or fallback for server-side extraction failure)
      if (!this.apiKey) {
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

      const params = new URLSearchParams({
        url: url,
        key: this.apiKey,
      });
      
      if (!isBlockedBookingSite) {
        params.append('iframe', '1');
        params.append('omit_script', '1');
      }

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      // Handle 202 (Accepted) - Iframely is processing the URL
      if (response.status === 202) {
        const processingPreview = {
          title: 'Processing accommodation...',
          description: 'Processing this accommodation link...',
          image: '',
          site: this.extractSiteName(url),
          author: '',
          url,
          favicon: '',
          isLoading: true,
          error: null,
        };
        
        this.cache.set(url, processingPreview);
        
        if (retryCount < 3) {
          setTimeout(async () => {
            try {
              await this.getAccommodationPreview(url, retryCount + 1);
            } catch (error) {
              // Ignore retry errors
            }
          }, 3000);
        }
        
        return processingPreview;
      }

      if (!response.ok) {
        throw new Error(`Iframely failed: ${response.status}`);
      }

      const data: IframelyResponse = await response.json();

      if (data.error) {
        if (isBlockedBookingSite) {
          const fallback = this.createBookingSiteFallback(url);
          this.cache.set(url, fallback);
          return fallback;
        }
        throw new Error(data.error);
      }

      if (!data.meta && !data.links && !data.html) {
        if (isBlockedBookingSite) {
          const fallback = this.createBookingSiteFallback(url);
          this.cache.set(url, fallback);
          return fallback;
        }
        throw new Error('No preview data available for this URL.');
      }

      const preview: AccommodationPreview = {
        title: data.meta?.title || 'Accommodation',
        description: this.truncateDescription(data.meta?.description || ''),
        image: this.getBestThumbnail(data.links?.thumbnail) || '',
        site: data.meta?.site || this.extractSiteName(url),
        author: data.meta?.author || '',
        url: data.meta?.canonical || url,
        favicon: this.getBestIcon(data.links?.icon) || '',
        isLoading: false,
        error: null,
      };

      this.cache.set(url, preview);
      return preview;

    } catch (error) {
      // Final fallback for blocked booking sites
      if (isBlockedBookingSite) {
        const fallback = this.createBookingSiteFallback(url);
        this.cache.set(url, fallback);
        return fallback;
      }

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

  private async extractMetaViaSupabase(url: string): Promise<{
    success: boolean;
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    favicon?: string;
    url?: string;
    error?: string;
  }> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${this.supabaseUrl}/functions/v1/extract-accommodation-meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.supabaseAnonKey,
        'Authorization': `Bearer ${this.supabaseAnonKey}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Server extraction failed: ${response.status}`);
    }

    return await response.json();
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForUrl(url: string): void {
    this.cache.delete(url);
  }
}

export const iframelyService = new IframelyService();
