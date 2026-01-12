# Changelog

All notable changes to Comment Craft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### Added

#### Core Features
- ✨ Intelligent comment highlighting with 11+ default tags (TODO, FIXME, BUG, NOTE, HACK, OPTIMIZE, URGENT, REVIEW, DEPRECATED, DONE, COMPLETE)
- 🎨 Customizable tag colors, fonts, and styling options
- 📝 Smart comment generation with multiple styles (Standard, JSDoc, JavaDoc, Doxygen)
- 🔧 Automatic comment formatting
- 🌍 Support for 150+ programming languages
- 🎯 Language-aware comment syntax detection

#### Visual Enhancements
- 🎨 Gutter markers for quick tag scanning
- 📊 Overview ruler indicators
- ♿ High-contrast mode for accessibility
- 🎨 Customizable background colors and text decorations

#### Navigation & Management
- 📋 Tree view sidebar for tag navigation (grouped by tag or file)
- 🔍 Quick commands: Jump to next/previous tag, list tags in file
- 📊 Status bar widget with real-time tag counts
- 🔄 Toggle tag visibility on/off
- 📈 In-file inline tag counts

#### Tag Lifecycle
- ✅ Mark tags as done command
- 🔗 CodeLens with inline actions (Mark done, Create issue, etc.)
- 🔍 Search and filter tags with saved filter support
- 📤 Export tags to JSON, CSV, and Markdown formats

#### Advanced Features
- 🎯 Comment template system with 8+ pre-built templates
- 📊 Comprehensive statistics dashboard with visual analytics
- 🔍 Advanced search with regex and multiple filters
- ✅ Comment validation and coverage analysis
- 💬 Auto-completion snippets for quick comment insertion
- 🔔 Smart reminders for URGENT tags and old TODOs

#### Integrations
- 🔗 GitHub issue creation from tags
- 🔗 Jira ticket creation from tags
- 📤 Export functionality (JSON, CSV, Markdown)
- 🔄 Workspace scanning for CI/CD pipelines

#### Configuration
- ⚙️ Comprehensive settings for all features
- 🔒 Privacy-first design (workspace scan disabled by default)
- 📊 Configurable reminder intervals
- 🎨 Theme-aware color configuration
- 🔧 Per-language comment prefix detection

#### Developer Experience
- 📚 Comprehensive documentation
- 🧪 Test structure ready
- 🔧 Well-structured codebase
- 📝 TypeScript type definitions

### Technical Details

#### Files Created
- `src/tagTree.ts` - Tree view provider
- `src/tagScanner.ts` - Workspace scanner
- `src/statusBar.ts` - Status bar manager
- `src/codeLens.ts` - CodeLens provider
- `src/tagExporter.ts` - Export functionality
- `src/tagFilter.ts` - Filtering system
- `src/issueTracker.ts` - Issue tracker integration
- `src/commentTemplates.ts` - Template system
- `src/commentStatistics.ts` - Statistics dashboard
- `src/commentSearch.ts` - Advanced search
- `src/commentValidation.ts` - Validation engine
- `src/commentSnippets.ts` - Snippet provider
- `src/commentReminders.ts` - Reminder manager

#### Commands Added
- `commentCraft.generateComment` - Generate comment
- `commentCraft.formatComments` - Format comments
- `commentCraft.insertTemplate` - Insert template
- `commentCraft.jumpToNextTag` - Jump to next tag
- `commentCraft.jumpToPreviousTag` - Jump to previous tag
- `commentCraft.listTagsInFile` - List tags in file
- `commentCraft.toggleTagVisibility` - Toggle visibility
- `commentCraft.markAsDone` - Mark as done
- `commentCraft.exportTags` - Export tags
- `commentCraft.scanWorkspace` - Scan workspace
- `commentCraft.refreshTreeView` - Refresh tree
- `commentCraft.createGitHubIssue` - Create GitHub issue
- `commentCraft.createJiraTicket` - Create Jira ticket
- `commentCraft.filterTags` - Filter tags
- `commentCraft.clearFilter` - Clear filter
- `commentCraft.tagActions` - Tag actions menu
- `commentCraft.showStatistics` - Show statistics
- `commentCraft.searchComments` - Search comments
- `commentCraft.advancedSearch` - Advanced search
- `commentCraft.validateComments` - Validate file
- `commentCraft.validateWorkspace` - Validate workspace

#### Configuration Options
- `commentCraft.enabled` - Enable/disable extension
- `commentCraft.style` - Comment style (standard, jsdoc, javadoc, doxygen)
- `commentCraft.autoFormat` - Auto-format after generation
- `commentCraft.multilineComments` - Enable multiline highlighting
- `commentCraft.highlightPlainText` - Highlight in plain text
- `commentCraft.matchOnlyInComments` - Match only in comments
- `commentCraft.scanWorkspaceOnOpen` - Auto-scan on open
- `commentCraft.showInStatusBar` - Show status bar widget
- `commentCraft.enableTreeView` - Enable tree view
- `commentCraft.showGutterMarkers` - Show gutter markers
- `commentCraft.showOverviewRuler` - Show overview ruler
- `commentCraft.enableCodeLens` - Enable CodeLens
- `commentCraft.enableHighContrast` - High contrast mode
- `commentCraft.telemetry` - Telemetry opt-in
- `commentCraft.savedFilters` - Saved filter presets
- `commentCraft.githubIntegration` - GitHub integration
- `commentCraft.jiraIntegration` - Jira integration
- `commentCraft.enableReminders` - Enable reminders
- `commentCraft.reminderInterval` - Reminder interval
- `commentCraft.reminderDaysThreshold` - TODO reminder threshold
- `commentCraft.tags` - Custom tag configurations

### Changed
- Enhanced parser with regex pattern support
- Improved performance with debounced scanning
- Better language detection from VS Code extensions

### Security
- 🔒 Privacy-first defaults (workspace scan disabled by default)
- 🔒 Opt-in telemetry only
- 🔒 No data collection without explicit consent

---

## [Unreleased]

### Planned Features
- Unit and integration tests
- Extensibility API for other extensions
- Enhanced GitHub/Jira API integration with authentication
- CI output format for pipeline integration
- Per-language tag configuration UI
- Preset management UI
- Theme-aware color picker

---

## Version History

- **0.1.0** - Initial release with comprehensive feature set

---

For detailed feature documentation, see:
- [FEATURES_IMPLEMENTED.md](FEATURES_IMPLEMENTED.md)
- [ADDITIONAL_FEATURES.md](ADDITIONAL_FEATURES.md)
