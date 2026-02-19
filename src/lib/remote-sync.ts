/**
 * Remote sync module
 * Handles fetching and merging remote configuration
 */

import { configManager } from './config';
import { validateImportData } from './import-export';
import type { ConventionGroup, RemoteConfig } from './types';

/**
 * Result of a sync operation
 */
export interface SyncResult {
  success: boolean;
  groupsAdded: number;
  groupsUpdated: number;
  error?: string;
  timestamp: Date;
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  url: string;
  intervalHours: number;
  mergeStrategy: 'append' | 'override';
  lastSyncTimestamp?: number;
}

/**
 * Fetch remote configuration from URL
 */
export async function fetchRemoteConfig(url: string): Promise<RemoteConfig> {
  try {
    // Create fetch options
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    // Add timeout if AbortSignal.timeout is available (not in all environments)
    if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
      fetchOptions.signal = AbortSignal.timeout(10000); // 10 second timeout
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the data structure
    if (!validateImportData(data)) {
      throw new Error('Invalid remote configuration format');
    }

    return data as RemoteConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch remote config: ${error.message}`);
    }
    throw new Error('Failed to fetch remote config: Unknown error');
  }
}

/**
 * Sync remote configuration
 */
export async function syncRemoteConfig(
  url: string,
  mergeStrategy: 'append' | 'override' = 'append'
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    groupsAdded: 0,
    groupsUpdated: 0,
    timestamp: new Date(),
  };

  try {
    // Fetch remote config
    const remoteConfig = await fetchRemoteConfig(url);

    // Get current local config
    const localConfig = await configManager.getConfig();

    // Merge based on strategy
    if (mergeStrategy === 'override') {
      // Override: Replace all groups with remote groups
      // Keep only built-in groups from local, replace all others
      const remoteGroups = remoteConfig.groups.map((g) => ({
        ...g,
        isBuiltIn: false, // Remote groups are never built-in
      }));

      // Clear non-built-in groups
      const nonBuiltInGroups = localConfig.groups.filter((g) => !g.isBuiltIn);
      for (const group of nonBuiltInGroups) {
        await configManager.deleteGroup(group.id);
      }

      // Add all remote groups
      for (const group of remoteGroups) {
        await configManager.addGroup(group);
        result.groupsAdded++;
      }
    } else {
      // Append: Add remote groups, update existing ones by ID
      const existingIds = new Set(localConfig.groups.map((g) => g.id));

      for (const remoteGroup of remoteConfig.groups) {
        const group: ConventionGroup = {
          ...remoteGroup,
          isBuiltIn: false,
          isDefault: false, // Don't override default setting
        };

        if (existingIds.has(group.id)) {
          // Update existing group
          await configManager.updateGroup(group.id, group);
          result.groupsUpdated++;
        } else {
          // Add new group
          await configManager.addGroup(group);
          result.groupsAdded++;
        }
      }
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTimestamp(): Promise<number | null> {
  try {
    const config = await configManager.getConfig();
    return config.settings.lastSyncTimestamp || null;
  } catch {
    return null;
  }
}

/**
 * Update last sync timestamp
 */
export async function updateLastSyncTimestamp(timestamp: number): Promise<void> {
  const config = await configManager.getConfig();
  config.settings.lastSyncTimestamp = timestamp;
  await configManager.saveConfig(config);
}

/**
 * Check if sync is due based on interval
 */
export function isSyncDue(lastSyncTimestamp: number | null, intervalHours: number): boolean {
  if (!lastSyncTimestamp) {
    return true; // Never synced before
  }

  const now = Date.now();
  const intervalMs = intervalHours * 60 * 60 * 1000;
  return now - lastSyncTimestamp >= intervalMs;
}
