# Review Format Kit (RFK)

The Review Format Kit (RFK) is a browser extension for standardizing code review comments using conventions like [Conventional Comments](https://conventionalcomments.org/) and [Netlify Feedback Ladders](https://www.netlify.com/blog/2020/03/05/feedback-ladders-how-we-encode-code-reviews-at-netlify/).

## Features

- 📝 **Pre-configured Conventions**: Ships with Conventional Comments and Netlify Feedback Ladders
- 🎯 **Custom Groups**: Create your own convention sets 
- 🔄 **Team Sync**: Share configurations via JSON URL
- ⌨️ **Keyboard Shortcuts**: Quick access with `Cmd+Shift+/`
- 🎨 **Visual Templates**: See examples before inserting
- 🧪 **Fully Tested**: 80%+ code coverage

## Installation

### From Source (Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/review-format-kit.git
   cd review-format-kit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` directory

## Development

### Prerequisites

- Node.js 18+ 
- npm 8+

### Setup

```bash
npm install
```

### Available Scripts

```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Type check
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for TDD
npm run test:watch

# Coverage report
npm run test:coverage
```

Expected coverage thresholds:
- Overall: ≥80%
- Critical paths (storage, config, import/export): 100%

### Project Structure

```
review-format-kit/
├── src/
│   ├── background/        # Background service worker
│   ├── content/           # Content scripts for GitHub
│   ├── popup/             # Extension popup UI
│   ├── options/           # Settings page
│   ├── lib/               # Core logic
│   │   ├── types.ts       # TypeScript types
│   │   ├── storage.ts     # Storage layer
│   │   ├── config.ts      # Config management
│   │   ├── defaults.ts    # Default conventions
│   │   ├── import-export.ts # JSON import/export
│   │   └── __tests__/     # Unit tests
│   └── test/              # Test setup
├── public/                # Static assets
│   └── manifest.json      # Extension manifest
├── dist/                  # Build output
└── coverage/              # Test coverage reports
```

## Usage

1. **Navigate to a GitHub Pull Request**
2. **Click inside a comment textarea**
3. **Click the convention icon** (top-right of textarea) or press `Cmd+Shift+/`
4. **Select a convention** from the dropdown
5. **Fill in the template** placeholders
6. **Submit your comment**

## Configuration

### Adding Custom Conventions

1. Click the extension icon in browser toolbar
2. Click "Open Settings"
3. Go to "Convention Groups"
4. Click "+ Create New Group"
5. Add conventions with labels and templates

### Team Configuration Sync

1. Export your configuration:
   - Open Settings → Export Groups
   - Upload JSON to accessible URL
2. Team members import:
   - Open Settings → Remote Config
   - Enter JSON URL → Sync

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes with tests
4. Run tests: `npm test`
5. Lint and format: `npm run lint && npm run format`
6. Commit: `git commit -m "feat: my feature"`
7. Push and create PR

## License

MIT License - see [LICENSE](LICENSE) for details

## Roadmap

- [x] Phase 1: Core Foundation (TypeScript, Vite, Vitest)
- [ ] Phase 2: GitHub Integration
- [ ] Phase 3: Convention Dropdown UI
- [ ] Phase 4: Extension UI (Popup, Options)
- [ ] Phase 5: Team Sync Features
- [ ] Phase 6: Chrome/Firefox Release
- [ ] v2.0: GitLab Support
- [ ] v2.0: Auto-detect convention by repo

## Support

- 🐛 [Report Bug](https://github.com/yourusername/review-format-kit/issues)
- 💡 [Request Feature](https://github.com/yourusername/review-format-kit/issues)
- 📖 [Documentation](https://github.com/yourusername/review-format-kit/wiki)

## Acknowledgments

- [Conventional Comments](https://conventionalcomments.org/)
- [Netlify Feedback Ladders](https://www.netlify.com/blog/2020/03/05/feedback-ladders-how-we-encode-code-reviews-at-netlify/)
