/**
 * Options page script
 * Manages convention groups, settings, and import/export functionality
 */

import { configManager } from '../lib/config';
import { exportAllGroups, importGroups } from '../lib/import-export';
import type { ConventionGroup, Convention, ExtensionConfig } from '../lib/types';

// State
let currentConfig: ExtensionConfig;
let editingGroupId: string | null = null;
let editingConventionIndex: number | null = null;
let currentGroupConventions: Convention[] = [];

// DOM elements
let tabButtons: NodeListOf<HTMLButtonElement>;
let tabPanels: NodeListOf<HTMLDivElement>;
let groupsList: HTMLElement;
let groupModal: HTMLElement;
let conventionModal: HTMLElement;

/**
 * Initialize options page
 */
async function init(): Promise<void> {
    // Get DOM elements
    tabButtons = document.querySelectorAll('.tab');
    tabPanels = document.querySelectorAll('.tab-panel');
    groupsList = document.getElementById('groups-list')!;
    groupModal = document.getElementById('group-modal')!;
    conventionModal = document.getElementById('convention-modal')!;

    // Load configuration
    await loadConfig();

    // Set up tab navigation
    tabButtons.forEach((button) => {
        button.addEventListener('click', () => switchTab(button.dataset.tab!));
    });

    // Set up button listeners
    setupEventListeners();

    // Initial render
    renderGroups();
    renderGeneralSettings();
}

/**
 * Load configuration from storage
 */
async function loadConfig(): Promise<void> {
    currentConfig = await configManager.getConfig();
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
    // Groups tab
    document.getElementById('create-group-btn')?.addEventListener('click', () => openGroupModal());

    // Group modal
    document.querySelectorAll('.modal-close').forEach((btn) => {
        btn.addEventListener('click', closeModals);
    });
    document.getElementById('cancel-group-btn')?.addEventListener('click', closeModals);
    document.getElementById('save-group-btn')?.addEventListener('click', saveGroup);
    document.getElementById('add-convention-btn')?.addEventListener('click', () => openConventionModal());

    // Convention modal
    document.getElementById('cancel-convention-btn')?.addEventListener('click', () => {
        conventionModal.classList.remove('active');
    });
    document.getElementById('save-convention-btn')?.addEventListener('click', saveConvention);

    // General settings
    document.getElementById('show-icon')?.addEventListener('change', saveGeneralSettings);
    document.getElementById('keyboard-shortcut')?.addEventListener('click', changeKeyboardShortcut);

    // Import/Export
    document.getElementById('export-all-btn')?.addEventListener('click', exportAll);
    document.getElementById('import-btn')?.addEventListener('click', () => {
        document.getElementById('import-file')?.click();
    });
    document.getElementById('import-file')?.addEventListener('change', importFromFile);
    document.getElementById('sync-remote-btn')?.addEventListener('click', syncRemoteConfig);

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === groupModal) closeModals();
        if (e.target === conventionModal) conventionModal.classList.remove('active');
    });
}

/**
 * Switch between tabs
 */
