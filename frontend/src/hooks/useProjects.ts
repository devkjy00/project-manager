import { useState, useEffect } from 'react';
import type { ProjectInfo } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchProjects, 30000);

    return () => clearInterval(interval);
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
}
