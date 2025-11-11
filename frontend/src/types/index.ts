export interface ProjectInfo {
  name: string;
  path: string;
  types: string[];
  git: GitStatus;
  modified: ModifiedInfo;
  readme: ReadmeInfo;
}

export interface GitStatus {
  hasGit: boolean;
  branch: string | null;
  changes: number;
  ahead: number;
  behind: number;
  status: string;
}

export interface ModifiedInfo {
  text: string;
  days: number;
}

export interface ReadmeInfo {
  exists: boolean;
  content: string | null;
  preview: string | null;
}

export interface PackageInfo {
  name?: string;
  version?: string;
  description?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
