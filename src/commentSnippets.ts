import * as vscode from 'vscode';

export class CommentSnippets {
    static registerSnippets(): vscode.Disposable[] {
        const disposables: vscode.Disposable[] = [];

        // Register snippets for common comment patterns
        const languages = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp'];

        for (const language of languages) {
            const snippets = this.getSnippetsForLanguage(language);
            
            for (const snippet of snippets) {
                // Note: VS Code snippets are typically defined in package.json
                // This is a programmatic approach for dynamic snippets
                disposables.push(
                    vscode.languages.registerCompletionItemProvider(
                        { scheme: 'file', language: language },
                        {
                            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                                
                                if (!linePrefix.match(/\/\/|#|\/\*/)) {
                                    return [];
                                }

                                return snippets.map(snippet => {
                                    const item = new vscode.CompletionItem(
                                        snippet.prefix,
                                        vscode.CompletionItemKind.Snippet
                                    );
                                    item.insertText = new vscode.SnippetString(snippet.body);
                                    item.documentation = new vscode.MarkdownString(snippet.description);
                                    return item;
                                });
                            }
                        }
                    )
                );
            }
        }

        return disposables;
    }

    private static getSnippetsForLanguage(language: string): Array<{
        prefix: string;
        body: string;
        description: string;
    }> {
        const isJS = ['javascript', 'typescript'].includes(language);
        const isPython = language === 'python';
        const isJava = ['java', 'c', 'cpp', 'csharp'].includes(language);

        const commentStart = isPython ? '#' : isJS ? '//' : '//';
        const blockStart = isPython ? '"""' : isJS ? '/**' : '/**';
        const blockEnd = isPython ? '"""' : isJS ? '*/' : '*/';

        return [
            {
                prefix: 'todo',
                body: `${commentStart} TODO: \${1:description}`,
                description: 'Insert TODO comment'
            },
            {
                prefix: 'fixme',
                body: `${commentStart} FIXME: \${1:description}`,
                description: 'Insert FIXME comment'
            },
            {
                prefix: 'note',
                body: `${commentStart} NOTE: \${1:description}`,
                description: 'Insert NOTE comment'
            },
            {
                prefix: 'bug',
                body: `${commentStart} BUG: \${1:description}`,
                description: 'Insert BUG comment'
            },
            {
                prefix: 'hack',
                body: `${commentStart} HACK: \${1:description}`,
                description: 'Insert HACK comment'
            },
            {
                prefix: 'jsdoc',
                body: isJS ? `${blockStart}\n * \${1:description}\n * @param {\${2:type}} \${3:param} - \${4:description}\n * @returns {\${5:type}} \${6:description}\n ${blockEnd}` : '',
                description: 'Insert JSDoc comment'
            },
            {
                prefix: 'deprecated',
                body: `${commentStart} @deprecated \${1:reason}\n${commentStart} Use \${2:alternative} instead`,
                description: 'Insert deprecation comment'
            },
            {
                prefix: 'performance',
                body: `${commentStart} PERFORMANCE: \${1:note}\n${commentStart} Time: \${2:complexity}`,
                description: 'Insert performance note'
            },
            {
                prefix: 'security',
                body: `${commentStart} SECURITY: \${1:warning}\n${commentStart} Risk: \${2:level}`,
                description: 'Insert security warning'
            }
        ].filter(s => s.body !== '');
    }
}

