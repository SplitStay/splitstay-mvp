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
  private readonly apiKey = import.meta.env.VITE_IFRAMELY_API_KEY;
  private cache = new Map<string, AccommodationPreview>();

  async getAccommodationPreview(url: string): Promise<AccommodationPreview> {
    // Return cached result if available
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Return loading state immediately
    const loadingPreview: AccommodationPreview = {
      title: '',
      description: '',
      image: '',
      site: '',
      author: '',
      url,
      favicon: '',
      isLoading: true,
      error: null,
    };

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

      const response = await fetch(
        `${this.baseUrl}?url=${encodeURIComponent(url)}&api_key=${this.apiKey}&iframe=1&omit_script=1`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch preview: ${response.status}`);
      }

      const data: IframelyResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
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
