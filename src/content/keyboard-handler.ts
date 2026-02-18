/**
 * Keyboard shortcut handler
 * Listens for configured keyboard shortcut and opens dropdown
 */

import { showDropdown, isDropdownVisible, hideDropdown } from './dropdown';
import type { Convention } from '../lib/types';

let isRegistered = false;
let currentShortcut = 'Cmd+Shift+/';

/**
 * Register keyboard shortcut listener
 */
export function registerShortcut(
    shortcut: string,
    getConventions: () => Promise<Convention[]>
): void {
    if (isRegistered) {
        unregisterShortcut();
    }

    currentShortcut = shortcut;

    document.addEventListener('keydown', (event) => handleShortcut(event, getConventions));
    isRegistered = true;
}

/**
 * Unregister keyboard shortcut listener
 */
export function unregisterShortcut(): void {
    if (isRegistered) {
        document.removeEventListener('keydown', (event) => handleShortcut(event, () => Promise.resolve([])));
        isRegistered = false;
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

    event.preventDefault();
    event.stopPropagation();

    // If dropdown is already visible, hide it
    if (isDropdownVisible()) {
        hideDropdown();
        return;
    }

    // Find focused textarea
    const textarea = getFocusedTextarea();
    if (!textarea) {
        console.log('PR Conventions: No focused textarea found');
        return;
    }

    // Get conventions
    const conventions = await getConventions();
    if (conventions.length === 0) {
        console.warn('PR Conventions: No conventions available');
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
    const key = parts.find((p) => !['ctrl', 'cmd', 'command', 'shift', 'alt', 'option'].includes(p));
    if (!key) return false;

    // Handle special keys
    const eventKey = event.key.toLowerCase();
    if (key === 'slash' || key === '/') {
        return eventKey === '/' || eventKey === 'slash';
    }

    return eventKey === key;
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
