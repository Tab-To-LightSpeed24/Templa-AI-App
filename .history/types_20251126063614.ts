export enum DocumentType {
  DOCX = 'DOCX',
  PPTX = 'PPTX',
}

export enum SectionStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface Section {
  id: string;
  title: string;
  content: string; 
  notes?: string; 
  feedback?: 'like' | 'dislike' | null;
  status: SectionStatus;
  history: string[]; // Past states
  future: string[];  // Future states (for Redo)
}

export interface ProjectStyle {
  font: 'Modern' | 'Classic' | 'Clean' | 'Formal' | 'Display' | 'Handwriting';
  template: 'Minimal' | 'Corporate' | 'Executive' | 'Paper' | 'Vibrant' | 'Ocean' | 'Dark';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string; 
  type: DocumentType;
  style: ProjectStyle;
  sections: Section[];
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface OutlineResponse {
  sections: string[];
}

export type AIActionType = 'UPDATE_SECTION' | 'CHANGE_STYLE' | 'REGENERATE_SECTION' | 'NONE';

export interface AIActionResponse {
  message: string; 
  action: AIActionType;
  payload?: any; 
}