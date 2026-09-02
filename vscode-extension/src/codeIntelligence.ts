import * as vscode from 'vscode';
import axios from 'axios';
import { AuthManager } from './auth';

/**
 * Sanitizes and formats code returned by AI.
 * Handles cases where code might arrive with markdown fences,
 * unescaped string literals, or collapsed into a single line.
 */
export function cleanAndFormatAiCode(rawContent: string, languageId: string): string {
  if (!rawContent) return '';

  let code = rawContent.trim();

  // 1. Remove markdown code fences if present (e.g. ```typescript ... ```)
  if (code.startsWith('```')) {
    const firstNewline = code.indexOf('\n');
    if (firstNewline !== -1) {
      code = code.substring(firstNewline + 1);
    }
  }
  if (code.endsWith('```')) {
    code = code.substring(0, code.length - 3).trimEnd();
  }

  // 2. Normalize unescaped newline literals (\\n -> \n) if AI sent a stringified literal
  if (code.includes('\\n') && !code.includes('\n')) {
    code = code.replace(/\\n/g, '\n').replace(/\\t/g, '  ').replace(/\\"/g, '"');
  }

  // 3. Fallback multi-line expansion if C/JS/Python-like code collapsed into 1 single line
  const lines = code.split('\n');
  if (lines.length <= 1 && code.length > 80 && ['javascript', 'typescript', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php'].includes(languageId)) {
    code = code
      .replace(/;\s*/g, ';\n')
      .replace(/\{\s*/g, '{\n')
      .replace(/\}\s*/g, '\n}\n')
      .replace(/\n\s*\n/g, '\n');
  }

  return code.trim();
}

/**
 * Fixes bugs, syntax errors, edge-cases, and formats code for the active selection or full file.
 */
export async function fixAndFormatActiveCode(authManager: AuthManager): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('Please open a code file in the editor to fix & format.');
    return;
  }

  const document = editor.document;
  const selection = editor.selection;
  const isSelection = !selection.isEmpty;
  const targetText = isSelection ? document.getText(selection) : document.getText();
  const languageId = document.languageId || 'plaintext';

  if (!targetText.trim()) {
    vscode.window.showWarningMessage('No code found in the current selection or file.');
    return;
  }

  const token = await authManager.getToken();
  const serverUrl = await authManager.getServerUrl();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Aethria: Fixing & Formatting ${languageId.toUpperCase()} code...`,
      cancellable: false
    },
    async (progress) => {
      try {
        progress.report({ message: 'Analyzing syntax, logic & formatting...' });

        const prompt = `You are Aethria's Master Code Optimizer.
Task:
1. Fix all bugs, syntax errors, type errors, memory leaks, and logical flaws.
2. Format the code cleanly with proper multi-line indentation according to standard ${languageId} conventions.
3. Preserve all existing business logic while elevating code quality, security, and performance.
4. CRITICAL: Output ONLY the raw corrected ${languageId} code. Do NOT wrap in markdown fences (\`\`\`). Do NOT include conversational explanations or introductory words.

Original ${languageId} Code:
${targetText}`;

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await axios.post(
          `${serverUrl}/api/chat`,
          {
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1
          },
          { headers, timeout: 45000 }
        );

        const rawReply = response.data?.message?.content || '';
        const cleanedCode = cleanAndFormatAiCode(rawReply, languageId);

        if (!cleanedCode) {
          throw new Error('Received empty code response from server.');
        }

        // Apply replacement into active editor
        await editor.edit((editBuilder) => {
          if (isSelection) {
            editBuilder.replace(selection, cleanedCode);
          } else {
            const fullRange = new vscode.Range(
              document.positionAt(0),
              document.positionAt(document.getText().length)
            );
            editBuilder.replace(fullRange, cleanedCode);
          }
        });

        // Trigger VS Code native document / selection formatter
        try {
          if (isSelection) {
            await vscode.commands.executeCommand('editor.action.formatSelection');
          } else {
            await vscode.commands.executeCommand('editor.action.formatDocument');
          }
        } catch (e) {}

        vscode.window.showInformationMessage(
          `✓ Aethria: ${isSelection ? 'Selection' : 'File'} fixed and formatted successfully!`
        );
      } catch (err: any) {
        console.error('Fix code error:', err);
        vscode.window.showErrorMessage(
          `Fix Code Error: ${err.response?.data?.error || err.message || 'Failed to connect to Aethria server.'}`
        );
      }
    }
  );
}

