import * as vscode from 'vscode';
import * as path from 'path';
import { TagScanner, TagInfo } from './tagScanner';

export class TagExporter {
    private tagScanner: TagScanner;

    constructor(tagScanner: TagScanner) {
        this.tagScanner = tagScanner;
    }

    async export(format?: 'json' | 'csv' | 'markdown'): Promise<void> {
        const tags = this.tagScanner.getTags();
        
        if (tags.size === 0) {
            vscode.window.showInformationMessage('No tags found to export');
            return;
        }

        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('comment-tags'),
            filters: {
                'JSON': ['json'],
                'CSV': ['csv'],
                'Markdown': ['md']
            }
        });

        if (!uri) {
            return;
        }

        try {
            let content: string;
            const extension = path.extname(uri.fsPath).toLowerCase();
            
            // Normalize format - remove leading dot if present and convert 'md' to 'markdown'
            let normalizedFormat: string = format || (extension.startsWith('.') ? extension.substring(1) : extension);
            if (normalizedFormat === 'md') {
                normalizedFormat = 'markdown';
            }

            switch (normalizedFormat as 'json' | 'csv' | 'markdown') {
                case 'json':
                    content = this.exportJSON(tags);
                    break;
                case 'csv':
                    content = this.exportCSV(tags);
                    break;
                case 'markdown':
                    content = this.exportMarkdown(tags);
                    break;
                default:
                    vscode.window.showErrorMessage('Unsupported export format');
                    return;
            }

            await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
            vscode.window.showInformationMessage(`Tags exported successfully to ${path.basename(uri.fsPath)}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export tags: ${error}`);
        }
    }

    private exportJSON(tags: Map<string, TagInfo[]>): string {
        const data: { 
            exportedAt: string; 
            tags: Array<{ 
                name: string; 
                count: number; 
                occurrences: Array<{ 
                    file: string; 
                    line: number; 
                    column: number; 
                    text: string; 
                    fullLine: string 
                }> 
            }> 
        } = {
            exportedAt: new Date().toISOString(),
            tags: []
        };

        for (const [tagName, tagInfos] of tags.entries()) {
            data.tags.push({
                name: tagName,
                count: tagInfos.length,
                occurrences: tagInfos.map(tagInfo => ({
                    file: vscode.workspace.asRelativePath(tagInfo.filePath),
                    line: tagInfo.line + 1,
                    column: tagInfo.column + 1,
                    text: tagInfo.text,
                    fullLine: tagInfo.fullLine.trim()
                }))
            });
        }

        return JSON.stringify(data, null, 2);
    }

    private exportCSV(tags: Map<string, TagInfo[]>): string {
        const lines: string[] = ['Tag,File,Line,Column,Text,Full Line'];
        
        for (const [tagName, tagInfos] of tags.entries()) {
            for (const tagInfo of tagInfos) {
                const file = vscode.workspace.asRelativePath(tagInfo.filePath);
                const line = (tagInfo.line + 1).toString();
                const column = (tagInfo.column + 1).toString();
                const text = this.escapeCSV(tagInfo.text);
                const fullLine = this.escapeCSV(tagInfo.fullLine.trim());
                
                lines.push(`${tagName},${file},${line},${column},${text},${fullLine}`);
            }
        }

        return lines.join('\n');
    }

    private exportMarkdown(tags: Map<string, TagInfo[]>): string {
        const lines: string[] = [
            '# Comment Tags Export',
            '',
            `**Exported:** ${new Date().toLocaleString()}`,
            '',
            '---',
            ''
        ];

        for (const [tagName, tagInfos] of tags.entries()) {
            lines.push(`## ${tagName} (${tagInfos.length})`);
            lines.push('');

            for (const tagInfo of tagInfos) {
                const file = vscode.workspace.asRelativePath(tagInfo.filePath);
                lines.push(`- **${file}:${tagInfo.line + 1}** - ${tagInfo.fullLine.trim()}`);
            }

            lines.push('');
        }

        return lines.join('\n');
    }

    private escapeCSV(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}