function switchTab(tabName: string): void {
    // Update tab buttons
    tabButtons.forEach((btn) => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab panels
    tabPanels.forEach((panel) => {
        if (panel.id === `${tabName}-tab`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

/**
 * Render convention groups list
 */
function renderGroups(): void {
    groupsList.innerHTML = '';

    currentConfig.groups.forEach((group) => {
        const groupCard = createGroupCard(group);
        groupsList.appendChild(groupCard);
    });
}

/**
 * Create a group card element
 */
function createGroupCard(group: ConventionGroup): HTMLElement {
    const card = document.createElement('div');
    card.className = 'group-card';
    if (group.isDefault) {
        card.classList.add('active');
    }

    const header = document.createElement('div');
    header.className = 'group-header';

    const title = document.createElement('h3');
    title.textContent = group.name;
    if (group.isBuiltIn) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = 'Built-in';
        title.appendChild(badge);
    }
    if (group.isDefault) {
        const badge = document.createElement('span');
        badge.className = 'badge badge-primary';
        badge.textContent = 'Active';
        title.appendChild(badge);
    }

    const actions = document.createElement('div');
    actions.className = 'group-actions';

    if (!group.isDefault) {
        const setActiveBtn = document.createElement('button');
        setActiveBtn.className = 'btn btn-sm btn-secondary';
        setActiveBtn.textContent = 'Set as Active';
        setActiveBtn.addEventListener('click', () => setActiveGroup(group.id));
        actions.appendChild(setActiveBtn);
    }

    if (!group.isBuiltIn) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-secondary';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => openGroupModal(group));
        actions.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteGroup(group.id));
        actions.appendChild(deleteBtn);
    }

    header.appendChild(title);
    header.appendChild(actions);

    const info = document.createElement('div');
    info.className = 'group-info';
    if (group.description) {
        const desc = document.createElement('p');
        desc.textContent = group.description;
        info.appendChild(desc);
    }
    const count = document.createElement('p');
    count.className = 'convention-count';
    count.textContent = `${group.conventions.length} conventions`;
    info.appendChild(count);

    card.appendChild(header);
    card.appendChild(info);

    // Accordion Toggle
    const expandBtn = document.createElement('button');
    expandBtn.className = 'group-expand-btn';
    expandBtn.innerHTML = `
        <span class="expand-label">Show conventions</span>
        <svg class="chevron" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.427 7.427l3.396 3.396 3.396-3.396.781.781-4.177 4.177-4.177-4.177.781-.781z"/>
        </svg>
    `;

    const details = document.createElement('div');
    details.className = 'group-details';

    expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = card.classList.toggle('expanded');
        expandBtn.querySelector('.expand-label')!.textContent = isExpanded ? 'Hide conventions' : 'Show conventions';

        if (isExpanded && details.children.length === 0) {
            renderGroupConventions(group, details);
        }
    });

    card.appendChild(expandBtn);
    card.appendChild(details);

    return card;
}

/**
 * Render conventions list within a group card (accordion content)
 */
function renderGroupConventions(group: ConventionGroup, container: HTMLElement): void {
    const list = document.createElement('div');
    list.className = 'accordion-conventions-list';

    group.conventions.forEach((convention) => {
        const item = document.createElement('div');
        item.className = 'accordion-convention-item';

        const header = document.createElement('div');
        header.className = 'accordion-convention-header';

        const title = document.createElement('span');
        title.className = 'accordion-convention-title';
        title.textContent = convention.displayName;
        if (convention.color) {
            title.style.color = convention.color;
        }

        const labelBadge = document.createElement('span');
        labelBadge.className = 'badge';
        labelBadge.textContent = convention.label;

        header.appendChild(title);
        header.appendChild(labelBadge);
        item.appendChild(header);

        if (convention.description) {
            const desc = document.createElement('div');
            desc.className = 'accordion-convention-desc';
            desc.textContent = convention.description;
            item.appendChild(desc);
        }

        const preview = document.createElement('div');
        preview.className = 'accordion-convention-preview';
        preview.textContent = convention.template;
        item.appendChild(preview);

        list.appendChild(item);
    });

    container.appendChild(list);
}

/**
 * Set active group
 */
async function setActiveGroup(groupId: string): Promise<void> {
    await configManager.setActiveGroup(groupId);
    await loadConfig();
    renderGroups();
}

/**
 * Delete group
 */
async function deleteGroup(groupId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this group?')) {
        return;
    }

    await configManager.deleteGroup(groupId);
    await loadConfig();
    renderGroups();
}

/**
 * Open group modal for creating or editing
 */
