// cacheService.ts

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class CacheService {
  private cache: { [key: string]: CacheItem<any> } = {};
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minuti in millisecondi

  set<T>(key: string, data: T, expiryMs: number = this.DEFAULT_EXPIRY): void {
    const expiry = Date.now() + expiryMs;
    this.cache[key] = { data, expiry };
  }

  get<T>(key: string): T | null {
    const item = this.cache[key];
    if (!item) return null;
    if (Date.now() > item.expiry) {
      delete this.cache[key];
      return null;
    }
    return item.data;
  }

  clear(): void {
    this.cache = {};
  }
}

export const cacheService = new CacheService();