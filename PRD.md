# Product Requirements Document: PR Comments Convention Browser Extension

**Version:** 1.0  
**Last Updated:** February 17, 2026  
**Status:** Draft  

---

## Executive Summary

This document outlines the requirements for a browser extension that helps development teams adopt and consistently use code review comment conventions (such as Conventional Comments and Netlify Feedback Ladders) on GitHub pull requests. The extension reduces the cognitive load of remembering comment formats and provides an intuitive interface for selecting and inserting standardized comment templates.

---

## Problem Statement

### Current Pain Points

1. **Memorization Burden**: Developers struggle to remember the exact syntax, labels, and formats of comment conventions during code reviews
2. **Context Switching**: Reviewers frequently need to reference external documentation (e.g., conventionalcomments.org) mid-review, breaking flow
3. **Inconsistent Adoption**: Without tooling support, convention adoption across teams is inconsistent, reducing the value of standardization
4. **Multi-Team Complexity**: Developers working across multiple teams/organizations encounter different conventions, making it harder to context-switch

### Impact

- Code review comments lack clarity on severity and action required
- Increased back-and-forth due to unclear feedback intent
- Lost productivity from constant documentation lookups
- Lower team velocity and collaboration quality

---

## Goals & Non-Goals

### Goals

- ✅ **Reduce friction** in adopting comment conventions by providing templates at point-of-use
- ✅ **Support multiple conventions** (Conventional Comments, Netlify Feedback Ladders, custom)
- ✅ **Enable multi-team workflows** through switchable convention groups
- ✅ **Provide team sync capabilities** via shared configuration
- ✅ **Work seamlessly on GitHub** PR comment boxes
- ✅ **Be open-source** and freely available

### Non-Goals (v1)

- ❌ GitLab support (deferred to v2)
- ❌ Cloud storage / account system (local-only for v1)
- ❌ AI-powered suggestion of which convention to use
- ❌ Analytics/tracking of convention usage
- ❌ Integration with code review bots or CI/CD

---

## User Personas

### Persona 1: Sarah — Engineering Team Lead
- **Context**: Manages a 10-person engineering team, wants to standardize code review practices
- **Goal**: Get the team consistently using Conventional Comments without extensive training
- **Needs**: Easy setup, shared team config, minimal onboarding friction

### Persona 2: Marcus — Senior Developer (Multi-Team)
- **Context**: Contributes to 3 different open-source projects, each with different review conventions
- **Goal**: Quickly switch between conventions based on which project they're reviewing
- **Needs**: Multiple convention groups, fast switching, no re-configuration per project

### Persona 3: Priya — New Developer
- **Context**: Junior dev doing their first code reviews, unfamiliar with comment conventions
- **Goal**: Learn and apply conventions correctly without constant googling
- **Needs**: Clear templates with examples, tooltips/help text, forgiving UX

---

## Feature Requirements

### 1. Convention Group Management

**Priority:** P0 (Must-have)

#### 1.1 Default Groups
- Extension ships with **two built-in groups**:
  - **Conventional Comments** (default active)
    - Labels: `praise`, `nitpick`, `suggestion`, `issue`, `todo`, `question`, `thought`, `chore`, `note`
    - Decorations: `(blocking)`, `(non-blocking)`, `(if-minor)`
    - Format: `<label> [decorations]: <subject> [discussion]`
  - **Netlify Feedback Ladders**
    - Labels: `[mountain]`, `[boulder]`, `[pebble]`, `[sand]`, `[dust]`
    - Format: `[label] <feedback>`

#### 1.2 Custom Groups
- Users can **create new convention groups** from scratch
- Each group has:
  - Name (e.g., "My Team's Conventions")
  - Description (optional)
  - List of convention items (labels/templates)
- Support for importing/exporting groups as JSON

#### 1.3 Group Switching
- Users can **set one group as the active/default** group
- Quick-switch capability via extension settings
- Active group determines which conventions appear in the dropdown

---

### 2. Convention Item Structure

**Priority:** P0 (Must-have)

Each convention item within a group consists of:

| Field | Description | Required | Example |
|-------|-------------|----------|---------|
| **Label** | Short identifier | Yes | `suggestion` |
| **Display Name** | User-friendly name | Yes | `Suggestion (non-blocking)` |
| **Template** | Markdown template with placeholders | Yes | `suggestion (non-blocking): <subject>\n\n<discussion>` |
| **Description** | Help text explaining when to use | No | "Use for proposed improvements that don't block approval" |
| **Color** | Visual indicator in dropdown | No | `#3B82F6` (blue) |

