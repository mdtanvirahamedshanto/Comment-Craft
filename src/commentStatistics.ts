import * as vscode from 'vscode';
import { TagScanner, TagInfo } from './tagScanner';

export interface CommentStatistics {
    totalTags: number;
    tagsByType: { [tagName: string]: number };
    tagsByFile: { [fileName: string]: number };
    mostCommonTag: string;
    filesWithMostTags: Array<{ file: string; count: number }>;
    totalFiles: number;
    averageTagsPerFile: number;
}

export class CommentStatisticsProvider {
    private tagScanner: TagScanner;

    constructor(tagScanner: TagScanner) {
        this.tagScanner = tagScanner;
    }

    async generateStatistics(): Promise<CommentStatistics> {
        const tags = this.tagScanner.getTags();
        
        const stats: CommentStatistics = {
            totalTags: 0,
            tagsByType: {},
            tagsByFile: {},
            mostCommonTag: '',
            filesWithMostTags: [],
            totalFiles: 0,
            averageTagsPerFile: 0
        };

        const fileMap = new Map<string, number>();

        for (const [tagName, tagInfos] of tags.entries()) {
            stats.tagsByType[tagName] = tagInfos.length;
            stats.totalTags += tagInfos.length;

            for (const tagInfo of tagInfos) {
                const file = vscode.workspace.asRelativePath(tagInfo.filePath);
                fileMap.set(file, (fileMap.get(file) || 0) + 1);
                stats.tagsByFile[file] = (stats.tagsByFile[file] || 0) + 1;
            }
        }

        // Find most common tag
        let maxCount = 0;
        for (const [tagName, count] of Object.entries(stats.tagsByType)) {
            if (count > maxCount) {
                maxCount = count;
                stats.mostCommonTag = tagName;
            }
        }

        // Get files with most tags
        stats.filesWithMostTags = Array.from(fileMap.entries())
            .map(([file, count]) => ({ file, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        stats.totalFiles = fileMap.size;
        stats.averageTagsPerFile = stats.totalFiles > 0 
            ? stats.totalTags / stats.totalFiles 
            : 0;

        return stats;
    }

    async showStatisticsPanel(): Promise<void> {
        const stats = await this.generateStatistics();
        
        const panel = vscode.window.createWebviewPanel(
            'commentStatistics',
            'Comment Statistics',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = this.getStatisticsHtml(stats);
    }

    private getStatisticsHtml(stats: CommentStatistics): string {
        const tagsByTypeHtml = Object.entries(stats.tagsByType)
            .map(([tag, count]) => `
                <tr>
                    <td><strong>${tag}</strong></td>
                    <td>${count}</td>
                    <td><div class="progress-bar"><div class="progress" style="width: ${(count / stats.totalTags) * 100}%"></div></div></td>
                </tr>
            `).join('');

        const topFilesHtml = stats.filesWithMostTags
            .map(({ file, count }) => `
                <tr>
                    <td>${file}</td>
                    <td>${count}</td>
                </tr>
            `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        padding: 20px;
                        color: var(--vscode-foreground);
                        background: var(--vscode-editor-background);
                    }
                    h1, h2 {
                        color: var(--vscode-textLink-foreground);
                    }
                    .stat-card {
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                        padding: 15px;
                        margin: 10px 0;
                    }
                    .stat-value {
                        font-size: 2em;
                        font-weight: bold;
                        color: var(--vscode-textLink-foreground);
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border-bottom: 1px solid var(--vscode-panel-border);
                    }
                    th {
                        background: var(--vscode-list-activeSelectionBackground);
                    }
                    .progress-bar {
                        width: 100%;
                        height: 20px;
                        background: var(--vscode-progressBar-background);
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .progress {
                        height: 100%;
                        background: var(--vscode-progressBar-background);
                        transition: width 0.3s;
                    }
                </style>
            </head>
            <body>
                <h1>📊 Comment Statistics</h1>
                
                <div class="stat-card">
                    <div class="stat-value">${stats.totalTags}</div>
                    <div>Total Tags</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${stats.totalFiles}</div>
                    <div>Files with Tags</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${stats.averageTagsPerFile.toFixed(1)}</div>
                    <div>Average Tags per File</div>
                </div>
                
                <h2>Tags by Type</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Tag</th>
                            <th>Count</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tagsByTypeHtml}
                    </tbody>
                </table>
                
                <h2>Top 10 Files with Most Tags</h2>
                <table>
                    <thead>
                        <tr>
                            <th>File</th>
                            <th>Tag Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topFilesHtml}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    }
}

