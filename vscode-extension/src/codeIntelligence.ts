import * as vscode from 'vscode';
import * as path from 'path';
import axios from 'axios';
import { AuthManager } from './auth';

/**
 * Maps language ID to comment styling conventions and documentation rules.
 */
interface LanguageCommentProfile {
  name: string;
  singleLine: string;
  docstringStyle: string;
  bannerTemplate: (moduleName: string, desc: string) => string;
  sectionDivider: (sectionName: string) => string;
}

const LANGUAGE_COMMENT_PROFILES: Record<string, LanguageCommentProfile> = {
  python: {
    name: 'Python',
    singleLine: '#',
    docstringStyle: 'Google/NumPy Python docstrings with triple quotes """',
    bannerTemplate: (name, desc) =>
      `"""\nMODULE: ${name}\nPURPOSE: ${desc}\n"""`,
    sectionDivider: (section) =>
      `# -----------------------------------------------------------------------------\n# SECTION: ${section}\n# -----------------------------------------------------------------------------`
  },
  javascript: {
    name: 'JavaScript',
    singleLine: '//',
    docstringStyle: 'JSDoc /** ... */ with @param and @returns',
    bannerTemplate: (name, desc) =>
      `/**\n * MODULE: ${name}\n * PURPOSE: ${desc}\n */`,
    sectionDivider: (section) =>
      `// -----------------------------------------------------------------------------\n// SECTION: ${section}\n// -----------------------------------------------------------------------------`
  },
  typescript: {
    name: 'TypeScript',
    singleLine: '//',
    docstringStyle: 'TSDoc /** ... */ with type contracts, @param, and @returns',
    bannerTemplate: (name, desc) =>
      `/**\n * MODULE: ${name}\n * PURPOSE: ${desc}\n */`,
    sectionDivider: (section) =>
      `// -----------------------------------------------------------------------------\n// SECTION: ${section}\n// -----------------------------------------------------------------------------`
  },
  go: {
    name: 'Go',
    singleLine: '//',
    docstringStyle: 'Standard Go comments with leading symbol names',
    bannerTemplate: (name, desc) =>
      `// Package / Module: ${name}\n// Purpose: ${desc}`,
    sectionDivider: (section) =>
      `// -----------------------------------------------------------------------------\n// SECTION: ${section}\n// -----------------------------------------------------------------------------`
  },
  rust: {
    name: 'Rust',
    singleLine: '//',
    docstringStyle: 'Rust doc comments /// with # Arguments and # Returns',
    bannerTemplate: (name, desc) =>
      `//!\n//! Module: ${name}\n//! Purpose: ${desc}\n//!`,
    sectionDivider: (section) =>
      `// -----------------------------------------------------------------------------\n// SECTION: ${section}\n// -----------------------------------------------------------------------------`
  },
  java: {
    name: 'Java',
    singleLine: '//',
    docstringStyle: 'JavaDoc /** ... */ with @param and @return tags',
    bannerTemplate: (name, desc) =>
      `/**\n * CLASS: ${name}\n * PURPOSE: ${desc}\n */`,
    sectionDivider: (section) =>
      `// -----------------------------------------------------------------------------\n// SECTION: ${section}\n// -----------------------------------------------------------------------------`
  },
  cpp: {
    name: 'C++',
    singleLine: '//',
    docstringStyle: 'Doxygen /** ... */ with @brief, @param, and @return',
    bannerTemplate: (name, desc) =>
      `/**\n * FILE: ${name}\n * PURPOSE: ${desc}\n */`,
    sectionDivider: (section) =>
      `// -----------------------------------------------------------------------------\n// SECTION: ${section}\n// -----------------------------------------------------------------------------`
  },
  c: {
    name: 'C',
    singleLine: '//',
    docstringStyle: 'Doxygen /* ... */ with @param and @return',
    bannerTemplate: (name, desc) =>
      `/*\n * FILE: ${name}\n * PURPOSE: ${desc}\n */`,
    sectionDivider: (section) =>
      `/* -----------------------------------------------------------------------------\n * SECTION: ${section}\n * -------------------------------------------------------------------------- */`
  },
  csharp: {
    name: 'C#',
    singleLine: '//',
    docstringStyle: 'XML documentation comments /// <summary>',
    bannerTemplate: (name, desc) =>
      `/// <summary>\n/// Class: ${name}\n/// Purpose: ${desc}\n/// </summary>`,
    sectionDivider: (section) =>
      `// -----------------------------------------------------------------------------\n// SECTION: ${section}\n// -----------------------------------------------------------------------------`
  },
  php: {
    name: 'PHP',
    singleLine: '//',
    docstringStyle: 'PHPDoc /** ... */ with @param and @return',
    bannerTemplate: (name, desc) =>
      `/**\n * SCRIPT: ${name}\n * PURPOSE: ${desc}\n */`,
    sectionDivider: (section) =>
      `// -----------------------------------------------------------------------------\n// SECTION: ${section}\n// -----------------------------------------------------------------------------`
  },
  sql: {
    name: 'SQL',
    singleLine: '--',
    docstringStyle: '-- comments and /* ... */ block comments',
    bannerTemplate: (name, desc) =>
      `-- SCRIPT: ${name}\n-- PURPOSE: ${desc}`,
    sectionDivider: (section) =>
      `-- -----------------------------------------------------------------------------\n-- SECTION: ${section}\n-- -----------------------------------------------------------------------------`
  },
  html: {
    name: 'HTML',
    singleLine: '<!-- -->',
    docstringStyle: '<!-- HTML comments -->',
    bannerTemplate: (name, desc) =>
      `<!-- COMPONENT: ${name} | PURPOSE: ${desc} -->`,
    sectionDivider: (section) =>
      `<!-- =================== SECTION: ${section} =================== -->`
  },
  css: {
    name: 'CSS',
    singleLine: '/* */',
    docstringStyle: '/* CSS comments */',
    bannerTemplate: (name, desc) =>
      `/* STYLESHEET: ${name} | PURPOSE: ${desc} */`,
    sectionDivider: (section) =>
      `/* ------------------ SECTION: ${section} ------------------ */`
  },
  shell: {
    name: 'Shell Script',
    singleLine: '#',
    docstringStyle: '# comments',
    bannerTemplate: (name, desc) =>
      `# SCRIPT: ${name}\n# PURPOSE: ${desc}`,
    sectionDivider: (section) =>
      `# -----------------------------------------------------------------------------\n# SECTION: ${section}\n# -----------------------------------------------------------------------------`
  },
  json: {
    name: 'JSON',
    singleLine: '//',
    docstringStyle: 'Standard JSON',
    bannerTemplate: () => '',
    sectionDivider: () => ''
  }
};

