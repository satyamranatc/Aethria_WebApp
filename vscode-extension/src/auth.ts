import * as vscode from 'vscode';

const TOKEN_SECRET_KEY = 'aethria_access_token';
const SERVER_URL_KEY = 'aethria_server_url';
const DEFAULT_SERVER_URL = 'https://aethria-backend.onrender.com';

export class AuthManager {
  private secrets: vscode.SecretStorage;

  constructor(context: vscode.ExtensionContext) {
    this.secrets = context.secrets;
  }

  async getToken(): Promise<string | undefined> {
    return await this.secrets.get(TOKEN_SECRET_KEY);
  }

  async setToken(token: string): Promise<void> {
    await this.secrets.store(TOKEN_SECRET_KEY, token);
  }

  async clearToken(): Promise<void> {
    await this.secrets.delete(TOKEN_SECRET_KEY);
  }

  async getServerUrl(): Promise<string> {
    const configUrl = vscode.workspace.getConfiguration('aethria').get<string>('serverUrl');
    if (configUrl && configUrl.trim()) {
      return configUrl.trim().replace(/\/+$/, '');
    }
    const secretUrl = await this.secrets.get(SERVER_URL_KEY);
    return (secretUrl || DEFAULT_SERVER_URL).replace(/\/+$/, '');
  }

  async setServerUrl(url: string): Promise<void> {
    await this.secrets.store(SERVER_URL_KEY, url);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token && token.trim().length > 10;
  }
}
