interface LocationIQPlace {
  place_id: string;
  osm_id: string;
  osm_type: string;
  licence: string;
  lat: string;
  lon: string;
  boundingbox: string[];
  class: string;
  type: string;
  display_name: string;
  display_place: string;
  display_address: string;
  address: {
    name: string;
    state?: string;
    postcode?: string;
    country: string;
    country_code: string;
    county?: string;
  };
}

interface CacheEntry {
  results: string[];
  timestamp: number;
}

class LocationIQService {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://us1.locationiq.com/v1/autocomplete';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly FALLBACK_CITIES = [
    "New York, United States", "Los Angeles, United States", "London, United Kingdom", 
    "Paris, France", "Tokyo, Japan", "Berlin, Germany", "Madrid, Spain", "Rome, Italy",
    "Amsterdam, Netherlands", "Barcelona, Spain", "Toronto, Canada", "Sydney, Australia",
    "Bangkok, Thailand", "Singapore, Singapore", "Seoul, South Korea", "Mumbai, India",
    "Dubai, United Arab Emirates", "Istanbul, Turkey", "Moscow, Russia", "São Paulo, Brazil"
  ];
  private cache: Map<string, CacheEntry> = new Map();
  private abortController: AbortController | null = null;
  private isApiAvailable: boolean = true;
  private lastApiError: number = 0;
  private readonly API_COOLDOWN = 30 * 1000; // 30 seconds cooldown after API failure

  constructor() {
    this.API_KEY = import.meta.env.VITE_LOCATION_IQ_API_KEY;
    if (!this.API_KEY) {
      console.warn('LocationIQ API key not found in environment variables');
    }
  }

  private getCacheKey(query: string): string {
    return query.toLowerCase().trim();
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  private formatCityName(place: LocationIQPlace): string {
    const city = place.display_place || place.address.name;
    const country = place.address.country;
    const state = place.address.state;
    
    // Format: "City, Country" or "City, State, Country"
    if (state && state !== country) {
      return `${city}, ${state}, ${country}`;
    }
    return `${city}, ${country}`;
  }

  private shouldUseApi(): boolean {
    // Check if API is available and not in cooldown
    if (!this.isApiAvailable && Date.now() - this.lastApiError < this.API_COOLDOWN) {
      return false;
    }
    return !!this.API_KEY;
  }

  private fallbackSearch(query: string): string[] {
    // Simple fallback using the predefined cities list
    return this.FALLBACK_CITIES
      .filter(city => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5); // Limit to 5 results for fallback
  }

  private markApiAsUnavailable(): void {
    this.isApiAvailable = false;
    this.lastApiError = Date.now();
  }

  private markApiAsAvailable(): void {
    this.isApiAvailable = true;
    this.lastApiError = 0;
  }

  async searchCities(query: string): Promise<string[]> {
    // Validate input
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = this.getCacheKey(query);
    
    // Check cache first
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && this.isValidCache(cachedEntry)) {
      return cachedEntry.results;
    }

    // Check if we should use API or fallback
    if (!this.shouldUseApi()) {
      console.log('Using fallback city search due to API unavailability');
      return this.fallbackSearch(query);
    }

    try {
      // Cancel previous request if still pending
      if (this.abortController) {
        this.abortController.abort();
      }

      // Create new abort controller for this request
      this.abortController = new AbortController();

      const url = new URL(this.BASE_URL);
      url.searchParams.set('key', this.API_KEY);
      url.searchParams.set('q', query);
      url.searchParams.set('tag', 'place:city');
      url.searchParams.set('limit', '10');
      url.searchParams.set('accept-language', 'en');

      const response = await fetch(url.toString(), {
        headers: {
          'accept': 'application/json',
        },
        signal: this.abortController.signal,
        timeout: 5000, // 5 second timeout
      });

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          console.warn('LocationIQ rate limit exceeded, switching to fallback');
          this.markApiAsUnavailable();
          return this.fallbackSearch(query);
        }
        throw new Error(`LocationIQ API error: ${response.status} ${response.statusText}`);
      }

      const data: LocationIQPlace[] = await response.json();
      
      // Mark API as available since we got a successful response
      this.markApiAsAvailable();
      
      // Filter and format results to only include cities
      const cities = data
        .filter(place => place.type === 'city' || place.class === 'place')
        .map(place => this.formatCityName(place))
        .filter((city, index, arr) => arr.indexOf(city) === index) // Remove duplicates
        .slice(0, 8); // Limit to 8 results

      // Cache the results
      this.cache.set(cacheKey, {
        results: cities,
        timestamp: Date.now(),
      });

      // Clean up old cache entries periodically
      this.cleanupCache();

      return cities;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, return fallback
        return this.fallbackSearch(query);
      }
      
      console.warn('LocationIQ API error, falling back to local search:', error);
      
      // Mark API as temporarily unavailable and use fallback
      this.markApiAsUnavailable();
      return this.fallbackSearch(query);
    } finally {
      this.abortController = null;
    }
  }

  private cleanupCache(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidCache(entry)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache entries
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics for debugging
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Get API status for UI feedback
  getApiStatus(): { 
    isAvailable: boolean; 
    isInCooldown: boolean; 
    cooldownEndsAt: number | null;
    hasApiKey: boolean;
  } {
    const isInCooldown = !this.isApiAvailable && (Date.now() - this.lastApiError < this.API_COOLDOWN);
    return {
      isAvailable: this.isApiAvailable,
      isInCooldown,
      cooldownEndsAt: isInCooldown ? this.lastApiError + this.API_COOLDOWN : null,
      hasApiKey: !!this.API_KEY,
    };
  }

  // Force retry API (useful for manual retry)
  retryApi(): void {
    this.markApiAsAvailable();
  }
}

// Export singleton instance
export const locationIQService = new LocationIQService();
export type { LocationIQPlace };