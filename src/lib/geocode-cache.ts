// Enhanced geocoding cache with localStorage persistence
interface CachedGeocodingResult {
  address: string;
  timestamp: number;
  source: 'google' | 'city' | 'fallback';
}

class GeocodeCache {
  private cache = new Map<string, CachedGeocodingResult>();
  private readonly CACHE_KEY = 'mojPoslic_geocode_cache';
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor() {
    this.loadFromStorage();
  }

  // Load cache from localStorage
  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert array back to Map and validate entries
        for (const [key, value] of data) {
          if (this.isValidCacheEntry(value)) {
            this.cache.set(key, value);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load geocoding cache from localStorage:', error);
    }
  }

  // Save cache to localStorage
  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      // Convert Map to array for JSON serialization
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save geocoding cache to localStorage:', error);
    }
  }

  // Validate cache entry
  private isValidCacheEntry(entry: unknown): entry is CachedGeocodingResult {
    if (!entry || typeof entry !== 'object') return false;
    
    const obj = entry as Record<string, unknown>;
    return typeof obj.address === 'string' && 
           typeof obj.timestamp === 'number' && 
           typeof obj.source === 'string' &&
           ['google', 'city', 'fallback'].includes(obj.source);
  }

  // Clean up expired entries
  private cleanup() {
    const now = Date.now();
    let cleaned = false;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
        cleaned = true;
      }
    }
    
    // If cache is too large, remove oldest entries
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      for (const [key] of toRemove) {
        this.cache.delete(key);
        cleaned = true;
      }
    }
    
    if (cleaned) {
      this.saveToStorage();
    }
  }

  // Get cached result
  get(lat: number, lng: number): string | null {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    const cached = this.cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      return cached.address;
    }
    
    if (cached) {
      // Remove expired entry
      this.cache.delete(key);
    }
    
    return null;
  }

  // Set cached result
  set(lat: number, lng: number, address: string, source: 'google' | 'city' | 'fallback') {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    
    this.cache.set(key, {
      address,
      timestamp: Date.now(),
      source
    });
    
    // Clean up periodically
    if (this.cache.size % 50 === 0) {
      this.cleanup();
    } else {
      this.saveToStorage();
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      total: entries.length,
      google: entries.filter(e => e.source === 'google').length,
      city: entries.filter(e => e.source === 'city').length,
      fallback: entries.filter(e => e.source === 'fallback').length,
      expired: entries.filter(e => now - e.timestamp > this.CACHE_TTL).length
    };
  }
}

// Create singleton instance
export const geocodeCache = new GeocodeCache();