**Placeholder Format:**
- Use `<placeholder_name>` for required fields (e.g., `<subject>`, `<reasoning>`)
- Use `[optional_text]` for optional sections
- Support tab-navigation between placeholders after insertion

---

### 3. User Interface & Activation

**Priority:** P0 (Must-have)

#### 3.1 Activation Methods
- **Method 1**: Small icon/button injected next to GitHub comment textarea
  - Position: Top-right corner of textarea (GitHub PR comment boxes)
  - Icon: Recognizable symbol (e.g., speech bubble with "CC" or convention group icon)
  - Click behavior: Opens convention dropdown
  
- **Method 2**: Keyboard shortcut
  - Default: `Ctrl+Shift+/` (Windows/Linux) or `Cmd+Shift+/` (Mac)
  - Customizable in extension settings
  - Opens dropdown at cursor position

#### 3.2 Convention Dropdown UI
- **Trigger**: Clicking icon or using keyboard shortcut
- **Design**:
  - Popover/modal overlaying the comment area
  - Search/filter input at top
  - Scrollable list of conventions
  - Each item shows:
    - Label/display name (bold)
    - Description (smaller text)
    - Live preview of template (expandable/collapsible)
  - Keyboard navigable (arrow keys, Enter to select, Esc to close)
  
#### 3.3 Template Insertion
- **Behavior**: 
  - Full Markdown template inserted at cursor position in textarea
  - Placeholders (`<subject>`, `<discussion>`) are highlighted or wrapped in special formatting
  - User can tab through placeholders to fill in (stretch goal for v1, otherwise simple insertion)
  - If textarea is empty, template starts at beginning
  - If textarea has content, template is inserted at cursor with leading newline

#### 3.4 Visual Indicators
- Extension icon in browser toolbar shows:
  - Active convention group name on hover
  - Badge color matching active group
- In-page icon shows state:
  - Gray when inactive
  - Colored when dropdown is open

---

### 4. Configuration & Settings

**Priority:** P0 (Must-have)

#### 4.1 Extension Settings Panel
Accessible via:
- Browser extension popup (clicking extension icon in toolbar)
- Right-click on in-page icon → "Settings"

**Settings Include:**
- **Convention Groups** (CRUD operations):
  - List all groups with active indicator
  - Add new group (name, description)
  - Edit existing group
  - Delete group (with confirmation)
  - Set as default/active
  
- **General Settings**:
  - Keyboard shortcut customization
  - Show/hide in-page icon
  - Enable/disable on specific domains (e.g., only GitHub.com)

#### 4.2 Convention Editor
For each group, users can:
- Add new convention items (label, template, description, color)
- Edit existing items
- Delete items (with confirmation)
- Reorder items (drag-and-drop or up/down arrows)
- Preview template rendering

---

### 5. Team Configuration Sync

**Priority:** P1 (Should-have for v1)

#### 5.1 JSON Config URL
- **Feature**: Users can configure a **remote JSON config URL**
- **Behavior**:
  - Extension fetches config from URL on startup and periodically (e.g., every 24h)
  - Remote config merges with or overrides local config (user can choose)
  - If fetch fails, use cached version
  
- **Config Format** (JSON structure):
  ```json
  {
    "version": "1.0",
    "groups": [
      {
        "id": "conventional-comments",
        "name": "Conventional Comments",
        "description": "Standard convention from conventionalcomments.org",
        "conventions": [
          {
            "label": "suggestion",
            "displayName": "Suggestion",
            "template": "suggestion: <subject>\n\n<discussion>",
            "description": "Propose improvements or changes",
            "color": "#3B82F6"
          }
        ]
      }
    ]
  }
  ```

#### 5.2 Import/Export
- **Export**: Download current configuration as JSON file
- **Import**: Upload JSON file to add groups to local config
- Use case: Team lead exports config, shares with team via URL or file

---

### 6. GitHub Integration

**Priority:** P0 (Must-have)

#### 6.1 Detection & Injection
- **Target**: GitHub PR comment textareas
  - New PR comment box
  - Inline code review comments
  - Reply to existing comments
  - PR review summary comment
  
