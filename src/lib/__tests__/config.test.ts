import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager } from '../config';
import { storage } from '../storage';
import type { ConventionGroup, Convention } from '../types';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(async () => {
    configManager = new ConfigManager();
    // Clear storage before each test
    await storage.clear();
  });

  describe('getConfig', () => {
    it('should initialize with default config if not present', async () => {
      const config = await configManager.getConfig();

      expect(config).toBeDefined();
      expect(config.groups).toHaveLength(2);
      expect(config.version).toBeDefined();
    });

    it('should return existing config if present', async () => {
      const config1 = await configManager.getConfig();
      const config2 = await configManager.getConfig();

      expect(config2).toEqual(config1);
    });
  });

  describe('saveConfig', () => {
    it('should persist config to storage', async () => {
      const config = await configManager.getConfig();
      config.settings.showInPageIcon = false;

      await configManager.saveConfig(config);

      const loadedConfig = await configManager.getConfig();
      expect(loadedConfig.settings.showInPageIcon).toBe(false);
    });
  });

  describe('getActiveGroup', () => {
    it('should return the default group', async () => {
      const activeGroup = await configManager.getActiveGroup();

      expect(activeGroup).toBeDefined();
      expect(activeGroup!.isDefault).toBe(true);
    });

    it('should return first group if no default set', async () => {
      const config = await configManager.getConfig();
      config.groups.forEach((g) => (g.isDefault = false));
      await configManager.saveConfig(config);

      const activeGroup = await configManager.getActiveGroup();
      expect(activeGroup!.id).toBe(config.groups[0].id);
    });
  });

  describe('setActiveGroup', () => {
    it('should set specified group as default', async () => {
      const config = await configManager.getConfig();
      const secondGroupId = config.groups[1].id;

      await configManager.setActiveGroup(secondGroupId);

      const activeGroup = await configManager.getActiveGroup();
      expect(activeGroup?.id).toBe(secondGroupId);
    });

    it('should unset previous default group', async () => {
      const config = await configManager.getConfig();
      const firstGroupId = config.groups[0].id;
      const secondGroupId = config.groups[1].id;

      await configManager.setActiveGroup(secondGroupId);

      const updatedConfig = await configManager.getConfig();
      const firstGroup = updatedConfig.groups.find((g) => g.id === firstGroupId);

      expect(firstGroup?.isDefault).toBe(false);
    });
  });

  describe('addGroup', () => {
    it('should add a new group', async () => {
      const newGroup: ConventionGroup = {
        id: 'custom-group',
        name: 'Custom Group',
        isDefault: false,
        isBuiltIn: false,
        conventions: [],
      };

      await configManager.addGroup(newGroup);

      const config = await configManager.getConfig();
      expect(config.groups).toHaveLength(3);
      expect(config.groups.find((g) => g.id === 'custom-group')).toBeDefined();
    });

    it('should throw error for duplicate ID', async () => {
      const config = await configManager.getConfig();
      const existingGroup = { ...config.groups[0] };

      await expect(configManager.addGroup(existingGroup)).rejects.toThrow('already exists');
    });
  });

  describe('updateGroup', () => {
    it('should update group properties', async () => {
      const config = await configManager.getConfig();
      const groupId = config.groups[0].id;

      await configManager.updateGroup(groupId, {
        name: 'Updated Name',
        description: 'New description',
      });

      const updatedConfig = await configManager.getConfig();
      const updatedGroup = updatedConfig.groups.find((g) => g.id === groupId);

      expect(updatedGroup?.name).toBe('Updated Name');
      expect(updatedGroup?.description).toBe('New description');
    });

    it('should not allow ID changes', async () => {
      const config = await configManager.getConfig();
      const originalId = config.groups[0].id;

      await configManager.updateGroup(originalId, {
        id: 'new-id',
      } as Partial<ConventionGroup>);

      const updatedConfig = await configManager.getConfig();
      const group = updatedConfig.groups.find((g) => g.id === originalId);

      expect(group?.id).toBe(originalId);
    });

    it('should throw error for non-existent group', async () => {
      await expect(configManager.updateGroup('non-existent', { name: 'Test' })).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group', async () => {
      const config = await configManager.getConfig();
      const groupToDelete = config.groups[1].id;

      await configManager.deleteGroup(groupToDelete);

      const updatedConfig = await configManager.getConfig();
      expect(updatedConfig.groups).toHaveLength(1);
      expect(updatedConfig.groups.find((g) => g.id === groupToDelete)).toBeUndefined();
    });

    it('should throw error when deleting last group', async () => {
      const config = await configManager.getConfig();
      const firstGroupId = config.groups[0].id;
      const secondGroupId = config.groups[1].id;

      await configManager.deleteGroup(firstGroupId);

      await expect(configManager.deleteGroup(secondGroupId)).rejects.toThrow(
        'Cannot delete the last'
      );
    });

    it('should set new default if deleted group was default', async () => {
      const config = await configManager.getConfig();

      // Verify initial state
      expect(
        config.groups.length,
        'Should have at least 2 groups from defaults'
      ).toBeGreaterThanOrEqual(2);

      // Find the default group
      const defaultGroup = config.groups.find((g) => g.isDefault);

      // If no default group, fail with helpful message
      if (!defaultGroup) {
        const groupStates = config.groups
          .map((g) => `${g.id}: isDefault=${g.isDefault}`)
          .join(', ');
        throw new Error(`No default group found. Groups: [${groupStates}]`);
      }

      await configManager.deleteGroup(defaultGroup.id);

      const updatedConfig = await configManager.getConfig();
      const newDefaultGroup = updatedConfig.groups.find((g) => g.isDefault);

      expect(
        newDefaultGroup,
        'Should have a new default group after deleting the old default'
      ).toBeDefined();
      expect(newDefaultGroup!.id).not.toBe(defaultGroup.id);
    });
  });

  describe('addConvention', () => {
    it('should add convention to group', async () => {
      const config = await configManager.getConfig();
      const groupId = config.groups[0].id;

      const newConvention: Convention = {
        id: 'custom-convention',
        label: 'custom',
        displayName: 'Custom',
        template: 'custom: <subject>',
      };

      await configManager.addConvention(groupId, newConvention);

      const updatedConfig = await configManager.getConfig();
      const group = updatedConfig.groups.find((g) => g.id === groupId);

      expect(group?.conventions.find((c) => c.id === 'custom-convention')).toBeDefined();
    });

    it('should throw error for duplicate convention ID', async () => {
      const config = await configManager.getConfig();
      const groupId = config.groups[0].id;
      const existingConvention = config.groups[0].conventions[0];

      await expect(configManager.addConvention(groupId, existingConvention)).rejects.toThrow(
        'already exists'
      );
    });
  });

  describe('deleteConvention', () => {
    it('should delete convention from group', async () => {
      const config = await configManager.getConfig();
      const groupId = config.groups[0].id;
      const conventionId = config.groups[0].conventions[0].id;

      await configManager.deleteConvention(groupId, conventionId);

      const updatedConfig = await configManager.getConfig();
      const group = updatedConfig.groups.find((g) => g.id === groupId);

      expect(group?.conventions.find((c) => c.id === conventionId)).toBeUndefined();
    });
  });

  describe('reorderConventions', () => {
    it('should reorder conventions', async () => {
      const config = await configManager.getConfig();
      const groupId = config.groups[0].id;
      const conventions = config.groups[0].conventions;

      const reorderedIds = [
        conventions[2].id,
        conventions[0].id,
        conventions[1].id,
        ...conventions.slice(3).map((c) => c.id),
      ];

      await configManager.reorderConventions(groupId, reorderedIds);

      const updatedConfig = await configManager.getConfig();
      const group = updatedConfig.groups.find((g) => g.id === groupId);

      expect(group?.conventions[0].id).toBe(conventions[2].id);
      expect(group?.conventions[1].id).toBe(conventions[0].id);
      expect(group?.conventions[2].id).toBe(conventions[1].id);
    });

    it('should throw error for mismatched IDs', async () => {
      const config = await configManager.getConfig();
      const groupId = config.groups[0].id;

      await expect(configManager.reorderConventions(groupId, ['id1', 'id2'])).rejects.toThrow(
        'mismatch'
      );
    });
  });

  describe('mergeRemoteConfig', () => {
    it('should append remote groups', async () => {
      const remoteGroup: ConventionGroup = {
        id: 'remote-group',
        name: 'Remote Group',
        isDefault: false,
        isBuiltIn: false,
        conventions: [],
      };

      await configManager.mergeRemoteConfig({ version: '1.0.0', groups: [remoteGroup] }, 'append');

      const config = await configManager.getConfig();
      expect(config.groups).toHaveLength(3);
      expect(config.groups.find((g) => g.id === 'remote-group')).toBeDefined();
    });

    it('should not add duplicates in append mode', async () => {
      const config = await configManager.getConfig();
      const existingGroup = config.groups[0];

      await configManager.mergeRemoteConfig(
        { version: '1.0.0', groups: [existingGroup] },
        'append'
      );

      const updatedConfig = await configManager.getConfig();
      expect(updatedConfig.groups).toHaveLength(2);
    });

    it('should override groups in override mode', async () => {
      const remoteGroup: ConventionGroup = {
        id: 'remote-only',
        name: 'Remote Only',
        isDefault: true,
        isBuiltIn: false,
        conventions: [],
      };

      await configManager.mergeRemoteConfig(
        { version: '1.0.0', groups: [remoteGroup] },
        'override'
      );

      const config = await configManager.getConfig();
      expect(config.groups).toHaveLength(1);
      expect(config.groups[0].id).toBe('remote-only');
    });
  });
});
