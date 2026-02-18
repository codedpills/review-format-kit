/**
 * Convention item within a group
 */
export interface Convention {
    id: string;
    label: string;
    displayName: string;
    template: string;
    description?: string;
    color?: string;
}

/**
 * Group of conventions (e.g., Conventional Comments, Netlify Ladders)
 */
export interface ConventionGroup {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    isBuiltIn: boolean;
    conventions: Convention[];
}

/**
 * Extension settings
 */
export interface Settings {
    keyboardShortcut: string;
    showInPageIcon: boolean;
    enabledDomains: string[];
    remoteConfigUrl?: string;
    remoteConfigSyncInterval: number; // in hours
    lastSyncTimestamp?: number; // Unix timestamp of last successful sync
}

/**
 * Complete extension configuration
 */
export interface ExtensionConfig {
    version: string;
    groups: ConventionGroup[];
    settings: Settings;
}

/**
 * Remote config format (for team sharing)
 */
export interface RemoteConfig {
    version: string;
    groups: ConventionGroup[];
}

/**
 * Merge strategy for remote config
 */
export type MergeStrategy = 'append' | 'override';

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
    CONFIG: 'extensionConfig',
    REMOTE_CONFIG_CACHE: 'remoteConfigCache',
    LAST_SYNC: 'lastSyncTimestamp',
} as const;

/**
 * Config schema version
 */
export const CONFIG_VERSION = '1.0.0';
