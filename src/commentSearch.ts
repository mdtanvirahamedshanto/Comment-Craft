import * as vscode from 'vscode';
import { TagScanner, TagInfo } from './tagScanner';

export class CommentSearchProvider {
    private tagScanner: TagScanner;

    constructor(tagScanner: TagScanner) {
        this.tagScanner = tagScanner;
    }

    async search(): Promise<void> {
        const searchQuery = await vscode.window.showInputBox({
            prompt: 'Enter search query (supports regex)',
            placeHolder: 'Search in comments...'
        });

        if (!searchQuery) {
            return;
        }

        const tags = this.tagScanner.getTags();
        const results: TagInfo[] = [];

        try {
            const regex = new RegExp(searchQuery, 'i');
            
            for (const tagInfos of tags.values()) {
                for (const tagInfo of tagInfos) {
                    if (regex.test(tagInfo.fullLine) || regex.test(tagInfo.text)) {
                        results.push(tagInfo);
                    }
                }
            }

            if (results.length === 0) {
                vscode.window.showInformationMessage(`No results found for "${searchQuery}"`);
                return;
            }

            // Show results in quick pick
            const items = results.map(tagInfo => ({
                label: `${tagInfo.tagName}: ${vscode.workspace.asRelativePath(tagInfo.filePath)}:${tagInfo.line + 1}`,
                description: tagInfo.fullLine.trim().substring(0, 100),
                tagInfo: tagInfo
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: `Found ${results.length} results`,
                matchOnDescription: true
            });

            if (selected && selected.tagInfo) {
                const tagInfo = selected.tagInfo;
                const uri = vscode.Uri.file(tagInfo.filePath);
                const document = await vscode.workspace.openTextDocument(uri);
                const editor = await vscode.window.showTextDocument(document);
                
                const position = new vscode.Position(tagInfo.line, tagInfo.column);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position));
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Invalid regex pattern: ${error}`);
        }
    }

    async advancedSearch(): Promise<void> {
        const tagNames = await vscode.window.showQuickPick(
            Array.from(this.tagScanner.getTags().keys()),
            {
                canPickMany: true,
                placeHolder: 'Select tags to search in'
            }
        );

        if (!tagNames || tagNames.length === 0) {
            return;
        }

        const filePattern = await vscode.window.showInputBox({
            prompt: 'File pattern (regex, optional)',
            placeHolder: 'e.g., \\.(ts|js)$'
        });

        const textPattern = await vscode.window.showInputBox({
            prompt: 'Text pattern (regex, optional)',
            placeHolder: 'Search text in comments'
        });

        const tags = this.tagScanner.getTags();
        const results: TagInfo[] = [];

        for (const tagName of tagNames) {
            const tagInfos = tags.get(tagName) || [];
            
            for (const tagInfo of tagInfos) {
                let matches = true;

                if (filePattern) {
                    try {
                        const fileRegex = new RegExp(filePattern, 'i');
                        if (!fileRegex.test(tagInfo.filePath)) {
                            matches = false;
                        }
                    } catch (error) {
                        vscode.window.showErrorMessage(`Invalid file pattern: ${error}`);
                        return;
                    }
                }

                if (textPattern && matches) {
                    try {
                        const textRegex = new RegExp(textPattern, 'i');
                        if (!textRegex.test(tagInfo.fullLine)) {
                            matches = false;
                        }
                    } catch (error) {
                        vscode.window.showErrorMessage(`Invalid text pattern: ${error}`);
                        return;
                    }
                }

                if (matches) {
                    results.push(tagInfo);
                }
            }
        }

        if (results.length === 0) {
            vscode.window.showInformationMessage('No results found');
            return;
        }

        // Show results
        const items = results.map(tagInfo => ({
            label: `${tagInfo.tagName}: ${vscode.workspace.asRelativePath(tagInfo.filePath)}:${tagInfo.line + 1}`,
            description: tagInfo.fullLine.trim().substring(0, 100),
            tagInfo: tagInfo
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `Found ${results.length} results`,
            matchOnDescription: true
        });

        if (selected && selected.tagInfo) {
            const tagInfo = selected.tagInfo;
            const uri = vscode.Uri.file(tagInfo.filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document);
            
            const position = new vscode.Position(tagInfo.line, tagInfo.column);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        }
    }
}

