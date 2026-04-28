import { create } from 'zustand';

export type Project = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  storageFiles: number;
  storageSizeBytes: number;
  createdAt: string;
};

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;

  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  clearProjects: () => set({ projects: [], currentProject: null }),
}));
