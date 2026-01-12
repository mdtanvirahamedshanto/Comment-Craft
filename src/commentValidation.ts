import * as vscode from 'vscode';

export interface ValidationResult {
    file: string;
    line: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    code: string;
}

export class CommentValidator {
    async validateFile(document: vscode.TextDocument): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Check for functions without comments
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Detect function declarations
            const functionPatterns = [
                /^(public|private|protected)?\s*(async\s+)?function\s+\w+\s*\(/,
                /^(public|private|protected)?\s*(async\s+)?\w+\s*[:=]\s*(async\s+)?\(/,
                /^(public|private|protected)?\s*(async\s+)?const\s+\w+\s*=\s*(async\s+)?\(/,
                /^def\s+\w+\s*\(/,
                /^class\s+\w+/,
                /^(public|private|protected)?\s*class\s+\w+/
            ];

            for (const pattern of functionPatterns) {
                if (pattern.test(trimmed)) {
                    // Check if there's a comment above
                    let hasComment = false;
                    if (i > 0) {
                        const prevLine = lines[i - 1].trim();
                        const commentPatterns = [
                            /^\/\//,
                            /^\/\*\*/,
                            /^#/,
                            /^<!--/
                        ];
                        
                        for (const commentPattern of commentPatterns) {
                            if (commentPattern.test(prevLine)) {
                                hasComment = true;
                                break;
                            }
                        }
                    }

                    if (!hasComment) {
                        results.push({
                            file: document.fileName,
                            line: i + 1,
                            severity: 'warning',
                            message: `Function/class "${trimmed.substring(0, 50)}" lacks documentation`,
                            code: trimmed
                        });
                    }
                }
            }

            // Check for TODO without assignee or date
            if (/TODO|FIXME/i.test(trimmed)) {
                if (!/@\w+/.test(trimmed) && !/\d{4}-\d{2}-\d{2}/.test(trimmed)) {
                    results.push({
                        file: document.fileName,
                        line: i + 1,
                        severity: 'info',
                        message: 'TODO/FIXME comment should include assignee or date',
                        code: trimmed
                    });
                }
            }

            // Check for commented-out code
            if (/^\/\/\s*(if|for|while|function|const|let|var|class)/.test(trimmed)) {
                results.push({
                    file: document.fileName,
                    line: i + 1,
                    severity: 'warning',
                    message: 'Commented-out code detected - consider removing',
                    code: trimmed
                });
            }
        }

        return results;
    }

    async validateWorkspace(): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];
        const files = await vscode.workspace.findFiles(
            '**/*.{ts,js,tsx,jsx,py,java,cpp,c,cs}',
            '**/{node_modules,.git,dist,build,out}/**',
            100
        );

        for (const file of files) {
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const fileResults = await this.validateFile(document);
                results.push(...fileResults);
            } catch (error) {
                console.error(`Error validating ${file.fsPath}:`, error);
            }
        }

        return results;
    }

    async showValidationResults(results: ValidationResult[]): Promise<void> {
        if (results.length === 0) {
            vscode.window.showInformationMessage('No validation issues found!');
            return;
        }

        const diagnosticCollection = vscode.languages.createDiagnosticCollection('commentCraft');
        const diagnosticsByFile = new Map<string, vscode.Diagnostic[]>();

        for (const result of results) {
            if (!diagnosticsByFile.has(result.file)) {
                diagnosticsByFile.set(result.file, []);
            }

            const severity = result.severity === 'error' 
                ? vscode.DiagnosticSeverity.Error
                : result.severity === 'warning'
                ? vscode.DiagnosticSeverity.Warning
                : vscode.DiagnosticSeverity.Information;

            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(result.line - 1, 0, result.line - 1, 100),
                result.message,
                severity
            );

            diagnosticsByFile.get(result.file)!.push(diagnostic);
        }

        for (const [file, diagnostics] of diagnosticsByFile.entries()) {
            diagnosticCollection.set(vscode.Uri.file(file), diagnostics);
        }

        vscode.window.showInformationMessage(
            `Found ${results.length} validation issue(s). Check Problems panel.`
        );
    }
}

