import { vi } from 'vitest';

// Mock browser.storage API
const mockStorage = new Map<string, unknown>();

export const mockBrowser = {
  storage: {
    local: {
      get: vi.fn((keys: string | string[] | null) => {
        if (keys === null) {
          return Promise.resolve(Object.fromEntries(mockStorage));
        }

        const keyArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};

        for (const key of keyArray) {
          const value = mockStorage.get(key);
          if (value !== undefined) {
            result[key] = value;
          }
        }

        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        for (const [key, value] of Object.entries(items)) {
          mockStorage.set(key, value);
        }
        return Promise.resolve();
      }),
      remove: vi.fn((keys: string | string[]) => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        for (const key of keyArray) {
          mockStorage.delete(key);
        }
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        mockStorage.clear();
        return Promise.resolve();
      }),
    },
  },
};

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: mockBrowser,
}));

// Clear mock storage before each test
beforeEach(() => {
  mockStorage.clear();
  vi.clearAllMocks();
});
