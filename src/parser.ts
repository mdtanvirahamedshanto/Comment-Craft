import * as vscode from 'vscode';
import { Configuration } from './configuration';

// Output channel will be set by extension
let outputChannel: vscode.OutputChannel | null = null;

export function setOutputChannel(channel: vscode.OutputChannel): void {
    outputChannel = channel;
}

function log(message: string): void {
    if (outputChannel) {
        outputChannel.appendLine(message);
    } else {
        console.log(message);
    }
}

export class Parser {
    private tags: CommentTag[] = [];
    private expression: string = "";

    private delimiter: string = "";
    private blockCommentStart: string = "";
    private blockCommentEnd: string = "";

    private highlightSingleLineComments = true;
    private highlightMultilineComments = false;
    private highlightJSDoc = false;

    // * this will allow plaintext files to show comment highlighting if switched on
    private isPlainText = false;

    // * this is used to prevent the first line of the file (specifically python) from coloring like other comments
    private ignoreFirstLine = false;

    // * this is used to trigger the events when a supported language code is found
    public supportedLanguage = true;

    // Read from the package.json - will be updated from config in setTags()
    private contributions: Contributions = vscode.workspace.getConfiguration('commentCraft') as unknown as Contributions;

    // The configuration necessary to find supported languages on startup
    private configuration: Configuration;

    /**
     * Creates a new instance of the Parser class
     * @param configuration 
     */
    public constructor(config: Configuration) {

        this.configuration = config;

        // Don't load tags here - wait until SetRegex is called
        // Tags will be loaded when SetRegex is called
    }

