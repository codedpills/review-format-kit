/**
 * Popup script
 * Displays active convention group and provides quick access to settings
 */

import { configManager } from '../lib/config';

// DOM elements
let groupSelector: HTMLSelectElement;
let conventionCount: HTMLElement;
let shortcutDisplay: HTMLElement;
let openSettingsBtn: HTMLButtonElement;

/**
 * Initialize popup
 */
async function init(): Promise<void> {
  // Get DOM elements
  groupSelector = document.getElementById('group-selector') as HTMLSelectElement;
  conventionCount = document.getElementById('convention-count') as HTMLElement;
  shortcutDisplay = document.getElementById('shortcut-display') as HTMLElement;
  openSettingsBtn = document.getElementById('open-settings') as HTMLButtonElement;

  // Load and display data
  await loadGroups();
  await displayShortcut();

  // Set up event listeners
  groupSelector.addEventListener('change', handleGroupChange);
  openSettingsBtn.addEventListener('click', handleOpenSettings);
}

/**
 * Load convention groups and populate selector
 */
async function loadGroups(): Promise<void> {
  try {
    const config = await configManager.getConfig();
    const groups = config.groups;

    // Clear existing options
    groupSelector.innerHTML = '';

    // Add groups to selector
    groups.forEach((group) => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.name;
      if (group.isDefault) {
        option.selected = true;
      }
      groupSelector.appendChild(option);
    });

    // Display active group info
    await displayActiveGroupInfo();
  } catch (error) {
    console.error('Error loading groups:', error);
    groupSelector.innerHTML = '<option value="">Error loading groups</option>';
  }
}

/**
 * Display information about the active group
 */
async function displayActiveGroupInfo(): Promise<void> {
  try {
    const activeGroup = await configManager.getActiveGroup();
    if (activeGroup) {
      conventionCount.textContent = activeGroup.conventions.length.toString();
    } else {
      conventionCount.textContent = '0';
    }
  } catch (error) {
    console.error('Error displaying active group info:', error);
    conventionCount.textContent = '0';
  }
}

/**
 * Display keyboard shortcut
 */
async function displayShortcut(): Promise<void> {
  try {
    const config = await configManager.getConfig();
    const shortcut = config.settings.keyboardShortcut;

    // Format shortcut for display
    const formattedShortcut = formatShortcut(shortcut);
    shortcutDisplay.textContent = formattedShortcut;
  } catch (error) {
    console.error('Error displaying shortcut:', error);
    shortcutDisplay.textContent = 'Cmd+Shift+/';
  }
}

/**
 * Format shortcut string for display
 */
function formatShortcut(shortcut: string): string {
  // Replace 'Cmd' with '⌘' on Mac, keep as is on other platforms
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (isMac) {
    return shortcut
      .replace(/Cmd/gi, '⌘')
      .replace(/Shift/gi, '⇧')
      .replace(/Alt/gi, '⌥')
      .replace(/Ctrl/gi, '⌃');
  }

  return shortcut;
}

/**
 * Handle group change
 */
async function handleGroupChange(): Promise<void> {
  const selectedGroupId = groupSelector.value;

  try {
    await configManager.setActiveGroup(selectedGroupId);
    await displayActiveGroupInfo();
  } catch (error) {
    console.error('Error changing active group:', error);
  }
}

/**
 * Handle open settings button click
 */
function handleOpenSettings(): void {
  // Open options page in new tab
  if (chrome?.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    // Fallback for browsers that don't support openOptionsPage
    window.open(chrome.runtime.getURL('src/options/options.html'));
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
