import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AuthManager } from './auth';
import { SyncService } from './syncService';

export class AethriaSidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly authManager: AuthManager,
    private readonly syncService: SyncService
  ) {
    this.syncService.setOnStateChange(() => this.updateWebview());
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    this.updateWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'connect':
          vscode.commands.executeCommand('aethria.connect');
          break;
        case 'disconnect':
          vscode.commands.executeCommand('aethria.disconnect');
          break;
        case 'sync':
          vscode.commands.executeCommand('aethria.sync');
          break;
        case 'openWeb':
          vscode.commands.executeCommand('aethria.openWeb');
          break;
      }
    });
  }

  public async updateWebview() {
    if (!this._view) return;

    const isAuthed = await this.authManager.isAuthenticated();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const projectName = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].name : 'No workspace open';
    const projectId = this.syncService.getActiveProjectId();

    // Base64 Data URL for guaranteed immediate logo rendering
    let logoDataUrl = '';
    try {
      const logoDiskPath = path.join(this._extensionUri.fsPath, 'resources', 'logo.png');
      if (fs.existsSync(logoDiskPath)) {
        const logoBuffer = fs.readFileSync(logoDiskPath);
        logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (e) {
      // Fallback to asWebviewUri
      logoDataUrl = this._view.webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'resources', 'logo.png')
      ).toString();
    }

    this._view.webview.html = this.getHtmlContent(isAuthed, projectName, !projectId, logoDataUrl);
  }

  private getHtmlContent(isAuthed: boolean, projectName: string, isSynced: boolean, logoSrc: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this._view?.webview.cspSource} https: data:; style-src 'unsafe-inline' ${this._view?.webview.cspSource}; script-src 'unsafe-inline' ${this._view?.webview.cspSource};">
  <style>
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto);
      padding: 16px;
      color: var(--vscode-foreground);
      font-size: 12px;
      line-height: 1.5;
      margin: 0;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .logo-container {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(128, 128, 128, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.35);
    }
    .brand-title {
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.02em;
      color: var(--vscode-sideBarTitle-foreground, #FFFFFF);
    }
    .brand-subtitle {
      font-size: 10.5px;
      color: var(--vscode-descriptionForeground, #888888);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 11px;
      margin-bottom: 14px;
    }
    .badge-connected {
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-disconnected {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .card {
      background: var(--vscode-sideBar-background, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--vscode-widget-border, rgba(128, 128, 128, 0.18));
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 14px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }
    .project-name {
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 6px;
      color: var(--vscode-sideBarTitle-foreground);
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid rgba(128, 128, 128, 0.08);
      font-size: 11.5px;
    }
    .stat-row:last-child {
      border-bottom: none;
    }
    .stat-label {
      color: var(--vscode-descriptionForeground, #888);
    }
    .stat-val {
      font-weight: 600;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 9px 12px;
      background: var(--vscode-button-background, #4F46E5);
      color: var(--vscode-button-foreground, #FFFFFF);
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      text-align: center;
      margin-top: 8px;
      box-sizing: border-box;
      transition: opacity 0.15s, transform 0.05s;
    }
    .btn:active {
      transform: scale(0.98);
    }
    .btn:hover {
      background: var(--vscode-button-hoverBackground, #4338CA);
    }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground, rgba(128, 128, 128, 0.12));
      color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
    }
    .btn-secondary:hover {
      background: rgba(128, 128, 128, 0.2);
    }
    .footer-note {
      font-size: 10px;
      color: var(--vscode-descriptionForeground, #888);
      text-align: center;
      margin-top: 16px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      <img src="${logoSrc}" alt="Aethria" class="logo-img" />
    </div>
    <div>
      <div class="brand-title">Aethria</div>
      <div class="brand-subtitle">Project Intelligence Bridge</div>
    </div>
  </div>

  <div class="badge ${isAuthed ? 'badge-connected' : 'badge-disconnected'}">
    <span class="dot"></span>
    <span>${isAuthed ? 'Connected to Cloud' : 'Disconnected'}</span>
  </div>

  <div class="card">
    <div class="project-name">${projectName}</div>
    <div class="stat-row">
      <span class="stat-label">Sync Status</span>
      <span class="stat-val">${isSynced ? '✓ Up to date' : 'Ready'}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Security</span>
      <span class="stat-val">.env Protected</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Mode</span>
      <span class="stat-val">Incremental SHA-256</span>
    </div>
  </div>

  ${
    isAuthed
      ? `
    <button class="btn" onclick="sendMessage('sync')">✦ Sync Project</button>
    <button class="btn btn-secondary" onclick="sendMessage('openWeb')">↗ Open Aethria Studio</button>
    <button class="btn btn-secondary" style="margin-top: 14px; opacity: 0.7;" onclick="sendMessage('disconnect')">Disconnect</button>
  `
      : `
    <button class="btn" onclick="sendMessage('connect')">Connect Account</button>
  `
  }

  <div class="footer-note">Aethria · by Satyam Rana</div>

  <script>
    const vscode = acquireVsCodeApi();
    function sendMessage(type) {
      vscode.postMessage({ type });
    }
  </script>
</body>
</html>`;
  }
}
