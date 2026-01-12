#!/bin/bash

# Script to package and install Comment Craft extension locally for testing

echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo ""
echo "📦 Packaging Comment Craft extension..."
vsce package

if [ $? -eq 0 ]; then
    echo "✅ Package created successfully!"
    echo ""
    echo "🔧 Installing extension in VS Code..."
    code --install-extension comment-craft-0.1.0.vsix --force
    
    if [ $? -eq 0 ]; then
        echo "✅ Extension installed successfully!"
        echo ""
        echo "📝 Next steps:"
        echo "1. Reload VS Code window (Ctrl+Shift+P → 'Reload Window')"
        echo "2. Open a JavaScript file with comments like: // TODO: test"
        echo "3. Check if TODO is highlighted in orange/brown"
        echo ""
        echo "🔍 Debugging:"
        echo "   - Open Output panel: Ctrl+Shift+U"
        echo "   - Select 'Comment Craft' from dropdown"
        echo "   - Look for matching messages"
        echo ""
        echo "💡 If highlighting doesn't work:"
        echo "   - Check Settings: commentCraft.enabled = true"
        echo "   - Check Settings: commentCraft.multilineComments = true"
        echo "   - Make sure file language is detected (check bottom-right corner)"
        echo "   - Try restarting VS Code completely"
    else
        echo "❌ Failed to install extension"
    fi
else
    echo "❌ Failed to create package"
fi

