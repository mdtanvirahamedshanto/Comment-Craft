import * as vscode from 'vscode';

export interface TagInfo {
    tagName: string;
    filePath: string;
    line: number;
    column: number;
    text: string;
    fullLine: string;
}

export class TagScanner {
    private tags: Map<string, TagInfo[]> = new Map();
    private isScanning = false;
    private scanQueue: vscode.Uri[] = [];
    private scanTimeout: NodeJS.Timeout | undefined;

    constructor() {
    }

    async scanWorkspace(): Promise<Map<string, TagInfo[]>> {
        if (this.isScanning) {
            return this.tags;
        }

        this.isScanning = true;
        this.tags.clear();

        try {
            const config = vscode.workspace.getConfiguration('commentCraft');
            const enabled = config.get<boolean>('enabled', true);
            const scanWorkspace = config.get<boolean>('scanWorkspaceOnOpen', false);
            const matchOnlyInComments = config.get<boolean>('matchOnlyInComments', true);

            if (!enabled || !scanWorkspace) {
                this.isScanning = false;
                return this.tags;
            }

            const files = await vscode.workspace.findFiles(
                '**/*',
                '**/{node_modules,.git,dist,build,out}/**',
                1000
            );

            for (const file of files) {
                await this.scanFile(file, matchOnlyInComments);
            }
        } catch (error) {
            console.error('Error scanning workspace:', error);
        } finally {
            this.isScanning = false;
        }

        return this.tags;
    }

    async scanFile(uri: vscode.Uri, matchOnlyInComments: boolean = true): Promise<TagInfo[]> {
        const fileTags: TagInfo[] = [];
        
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            const text = document.getText();
            const lines = text.split('\n');

            const config = vscode.workspace.getConfiguration('commentCraft');
            const tagConfigs = config.get<any[]>('tags', []);

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                const trimmedLine = line.trim();

                for (const tagConfig of tagConfigs) {
                    const tagName = tagConfig.tag;
                    const pattern = tagConfig.pattern || `\\b${tagName}\\b[:\\s]?`;
                    
                    try {
                        const regex = new RegExp(pattern, 'i');
                        const match = regex.exec(line);

                        if (match) {
                            // Check if it's in a comment if required
                            if (matchOnlyInComments) {
                                const commentPrefix = this.getCommentPrefix(document.languageId);
                                if (commentPrefix && !this.isInComment(line, match.index, commentPrefix)) {
                                    continue;
                                }
                            }

                            const tagInfo: TagInfo = {
                                tagName: tagName,
                                filePath: uri.fsPath,
                                line: lineIndex,
                                column: match.index,
                                text: match[0],
                                fullLine: line
                            };

                            fileTags.push(tagInfo);

                            if (!this.tags.has(tagName)) {
                                this.tags.set(tagName, []);
                            }
                            this.tags.get(tagName)!.push(tagInfo);
                        }
                    } catch (error) {
                        console.error(`Error matching pattern for tag ${tagName}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning file ${uri.fsPath}:`, error);
        }

        return fileTags;
    }

    async scanOpenFiles(): Promise<Map<string, TagInfo[]>> {
        this.tags.clear();

        const config = vscode.workspace.getConfiguration('commentCraft');
        const matchOnlyInComments = config.get<boolean>('matchOnlyInComments', true);

        for (const document of vscode.workspace.textDocuments) {
            if (document.uri.scheme === 'file') {
                await this.scanFile(document.uri, matchOnlyInComments);
            }
        }

        return this.tags;
    }

    getTags(): Map<string, TagInfo[]> {
        return this.tags;
    }

    private isInComment(line: string, matchIndex: number, commentPrefix: string): boolean {
        const beforeMatch = line.substring(0, matchIndex);
        return beforeMatch.includes(commentPrefix);
    }

    private getCommentPrefix(languageId: string): string | null {
        const prefixes: { [key: string]: string } = {
            'javascript': '//',
            'typescript': '//',
            'java': '//',
            'c': '//',
            'cpp': '//',
            'csharp': '//',
            'python': '#',
            'ruby': '#',
            'shellscript': '#',
            'yaml': '#',
            'html': '<!--',
            'xml': '<!--',
            'css': '/*',
            'lua': '--',
            'haskell': '--',
            'sql': '--',
            'matlab': '%',
            'erlang': '%',
            'scheme': ';',
            'clojure': ';',
            'vb': "'",
            'fortran': '!'
        };

        return prefixes[languageId] || null;
    }

    queueScan(uri: vscode.Uri): void {
        this.scanQueue.push(uri);
        
        if (this.scanTimeout) {
            clearTimeout(this.scanTimeout);
        }

        this.scanTimeout = setTimeout(async () => {
            const config = vscode.workspace.getConfiguration('commentCraft');
            const matchOnlyInComments = config.get<boolean>('matchOnlyInComments', true);
            
            for (const queuedUri of this.scanQueue) {
                await this.scanFile(queuedUri, matchOnlyInComments);
            }
            
            this.scanQueue = [];
        }, 500);
    }
}