    /**
     * Sets the regex to be used by the matcher based on the config specified in the package.json
     * @param languageCode The short code of the current language
     * https://code.visualstudio.com/docs/languages/identifiers
     */
    public async SetRegex(languageCode: string) {
        await this.setDelimiter(languageCode);

        // if the language isn't supported, we don't need to go any further
        if (!this.supportedLanguage) {
            return;
        }

        // Always reload tags to ensure they're current
        this.setTags();

        if (this.tags.length === 0) {
            log('[Comment Craft] CRITICAL: No tags available for regex construction!');
            log('[Comment Craft] Check your commentCraft.tags setting in VS Code settings');
            if (outputChannel) {
                outputChannel.show(true);
            }
            this.expression = "";
            return;
        }

        const tagPatterns: Array<string> = [];
        for (const commentTag of this.tags) {
            let pattern = commentTag.escapedTag;
            // If pattern starts with (^|\s), we need to adapt it for comment context
            // For comments, we match after delimiter, so we remove the (^|\s) prefix
            if (pattern.startsWith('(^|\\s)')) {
                pattern = pattern.substring(6); // Remove "(^|\\s)" prefix
            }
            // Escape the pattern properly and wrap in group
            tagPatterns.push("(" + pattern + ")");
        }

        if (this.isPlainText && this.contributions.highlightPlainText) {
            // For plain text, patterns should include (^|\s) prefix
            // Reconstruct patterns with (^|\s) for plain text
            const plainTextPatterns: Array<string> = [];
            for (const commentTag of this.tags) {
                let pattern = commentTag.escapedTag;
                // Ensure (^|\s) prefix for plain text
                if (!pattern.startsWith('(^|\\s)')) {
                    pattern = "(^|\\s)" + pattern;
                }
                plainTextPatterns.push("(" + pattern + ")");
            }
            this.expression = plainTextPatterns.join("|");
        } else {
            // For comments: delimiter + optional spaces + tag pattern + rest of line
            // Escape delimiter for regex - escape special regex characters
            // The delimiter is stored as plain text (e.g., "//"), so we need to escape it properly
            let escapedDelimiter = this.delimiter;
            // Escape special regex characters first (excluding / which we'll handle separately)
            // We need to be careful not to double-escape
            escapedDelimiter = escapedDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Then escape forward slashes (for // comments) - do this last
            escapedDelimiter = escapedDelimiter.replace(/\//g, '\\/');
            // Build pattern: (delimiter)+ followed by optional whitespace
            // In string literal, \s needs to be \\s to become \s in the regex
            const delimiterPattern = "(" + escapedDelimiter + ")+\\s*";
            // Combine: delimiter + whitespace + (tag patterns) + rest
            this.expression = delimiterPattern + "(" + tagPatterns.join("|") + ")(.*)";
            
            // Test the regex to ensure it works (only log on failure)
            try {
                const testRegex = new RegExp(this.expression, 'i');
                const testMatch = testRegex.exec('// TODO: test');
                if (!testMatch) {
                    log(`[Comment Craft] ERROR: Regex test FAILED - expression may be invalid`);
                    log(`[Comment Craft] Expression: ${this.expression.substring(0, 200)}`);
                }
            } catch (e) {
                log(`[Comment Craft] Regex construction error: ${e}`);
                log(`[Comment Craft] Expression: ${this.expression.substring(0, 200)}`);
            }
        }
        
        // Only log on first build or errors
        // log(`[Comment Craft] Built regex for language "${languageCode}" with ${tagPatterns.length} tag patterns`);
    }

    /**
     * Finds all single line comments delimited by a given delimiter and matching tags specified in package.json
     * @param activeEditor The active text editor containing the code document
     */
    public FindSingleLineComments(activeEditor: vscode.TextEditor): void {

        // If highlight single line comments is off, single line comments are not supported for this language
        if (!this.highlightSingleLineComments) {
            return;
        }

        const text = activeEditor.document.getText();

        // Check if we have tags and expression
        if (this.tags.length === 0) {
            log('[Comment Craft] No tags loaded for highlighting');
            return;
        }

        if (!this.expression || this.expression.length === 0) {
            log('[Comment Craft] ERROR: No regex expression set - cannot find comments');
            return;
        }

        // if it's plain text, we have to do mutliline regex to catch the start of the line with ^
        const regexFlags = (this.isPlainText) ? "igm" : "ig";
        let regEx: RegExp;
        try {
            regEx = new RegExp(this.expression, regexFlags);
            // Test the regex immediately
            const testMatch = regEx.exec('// TODO: test');
            if (!testMatch) {
                log(`[Comment Craft] ERROR: Regex does not match test string!`);
                log(`[Comment Craft] Expression: ${this.expression.substring(0, 150)}`);
                log(`[Comment Craft] Regex source: ${regEx.source.substring(0, 150)}`);
            }
            // Reset regex lastIndex
            regEx.lastIndex = 0;
        } catch (error) {
            log(`[Comment Craft] ERROR: Invalid regex expression: ${error}`);
            log(`[Comment Craft] Expression: ${this.expression.substring(0, 200)}`);
            return;
        }

        let match: RegExpExecArray | null;
        let matchCount = 0;
        let lastIndex = 0; // Prevent infinite loop

        while ((match = regEx.exec(text)) !== null) {
            // Prevent infinite loop if regex doesn't advance
            if (match.index === lastIndex) {
                regEx.lastIndex++;
                if (regEx.lastIndex >= text.length) {
                    break;
                }
                continue;
            }
            lastIndex = match.index;
            matchCount++;
            // Only log first few matches to avoid spam
            // if (matchCount <= 3) {
            //     log(`[Comment Craft] Match #${matchCount} found at index ${match.index}: "${match[0].substring(0, 50)}"`);
            // }
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const range = { range: new vscode.Range(startPos, endPos) };

            // Required to ignore the first line of .py files (#61)
            if (this.ignoreFirstLine && startPos.line === 0 && startPos.character === 0) {
                continue;
            }

            // Find which tag was matched by testing each tag's pattern against the matched text
            let matchTag: CommentTag | undefined;
            const matchedText = match[0];
            
            // Try to match by testing each tag's pattern
            for (const tag of this.tags) {
                try {
                    // Build a test pattern that matches after comment delimiter
                    let testPattern = tag.escapedTag;
                    if (testPattern.startsWith('(^|\\s)')) {
                        testPattern = testPattern.substring(6); // Remove (^|\s) prefix
                    }
                    // Test if this pattern matches the text after delimiter
                    // Escape delimiter for regex matching
                    const escapedDelimiterForMatch = this.delimiter.replace(/\//g, '\\/').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const delimiterRegex = new RegExp("^" + escapedDelimiterForMatch + "\\s*");
                    const delimiterMatch = matchedText.match(delimiterRegex);
                    if (delimiterMatch) {
                        const textAfterDelimiter = matchedText.substring(delimiterMatch[0].length);
                        
                        // Build test regex - the pattern should match from start of text after delimiter
                        // Allow optional leading space if pattern doesn't already handle it
                        let testRegexPattern = testPattern;
                        // If pattern doesn't start with optional space or group, add optional space
                        if (!testPattern.startsWith('\\s*') && !testPattern.startsWith('(') && !testPattern.startsWith('[')) {
                            testRegexPattern = '\\s*' + testPattern;
                        }
                        
                        try {
                            const tagRegex = new RegExp('^' + testRegexPattern, 'i');
                            if (tagRegex.test(textAfterDelimiter)) {
                                matchTag = tag;
                                break;
                            }
                        } catch (regexError) {
                            log(`[Comment Craft] Regex error for tag "${tag.tag}": ${regexError}`);
                            continue;
                        }
                    }
                } catch (error) {
                    // Pattern error, continue to next tag
                    continue;
                }
            }
            
            // Fallback: match by tag name in the matched text (more strict matching)
            if (!matchTag && matchedText) {
                // Extract text after delimiter for better matching
                // Escape delimiter for regex matching
                const escapedDelimiterForMatch = this.delimiter.replace(/\//g, '\\/').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const delimiterRegex = new RegExp("^" + escapedDelimiterForMatch + "\\s*");
                const delimiterMatch = matchedText.match(delimiterRegex);
                const textAfterDelimiter = delimiterMatch ? matchedText.substring(delimiterMatch[0].length) : matchedText;
                
                // Only match if we have text after the delimiter
                if (textAfterDelimiter.trim().length === 0) {
                    continue; // Skip empty comments
                }
                
                matchTag = this.tags.find(item => {
                    const tagLower = item.tag.toLowerCase();
                    const textAfterLower = textAfterDelimiter.toLowerCase().trim();
                    
                    // More strict matching - tag should appear at the start or after whitespace/symbols
                    // For FIXME tag, also check for FIX (without ME) but only at word boundary
                    if (item.tag === 'FIXME') {
                        const fixPattern = /(^|\s)(fix|fixme)(\s|:|-|$)/i;
                        if (fixPattern.test(textAfterDelimiter)) {
                            return true;
                        }
                    }
                    
                    // For word tags (longer than 1 char), match at word boundary
                    if (item.tag.length > 1) {
                        const tagPattern = new RegExp('(^|\\s|@)' + this.escapeRegExp(item.tag) + '(\\s|:|\\-|$)', 'i');
                        if (tagPattern.test(textAfterDelimiter)) {
                            return true;
                        }
                        // Also try case-insensitive
                        const tagPatternLower = new RegExp('(^|\\s|@)' + this.escapeRegExp(tagLower) + '(\\s|:|\\-|$)', 'i');
                        if (tagPatternLower.test(textAfterDelimiter)) {
                            return true;
                        }
                    } else {
                        // For single character tags, match exactly (not as substring)
                        const charPattern = new RegExp('(^|\\s)' + this.escapeRegExp(item.tag) + '(\\s|:|\\-|$)', 'i');
                        if (charPattern.test(textAfterDelimiter)) {
                            return true;
                        }
                    }
                    
                    return false;
                });
            }

            if (matchTag) {
                // Verify the range is actually within a comment line
                const lineText = activeEditor.document.lineAt(startPos.line).text;
                const relativeStart = startPos.character;
                
                // Check if the matched text is actually within a comment on this line
                const beforeMatch = lineText.substring(0, relativeStart);
                const isInComment = beforeMatch.includes(this.delimiter) || 
                                   lineText.trim().startsWith(this.delimiter);
                
                if (isInComment) {
                    matchTag.ranges.push(range);
                }
            }
        }
        
        if (matchCount === 0) {
            // Only log if no matches found (indicates a problem)
            log(`[Comment Craft] WARNING: No comment matches found in file`);
        }
    }

    /**
     * Finds block comments as indicated by start and end delimiter
     * @param activeEditor The active text editor containing the code document
     */
    public FindBlockComments(activeEditor: vscode.TextEditor): void {

        // If highlight multiline is off in package.json or doesn't apply to his language, return
        if (!this.highlightMultilineComments) {return;}
        
        const text = activeEditor.document.getText();
        const languageId = activeEditor.document.languageId;
        
        // Handle JSX/TSX comments: {/* ... */}
        if (languageId === 'javascriptreact' || languageId === 'typescriptreact' || languageId === 'jsx' || languageId === 'tsx') {
            this.findJSXComments(activeEditor, text);
        }

        // Build up regex matcher for custom delimiter tags
        const characters: Array<string> = [];
        for (const commentTag of this.tags) {
            let pattern = commentTag.escapedTag;
            // Remove (^|\s) prefix for block comments
            if (pattern.startsWith('(^|\\s)')) {
                pattern = pattern.substring(6);
            }
            characters.push(pattern);
        }

        // Combine custom delimiters and the rest of the comment block matcher
        let commentMatchString = "(^)+([ \\t]*[ \\t]*)(";
        commentMatchString += characters.join("|");
        commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";

        // Use start and end delimiters to find block comments
        let regexString = "(^|[ \\t])(";
        regexString += this.blockCommentStart;
        regexString += "[\\s])+([\\s\\S]*?)(";
        regexString += this.blockCommentEnd;
        regexString += ")";

        const regEx = new RegExp(regexString, "gm");
        const commentRegEx = new RegExp(commentMatchString, "igm");

        // Find the multiline comment block
        let match: RegExpExecArray | null;
        // eslint-disable-next-line no-cond-assign
        while (match = regEx.exec(text)) {
            const commentBlock = match[0];

            // Find the line
            let line;
            // eslint-disable-next-line no-cond-assign
            while (line = commentRegEx.exec(commentBlock)) {
                const startPos = activeEditor.document.positionAt(match.index + line.index + line[2].length);
                const endPos = activeEditor.document.positionAt(match.index + line.index + line[0].length);
                const range: vscode.DecorationOptions = { range: new vscode.Range(startPos, endPos) };

                // Find which custom delimiter was used in order to add it to the collection
                const matchString = line[3] as string;
                const matchTag = this.tags.find(item => item.tag.toLowerCase() === matchString.toLowerCase());

                if (matchTag) {
                    matchTag.ranges.push(range);
                }
            }
        }
    }

    /**
     * Finds JSX/TSX comments wrapped in curly braces
     * Example: { /* TODO: fix this * / }
     * @param activeEditor The active text editor containing the code document
     * @param text The full text of the document
     */
    private findJSXComments(activeEditor: vscode.TextEditor, text: string): void {
        if (!this.blockCommentStart || !this.blockCommentEnd) {
            return;
        }

        // Match JSX comments: {/* ... */} or {/*TODO: ...*/} etc.
        const escapedStart = this.escapeRegExp(this.blockCommentStart);
        const escapedEnd = this.escapeRegExp(this.blockCommentEnd);
        // Build regex pattern: { + /* + content + */ + }
        const jsxCommentPattern = '\\{\\s*' + escapedStart + '\\s*([\\s\\S]*?)' + escapedEnd + '\\s*\\}';
        const jsxRegEx = new RegExp(jsxCommentPattern, 'g');

        // Build tag patterns
        const tagPatterns: Array<string> = [];
        for (const commentTag of this.tags) {
            let pattern = commentTag.escapedTag;
            if (pattern.startsWith('(^|\\s)')) {
                pattern = pattern.substring(6);
            }
            tagPatterns.push(pattern);
        }

        if (tagPatterns.length === 0) {
            return;
        }

        const tagMatchPattern = '(' + tagPatterns.join('|') + ')([\\s]*[:\\-]?[\\s]*)([^*/]*)';

        let match: RegExpExecArray | null;
        while ((match = jsxRegEx.exec(text)) !== null) {
            const commentContent = match[1];
            const contentRegEx = new RegExp(tagMatchPattern, 'gi');
            let tagMatch: RegExpExecArray | null;
            let lastIndex = 0;
            
            while ((tagMatch = contentRegEx.exec(commentContent)) !== null) {
                if (tagMatch.index === lastIndex) {
                    contentRegEx.lastIndex++;
                    if (contentRegEx.lastIndex >= commentContent.length) {
                        break;
                    }
                    continue;
                }
                lastIndex = tagMatch.index;
                
                const tagText = tagMatch[0];
                const tagIndexInContent = commentContent.indexOf(tagText, tagMatch.index);
                if (tagIndexInContent === -1) {
                    continue;
                }
                
                const commentStartInMatch = match[0].indexOf(commentContent);
                const tagStartInDocument = match.index + commentStartInMatch + tagIndexInContent;
                const tagEndInDocument = tagStartInDocument + tagText.length;
                
                const startPos = activeEditor.document.positionAt(tagStartInDocument);
                const endPos = activeEditor.document.positionAt(tagEndInDocument);
                const range: vscode.DecorationOptions = { range: new vscode.Range(startPos, endPos) };

                const tagName = tagMatch[1];
                const matchTag = this.tags.find(item => {
                    const itemPattern = item.escapedTag.replace(/^\(^\|\\s\)/, '');
                    const testRegex = new RegExp(itemPattern, 'i');
                    if (testRegex.test(tagName)) {
                        return true;
                    }
                    const tagLower = item.tag.toLowerCase();
                    return tagName.toLowerCase().includes(tagLower) || tagName.includes(item.tag);
                });

                if (matchTag) {
                    matchTag.ranges.push(range);
                }
            }
        }
    }

    /**
     * Finds all multiline comments starting with "*"
     * @param activeEditor The active text editor containing the code document
     */
    public FindJSDocComments(activeEditor: vscode.TextEditor): void {

        // If highlight multiline is off in package.json or doesn't apply to his language, return
        if (!this.highlightMultilineComments && !this.highlightJSDoc) {return;}

        const text = activeEditor.document.getText();

        // Build up regex matcher for custom delimiter tags
        const characters: Array<string> = [];
        for (const commentTag of this.tags) {
            let pattern = commentTag.escapedTag;
            // Remove (^|\s) prefix for JSDoc comments
            if (pattern.startsWith('(^|\\s)')) {
                pattern = pattern.substring(6);
            }
            characters.push(pattern);
        }

        // Combine custom delimiters and the rest of the comment block matcher
        let commentMatchString = "(^)+([ \\t]*\\*[ \\t]*)("; // Highlight after leading *
        const regEx = /(^|[ \t])(\/\*\*)+([\s\S]*?)(\*\/)/gm; // Find rows of comments matching pattern /** */

        commentMatchString += characters.join("|");
        commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";

        const commentRegEx = new RegExp(commentMatchString, "igm");

        // Find the multiline comment block
        let match: RegExpExecArray | null;
        while ((match = regEx.exec(text)) !== null) {
            const commentBlock = match[0];

            // Find the line
            let line: RegExpExecArray | null;
            while ((line = commentRegEx.exec(commentBlock)) !== null) {
                const startPos = activeEditor.document.positionAt(match.index + line.index + line[2].length);
                const endPos = activeEditor.document.positionAt(match.index + line.index + line[0].length);
                const range: vscode.DecorationOptions = { range: new vscode.Range(startPos, endPos) };

                // Find which tag was matched
                const matchString = line[3] as string;
                const matchTag = this.tags.find(item => {
                    const tagLower = item.tag.toLowerCase();
                    return matchString.toLowerCase().includes(tagLower) || 
                           matchString.includes(item.tag) ||
                           (item.tag.length === 1 && matchString.includes(item.tag));
                });

                if (matchTag) {
                    matchTag.ranges.push(range);
                }
            }
        }
    }

    /**
     * Apply decorations after finding all relevant comments
     * @param activeEditor The active text editor containing the code document
     */
    public ApplyDecorations(activeEditor: vscode.TextEditor): void {
        let totalApplied = 0;
        for (const tag of this.tags) {
            if (tag.ranges.length > 0) {
                activeEditor.setDecorations(tag.decoration, tag.ranges);
                totalApplied += tag.ranges.length;
            }

            // clear the ranges for the next pass
            tag.ranges.length = 0;
        }
        
        // Only log if no decorations applied (indicates a problem)
        // if (totalApplied > 0) {
        //     log(`[Comment Craft] Applied ${totalApplied} decorations`);
        // } else {
        //     log('[Comment Craft] WARNING: No decorations applied - no tags matched');
        // }
    }

    //#region  Private Methods

    /**
     * Sets the comment delimiter [//, #, --, '] of a given language
     * @param languageCode The short code of the current language
     * https://code.visualstudio.com/docs/languages/identifiers
     */
    private async setDelimiter(languageCode: string): Promise<void> {
        this.supportedLanguage = false;
        this.ignoreFirstLine = false;
        this.isPlainText = false;

        const config = await this.configuration.GetCommentConfiguration(languageCode);
        if (config) {
            const blockCommentStart = config.blockComment ? config.blockComment[0] : null;
            const blockCommentEnd = config.blockComment ? config.blockComment[1] : null;

            this.setCommentFormat(config.lineComment || blockCommentStart, blockCommentStart, blockCommentEnd);

            this.supportedLanguage = true;
        }

        switch (languageCode) {
            case "apex":
            case "javascript":
            case "javascriptreact":
            case "typescript":
            case "typescriptreact":
                this.highlightJSDoc = true;
                break;

            case "elixir":
            case "python":
            case "tcl":
                this.ignoreFirstLine = true;
                break;
            
            case "plaintext":
                this.isPlainText = true;

                // If highlight plaintext is enabled, this is a supported language
                this.supportedLanguage = this.contributions.highlightPlainText;
                break;
        }
    }

    /**
     * Sets the highlighting tags up for use by the parser
     */
    private setTags(): void {
        const config = vscode.workspace.getConfiguration('commentCraft');
        // Get tags from configuration - config.get will use package.json defaults if not overridden
        interface TagConfig {
            tag: string;
            pattern?: string;
            color: string;
            strikethrough: boolean;
            underline: boolean;
            bold: boolean;
            italic: boolean;
            backgroundColor: string;
        }
        const items = config.get<Array<TagConfig>>('tags', []);
        const showGutterMarkers = config.get<boolean>('showGutterMarkers', true);
        const showOverviewRuler = config.get<boolean>('showOverviewRuler', true);
        const enableHighContrast = config.get<boolean>('enableHighContrast', false);

        // Clear existing tags
        this.tags = [];

        if (!items || items.length === 0) {
            log('[Comment Craft] ERROR: No tags found in configuration!');
            log('[Comment Craft] This means highlighting will NOT work.');
            log('[Comment Craft] Please check your commentCraft.tags setting.');
            if (outputChannel) {
                outputChannel.show(true);
            }
            return;
        }

        // Only log if no tags or on first load
        // log(`[Comment Craft] Loading ${items.length} tags`);

        for (const item of items) {
            const options: vscode.DecorationRenderOptions = { 
                color: item.color, 
                backgroundColor: item.backgroundColor 
            };

            // ? the textDecoration is initialised to empty so we can concat a preceeding space on it
            options.textDecoration = "";

            if (item.strikethrough) {
                options.textDecoration += "line-through";
            }
            
            if (item.underline) {
                options.textDecoration += " underline";
            }
            
            if (item.bold) {
                options.fontWeight = "bold";
            }

            if (item.italic) {
                options.fontStyle = "italic";
            }

            // Add gutter markers
            if (showGutterMarkers) {
                options.gutterIconPath = vscode.Uri.parse(`data:image/svg+xml;base64,${this.createGutterIcon(item.color)}`);
                options.gutterIconSize = 'contain';
            }

            // Add overview ruler
            if (showOverviewRuler) {
                options.overviewRulerColor = item.color;
                options.overviewRulerLane = vscode.OverviewRulerLane.Right;
            }

            // High contrast mode adjustments
            if (enableHighContrast) {
                options.border = `1px solid ${item.color}`;
                if (!item.backgroundColor || item.backgroundColor === 'transparent') {
                    options.backgroundColor = this.adjustColorForContrast(item.color);
                }
            }

            // Use pattern if available, otherwise use tag
            let escapedSequence: string;
            if (item.pattern) {
                // Pattern is already a regex pattern - use it directly
                // The pattern should match the full tag including optional symbols, @ prefix, etc.
                escapedSequence = item.pattern;
            } else {
                // Fallback: escape the tag for basic matching
                escapedSequence = item.tag.replace(/([()[{*+.$^\\|?])/g, '\\$1');
                escapedSequence = escapedSequence.replace(/\//gi, "\\/"); // ! hardcoded to escape slashes
            }

            this.tags.push({
                tag: item.tag,
                escapedTag: escapedSequence,
                ranges: [],
                decoration: vscode.window.createTextEditorDecorationType(options)
            });
        }
    }

    private createGutterIcon(color: string): string {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="4" fill="${color}"/>
        </svg>`;
        return Buffer.from(svg).toString('base64');
    }

    private adjustColorForContrast(color: string): string {
        // Simple contrast adjustment - make background lighter/darker
        // This is a basic implementation
        return color + '20'; // Add alpha for transparency
    }

    /**
     * Escapes a given string for use in a regular expression
     * @param input The input string to be escaped
     * @returns {string} The escaped string
     */
    private escapeRegExp(input: string): string {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    /**
     * Set up the comment format for single and multiline highlighting
     * @param singleLine The single line comment delimiter. If NULL, single line is not supported
     * @param start The start delimiter for block comments
     * @param end The end delimiter for block comments
     */
    private setCommentFormat(
            singleLine: string | string[] | null,
            start: string | null = null,
            end: string | null = null): void {

        this.delimiter = "";
        this.blockCommentStart = "";
        this.blockCommentEnd = "";

        // If no single line comment delimiter is passed, single line comments are not supported
        if (singleLine) {
            if (typeof singleLine === 'string') {
                // Store delimiter as-is, we'll escape it when building the regex pattern
                this.delimiter = singleLine;
            }
            else if (singleLine.length > 0) {
                // * if multiple delimiters are passed, the language has more than one single line comment format
                // Store as-is, will escape when building regex
                this.delimiter = singleLine.join("|");
            }
        }
        else {
            this.highlightSingleLineComments = false;
        }

        if (start && end) {
            this.blockCommentStart = this.escapeRegExp(start);
            this.blockCommentEnd = this.escapeRegExp(end);

            // Enable multiline comments by default, or use config setting
            const config = vscode.workspace.getConfiguration('commentCraft');
            this.highlightMultilineComments = config.get<boolean>('multilineComments', true);
        }
    }

    //#endregion
}

