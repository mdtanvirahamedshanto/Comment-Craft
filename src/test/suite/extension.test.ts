import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('yourpublishername.comment-craft'));
    });

    test('Extension should activate', async () => {
        const extension = vscode.extensions.getExtension('yourpublishername.comment-craft');
        if (extension) {
            await extension.activate();
            assert.ok(extension.isActive);
        }
    });
});

