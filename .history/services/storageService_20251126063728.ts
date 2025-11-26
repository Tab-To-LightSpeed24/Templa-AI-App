import { Project, User, Section, SectionStatus, ProjectStyle } from '../types';

const PROJECTS_KEY = 'templa_projects';
const USER_KEY = 'templa_user';

// Mock Initial User
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const loginUser = (name: string, email: string): User => {
  const user: User = { id: 'user_' + Date.now(), name, email };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Project CRUD
export const getProjects = (userId: string): Project[] => {
  const allProjects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  return allProjects.filter((p: Project) => p.userId === userId).sort((a: Project, b: Project) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getProjectById = (id: string): Project | undefined => {
  const allProjects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  return allProjects.find((p: Project) => p.id === id);
};

export const saveProject = (project: Project): void => {
  const allProjects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  const index = allProjects.findIndex((p: Project) => p.id === project.id);
  
  const updatedProject = { ...project, updatedAt: new Date().toISOString() };
  
  if (index >= 0) {
    allProjects[index] = updatedProject;
  } else {
    allProjects.push(updatedProject);
  }
  
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(allProjects));
};

export const createNewProject = (
  userId: string, 
  title: string, 
  type: any, 
  outline: string[],
  style: ProjectStyle
): Project => {
  const newProject: Project = {
    id: 'proj_' + Date.now(),
    userId,
    title,
    type,
    style,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chatHistory: [],
    sections: outline.map((sectionTitle, idx) => ({
      id: `sec_${Date.now()}_${idx}`,
      title: sectionTitle,
      content: '',
      status: SectionStatus.PENDING,
      history: [],
      future: [],
    })),
  };
  saveProject(newProject);
  return newProject;
};

export const deleteProject = (id: string) => {
  const allProjects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  const filtered = allProjects.filter((p: Project) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
};