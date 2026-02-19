import { storage } from './storage';
import { getDefaultConfig } from './defaults';
import type {
  ExtensionConfig,
  ConventionGroup,
  Convention,
  RemoteConfig,
  MergeStrategy,
} from './types';
import { STORAGE_KEYS } from './types';

/**
 * Configuration management for the extension
 */
export class ConfigManager {
  /**
   * Get full configuration, initializing with defaults if not present
   */
  async getConfig(): Promise<ExtensionConfig> {
    const config = await storage.get<ExtensionConfig>(STORAGE_KEYS.CONFIG);

    if (!config) {
      const defaultConfig = getDefaultConfig();
      await this.saveConfig(defaultConfig);
      return defaultConfig;
    }

    return config;
  }

  /**
   * Save configuration to storage
   */
  async saveConfig(config: ExtensionConfig): Promise<void> {
    await storage.set(STORAGE_KEYS.CONFIG, config);
  }

  /**
   * Get the active/default convention group
   */
  async getActiveGroup(): Promise<ConventionGroup | null> {
    const config = await this.getConfig();
    return config.groups.find((g) => g.isDefault) || config.groups[0] || null;
  }

  /**
   * Set a group as the active/default group
   */
  async setActiveGroup(groupId: string): Promise<void> {
    const config = await this.getConfig();

    config.groups = config.groups.map((g) => ({
      ...g,
      isDefault: g.id === groupId,
    }));

    await this.saveConfig(config);
  }

  /**
   * Add a new convention group
   */
  async addGroup(group: ConventionGroup): Promise<void> {
    const config = await this.getConfig();

    // Ensure unique ID
    if (config.groups.some((g) => g.id === group.id)) {
      throw new Error(`Group with ID "${group.id}" already exists`);
    }

    config.groups.push(group);
    await this.saveConfig(config);
  }

  /**
   * Update an existing convention group
   */
  async updateGroup(groupId: string, updates: Partial<ConventionGroup>): Promise<void> {
    const config = await this.getConfig();

    const groupIndex = config.groups.findIndex((g) => g.id === groupId);
    if (groupIndex === -1) {
      throw new Error(`Group with ID "${groupId}" not found`);
    }

    config.groups[groupIndex] = {
      ...config.groups[groupIndex],
      ...updates,
      id: groupId, // Prevent ID changes
    };

    await this.saveConfig(config);
  }

  /**
   * Delete a convention group
   */
  async deleteGroup(groupId: string): Promise<void> {
    const config = await this.getConfig();

    // Prevent deletion of last group
    if (config.groups.length === 1) {
      throw new Error('Cannot delete the last convention group');
    }

    // Find and remove group
    const groupIndex = config.groups.findIndex((g) => g.id === groupId);
    if (groupIndex === -1) {
      throw new Error(`Group with ID "${groupId}" not found`);
    }

    const wasDefault = config.groups[groupIndex].isDefault;
    config.groups.splice(groupIndex, 1);

    // If deleted group was default, set first remaining group as default
    if (wasDefault && config.groups.length > 0) {
      config.groups[0].isDefault = true;
    }

    await this.saveConfig(config);
  }

  /**
   * Add a convention to a group
   */
  async addConvention(groupId: string, convention: Convention): Promise<void> {
    const config = await this.getConfig();

    const group = config.groups.find((g) => g.id === groupId);
    if (!group) {
      throw new Error(`Group with ID "${groupId}" not found`);
    }

    // Ensure unique ID within group
    if (group.conventions.some((c) => c.id === convention.id)) {
      throw new Error(`Convention with ID "${convention.id}" already exists in group`);
    }

    group.conventions.push(convention);
    await this.saveConfig(config);
  }

  /**
   * Update a convention within a group
   */
  async updateConvention(
    groupId: string,
    conventionId: string,
    updates: Partial<Convention>
  ): Promise<void> {
    const config = await this.getConfig();

    const group = config.groups.find((g) => g.id === groupId);
    if (!group) {
      throw new Error(`Group with ID "${groupId}" not found`);
    }

    const conventionIndex = group.conventions.findIndex((c) => c.id === conventionId);
    if (conventionIndex === -1) {
      throw new Error(`Convention with ID "${conventionId}" not found in group`);
    }

    group.conventions[conventionIndex] = {
      ...group.conventions[conventionIndex],
      ...updates,
      id: conventionId, // Prevent ID changes
    };

    await this.saveConfig(config);
  }

  /**
   * Delete a convention from a group
   */
  async deleteConvention(groupId: string, conventionId: string): Promise<void> {
    const config = await this.getConfig();

    const group = config.groups.find((g) => g.id === groupId);
    if (!group) {
      throw new Error(`Group with ID "${groupId}" not found`);
    }

    const conventionIndex = group.conventions.findIndex((c) => c.id === conventionId);
    if (conventionIndex === -1) {
      throw new Error(`Convention with ID "${conventionId}" not found in group`);
    }

    group.conventions.splice(conventionIndex, 1);
    await this.saveConfig(config);
  }

  /**
   * Reorder conventions within a group
   */
  async reorderConventions(groupId: string, conventionIds: string[]): Promise<void> {
    const config = await this.getConfig();

    const group = config.groups.find((g) => g.id === groupId);
    if (!group) {
      throw new Error(`Group with ID "${groupId}" not found`);
    }

    // Validate all IDs exist
    if (conventionIds.length !== group.conventions.length) {
      throw new Error('Convention ID count mismatch');
    }

    const conventionMap = new Map(group.conventions.map((c) => [c.id, c]));
    const reordered: Convention[] = [];

    for (const id of conventionIds) {
      const convention = conventionMap.get(id);
      if (!convention) {
        throw new Error(`Convention with ID "${id}" not found in group`);
      }
      reordered.push(convention);
    }

    group.conventions = reordered;
    await this.saveConfig(config);
  }

  /**
   * Merge remote config with local config
   */
  async mergeRemoteConfig(remoteConfig: RemoteConfig, strategy: MergeStrategy): Promise<void> {
    const localConfig = await this.getConfig();

    if (strategy === 'override') {
      // Replace all groups with remote groups
      localConfig.groups = remoteConfig.groups;
    } else {
      // Append remote groups, avoiding duplicates by ID
      const existingIds = new Set(localConfig.groups.map((g) => g.id));

      for (const remoteGroup of remoteConfig.groups) {
        if (!existingIds.has(remoteGroup.id)) {
          localConfig.groups.push(remoteGroup);
        }
      }
    }

    await this.saveConfig(localConfig);
  }
}

export const configManager = new ConfigManager();
