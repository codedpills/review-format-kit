/**
 * Convention dropdown component
 * Displays searchable list of conventions for selection
 */

import type { Convention } from '../lib/types';
import { insertTemplate } from './template-inserter';

const DROPDOWN_CLASS = 'pr-conventions-dropdown';
const DROPDOWN_VISIBLE_CLASS = 'pr-conventions-dropdown--visible';

let currentDropdown: HTMLElement | null = null;
let currentTextarea: HTMLTextAreaElement | null = null;
let currentConventions: Convention[] = [];
let filteredConventions: Convention[] = [];
let selectedIndex = 0;

/**
 * Show dropdown with conventions
 */
export function showDropdown(
  anchorElement: HTMLElement,
  textarea: HTMLTextAreaElement,
  conventions: Convention[]
): void {
  // Hide existing dropdown if any
  hideDropdown();

  currentTextarea = textarea;
  currentConventions = conventions;
  filteredConventions = [...conventions];
  selectedIndex = 0;

  // Create dropdown
  const dropdown = createDropdownElement(conventions);
  currentDropdown = dropdown;

  // Add to DOM
  document.body.appendChild(dropdown);

  // Position dropdown
  positionDropdown(dropdown, anchorElement);

  // Show dropdown
  requestAnimationFrame(() => {
    dropdown.classList.add(DROPDOWN_VISIBLE_CLASS);
  });

  // Focus search input
  const searchInput = dropdown.querySelector('input') as HTMLInputElement;
  if (searchInput) {
    searchInput.focus();
  }

  // Add event listeners
  attachDropdownListeners(dropdown);
}

/**
 * Hide dropdown
 */
export function hideDropdown(): void {
  if (currentDropdown) {
    currentDropdown.remove();
    currentDropdown = null;
    currentTextarea = null;
    currentConventions = [];
    filteredConventions = [];
    selectedIndex = 0;
  }
}

/**
 * Create dropdown DOM element
 */
function createDropdownElement(conventions: Convention[]): HTMLElement {
  const dropdown = document.createElement('div');
  dropdown.className = DROPDOWN_CLASS;

  // Search input
  const searchContainer = document.createElement('div');
  searchContainer.className = 'pr-conventions-search';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search conventions...';
  searchInput.className = 'pr-conventions-search-input';

  searchContainer.appendChild(searchInput);
  dropdown.appendChild(searchContainer);

  // Conventions list
  const list = document.createElement('ul');
  list.className = 'pr-conventions-list';

  conventions.forEach((convention, index) => {
    const item = createConventionItem(convention, index);
    list.appendChild(item);
  });

  dropdown.appendChild(list);

  return dropdown;
}

/**
 * Create convention list item
 */
function createConventionItem(convention: Convention, index: number): HTMLElement {
  const item = document.createElement('li');
  item.className = 'pr-convention-item';
  item.setAttribute('data-convention-id', convention.id);
  item.setAttribute('data-index', index.toString());

  // Label
  const label = document.createElement('div');
  label.className = 'pr-convention-label';
  label.textContent = convention.displayName;
  if (convention.color) {
    label.style.color = convention.color;
  }
  item.appendChild(label);

  // Description
  if (convention.description) {
    const description = document.createElement('div');
    description.className = 'pr-convention-description';
    description.textContent = convention.description;
    item.appendChild(description);
  }

  // Template preview
  const preview = document.createElement('div');
  preview.className = 'pr-convention-preview';
  preview.textContent = convention.template.split('\n')[0]; // First line only
  item.appendChild(preview);

  return item;
}

/**
 * Position dropdown relative to anchor element
 */
function positionDropdown(dropdown: HTMLElement, anchor: HTMLElement): void {
  const anchorRect = anchor.getBoundingClientRect();
  const dropdownRect = dropdown.getBoundingClientRect();

  // Default: position below anchor
  let top = anchorRect.bottom + 4;
  let left = anchorRect.left;

  // Check if dropdown would go off-screen
  if (top + dropdownRect.height > window.innerHeight) {
    // Position above anchor instead
    top = anchorRect.top - dropdownRect.height - 4;
  }

  if (left + dropdownRect.width > window.innerWidth) {
    // Align to right edge
    left = window.innerWidth - dropdownRect.width - 8;
  }

  dropdown.style.top = `${top}px`;
  dropdown.style.left = `${left}px`;
}