/**
 * Intelligent Language Detector:
 * Identifies the exact programming language using VS Code languageId,
 * file extension, shebang headers, and syntactic signatures.
 */
export function detectAccurateLanguage(document: vscode.TextDocument, codeSample: string): string {
  // 1. Check native VS Code languageId if not generic plaintext
  const rawLang = (document.languageId || '').toLowerCase().trim();
  if (rawLang && rawLang !== 'plaintext' && rawLang !== '') {
    if (rawLang === 'typescriptreact' || rawLang === 'tsx') return 'typescript';
    if (rawLang === 'javascriptreact' || rawLang === 'jsx') return 'javascript';
    if (rawLang === 'shellscript' || rawLang === 'bash' || rawLang === 'zsh') return 'shell';
    if (LANGUAGE_COMMENT_PROFILES[rawLang]) return rawLang;
  }

  // 2. Check File Extension
  const ext = path.extname(document.fileName || '').toLowerCase();
  const extMap: Record<string, string> = {
    '.py': 'python',
    '.pyw': 'python',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    '.go': 'go',
    '.rs': 'rust',
    '.java': 'java',
    '.c': 'c',
    '.h': 'c',
    '.cpp': 'cpp',
    '.hpp': 'cpp',
    '.cc': 'cpp',
    '.cxx': 'cpp',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.kts': 'kotlin',
    '.sql': 'sql',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'css',
    '.less': 'css',
    '.sh': 'shell',
    '.bash': 'shell',
    '.zsh': 'shell',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml'
  };

  if (ext && extMap[ext]) {
    return extMap[ext];
  }

  // 3. Syntax & Shebang signature analysis
  const firstLines = (codeSample || '').slice(0, 500);
  if (firstLines.startsWith('#!/usr/bin/env python') || firstLines.startsWith('#!/usr/bin/python')) return 'python';
  if (firstLines.startsWith('#!/usr/bin/env node')) return 'javascript';
  if (firstLines.startsWith('#!/bin/bash') || firstLines.startsWith('#!/bin/sh')) return 'shell';

  if (firstLines.includes('import React') || firstLines.includes('export default') || firstLines.includes('const ') || firstLines.includes('function ')) {
    return firstLines.includes(': ') || firstLines.includes('<T>') || firstLines.includes('interface ') ? 'typescript' : 'javascript';
  }
  if (firstLines.includes('def ') || firstLines.includes('import ') && firstLines.includes(':')) return 'python';
  if (firstLines.includes('package ') && firstLines.includes('func ')) return 'go';
  if (firstLines.includes('fn main()') || firstLines.includes('pub fn ')) return 'rust';
  if (firstLines.includes('public class ') || firstLines.includes('public static void main')) return 'java';
  if (firstLines.includes('#include <') || firstLines.includes('int main(')) return 'cpp';
  if (firstLines.includes('<!DOCTYPE html>') || firstLines.includes('<html')) return 'html';
  if (firstLines.includes('SELECT ') || firstLines.includes('CREATE TABLE')) return 'sql';

  return 'javascript'; // Sensible default
}

