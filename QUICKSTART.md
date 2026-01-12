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
   - Select some code and right-click → "Comment Craft: Generate Comment"
   - Or use `Ctrl+Alt+C` (Windows/Linux) or `Cmd+Alt+C` (Mac)

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

## Before Publishing

1. **Update package.json:**
   - Change `"publisher": "yourpublishername"` to your actual publisher ID
   - Update repository URLs
   - Update version if needed

2. **Add Extension Icon:**
   - Create `images/icon.png` (128x128 PNG recommended)

3. **Review Documentation:**
   - Update README.md with your information
   - Update CHANGELOG.md with version history

4. **Test Everything:**
   - Run the extension (F5)
   - Test all commands
   - Verify settings work
   - Check for errors

## Next Steps

- See [PUBLISHING.md](PUBLISHING.md) for publishing instructions
- Read [README.md](README.md) for user documentation
- Check [VS Code Extension API Docs](https://code.visualstudio.com/api) for more features

Happy coding! 🚀

