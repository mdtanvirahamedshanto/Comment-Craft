# Comment Craft

<div align="center">

![Comment Craft](images/icon.png)

**Craft beautiful and professional code comments with intelligent highlighting, generation, and formatting**

[![VS Code Version](https://img.shields.io/badge/VS%20Code-1.108.0+-blue.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-orange.svg)](package.json)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

Comment Craft is a powerful VS Code extension that transforms code commenting into a seamless, intelligent experience. It combines advanced comment highlighting, automated comment generation, comprehensive tag management, and professional documentation tools to help developers create better-documented, more maintainable code.

### Why Comment Craft?

- 🎨 **Visual Comment Highlighting** - Instantly identify different types of comments with color-coded tags
- 🤖 **Smart Comment Generation** - Automatically generate professional comments for functions, classes, and code blocks
- 📊 **Comprehensive Analytics** - Track and analyze comments across your entire workspace
- 🔍 **Advanced Search & Filter** - Find comments quickly with powerful search capabilities
- ✅ **Validation & Coverage** - Ensure your code is properly documented
- 🎯 **Template System** - Use pre-built templates for consistent documentation
- 🔔 **Smart Reminders** - Never forget important TODOs and FIXMEs
- 🌍 **100+ Language Support** - Works with virtually any programming language

---

## ✨ Features

### 🎨 Intelligent Comment Highlighting

Transform your comments into visually categorized annotations with support for 11+ default tags:

- **TODO** - Track tasks and future improvements
- **FIXME** - Mark code that needs fixing
- **BUG** - Identify known bugs
- **NOTE** - Important information
- **HACK** - Temporary workarounds
- **OPTIMIZE** - Performance improvements needed
- **URGENT** - Critical items requiring immediate attention
- **REVIEW** - Code that needs review
- **DEPRECATED** - Outdated code
- **DONE** - Completed tasks
- **COMPLETE** - Finished items

**Visual Features:**
- Color-coded tags with customizable styling
- Gutter markers for quick scanning
- Overview ruler indicators
- High-contrast mode for accessibility
- Customizable colors, fonts, and backgrounds

### 📝 Smart Comment Generation

Automatically generate professional comments with multiple styles:

- **Standard Comments** - Simple, clean documentation
- **JSDoc Style** - JavaScript/TypeScript documentation format
- **JavaDoc Style** - Java documentation format
- **Doxygen Style** - C/C++ documentation format

**Features:**
- Language-aware comment syntax
- Context-sensitive generation
- Auto-formatting support
- Function and class detection

### 🎯 Comment Templates

Pre-built templates for common documentation patterns:

- Function Documentation (JSDoc)
- Class Documentation
- TODO with Assignee
- FIXME with Priority
- Deprecation Warnings
- Performance Notes
- Security Warnings

**Usage:** `Comment Craft: Insert Comment Template`

### 📊 Statistics Dashboard

Comprehensive analytics for your codebase:

- Total tag counts
- Tags by type with percentages
- Top files with most tags
- Average tags per file
- Visual progress bars and charts

**Usage:** `Comment Craft: Show Comment Statistics`

### 🔍 Advanced Search

Powerful search capabilities:

- Quick search with regex support
- Advanced search with multiple filters:
  - Tag selection
  - File pattern matching
  - Text pattern matching
- Direct navigation to results

**Commands:**
- `Comment Craft: Search Comments`
- `Comment Craft: Advanced Comment Search`

### ✅ Comment Validation

Ensure code quality with validation:

- Detects functions/classes without documentation
- Flags TODO/FIXME without assignee or date
- Finds commented-out code
- Shows results in Problems panel

**Commands:**
- `Comment Craft: Validate Comments in File`
- `Comment Craft: Validate Comments in Workspace`

### 📋 Tag Management

Complete tag lifecycle management:

- **Tree View** - Navigate tags by type or file
- **Status Bar** - Real-time tag counts
- **CodeLens** - Inline actions for tags
- **Mark as Done** - Track completed items
- **Export** - Export to JSON, CSV, or Markdown
- **Filter** - Filter tags by various criteria

### 🔔 Smart Reminders

Never miss important items:

- Reminders for URGENT tags
- Notifications for old TODO items
- Configurable intervals
- Non-intrusive notifications

### 💬 Comment Snippets

Auto-completion snippets for quick comment insertion:

- `todo` - TODO comment
- `fixme` - FIXME comment
- `note` - NOTE comment
- `bug` - BUG comment
- `hack` - HACK comment
- `jsdoc` - JSDoc documentation
- `deprecated` - Deprecation notice
- `performance` - Performance note
- `security` - Security warning

### 🔗 Integrations

Seamless integration with development tools:

- **GitHub** - Create issues from tags
- **Jira** - Create tickets from tags
- **Export** - Export to multiple formats
- **CI/CD** - Workspace scanning for pipelines

---

## 🚀 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Comment Craft"
4. Click **Install**

### From VSIX File

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view
4. Click the `...` menu → "Install from VSIX..."
5. Select the downloaded file

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/mdtanvirahamedshanto/comment-craft.git
cd comment-craft

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension
npm install -g @vscode/vsce
vsce package
```

---

## 🎯 Quick Start

### 1. Generate a Comment

1. Select the code you want to comment
2. Right-click → **Comment Craft: Generate Comment**
   - Or use Command Palette: `Ctrl+Shift+P` → "Comment Craft: Generate Comment"
   - Or use keyboard shortcut: `Ctrl+Alt+C` (Windows/Linux) or `Cmd+Alt+C` (Mac)

### 2. Use Comment Highlighting

Simply add tags to your comments:

```javascript
// TODO: Implement user authentication
// FIXME: Memory leak in this function
// NOTE: This is a workaround for issue #123
// BUG: Crashes on empty input
// HACK: Temporary solution, needs refactoring
// OPTIMIZE: This loop can be optimized
// URGENT: Security vulnerability - fix immediately
// REVIEW: Needs code review before merge
// DEPRECATED: Use newFunction() instead
```

### 3. Navigate Tags

- **Tree View** - Open the Comment Craft sidebar to see all tags
- **Jump to Next/Previous** - Use `Ctrl+Alt+N` / `Ctrl+Alt+P`
- **List Tags in File** - Click status bar or use command

### 4. Use Templates

1. Place cursor where you want the comment
2. Run `Comment Craft: Insert Comment Template`
3. Select template type
4. Fill in placeholders

### 5. View Statistics

Run `Comment Craft: Show Comment Statistics` to see comprehensive analytics

---

## ⚙️ Configuration

Configure Comment Craft in VS Code settings (`File` → `Preferences` → `Settings` or `Ctrl+,`):

### Basic Settings

```json
{
  "commentCraft.enabled": true,
  "commentCraft.style": "jsdoc",
  "commentCraft.autoFormat": true,
  "commentCraft.matchOnlyInComments": true
}
```

### Tag Highlighting

```json
{
  "commentCraft.multilineComments": true,
  "commentCraft.highlightPlainText": false,
  "commentCraft.showGutterMarkers": true,
  "commentCraft.showOverviewRuler": true,
  "commentCraft.enableHighContrast": false,
  "commentCraft.tags": [
    {
      "tag": "TODO",
      "pattern": "\\bTODO\\b[:\\s]?",
      "color": "#d19a66",
      "backgroundColor": "transparent",
      "bold": true,
      "italic": false,
      "strikethrough": false,
      "underline": false
    }
  ]
}
```

### Navigation & UI

```json
{
  "commentCraft.showInStatusBar": true,
  "commentCraft.enableTreeView": true,
  "commentCraft.enableCodeLens": true
}
```

### Workspace Scanning

```json
{
  "commentCraft.scanWorkspaceOnOpen": false,
  "commentCraft.matchOnlyInComments": true
}
```

### Reminders

```json
{
  "commentCraft.enableReminders": false,
  "commentCraft.reminderInterval": 60,
  "commentCraft.reminderDaysThreshold": 7
}
```

### Integrations

```json
{
  "commentCraft.githubIntegration": false,
  "commentCraft.jiraIntegration": false
}
```

### Privacy

```json
{
  "commentCraft.telemetry": false
}
```

---

## 📋 Supported Languages

Comment Craft supports **150+ programming languages** including:

### Popular Languages
- JavaScript / TypeScript / JSX / TSX
- Python
- Java
- C / C++ / C#
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- Dart
- Scala
- F#

### Web Technologies
- HTML / XML / XHTML
- CSS / SCSS / Sass / Less / Stylus
- Vue.js / Svelte / Angular
- React / JSX

### Data & Config
- JSON / JSONC / JSON5
- YAML
- TOML
- Markdown
- INI / Properties

### Scripting
- Shell Script (Bash, Zsh, Fish, PowerShell)
- Python
- Perl
- Ruby
- Lua

### Database
- SQL / PL/SQL / T-SQL
- MySQL / PostgreSQL
- PL/pgSQL

### Functional
- Haskell
- Elixir
- Elm
- PureScript
- Clojure / ClojureScript

### Systems
- Assembly (x86, ARM, MIPS, RISC-V)
- Verilog / SystemVerilog / VHDL
- CUDA / HLSL / GLSL

### Legacy
- COBOL
- Fortran
- Pascal / Delphi
- VB / VBScript

And many more! The extension automatically detects language configurations from VS Code and installed language extensions.

---

## 🎮 Commands

### Core Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Comment Craft: Generate Comment` | Generate comment for selected code | `Ctrl+Alt+C` |
| `Comment Craft: Format Comments` | Format comments in current file | - |
| `Comment Craft: Insert Comment Template` | Insert a comment template | - |

### Navigation Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Comment Craft: Jump to Next Tag` | Jump to next tag in file | `Ctrl+Alt+N` |
| `Comment Craft: Jump to Previous Tag` | Jump to previous tag | `Ctrl+Alt+P` |
| `Comment Craft: List Tags in File` | Show all tags in current file | - |
| `Comment Craft: Toggle Tag Visibility` | Enable/disable tag highlighting | - |

### Tag Management

| Command | Description |
|---------|-------------|
| `Comment Craft: Mark Tag as Done` | Mark selected tag as done |
| `Comment Craft: Export Tags` | Export tags to file |
| `Comment Craft: Scan Workspace` | Scan entire workspace for tags |
| `Comment Craft: Refresh Tag Tree` | Refresh the tag tree view |
| `Comment Craft: Filter Tags` | Filter tags in tree view |
| `Comment Craft: Clear Filter` | Clear active filter |

### Search & Analysis

| Command | Description |
|---------|-------------|
| `Comment Craft: Search Comments` | Quick search in comments |
| `Comment Craft: Advanced Comment Search` | Advanced search with filters |
| `Comment Craft: Show Comment Statistics` | Show statistics dashboard |

### Validation

| Command | Description |
|---------|-------------|
| `Comment Craft: Validate Comments in File` | Validate current file |
| `Comment Craft: Validate Comments in Workspace` | Validate entire workspace |

### Integrations

| Command | Description |
|---------|-------------|
| `Comment Craft: Create GitHub Issue` | Create GitHub issue from tag |
| `Comment Craft: Create Jira Ticket` | Create Jira ticket from tag |

---

## 📚 Documentation

### Feature Documentation

- **[Features Implementation](FEATURES_IMPLEMENTED.md)** - Complete list of implemented features
- **[Additional Features](ADDITIONAL_FEATURES.md)** - Documentation for advanced features
- **[Feature List](featurelist.md)** - Original feature requirements

### Usage Examples

#### Example 1: Function Documentation

```javascript
// Before
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
}

// After using Comment Craft
/**
 * Calculates the total price of all items
 * @param {Array} items - Array of items with price property
 * @returns {number} Total price
 */
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### Example 2: Tag Highlighting

```javascript
// TODO(@john): Add error handling
// FIXME: Memory leak - needs investigation
// NOTE: This is a workaround for browser compatibility
// BUG: Crashes when input is null
// HACK: Temporary solution until API is fixed
// OPTIMIZE: O(n²) can be reduced to O(n log n)
// URGENT: Security vulnerability - patch immediately
```

#### Example 3: Using Templates

1. Place cursor above function
2. Run `Comment Craft: Insert Comment Template`
3. Select "Function Documentation"
4. Fill in placeholders:
   - Description: "Calculates user score"
   - Param: "userId"
   - Type: "string"
   - Return Type: "number"

---

## 🎯 Use Cases

### Code Documentation
Generate comprehensive documentation for functions, classes, and modules with a single command.

### Code Review
Use highlighted comments to mark areas that need attention during code reviews.

### Task Management
Track TODOs and future improvements directly in your code with visual highlighting.

### Code Maintenance
Clearly mark commented-out code and deprecated functions to prevent accidental use.

### Team Collaboration
Use query tags to ask questions and alert tags to highlight important information for your team.

### Quality Assurance
Validate documentation coverage and ensure all code is properly documented.

### Project Analytics
Track comment patterns and identify areas that need more documentation.

---

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- VS Code 1.108.0 or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/mdtanvirahamedshanto/comment-craft.git
cd comment-craft

# Install dependencies
npm install

# Compile the extension
npm run compile

# Watch for changes during development
npm run watch
```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to launch a new Extension Development Host window
3. Test the extension in the new window

### Building for Production

```bash
# Install vsce (VS Code Extension manager)
npm install -g @vscode/vsce

# Package the extension
vsce package
```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

---

## 📦 Publishing

To publish the extension to the VS Code Marketplace:

1. Install `vsce`: `npm install -g @vscode/vsce`
2. Login to the marketplace: `vsce login <publisher-name>`
3. Package the extension: `vsce package`
4. Publish: `vsce publish`

For more information, see the [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extensions) guide.

---

## 🤝 Contributing

Contributions are welcome! We appreciate your help in making Comment Craft better.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow semantic versioning

### Reporting Issues

If you encounter any issues or have feature requests, please [open an issue](https://github.com/mdtanvirahamedshanto/comment-craft/issues) on GitHub.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🐛 Issues & Support

- **Bug Reports**: [Open an issue](https://github.com/mdtanvirahamedshanto/comment-craft/issues)
- **Feature Requests**: [Open an issue](https://github.com/mdtanvirahamedshanto/comment-craft/issues)
- **Questions**: [Open a discussion](https://github.com/mdtanvirahamedshanto/comment-craft/discussions)

---

## 📚 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and version history.

### Version 0.1.0 (Current)

- ✨ Initial release
- 🎨 Comment highlighting with 11+ default tags
- 📝 Smart comment generation
- 🔧 Comment formatting
- 📊 Statistics dashboard
- 🔍 Advanced search
- ✅ Comment validation
- 🎯 Template system
- 💬 Comment snippets
- 🔔 Smart reminders
- 🌍 150+ language support
- 🔗 GitHub and Jira integration
- 📋 Tag management tree view
- 🎨 Gutter markers and overview ruler
- ♿ High-contrast mode
- 🔒 Privacy-first design

---

## 🙏 Acknowledgments

Comment Craft combines the best features from comment highlighting and automated comment generation to provide a comprehensive commenting solution for VS Code.

Special thanks to:
- VS Code team for the excellent extension API
- All contributors and users
- The open-source community

---

## 📧 Contact

- **Author**: Md Tanvir Ahamed Shanto
- **GitHub**: [@mdtanvirahamedshanto](https://github.com/mdtanvirahamedshanto)
- **Repository**: [comment-craft](https://github.com/mdtanvirahamedshanto/comment-craft)
- **Issues**: [GitHub Issues](https://github.com/mdtanvirahamedshanto/comment-craft/issues)

---

## ⭐ Show Your Support

If you find Comment Craft useful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code
- 📢 Sharing with others

---

<div align="center">

**Made with ❤️ for developers who care about code quality and documentation**

**Enjoy crafting beautiful comments!** 🎨✨

[⬆ Back to Top](#comment-craft)

</div>
