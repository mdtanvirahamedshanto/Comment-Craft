import * as vscode from 'vscode';
import { Configuration } from './configuration';

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

    // Read from the package.json
    private contributions: Contributions = vscode.workspace.getConfiguration('commentCraft') as unknown as Contributions;

    // The configuration necessary to find supported languages on startup
    private configuration: Configuration;

    /**
     * Creates a new instance of the Parser class
     * @param configuration 
     */
    public constructor(config: Configuration) {

        this.configuration = config;

        this.setTags();
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
            // For comments: delimiter + spaces + tag pattern
            const delimiterPattern = "(" + this.delimiter + ")+( |\t)*";
            this.expression = delimiterPattern + "(" + tagPatterns.join("|") + ")(.*)";
        }
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

        // if it's plain text, we have to do mutliline regex to catch the start of the line with ^
        const regexFlags = (this.isPlainText) ? "igm" : "ig";
        const regEx = new RegExp(this.expression, regexFlags);

        let match: RegExpExecArray | null;
        while ((match = regEx.exec(text)) !== null) {
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
                    const delimiterMatch = matchedText.match(new RegExp(this.delimiter + "\\s*"));
                    if (delimiterMatch) {
                        const textAfterDelimiter = matchedText.substring(delimiterMatch[0].length);
                        const tagRegex = new RegExp(testPattern, 'i');
                        if (tagRegex.test(textAfterDelimiter)) {
                            matchTag = tag;
                            break;
                        }
                    }
                } catch (error) {
                    // Pattern error, continue to next tag
                    continue;
                }
            }
            
            // Fallback: match by tag name in the matched text
            if (!matchTag && matchedText) {
                matchTag = this.tags.find(item => {
                    const tagLower = item.tag.toLowerCase();
                    const matchedLower = matchedText.toLowerCase();
                    // Check if tag name appears in matched text
                    return matchedLower.includes(tagLower) || 
                           matchedText.includes(item.tag) ||
                           // Also check for symbol tags
                           (item.tag.length === 1 && matchedText.includes(item.tag));
                });
            }

            if (matchTag) {
                matchTag.ranges.push(range);
            }
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
        let match: any;
        while (match = regEx.exec(text)) {
            const commentBlock = match[0];

            // Find the line
            let line;
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
        for (const tag of this.tags) {
            activeEditor.setDecorations(tag.decoration, tag.ranges);

            // clear the ranges for the next pass
            tag.ranges.length = 0;
        }
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
        const items = this.contributions.tags;
        const config = vscode.workspace.getConfiguration('commentCraft');
        const showGutterMarkers = config.get<boolean>('showGutterMarkers', true);
        const showOverviewRuler = config.get<boolean>('showOverviewRuler', true);
        const enableHighContrast = config.get<boolean>('enableHighContrast', false);

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
                this.delimiter = this.escapeRegExp(singleLine).replace(/\//ig, "\\/");
            }
            else if (singleLine.length > 0) {
                // * if multiple delimiters are passed, the language has more than one single line comment format
                const delimiters = singleLine
                            .map(s => this.escapeRegExp(s))
                            .join("|");
                this.delimiter = delimiters;
            }
        }
        else {
            this.highlightSingleLineComments = false;
        }

        if (start && end) {
            this.blockCommentStart = this.escapeRegExp(start);
            this.blockCommentEnd = this.escapeRegExp(end);

            this.highlightMultilineComments = this.contributions.multilineComments;
        }
    }

    //#endregion
}

