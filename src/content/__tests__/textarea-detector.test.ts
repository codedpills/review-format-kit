import { describe, it, expect, beforeEach } from 'vitest';
import {
  findAllTextareas,
  isCommentTextarea,
  getTextareaType,
  findTextareasIn,
} from '../textarea-detector';

describe('Textarea Detector', () => {
  beforeEach(() => {
    // Clear the document body for each test
    document.body.innerHTML = '';
  });

  describe('isCommentTextarea', () => {
    it('should detect textarea by aria-label containing "comment"', () => {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('aria-label', 'Add a comment');

      expect(isCommentTextarea(textarea)).toBe(true);
    });

    it('should detect textarea by aria-label containing "review"', () => {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('aria-label', 'Write a review');

      expect(isCommentTextarea(textarea)).toBe(true);
    });

    it('should detect textarea by id containing "comment"', () => {
      const textarea = document.createElement('textarea');
      textarea.id = 'new-comment-field';

      expect(isCommentTextarea(textarea)).toBe(true);
    });

    it('should detect textarea by name containing "comment"', () => {
      const textarea = document.createElement('textarea');
      textarea.name = 'comment[body]';

      expect(isCommentTextarea(textarea)).toBe(true);
    });

    it('should detect textarea within comment container', () => {
      const container = document.createElement('div');
      container.className = 'js-comment-field';
      const textarea = document.createElement('textarea');
      container.appendChild(textarea);
      document.body.appendChild(container);

      expect(isCommentTextarea(textarea)).toBe(true);
    });

    it('should not detect non-comment textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.id = 'search-query';

      expect(isCommentTextarea(textarea)).toBe(false);
    });
  });

  describe('getTextareaType', () => {
    it('should identify inline comment textarea', () => {
      const container = document.createElement('div');
      container.className = 'inline-comment-form';
      const textarea = document.createElement('textarea');
      container.appendChild(textarea);
      document.body.appendChild(container);

      expect(getTextareaType(textarea)).toBe('inline-comment');
    });

    it('should identify review summary textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('aria-label', 'Review summary');

      expect(getTextareaType(textarea)).toBe('review-summary');
    });

    it('should identify reply comment textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('aria-label', 'Reply to comment');

      expect(getTextareaType(textarea)).toBe('reply-comment');
    });

    it('should default to main comment', () => {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('aria-label', 'Add a comment');

      expect(getTextareaType(textarea)).toBe('main-comment');
    });
  });

  describe('findAllTextareas', () => {
    it('should find all comment textareas on page', () => {
      // Create multiple textareas
      const textarea1 = document.createElement('textarea');
      textarea1.setAttribute('aria-label', 'Add a comment');
      document.body.appendChild(textarea1);

      const textarea2 = document.createElement('textarea');
      textarea2.id = 'comment-body';
      document.body.appendChild(textarea2);

      const textarea3 = document.createElement('textarea');
      textarea3.id = 'search'; // Not a comment textarea
      document.body.appendChild(textarea3);

      const found = findAllTextareas();

      expect(found.length).toBe(2);
      expect(found[0].element).toBe(textarea1);
      expect(found[1].element).toBe(textarea2);
    });

    it('should return empty array when no textareas found', () => {
      const found = findAllTextareas();
      expect(found).toEqual([]);
    });
  });

  describe('findTextareasIn', () => {
    it('should find textareas within a specific node', () => {
      const container = document.createElement('div');
      const textarea = document.createElement('textarea');
      textarea.setAttribute('aria-label', 'Add a comment');
      container.appendChild(textarea);

      const found = findTextareasIn(container);

      expect(found.length).toBe(1);
      expect(found[0].element).toBe(textarea);
    });

    it('should detect if node itself is a textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('aria-label', 'Add a comment');

      const found = findTextareasIn(textarea as any);

      expect(found.length).toBe(1);
      expect(found[0].element).toBe(textarea);
    });
  });
});
