/**
 * Textarea detector for Review Format Kit (RFK)
 * Detects various types of comment textareas on GitHub PR pages
 */

export type TextareaType = 'main-comment' | 'inline-comment' | 'review-summary' | 'reply-comment';

export interface DetectedTextarea {
  element: HTMLTextAreaElement;
  type: TextareaType;
  id: string;
}

/**
 * Find all comment textareas on the current page
 */
export function findAllTextareas(): DetectedTextarea[] {
  const textareas: DetectedTextarea[] = [];
  const allTextareas = document.querySelectorAll('textarea');

  allTextareas.forEach((textarea) => {
    if (isCommentTextarea(textarea)) {
      const detected = createDetectedTextarea(textarea);
      if (detected) {
        textareas.push(detected);
      }
    }
  });

  return textareas;
}

export function isCommentTextarea(element: HTMLTextAreaElement): boolean {
  const name = element.name.toLowerCase();
  const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
  const placeholder = element.getAttribute('placeholder')?.toLowerCase() || '';

  // Strategy 1: Explicit comment/review attributes
  if (
    ariaLabel.includes('comment') ||
    ariaLabel.includes('review') ||
    placeholder.includes('comment') ||
    placeholder.includes('review') ||
    placeholder.includes('markdown') ||
    placeholder.includes('leave a comment') ||
    name.includes('comment') ||
    name.includes('review') ||
    element.id.toLowerCase().includes('comment') ||
    element.id.toLowerCase().includes('review')
  ) {
    return true;
  }

  // Strategy 2: Stable data attributes and classes used by GitHub
  if (
    element.hasAttribute('data-comment-id') ||
    element.hasAttribute('data-review-id') ||
    element.closest('[data-marker-id="new-comment"]') ||
    element.closest('.js-comment-field') ||
    element.closest('.comment-form-textarea') ||
    element.closest('[data-testid="comment-composer"]')
  ) {
    return true;
  }

  // Strategy 3: Search for ARIA role and context
  // Many modern web apps use role="textbox" for custom editors,
  // but GitHub still uses textareas inside containers.
  const isInsideEditor = !!element.closest('[role="textbox"], .MarkdownEditor-module__container');
  if (isInsideEditor && (ariaLabel.includes('markdown') || placeholder.includes('comment'))) {
    return true;
  }

  return false;
}

/**
 * Identify the type of comment textarea
 */
export function getTextareaType(textarea: HTMLTextAreaElement): TextareaType {
  const ariaLabel = textarea.getAttribute('aria-label')?.toLowerCase() || '';
  const id = textarea.id.toLowerCase();
  const placeholder = textarea.getAttribute('placeholder')?.toLowerCase() || '';

  // Check for inline code review comment
  if (
    ariaLabel.includes('inline') ||
    placeholder.includes('inline') ||
    textarea.closest('.inline-comment-form, [data-marker-id="inline-comment"]')
  ) {
    return 'inline-comment';
  }

  // Check for review summary
  if (
    ariaLabel.includes('review summary') ||
    id.includes('review-summary') ||
    textarea.closest('.review-summary-form, [data-marker-id="review-summary"]')
  ) {
    return 'review-summary';
  }

  // Check for reply to existing comment
  if (
    ariaLabel.includes('reply') ||
    textarea.closest('.js-comment-edit-form, .timeline-comment-wrapper')
  ) {
    return 'reply-comment';
  }

  // Default to main comment
  return 'main-comment';
}

/**
 * Create a DetectedTextarea object with unique ID
 */
function createDetectedTextarea(textarea: HTMLTextAreaElement): DetectedTextarea | null {
  const type = getTextareaType(textarea);

  // Generate unique ID for this textarea
  const id =
    textarea.id || `pr-conv-textarea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Store ID on element for later reference
  if (!textarea.id) {
    textarea.setAttribute('data-pr-conv-id', id);
  }

  return {
    element: textarea,
    type,
    id: textarea.id || id,
  };
}

/**
 * Find textareas within a specific DOM node (for MutationObserver)
 */
export function findTextareasIn(node: HTMLElement): DetectedTextarea[] {
  const textareas: DetectedTextarea[] = [];

  // Check if the node itself is a textarea
  if (node instanceof HTMLTextAreaElement && isCommentTextarea(node)) {
    const detected = createDetectedTextarea(node);
    if (detected) {
      textareas.push(detected);
    }
  }

  // Check descendants
  const descendantTextareas = node.querySelectorAll('textarea');
  descendantTextareas.forEach((textarea) => {
    if (isCommentTextarea(textarea)) {
      const detected = createDetectedTextarea(textarea);
      if (detected) {
        textareas.push(detected);
      }
    }
  });

  return textareas;
}
