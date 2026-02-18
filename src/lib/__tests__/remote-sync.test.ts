/**
 * Tests for remote sync functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    fetchRemoteConfig,
    syncRemoteConfig,
    isSyncDue,
    getLastSyncTimestamp,
    updateLastSyncTimestamp
} from '../remote-sync';
import { configManager } from '../config';
import type { RemoteConfig, ExtensionConfig } from '../types';

// Mock fetch
global.fetch = vi.fn();

// Mock configManager
vi.mock('../config', () => ({
    configManager: {
        getConfig: vi.fn(),
        saveConfig: vi.fn(),
        addGroup: vi.fn(),
        updateGroup: vi.fn(),
        deleteGroup: vi.fn(),
    },
}));

describe('Remote Sync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchRemoteConfig', () => {
        it('should fetch and validate remote config', async () => {
            const mockConfig: RemoteConfig = {
                version: '1.0.0',
                groups: [
                    {
                        id: 'remote-1',
                        name: 'Remote Group',
                        isDefault: false,
                        isBuiltIn: false,
                        conventions: [
                            {
                                id: 'conv-1',
                                label: 'test',
                                displayName: 'Test',
                                template: 'test: <subject>',
                            },
                        ],
                    },
                ],
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockConfig,
            });

            const result = await fetchRemoteConfig('https://example.com/config.json');

            expect(result).toEqual(mockConfig);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/config.json',
                expect.objectContaining({
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                })
            );
        });

        it('should throw error on HTTP error', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            await expect(fetchRemoteConfig('https://example.com/config.json')).rejects.toThrow(
                'Failed to fetch remote config: HTTP 404: Not Found'
            );
        });

        it('should throw error on invalid JSON', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ invalid: 'data' }),
            });

            await expect(fetchRemoteConfig('https://example.com/config.json')).rejects.toThrow(
                'Invalid remote configuration format'
            );
        });

        it('should throw error on network failure', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            await expect(fetchRemoteConfig('https://example.com/config.json')).rejects.toThrow(
                'Failed to fetch remote config: Network error'
            );
        });
    });

    describe('syncRemoteConfig', () => {
        const mockLocalConfig: ExtensionConfig = {
            version: '1.0.0',
            groups: [
                {
                    id: 'built-in-1',
                    name: 'Built-in Group',
                    isDefault: true,
                    isBuiltIn: true,
                    conventions: [],
                },
                {
                    id: 'custom-1',
                    name: 'Custom Group',
                    isDefault: false,
                    isBuiltIn: false,
                    conventions: [],
                },
            ],
            settings: {
                keyboardShortcut: 'Cmd+Shift+/',
                showInPageIcon: true,
                enabledDomains: ['github.com'],
                remoteConfigSyncInterval: 24,
            },
        };

        const mockRemoteConfig: RemoteConfig = {
            version: '1.0.0',
            groups: [
                {
                    id: 'remote-1',
                    name: 'Remote Group',
                    isDefault: false,
                    isBuiltIn: false,
                    conventions: [
                        {
                            id: 'conv-1',
                            label: 'test',
                            displayName: 'Test',
                            template: 'test: <subject>',
                        },
                    ],
                },
            ],
        };

        beforeEach(() => {
            (configManager.getConfig as any).mockResolvedValue(mockLocalConfig);
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockRemoteConfig,
            });
        });

        it('should sync with append strategy', async () => {
            const result = await syncRemoteConfig('https://example.com/config.json', 'append');

            expect(result.success).toBe(true);
            expect(result.groupsAdded).toBe(1);
            expect(result.groupsUpdated).toBe(0);
            expect(configManager.addGroup).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'remote-1',
                    name: 'Remote Group',
                    isBuiltIn: false,
                    isDefault: false,
                })
            );
        });

        it('should update existing groups with append strategy', async () => {
            const updatedRemoteConfig: RemoteConfig = {
                version: '1.0.0',
                groups: [
                    {
                        id: 'custom-1', // Same ID as existing
                        name: 'Updated Custom Group',
                        isDefault: false,
                        isBuiltIn: false,
                        conventions: [],
                    },
                ],
            };

            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => updatedRemoteConfig,
            });

            const result = await syncRemoteConfig('https://example.com/config.json', 'append');

            expect(result.success).toBe(true);
            expect(result.groupsAdded).toBe(0);
            expect(result.groupsUpdated).toBe(1);
            expect(configManager.updateGroup).toHaveBeenCalledWith(
                'custom-1',
                expect.objectContaining({
                    name: 'Updated Custom Group',
                })
            );
        });

        it('should sync with override strategy', async () => {
            const result = await syncRemoteConfig('https://example.com/config.json', 'override');

            expect(result.success).toBe(true);
            expect(result.groupsAdded).toBe(1);
            // Should delete custom-1 but keep built-in-1
            expect(configManager.deleteGroup).toHaveBeenCalledWith('custom-1');
            expect(configManager.deleteGroup).not.toHaveBeenCalledWith('built-in-1');
        });

        it('should handle sync errors gracefully', async () => {
            (global.fetch as any).mockRejectedValue(new Error('Network error'));

            const result = await syncRemoteConfig('https://example.com/config.json', 'append');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network error');
            expect(result.groupsAdded).toBe(0);
            expect(result.groupsUpdated).toBe(0);
        });
    });

    describe('isSyncDue', () => {
        it('should return true if never synced', () => {
            expect(isSyncDue(null, 24)).toBe(true);
        });

        it('should return true if interval has passed', () => {
            const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
            expect(isSyncDue(oneDayAgo, 24)).toBe(true);
        });

        it('should return false if interval has not passed', () => {
            const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
            expect(isSyncDue(oneHourAgo, 24)).toBe(false);
        });
    });

    describe('getLastSyncTimestamp', () => {
        it('should return timestamp from config', async () => {
            const timestamp = Date.now();
            (configManager.getConfig as any).mockResolvedValue({
                settings: { lastSyncTimestamp: timestamp },
            });

            const result = await getLastSyncTimestamp();
            expect(result).toBe(timestamp);
        });

        it('should return null if no timestamp', async () => {
            (configManager.getConfig as any).mockResolvedValue({
                settings: {},
            });

            const result = await getLastSyncTimestamp();
            expect(result).toBeNull();
        });

        it('should return null on error', async () => {
            (configManager.getConfig as any).mockRejectedValue(new Error('Storage error'));

            const result = await getLastSyncTimestamp();
            expect(result).toBeNull();
        });
    });

    describe('updateLastSyncTimestamp', () => {
        it('should update timestamp in config', async () => {
            const mockConfig: ExtensionConfig = {
                version: '1.0.0',
                groups: [],
                settings: {
                    keyboardShortcut: 'Cmd+Shift+/',
                    showInPageIcon: true,
                    enabledDomains: [],
                    remoteConfigSyncInterval: 24,
                },
            };

            (configManager.getConfig as any).mockResolvedValue(mockConfig);

            const timestamp = Date.now();
            await updateLastSyncTimestamp(timestamp);

            expect(configManager.saveConfig).toHaveBeenCalledWith(
                expect.objectContaining({
                    settings: expect.objectContaining({
                        lastSyncTimestamp: timestamp,
                    }),
                })
            );
        });
    });
});
