
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
  operator: string;
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

export interface DocItem {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  author: string;
}

export interface AssetItem {
  id: string;
  name: string;
  dataUrl: string;
  type: 'image' | 'reference';
  folderId?: string; // 新增：所属文件夹ID
}

export interface AssetFolder {
  id: string;
  name: string;
  icon?: string;
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

export type ViewState = 'tasks' | 'finance' | 'prompts' | 'assets' | 'documents';
