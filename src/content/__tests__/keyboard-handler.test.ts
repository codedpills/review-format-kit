import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerShortcut, unregisterShortcut } from '../keyboard-handler';
import * as dropdown from '../dropdown';

// Mock dropdown functions
vi.mock('../dropdown', () => ({
  showDropdown: vi.fn(),
  isDropdownVisible: vi.fn(() => false),
  hideDropdown: vi.fn(),
}));

describe('keyboard-handler', () => {
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    // Set up a mock textarea
    textarea = document.createElement('textarea');
    textarea.id = 'test-textarea';
    document.body.appendChild(textarea);
    textarea.focus();

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(textarea);
    unregisterShortcut();
  });

  it('should match Cmd+Shift+/ on Mac when event.key is "/"', async () => {
    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    const getConventions = vi.fn().mockResolvedValue([{ id: 'test', label: 'test' }]);
    registerShortcut('Cmd+Shift+/', getConventions);

    const event = new KeyboardEvent('keydown', {
      key: '/',
      code: 'Slash',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    });

    // We need to manually trigger the handler as JSDOM might not relay the event
    document.dispatchEvent(event);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getConventions).toHaveBeenCalled();
    expect(dropdown.showDropdown).toHaveBeenCalled();
  });

  it('should match Cmd+Shift+/ on Mac when event.key is "?" (Shift pressed)', async () => {
    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    const getConventions = vi.fn().mockResolvedValue([{ id: 'test', label: 'test' }]);
    registerShortcut('Cmd+Shift+/', getConventions);

    const event = new KeyboardEvent('keydown', {
      key: '?',
      code: 'Slash',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getConventions).toHaveBeenCalled();
    expect(dropdown.showDropdown).toHaveBeenCalled();
  });

  it('should match Ctrl+Shift+/ on Windows when event.key is "/"', async () => {
    // Mock Windows platform
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    });

    const getConventions = vi.fn().mockResolvedValue([{ id: 'test', label: 'test' }]);
    registerShortcut('Ctrl+Shift+/', getConventions);

    const event = new KeyboardEvent('keydown', {
      key: '/',
      code: 'Slash',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getConventions).toHaveBeenCalled();
    expect(dropdown.showDropdown).toHaveBeenCalled();
  });

  it('should not match if modifier is missing', async () => {
    const getConventions = vi.fn().mockResolvedValue([]);
    registerShortcut('Cmd+Shift+/', getConventions);

    const event = new KeyboardEvent('keydown', {
      key: '/',
      code: 'Slash',
      shiftKey: true, // Missing Cmd
      bubbles: true,
    });

    document.dispatchEvent(event);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getConventions).not.toHaveBeenCalled();
    expect(dropdown.showDropdown).not.toHaveBeenCalled();
  });

  it('should correctly unregister and not trigger', async () => {
    const getConventions = vi.fn().mockResolvedValue([{ id: 'test', label: 'test' }]);
    registerShortcut('Cmd+Shift+/', getConventions);
    unregisterShortcut();

    const event = new KeyboardEvent('keydown', {
      key: '/',
      code: 'Slash',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getConventions).not.toHaveBeenCalled();
  });
});
