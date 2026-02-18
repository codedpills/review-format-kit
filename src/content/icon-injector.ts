/**
 * Icon injection for GitHub textareas
 * Injects convention trigger icon next to comment textareas
 */

import type { DetectedTextarea } from './textarea-detector';

const ICON_CLASS = 'pr-conventions-trigger';
const ICON_CONTAINER_CLASS = 'pr-conventions-trigger-container';

/**
 * Inject icon next to textarea
 */
export function injectIcon(
    textarea: DetectedTextarea,
    onClick: (textarea: HTMLTextAreaElement) => void
): HTMLElement | null {
    // Check if icon already exists
    const existingIcon = findExistingIcon(textarea.element);
    if (existingIcon) {
        return existingIcon;
    }

    // Create icon element
    const iconContainer = createIconElement(textarea.id);

    // Attach click listener
    const button = iconContainer.querySelector('button');
    if (button) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(textarea.element);
        });
    }

    // Find insertion point and inject
    const inserted = insertIconIntoDOM(textarea.element, iconContainer);

    if (!inserted) {
        console.warn('PR Conventions: Could not inject icon for textarea', textarea.id);
        return null;
    }

    return iconContainer;
}

/**
 * Create icon HTML element
 */
function createIconElement(textareaId: string): HTMLElement {
    const container = document.createElement('div');
    container.className = ICON_CONTAINER_CLASS;
    container.setAttribute('data-textarea-id', textareaId);

    const button = document.createElement('button');
    button.className = ICON_CLASS;
    button.type = 'button';
    button.setAttribute('aria-label', 'Insert convention comment');
    button.title = 'Insert convention comment (Cmd+Shift+/)';

    // SVG icon (speech bubble with "CC")
    button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5l-3 3V4z" opacity="0.6"/>
            <text x="4" y="10" font-size="6" font-weight="bold" fill="currentColor">CC</text>
        </svg>
    `;

    container.appendChild(button);
    return container;
}

/**
 * Insert icon into DOM relative to textarea
 */
function insertIconIntoDOM(textarea: HTMLTextAreaElement, icon: HTMLElement): boolean {
    // Strategy 1: Try to find GitHub's textarea toolbar
    const toolbar = findTextareaToolbar(textarea);
    if (toolbar) {
        // Insert at the end of the toolbar
        toolbar.appendChild(icon);
        return true;
    }

    // Strategy 2: Insert as sibling after textarea's parent container
    const container = textarea.closest('.comment-form-textarea, .js-comment-field');
    if (container && container.parentElement) {
        // Create a wrapper if needed
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        container.parentElement.insertBefore(wrapper, container);
        wrapper.appendChild(container);
        wrapper.appendChild(icon);

        // Position icon absolutely in top-right
        icon.style.position = 'absolute';
        icon.style.top = '8px';
        icon.style.right = '8px';
        icon.style.zIndex = '10';

        return true;
    }

    // Strategy 3: Insert as direct sibling
    if (textarea.parentElement) {
        textarea.parentElement.style.position = 'relative';
        textarea.parentElement.appendChild(icon);

        icon.style.position = 'absolute';
        icon.style.top = '8px';
        icon.style.right = '8px';
        icon.style.zIndex = '10';

        return true;
    }

    return false;
}

/**
 * Find GitHub's textarea toolbar (if it exists)
 */
function findTextareaToolbar(textarea: HTMLTextAreaElement): HTMLElement | null {
    // Look for common GitHub toolbar selectors
    const parent = textarea.closest('.comment-form-textarea, .js-comment-field');
    if (!parent) return null;

    // Check for toolbar in parent
    const toolbar = parent.querySelector('.toolbar, .comment-form-actions, .form-actions');
    return toolbar as HTMLElement | null;
}

/**
 * Find existing icon for a textarea
 */
function findExistingIcon(textarea: HTMLTextAreaElement): HTMLElement | null {
    const textareaId = textarea.id || textarea.getAttribute('data-pr-conv-id');
    if (!textareaId) return null;

    return document.querySelector(
        `.${ICON_CONTAINER_CLASS}[data-textarea-id="${textareaId}"]`
    ) as HTMLElement | null;
}

/**
 * Remove icon from DOM
 */
export function removeIcon(textarea: HTMLTextAreaElement): void {
    const icon = findExistingIcon(textarea);
    if (icon) {
        icon.remove();
    }
}

/**
 * Update icon state (active/inactive)
 */
export function setIconState(textarea: HTMLTextAreaElement, state: 'active' | 'inactive'): void {
    const icon = findExistingIcon(textarea);
    if (!icon) return;

    const button = icon.querySelector('button');
    if (!button) return;

    if (state === 'active') {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}