function openGroupModal(group?: ConventionGroup): void {
    const modalTitle = document.getElementById('modal-title')!;
    const groupNameInput = document.getElementById('group-name') as HTMLInputElement;
    const groupDescInput = document.getElementById('group-description') as HTMLTextAreaElement;

    if (group) {
        // Edit mode
        editingGroupId = group.id;
        currentGroupConventions = [...group.conventions];
        modalTitle.textContent = 'Edit Convention Group';
        groupNameInput.value = group.name;
        groupDescInput.value = group.description || '';
    } else {
        // Create mode
        editingGroupId = null;
        currentGroupConventions = [];
        modalTitle.textContent = 'Create Convention Group';
        groupNameInput.value = '';
        groupDescInput.value = '';
    }

    renderConventionsList();
    groupModal.classList.add('active');
}

/**
 * Render conventions list in group modal
 */
function renderConventionsList(): void {
    const conventionsList = document.getElementById('conventions-list')!;
    conventionsList.innerHTML = '';

    if (currentGroupConventions.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No conventions yet. Click "Add Convention" to create one.';
        conventionsList.appendChild(empty);
        return;
    }

    currentGroupConventions.forEach((convention, index) => {
        const item = document.createElement('div');
        item.className = 'convention-item';

        const info = document.createElement('div');
        info.className = 'convention-info';

        const label = document.createElement('strong');
        label.textContent = convention.displayName;
        info.appendChild(label);

        const template = document.createElement('code');
        template.textContent = convention.template.substring(0, 50) + (convention.template.length > 50 ? '...' : '');
        info.appendChild(template);

        const actions = document.createElement('div');
        actions.className = 'convention-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-secondary';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => openConventionModal(index));
        actions.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteConvention(index));
        actions.appendChild(deleteBtn);

        item.appendChild(info);
        item.appendChild(actions);
        conventionsList.appendChild(item);
    });
}

/**
 * Open convention modal
 */
function openConventionModal(index?: number): void {
    const modalTitle = document.getElementById('convention-modal-title')!;
    const labelInput = document.getElementById('convention-label') as HTMLInputElement;
    const displayNameInput = document.getElementById('convention-display-name') as HTMLInputElement;
    const templateInput = document.getElementById('convention-template') as HTMLTextAreaElement;
    const descInput = document.getElementById('convention-description') as HTMLTextAreaElement;
    const colorInput = document.getElementById('convention-color') as HTMLInputElement;

    if (index !== undefined) {
        // Edit mode
        editingConventionIndex = index;
        const convention = currentGroupConventions[index];
        modalTitle.textContent = 'Edit Convention';
        labelInput.value = convention.label;
        displayNameInput.value = convention.displayName;
        templateInput.value = convention.template;
        descInput.value = convention.description || '';
        colorInput.value = convention.color || '#3B82F6';
    } else {
        // Create mode
        editingConventionIndex = null;
        modalTitle.textContent = 'Add Convention';
        labelInput.value = '';
        displayNameInput.value = '';
        templateInput.value = '';
        descInput.value = '';
        colorInput.value = '#3B82F6';
    }

    conventionModal.classList.add('active');
}

/**
 * Save convention
 */
function saveConvention(): void {
    const labelInput = document.getElementById('convention-label') as HTMLInputElement;
    const displayNameInput = document.getElementById('convention-display-name') as HTMLInputElement;
    const templateInput = document.getElementById('convention-template') as HTMLTextAreaElement;
    const descInput = document.getElementById('convention-description') as HTMLTextAreaElement;
    const colorInput = document.getElementById('convention-color') as HTMLInputElement;

    const convention: Convention = {
        id: editingConventionIndex !== null ? currentGroupConventions[editingConventionIndex].id : crypto.randomUUID(),
        label: labelInput.value.trim(),
        displayName: displayNameInput.value.trim(),
        template: templateInput.value,
        description: descInput.value.trim() || undefined,
        color: colorInput.value,
    };

    if (!convention.label || !convention.displayName || !convention.template) {
        alert('Please fill in all required fields');
        return;
    }

    if (editingConventionIndex !== null) {
        currentGroupConventions[editingConventionIndex] = convention;
    } else {
        currentGroupConventions.push(convention);
    }

    renderConventionsList();
    conventionModal.classList.remove('active');
}

