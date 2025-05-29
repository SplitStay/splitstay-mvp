/**
 * Centralized session storage utility for consistent search data persistence
 */

export interface SearchData {
  destination: string;
  startDate: string | null;
  endDate: string | null;
  isFlexible: boolean;
  preferences: {
    budget: { min: number; max: number };
    roomType: string;
    genderPreference: string;
    ageRange: string;
    smokingPreference: string;
  };
}

const SEARCH_KEY = 'splitstay_search';
const PROFILES_KEY = 'splitstay_browsed_profiles';

export class SessionStorageManager {
  static saveSearchData(data: Partial<SearchData>): void {
    try {
      const existing = this.getSearchData();
      const updated = { ...existing, ...data };
      sessionStorage.setItem(SEARCH_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search data:', error);
    }
  }

  static getSearchData(): SearchData | null {
    try {
      const data = sessionStorage.getItem(SEARCH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve search data:', error);
      return null;
    }
  }

  static saveProfiles(profiles: any[]): void {
    try {
      sessionStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Failed to save profiles:', error);
    }
  }

  static getProfiles(): any[] {
    try {
      const data = sessionStorage.getItem(PROFILES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve profiles:', error);
      return [];
    }
  }

  static getProfileById(id: string): any | null {
    try {
      const profiles = this.getProfiles();
      return profiles.find((p: any) => String(p.id) === String(id)) || null;
    } catch (error) {
      console.error('Failed to retrieve profile by ID:', error);
      return null;
    }
  }

  static clearAll(): void {
    try {
      sessionStorage.removeItem(SEARCH_KEY);
      sessionStorage.removeItem(PROFILES_KEY);
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }

  static isSearchDataComplete(): boolean {
    const data = this.getSearchData();
    return !!(data?.destination && data?.startDate && data?.endDate);
  }

  static getFormattedDates(): string {
    const data = this.getSearchData();
    if (!data?.startDate || !data?.endDate) return "Select dates";
    
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } catch {
      return "Select dates";
    }
  }
}