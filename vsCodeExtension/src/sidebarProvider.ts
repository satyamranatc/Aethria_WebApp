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

    this._view.webview.html = this.getHtmlContent(isAuthed, logoDataUrl);
  }

  private getHtmlContent(isAuthed: boolean, logoSrc: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this._view?.webview.cspSource} https: data:; style-src 'unsafe-inline' ${this._view?.webview.cspSource}; script-src 'unsafe-inline' ${this._view?.webview.cspSource};">
  <style>
    :root {
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

    /* Apple-styled Header */
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
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
      margin-bottom: 14px;
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

    /* Section Heading */
    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      color: var(--apple-text-secondary);
      margin: 10px 0 8px 2px;
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
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .action-icon-box svg {
      display: block;
    }

    .icon-fix {
      background: rgba(99, 102, 241, 0.16);
      color: #818CF8;
      border: 1px solid rgba(99, 102, 241, 0.28);
    }

    .icon-explain {
      background: rgba(16, 185, 129, 0.16);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.28);
    }

    .icon-sync {
      background: rgba(245, 158, 11, 0.16);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.28);
    }

    .icon-web {
      background: rgba(168, 85, 247, 0.16);
      color: #C084FC;
      border: 1px solid rgba(168, 85, 247, 0.28);
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
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
      margin-top: 18px;
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

  ${
    isAuthed
      ? `
    <!-- AI Actions -->
    <div class="section-title">AI Actions</div>
    <div class="action-grid">
      <!-- Fix & Format Code -->
      <button class="action-btn-card" onclick="sendMessage('fixCode')">
        <div class="action-icon-box icon-fix">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
          </svg>
        </div>
        <div class="action-text">
          <div class="action-title">Fix & Format Code</div>
          <div class="action-desc">Repairs syntax, bugs & cleans indentation</div>
        </div>
      </button>

      <!-- Explain & Add Comments -->
      <button class="action-btn-card" onclick="sendMessage('explainCode')">
        <div class="action-icon-box icon-explain">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M8 9h8"/>
            <path d="M8 13h6"/>
          </svg>
        </div>
        <div class="action-text">
          <div class="action-title">Explain & Add Comments</div>
          <div class="action-desc">Adds clear notes & structured dividers</div>
        </div>
      </button>

      <!-- Sync Workspace -->
      <button class="action-btn-card" onclick="sendMessage('sync')">
        <div class="action-icon-box icon-sync">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
        </div>
        <div class="action-text">
          <div class="action-title">Sync Workspace</div>
          <div class="action-desc">Pushes local diffs to cloud project</div>
        </div>
      </button>

      <!-- Open Web Studio -->
      <button class="action-btn-card" onclick="sendMessage('openWeb')">
        <div class="action-icon-box icon-web">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6"/>
            <path d="M10 14 21 3"/>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          </svg>
        </div>
        <div class="action-text">
          <div class="action-title">Open Web Studio</div>
          <div class="action-desc">Architecture canvas & continuous voice</div>
        </div>
      </button>
    </div>

    <button class="disconnect-btn" onclick="sendMessage('disconnect')">Disconnect Account</button>
  `
      : `
    <button class="primary-btn" onclick="sendMessage('connect')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      Connect Aethria Account
    </button>
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
