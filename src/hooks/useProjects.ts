// hooks/useProjects.ts
import { useState, useEffect, useCallback } from 'react';
import { getAllDocuments, getDocument, queryDocuments } from '../utils/firebase/database';
import { Project } from '../types';

export function useProjects(options?: {
  category?: string;
  limit?: number;
  orderByField?: keyof Project;
  orderDirection?: 'asc' | 'desc';
  refreshTrigger?: number; // Add this for manual refresh triggers
}) {
  const [data, setData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Create conditions array if category is provided
      const conditions = [];
      if (options?.category && options.category !== 'All') {
        conditions.push(['category', '==', options.category]);
      }
      
      // Determine which fetch method to use based on options
      let result;
      if (conditions.length > 0 || options?.orderByField || options?.limit) {
        result = await queryDocuments(
          'projects',
          conditions,
          options?.orderByField as string,
          options?.orderDirection || 'asc',
          options?.limit || null
        );
      } else {
        result = await getAllDocuments('projects');
      }
      
      if (result.success) {
        setData(result.data as Project[]);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [options?.category, options?.limit, options?.orderByField, options?.orderDirection]);

  // Initial fetch and refresh trigger effect
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, options?.refreshTrigger]);

  // Listen for Firebase database events to trigger automatic refresh
  useEffect(() => {
    const handleProjectUpdate = () => {
      fetchProjects();
    };

    // Listen for specific project events from Firebase database
    window.addEventListener('projectsCreated', handleProjectUpdate);
    window.addEventListener('projectsUpdated', handleProjectUpdate);
    window.addEventListener('projectsDeleted', handleProjectUpdate);
    
    // Also listen for generic database updates (optional)
    window.addEventListener('databaseUpdated', (event) => {
      if (event.detail?.collection === 'projects') {
        handleProjectUpdate();
      }
    });

    return () => {
      window.removeEventListener('projectsCreated', handleProjectUpdate);
      window.removeEventListener('projectsUpdated', handleProjectUpdate);
      window.removeEventListener('projectsDeleted', handleProjectUpdate);
      window.removeEventListener('databaseUpdated', handleProjectUpdate);
    };
  }, [fetchProjects]);

  // Function to get a single project by ID
  const getProjectById = async (id: string): Promise<Project | null> => {
    try {
      const result = await getDocument('projects', id);
      
      if (result.success) {
        return result.data as Project;
      } else {
        console.error(`Error fetching project with ID ${id}:`, result.error);
        return null;
      }
    } catch (err) {
      console.error(`Error fetching project with ID ${id}:`, err);
      throw err;
    }
  };

  // Manual refresh function
  const refetch = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { 
    data, 
    isLoading, 
    error,
    getProjectById,
    refetch // Export refetch function for manual refreshing
  };
}