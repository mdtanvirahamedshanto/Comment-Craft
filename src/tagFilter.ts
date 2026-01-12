import * as vscode from 'vscode';
import { TagInfo } from './tagScanner';

export interface FilterOptions {
    tagNames?: string[];
    filePattern?: string;
    assignee?: string;
    dateFrom?: Date;
    dateTo?: Date;
    regex?: string;
}

export class TagFilter {
    static filter(tags: Map<string, TagInfo[]>, options: FilterOptions): Map<string, TagInfo[]> {
        const filtered = new Map<string, TagInfo[]>();

        for (const [tagName, tagInfos] of tags.entries()) {
            // Filter by tag names
            if (options.tagNames && options.tagNames.length > 0) {
                if (!options.tagNames.includes(tagName)) {
                    continue;
                }
            }

            const filteredInfos = tagInfos.filter(tagInfo => {
                // Filter by file pattern
                if (options.filePattern) {
                    const pattern = new RegExp(options.filePattern, 'i');
                    if (!pattern.test(tagInfo.filePath)) {
                        return false;
                    }
                }

                // Filter by regex on text
                if (options.regex) {
                    try {
                        const regex = new RegExp(options.regex, 'i');
                        if (!regex.test(tagInfo.fullLine)) {
                            return false;
                        }
                    } catch (error) {
                        // Invalid regex, skip this filter
                        console.error('Invalid regex pattern:', error);
                    }
                }

                // Filter by assignee (if metadata exists in comment)
                if (options.assignee) {
                    const assigneePattern = new RegExp(`@${options.assignee}\\b`, 'i');
                    if (!assigneePattern.test(tagInfo.fullLine)) {
                        return false;
                    }
                }

                // Filter by date (if metadata exists)
                // This is a placeholder - would need to parse dates from comments
                // For now, we'll just check if the file was modified in the date range
                if (options.dateFrom || options.dateTo) {
                    // Placeholder - would need file modification dates
                    // This could be enhanced to parse dates from comments
                }

                return true;
            });

            if (filteredInfos.length > 0) {
                filtered.set(tagName, filteredInfos);
            }
        }

        return filtered;
    }

    static saveFilter(name: string, options: FilterOptions): void {
        const config = vscode.workspace.getConfiguration('commentCraft');
        const savedFilters = config.get<any[]>('savedFilters', []);
        
        savedFilters.push({
            name: name,
            options: options
        });
        
        config.update('savedFilters', savedFilters, vscode.ConfigurationTarget.Global);
    }

    static getSavedFilters(): Array<{ name: string; options: FilterOptions }> {
        const config = vscode.workspace.getConfiguration('commentCraft');
        return config.get<any[]>('savedFilters', []);
    }
}