/**
 * Sanitizes and cleans code returned by AI.
 * Strips markdown code fences, unescapes strings, and preserves indentation.
 */
export function cleanAndFormatAiCode(rawContent: string, languageId: string): string {
  if (!rawContent) return '';

  let code = rawContent.trim();

  // 1. Remove markdown fences (```lang ... ``` or ``` ... ```)
  if (code.startsWith('```')) {
    const firstNewline = code.indexOf('\n');
    if (firstNewline !== -1) {
      code = code.substring(firstNewline + 1);
    }
  }
  if (code.endsWith('```')) {
    code = code.substring(0, code.length - 3).trimEnd();
  }

  // 2. Normalize unescaped newline literals (\\n -> \n) if returned as stringified literal
  if (code.includes('\\n') && !code.includes('\n')) {
    code = code.replace(/\\n/g, '\n').replace(/\\t/g, '  ').replace(/\\"/g, '"');
  }

  // 3. Fallback expansion if C/JS/Python-like code collapsed into 1 single line
  const lines = code.split('\n');
  if (
    lines.length <= 1 &&
    code.length > 80 &&
    ['javascript', 'typescript', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php'].includes(languageId)
  ) {
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
 * Automatically understands the exact language and context.
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

  if (!targetText.trim()) {
    vscode.window.showWarningMessage('No code found in the current selection or file.');
    return;
  }

  // Accurately detect programming language
  const languageId = detectAccurateLanguage(document, targetText);
  const profile = LANGUAGE_COMMENT_PROFILES[languageId] || LANGUAGE_COMMENT_PROFILES['javascript'];

  const token = await authManager.getToken();
  const serverUrl = await authManager.getServerUrl();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Aethria: Fixing & Formatting ${profile.name} code...`,
      cancellable: false
    },
    async (progress) => {
      try {
        progress.report({ message: `Analyzing ${profile.name} syntax, logic & edge-cases...` });

        const prompt = `You are Aethria's Master Code Optimizer.
Target Language: ${profile.name} (${languageId})

Task:
1. Fix all ${profile.name} syntax errors, type errors, memory leaks, undefined variables, and logical flaws.
2. Format the code cleanly with proper indentation following standard ${profile.name} idiomatic style conventions.
3. Preserve all existing business logic while elevating code safety, security, and runtime performance.
4. CRITICAL: Output ONLY the raw corrected ${profile.name} code. Do NOT wrap in markdown code fences (\`\`\`). Do NOT include conversational explanations or introductory words.

Original ${profile.name} Code:
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
          `✓ Aethria: ${isSelection ? 'Selection' : 'File'} fixed & formatted (${profile.name})!`
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
 * Adds high-quality, language-specific comments, docstrings, and clean section dividers.
 * Proportionally adjusts comments: minimal for small snippets, modular for full files.
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
  const lineCount = targetText.trim().split('\n').length;
  const isSmallSnippet = isSelection || lineCount <= 20;

  if (!targetText.trim()) {
    vscode.window.showWarningMessage('No code found in the current selection or file.');
    return;
  }

  // Accurately detect programming language
  const languageId = detectAccurateLanguage(document, targetText);
  const profile = LANGUAGE_COMMENT_PROFILES[languageId] || LANGUAGE_COMMENT_PROFILES['javascript'];
  const fileName = document.fileName ? path.basename(document.fileName) : 'Module';

  const token = await authManager.getToken();
  const serverUrl = await authManager.getServerUrl();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Aethria: Documenting ${profile.name} code (${isSmallSnippet ? 'Compact' : 'Full'})...`,
      cancellable: false
    },
    async (progress) => {
      try {
        progress.report({ message: `Generating language-native comments (${profile.name})...` });

        let documentationInstruction = '';
        if (isSmallSnippet) {
          // Compact mode for small code selections (< 20 lines)
          documentationInstruction = `CODE SCOPE: SHORT SNIPPET (${lineCount} lines).
CRITICAL RULES FOR SHORT CODE:
1. DO NOT WRITE HUGE BANNERS, MASSIVE HEADERS, OR ESSAYS.
2. Add ONLY concise, proportional 1-line inline comments or a brief 1-2 line function docstring where helpful.
3. Keep comments brief, clean, and directly relevant to the specific logic.
4. Single-line comment prefix: "${profile.singleLine}". Do NOT use comment characters from other languages.`;
        } else {
          // Full file / module documentation
          documentationInstruction = `CODE SCOPE: FULL MODULE (${lineCount} lines).
DOCUMENTATION RULES:
1. Brief top-level module header summarizing purpose and key components.
2. Clean section dividers separating logical phases (e.g. Config, State, Handlers, Helpers).
3. Standard ${profile.name} docstrings (${profile.docstringStyle}) for functions and classes.
4. Single-line comment prefix: "${profile.singleLine}".
5. Meaningful inline annotations on complex algorithms or conditionals.`;
        }

        const prompt = `You are Aethria's Principal Software Architect & Code Craftsman.
Target Language: ${profile.name} (${languageId})

${documentationInstruction}

CRITICAL INTEGRITY & OUTPUT REQUIREMENTS:
- KEEP THE EXACT FUNCTIONALITY AND LOGIC 100% INTACT.
- Do NOT rename variables or remove working code.
- Output ONLY the raw ${profile.name} code with the newly added comments.
- Do NOT wrap in markdown code fences (\`\`\`).
- Do NOT include conversational greetings, explanations, or notes outside the code.

Source ${profile.name} Code (${fileName}):
${targetText}`;

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await axios.post(
          `${serverUrl}/api/chat`,
          {
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.15
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
          `✓ Aethria: Documented ${profile.name} code cleanly (${isSmallSnippet ? 'proportional snippet' : 'modular file'})!`
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
