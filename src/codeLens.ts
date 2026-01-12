import * as vscode from 'vscode';
import { TagScanner, TagInfo } from './tagScanner';

export class TagCodeLensProvider implements vscode.CodeLensProvider {
    private tagScanner: TagScanner;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor(tagScanner: TagScanner) {
        this.tagScanner = tagScanner;
    }

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const config = vscode.workspace.getConfiguration('commentCraft');
        const enabled = config.get<boolean>('enabled', true);
        const enableCodeLens = config.get<boolean>('enableCodeLens', true);

        if (!enabled || !enableCodeLens) {
            return [];
        }

        const codeLenses: vscode.CodeLens[] = [];
        const tags = this.tagScanner.getTags();
        const fileTags: TagInfo[] = [];

        // Get all tags for this file
        for (const tagInfos of tags.values()) {
            for (const tagInfo of tagInfos) {
                if (tagInfo.filePath === document.uri.fsPath) {
                    fileTags.push(tagInfo);
                }
            }
        }

        // Create CodeLens for each tag
        for (const tagInfo of fileTags) {
            const range = new vscode.Range(
                tagInfo.line,
                tagInfo.column,
                tagInfo.line,
                tagInfo.column + tagInfo.text.length
            );

            const codeLens = new vscode.CodeLens(range);
            codeLens.command = {
                title: `$(tag) ${tagInfo.tagName} - Actions`,
                command: 'commentCraft.tagActions',
                arguments: [tagInfo]
            };

            codeLenses.push(codeLens);
        }

        return codeLenses;
    }

    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        return codeLens;
    }

    refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }
}

