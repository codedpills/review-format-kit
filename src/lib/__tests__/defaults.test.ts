import { describe, it, expect } from 'vitest';
import {
  getDefaultConfig,
  CONVENTIONAL_COMMENTS_GROUP,
  NETLIFY_FEEDBACK_LADDERS_GROUP,
} from '../defaults';
import { CONFIG_VERSION } from '../types';

describe('defaults', () => {
  describe('CONVENTIONAL_COMMENTS_GROUP', () => {
    it('should have correct structure', () => {
      expect(CONVENTIONAL_COMMENTS_GROUP).toMatchObject({
        id: 'conventional-comments',
        name: 'Conventional Comments',
        isDefault: true,
        isBuiltIn: true,
      });
    });

    it('should have 9 conventions', () => {
      expect(CONVENTIONAL_COMMENTS_GROUP.conventions).toHaveLength(9);
    });

    it('should have all required convention fields', () => {
      for (const convention of CONVENTIONAL_COMMENTS_GROUP.conventions) {
        expect(convention).toHaveProperty('id');
        expect(convention).toHaveProperty('label');
        expect(convention).toHaveProperty('displayName');
        expect(convention).toHaveProperty('template');
        expect(convention).toHaveProperty('color');

        expect(typeof convention.id).toBe('string');
        expect(typeof convention.label).toBe('string');
        expect(typeof convention.displayName).toBe('string');
        expect(typeof convention.template).toBe('string');
        expect(typeof convention.color).toBe('string');
      }
    });

    it('should have placeholders in templates', () => {
      for (const convention of CONVENTIONAL_COMMENTS_GROUP.conventions) {
        expect(convention.template).toMatch(/<[\w\s]+>/);
      }
    });

    it('should have expected convention labels', () => {
      const labels = CONVENTIONAL_COMMENTS_GROUP.conventions.map((c) => c.label);
      expect(labels).toContain('praise');
      expect(labels).toContain('nitpick');
      expect(labels).toContain('suggestion');
      expect(labels).toContain('issue');
      expect(labels).toContain('todo');
      expect(labels).toContain('question');
      expect(labels).toContain('thought');
      expect(labels).toContain('chore');
      expect(labels).toContain('note');
    });
  });

  describe('NETLIFY_FEEDBACK_LADDERS_GROUP', () => {
    it('should have correct structure', () => {
      expect(NETLIFY_FEEDBACK_LADDERS_GROUP).toMatchObject({
        id: 'netlify-feedback-ladders',
        name: 'Netlify Feedback Ladders',
        isDefault: false,
        isBuiltIn: true,
      });
    });

    it('should have 5 conventions', () => {
      expect(NETLIFY_FEEDBACK_LADDERS_GROUP.conventions).toHaveLength(5);
    });

    it('should have expected convention labels', () => {
      const labels = NETLIFY_FEEDBACK_LADDERS_GROUP.conventions.map((c) => c.label);
      expect(labels).toContain('[mountain]');
      expect(labels).toContain('[boulder]');
      expect(labels).toContain('[pebble]');
      expect(labels).toContain('[sand]');
      expect(labels).toContain('[dust]');
    });

    it('should have distinct display names', () => {
      const displayNames = NETLIFY_FEEDBACK_LADDERS_GROUP.conventions.map((c) => c.displayName);
      const uniqueNames = new Set(displayNames);
      expect(uniqueNames.size).toBe(displayNames.length);
    });
  });

  describe('getDefaultConfig', () => {
    it('should return config with correct version', () => {
      const config = getDefaultConfig();
      expect(config.version).toBe(CONFIG_VERSION);
    });

    it('should return config with two groups', () => {
      const config = getDefaultConfig();
      expect(config.groups).toHaveLength(2);
    });

    it('should include Conventional Comments group', () => {
      const config = getDefaultConfig();
      const ccGroup = config.groups.find((g) => g.id === 'conventional-comments');
      expect(ccGroup).toBeDefined();
    });

    it('should include Netlify Feedback Ladders group', () => {
      const config = getDefaultConfig();
      const netlifyGroup = config.groups.find((g) => g.id === 'netlify-feedback-ladders');
      expect(netlifyGroup).toBeDefined();
    });

    it('should have default settings', () => {
      const config = getDefaultConfig();

      expect(config.settings).toMatchObject({
        keyboardShortcut: 'Ctrl+Shift+/',
        showInPageIcon: true,
        enabledDomains: ['github.com'],
        remoteConfigSyncInterval: 24,
      });
    });

    it('should set first group as default', () => {
      const config = getDefaultConfig();
      expect(config.groups[0].isDefault).toBe(true);
    });
  });
});
