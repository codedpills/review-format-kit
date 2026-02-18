import { describe, it, expect, beforeEach } from 'vitest';
import {
    insertTemplate,
    getCursorPosition,
    setCursorPosition,
    selectPlaceholder,
    extractPlaceholders,
} from '../template-inserter';

describe('Template Inserter', () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
        // Clear the document body
        document.body.innerHTML = '';

        // Create a fresh textarea for each test
        textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
    });

    describe('insertTemplate', () => {
        it('should insert template into empty textarea', () => {
            const template = 'suggestion: <subject>\n\n<discussion>';
            const result = insertTemplate(textarea, template);

            expect(result.success).toBe(true);
            expect(textarea.value).toBe(template);
        });

        it('should insert template at cursor position', () => {
            textarea.value = 'Existing content';
            textarea.selectionStart = 8; // After "Existing"
            textarea.selectionEnd = 8;

            const template = 'suggestion: <subject>';
            insertTemplate(textarea, template);

            expect(textarea.value).toContain('Existing\n\nsuggestion: <subject> content');
        });

        it('should add newlines before template when inserting mid-content', () => {
            textarea.value = 'Some text';
            textarea.selectionStart = 9; // At end
            textarea.selectionEnd = 9;

            const template = 'note: <subject>';
            insertTemplate(textarea, template);

            expect(textarea.value).toBe('Some text\n\nnote: <subject>');
        });

        it('should position cursor at first placeholder', () => {
            const template = 'suggestion: <subject>\n\n<discussion>';
            const result = insertTemplate(textarea, template);

            expect(result.cursorPosition).toBe(12); // Position of '<subject>'
        });

        it('should position cursor at end if no placeholder', () => {
            const template = 'Simple template without placeholders';
            const result = insertTemplate(textarea, template);

            expect(result.cursorPosition).toBe(template.length);
        });
    });

    describe('getCursorPosition', () => {
        it('should return current cursor position', () => {
            textarea.value = 'Hello world';
            textarea.selectionStart = 5;
            textarea.selectionEnd = 5;

            expect(getCursorPosition(textarea)).toBe(5);
        });

        it('should return 0 for empty textarea', () => {
            expect(getCursorPosition(textarea)).toBe(0);
        });
    });

    describe('setCursorPosition', () => {
        it('should set cursor position', () => {
            textarea.value = 'Hello world';
            setCursorPosition(textarea, 5);

            expect(textarea.selectionStart).toBe(5);
            expect(textarea.selectionEnd).toBe(5);
        });
    });

    describe('selectPlaceholder', () => {
        it('should select placeholder in textarea', () => {
            textarea.value = 'suggestion: <subject>\n\n<discussion>';
            const result = selectPlaceholder(textarea, 'subject');

            expect(result).toBe(true);
            expect(textarea.selectionStart).toBe(12);
            expect(textarea.selectionEnd).toBe(21); // Length of '<subject>'
        });

        it('should return false if placeholder not found', () => {
            textarea.value = 'No placeholders here';
            const result = selectPlaceholder(textarea, 'subject');

            expect(result).toBe(false);
        });
    });

    describe('extractPlaceholders', () => {
        it('should extract all placeholders from template', () => {
            const template = 'suggestion: <subject>\n\n<discussion>\n\n<optional reasoning>';
            const placeholders = extractPlaceholders(template);

            expect(placeholders).toEqual(['subject', 'discussion', 'optional reasoning']);
        });

        it('should return empty array if no placeholders', () => {
            const template = 'No placeholders here';
            const placeholders = extractPlaceholders(template);

            expect(placeholders).toEqual([]);
        });

        it('should handle duplicate placeholders', () => {
            const template = '<subject> and <subject> again';
            const placeholders = extractPlaceholders(template);

            expect(placeholders).toEqual(['subject', 'subject']);
        });
    });
});
