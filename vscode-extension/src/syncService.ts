import * as vscode from 'vscode';
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

      this.statusBarItem.text = `$(sync~spin) Syncing ${scanResult.files.length} files...`;

      // 2. Incremental Sync with SHA-256 Hashes
      const response = await axios.post(
        `${serverUrl}/api/projects/sync`,
        scanResult,
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
        this.activeProjectId = response.data.project?._id || null;

        this.statusBarItem.text = `$(check) Aethria Synced (${result.total} files)`;
        this.statusBarItem.tooltip = `Last synced: ${new Date().toLocaleTimeString()}\nCreated: ${result.created}, Updated: ${result.updated}, Deleted: ${result.deleted}`;
        this.statusBarItem.command = 'aethria.openWeb';

        if (!silent) {
          vscode.window.showInformationMessage(
            `✓ Aethria Synced "${scanResult.name}": ${result.created} new, ${result.updated} updated.`
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
      await diffManager.reviewAndApplyChange(pendingChanges[0]);
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
