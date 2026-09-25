import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { RemoteChangeRequest } from './types';
import axios from 'axios';

export class DiffManager {
  private workspaceRoot: string;
  private serverUrl: string;
  private token: string;

  constructor(workspaceRoot: string, serverUrl: string, token: string) {
    this.workspaceRoot = workspaceRoot;
    this.serverUrl = serverUrl;
    this.token = token;
  }

  async reviewAndApplyChange(change: RemoteChangeRequest): Promise<boolean> {
    const localFilePath = path.join(this.workspaceRoot, change.path);
    const localUri = vscode.Uri.file(localFilePath);

    // Create temporary file URI for the proposed content
    const tempDir = path.join(this.workspaceRoot, '.aethria-temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `proposed_${path.basename(change.path)}`);
    fs.writeFileSync(tempFilePath, change.proposedContent, 'utf8');
    const tempUri = vscode.Uri.file(tempFilePath);

    const title = `Aethria Review: ${change.path} (${change.description || 'Suggested Edit'})`;

    // Open Native VS Code Diff Editor
    await vscode.commands.executeCommand('vscode.diff', localUri, tempUri, title);

    const choice = await vscode.window.showInformationMessage(
      `Aethria wants to modify "${change.path}": ${change.description || 'Apply AI edits?'}`,
      { modal: false },
      'Apply Change',
      'Reject'
    );

    // Cleanup temp file
    try {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) fs.rmdirSync(tempDir);
    } catch (e) {}

    if (choice === 'Apply Change') {
      try {
        const parentDir = path.dirname(localFilePath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }

        fs.writeFileSync(localFilePath, change.proposedContent, 'utf8');

        // Notify Aethria Backend
        await axios.patch(
          `${this.serverUrl}/api/projects/${change.projectId}/changes/${change._id}`,
          { status: 'applied' },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        vscode.window.showInformationMessage(`✓ Successfully applied change to ${change.path}`);
        return true;
      } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to apply change: ${err.message}`);
        return false;
      }
    } else {
      // Mark rejected in backend
      try {
        await axios.patch(
          `${this.serverUrl}/api/projects/${change.projectId}/changes/${change._id}`,
          { status: 'rejected' },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
      } catch (e) {}
      vscode.window.showInformationMessage(`Change to ${change.path} was rejected.`);
      return false;
    }
  }
}