- **Detection Logic**:
  - Use DOM observers to detect textarea elements
  - Check URL pattern: `github.com/<org>/<repo>/pull/<number>`
  - Inject icon/button when textarea is focused or hovered

#### 6.2 Compatibility
- Must work with GitHub's dynamic UI (React-based)
- Handle GitHub UI updates gracefully (don't break on minor DOM changes)
- Avoid conflicts with other GitHub extensions (Refined GitHub, Octotree, etc.)

---

## Technical Architecture

### Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Core** | [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) | Cross-browser compatibility (Chrome, Firefox) |
| **Language** | TypeScript (strict mode) | Type safety, better DX, catch errors early |
| **Content Script** | TypeScript | Inject UI into GitHub pages, minimal dependencies |
| **UI Framework** | Vanilla JS + CSS / Preact (if needed) | Lightweight, fast rendering for dropdown |
| **Storage** | `browser.storage.local` | Persistent local storage for config |
| **Build Tool** | Vite | Fast builds, modern JS, TypeScript support |
| **Testing - Unit** | Vitest + @testing-library/dom | Test components and logic in isolation |
| **Testing - E2E** | Playwright | Test extension in real browser with GitHub |
| **Type Checking** | TypeScript compiler + webextension-polyfill | Strict type safety |
| **Code Quality** | ESLint + Prettier | Enforce code standards and formatting |
| **Packaging** | web-ext (Firefox), Chrome Web Store CLI | Automate builds for both browsers |

### Extension Structure

```
pr-comment-plugin/
├── manifest.json              # Extension manifest (v3 for Chrome, v2/v3 for Firefox)
├── background/
│   └── service-worker.js      # Background script for config sync, shortcuts
├── content/
│   ├── github-injector.js     # Detects textareas, injects UI
│   ├── dropdown.js            # Convention dropdown component
│   └── styles.css             # Injected styles for dropdown/icon
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup logic (settings overview)
│   └── popup.css              # Popup styles
├── options/
│   ├── options.html           # Full settings page
│   ├── options.js             # Convention group management
│   └── options.css            # Settings page styles
├── lib/
│   ├── config.js              # Config management (CRUD, import/export)
│   ├── storage.js             # Wrapper for browser.storage API
│   └── defaults.js            # Default convention groups (Conventional Comments, Netlify)
└── assets/
    └── icons/                 # Extension icons (16x16, 32x32, 48x48, 128x128)
```

### Data Model

```typescript
// Convention Group
interface ConventionGroup {
  id: string;                  // Unique identifier
  name: string;                // Display name
  description?: string;        // Optional description
  isDefault: boolean;          // Is this the active group?
  isBuiltIn: boolean;          // Built-in vs. custom
  conventions: Convention[];   // List of conventions
}

// Convention Item
interface Convention {
  id: string;                  // Unique within group
  label: string;               // e.g., "suggestion"
  displayName: string;         // e.g., "Suggestion (non-blocking)"
  template: string;            // Markdown template with placeholders
  description?: string;        // Help text
  color?: string;              // Hex color for visual indicator
}

// Extension Config
interface ExtensionConfig {
  version: string;             // Config schema version
  groups: ConventionGroup[];   // All convention groups
  settings: {
    keyboardShortcut: string;  // e.g., "Ctrl+Shift+/"
    showInPageIcon: boolean;   // Show icon next to textareas
    enabledDomains: string[];  // e.g., ["github.com"]
    remoteConfigUrl?: string;  // Optional remote config URL
    remoteConfigSyncInterval: number; // In hours
  };
}
```

---

## Testing Requirements

### Testing Strategy

**Priority:** P0 (Must-have)

All features must be fully test-covered before release. The extension will use a multi-layered testing approach to ensure reliability and maintainability.

### Testing Stack

| Test Type | Technology | Purpose |
|-----------|-----------|---------|
| **Unit Tests** | Vitest + @testing-library/dom | Test individual functions and components in isolation |
| **Integration Tests** | Vitest + webextension-polyfill-mock | Test module interactions and storage operations |
| **E2E Tests** | Playwright | Test extension in real browser with GitHub |
| **Type Safety** | TypeScript + strict mode | Catch type errors at compile time |
| **Linting** | ESLint + Prettier | Enforce code quality standards |

### Test Coverage Requirements

- **Minimum Coverage**: 80% for all code
- **Critical Paths**: 100% coverage for:
  - Storage operations (data persistence)
  - Config management (CRUD operations)
  - Template insertion logic
  - Remote config sync
  - Import/Export JSON functionality

### Unit Tests

**Scope:** Test individual functions and utilities in isolation

#### 1. Storage Layer (`lib/storage.ts`)
- [ ] Test `get()` retrieves stored data correctly
- [ ] Test `set()` persists data correctly
- [ ] Test `remove()` deletes data correctly
- [ ] Test `clear()` removes all data
- [ ] Test error handling for storage quota exceeded
- [ ] Test migration from old schema versions

#### 2. Config Management (`lib/config.ts`)
- [ ] Test creating new convention group
- [ ] Test updating existing group
- [ ] Test deleting group (with cascade)
- [ ] Test setting active/default group
- [ ] Test adding convention to group
- [ ] Test removing convention from group
- [ ] Test reordering conventions
- [ ] Test validating config structure
- [ ] Test merging remote config with local config

#### 3. Default Data (`lib/defaults.ts`)
- [ ] Test Conventional Comments group structure
- [ ] Test Netlify Feedback Ladders group structure
- [ ] Test all templates have required fields
- [ ] Test placeholder format in templates

#### 4. Template Insertion (`content/template-inserter.ts`)
- [ ] Test inserting template at cursor position
- [ ] Test inserting template in empty textarea
- [ ] Test inserting template with existing content
- [ ] Test template with placeholders
- [ ] Test multi-line template formatting
- [ ] Test placeholder highlighting (if implemented)

#### 5. Search/Filter (`content/dropdown.ts`)
- [ ] Test filtering conventions by label
- [ ] Test filtering by display name
- [ ] Test filtering by description
- [ ] Test fuzzy search
- [ ] Test empty search results

### Integration Tests

**Scope:** Test interaction between modules and external APIs

#### 1. Extension Storage Integration
- [ ] Test saving and loading full config
- [ ] Test concurrent read/write operations
- [ ] Test storage event listeners (sync across tabs)
- [ ] Test migration on extension update

#### 2. Remote Config Sync
- [ ] Test fetching remote JSON successfully
- [ ] Test handling network errors gracefully
- [ ] Test handling invalid JSON
- [ ] Test merge strategy (append vs. override)
- [ ] Test caching on fetch failure
- [ ] Test periodic sync scheduling

#### 3. Import/Export
- [ ] Test exporting single group to JSON
- [ ] Test exporting all groups to JSON
- [ ] Test importing valid JSON file
- [ ] Test importing invalid JSON (error handling)
- [ ] Test importing duplicate group IDs
- [ ] Test importing with version mismatch

### End-to-End Tests

**Scope:** Test extension in real browser environment with GitHub

#### 1. GitHub Integration
- [ ] Test extension loads on GitHub PR page
- [ ] Test icon injection on textarea focus
- [ ] Test icon injection on inline comment textarea
- [ ] Test icon injection on PR review summary textarea
- [ ] Test no injection on non-PR pages
- [ ] Test dropdown opens on icon click
- [ ] Test dropdown opens on keyboard shortcut
- [ ] Test dropdown closes on Escape key
- [ ] Test dropdown closes on clicking outside

#### 2. Convention Selection & Insertion
- [ ] Test selecting convention from dropdown
- [ ] Test template inserted at correct position
- [ ] Test template formatting preserved
- [ ] Test multiple insertions in same textarea
- [ ] Test insertion doesn't break GitHub functionality
- [ ] Test undo/redo after insertion

#### 3. Settings UI
- [ ] Test opening settings page
- [ ] Test creating new convention group
- [ ] Test editing convention group
- [ ] Test deleting convention group
- [ ] Test switching active group
- [ ] Test adding convention to group
- [ ] Test editing convention template
- [ ] Test deleting convention from group
- [ ] Test reordering conventions (drag-and-drop)

#### 4. Popup UI
- [ ] Test popup displays active group
- [ ] Test switching group from popup
- [ ] Test sync button triggers remote fetch
- [ ] Test opening settings from popup

#### 5. Keyboard Shortcuts
- [ ] Test default shortcut (`Cmd+Shift+/`)
- [ ] Test custom shortcut configuration
- [ ] Test shortcut works across different GitHub pages
- [ ] Test shortcut doesn't conflict with GitHub shortcuts

### Cross-Browser Testing

**Scope:** Ensure feature parity and compatibility

#### Chrome
- [ ] All E2E tests pass on Chrome (latest)
- [ ] Test manifest v3 compatibility
- [ ] Test service worker background script
- [ ] Test chrome.storage API

#### Firefox
- [ ] All E2E tests pass on Firefox (latest)
- [ ] Test manifest v2/v3 compatibility
- [ ] Test browser.storage API polyfill
- [ ] Test extension popup UI rendering

#### Edge (Chromium)
- [ ] Smoke test on Edge (latest)
- [ ] Verify Chrome build works without modification

### Performance Testing

- [ ] Extension loads in <500ms
- [ ] Dropdown opens in <200ms
- [ ] Template insertion completes in <100ms
- [ ] Storage operations complete in <50ms
- [ ] Remote config sync doesn't block UI
- [ ] Extension doesn't slow down GitHub page load

### Accessibility Testing

- [ ] Keyboard navigation works for all UI elements
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader compatibility (test with VoiceOver/NVDA)
- [ ] Color contrast meets WCAG AA standards
- [ ] Dropdown has proper ARIA labels

### Regression Testing

- [ ] Test suite runs on every PR
- [ ] No new tests should fail
- [ ] Coverage should not decrease
- [ ] Performance benchmarks should not regress

### Manual Testing Checklist

Before each release, manually verify:

- [ ] Install extension from built package
- [ ] Navigate to GitHub PR
- [ ] Open convention dropdown
- [ ] Select and insert convention
- [ ] Submit PR comment
- [ ] Verify comment renders correctly
- [ ] Configure custom convention group
- [ ] Export config to JSON
- [ ] Import config from JSON
- [ ] Test remote config URL sync
- [ ] Uninstall and reinstall (data persistence)

---

## User Flows

### Flow 1: First-Time Setup (Individual User)

1. User installs extension from Chrome Web Store / Firefox Add-ons
2. Extension grants permissions (access to `github.com`)
3. Welcome page opens with:
   - Overview of the extension
   - Option to pick default convention group (Conventional Comments or Netlify, or create custom)
   - Quick tutorial (screenshots showing activation and usage)
4. User selects default group, clicks "Get Started"
5. Extension is ready to use

### Flow 2: Using Convention on GitHub PR

1. User navigates to GitHub PR page
2. User clicks inside a comment textarea (e.g., to add a PR comment)
3. Extension icon appears at top-right corner of textarea
4. User clicks icon (or presses `Cmd+Shift+/`)
5. Dropdown appears with list of conventions from active group
6. User scrolls or searches for desired convention (e.g., "suggestion")
7. User clicks "suggestion" entry
8. Template is inserted: `suggestion: <subject>\n\n<discussion>`
9. User replaces `<subject>` and `<discussion>` with actual content
10. User submits comment

### Flow 3: Team Lead Sharing Configuration

1. Team lead opens extension settings
2. Navigates to "Convention Groups" → "Conventional Comments" (or custom group)
3. Clicks "Export Group" button
4. JSON file is downloaded: `conventional-comments.json`
5. Team lead uploads JSON to accessible URL (e.g., `https://team-wiki.com/code-review-config.json`)
6. Team lead shares URL with team via Slack/email
7. Team members:
   - Open extension settings
   - Navigate to "Remote Config"
   - Enter URL: `https://team-wiki.com/code-review-config.json`
   - Click "Sync Now"
   - Extension fetches and merges config
   - Convention group now available in dropdown

### Flow 4: Multi-Team Developer Switching Conventions

1. Marcus (developer on 3 teams) has 3 convention groups configured:
   - "Team A - Conventional Comments"
   - "Team B - Netlify Ladders"
   - "Team C - Custom"
2. While reviewing PR for Team A:
   - Clicks extension icon in browser toolbar
   - Sees current active group: "Team A - Conventional Comments"
   - Dropdown is already using Team A conventions
3. Later, switches to Team B PR:
   - Clicks extension icon again
   - Clicks "Switch Group" → selects "Team B - Netlify Ladders"
   - Dropdown now shows Netlify conventions
4. (Optional enhancement): Extension auto-detects GitHub org/repo and switches group automatically (v2 feature)

---

## User Interface Mockups

### 1. In-Page Icon & Dropdown

```
┌──────────────────────────────────────────────────────┐
│  Leave a comment                          [🔖] ←icon │
│ ┌───────────────────────────────────────────────────┐│
│ │                                                    ││
│ │ <cursor here>                                      ││
│ │                                                    ││
│ └───────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘

After clicking icon:

┌──────────────────────────────────────────────────────┐
│  Leave a comment                          [🔖]       │
│ ┌─────────────────────┐                              │
│ │ Search conventions..│                              │
│ ├─────────────────────┤                              │
│ │ 📝 suggestion        │← selected                   │
│ │   Propose improvements│                            │
│ │   suggestion: <subject>                            │
│ ├─────────────────────┤                              │
│ │ ❓ question          │                              │
│ │   Ask for clarification                            │
│ ├─────────────────────┤                              │
│ │ ⚠️  issue            │                              │
│ │   Highlight problems │                              │
│ └─────────────────────┘                              │
└──────────────────────────────────────────────────────┘
```

### 2. Extension Popup (Quick View)

```
┌─────────────────────────────┐
│ PR Comment Conventions       │
├─────────────────────────────┤
│ Active Group:                │
│ ✓ Conventional Comments      │
│                              │
│ [Switch Group ▼]             │
│                              │
│ Quick Actions:               │
│ • Open Full Settings         │
│ • Keyboard Shortcut Help     │
│                              │
│ Synced: 2 hours ago          │
│ [Sync Now]                   │
└─────────────────────────────┘
```

### 3. Settings Page - Convention Groups

```
┌─────────────────────────────────────────────────┐
│                Settings                          │
├─────────────────────────────────────────────────┤
│ [Convention Groups] [General] [Remote Config]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Convention Groups                               │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ ✓ Conventional Comments (Active) [Built-in] │
│  │   9 conventions                          │  │
│  │   [Edit] [Set as Default]                │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │   Netlify Feedback Ladders    [Built-in] │  │
│  │   5 conventions                          │  │
│  │   [Edit] [Set as Default]                │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  [+ Create New Group]                            │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Success Metrics

### Adoption Metrics
- **Downloads**: Target 1,000+ installations in first 3 months
- **Active Users**: 60%+ weekly active usage rate (WAU/Total Installs)
- **Retention**: 50%+ users still active after 30 days

### Usage Metrics
- **Convention Insertions**: Average 5+ insertions per active user per week
- **Group Switching**: 20%+ of users have multiple groups configured
- **Team Sync**: 10%+ of users using remote config URL feature

### Quality Metrics
- **Error Rate**: <1% of convention insertions fail or cause UI issues
- **Load Time**: Extension dropdown opens in <200ms
- **Browser Compatibility**: 95%+ feature parity between Chrome and Firefox

### User Satisfaction
- **Store Rating**: Maintain 4.5+ stars on Chrome Web Store / Firefox Add-ons
- **GitHub Stars**: 100+ stars on GitHub repo (if open-sourced)
- **Community**: 10+ contributors within 6 months

---

## Development Roadmap

### Phase 1: MVP (v0.1 - v1.0) — 6-8 weeks

**Week 1-2: Foundation**
- [ ] Set up project structure (manifest, build system)
- [ ] Implement storage layer (`config.js`, `storage.js`)
- [ ] Create default convention groups (Conventional Comments, Netlify)

**Week 3-4: Core Features**
- [ ] GitHub textarea detection and icon injection
- [ ] Convention dropdown UI (search, select, insert)
- [ ] Template insertion with placeholders
- [ ] Keyboard shortcut activation

**Week 5-6: Configuration**
- [ ] Extension popup (active group display, quick actions)
- [ ] Settings page (convention group CRUD)
- [ ] Import/Export JSON functionality

**Week 7: Team Sync**
- [ ] Remote config URL fetching
- [ ] Periodic sync background task
- [ ] Merge strategy (remote overrides vs. supplements local)

**Week 8: Polish & Release**
- [ ] Cross-browser testing (Chrome, Firefox)
- [ ] Bug fixes and UX refinements
- [ ] Documentation (README, user guide)
- [ ] Publish to Chrome Web Store + Firefox Add-ons

### Phase 2: Enhancements (v1.1 - v2.0) — 3-4 months post-launch

**Planned Features:**
- [ ] GitLab support (same features as GitHub)
- [ ] Auto-detect GitHub org/repo and switch groups automatically
- [ ] Rich template editor (WYSIWYG for creating conventions)
- [ ] Import from popular sources (pre-built community templates)
- [ ] Tab-through placeholders (smart cursor navigation)
- [ ] Dark mode support
- [ ] Localization (i18n support for UI)

**Community-Driven:**
- [ ] Accept PRs for new default convention groups
- [ ] Plugin system for advanced customization
- [ ] Integration with code review analytics tools

---

## Open Questions & Future Considerations

1. **Auto-detect Convention Context**: Should the extension try to detect which group to use based on GitHub org/repo? (e.g., org "acme" always uses Group A)
   - **Decision**: Defer to v2, focus on manual switching for v1

2. **Placeholder Navigation**: Implement tab-through for placeholders (`<subject>`, `<discussion>`) like snippet expansion in IDEs?
   - **Decision**: Stretch goal for v1, otherwise v2

3. **Conflict with GitHub Copilot**: How does this interact with GitHub Copilot suggestions in textareas?
   - **Decision**: Test during development, ensure no conflicts

4. **Mobile Support**: Should we consider GitHub mobile web interface?
   - **Decision**: Out of scope for v1 (extensions don't work well on mobile)

5. **Analytics Opt-in**: Should we track anonymized usage data to improve the extension?
   - **Decision**: No analytics for v1 (open-source, privacy-first), revisit later with opt-in

6. **Convention Validation**: Should we validate inserted comments against the template format?
   - **Decision**: No validation for v1, users can modify freely after insertion

7. **Collaboration on Templates**: Should users be able to rate/share templates with the community?
   - **Decision**: v2 feature (requires backend infrastructure)

---

## Appendix

### A. Default Convention Templates

#### A.1 Conventional Comments

| Label | Display Name | Template |
|-------|--------------|----------|
| `praise` | Praise | `praise: <subject>\n\n<optional discussion>` |
| `nitpick` | Nitpick | `nitpick: <subject>\n\n<optional discussion>` |
| `suggestion` | Suggestion | `suggestion: <subject>\n\n<discussion>` |
| `issue` | Issue | `issue: <subject>\n\n<discussion>` |
| `todo` | Todo | `todo: <subject>\n\n<optional discussion>` |
| `question` | Question | `question: <subject>\n\n<optional context>` |
| `thought` | Thought | `thought: <subject>\n\n<optional discussion>` |
| `chore` | Chore | `chore: <subject>\n\n<optional discussion>` |
| `note` | Note | `note: <subject>\n\n<optional discussion>` |

**Common Decorations (added as needed):**
- `(non-blocking)`: Does not require action before approval
- `(blocking)`: Must be addressed before approval
- `(if-minor)`: Only if the change is minor

**Example with Decoration:**
```
suggestion (non-blocking): Consider using a Set instead of an Array

This would improve lookup performance from O(n) to O(1).
```

#### A.2 Netlify Feedback Ladders

| Label | Display Name | Template |
|-------|--------------|----------|
| `[mountain]` | Mountain (Critical Blocker) | `[mountain] ⛰ <feedback>\n\n<reasoning>` |
| `[boulder]` | Boulder (Blocker) | `[boulder] 🧗‍♀️ <feedback>\n\n<reasoning>` |
| `[pebble]` | Pebble (Future Action) | `[pebble] ⚪️ <feedback>\n\n<reasoning>` |
| `[sand]` | Sand (Consider) | `[sand] ⏳ <feedback>\n\n<optional reasoning>` |
| `[dust]` | Dust (Take or Leave) | `[dust] 🌫 <feedback>` |

**Example:**
```
[boulder] 🧗‍♀️ The API endpoint used here returns stale data

We need to switch to the v2 endpoint which includes real-time updates.
```

### B. References

- [Conventional Comments](https://conventionalcomments.org/)
- [Netlify Feedback Ladders](https://www.netlify.com/blog/2020/03/05/feedback-ladders-how-we-encode-code-reviews-at-netlify/)
- [WebExtensions API Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)

---

**Document Status:** Ready for Review  
**Next Steps:** Review with stakeholders, incorporate feedback, begin Phase 1 development
