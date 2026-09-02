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
        case 'fixCode':
          vscode.commands.executeCommand('aethria.fixCode');
          break;
        case 'explainCode':
          vscode.commands.executeCommand('aethria.explainCode');
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

    // Base64 Data URL for logo rendering
    let logoDataUrl = '';
    try {
      const logoDiskPath = path.join(this._extensionUri.fsPath, 'resources', 'logo.png');
      if (fs.existsSync(logoDiskPath)) {
        const logoBuffer = fs.readFileSync(logoDiskPath);
        logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (e) {
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
    :root {
      --apple-blur: 16px;
      --apple-radius-lg: 16px;
      --apple-radius-md: 12px;
      --apple-radius-sm: 8px;
      --apple-accent: #6366F1;
      --apple-accent-gradient: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      --apple-card-bg: rgba(255, 255, 255, 0.04);
      --apple-card-border: rgba(255, 255, 255, 0.08);
      --apple-glass-hover: rgba(255, 255, 255, 0.08);
      --apple-text-primary: var(--vscode-sideBarTitle-foreground, #FFFFFF);
      --apple-text-secondary: var(--vscode-descriptionForeground, #94A3B8);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 14px 12px;
      color: var(--vscode-foreground);
      font-size: 12px;
      line-height: 1.45;
      background: transparent;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    /* Apple-styled Glass Header */
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--apple-card-border);
    }

    .logo-container {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(79, 70, 229, 0.1) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    }

    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.3);
    }

    .brand-meta {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.02em;
      color: var(--apple-text-primary);
    }

    .brand-subtitle {
      font-size: 10.5px;
      color: var(--apple-text-secondary);
      font-weight: 400;
    }

    /* Apple Connection Pill Badge */
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 11px;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }

    .badge-connected {
      background: rgba(16, 185, 129, 0.12);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .badge-disconnected {
      background: rgba(239, 68, 68, 0.12);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.25);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
    }

    /* Frosted Glass Workspace Card */
    .glass-card {
      background: var(--apple-card-bg);
      border: 1px solid var(--apple-card-border);
      border-radius: var(--apple-radius-md);
      padding: 12px 14px;
      margin-bottom: 14px;
      backdrop-filter: blur(var(--apple-blur));
      -webkit-backdrop-filter: blur(var(--apple-blur));
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
      transition: border-color 0.2s;
    }

    .glass-card:hover {
      border-color: rgba(99, 102, 241, 0.3);
    }

    .project-name {
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 8px;
      color: var(--apple-text-primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 4.5px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 11px;
    }

    .stat-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .stat-label {
      color: var(--apple-text-secondary);
    }

    .stat-val {
      font-weight: 600;
      color: var(--apple-text-primary);
    }

    /* Section Heading */
    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      color: var(--apple-text-secondary);
      margin: 12px 0 8px 2px;
    }

    /* Action Cards & Buttons */
    .action-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }

    .action-btn-card {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      background: var(--apple-card-bg);
      border: 1px solid var(--apple-card-border);
      border-radius: var(--apple-radius-md);
      color: var(--apple-text-primary);
      cursor: pointer;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }

    .action-btn-card:hover {
      background: var(--apple-glass-hover);
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .action-btn-card:active {
      transform: scale(0.985);
    }

    .action-icon-box {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 13px;
    }

    .icon-fix {
      background: rgba(99, 102, 241, 0.18);
      color: #818CF8;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .icon-explain {
      background: rgba(16, 185, 129, 0.18);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .icon-sync {
      background: rgba(245, 158, 11, 0.18);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .icon-web {
      background: rgba(168, 85, 247, 0.18);
      color: #C084FC;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .action-text {
      flex: 1;
    }

    .action-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--apple-text-primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .action-desc {
      font-size: 10px;
      color: var(--apple-text-secondary);
      margin-top: 1px;
    }

    .primary-btn {
      width: 100%;
      padding: 10px;
      background: var(--apple-accent-gradient);
      color: #FFFFFF;
      border: none;
      border-radius: var(--apple-radius-sm);
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      transition: opacity 0.15s, transform 0.1s;
    }

    .primary-btn:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    .primary-btn:active {
      transform: scale(0.98);
    }

    .disconnect-btn {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #EF4444;
      padding: 7px;
      border-radius: var(--apple-radius-sm);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 8px;
      opacity: 0.75;
      transition: opacity 0.2s, background 0.2s;
    }

    .disconnect-btn:hover {
      opacity: 1;
      background: rgba(239, 68, 68, 0.1);
    }

    .footer-credit {
      text-align: center;
      font-size: 10px;
      color: var(--apple-text-secondary);
      margin-top: 16px;
      opacity: 0.7;
    }

    .footer-credit a {
      color: var(--apple-text-primary);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo-container">
      <img src="${logoSrc}" alt="Aethria Logo" class="logo-img" />
    </div>
    <div class="brand-meta">
      <div class="brand-title">Aethria</div>
      <div class="brand-subtitle">Project Intelligence Bridge</div>
    </div>
  </div>

  <!-- Connection Status -->
  <div class="badge-pill ${isAuthed ? 'badge-connected' : 'badge-disconnected'}">
    <span class="pulse-dot"></span>
    <span>${isAuthed ? 'Connected to Cloud' : 'Not Connected'}</span>
  </div>

  <!-- Workspace Telemetry Card -->
  <div class="glass-card">
    <div class="project-name">
      <span>${projectName}</span>
      <span style="font-size: 10px; opacity: 0.7;">${isSynced ? '✓ Synced' : 'Ready'}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Security</span>
      <span class="stat-val">.env Protected</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Sync Mode</span>
      <span class="stat-val">SHA-256 Incremental</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Engine</span>
      <span class="stat-val">Groq LPU Instant</span>
    </div>
  </div>

  ${
    isAuthed
      ? `
    <!-- AI Code Engineering Actions -->
    <div class="section-title">AI Precision Copilot</div>
    <div class="action-grid">
      <button class="action-btn-card" onclick="sendMessage('fixCode')">
        <div class="action-icon-box icon-fix">⚡</div>
        <div class="action-text">
          <div class="action-title">Fix & Format Code</div>
          <div class="action-desc">Repairs syntax, bugs & cleans indentation</div>
        </div>
      </button>

      <button class="action-btn-card" onclick="sendMessage('explainCode')">
        <div class="action-icon-box icon-explain">💡</div>
        <div class="action-text">
          <div class="action-title">Explain & Add Comments</div>
          <div class="action-desc">Adds clear notes & structured dividers</div>
        </div>
      </button>

      <button class="action-btn-card" onclick="sendMessage('sync')">
        <div class="action-icon-box icon-sync">✦</div>
        <div class="action-text">
          <div class="action-title">Sync Workspace</div>
          <div class="action-desc">Pushes local diffs to cloud project</div>
        </div>
      </button>

      <button class="action-btn-card" onclick="sendMessage('openWeb')">
        <div class="action-icon-box icon-web">↗</div>
        <div class="action-text">
          <div class="action-title">Open Web Studio</div>
          <div class="action-desc">Architecture canvas & continuous voice</div>
        </div>
      </button>
    </div>

    <button class="disconnect-btn" onclick="sendMessage('disconnect')">Disconnect Account</button>
  `
      : `
    <button class="primary-btn" onclick="sendMessage('connect')">Connect Aethria Account</button>
  `
  }

  <div class="footer-credit">
    Aethria · Crafted by <a href="https://satyamrana.in">Satyam Rana</a>
  </div>

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
