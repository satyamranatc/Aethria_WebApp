import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ProjectScanResult, ProjectFileManifest } from './types';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'out',
  'coverage',
  '.venv',
  'venv',
  '__pycache__',
  '.idea',
  '.vscode',
  '.gradle',
  'target',
  'bin',
  'obj',
  '.turbo',
  '.cache',
  '.aethria-temp'
]);

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.mp3', '.mp4', '.wav',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.exe', '.dll', '.so', '.dylib', '.wasm',
  '.ttf', '.woff', '.woff2', '.eot', '.pyc', '.class'
]);

const SENSITIVE_EXTENSIONS = new Set([
  '.pem', '.key', '.pfx', '.p12', '.keystore', '.jks', '.der', '.crt', '.cer'
]);

const MAX_FILE_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB limit per individual file

export async function scanWorkspace(rootPath: string): Promise<ProjectScanResult> {
  const projectName = path.basename(rootPath);
  const files: ProjectFileManifest[] = [];
  let totalSize = 0;
  let framework = 'generic';
  let primaryLanguage = 'javascript';
  const dependencies: Record<string, string> = {};
  const envKeys: string[] = [];
  const entryPoints: string[] = [];
  let readmeExcerpt = '';
  let gitBranch = 'main';

  // Try detecting git branch
  try {
    const headPath = path.join(rootPath, '.git', 'HEAD');
    if (fs.existsSync(headPath)) {
      const headContent = fs.readFileSync(headPath, 'utf8').trim();
      const match = headContent.match(/ref: refs\/heads\/(.+)/);
      if (match) gitBranch = match[1];
    }
  } catch (e) {}

  // Recursive directory crawler
  function crawl(currentDir: string, relativeDir: string = '') {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      const lowerName = entry.name.toLowerCase();

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) {
          continue;
        }
        crawl(fullPath, relPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const stat = fs.statSync(fullPath);

        if (stat.size > MAX_FILE_SIZE_BYTES) {
          continue; // Skip oversized files
        }

        const isBinary = BINARY_EXTENSIONS.has(ext);
        let content = '';
        let isSensitive = false;

        // Enterprise Security Check: Redact credentials, private keys, and environment variables
        const isSecretFile =
          lowerName.startsWith('.env') ||
          SENSITIVE_EXTENSIONS.has(ext) ||
          lowerName.startsWith('id_rsa') ||
          lowerName.includes('credential') ||
          lowerName.includes('secret') ||
          lowerName === 'gcp-key.json' ||
          lowerName === 'auth.json';

        if (isSecretFile) {
          isSensitive = true;
          if (lowerName.startsWith('.env')) {
            try {
              const rawEnv = fs.readFileSync(fullPath, 'utf8');
              const lines = rawEnv.split('\n');
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                  const key = trimmed.split('=')[0]?.trim();
                  if (key) {
                    envKeys.push(key);
                  }
                }
              }
              content = `# .env keys detected (${lines.length} entries). Values secured locally by Aethria.`;
            } catch (e) {
              content = '# Protected .env';
            }
          } else {
            content = `# [PROTECTED CREDENTIAL/KEY]: ${entry.name}. Values redacted for security.`;
          }
        } else if (!isBinary) {
          try {
            content = fs.readFileSync(fullPath, 'utf8');
          } catch (e) {
            content = '';
          }
        }

        // Framework / Project detection
        if (entry.name === 'package.json') {
          try {
            const pkg = JSON.parse(content || '{}');
            const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
            Object.assign(dependencies, allDeps);

            if (allDeps['next']) framework = 'Next.js';
            else if (allDeps['react']) framework = 'React';
            else if (allDeps['express']) framework = 'Express.js';
            else if (allDeps['vue']) framework = 'Vue.js';
            else if (allDeps['@nestjs/core']) framework = 'NestJS';
          } catch (e) {}
        } else if (entry.name === 'requirements.txt' || entry.name === 'pyproject.toml') {
          if (content.includes('fastapi')) framework = 'FastAPI';
          else if (content.includes('django')) framework = 'Django';
          else if (content.includes('flask')) framework = 'Flask';
          else framework = 'Python';
          primaryLanguage = 'python';
        } else if (entry.name === 'go.mod') {
          framework = 'Go';
          primaryLanguage = 'go';
        } else if (entry.name === 'Cargo.toml') {
          framework = 'Rust';
          primaryLanguage = 'rust';
        } else if (entry.name.toLowerCase().startsWith('readme')) {
          readmeExcerpt = content.slice(0, 1000);
        }

        // Detect entry points
        if (
          [
            'src/index.ts',
            'src/main.tsx',
            'src/App.tsx',
            'src/App.jsx',
            'index.js',
            'main.py',
            'app.py',
            'server.js',
            'main.go',
            'src/main.rs'
          ].includes(relPath)
        ) {
          entryPoints.push(relPath);
        }

        // Language detection
        let language = 'plaintext';
        if (ext === '.ts' || ext === '.tsx') language = 'typescript';
        else if (ext === '.js' || ext === '.jsx') language = 'javascript';
        else if (ext === '.py') language = 'python';
        else if (ext === '.go') language = 'go';
        else if (ext === '.rs') language = 'rust';
        else if (ext === '.java') language = 'java';
        else if (ext === '.c' || ext === '.h') language = 'c';
        else if (ext === '.cpp' || ext === '.hpp' || ext === '.cc') language = 'cpp';
        else if (ext === '.cs') language = 'csharp';
        else if (ext === '.php') language = 'php';
        else if (ext === '.json') language = 'json';
        else if (ext === '.html') language = 'html';
        else if (ext === '.css' || ext === '.scss') language = 'css';
        else if (ext === '.md') language = 'markdown';
        else if (ext === '.sql') language = 'sql';
        else if (ext === '.sh') language = 'shell';

        const hash = crypto.createHash('sha256').update(content || '').digest('hex');
        totalSize += stat.size;

        files.push({
          path: relPath,
          name: entry.name,
          extension: ext,
          language,
          size: stat.size,
          hash,
          content,
          isBinary,
          isSensitive
        });
      }
    }
  }

  crawl(rootPath);

  // Set primary language
  if (files.some((f) => f.extension === '.ts' || f.extension === '.tsx')) {
    primaryLanguage = 'typescript';
  }

  return {
    name: projectName,
    workspacePath: rootPath,
    framework,
    language: primaryLanguage,
    gitBranch,
    files,
    metadata: {
      dependencies,
      envKeys,
      entryPoints,
      readmeExcerpt
    },
    totalSize
  };
}
