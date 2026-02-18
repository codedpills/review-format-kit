/**
 * Background service worker for the Review Format Kit (RFK) extension
 * Handles extension lifecycle, remote config sync, and background tasks
 */

import { syncRemoteConfig, isSyncDue, getLastSyncTimestamp, updateLastSyncTimestamp } from '../lib/remote-sync';
import { configManager } from '../lib/config';

// Alarm name for periodic sync
const SYNC_ALARM_NAME = 'remote-config-sync';

/**
 * Initialize service worker
 */
async function init(): Promise<void> {

    // Set up periodic sync alarm
    await setupPeriodicSync();

    // Perform initial sync if configured
    await performSyncIfDue();
}

/**
 * Set up periodic sync alarm
 */
async function setupPeriodicSync(): Promise<void> {
    try {
        const config = await configManager.getConfig();
        const intervalHours = config.settings.remoteConfigSyncInterval;

        if (intervalHours > 0 && config.settings.remoteConfigUrl) {
            // Create alarm for periodic sync
            await chrome.alarms.create(SYNC_ALARM_NAME, {
                periodInMinutes: intervalHours * 60,
            });
        } else {
            // Clear alarm if sync is disabled
            await chrome.alarms.clear(SYNC_ALARM_NAME);
        }
    } catch (error) {
        console.error('Error setting up periodic sync:', error);
    }
}

/**
 * Perform sync if due based on interval
 */
async function performSyncIfDue(): Promise<void> {
    try {
        const config = await configManager.getConfig();
        const { remoteConfigUrl, remoteConfigSyncInterval } = config.settings;

        if (!remoteConfigUrl || remoteConfigSyncInterval <= 0) {
            return; // Sync not configured
        }

        const lastSync = await getLastSyncTimestamp();

        if (isSyncDue(lastSync, remoteConfigSyncInterval)) {
            await performSync();
        }
    } catch (error) {
        console.error('Error checking sync status:', error);
    }
}

/**
 * Perform remote config sync
 */
async function performSync(): Promise<void> {
    try {
        const config = await configManager.getConfig();
        const { remoteConfigUrl } = config.settings;

        if (!remoteConfigUrl) {
            return;
        }

        // Default to 'append' strategy for background sync
        const result = await syncRemoteConfig(remoteConfigUrl, 'append');

        if (result.success) {

            // Update last sync timestamp
            await updateLastSyncTimestamp(result.timestamp.getTime());

            // Notify user of successful sync (optional)
            if (result.groupsAdded > 0 || result.groupsUpdated > 0) {
                await showNotification(
                    'Configuration Synced',
                    `Added ${result.groupsAdded} groups, updated ${result.groupsUpdated} groups`
                );
            }
        } else {
            console.error('Sync failed:', result.error);
            await showNotification(
                'Sync Failed',
                result.error || 'Unknown error occurred'
            );
        }
    } catch (error) {
        console.error('Error performing sync:', error);
        await showNotification(
            'Sync Error',
            error instanceof Error ? error.message : 'Unknown error'
        );
    }
}

/**
 * Show notification to user
 */
async function showNotification(title: string, message: string): Promise<void> {
    try {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
            title,
            message,
        });
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

/**
 * Handle messages from content scripts or popup
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'SYNC_NOW') {
        // Manual sync triggered from UI
        performSync()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            });
        return true; // Keep message channel open for async response
    }

    if (message.type === 'GET_SYNC_STATUS') {
        // Get sync status
        getLastSyncTimestamp()
            .then((timestamp) => {
                sendResponse({ timestamp });
            })
            .catch(() => {
                sendResponse({ timestamp: null });
            });
        return true;
    }

    if (message.type === 'UPDATE_SYNC_SETTINGS') {
        // Sync settings changed, update alarm
        setupPeriodicSync()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            });
        return true;
    }
});

/**
 * Handle alarm events
 */
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === SYNC_ALARM_NAME) {
        performSync();
    }
});

/**
 * Handle extension installation/update
 */
chrome.runtime.onInstalled.addListener((details) => {

    if (details.reason === 'install') {
        init();
    } else if (details.reason === 'update') {
        init();
    }
});

// Initialize on service worker startup
init();
