import * as vscode from 'vscode';
import { Configuration } from './configuration';
import { Parser } from './parser';
import { TagTreeProvider } from './tagTree';
import { TagScanner } from './tagScanner';
import { StatusBarManager } from './statusBar';
import { TagCodeLensProvider } from './codeLens';
import { TagExporter } from './tagExporter';
import { IssueTracker } from './issueTracker';
import { TagFilter } from './tagFilter';
import { TagInfo } from './tagScanner';
import { CommentTemplateManager } from './commentTemplates';
import { CommentStatisticsProvider } from './commentStatistics';
import { CommentSearchProvider } from './commentSearch';
import { CommentValidator } from './commentValidation';
import { CommentSnippets } from './commentSnippets';
import { CommentReminderManager } from './commentReminders';

// Create output channel for logging
const outputChannel = vscode.window.createOutputChannel('Comment Craft');

/**
 * Activates the Comment Craft extension
 * @param context - The extension context
 */
export async function activate(context: vscode.ExtensionContext) {
    // Import and set output channel for parser
    const { setOutputChannel } = await import('./parser');
    setOutputChannel(outputChannel);
    
    outputChannel.appendLine('Comment Craft extension is now active!');
    outputChannel.show(true); // Show the output channel

    const config = vscode.workspace.getConfiguration('commentCraft');
    const enabled = config.get<boolean>('enabled', true);
    
    if (!enabled) {
        outputChannel.appendLine('Comment Craft is disabled');
        return;
    }

    // ===== Better Comments Feature (Comment Highlighting) =====
    let activeEditor: vscode.TextEditor;
    let isUpdating = false; // Declare early so updateDecorations can access it

    const configuration: Configuration = new Configuration();
    let parser: Parser = new Parser(configuration);
    
    // ===== New Features Initialization =====
    const tagScanner = new TagScanner();
    const statusBarManager = new StatusBarManager(tagScanner);
    const codeLensProvider = new TagCodeLensProvider(tagScanner);
    const tagExporter = new TagExporter(tagScanner);
    const templateManager = new CommentTemplateManager();
    const statisticsProvider = new CommentStatisticsProvider(tagScanner);
    const searchProvider = new CommentSearchProvider(tagScanner);
    const validator = new CommentValidator();
    const reminderManager = new CommentReminderManager(tagScanner);
    
    // Register comment snippets
    const snippetDisposables = CommentSnippets.registerSnippets();
    context.subscriptions.push(...snippetDisposables);
    
    // Start reminders if enabled
    reminderManager.startReminders();
    
    // Register tree view
    const treeProvider = new TagTreeProvider();
    const treeView = vscode.window.createTreeView('commentCraft.tagTree', {
        treeDataProvider: treeProvider,
        showCollapseAll: true
    });
    
    // Register CodeLens provider
    const codeLensDisposable = vscode.languages.registerCodeLensProvider(
        { scheme: 'file' },
        codeLensProvider
    );
    context.subscriptions.push(codeLensDisposable);
    
    // Initial scan of open files
    await tagScanner.scanOpenFiles();
    treeProvider.setTags(tagScanner.getTags());
    statusBarManager.update();

    // Called to handle events below
    let lastUpdateText = '';
    const updateDecorations = function () {
        // Prevent recursive calls
        if (isUpdating) {
            return;
        }
        isUpdating = true;

        try {
            // if no active window is open, return
            if (!activeEditor) {
                return;
            }
            
            // Only process file editors, skip output panels, diff views, etc.
            if (activeEditor.document.uri.scheme !== 'file') {
                return;
            }

            // if lanugage isn't supported, return
            if (!parser.supportedLanguage) {
                return;
            }

            // Check if text actually changed
            const currentText = activeEditor.document.getText();
            if (currentText === lastUpdateText) {
                return; // Text hasn't changed, skip update
            }
            lastUpdateText = currentText;

            // Finds the single line comments using the language comment delimiter
            parser.FindSingleLineComments(activeEditor);

            // Finds the multi line comments using the language comment delimiter
            parser.FindBlockComments(activeEditor);

            // Finds the jsdoc comments
            parser.FindJSDocComments(activeEditor);

            // Apply the styles set in the package.json
            parser.ApplyDecorations(activeEditor);
        } catch (error) {
            outputChannel.appendLine(`[Comment Craft] ERROR in updateDecorations: ${error}`);
        } finally {
            isUpdating = false;
        }
    };

    // Get the active editor for the first time and initialise the regex
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.scheme === 'file') {
        activeEditor = vscode.window.activeTextEditor;
        // Set the regex patterns for the specified language's comments
        await parser.SetRegex(activeEditor.document.languageId);

        // Trigger first update of decorators - call directly for immediate effect
        updateDecorations();
    } else {
        outputChannel.appendLine('[Comment Craft] No active file editor on startup');
    }

    // * Handle extensions being added or removed
    vscode.extensions.onDidChange(() => {
        configuration.UpdateLanguagesDefinitions();
    }, null, context.subscriptions);

    // * Handle active file changed
    vscode.window.onDidChangeActiveTextEditor(async editor => {
        // Only process file editors, skip output panels, diff views, etc.
        if (editor && editor.document.uri.scheme === 'file') {
            activeEditor = editor;
            // Set regex for updated language
            await parser.SetRegex(editor.document.languageId);
            // Trigger update to set decorations for newly active file
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    // * Handle file contents changed
    // isUpdating is already declared above
    vscode.workspace.onDidChangeTextDocument(async event => {
        // Prevent recursive updates - don't update if we're already updating
        if (isUpdating) {
            return;
        }

        // Only process file editors, skip output panels, diff views, etc.
        if (event.document.uri.scheme !== 'file') {
            return;
        }

        // Trigger updates if the text was changed in the same document
        // Skip if content changes are from undo/redo or other non-user edits
        if (activeEditor && event.document === activeEditor.document) {
            // Only update if it's a real content change (not from decorations)
            if (event.contentChanges.length > 0) {
                triggerUpdateDecorations();
            }
        }
        
        // Update tag scanner for changed files
        if (event.document.uri.scheme === 'file') {
            tagScanner.queueScan(event.document.uri);
            await tagScanner.scanFile(event.document.uri);
            treeProvider.setTags(tagScanner.getTags());
            statusBarManager.update();
            codeLensProvider.refresh();
        }
    }, null, context.subscriptions);

    // * IMPORTANT:
    // * To avoid calling update too often,
    // * set a timer for 500ms to wait before updating decorations
    let timeout: NodeJS.Timeout | undefined;
    let lastDocumentVersion = -1;
    let lastDocumentText = '';
    function triggerUpdateDecorations() {
        // Don't schedule if already updating
        if (isUpdating) {
            return;
        }
        
        // Check if document actually changed
        if (activeEditor) {
            const currentVersion = activeEditor.document.version;
            const currentText = activeEditor.document.getText();
            
            // Skip if document version and text haven't changed
            if (currentVersion === lastDocumentVersion && currentText === lastDocumentText) {
                return; // Document hasn't changed, skip update
            }
            lastDocumentVersion = currentVersion;
            lastDocumentText = currentText;
        }
        
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            updateDecorations();
        }, 500); // Increased debounce time to 500ms
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

    // ===== Navigation Commands =====
    const jumpToNextTagCommand = vscode.commands.registerCommand('commentCraft.jumpToNextTag', () => {
        jumpToTag('next');
    });
    
    const jumpToPreviousTagCommand = vscode.commands.registerCommand('commentCraft.jumpToPreviousTag', () => {
        jumpToTag('previous');
    });
    
    const listTagsInFileCommand = vscode.commands.registerCommand('commentCraft.listTagsInFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        
        const tags = tagScanner.getTags();
        const fileTags: Array<{ label: string; description: string; tagInfo: TagInfo }> = [];
        
        for (const [tagName, tagInfos] of tags.entries()) {
            for (const tagInfo of tagInfos) {
                if (tagInfo.filePath === editor.document.uri.fsPath) {
                    fileTags.push({
                        label: `${tagName}: Line ${tagInfo.line + 1}`,
                        description: tagInfo.fullLine.trim(),
                        tagInfo: tagInfo
                    });
                }
            }
        }
        
        if (fileTags.length === 0) {
            vscode.window.showInformationMessage('No tags found in current file');
            return;
        }
        
        const selected = await vscode.window.showQuickPick(fileTags, {
            placeHolder: 'Select a tag to jump to'
        });
        
        if (selected && selected.tagInfo) {
            const tagInfo = selected.tagInfo;
            const position = new vscode.Position(tagInfo.line, tagInfo.column);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        }
    });
    
    const toggleTagVisibilityCommand = vscode.commands.registerCommand('commentCraft.toggleTagVisibility', () => {
        const config = vscode.workspace.getConfiguration('commentCraft');
        const current = config.get<boolean>('enabled', true);
        config.update('enabled', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Tag visibility ${!current ? 'enabled' : 'disabled'}`);
    });
    
    // ===== Tag Lifecycle Commands =====
    const markAsDoneCommand = vscode.commands.registerCommand('commentCraft.markAsDone', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        
        const position = editor.selection.active;
        const line = editor.document.lineAt(position.line);
        const lineText = line.text;
        
        // Find tag in current line
        const config = vscode.workspace.getConfiguration('commentCraft');
        const tagConfigs = config.get<Array<{ tag: string; pattern?: string }>>('tags', []);
        
        for (const tagConfig of tagConfigs) {
            const pattern = tagConfig.pattern || `\\b${tagConfig.tag}\\b[:\\s]?`;
            const regex = new RegExp(pattern, 'i');
            const match = regex.exec(lineText);
            
            if (match && match.index <= position.character && match.index + match[0].length >= position.character) {
                // Replace TODO/FIXME/etc with DONE
                const newText = lineText.replace(regex, 'DONE');
                const range = new vscode.Range(position.line, 0, position.line, lineText.length);
                
                await editor.edit(editBuilder => {
                    editBuilder.replace(range, newText);
                });
                
                vscode.window.showInformationMessage(`Marked as DONE`);
                
                // Refresh
                await tagScanner.scanFile(editor.document.uri);
                treeProvider.setTags(tagScanner.getTags());
                statusBarManager.update();
                codeLensProvider.refresh();
                return;
            }
        }
        
        vscode.window.showWarningMessage('No tag found at cursor position');
    });
    
    // ===== Export Commands =====
    const exportTagsCommand = vscode.commands.registerCommand('commentCraft.exportTags', async () => {
        const format = await vscode.window.showQuickPick(['json', 'csv', 'markdown'], {
            placeHolder: 'Select export format'
        });
        
        if (format) {
            await tagExporter.export(format as 'json' | 'csv' | 'markdown');
        }
    });
    
    const scanWorkspaceCommand = vscode.commands.registerCommand('commentCraft.scanWorkspace', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Scanning workspace for tags...',
            cancellable: false
        }, async (_progress) => {
            await tagScanner.scanWorkspace();
            treeProvider.setTags(tagScanner.getTags());
            statusBarManager.update();
            codeLensProvider.refresh();
            vscode.window.showInformationMessage('Workspace scan complete');
        });
    });
    
    const refreshTreeViewCommand = vscode.commands.registerCommand('commentCraft.refreshTreeView', async () => {
        await tagScanner.scanOpenFiles();
        treeProvider.setTags(tagScanner.getTags());
        statusBarManager.update();
        codeLensProvider.refresh();
    });
    
    // Issue tracker commands
    const createGitHubIssueCommand = vscode.commands.registerCommand('commentCraft.createGitHubIssue', async (tagInfo: TagInfo) => {
        if (tagInfo) {
            await IssueTracker.createGitHubIssue(tagInfo);
        } else {
            vscode.window.showWarningMessage('No tag selected');
        }
    });
    
    const createJiraTicketCommand = vscode.commands.registerCommand('commentCraft.createJiraTicket', async (tagInfo: TagInfo) => {
        if (tagInfo) {
            await IssueTracker.createJiraTicket(tagInfo);
        } else {
            vscode.window.showWarningMessage('No tag selected');
        }
    });
    
    // Filter commands
    const filterTagsCommand = vscode.commands.registerCommand('commentCraft.filterTags', async () => {
        const tags = tagScanner.getTags();
        const tagNames = Array.from(tags.keys());
        
        const selectedTags = await vscode.window.showQuickPick(
            tagNames.map(name => ({ label: name, picked: true })),
            {
                canPickMany: true,
                placeHolder: 'Select tags to filter'
            }
        );
        
        if (selectedTags) {
            const filterOptions = {
                tagNames: selectedTags.map(t => t.label)
            };
            
            const filtered = TagFilter.filter(tags, filterOptions);
            treeProvider.setTags(filtered);
        }
    });
    
    const clearFilterCommand = vscode.commands.registerCommand('commentCraft.clearFilter', async () => {
        treeProvider.setTags(tagScanner.getTags());
    });
    
    // Tag actions command (for CodeLens)
    const tagActionsCommand = vscode.commands.registerCommand('commentCraft.tagActions', async (tagInfo: TagInfo) => {
        if (!tagInfo) {
            return;
        }
        
        const actions = [
            { label: 'Mark as Done', command: 'commentCraft.markAsDone' },
            { label: 'Create GitHub Issue', command: 'commentCraft.createGitHubIssue' },
            { label: 'Create Jira Ticket', command: 'commentCraft.createJiraTicket' },
            { label: 'Copy to Clipboard', command: 'commentCraft.copyTag' }
        ];
        
        const selected = await vscode.window.showQuickPick(actions, {
            placeHolder: 'Select an action'
        });
        
        if (selected) {
            if (selected.command === 'commentCraft.copyTag') {
                await vscode.env.clipboard.writeText(`${tagInfo.tagName}: ${tagInfo.fullLine.trim()}`);
                vscode.window.showInformationMessage('Tag copied to clipboard');
            } else {
                await vscode.commands.executeCommand(selected.command, tagInfo);
            }
        }
    });
    
    // Helper function to jump to tags
    function jumpToTag(direction: 'next' | 'previous'): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        
        const tags = tagScanner.getTags();
        const fileTags: TagInfo[] = [];
        
        for (const tagInfos of tags.values()) {
            for (const tagInfo of tagInfos) {
                if (tagInfo.filePath === editor.document.uri.fsPath) {
                    fileTags.push(tagInfo);
                }
            }
        }
        
        if (fileTags.length === 0) {
            vscode.window.showInformationMessage('No tags found in current file');
            return;
        }
        
        // Sort by line number
        fileTags.sort((a, b) => a.line - b.line);
        
        const currentPosition = editor.selection.active;
        const currentLine = currentPosition.line;
        
        let targetTag: TagInfo | null = null;
        if (direction === 'next') {
            targetTag = fileTags.find(tag => tag.line > currentLine) || null;
            if (!targetTag) {
                targetTag = fileTags[0] || null; // Wrap around
            }
        } else {
            const reversed = [...fileTags].reverse();
            targetTag = reversed.find(tag => tag.line < currentLine) || null;
            if (!targetTag) {
                targetTag = fileTags[fileTags.length - 1] || null; // Wrap around
            }
        }
        
        if (targetTag) {
            const position = new vscode.Position(targetTag.line, targetTag.column);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        }
    }
    
    // Watch for configuration changes
    vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('commentCraft')) {
            // Reinitialize parser with new config
            parser = new Parser(configuration);
            if (activeEditor) {
                await parser.SetRegex(activeEditor.document.languageId);
                triggerUpdateDecorations();
            }
            
            // Refresh all features
            await tagScanner.scanOpenFiles();
            treeProvider.setTags(tagScanner.getTags());
            statusBarManager.update();
            codeLensProvider.refresh();
        }
    }, null, context.subscriptions);
    
    // ===== New Feature Commands =====
    const insertTemplateCommand = vscode.commands.registerCommand('commentCraft.insertTemplate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        await templateManager.showTemplatePicker(editor);
    });
    
    const showStatisticsCommand = vscode.commands.registerCommand('commentCraft.showStatistics', async () => {
        await statisticsProvider.showStatisticsPanel();
    });
    
    const searchCommentsCommand = vscode.commands.registerCommand('commentCraft.searchComments', async () => {
        await searchProvider.search();
    });
    
    const advancedSearchCommand = vscode.commands.registerCommand('commentCraft.advancedSearch', async () => {
        await searchProvider.advancedSearch();
    });
    
    const validateCommentsCommand = vscode.commands.registerCommand('commentCraft.validateComments', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const results = await validator.validateFile(editor.document);
            await validator.showValidationResults(results);
        } else {
            vscode.window.showWarningMessage('No active editor found');
        }
    });
    
    const validateWorkspaceCommand = vscode.commands.registerCommand('commentCraft.validateWorkspace', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Validating comments...',
            cancellable: false
        }, async (_progress) => {
            const results = await validator.validateWorkspace();
            await validator.showValidationResults(results);
        });
    });

    context.subscriptions.push(
        generateCommentCommand, 
        formatCommentsCommand,
        jumpToNextTagCommand,
        jumpToPreviousTagCommand,
        listTagsInFileCommand,
        toggleTagVisibilityCommand,
        markAsDoneCommand,
        exportTagsCommand,
        scanWorkspaceCommand,
        refreshTreeViewCommand,
        createGitHubIssueCommand,
        createJiraTicketCommand,
        filterTagsCommand,
        clearFilterCommand,
        tagActionsCommand,
        insertTemplateCommand,
        showStatisticsCommand,
        searchCommentsCommand,
        advancedSearchCommand,
        validateCommentsCommand,
        validateWorkspaceCommand,
        statusBarManager,
        treeView,
        reminderManager
    );
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
    function getCommentPrefix(languageId: string, _style: string): string {
        void _style; // Mark as intentionally unused (reserved for future use)
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
        'zig': '//',
        'd': '//',
        'vala': '//',
        'cuda-cpp': '//',
        'hlsl': '//',
        'glsl': '//',
        'reason': '//',
        'ocaml': '//',
        'reasonml': '//',
        'json5': '//',
        'jsonc': '//',
        'verilog': '//',
        'systemverilog': '//',
        'pascal': '//',
        'delphi': '//',
        'modula-2': '//',
        'oberon': '//',
        'crystal': '#',
        'stylus': '//',
        'postcss': '//',
        'terraform': '//',
        'hcl': '//',
        'cue': '//',
        'nix': '#',
        
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
        'tcl': '#',
        'awk': '#',
        'sed': '#',
        'fish': '#',
        'zsh': '#',
        'bash': '#',
        'sh': '#',
        'autoit': '#',
        'graphql': '#',
        'prometheus': '#',
        'logql': '#',
        'ansible': '#',
        'helm': '#',
        'pug': '//',
        'jade': '//',
        'org': '#',
        'mathematica': '(*',
        'wolfram': '(*',
        
        // Languages using --
        'lua': '--',
        'haskell': '--',
        'sql': '--',
        'ada': '--',
        'vhdl': '--',
        'eiffel': '--',
        'dhall': '--',
        'elm': '--',
        'idris': '--',
        'agda': '--',
        'purescript': '--',
        
        // Languages using %
        'matlab': '%',
        'erlang': '%',
        'prolog': '%',
        'tex': '%',
        'latex': '%',
        'postscript': '%',
        'octave': '%',
        'scilab': '%',
        
        // Languages using ;
        'scheme': ';',
        'racket': ';',
        'clojure': ';',
        'common-lisp': ';',
        'lisp': ';',
        'emacs-lisp': ';',
        'autohotkey': ';',
        'assembly': ';',
        'asm': ';',
        'x86': ';',
        'x86-64': ';',
        'arm': ';',
        'mips': ';',
        'riscv': ';',
        
        // Languages using '
        'vb': "'",
        'vbnet': "'",
        'vbscript': "'",
        'visual-basic': "'",
        
        // Languages using !
        'fortran': '!',
        'fortran-modern': '!',
        'fortran-free-form': '!',
        
        // Languages using <!--
        'html': '<!--',
        'xml': '<!--',
        'markdown': '<!--',
        'vue': '<!--',
        'vue-html': '<!--',
        'svelte': '<!--',
        'angular': '<!--',
        'jsx': '//',
        'tsx': '//',
        'react': '//',
        
        // Languages using /*
        'css': '/*',
        'javascriptreact': '//',
        'typescriptreact': '//',
        
        // Template languages
        'handlebars': '{{! ',
        'mustache': '{{! ',
        'ejs': '<%# ',
        'liquid': '{% comment %}',
        'twig': '{# ',
        'jinja': '{# ',
        'jinja-html': '{# ',
        'nunjucks': '{# ',
        'erb': '<%# ',
        
        // Configuration and data formats
        'json': '//',
        'edn': ';',
        'clojurescript': ';',
        'clojurec': ';',
        
        // Build tools and package managers
        'gradle': '//',
        'maven': '<!--',
        'pom.xml': '<!--',
        'build.gradle': '//',
        'build.gradle.kts': '//',
        
        // Documentation formats
        'textile': '//',
        
        // Scripting and automation
        'gherkin': '#',
        'cucumber': '#',
        'robot': '#',
        'robotframework': '#',
        
        // Special file types
        'plaintext': '//',
        'text': '//',
        'log': '#',
        'gitignore': '#',
        'gitattributes': '#',
        'editorconfig': '#',
        'eslintrc': '//',
        'prettierrc': '//',
        'babelrc': '//',
        'webpack': '//',
        'rollup': '//',
        'vite': '//',
        
        // Domain-specific languages
        'gcode': ';',
        'cnc': ';',
        
        // Legacy and specialized
        'cobol': '*>',
        'rpg': '*',
        'abap': '*',
        'plsql': '--',
        'transact-sql': '--',
        'tsql': '--',
        'mysql': '--',
        'postgresql': '--',
        'plpgsql': '--',
        'oracle': '--',
        
        // Markup variants
        'svg': '<!--',
        'xhtml': '<!--',
        'xsl': '<!--',
        'xslt': '<!--',
        'xsd': '<!--',
        
        // Styling variants
        'sugarss': '//',
        
        // Shell variants
        'tcsh': '#',
        'csh': '#',
        'ksh': '#',
        
        // Batch and scripting
        'batch': 'REM ',
        'bat': 'REM ',
        'cmd': 'REM ',
        'vbs': "'",
        'wsf': '<!--',
        
        // Editor configs
        'vim': '"',
        'viml': '"',
        'vimscript': '"',
        'neovim': '"',
        
        // Other
        'smalltalk': '"',
        'apl': '⍝',
        'forth': '\\',
        'factor': '!',
        'io': '//',
        'ioke': ';',
        'j': 'NB.',
        'k': '\\',
        'q': '\\',
        'rebol': ';',
        'red': ';',
        'wren': '//',
        'xtend': '//',
        'xquery': '(:',
        'xpath': '(:',
        'xproc': '(:',
        'xq': '(:'
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

