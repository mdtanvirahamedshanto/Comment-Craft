import * as vscode from 'vscode';
import { Configuration } from './configuration';
import { Parser } from './parser';

/**
 * Activates the Comment Craft extension
 * @param context - The extension context
 */
export async function activate(context: vscode.ExtensionContext) {
    console.log('Comment Craft extension is now active!');

    // ===== Better Comments Feature (Comment Highlighting) =====
    let activeEditor: vscode.TextEditor;

    let configuration: Configuration = new Configuration();
    let parser: Parser = new Parser(configuration);

    // Called to handle events below
    let updateDecorations = function () {
        // if no active window is open, return
        if (!activeEditor) return;

        // if lanugage isn't supported, return
        if (!parser.supportedLanguage) return;

        // Finds the single line comments using the language comment delimiter
        parser.FindSingleLineComments(activeEditor);

        // Finds the multi line comments using the language comment delimiter
        parser.FindBlockComments(activeEditor);

        // Finds the jsdoc comments
        parser.FindJSDocComments(activeEditor);

        // Apply the styles set in the package.json
        parser.ApplyDecorations(activeEditor);
    };

    // Get the active editor for the first time and initialise the regex
    if (vscode.window.activeTextEditor) {
        activeEditor = vscode.window.activeTextEditor;

        // Set the regex patterns for the specified language's comments
        await parser.SetRegex(activeEditor.document.languageId);

        // Trigger first update of decorators
        triggerUpdateDecorations();
    }

    // * Handle extensions being added or removed
    vscode.extensions.onDidChange(() => {
        configuration.UpdateLanguagesDefinitions();
    }, null, context.subscriptions);

    // * Handle active file changed
    vscode.window.onDidChangeActiveTextEditor(async editor => {
        if (editor) {
            activeEditor = editor;

            // Set regex for updated language
            await parser.SetRegex(editor.document.languageId);

            // Trigger update to set decorations for newly active file
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    // * Handle file contents changed
    vscode.workspace.onDidChangeTextDocument(event => {

        // Trigger updates if the text was changed in the same document
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    // * IMPORTANT:
    // * To avoid calling update too often,
    // * set a timer for 100ms to wait before updating decorations
    var timeout: NodeJS.Timeout | undefined;
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 100);
    }

    // ===== Comment Craft Features (Comment Generation & Formatting) =====
    // Register command: Generate Comment
    const generateCommentCommand = vscode.commands.registerCommand(
        'commentCraft.generateComment',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            const selection = editor.selection;
            if (selection.isEmpty) {
                vscode.window.showWarningMessage('Please select text to generate a comment for');
                return;
            }

            const selectedText = editor.document.getText(selection);
            const comment = await generateComment(selectedText, editor.document.languageId);
            
            if (comment) {
                const position = new vscode.Position(selection.start.line, 0);
                await editor.edit((editBuilder: vscode.TextEditorEdit) => {
                    editBuilder.insert(position, comment + '\n');
                });

                // Auto-format if enabled
                const config = vscode.workspace.getConfiguration('commentCraft');
                if (config.get<boolean>('autoFormat', true)) {
                    await vscode.commands.executeCommand('editor.action.formatDocument');
                }

                vscode.window.showInformationMessage('Comment generated successfully!');
            }
        }
    );

    // Register command: Format Comments
    const formatCommentsCommand = vscode.commands.registerCommand(
        'commentCraft.formatComments',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            const document = editor.document;
            const text = document.getText();
            const formattedText = formatComments(text, document.languageId);
            
            if (formattedText !== text) {
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );
                await editor.edit((editBuilder: vscode.TextEditorEdit) => {
                    editBuilder.replace(fullRange, formattedText);
                });
                vscode.window.showInformationMessage('Comments formatted successfully!');
            } else {
                vscode.window.showInformationMessage('No comments found to format');
            }
        }
    );

    context.subscriptions.push(generateCommentCommand, formatCommentsCommand);
}

/**
 * Deactivates the extension
 */
export function deactivate() {
    console.log('Comment Craft extension is now deactivated');
}

/**
 * Generates a comment based on the selected text and language
 * @param text - The selected text to generate a comment for
 * @param languageId - The language ID of the document
 * @returns The generated comment string
 */
