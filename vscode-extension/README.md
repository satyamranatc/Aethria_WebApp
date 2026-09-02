# Aethria — AI Coding & Project Intelligence Bridge

<p align="center">
  <img src="resources/logo.png" width="96" height="96" alt="Aethria AI Logo" />
</p>

<p align="center">
  <b>The Cutting-Edge AI Coding Assistant & Full-Stack Project Intelligence Platform</b><br>
  <i>Crafted by <a href="https://satyamrana.in">Satyam Rana</a> · Powered by Groq LPUs & Neural Voice Engine</i>
</p>

<p align="center">
  <a href="https://www.aethria.in"><img src="https://img.shields.io/badge/Web_Studio-aethria.in-4F46E5?style=flat-square" alt="Web Studio" /></a>
  <a href="https://satyamrana.in"><img src="https://img.shields.io/badge/Developer-Satyam_Rana-0F172A?style=flat-square" alt="Developer" /></a>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-10B981?style=flat-square" alt="Production Ready" />
</p>

---

## ✦ Overview

**Aethria for VS Code** is an AI coding extension that links your local workspace directly to **[Aethria Cloud](https://www.aethria.in)**. Engineered for high performance, Aethria gives you instant syntax repair, automatic code formatting, inline architectural documentation, incremental SHA-256 workspace sync, and native side-by-side diff review.

---

## 🚀 Key Features

### 1. ⚡ Fix & Format Code (`aethria.fixCode`)
* Analyzes your active selection or whole file for syntax errors, logic flaws, and edge cases.
* Formats code according to language conventions with multi-line layout and zero markdown artifacts.
* **Shortcut**: Right-click anywhere in the editor &rarr; **Aethria: Fix & Format Code**.

### 2. 💡 Explain & Add Comments (`aethria.explainCode`)
* Automatically injects clear, professional documentation directly into your code.
* Explains parameter definitions, architectural flow, and adds structured section dividers (`// -------------------------------------------------------------`).
* **Shortcut**: Right-click &rarr; **Aethria: Explain & Add Comments**.

### 3. ✦ SHA-256 Incremental Project Sync (`aethria.sync`)
* Recursively indexes your project files using SHA-256 hash matching so only modified code is synchronized.
* **.env Secret Protection**: Automatically ignores `.env`, secrets, `.git`, `node_modules`, and binary assets.

### 4. 🔀 Native Side-by-Side Diff Reviews (`aethria.viewDiff`)
* Review AI-proposed architectural refactors inside VS Code's native diff editor.
* Accept or reject changes with a single click.

---

## 🛠️ Getting Started

1. Install **Aethria** from the Visual Studio Code Marketplace.
2. Sign in or create an account at **[https://www.aethria.in](https://www.aethria.in)**.
3. Open your **Profile** page on the web app and click **Copy VS Code Token**.
4. In VS Code, click the **Aethria** icon on the Activity Bar, click **Connect Account**, and paste your token.
5. Your local repository is now connected to Aethria Cloud.

---

## ⚙️ Extension Settings

This extension contributes the following configurable settings (`settings.json`):

* `aethria.serverUrl`: Backend API endpoint *(Default: `https://aethria-backend.onrender.com`)*.
* `aethria.webUrl`: Web Studio URL *(Default: `https://www.aethria.in`)*.

```json
{
  "aethria.serverUrl": "https://aethria-backend.onrender.com",
  "aethria.webUrl": "https://www.aethria.in"
}
```

---

## 🛡️ Security & Privacy Best Practices

* **Keychain Token Storage**: Access tokens are stored using VS Code's native `context.secrets` API (OS Keychain / Windows Credential Manager).
* **Strict Secret Filtering**: Workspace scanner rejects `.env`, `.pem`, `.key`, and secret patterns.
* **Encrypted Transmission**: All communication uses TLS 1.3 HTTPS.
* **Strict Content Security Policy**: Webview uses standard locked-down CSP policies.

---

## 👨‍💻 Creator & License

* **Author**: [Satyam Rana](https://satyamrana.in)
* **Website**: [https://satyamrana.in](https://satyamrana.in)
* **Web App**: [https://www.aethria.in](https://www.aethria.in)
* **Repository**: [GitHub (satyamranatc/Aethria_WebApp)](https://github.com/satyamranatc/Aethria_WebApp)
* **License**: [MIT License](LICENSE.md) &copy; 2026 Satyam Rana
