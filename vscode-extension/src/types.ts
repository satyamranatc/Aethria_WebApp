export interface ProjectFileManifest {
  path: string;
  name: string;
  extension: string;
  language: string;
  size: number;
  hash: string;
  content?: string;
  isBinary?: boolean;
  isSensitive?: boolean;
}

export interface ProjectMetadata {
  dependencies: Record<string, string>;
  envKeys: string[];
  entryPoints: string[];
  readmeExcerpt: string;
}

export interface ProjectStats {
  totalFiles: number;
  totalFolders: number;
  totalLinesOfCode: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  totalSize: number;
  languages: {
    name: string;
    filesCount: number;
    linesCount: number;
    percentage: number;
  }[];
}

export interface ProjectScanResult {
  name: string;
  workspacePath: string;
  framework: string;
  language: string;
  gitBranch: string;
  files: ProjectFileManifest[];
  metadata: ProjectMetadata;
  totalSize: number;
  stats?: ProjectStats;
}


export interface RemoteChangeRequest {
  _id: string;
  projectId: string;
  path: string;
  type: 'create' | 'update' | 'delete';
  description: string;
  originalContent: string;
  proposedContent: string;
  diff: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
}
