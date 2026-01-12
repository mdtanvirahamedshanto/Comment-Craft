import * as vscode from 'vscode';
import { TagInfo } from './tagScanner';

export class IssueTracker {
    static async createGitHubIssue(tagInfo: TagInfo): Promise<void> {
        const config = vscode.workspace.getConfiguration('commentCraft');
        const enabled = config.get<boolean>('githubIntegration', false);
        
        if (!enabled) {
            const action = await vscode.window.showInformationMessage(
                'GitHub integration is disabled. Enable it in settings?',
                'Enable',
                'Cancel'
            );
            
            if (action === 'Enable') {
                await config.update('githubIntegration', true, vscode.ConfigurationTarget.Global);
            } else {
                return;
            }
        }
        
        // Get repository info
        const repo = await this.getGitHubRepo();
        if (!repo) {
            vscode.window.showErrorMessage('Could not determine GitHub repository');
            return;
        }
        
        // Create issue payload
        const title = await vscode.window.showInputBox({
            prompt: 'Enter issue title',
            value: `${tagInfo.tagName}: ${tagInfo.fullLine.trim().substring(0, 50)}`
        });
        
        if (!title) {
            return;
        }
        
        const body = await vscode.window.showInputBox({
            prompt: 'Enter issue description',
            value: `Found in: ${vscode.workspace.asRelativePath(tagInfo.filePath)}:${tagInfo.line + 1}\n\n\`\`\`\n${tagInfo.fullLine.trim()}\n\`\`\``
        });
        
        if (body === undefined) {
            return;
        }
        
        // Open GitHub issue creation URL
        const issueUrl = `https://github.com/${repo.owner}/${repo.repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body || '')}`;
        vscode.env.openExternal(vscode.Uri.parse(issueUrl));
        
        vscode.window.showInformationMessage('Opening GitHub issue creation page...');
    }
    
    static async createJiraTicket(tagInfo: TagInfo): Promise<void> {
        const config = vscode.workspace.getConfiguration('commentCraft');
        const enabled = config.get<boolean>('jiraIntegration', false);
        
        if (!enabled) {
            const action = await vscode.window.showInformationMessage(
                'Jira integration is disabled. Enable it in settings?',
                'Enable',
                'Cancel'
            );
            
            if (action === 'Enable') {
                await config.update('jiraIntegration', true, vscode.ConfigurationTarget.Global);
            } else {
                return;
            }
        }
        
        // Get Jira instance URL
        const jiraUrl = await vscode.window.showInputBox({
            prompt: 'Enter Jira instance URL (e.g., https://yourcompany.atlassian.net)',
            placeHolder: 'https://yourcompany.atlassian.net'
        });
        
        if (!jiraUrl) {
            return;
        }
        
        // Get project key
        const projectKey = await vscode.window.showInputBox({
            prompt: 'Enter Jira project key',
            placeHolder: 'PROJ'
        });
        
        if (!projectKey) {
            return;
        }
        
        const title = await vscode.window.showInputBox({
            prompt: 'Enter ticket summary',
            value: `${tagInfo.tagName}: ${tagInfo.fullLine.trim().substring(0, 50)}`
        });
        
        if (!title) {
            return;
        }
        
        // Open Jira ticket creation URL
        const ticketUrl = `${jiraUrl}/secure/CreateIssue!default.jspa?pid=${projectKey}&summary=${encodeURIComponent(title)}`;
        vscode.env.openExternal(vscode.Uri.parse(ticketUrl));
        
        vscode.window.showInformationMessage('Opening Jira ticket creation page...');
    }
    
    private static async getGitHubRepo(): Promise<{ owner: string; repo: string } | null> {
        // Try to get from git remote
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }
        
        // This is a simplified version - in a real implementation,
        // you'd parse .git/config or use git commands
        // For now, prompt the user
        const repoInput = await vscode.window.showInputBox({
            prompt: 'Enter GitHub repository (owner/repo)',
            placeHolder: 'owner/repo'
        });
        
        if (!repoInput) {
            return null;
        }
        
        const parts = repoInput.split('/');
        if (parts.length !== 2) {
            vscode.window.showErrorMessage('Invalid repository format. Use owner/repo');
            return null;
        }
        
        return {
            owner: parts[0],
            repo: parts[1]
        };
    }
}