/**
 * Adds high-quality comments, architectural explanations, and clean space separators to code.
 */
export async function explainAndCommentActiveCode(authManager: AuthManager): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('Please open a code file in the editor to explain & comment.');
    return;
  }

  const document = editor.document;
  const selection = editor.selection;
  const isSelection = !selection.isEmpty;
  const targetText = isSelection ? document.getText(selection) : document.getText();
  const languageId = document.languageId || 'plaintext';

  if (!targetText.trim()) {
    vscode.window.showWarningMessage('No code found in the current selection or file.');
    return;
  }

  const token = await authManager.getToken();
  const serverUrl = await authManager.getServerUrl();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Aethria: Adding structured comments & documentation (${languageId.toUpperCase()})...`,
      cancellable: false
    },
    async (progress) => {
      try {
        progress.report({ message: 'Generating clear inline explanations & section dividers...' });

        const prompt = `You are Aethria's Principal Software Architect & Code Craftsman.

Your mission is to transform the provided ${languageId} code into an exquisitely documented, masterclass codebase with breathtaking clarity and structure.

DOCUMENTATION GUIDELINES:
1. TOP-LEVEL ARCHITECTURAL BANNER:
   - Begin with a clean, beautifully formatted module/file header explaining the purpose, architectural role, and key responsibilities.
   Example:
   /**
    * ============================================================================
    * MODULE: [Descriptive Module Name]
    * PURPOSE: [High-level summary of responsibilities & system flow]
    * ============================================================================
    */

2. ELEGANT SECTION DIVIDERS:
   - Separate major logical phases (e.g. Configuration, State & Hooks, Event Handlers, Data Pipeline, Helper Utilities) using clean dividers:
   // --------------------------------------------------------------------------
   // SECTION: [Section Name]
   // --------------------------------------------------------------------------

3. PROFESSIONAL FUNCTION & METHOD DOCSTRINGS:
   - Use standard ${languageId} docstring conventions (e.g. JSDoc/TSDoc with @param, @returns, or Python Google-style docstrings).
   - Detail the purpose, parameters, return contracts, and edge cases.

4. INSIGHTFUL INLINE ANNOTATIONS:
   - Explain the "WHY" behind complex conditionals, regex patterns, mutations, and optimizations.
   - Avoid stating the obvious; provide real architectural and logical value.

5. CODE INTEGRITY:
   - KEEP THE EXACT FUNCTIONALITY AND LOGIC 100% INTACT.
   - Do NOT rename variables or remove existing working code.
   - Ensure clean vertical spacing and indentation.

CRITICAL FORMATTING INSTRUCTION:
- Output ONLY the raw ${languageId} code with the newly added documentation.
- Do NOT wrap in markdown code fences (\`\`\`).
- Do NOT include conversational greetings or explanations outside the code.

Source ${languageId} Code:
${targetText}`;

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await axios.post(
          `${serverUrl}/api/chat`,
          {
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
          },
          { headers, timeout: 45000 }
        );

        const rawReply = response.data?.message?.content || '';
        const cleanedCode = cleanAndFormatAiCode(rawReply, languageId);

        if (!cleanedCode) {
          throw new Error('Received empty response from server.');
        }

        // Apply replacement into active editor
        await editor.edit((editBuilder) => {
          if (isSelection) {
            editBuilder.replace(selection, cleanedCode);
          } else {
            const fullRange = new vscode.Range(
              document.positionAt(0),
              document.positionAt(document.getText().length)
            );
            editBuilder.replace(fullRange, cleanedCode);
          }
        });

        // Trigger VS Code native document / selection formatter
        try {
          if (isSelection) {
            await vscode.commands.executeCommand('editor.action.formatSelection');
          } else {
            await vscode.commands.executeCommand('editor.action.formatDocument');
          }
        } catch (e) {}

        vscode.window.showInformationMessage(
          `✓ Aethria: Added structured comments & architectural dividers!`
        );
      } catch (err: any) {
        console.error('Explain code error:', err);
        vscode.window.showErrorMessage(
          `Explain Code Error: ${err.response?.data?.error || err.message || 'Failed to connect to Aethria server.'}`
        );
      }
    }
  );
}
