# Comment Craft

**Craft beautiful and professional code comments with ease**

Comment Craft is a VS Code extension that helps you generate and format code comments effortlessly. Whether you're writing documentation, adding function descriptions, or maintaining code clarity, Comment Craft has you covered.

## Features

- 🎨 **Generate Comments**: Automatically generate comments for selected code blocks
- 📝 **Format Comments**: Format existing comments for consistency
- 🎯 **Multiple Styles**: Support for standard, JSDoc, JavaDoc, and Doxygen comment styles
- ⚡ **Language Aware**: Automatically detects the programming language and uses appropriate comment syntax
- 🔧 **Configurable**: Customize comment styles and formatting preferences

## Usage

### Generate Comment

1. Select the code you want to comment
2. Right-click and choose **Comment Craft: Generate Comment** from the context menu
   - Or use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Or use the keyboard shortcut: `Ctrl+Alt+C` (Windows/Linux) or `Cmd+Alt+C` (Mac)

### Format Comments

1. Open a file with comments
2. Right-click and choose **Comment Craft: Format Comments**
   - Or use the Command Palette

## Configuration

You can configure Comment Craft in your VS Code settings:

- `commentCraft.style`: Choose comment style (`standard`, `javadoc`, `jsdoc`, `doxygen`)
- `commentCraft.autoFormat`: Automatically format comments after generation (default: `true`)

### Example Settings

```json
{
  "commentCraft.style": "jsdoc",
  "commentCraft.autoFormat": true
}
```

## Supported Languages

Comment Craft works with many programming languages including:
- JavaScript/TypeScript
- Java
- Python
- C/C++
- C#
- Ruby
- HTML/XML
- CSS/SCSS
- And more!

## Requirements

- VS Code version 1.108.0 or higher

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Comment Craft"
4. Click Install

### Manual Installation

1. Download the `.vsix` file from the [Releases](https://github.com/yourusername/comment-craft/releases) page
2. Open VS Code
3. Go to Extensions view
4. Click the `...` menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/comment-craft.git
cd comment-craft

# Install dependencies
npm install

# Compile the extension
npm run compile

# Watch for changes
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

## Publishing

To publish the extension to the VS Code Marketplace:

1. Install `vsce`: `npm install -g @vscode/vsce`
2. Login to the marketplace: `vsce login <publisher-name>`
3. Package the extension: `vsce package`
4. Publish: `vsce publish`

For more information, see the [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extensions) guide.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues

If you encounter any issues or have feature requests, please [open an issue](https://github.com/yourusername/comment-craft/issues) on GitHub.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

**Enjoy crafting beautiful comments!** 🎨✨

