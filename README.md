# Comment Craft

**Craft beautiful and professional code comments with intelligent highlighting, generation, and formatting**

Comment Craft is a powerful VS Code extension that enhances your code commenting experience by combining intelligent comment highlighting with automated comment generation and formatting. Create more human-friendly, well-structured comments that improve code readability and maintainability.

![Comment Craft](images/icon.png)

## ✨ Features

### 🎨 Intelligent Comment Highlighting

Transform your comments into visually categorized annotations:

- **Alerts** (`!`) - Highlight important warnings and critical information
- **Queries** (`?`) - Mark questions and areas that need clarification
- **TODOs** (`todo`) - Track tasks and future improvements
- **Highlights** (`*`) - Emphasize important information
- **Commented Code** (`//`) - Clearly distinguish commented-out code

### 📝 Comment Generation

Automatically generate professional comments for your code:

- **Smart Detection** - Automatically detects functions, classes, and variables
- **Multiple Styles** - Support for standard, JSDoc, JavaDoc, and Doxygen formats
- **Language Aware** - Uses appropriate comment syntax for each programming language
- **Context Sensitive** - Generates relevant comments based on code structure

### 🔧 Comment Formatting

Format existing comments for consistency:

- **Auto-formatting** - Automatically format comments after generation
- **Consistent Spacing** - Ensures proper spacing and indentation
- **Style Preservation** - Maintains your preferred comment style

### 🌍 Multi-Language Support

Works seamlessly with **100+ programming languages** including:

JavaScript, TypeScript, Python, Java, C/C++, C#, Ruby, Go, Rust, PHP, Swift, Kotlin, HTML, CSS, SCSS, XML, YAML, and many more!

The extension automatically detects language configurations from VS Code and installed language extensions, ensuring broad compatibility.

## 🚀 Quick Start

### Installation

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Comment Craft"
4. Click **Install**

### Basic Usage

#### Generate a Comment

1. Select the code you want to comment
2. Right-click and choose **Comment Craft: Generate Comment**
   - Or use Command Palette: `Ctrl+Shift+P` → "Comment Craft: Generate Comment"
   - Or use keyboard shortcut: `Ctrl+Alt+C` (Windows/Linux) or `Cmd+Alt+C` (Mac)

#### Format Comments

1. Open a file with comments
2. Right-click and choose **Comment Craft: Format Comments**
   - Or use Command Palette: `Ctrl+Shift+P` → "Comment Craft: Format Comments"

#### Use Comment Highlighting

Simply add special tags to your comments:

```javascript
// ! This is an alert - important information
// ? This is a query - needs clarification
// TODO: This is a todo item
// * This is a highlight - important note
// // This is commented out code
```

## ⚙️ Configuration

Configure Comment Craft in your VS Code settings (`File` → `Preferences` → `Settings` or `Ctrl+,`):

### Comment Generation Settings

```json
{
  "commentCraft.style": "jsdoc",  // Options: "standard", "javadoc", "jsdoc", "doxygen"
  "commentCraft.autoFormat": true  // Auto-format comments after generation
}
```

### Comment Highlighting Settings

```json
{
  "commentCraft.multilineComments": true,      // Enable multiline comment highlighting
  "commentCraft.highlightPlainText": false,     // Enable highlighting in plain text files
  "commentCraft.tags": [
    {
      "tag": "!",
      "color": "#FF2D00",
      "strikethrough": false,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    },
    {
      "tag": "?",
      "color": "#3498DB",
      "strikethrough": false,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    },
    {
      "tag": "//",
      "color": "#474747",
      "strikethrough": true,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    },
    {
      "tag": "todo",
      "color": "#FF8C00",
      "strikethrough": false,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    },
    {
      "tag": "*",
      "color": "#98C379",
      "strikethrough": false,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    }
  ]
}
```

### Customizing Tags

You can customize existing tags or add new ones:

- **tag**: The character or sequence to mark comments (e.g., `!`, `?`, `todo`, `*`, `//`)
- **color**: Hex color code for the tag
- **strikethrough**: Apply strikethrough styling
- **underline**: Apply underline styling
- **bold**: Make the tag bold
- **italic**: Make the tag italic
- **backgroundColor**: Background color for the tag

**Note**: Changes to tags require a VS Code restart to take effect.

## 📋 Supported Languages

Comment Craft supports **100+ programming languages** including:

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

### Web Technologies
- HTML / XML
- CSS / SCSS / Sass / Less
- Vue.js
- Svelte

### Data & Config
- JSON / JSONC
- YAML
- TOML
- Markdown

### Other Languages
- Shell Script (Bash, PowerShell)
- SQL / PL/SQL
- R
- MATLAB
- Lua
- Perl
- Haskell
- Elixir
- And many more!

The extension automatically detects language configurations from VS Code and installed language extensions, ensuring compatibility with virtually any language.

## 🎯 Use Cases

### Code Documentation
Generate comprehensive documentation for functions, classes, and modules with a single command.

### Code Review
Use highlighted comments to mark areas that need attention during code reviews.

### Task Management
Track TODOs and future improvements directly in your code with visual highlighting.

### Code Maintenance
Clearly mark commented-out code to prevent accidental use.

### Team Collaboration
Use query tags to ask questions and alert tags to highlight important information for your team.

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

## 📦 Publishing

To publish the extension to the VS Code Marketplace:

1. Install `vsce`: `npm install -g @vscode/vsce`
2. Login to the marketplace: `vsce login <publisher-name>`
3. Package the extension: `vsce package`
4. Publish: `vsce publish`

For more information, see the [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extensions) guide.

## 🤝 Contributing

Contributions are welcome! We appreciate your help in making Comment Craft better.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/mdtanvirahamedshanto/comment-craft/issues) on GitHub.

## 📚 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and version history.

## 🙏 Acknowledgments

Comment Craft combines the best features from comment highlighting and automated comment generation to provide a comprehensive commenting solution for VS Code.

## 📧 Contact

- **Author**: Md Tanvir Ahamed Shanto
- **GitHub**: [@mdtanvirahamedshanto](https://github.com/mdtanvirahamedshanto)
- **Repository**: [comment-craft](https://github.com/mdtanvirahamedshanto/comment-craft)

---

**Made with ❤️ for developers who care about code quality and documentation**

**Enjoy crafting beautiful comments!** 🎨✨
