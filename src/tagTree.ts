import * as vscode from 'vscode';
import { TagInfo } from './tagScanner';

export class TagTreeProvider implements vscode.TreeDataProvider<TagTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TagTreeItem | undefined | null | void> = new vscode.EventEmitter<TagTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TagTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private tags: Map<string, TagInfo[]> = new Map();
    private groupBy: 'tag' | 'file' = 'tag';

    constructor() {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    setTags(tags: Map<string, TagInfo[]>): void {
        this.tags = tags;
        this.refresh();
    }

    setGroupBy(groupBy: 'tag' | 'file'): void {
        this.groupBy = groupBy;
        this.refresh();
    }

    getTreeItem(element: TagTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TagTreeItem): Thenable<TagTreeItem[]> {
        if (!element) {
            // Root level
            if (this.groupBy === 'tag') {
                return Promise.resolve(this.getTagGroupedItems());
            } else {
                return Promise.resolve(this.getFileGroupedItems());
            }
        } else {
            // Child level
            return Promise.resolve(element.children || []);
        }
    }

    private getTagGroupedItems(): TagTreeItem[] {
        const items: TagTreeItem[] = [];
        
        for (const [tagName, tagInfos] of this.tags.entries()) {
            const count = tagInfos.length;
            const item = new TagTreeItem(
                `${tagName} (${count})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                tagName,
                undefined,
                undefined
            );
            
            item.children = tagInfos.map(tagInfo => {
                const fileName = vscode.workspace.asRelativePath(tagInfo.filePath);
                const lineInfo = `${fileName}:${tagInfo.line + 1}`;
                return new TagTreeItem(
                    lineInfo,
                    vscode.TreeItemCollapsibleState.None,
                    tagName,
                    tagInfo.filePath,
                    tagInfo.line,
                    tagInfo.text
                );
            });
            
            items.push(item);
        }
        
        return items.sort((a, b) => a.label!.toString().localeCompare(b.label!.toString()));
    }

    private getFileGroupedItems(): TagTreeItem[] {
        const fileMap = new Map<string, TagInfo[]>();
        
        for (const tagInfos of this.tags.values()) {
            for (const tagInfo of tagInfos) {
                const filePath = tagInfo.filePath;
                if (!fileMap.has(filePath)) {
                    fileMap.set(filePath, []);
                }
                fileMap.get(filePath)!.push(tagInfo);
            }
        }
        
        const items: TagTreeItem[] = [];
        for (const [filePath, tagInfos] of fileMap.entries()) {
            const fileName = vscode.workspace.asRelativePath(filePath);
            const item = new TagTreeItem(
                `${fileName} (${tagInfos.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                filePath,
                undefined
            );
            
            item.children = tagInfos.map(tagInfo => {
                const lineInfo = `Line ${tagInfo.line + 1}: ${tagInfo.tagName}`;
                return new TagTreeItem(
                    lineInfo,
                    vscode.TreeItemCollapsibleState.None,
                    tagInfo.tagName,
                    filePath,
                    tagInfo.line,
                    tagInfo.text
                );
            });
            
            items.push(item);
        }
        
        return items.sort((a, b) => a.label!.toString().localeCompare(b.label!.toString()));
    }
}

export class TagTreeItem extends vscode.TreeItem {
    children?: TagTreeItem[];
    tagName?: string;
    filePath?: string;
    line?: number;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        tagName?: string,
        filePath?: string,
        line?: number,
        text?: string
    ) {
        super(label, collapsibleState);
        this.tagName = tagName;
        this.filePath = filePath;
        this.line = line;
        
        if (filePath && line !== undefined) {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [
                    vscode.Uri.file(filePath),
                    {
                        selection: new vscode.Range(line, 0, line, 0)
                    }
                ]
            };
            this.tooltip = text || `${filePath}:${line + 1}`;
        }
        
        if (tagName) {
            const config = vscode.workspace.getConfiguration('commentCraft');
            const tags = config.get<any[]>('tags', []);
            const tagConfig = tags.find(t => t.tag === tagName);
            if (tagConfig) {
                this.iconPath = new vscode.ThemeIcon('tag', new vscode.ThemeColor('textLink.foreground'));
            }
        }
    }
}