async function generateComment(text: string, languageId: string): Promise<string | null> {
    const config = vscode.workspace.getConfiguration('commentCraft');
    const style = config.get<string>('style', 'standard');

    // Analyze the selected text to generate appropriate comment
    const lines = text.split('\n');
    const firstLine = lines[0].trim();
    
    // Simple heuristic: if it looks like a function, generate function comment
    const isFunction = /^(function|const|let|var|async|def|class)\s+\w+/.test(firstLine) ||
                      /^\w+\s*\(/.test(firstLine);

    const commentPrefix = getCommentPrefix(languageId, style);
    
    if (style === 'javadoc' || style === 'jsdoc') {
        return generateDocComment(text, languageId, style, isFunction);
    } else if (style === 'doxygen') {
        return generateDoxygenComment(text, languageId, isFunction);
    } else {
        return generateStandardComment(text, languageId, commentPrefix);
    }
}

/**
 * Gets the comment prefix for a given language
 */
function getCommentPrefix(languageId: string, style: string): string {
    const prefixes: { [key: string]: string } = {
        // Languages using //
        'javascript': '//',
        'typescript': '//',
        'java': '//',
        'c': '//',
        'cpp': '//',
        'csharp': '//',
        'go': '//',
        'rust': '//',
        'swift': '//',
        'kotlin': '//',
        'dart': '//',
        'scala': '//',
        'fsharp': '//',
        'groovy': '//',
        'objective-c': '//',
        'objective-cpp': '//',
        'scss': '//',
        'less': '//',
        'sass': '//',
        
        // Languages using #
        'python': '#',
        'ruby': '#',
        'shellscript': '#',
        'yaml': '#',
        'php': '#',
        'perl': '#',
        'r': '#',
        'powershell': '#',
        'elixir': '#',
        'julia': '#',
        'makefile': '#',
        'dockerfile': '#',
        'toml': '#',
        'ini': '#',
        'properties': '#',
        'coffeescript': '#',
        'nim': '#',
        
        // Languages using --
        'lua': '--',
        'haskell': '--',
        'sql': '--',
        'ada': '--',
        
        // Languages using %
        'matlab': '%',
        'erlang': '%',
        
        // Languages using ;
        'scheme': ';',
        'racket': ';',
        'clojure': ';',
        
        // Languages using '
        'vb': "'",
        'vbnet': "'",
        'vbscript': "'",
        
        // Languages using !
        'fortran': '!',
        
        // Languages using <!--
        'html': '<!--',
        'xml': '<!--',
        'markdown': '<!--',
        
        // Languages using /*
        'css': '/*'
    };

    return prefixes[languageId] || '//';
}

/**
 * Generates a standard comment
 */
function generateStandardComment(text: string, languageId: string, prefix: string): string {
    const lines = text.split('\n');
    const firstLine = lines[0].trim();
    
    // Generate a simple description based on the code
    let description = `TODO: Add description for ${firstLine.substring(0, 50)}`;
    
    if (firstLine.includes('function') || firstLine.includes('=>')) {
        description = 'Function implementation';
    } else if (firstLine.includes('class')) {
        description = 'Class definition';
    } else if (firstLine.includes('const') || firstLine.includes('let') || firstLine.includes('var')) {
        description = 'Variable declaration';
    }

    if (prefix === '<!--') {
        return `${prefix} ${description} -->`;
    } else if (prefix === '/*') {
        return `${prefix} ${description} */`;
    } else {
        return `${prefix} ${description}`;
    }
}

/**
 * Generates a JSDoc/JavaDoc style comment
 */
function generateDocComment(text: string, languageId: string, style: string, isFunction: boolean): string {
    const prefix = getCommentPrefix(languageId, 'standard');
    const docPrefix = prefix === '//' ? '/**' : prefix;
    
    if (isFunction) {
        return `${docPrefix}
 * ${extractFunctionDescription(text)}
 * 
 * @returns {*} Description of return value
 */`;
    } else {
        return `${docPrefix}
 * ${extractDescription(text)}
 */`;
    }
}

/**
 * Generates a Doxygen style comment
 */
function generateDoxygenComment(text: string, languageId: string, isFunction: boolean): string {
    const prefix = getCommentPrefix(languageId, 'standard');
    const docPrefix = prefix === '//' ? '///' : prefix;
    
    if (isFunction) {
        return `${docPrefix} @brief ${extractFunctionDescription(text)}
${docPrefix} @return Description of return value`;
    } else {
        return `${docPrefix} @brief ${extractDescription(text)}`;
    }
}

/**
 * Extracts a description from code text
 */
function extractDescription(text: string): string {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0]?.trim() || 'Code block';
    
    if (firstLine.length > 60) {
        return firstLine.substring(0, 57) + '...';
    }
    return firstLine;
}

/**
 * Extracts function description from code text
 */
function extractFunctionDescription(text: string): string {
    const lines = text.split('\n');
    const firstLine = lines[0]?.trim() || '';
    
    // Try to extract function name
    const functionMatch = firstLine.match(/(?:function|const|let|var|async|def)\s+(\w+)/);
    if (functionMatch) {
        return `Implementation of ${functionMatch[1]} function`;
    }
    
    return 'Function implementation';
}

/**
 * Formats comments in the document
 */
function formatComments(text: string, languageId: string): string {
    const prefix = getCommentPrefix(languageId, 'standard');
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Check if line is a comment
        if (trimmed.startsWith(prefix) || trimmed.startsWith('*') || trimmed.startsWith('//')) {
            // Format comment: ensure proper spacing
            const formatted = formatCommentLine(line, prefix);
            formattedLines.push(formatted);
        } else {
            formattedLines.push(line);
        }
    }
    
    return formattedLines.join('\n');
}

/**
 * Formats a single comment line
 */
function formatCommentLine(line: string, prefix: string): string {
    const trimmed = line.trim();
    
    // Preserve indentation
    const indent = line.substring(0, line.length - line.trimStart().length);
    
    // Ensure proper spacing after comment prefix
    if (trimmed.startsWith(prefix)) {
        const afterPrefix = trimmed.substring(prefix.length).trimStart();
        if (afterPrefix && !afterPrefix.startsWith(' ')) {
            return indent + prefix + ' ' + afterPrefix;
        }
    }
    
    return line;
}

