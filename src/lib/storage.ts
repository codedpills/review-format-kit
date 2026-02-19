import browser from 'webextension-polyfill';

/**
 * Storage wrapper for browser.storage.local
 * Provides type-safe operations and error handling
 */
export class Storage {
  /**
   * Get value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await browser.storage.local.get(key);
      return (result[key] as T) ?? null;
    } catch (error) {
      console.error(`Storage.get error for key "${key}":`, error);
      throw new Error(`Failed to get storage key: ${key}`);
    }
  }

  /**
   * Set value in storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await browser.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`Storage.set error for key "${key}":`, error);

      // Check if quota exceeded
      if (error instanceof Error && error.message.includes('QUOTA')) {
        throw new Error(
          'Storage quota exceeded. Please free up space by removing some convention groups.'
        );
      }

      throw new Error(`Failed to set storage key: ${key}`);
    }
  }

  /**
   * Remove key from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await browser.storage.local.remove(key);
    } catch (error) {
      console.error(`Storage.remove error for key "${key}":`, error);
      throw new Error(`Failed to remove storage key: ${key}`);
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await browser.storage.local.clear();
    } catch (error) {
      console.error('Storage.clear error:', error);
      throw new Error('Failed to clear storage');
    }
  }

  /**
   * Get all keys and values from storage
   */
  async getAll(): Promise<Record<string, unknown>> {
    try {
      return await browser.storage.local.get(null);
    } catch (error) {
      console.error('Storage.getAll error:', error);
      throw new Error('Failed to get all storage');
    }
  }
}

export const storage = new Storage();
