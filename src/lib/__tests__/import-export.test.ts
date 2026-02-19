import { describe, it, expect, beforeEach } from 'vitest';
import { exportGroup, exportAllGroups, validateImportData, importGroups } from '../import-export';
import { configManager } from '../config';
import { storage } from '../storage';

describe('import-export', () => {
  beforeEach(async () => {
    await storage.clear();
  });

  describe('exportGroup', () => {
    it('should export single group as JSON', async () => {
      const config = await configManager.getConfig();
      const groupId = config.groups[0].id;

      const json = await exportGroup(groupId);
      const data = JSON.parse(json);

      expect(data.version).toBeDefined();
      expect(data.groups).toHaveLength(1);
      expect(data.groups[0].id).toBe(groupId);
    });

    it('should throw error for non-existent group', async () => {
      await expect(exportGroup('non-existent')).rejects.toThrow('not found');
    });
  });

  describe('exportAllGroups', () => {
    it('should export all groups as JSON', async () => {
      const config = await configManager.getConfig();

      const json = await exportAllGroups();
      const data = JSON.parse(json);

      expect(data.version).toBeDefined();
      expect(data.groups).toHaveLength(config.groups.length);
    });

    it('should produce valid JSON', async () => {
      const json = await exportAllGroups();

      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('validateImportData', () => {
    it('should validate correct data structure', () => {
      const validData = {
        version: '1.0.0',
        groups: [
          {
            id: 'test-group',
            name: 'Test Group',
            isDefault: false,
            isBuiltIn: false,
            conventions: [
              {
                id: 'test-convention',
                label: 'test',
                displayName: 'Test',
                template: 'test: <subject>',
              },
            ],
          },
        ],
      };

      expect(validateImportData(validData)).toBe(true);
    });

    it('should reject missing version', () => {
      const invalidData = {
        groups: [],
      };

      expect(validateImportData(invalidData)).toBe(false);
    });

    it('should reject non-array groups', () => {
      const invalidData = {
        version: '1.0.0',
        groups: 'not-an-array',
      };

      expect(validateImportData(invalidData)).toBe(false);
    });

    it('should reject group missing required fields', () => {
      const invalidData = {
        version: '1.0.0',
        groups: [
          {
            id: 'test',
            // missing name
            isDefault: false,
            isBuiltIn: false,
            conventions: [],
          },
        ],
      };

      expect(validateImportData(invalidData)).toBe(false);
    });

    it('should reject convention missing required fields', () => {
      const invalidData = {
        version: '1.0.0',
        groups: [
          {
            id: 'test-group',
            name: 'Test',
            isDefault: false,
            isBuiltIn: false,
            conventions: [
              {
                id: 'test',
                label: 'test',
                // missing displayName and template
              },
            ],
          },
        ],
      };

      expect(validateImportData(invalidData)).toBe(false);
    });

    it('should accept optional fields', () => {
      const validData = {
        version: '1.0.0',
        groups: [
          {
            id: 'test-group',
            name: 'Test Group',
            description: 'Optional description',
            isDefault: false,
            isBuiltIn: false,
            conventions: [
              {
                id: 'test',
                label: 'test',
                displayName: 'Test',
                template: 'test: <subject>',
                description: 'Optional desc',
                color: '#FF0000',
              },
            ],
          },
        ],
      };

      expect(validateImportData(validData)).toBe(true);
    });
  });

  describe('importGroups', () => {
    it('should import valid JSON', async () => {
      const jsonData = JSON.stringify({
        version: '1.0.0',
        groups: [
          {
            id: 'imported-group',
            name: 'Imported Group',
            isDefault: false,
            isBuiltIn: false,
            conventions: [],
          },
        ],
      });

      await importGroups(jsonData);

      const config = await configManager.getConfig();
      expect(config.groups.find((g) => g.id === 'imported-group')).toBeDefined();
    });

    it('should throw error for invalid JSON syntax', async () => {
      await expect(importGroups('invalid json {')).rejects.toThrow('Invalid JSON');
    });

    it('should throw error for invalid data structure', async () => {
      const invalidJson = JSON.stringify({
        version: '1.0.0',
        groups: 'not-an-array',
      });

      await expect(importGroups(invalidJson)).rejects.toThrow('Invalid data structure');
    });

    it('should handle duplicate IDs by generating new ID', async () => {
      const config = await configManager.getConfig();
      const existingId = config.groups[0].id;

      const jsonData = JSON.stringify({
        version: '1.0.0',
        groups: [
          {
            id: existingId,
            name: 'Duplicate ID Group',
            isDefault: false,
            isBuiltIn: false,
            conventions: [],
          },
        ],
      });

      await importGroups(jsonData);

      const updatedConfig = await configManager.getConfig();
      const importedGroups = updatedConfig.groups.filter((g) => g.name === 'Duplicate ID Group');

      expect(importedGroups).toHaveLength(1);
      expect(importedGroups[0].id).not.toBe(existingId);
      expect(importedGroups[0].id).toContain('imported');
    });
  });
});
