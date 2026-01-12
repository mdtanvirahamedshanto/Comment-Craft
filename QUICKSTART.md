# Quick Start Guide

Get your Comment Craft extension up and running in minutes!

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Compile the Extension**
   ```bash
   npm run compile
   ```

3. **Test the Extension**
   - Press `F5` in VS Code to launch Extension Development Host
   - In the new window, open a file with code
   - Test comment highlighting by adding tags like `// !`, `// ?`, `// TODO:`, etc.
   - Test comment generation: Select some code and right-click → "Comment Craft: Generate Comment"
   - Or use keyboard shortcut: `Ctrl+Alt+C` (Windows/Linux) or `Cmd+Alt+C` (Mac)

## Features Overview

### Comment Highlighting
The extension automatically highlights comments with special tags:
- `// !` - Alerts (red)
- `// ?` - Queries (blue)
- `// TODO:` - TODOs (orange)
- `// *` - Highlights (green)
- `// //` - Commented code (gray, strikethrough)

### Comment Generation
- Select code and generate comments automatically
- Supports multiple styles: standard, JSDoc, JavaDoc, Doxygen
- Language-aware comment syntax

### Comment Formatting
- Format existing comments for consistency
- Maintains proper spacing and indentation

## Development Workflow

### Watch Mode (Auto-compile)
```bash
npm run watch
```
This will automatically recompile when you make changes.

### Linting
```bash
npm run lint
```

### Running Tests
```bash
npm test
```

## Configuration

You can configure Comment Craft in VS Code settings:

1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Comment Craft"
3. Configure:
   - Comment style (standard, javadoc, jsdoc, doxygen)
   - Auto-formatting
   - Multiline comment highlighting
   - Plain text highlighting
   - Custom tags and colors

## Before Publishing

1. **Update package.json:**
   - Publisher is already set to: `mdtanvirahamedshanto`
   - Repository URLs are configured
   - Verify version if needed

2. **Add Extension Icon:**
   - Ensure `images/icon.png` exists (128x128 PNG recommended)

3. **Review Documentation:**
   - README.md is updated with all features
   - CHANGELOG.md includes version history
   - All repository links are correct

4. **Test Everything:**
   - Run the extension (F5)
   - Test comment highlighting with various tags
   - Test comment generation for different code types
   - Test comment formatting
   - Verify all settings work
   - Check for errors in the console

## Next Steps

- See [PUBLISHING.md](PUBLISHING.md) for publishing instructions
- Read [README.md](README.md) for comprehensive user documentation
- Check [VS Code Extension API Docs](https://code.visualstudio.com/api) for more features

## Troubleshooting

### Extension Not Highlighting Comments
- Make sure the file language is supported
- Check that multiline comments are enabled in settings
- Restart VS Code after changing tag configurations

### Comment Generation Not Working
- Ensure you have selected code before running the command
- Check that the language is supported
- Verify the extension is activated (check Output panel)

### Compilation Errors
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version is compatible
- Verify tsconfig.json is correct

Happy coding! 🚀
