import type { ProjectInfo } from '../types';

interface ProjectCardProps {
  project: ProjectInfo;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-xl font-bold mb-2">{project.name}</h3>

      {/* Project Types */}
      <div className="flex flex-wrap gap-2 mb-3">
        {project.types.map((type) => (
          <span
            key={type}
            className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          >
            {type}
          </span>
        ))}
      </div>

      {/* Git Status */}
      {project.git.hasGit && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">Branch:</span>
            <span>{project.git.branch}</span>
          </div>
          {project.git.changes > 0 && (
            <div className="text-sm text-orange-600 dark:text-orange-400">
              {project.git.changes} uncommitted change{project.git.changes > 1 ? 's' : ''}
            </div>
          )}
          {(project.git.ahead > 0 || project.git.behind > 0) && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {project.git.ahead > 0 && `↑${project.git.ahead} `}
              {project.git.behind > 0 && `↓${project.git.behind}`}
            </div>
          )}
        </div>
      )}

      {/* Last Modified */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Modified: {project.modified.text}
      </div>

      {/* README Badge */}
      {project.readme.exists && (
        <div className="mt-3 text-sm text-green-600 dark:text-green-400">
          📄 README available
        </div>
      )}
    </div>
  );
}
