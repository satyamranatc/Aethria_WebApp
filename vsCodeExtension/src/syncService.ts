import * as vscode from 'vscode';
import * as path from 'path';
import axios from 'axios';
import { scanWorkspace } from './scanner';
import { AuthManager } from './auth';
import { DiffManager } from './diffManager';
import { RemoteChangeRequest } from './types';

export class SyncService {
  private authManager: AuthManager;
  private statusBarItem: vscode.StatusBarItem;
  private isSyncing = false;
  private syncTimeout: NodeJS.Timeout | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private activeProjectId: string | null = null;
  private activeProjectName: string | null = null;
  private activeProjectFramework: string | null = null;
  private onStateChangeCallback?: () => void;
  private notifiedChangeIds = new Set<string>();

  constructor(authManager: AuthManager, statusBarItem: vscode.StatusBarItem) {
    this.authManager = authManager;
    this.statusBarItem = statusBarItem;
  }

  public setOnStateChange(cb: () => void) {
    this.onStateChangeCallback = cb;
  }

  private notifyStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback();
    }
  }

  public getActiveProjectId(): string | null {
    return this.activeProjectId;
  }

  public getActiveProjectDetails() {
    return {
      id: this.activeProjectId,
      name: this.activeProjectName,
      framework: this.activeProjectFramework
    };
  }

  public async assignProject(): Promise<boolean> {
    const token = await this.authManager.getToken();
    const serverUrl = await this.authManager.getServerUrl();
    if (!token) {
      vscode.window.showInformationMessage('Please connect your Aethria account first.');
      return false;
    }

    try {
      const res = await axios.get(`${serverUrl}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projects = res.data?.projects || [];

      interface ProjectQuickPickItem extends vscode.QuickPickItem {
        projectId?: string;
        isCreate?: boolean;
        projectName?: string;
        framework?: string;
      }

      const items: ProjectQuickPickItem[] = projects.map((p: any) => ({
        label: `$(folder) ${p.name}`,
        description: `${p.framework || 'Web'} • ${p.stats?.totalFiles || 0} files`,
        detail: p.description || (p.workspacePath ? `Linked: ${p.workspacePath}` : 'Cloud Project'),
        projectId: p._id,
        projectName: p.name,
        framework: p.framework
      }));

      items.unshift({
        label: '$(plus) Create New Aethria Cloud Project',
        description: 'Initialize a fresh cloud project for this folder',
        isCreate: true
      });

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select an Aethria Cloud Project to link with this VS Code workspace'
      });

      if (!selected) return false;

      if (selected.isCreate) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const defaultName = workspaceFolders && workspaceFolders.length > 0 ? path.basename(workspaceFolders[0].uri.fsPath) : 'My Project';
        const nameInput = await vscode.window.showInputBox({
          prompt: 'Enter name for new Aethria Cloud Project',
          value: defaultName
        });
        if (!nameInput || !nameInput.trim()) return false;

        const createRes = await axios.post(
          `${serverUrl}/api/projects`,
          { name: nameInput.trim(), framework: 'generic' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newProj = createRes.data?.project;
        if (newProj?._id) {
          this.activeProjectId = newProj._id;
          this.activeProjectName = newProj.name;
          this.activeProjectFramework = newProj.framework;
          await vscode.workspace.getConfiguration('aethria').update('projectId', newProj._id, vscode.ConfigurationTarget.Workspace);
          vscode.window.showInformationMessage(`✓ Created and assigned project "${newProj.name}"!`);
          this.notifyStateChange();
          await this.syncCurrentWorkspace(false);
          return true;
        }
      } else if (selected.projectId) {
        this.activeProjectId = selected.projectId;
        this.activeProjectName = selected.projectName || selected.label.replace('$(folder) ', '');
        this.activeProjectFramework = selected.framework || null;
        await vscode.workspace.getConfiguration('aethria').update('projectId', selected.projectId, vscode.ConfigurationTarget.Workspace);
        vscode.window.showInformationMessage(`✓ Assigned workspace to "${this.activeProjectName}"!`);
        this.notifyStateChange();
        await this.syncCurrentWorkspace(false);
        return true;
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Failed to assign project: ${err.response?.data?.error || err.message}`);
    }
    return false;
  }

  public async syncCurrentWorkspace(silent = false): Promise<boolean> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      if (!silent) vscode.window.showWarningMessage('No active workspace folder to sync.');
      return false;
    }

    const token = await this.authManager.getToken();
    if (!token) {
      this.statusBarItem.text = '$(link) Aethria: Connect';
      this.statusBarItem.tooltip = 'Click to connect your Aethria account';
      this.statusBarItem.command = 'aethria.connect';
      this.statusBarItem.show();
      if (!silent) vscode.window.showInformationMessage('Please connect your Aethria account to sync.');
      return false;
    }

    if (this.isSyncing) return false;
    this.isSyncing = true;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const serverUrl = await this.authManager.getServerUrl();

    this.statusBarItem.text = '$(sync~spin) Aethria: Scanning...';
    this.statusBarItem.show();

    try {
      // 1. Scan workspace with .gitignore compliance & .env protection
      const scanResult = await scanWorkspace(rootPath);

      // Check configured or cached projectId
      const configProjectId = vscode.workspace.getConfiguration('aethria').get<string>('projectId');
      const targetProjectId = this.activeProjectId || (configProjectId && configProjectId.trim() ? configProjectId.trim() : null);

      this.statusBarItem.text = `$(sync~spin) Syncing ${scanResult.files.length} files...`;

      // 2. Incremental Sync with SHA-256 Hashes
      const response = await axios.post(
        `${serverUrl}/api/projects/sync`,
        {
          ...scanResult,
          ...(targetProjectId ? { projectId: targetProjectId } : {})
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      if (response.data?.success) {
        const result = response.data.syncResult;
        this.activeProjectId = response.data.project?._id || this.activeProjectId;
        this.activeProjectName = response.data.project?.name || scanResult.name;
        this.activeProjectFramework = response.data.project?.framework || scanResult.framework;

        this.statusBarItem.text = `$(check) Aethria Synced (${result.total} files)`;
        this.statusBarItem.tooltip = `Project: ${this.activeProjectName} (${this.activeProjectFramework})\nLast synced: ${new Date().toLocaleTimeString()}\nCreated: ${result.created}, Updated: ${result.updated}, Deleted: ${result.deleted}`;
        this.statusBarItem.command = 'aethria.openWeb';

        if (!silent) {
          vscode.window.showInformationMessage(
            `✓ Aethria Synced "${this.activeProjectName}": ${result.created} new, ${result.updated} updated.`
          );
        }

        this.notifyStateChange();
        this.startChangePolling(serverUrl, token, this.activeProjectId!);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Aethria Sync Error:', error);
      this.statusBarItem.text = '$(error) Aethria: Sync Failed';
      this.statusBarItem.tooltip = error.response?.data?.error || error.message || 'Sync failed';
      if (!silent) {
        vscode.window.showErrorMessage(`Sync Error: ${error.response?.data?.error || error.message}`);
      }
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // Auto-sync debouncer when developer saves or creates files
  public triggerDebouncedSync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.syncCurrentWorkspace(true);
    }, 2000); // 2-second debounce
  }

  // Manually review pending changes via Command or Status Bar Click
  public async reviewPendingChanges(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('No active workspace folder to apply changes.');
      return;
    }

    const token = await this.authManager.getToken();
    const serverUrl = await this.authManager.getServerUrl();
    if (!token || !this.activeProjectId) {
      vscode.window.showInformationMessage('Please connect your Aethria account to review changes.');
      return;
    }

    try {
      const res = await axios.get(`${serverUrl}/api/projects/${this.activeProjectId}/changes?status=pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pendingChanges: RemoteChangeRequest[] = res.data?.changes || [];
      if (pendingChanges.length === 0) {
        vscode.window.showInformationMessage('✓ All Aethria change proposals have been reviewed.');
        this.statusBarItem.text = '$(check) Aethria Synced';
        this.statusBarItem.command = 'aethria.openWeb';
        return;
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      const diffManager = new DiffManager(rootPath, serverUrl, token);
      for (const change of pendingChanges) {
        await diffManager.reviewAndApplyChange(change);
      }
      this.notifyStateChange();
    } catch (err: any) {
      vscode.window.showErrorMessage(`Failed to fetch pending changes: ${err.message}`);
    }
  }

  // Poll for pending remote change requests from Aethria Web
  private startChangePolling(serverUrl: string, token: string, projectId: string) {
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.pollInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/projects/${projectId}/changes?status=pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const pendingChanges: RemoteChangeRequest[] = res.data?.changes || [];
        if (pendingChanges.length > 0) {
          this.statusBarItem.text = `$(git-pull-request) Aethria: ${pendingChanges.length} Pending Diff${pendingChanges.length > 1 ? 's' : ''}`;
          this.statusBarItem.tooltip = `${pendingChanges.length} pending change proposal(s). Click to review diff.`;
          this.statusBarItem.command = 'aethria.reviewChanges';

          // Notify only for newly surfaced proposals
          const unnotified = pendingChanges.filter((c) => !this.notifiedChangeIds.has(c._id));
          if (unnotified.length > 0) {
            unnotified.forEach((c) => this.notifiedChangeIds.add(c._id));
            const first = unnotified[0];
            vscode.window
              .showInformationMessage(
                `✦ Aethria proposed a change to "${first.path}": ${first.description || 'Review diff?'}`,
                'Review Diff',
                'Later'
              )
              .then((action) => {
                if (action === 'Review Diff') {
                  this.reviewPendingChanges();
                }
              });
          }
        } else {
          this.statusBarItem.text = `$(check) Aethria Synced`;
          this.statusBarItem.tooltip = 'All files synchronized with Aethria Cloud';
          this.statusBarItem.command = 'aethria.openWeb';
        }
      } catch (e) {
        // Silent poll error
      }
    }, 5000);
  }

  public dispose() {
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}
