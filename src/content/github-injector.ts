/**
 * Content script for GitHub PR pages
 * Review Format Kit (RFK)
 */

import { findAllTextareas, findTextareasIn, type DetectedTextarea } from './textarea-detector';
import { injectIcon, removeIcon, setIconState } from './icon-injector';
import { showDropdown } from './dropdown';
import { registerShortcut } from './keyboard-handler';
import { configManager } from '../lib/config';
import type { Convention } from '../lib/types';

// Track processed textareas to avoid duplicate injection
const processedTextareas = new WeakSet<HTMLTextAreaElement>();

// MutationObserver instance
let observer: MutationObserver | null = null;

/**
 * Initialize the content script
 */
async function init(): Promise<void> {
    // Check if we're on a PR page
    if (!isPullRequestPage()) {
        return;
    }

    // Set up keyboard shortcut
    const config = await configManager.getConfig();
    registerShortcut(config.settings.keyboardShortcut, getActiveConventions);

    // Process existing textareas
    const textareas = findAllTextareas();
    textareas.forEach(handleTextareaDiscovered);

    // Set up MutationObserver for dynamic content
    observeDOM();
}

/**
 * Check if current page is a GitHub PR page
 */
function isPullRequestPage(): boolean {
    const url = window.location.href;
    return /github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(url);
}

/**
 * Set up DOM observer to detect new textareas
 */
function observeDOM(): void {
    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        const textareas = findTextareasIn(node);
                        textareas.forEach(handleTextareaDiscovered);
                    }
                });

                // Handle removed nodes (cleanup)
                mutation.removedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        const textareas = node.querySelectorAll('textarea');
                        textareas.forEach((textarea) => {
                            if (processedTextareas.has(textarea)) {
                                removeIcon(textarea);
                                processedTextareas.delete(textarea);
                            }
                        });
                    }
                });
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

/**
 * Handle newly discovered textarea
 */
function handleTextareaDiscovered(textarea: DetectedTextarea): void {
    // Skip if already processed
    if (processedTextareas.has(textarea.element)) {
        return;
    }

    // Mark as processed
    processedTextareas.add(textarea.element);

    // Inject icon
    injectIcon(textarea, handleIconClick);
}

/**
 * Handle icon click
 */
async function handleIconClick(textarea: HTMLTextAreaElement): Promise<void> {
    // Get active conventions
    const conventions = await getActiveConventions();

    if (conventions.length === 0) {
        console.warn('RFK: No conventions available');
        return;
    }

    // Set icon to active state
    setIconState(textarea, 'active');

    // Show dropdown
    showDropdown(textarea, textarea, conventions);

    // Reset icon state when dropdown closes
    // (dropdown handles its own cleanup)
    setTimeout(() => {
        setIconState(textarea, 'inactive');
    }, 300);
}

/**
 * Get conventions from active group
 */
async function getActiveConventions(): Promise<Convention[]> {
    try {
        const activeGroup = await configManager.getActiveGroup();
        return activeGroup?.conventions || [];
    } catch (error) {
        console.error('RFK: Error getting conventions', error);
        return [];
    }
}

/**
 * Cleanup on page unload
 */
function cleanup(): void {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
