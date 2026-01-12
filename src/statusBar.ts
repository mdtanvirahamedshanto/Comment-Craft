import * as vscode from 'vscode';
import { TagScanner, TagInfo } from './tagScanner';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private tagScanner: TagScanner;

    constructor(tagScanner: TagScanner) {
        this.tagScanner = tagScanner;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'commentCraft.listTagsInFile';
        this.statusBarItem.tooltip = 'Click to list all tags in current file';
        this.update();
    }

    update(): void {
        const config = vscode.workspace.getConfiguration('commentCraft');
        const showInStatusBar = config.get<boolean>('showInStatusBar', true);
        const enabled = config.get<boolean>('enabled', true);

        if (!enabled || !showInStatusBar) {
            this.statusBarItem.hide();
            return;
        }

        const tags = this.tagScanner.getTags();
        const counts: { [key: string]: number } = {};

        for (const [tagName, tagInfos] of tags.entries()) {
            counts[tagName] = tagInfos.length;
        }

        // Update current file counts
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const fileTags = this.getCurrentFileTags(editor.document.uri);
            const fileCounts: { [key: string]: number } = {};
            
            for (const tagInfo of fileTags) {
                fileCounts[tagInfo.tagName] = (fileCounts[tagInfo.tagName] || 0) + 1;
            }

            if (Object.keys(fileCounts).length > 0) {
                const parts: string[] = [];
                for (const [tagName, count] of Object.entries(fileCounts)) {
                    parts.push(`${tagName}: ${count}`);
                }
                this.statusBarItem.text = `$(tag) ${parts.join(', ')}`;
                this.statusBarItem.show();
            } else {
                // Show workspace totals if no file tags
                if (Object.keys(counts).length > 0) {
                    const parts: string[] = [];
                    let total = 0;
                    for (const [tagName, count] of Object.entries(counts)) {
                        parts.push(`${tagName}: ${count}`);
                        total += count;
                    }
                    this.statusBarItem.text = `$(tag) ${total} tags`;
                    this.statusBarItem.show();
                } else {
                    this.statusBarItem.hide();
                }
            }
        } else {
            // Show workspace totals
            if (Object.keys(counts).length > 0) {
                const parts: string[] = [];
                let total = 0;
                for (const [tagName, count] of Object.entries(counts)) {
                    parts.push(`${tagName}: ${count}`);
                    total += count;
                }
                this.statusBarItem.text = `$(tag) ${total} tags`;
                this.statusBarItem.show();
            } else {
                this.statusBarItem.hide();
            }
        }
    }

    private getCurrentFileTags(uri: vscode.Uri): TagInfo[] {
        const tags = this.tagScanner.getTags();
        const fileTags: TagInfo[] = [];

        for (const tagInfos of tags.values()) {
            for (const tagInfo of tagInfos) {
                if (tagInfo.filePath === uri.fsPath) {
                    fileTags.push(tagInfo);
                }
            }
        }

        return fileTags;
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}

