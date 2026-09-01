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

export interface ProjectScanResult {
  name: string;
  workspacePath: string;
  framework: string;
  language: string;
  gitBranch: string;
  files: ProjectFileManifest[];
  metadata: ProjectMetadata;
  totalSize: number;
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
