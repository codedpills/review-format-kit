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
  const insertionPoint = findInsertionPoint(textarea.element);

  if (!insertionPoint) {
    return null;
  }

  const inserted = insertIconAtPoint(insertionPoint, iconContainer);

  if (!inserted) {
    return null;
  }

  return iconContainer;
}

/**
 * Types of insertion points
 */
type InsertionType = 'toolbar' | 'container' | 'sibling';

interface InsertionPoint {
  element: HTMLElement;
  type: InsertionType;
}

/**
 * Find the best place to inject the icon
 */
function findInsertionPoint(textarea: HTMLTextAreaElement): InsertionPoint | null {
  // 1. Try to find a toolbar by role or label
  const toolbar = findTextareaToolbar(textarea);
  if (toolbar) {
    return { element: toolbar, type: 'toolbar' };
  }

  // 2. Try to find a container with data attributes
  const container = textarea.closest(
    '[data-marker-id="new-comment"], .js-comment-field, .comment-form-textarea'
  );
  if (container && container instanceof HTMLElement) {
    return { element: container, type: 'container' };
  }

  // 3. Fallback to parent
  if (textarea.parentElement) {
    return { element: textarea.parentElement, type: 'sibling' };
  }

  return null;
}

/**
 * Insert icon at the specified point
 */
function insertIconAtPoint(point: InsertionPoint, icon: HTMLElement): boolean {
  const { element, type } = point;

  if (type === 'toolbar') {
    element.appendChild(icon);
    return true;
  }

  if (type === 'container' || type === 'sibling') {
    const target = type === 'container' ? element : element;

    // Ensure parent is relative for absolute positioning
    if (target.style.position !== 'absolute') {
      target.style.position = 'relative';
    }

    target.appendChild(icon);

    // Position icon absolutely in top-right
    icon.style.position = 'absolute';
    icon.style.top = '8px';
    icon.style.right = '8px';
    icon.style.zIndex = '100'; // High z-index to stay on top

    return true;
  }

  return false;
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

  // New branded SVG icon loaded from extension assets
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('viewBox', '0 0 251 251');

  const image = document.createElementNS(svgNamespace, 'image');
  image.setAttribute('href', chrome.runtime.getURL('assets/icons/icon.svg'));
  image.setAttribute('width', '251');
  image.setAttribute('height', '251');

  svg.appendChild(image);
  button.appendChild(svg);

  container.appendChild(button);
  return container;
}

function findTextareaToolbar(textarea: HTMLTextAreaElement): HTMLElement | null {
  // Look for common GitHub toolbar selectors (Semantic first)
  // 1. Search for role="toolbar" in the nearest composer/editor container
  const container = textarea.closest(
    '.MarkdownEditor-module__container, .js-comment-field, .comment-form-textarea'
  );
  if (container) {
    const toolbar = container.querySelector('[role="toolbar"], .toolbar');
    if (toolbar) return toolbar as HTMLElement;
  }

  // 2. Search for any toolbar nearby with formatting labels
  const nearbyToolbar = document.querySelector(
    '[aria-label="Formatting tools"], [aria-label="Toolbar"]'
  );
  if (nearbyToolbar && proximityCheck(textarea, nearbyToolbar)) {
    return nearbyToolbar as HTMLElement;
  }

  return null;
}

/**
 * Check if a toolbar is actually related to the textarea
 */
function proximityCheck(textarea: HTMLElement, toolbar: Element): boolean {
  const container = textarea.closest('div');
  return (
    !!(container && container.contains(toolbar)) || !!toolbar.closest('div')?.contains(textarea)
  );
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
