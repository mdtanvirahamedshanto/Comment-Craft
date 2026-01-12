# Publishing Guide for Comment Craft

This guide will help you publish the Comment Craft extension to the VS Code Marketplace.

## Prerequisites

1. **Create a Publisher Account**
   - Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
   - Sign in with your Microsoft account or GitHub account
   - Create a new publisher (if you don't have one)
   - Note your publisher ID (you'll need this)
   - **Current Publisher ID**: `mdtanvirahamedshanto`

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

### 1. Verify package.json

Before publishing, verify these fields in `package.json`:

- ✅ `publisher`: `"mdtanvirahamedshanto"` (already configured)
- ✅ `repository.url`: `"https://github.com/mdtanvirahamedshanto/comment-craft.git"` (already configured)
- ✅ `bugs.url`: `"https://github.com/mdtanvirahamedshanto/comment-craft/issues"` (already configured)
- ✅ `homepage`: `"https://github.com/mdtanvirahamedshanto/comment-craft#readme"` (already configured)
- ✅ `author.name`: `"Md Tanvir Ahamed Shanto"` (already configured)

### 2. Verify Extension Icon

Ensure the extension icon exists:
- Path: `images/icon.png`
- Recommended size: 128x128 pixels
- Format: PNG with transparency

### 3. Login to Marketplace

```bash
vsce login mdtanvirahamedshanto
```

Enter your Personal Access Token when prompted.

## Publishing

### First Time Publishing

1. **Package the extension:**
   ```bash
   vsce package
   ```
   This creates a `.vsix` file that you can test locally or distribute.

2. **Test the package locally (optional):**
   ```bash
   code --install-extension comment-craft-0.1.0.vsix
   ```

3. **Publish to Marketplace:**
   ```bash
   vsce publish
   ```

### Updating the Extension

1. **Update version in package.json:**
   - Follow [Semantic Versioning](https://semver.org/)
   - Update the `version` field (e.g., "0.1.0" → "0.1.1" for patch, "0.2.0" for minor, "1.0.0" for major)

2. **Update CHANGELOG.md:**
   - Add a new entry for the version
   - Document all changes, features, and bug fixes
   - Follow the format: `## [Version] - YYYY-MM-DD`

3. **Publish:**
   ```bash
   vsce publish
   ```

### Publishing Options

- **Publish minor version:** `vsce publish minor`
- **Publish patch version:** `vsce publish patch`
- **Publish major version:** `vsce publish major`
- **Publish with specific version:** `vsce publish 1.2.3`
- **Package without publishing:** `vsce package` (creates .vsix file)

## Verification

After publishing:

1. Wait a few minutes for the marketplace to update (usually 2-5 minutes)
2. Visit: `https://marketplace.visualstudio.com/items?itemName=mdtanvirahamedshanto.comment-craft`
3. Verify all information is correct:
   - Extension name and description
   - Screenshots (if added)
   - Repository links
   - Version number
4. Test installation from the marketplace in a clean VS Code instance

## Troubleshooting

### Common Issues

1. **"Extension name already exists"**
   - The name `comment-craft` might be taken
   - Change the `name` field in package.json to something unique
   - Consider: `comment-craft-pro`, `comment-craft-plus`, or add your initials

2. **"Invalid publisher"**
   - Make sure you've created a publisher account at marketplace.visualstudio.com
   - Verify the publisher ID matches exactly: `mdtanvirahamedshanto`
   - Check for typos or case sensitivity issues

3. **"Missing icon"**
   - Create the icon file at `images/icon.png`
   - Or temporarily remove the `icon` field from package.json
   - Recommended: Always include an icon for better marketplace presence

4. **"Version already exists"**
   - Increment the version number in package.json
   - Follow semantic versioning (major.minor.patch)

5. **"Missing README"**
   - Ensure README.md exists in the root directory
   - Check that it's not empty and contains proper markdown

6. **"Package too large"**
   - Remove unnecessary files from the package
   - Check `.vscodeignore` file
   - Exclude `node_modules`, test files, and build artifacts

## Resources

- [Publishing Extensions Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extensions)
- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/vscode)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [Semantic Versioning](https://semver.org/)

## Pre-Publishing Checklist

Before publishing, ensure:

- [x] Publisher name is set: `mdtanvirahamedshanto`
- [x] Repository URLs are correct
- [x] Author information is correct
- [ ] Extension icon exists (`images/icon.png`)
- [ ] README.md is complete and professional
- [ ] CHANGELOG.md has current version entry
- [ ] Extension tested locally (F5)
- [ ] Compiled without errors (`npm run compile`)
- [ ] No linting errors (`npm run lint`)
- [ ] Version number follows semantic versioning
- [ ] All dependencies are listed correctly
- [ ] `.vscodeignore` excludes unnecessary files
- [ ] All features are documented
- [ ] Configuration options are explained

## Post-Publishing

After successful publication:

1. **Share your extension:**
   - Update your GitHub repository with marketplace badge
   - Share on social media
   - Add to your portfolio

2. **Monitor feedback:**
   - Check marketplace reviews
   - Respond to issues on GitHub
   - Consider user feedback for future updates

3. **Maintain the extension:**
   - Fix bugs promptly
   - Add requested features
   - Keep dependencies updated
   - Maintain documentation

---

**Publisher**: Md Tanvir Ahamed Shanto  
**Publisher ID**: mdtanvirahamedshanto  
**Repository**: [comment-craft](https://github.com/mdtanvirahamedshanto/comment-craft)

Good luck with your publication! 🚀