/**
 * Attach event listeners to dropdown
 */
function attachDropdownListeners(dropdown: HTMLElement): void {
  const searchInput = dropdown.querySelector('input') as HTMLInputElement;
  const list = dropdown.querySelector('.pr-conventions-list') as HTMLElement;

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keydown', handleKeyboardNav);
  }

  // List items
  if (list) {
    list.addEventListener('click', handleItemClick);
    list.addEventListener('mouseover', handleItemHover);
  }

  // Click outside to close
  document.addEventListener('click', handleClickOutside);

  // Escape to close
  document.addEventListener('keydown', handleEscape);
}

/**
 * Handle search input
 */
function handleSearch(event: Event): void {
  const input = event.target as HTMLInputElement;
  const query = input.value.toLowerCase().trim();

  if (!query) {
    filteredConventions = [...currentConventions];
  } else {
    filteredConventions = currentConventions.filter((convention) => {
      return (
        convention.label.toLowerCase().includes(query) ||
        convention.displayName.toLowerCase().includes(query) ||
        convention.description?.toLowerCase().includes(query)
      );
    });
  }

  selectedIndex = 0;
  updateDropdownList();
}

/**
 * Update dropdown list with filtered conventions
 */
function updateDropdownList(): void {
  if (!currentDropdown) return;

  const list = currentDropdown.querySelector('.pr-conventions-list') as HTMLElement;
  if (!list) return;

  // Clear existing items
  list.innerHTML = '';

  // Add filtered items
  filteredConventions.forEach((convention, index) => {
    const item = createConventionItem(convention, index);
    if (index === selectedIndex) {
      item.classList.add('pr-convention-item--selected');
    }
    list.appendChild(item);
  });

  // Show "no results" message if empty
  if (filteredConventions.length === 0) {
    const noResults = document.createElement('li');
    noResults.className = 'pr-convention-no-results';
    noResults.textContent = 'No conventions found';
    list.appendChild(noResults);
  }
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNav(event: KeyboardEvent): void {
  if (!currentDropdown || filteredConventions.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filteredConventions.length - 1);
      updateSelection();
      break;

    case 'ArrowUp':
      event.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection();
      break;

    case 'Enter':
      event.preventDefault();
      selectCurrentConvention();
      break;

    case 'Escape':
      event.preventDefault();
      hideDropdown();
      break;
  }
}

/**
 * Update visual selection
 */
function updateSelection(): void {
  if (!currentDropdown) return;

  const items = currentDropdown.querySelectorAll('.pr-convention-item');
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add('pr-convention-item--selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('pr-convention-item--selected');
    }
  });
}

/**
 * Handle item click
 */
function handleItemClick(event: Event): void {
  const target = event.target as HTMLElement;
  const item = target.closest('.pr-convention-item') as HTMLElement;

  if (item) {
    const index = parseInt(item.getAttribute('data-index') || '0', 10);
    selectedIndex = index;
    selectCurrentConvention();
  }
}

/**
 * Handle item hover
 */
function handleItemHover(event: Event): void {
  const target = event.target as HTMLElement;
  const item = target.closest('.pr-convention-item') as HTMLElement;

  if (item) {
    const index = parseInt(item.getAttribute('data-index') || '0', 10);
    selectedIndex = index;
    updateSelection();
  }
}

/**
 * Select current convention and insert template
 */
function selectCurrentConvention(): void {
  if (!currentTextarea || filteredConventions.length === 0) return;

  const convention = filteredConventions[selectedIndex];
  if (!convention) return;

  // Insert template
  insertTemplate(currentTextarea, convention.template);

  // Hide dropdown
  hideDropdown();
}

/**
 * Handle click outside dropdown
 */
function handleClickOutside(event: Event): void {
  if (!currentDropdown) return;

  const target = event.target as HTMLElement;
  if (!currentDropdown.contains(target) && !target.closest('.pr-conventions-trigger')) {
    hideDropdown();
  }
}

/**
 * Handle Escape key
 */
function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && currentDropdown) {
    hideDropdown();
  }
}

/**
 * Check if dropdown is currently visible
 */
export function isDropdownVisible(): boolean {
  return currentDropdown !== null;
}