/**
 * Delete convention
 */
function deleteConvention(index: number): void {
    if (!confirm('Are you sure you want to delete this convention?')) {
        return;
    }

    currentGroupConventions.splice(index, 1);
    renderConventionsList();
}

/**
 * Save group
 */
async function saveGroup(): Promise<void> {
    const groupNameInput = document.getElementById('group-name') as HTMLInputElement;
    const groupDescInput = document.getElementById('group-description') as HTMLTextAreaElement;

    const name = groupNameInput.value.trim();
    const description = groupDescInput.value.trim();

    if (!name) {
        alert('Please enter a group name');
        return;
    }

    if (currentGroupConventions.length === 0) {
        alert('Please add at least one convention');
        return;
    }

    const group: ConventionGroup = {
        id: editingGroupId || crypto.randomUUID(),
        name,
        description: description || undefined,
        isDefault: false,
        isBuiltIn: false,
        conventions: currentGroupConventions,
    };

    if (editingGroupId) {
        await configManager.updateGroup(editingGroupId, group);
    } else {
        await configManager.addGroup(group);
    }

    await loadConfig();
    renderGroups();
    closeModals();
}

/**
 * Close all modals
 */
function closeModals(): void {
    groupModal.classList.remove('active');
    conventionModal.classList.remove('active');
    editingGroupId = null;
    editingConventionIndex = null;
    currentGroupConventions = [];
}

/**
 * Render general settings
 */
function renderGeneralSettings(): void {
    const showIconCheckbox = document.getElementById('show-icon') as HTMLInputElement;
    const shortcutInput = document.getElementById('keyboard-shortcut') as HTMLInputElement;

    showIconCheckbox.checked = currentConfig.settings.showInPageIcon;
    shortcutInput.value = currentConfig.settings.keyboardShortcut;
}

/**
 * Save general settings
 */
async function saveGeneralSettings(): Promise<void> {
    const showIconCheckbox = document.getElementById('show-icon') as HTMLInputElement;

    currentConfig.settings.showInPageIcon = showIconCheckbox.checked;
    await configManager.saveConfig(currentConfig);
}

/**
 * Change keyboard shortcut
 */
async function changeKeyboardShortcut(): Promise<void> {
    const shortcutInput = document.getElementById('keyboard-shortcut') as HTMLInputElement;
    const newShortcut = prompt('Enter new keyboard shortcut (e.g., Cmd+Shift+/):', currentConfig.settings.keyboardShortcut);

    if (newShortcut && newShortcut.trim()) {
        currentConfig.settings.keyboardShortcut = newShortcut.trim();
        await configManager.saveConfig(currentConfig);
        shortcutInput.value = newShortcut.trim();
    }
}

/**
 * Export all groups
 */
async function exportAll(): Promise<void> {
    const json = await exportAllGroups();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pr-conventions-config.json';
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Import from file
 */
async function importFromFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
        const text = await file.text();
        await importGroups(text);

        await loadConfig();
        renderGroups();
        alert('Configuration imported successfully!');
    } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset input
    input.value = '';
}

/**
 * Sync remote config
 */
async function syncRemoteConfig(): Promise<void> {
    const urlInput = document.getElementById('remote-url') as HTMLInputElement;
    const statusDiv = document.getElementById('sync-status')!;
    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter a remote configuration URL');
        return;
    }

    statusDiv.textContent = 'Syncing...';
    statusDiv.className = 'sync-status syncing';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        await importGroups(text);

        await loadConfig();
        renderGroups();

        statusDiv.textContent = '✓ Sync successful!';
        statusDiv.className = 'sync-status success';
    } catch (error) {
        statusDiv.textContent = `✗ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        statusDiv.className = 'sync-status error';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
