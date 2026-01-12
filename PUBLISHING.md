# Publishing Guide for Comment Craft

This guide will help you publish the Comment Craft extension to the VS Code Marketplace.

## Prerequisites

1. **Create a Publisher Account**
   - Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
   - Sign in with your Microsoft account or GitHub account
   - Create a new publisher (if you don't have one)
   - Note your publisher ID (you'll need this)

2. **Install vsce (VS Code Extension Manager)**
   ```bash
   npm install -g @vscode/vsce
   ```

3. **Get a Personal Access Token**
   - Go to [Azure DevOps](https://dev.azure.com)
   - Sign in with the same account used for the marketplace
   - Go to User Settings → Personal Access Tokens
   - Create a new token with "Marketplace (Manage)" scope
   - Save the token securely

## Setup Steps

### 1. Update package.json

Before publishing, make sure to update these fields in `package.json`:

- `publisher`: Change `"yourpublishername"` to your actual publisher ID
- `repository.url`: Update with your actual GitHub repository URL
- `bugs.url`: Update with your repository issues URL
- `homepage`: Update with your repository homepage

### 2. Create Extension Icon

Create an icon for your extension:
- Create a folder: `images/`
- Add an icon file: `images/icon.png`
- Recommended size: 128x128 pixels
- Format: PNG with transparency

### 3. Login to Marketplace

```bash
vsce login <your-publisher-name>
```

Enter your Personal Access Token when prompted.

## Publishing

### First Time Publishing

1. **Package the extension:**
   ```bash
   vsce package
   ```
   This creates a `.vsix` file.

2. **Publish to Marketplace:**
   ```bash
   vsce publish
   ```

### Updating the Extension

1. **Update version in package.json:**
   - Follow [Semantic Versioning](https://semver.org/)
   - Update the `version` field (e.g., "0.1.0" → "0.1.1")

2. **Update CHANGELOG.md:**
   - Add a new entry for the version
   - Document all changes

3. **Publish:**
   ```bash
   vsce publish
   ```

### Publishing Options

- **Publish minor/patch version:** `vsce publish minor` or `vsce publish patch`
- **Publish with specific version:** `vsce publish 1.2.3`
- **Package without publishing:** `vsce package` (creates .vsix file)

## Verification

After publishing:

1. Wait a few minutes for the marketplace to update
2. Visit: `https://marketplace.visualstudio.com/items?itemName=<publisher>.<extension-name>`
3. Verify all information is correct
4. Test installation from the marketplace

## Troubleshooting

### Common Issues

1. **"Extension name already exists"**
   - Change the `name` field in package.json to something unique

2. **"Invalid publisher"**
   - Make sure you've created a publisher account
   - Verify the publisher ID matches exactly

3. **"Missing icon"**
   - Create the icon file at `images/icon.png`
   - Or remove the `icon` field from package.json temporarily

4. **"Version already exists"**
   - Increment the version number in package.json

## Resources

- [Publishing Extensions Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extensions)
- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/vscode)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)

## Checklist Before Publishing

- [ ] Updated publisher name in package.json
- [ ] Updated repository URLs in package.json
- [ ] Created extension icon (images/icon.png)
- [ ] Updated README.md with correct information
- [ ] Updated CHANGELOG.md with version history
- [ ] Tested extension locally (F5)
- [ ] Compiled without errors (`npm run compile`)
- [ ] No linting errors (`npm run lint`)
- [ ] Version number is correct
- [ ] All dependencies are listed correctly

---

Good luck with your publication! 🚀

