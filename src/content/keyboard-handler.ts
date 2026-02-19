/**
 * Keyboard shortcut handler
 * Listens for configured keyboard shortcut and opens dropdown
 */

import { showDropdown, isDropdownVisible, hideDropdown } from './dropdown';
import type { Convention } from '../lib/types';

let currentShortcut = 'Cmd+Shift+/';
let currentListener: ((event: KeyboardEvent) => void) | null = null;

/**
 * Register keyboard shortcut listener
 */
export function registerShortcut(
  shortcut: string,
  getConventions: () => Promise<Convention[]>
): void {
  // Always unregister first to avoid duplicates
  unregisterShortcut();

  currentShortcut = shortcut;
  currentListener = (event: KeyboardEvent) => handleShortcut(event, getConventions);

  document.addEventListener('keydown', currentListener);
}

/**
 * Unregister keyboard shortcut listener
 */
export function unregisterShortcut(): void {
  if (currentListener) {
    document.removeEventListener('keydown', currentListener);
    currentListener = null;
  }
}

/**
 * Handle keyboard shortcut
 */
async function handleShortcut(
  event: KeyboardEvent,
  getConventions: () => Promise<Convention[]>
): Promise<void> {
  if (!matchesShortcut(event, currentShortcut)) {
    return;
  }

  // Find focused textarea or editable element
  const textarea = getFocusedTextarea();
  if (!textarea) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  // If dropdown is already visible, hide it
  if (isDropdownVisible()) {
    hideDropdown();
    return;
  }

  // Get conventions
  const conventions = await getConventions();
  if (conventions.length === 0) {
    return;
  }

  // Show dropdown at textarea
  showDropdown(textarea, textarea, conventions);
}

/**
 * Check if event matches shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split('+').map((p) => p.trim().toLowerCase());

  // Check modifiers
  const needsCtrl = parts.includes('ctrl');
  const needsCmd = parts.includes('cmd') || parts.includes('command');
  const needsShift = parts.includes('shift');
  const needsAlt = parts.includes('alt') || parts.includes('option');

  // On Mac, Cmd is metaKey; on Windows/Linux, Ctrl is ctrlKey
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? event.metaKey : event.ctrlKey;

  if (needsCtrl && !event.ctrlKey) return false;
  if (needsCmd && !modifierKey) return false;
  if (needsShift && !event.shiftKey) return false;
  if (needsAlt && !event.altKey) return false;

  // Check key
  const keyPart = parts.find(
    (p) => !['ctrl', 'cmd', 'command', 'shift', 'alt', 'option'].includes(p)
  );
  if (!keyPart) return false;

  // Handle special keys and common cases
  const eventKey = event.key.toLowerCase();
  const eventCode = event.code.toLowerCase();

  // Slash is special, especially with Shift
  if (keyPart === 'slash' || keyPart === '/') {
    // Shift + / is often ? in event.key, but code is always Slash
    return eventKey === '/' || eventKey === '?' || eventCode === 'slash';
  }

  return eventKey === keyPart || eventCode === `key${keyPart}`;
}

/**
 * Get currently focused textarea
 */
function getFocusedTextarea(): HTMLTextAreaElement | null {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLTextAreaElement) {
    return activeElement;
  }

  // Check if active element is inside a comment form
  const textarea = activeElement?.closest('textarea');
  if (textarea instanceof HTMLTextAreaElement) {
    return textarea;
  }

  return null;
}
