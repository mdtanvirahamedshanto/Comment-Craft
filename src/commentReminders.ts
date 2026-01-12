import * as vscode from 'vscode';
import { TagScanner, TagInfo } from './tagScanner';

export class CommentReminderManager {
    private tagScanner: TagScanner;
    private reminderInterval: NodeJS.Timeout | undefined;
    private lastReminderTime: Date = new Date();

    constructor(tagScanner: TagScanner) {
        this.tagScanner = tagScanner;
    }

    startReminders(): void {
        const config = vscode.workspace.getConfiguration('commentCraft');
        const enabled = config.get<boolean>('enableReminders', false);
        const intervalMinutes = config.get<number>('reminderInterval', 60);

        if (!enabled) {
            return;
        }

        // Clear existing interval
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
        }

        // Check for urgent tags every interval
        this.reminderInterval = setInterval(() => {
            this.checkUrgentTags();
        }, intervalMinutes * 60 * 1000);

        // Initial check
        this.checkUrgentTags();
    }

    private async checkUrgentTags(): Promise<void> {
        const tags = this.tagScanner.getTags();
        const urgentTags: TagInfo[] = [];

        // Find URGENT tags
        const urgentTagInfos = tags.get('URGENT') || [];
        for (const tagInfo of urgentTagInfos) {
            urgentTags.push(tagInfo);
        }

        // Find TODO tags older than threshold
        const config = vscode.workspace.getConfiguration('commentCraft');
        const daysThreshold = config.get<number>('reminderDaysThreshold', 7);
        
        const todoTagInfos = tags.get('TODO') || [];
        for (const tagInfo of todoTagInfos) {
            // Check if TODO has a date and is older than threshold
            const dateMatch = tagInfo.fullLine.match(/(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
                const tagDate = new Date(dateMatch[1]);
                const daysOld = (Date.now() - tagDate.getTime()) / (1000 * 60 * 60 * 24);
                if (daysOld > daysThreshold) {
                    urgentTags.push(tagInfo);
                }
            }
        }

        if (urgentTags.length > 0 && this.shouldShowReminder()) {
            const action = await vscode.window.showWarningMessage(
                `You have ${urgentTags.length} urgent comment(s) that need attention.`,
                'View Tags',
                'Dismiss',
                'Remind Later'
            );

            if (action === 'View Tags') {
                // Show tags in quick pick
                const items = urgentTags.map(tagInfo => ({
                    label: `${tagInfo.tagName}: ${vscode.workspace.asRelativePath(tagInfo.filePath)}:${tagInfo.line + 1}`,
                    description: tagInfo.fullLine.trim().substring(0, 100),
                    tagInfo: tagInfo
                }));

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select a tag to navigate to'
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
            } else if (action === 'Remind Later') {
                // Reset reminder time to 1 hour from now
                this.lastReminderTime = new Date(Date.now() + 60 * 60 * 1000);
            }
        }
    }

    private shouldShowReminder(): boolean {
        // Don't show if we've shown one in the last 30 minutes
        const timeSinceLastReminder = Date.now() - this.lastReminderTime.getTime();
        return timeSinceLastReminder > 30 * 60 * 1000;
    }

    stopReminders(): void {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
            this.reminderInterval = undefined;
        }
    }

    dispose(): void {
        this.stopReminders();
    }
}

