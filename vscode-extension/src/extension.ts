import * as vscode from 'vscode';
import { AuthManager } from './auth';
import { SyncService } from './syncService';
import { AethriaSidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  const authManager = new AuthManager(context);

  // Create Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(link) Aethria: Connect';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const syncService = new SyncService(authManager, statusBarItem);
  context.subscriptions.push({ dispose: () => syncService.dispose() });

  // Register Webview Sidebar Provider
  const sidebarProvider = new AethriaSidebarProvider(context.extensionUri, authManager, syncService);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('aethria.sidebar', sidebarProvider)
  );

  // Command: Connect Account
  context.subscriptions.push(
    vscode.commands.registerCommand('aethria.connect', async () => {
      const tokenInput = await vscode.window.showInputBox({
        prompt: 'Paste your Aethria User Token (Copy from Profile page on Web)',
        password: true,
        placeHolder: 'eyJhbGciOiJIUzI1NiIsIn...'
      });

      if (tokenInput && tokenInput.trim()) {
        await authManager.setToken(tokenInput.trim());
        vscode.window.showInformationMessage('✓ Connected to Aethria successfully!');
        statusBarItem.text = '$(check) Aethria Connected';
        statusBarItem.command = 'aethria.sync';
        sidebarProvider.updateWebview();
        syncService.syncCurrentWorkspace(false);
      }
    })
  );

  // Command: Disconnect
  context.subscriptions.push(
    vscode.commands.registerCommand('aethria.disconnect', async () => {
      await authManager.clearToken();
      statusBarItem.text = '$(link) Aethria: Connect';
      statusBarItem.command = 'aethria.connect';
      sidebarProvider.updateWebview();
      vscode.window.showInformationMessage('Disconnected from Aethria.');
    })
  );

  // Command: Manual Sync
  context.subscriptions.push(
    vscode.commands.registerCommand('aethria.sync', async () => {
      await syncService.syncCurrentWorkspace(false);
    })
  );

  // Command: Open Web Studio
  context.subscriptions.push(
    vscode.commands.registerCommand('aethria.openWeb', async () => {
      const configUrl = vscode.workspace.getConfiguration('aethria').get<string>('webUrl');
      const webUrl = configUrl && configUrl.trim() ? configUrl.trim() : 'https://www.aethria.in';
      vscode.env.openExternal(vscode.Uri.parse(webUrl));
    })
  );

  // Watch for local file changes and auto-sync
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      syncService.triggerDebouncedSync();
    }),
    vscode.workspace.onDidCreateFiles(() => {
      syncService.triggerDebouncedSync();
    }),
    vscode.workspace.onDidDeleteFiles(() => {
      syncService.triggerDebouncedSync();
    })
  );

  // Initial silent sync check if already authed
  authManager.isAuthenticated().then((authed) => {
    if (authed) {
      statusBarItem.text = '$(sync) Aethria: Ready';
      statusBarItem.command = 'aethria.sync';
      syncService.syncCurrentWorkspace(true);
    }
  });
}

export function deactivate() {}
