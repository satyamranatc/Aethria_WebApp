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
    let localUri = vscode.Uri.file(localFilePath);

    // Create temporary file URI for the proposed content
    const tempDir = path.join(this.workspaceRoot, '.aethria-temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `proposed_${path.basename(change.path)}`);
    fs.writeFileSync(tempFilePath, change.proposedContent, 'utf8');
    const tempUri = vscode.Uri.file(tempFilePath);

    // If local file does not exist yet on disk, create an empty placeholder in tempDir so vscode.diff doesn't fail
    let emptyPlaceholderPath: string | null = null;
    if (!fs.existsSync(localFilePath)) {
      emptyPlaceholderPath = path.join(tempDir, `empty_${path.basename(change.path)}`);
      fs.writeFileSync(emptyPlaceholderPath, '', 'utf8');
      localUri = vscode.Uri.file(emptyPlaceholderPath);
    }

    const title = `Aethria Review: ${change.path} (${change.description || 'Suggested Edit'})`;

    // Open Native VS Code Diff Editor
    await vscode.commands.executeCommand('vscode.diff', localUri, tempUri, title);

    const isNewFile = !fs.existsSync(localFilePath);
    const actionLabel = isNewFile ? 'Create File' : 'Apply Change';

    const choice = await vscode.window.showInformationMessage(
      `Aethria wants to ${isNewFile ? 'create' : 'modify'} "${change.path}": ${change.description || 'Apply AI edits?'}`,
      { modal: false },
      actionLabel,
      'Reject'
    );

    // Cleanup temp files
    try {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (emptyPlaceholderPath && fs.existsSync(emptyPlaceholderPath)) fs.unlinkSync(emptyPlaceholderPath);
      if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) fs.rmdirSync(tempDir);
    } catch (e) {}

    if (choice === actionLabel) {
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
