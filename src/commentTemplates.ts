import * as vscode from 'vscode';

export interface CommentTemplate {
    name: string;
    description: string;
    template: string;
    placeholders: string[];
    category: 'function' | 'class' | 'variable' | 'todo' | 'note' | 'custom';
}

export class CommentTemplateManager {
    private templates: CommentTemplate[] = [];

    constructor() {
        this.loadDefaultTemplates();
    }

    private loadDefaultTemplates(): void {
        this.templates = [
            {
                name: 'Function Documentation',
                description: 'JSDoc style function documentation',
                template: '/**\n * ${description}\n * @param {${type}} ${param} - ${paramDescription}\n * @returns {${returnType}} ${returnDescription}\n */',
                placeholders: ['description', 'param', 'type', 'paramDescription', 'returnType', 'returnDescription'],
                category: 'function'
            },
            {
                name: 'Class Documentation',
                description: 'Class documentation template',
                template: '/**\n * ${description}\n * @class ${className}\n * @description ${classDescription}\n */',
                placeholders: ['description', 'className', 'classDescription'],
                category: 'class'
            },
            {
                name: 'TODO with Assignee',
                description: 'TODO comment with assignee',
                template: '// TODO(@${assignee}): ${description}',
                placeholders: ['assignee', 'description'],
                category: 'todo'
            },
            {
                name: 'FIXME with Priority',
                description: 'FIXME with priority level',
                template: '// FIXME [${priority}]: ${description}',
                placeholders: ['priority', 'description'],
                category: 'todo'
            },
            {
                name: 'Note with Context',
                description: 'Note with context information',
                template: '// NOTE: ${description}\n// Context: ${context}',
                placeholders: ['description', 'context'],
                category: 'note'
            },
            {
                name: 'Deprecation Warning',
                description: 'Deprecation notice template',
                template: '/**\n * @deprecated Since ${version}\n * Use ${replacement} instead\n * ${reason}\n */',
                placeholders: ['version', 'replacement', 'reason'],
                category: 'custom'
            },
            {
                name: 'Performance Note',
                description: 'Performance optimization note',
                template: '// OPTIMIZE: ${description}\n// Current: ${current}\n// Target: ${target}',
                placeholders: ['description', 'current', 'target'],
                category: 'custom'
            },
            {
                name: 'Security Warning',
                description: 'Security-related comment',
                template: '// SECURITY: ${description}\n// Risk: ${riskLevel}\n// Mitigation: ${mitigation}',
                placeholders: ['description', 'riskLevel', 'mitigation'],
                category: 'custom'
            }
        ];
    }

    async insertTemplate(templateName: string, editor: vscode.TextEditor, position: vscode.Position): Promise<void> {
        const template = this.templates.find(t => t.name === templateName);
        if (!template) {
            vscode.window.showErrorMessage(`Template "${templateName}" not found`);
            return;
        }

        const languageId = editor.document.languageId;
        const prefix = this.getCommentPrefix(languageId);
        
        // Replace comment prefix placeholders
        let content = template.template;
        if (prefix === '//') {
            content = content.replace(/\/\*\*/g, '/**').replace(/\*\//g, '*/');
        } else if (prefix === '#') {
            content = content.replace(/\/\*\*/g, '#').replace(/\*\//g, '').replace(/\n \* /g, '\n# ');
        }

        // Collect placeholder values
        const values: { [key: string]: string } = {};
        for (const placeholder of template.placeholders) {
            const value = await vscode.window.showInputBox({
                prompt: `Enter value for ${placeholder}`,
                placeHolder: placeholder
            });
            if (value === undefined) {
                return; // User cancelled
            }
            values[placeholder] = value || '';
        }

        // Replace placeholders
        let finalContent = content;
        for (const [key, value] of Object.entries(values)) {
            finalContent = finalContent.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
        }

        // Insert at position
        await editor.edit(editBuilder => {
            editBuilder.insert(position, finalContent + '\n');
        });
    }

    async showTemplatePicker(editor: vscode.TextEditor): Promise<void> {
        const selected = await vscode.window.showQuickPick(
            this.templates.map(t => ({
                label: t.name,
                description: t.description,
                detail: `Category: ${t.category}`,
                template: t
            })),
            {
                placeHolder: 'Select a comment template'
            }
        );

        if (selected) {
            const position = editor.selection.active;
            await this.insertTemplate(selected.template.name, editor, position);
        }
    }

    getTemplatesByCategory(category: string): CommentTemplate[] {
        return this.templates.filter(t => t.category === category);
    }

    addCustomTemplate(template: CommentTemplate): void {
        this.templates.push(template);
    }

    getTemplates(): CommentTemplate[] {
        return this.templates;
    }

    private getCommentPrefix(languageId: string): string {
        const prefixes: { [key: string]: string } = {
            'javascript': '//',
            'typescript': '//',
            'java': '//',
            'python': '#',
            'html': '<!--',
            'css': '/*',
            'ruby': '#',
            'shellscript': '#',
            'yaml': '#',
            'lua': '--',
            'sql': '--',
            'matlab': '%',
            'vb': "'"
        };
        return prefixes[languageId] || '//';
    }
}

