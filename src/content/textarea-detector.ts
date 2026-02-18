/**
 * Textarea detector for GitHub PR comment fields
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

/**
 * Check if a textarea is a GitHub PR comment field
 */
export function isCommentTextarea(element: HTMLTextAreaElement): boolean {
    // Strategy 1: Check aria-label
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
    if (ariaLabel.includes('comment') || ariaLabel.includes('review')) {
        return true;
    }

    // Strategy 2: Check for common GitHub comment field classes/IDs
    const id = element.id.toLowerCase();
    const name = element.name.toLowerCase();

    if (
        id.includes('comment') ||
        name.includes('comment') ||
        id.includes('review') ||
        name.includes('review')
    ) {
        return true;
    }

    // Strategy 3: Check parent containers
    const container = element.closest('.js-comment-field, .comment-form-textarea, .timeline-comment');
    if (container) {
        return true;
    }

    // Strategy 4: Check for GitHub-specific attributes
    if (element.hasAttribute('data-comment-id') || element.hasAttribute('data-review-id')) {
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

    // Check for inline code review comment
    if (
        ariaLabel.includes('inline') ||
        textarea.closest('.inline-comment-form') ||
        textarea.closest('.js-inline-comment-form')
    ) {
        return 'inline-comment';
    }

    // Check for review summary
    if (
        ariaLabel.includes('review') ||
        id.includes('review') ||
        textarea.closest('.review-summary-form')
    ) {
        return 'review-summary';
    }

    // Check for reply to existing comment
    if (
        ariaLabel.includes('reply') ||
        textarea.closest('.js-comment-edit-form') ||
        textarea.closest('.timeline-comment-wrapper')
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
    const id = textarea.id || `pr-conv-textarea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
