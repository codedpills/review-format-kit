import { configManager } from './config';
import type { ConventionGroup, RemoteConfig } from './types';

/**
 * Export a single convention group to JSON
 */
export async function exportGroup(groupId: string): Promise<string> {
  const config = await configManager.getConfig();
  const group = config.groups.find((g) => g.id === groupId);

  if (!group) {
    throw new Error(`Group with ID "${groupId}" not found`);
  }

  const exportData: RemoteConfig = {
    version: config.version,
    groups: [group],
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export all convention groups to JSON
 */
export async function exportAllGroups(): Promise<string> {
  const config = await configManager.getConfig();

  const exportData: RemoteConfig = {
    version: config.version,
    groups: config.groups,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Validate import data structure
 */
export function validateImportData(jsonData: unknown): jsonData is RemoteConfig {
  if (typeof jsonData !== 'object' || jsonData === null) {
    return false;
  }

  const data = jsonData as Record<string, unknown>;

  // Check required fields
  if (typeof data.version !== 'string') {
    return false;
  }

  if (!Array.isArray(data.groups)) {
    return false;
  }

  // Validate each group
  for (const group of data.groups) {
    if (!isValidGroup(group)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate a convention group structure
 */
function isValidGroup(group: unknown): group is ConventionGroup {
  if (typeof group !== 'object' || group === null) {
    return false;
  }

  const g = group as Record<string, unknown>;

  // Check required fields and constraints
  if (typeof g.id !== 'string' || g.id.length < 1 || g.id.length > 100) {
    return false;
  }

  if (typeof g.name !== 'string' || g.name.length < 1 || g.name.length > 100) {
    return false;
  }

  if (typeof g.isDefault !== 'boolean' || typeof g.isBuiltIn !== 'boolean') {
    return false;
  }

  if (!Array.isArray(g.conventions)) {
    return false;
  }

  // Validate each convention
  for (const convention of g.conventions) {
    if (!isValidConvention(convention)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate a convention structure
 */
function isValidConvention(convention: unknown): boolean {
  if (typeof convention !== 'object' || convention === null) {
    return false;
  }

  const c = convention as Record<string, unknown>;

  // Check required fields and constraints
  if (
    typeof c.id !== 'string' ||
    c.id.length < 1 ||
    c.id.length > 100 ||
    typeof c.label !== 'string' ||
    c.label.length < 1 ||
    c.label.length > 50 ||
    typeof c.displayName !== 'string' ||
    c.displayName.length < 1 ||
    c.displayName.length > 100 ||
    typeof c.template !== 'string' ||
    c.template.length < 1 ||
    c.template.length > 5000
  ) {
    return false;
  }

  if (
    c.description !== undefined &&
    (typeof c.description !== 'string' || c.description.length > 500)
  ) {
    return false;
  }

  if (
    c.color !== undefined &&
    (typeof c.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(c.color))
  ) {
    return false;
  }

  return true;
}

/**
 * Import groups from JSON string
 */
export async function importGroups(jsonString: string): Promise<void> {
  let parsedData: unknown;

  try {
    parsedData = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  if (!validateImportData(parsedData)) {
    throw new Error('Invalid data structure');
  }

  // Import each group
  const config = await configManager.getConfig();
  const existingIds = new Set(config.groups.map((g) => g.id));

  for (const group of parsedData.groups) {
    if (existingIds.has(group.id)) {
      // Generate new ID for duplicate
      group.id = `${group.id}-imported-${Date.now()}`;
    }

    await configManager.addGroup(group);
  }
}

/**
 * Download groups as JSON file (for use in browser UI)
 */
export function downloadAsFile(jsonString: string, filename: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
