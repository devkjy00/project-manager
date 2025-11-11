import { useState, useMemo } from 'react';
import { useProjects } from './hooks/useProjects';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import type { ProjectInfo } from './types';

function App() {
  const { projects, loading, error, refetch } = useProjects();
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      switch (filter) {
        case 'node':
          return project.types.includes('Node.js');
        case 'python':
          return project.types.includes('Python');
        case 'java':
          return project.types.includes('Java/Spring');
        case 'modified':
          return project.git.changes > 0;
        case 'no-git':
          return !project.git.hasGit;
        default:
          return true;
      }
    });
  }, [projects, filter]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      git: projects.filter((p) => p.git.hasGit).length,
      modified: projects.filter((p) => p.git.changes > 0).length,
      node: projects.filter((p) => p.types.includes('Node.js')).length,
    };
  }, [projects]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            📊 Project Dashboard
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-gray-600 dark:text-gray-400">Total Projects</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl font-bold">{stats.git}</div>
            <div className="text-gray-600 dark:text-gray-400">Git Repositories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.modified}</div>
            <div className="text-gray-600 dark:text-gray-400">Modified</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.node}</div>
            <div className="text-gray-600 dark:text-gray-400">Node.js Projects</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', label: 'All' },
            { id: 'node', label: 'Node.js' },
            { id: 'python', label: 'Python' },
            { id: 'java', label: 'Java/Spring' },
            { id: 'modified', label: 'Modified' },
            { id: 'no-git', label: 'No Git' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded ${
                filter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={refetch}
            className="ml-auto px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading/Error */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-xl">Loading projects...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg p-4 mb-6">
            Error: {error}
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.name}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No projects found for the selected filter.
          </div>
        )}
      </div>

      {/* Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}

export default App;
