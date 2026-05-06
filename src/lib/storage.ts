import type { CalculatorInput } from "./calculator";

export interface StoredProject {
  id: string;
  name: string;
  client: string;
  lastModified: number;
  config: CalculatorInput;
  isApproved?: boolean;
  signedBy?: string | null;
  approvedAt?: Date | null;
}

const STORAGE_KEY = "nw_pricer_projects";

export function getSavedProjects(): StoredProject[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProject(project: Omit<StoredProject, "lastModified">): void {
  const projects = getSavedProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);
  
  const newProject: StoredProject = {
    ...project,
    lastModified: Date.now(),
  };

  if (existingIndex >= 0) {
    projects[existingIndex] = newProject;
  } else {
    projects.push(newProject);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getSavedProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}
