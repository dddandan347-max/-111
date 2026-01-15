export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskStatusDef {
  id: string;
  label: string;
  color: string;
}

export interface VideoTask {
  id: string;
  title: string;
  assignee: string;
  status: string;
  deadline: string;
  startDate: string;
  priority: TaskPriority;
  tag: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  linkedTaskId?: string;
  notes?: string;
}

export interface ScriptPrompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface AssetItem {
  id: string;
  name: string;
  dataUrl: string; // Base64
  type: 'image' | 'reference';
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  claimedBy?: string;
}

export interface User {
  username: string;
  password: string;
  isApproved: boolean;
}

export type ViewState = 'tasks' | 'finance' | 'prompts' | 'assets' | 'characters';