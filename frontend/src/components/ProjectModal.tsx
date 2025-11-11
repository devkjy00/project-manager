import type { ProjectInfo } from '../types';

interface ProjectModalProps {
  project: ProjectInfo | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{project.path}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Project Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Project Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Types: </span>
                <span>{project.types.join(', ')}</span>
              </div>
              {project.git.hasGit && (
                <>
                  <div>
                    <span className="font-semibold">Git Branch: </span>
                    <span>{project.git.branch}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Status: </span>
                    <span>{project.git.status}</span>
                  </div>
                </>
              )}
              <div>
                <span className="font-semibold">Last Modified: </span>
                <span>{project.modified.text}</span>
              </div>
            </div>
          </div>

          {/* README */}
          {project.readme.exists && project.readme.content && (
            <div>
              <h3 className="text-lg font-semibold mb-3">README.md</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap text-sm">{project.readme.content}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
