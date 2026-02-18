/**
 * Template insertion logic for GitHub textareas
 * Handles inserting convention templates at cursor position
 */

export interface InsertionResult {
    success: boolean;
    cursorPosition: number;
    error?: string;
}

/**
 * Insert template into textarea at cursor position
 */
export function insertTemplate(textarea: HTMLTextAreaElement, template: string): InsertionResult {
    try {
        const cursorPos = getCursorPosition(textarea);
        const currentValue = textarea.value;

        // Determine insertion position and formatting
        let insertionPos = cursorPos;
        let formattedTemplate = template;

        // If textarea has content and cursor is not at start, add newline before template
        if (currentValue.length > 0 && cursorPos > 0) {
            // Check if we need to add newlines
            const charBeforeCursor = currentValue[cursorPos - 1];
            if (charBeforeCursor !== '\n') {
                formattedTemplate = '\n\n' + template;
            } else if (cursorPos > 1 && currentValue[cursorPos - 2] !== '\n') {
                formattedTemplate = '\n' + template;
            }
        }

        // Insert template
        const newValue =
            currentValue.substring(0, insertionPos) +
            formattedTemplate +
            currentValue.substring(insertionPos);

        textarea.value = newValue;

        // Trigger input event for GitHub's React to detect change
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);

        // Position cursor at first placeholder or end of template
        const newCursorPos = findFirstPlaceholder(formattedTemplate, insertionPos);
        setCursorPosition(textarea, newCursorPos);

        // Focus the textarea
        textarea.focus();

        return {
            success: true,
            cursorPosition: newCursorPos,
        };
    } catch (error) {
        return {
            success: false,
            cursorPosition: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get current cursor position in textarea
 */
export function getCursorPosition(textarea: HTMLTextAreaElement): number {
    return textarea.selectionStart || 0;
}

/**
 * Set cursor position in textarea
 */
export function setCursorPosition(textarea: HTMLTextAreaElement, position: number): void {
    textarea.setSelectionRange(position, position);
}

/**
 * Find the first placeholder in template and return its position
 * Placeholders are in format: <placeholder_name>
 */
function findFirstPlaceholder(template: string, basePosition: number): number {
    const placeholderRegex = /<([^>]+)>/;
    const match = template.match(placeholderRegex);

    if (match && match.index !== undefined) {
        // Position cursor at start of placeholder (including <)
        return basePosition + match.index;
    }

    // No placeholder found, position at end of template
    return basePosition + template.length;
}

/**
 * Select a placeholder in the textarea
 * Useful for highlighting placeholders for user to replace
 */
export function selectPlaceholder(textarea: HTMLTextAreaElement, placeholderText: string): boolean {
    const value = textarea.value;
    const placeholderRegex = new RegExp(`<${placeholderText}>`, 'i');
    const match = value.match(placeholderRegex);

    if (match && match.index !== undefined) {
        const start = match.index;
        const end = start + match[0].length;
        textarea.setSelectionRange(start, end);
        textarea.focus();
        return true;
    }

    return false;
}

/**
 * Get all placeholders in a template
 */
export function extractPlaceholders(template: string): string[] {
    const placeholderRegex = /<([^>]+)>/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderRegex.exec(template)) !== null) {
        placeholders.push(match[1]);
    }

    return placeholders;
}
