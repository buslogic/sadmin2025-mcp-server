// SADMIN API Types

export interface Project {
  id: string;
  name: string;
  description?: string;
  code: string;
  status: string;
  startDate?: string;
  endDate?: string;
  githubRepo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface Task {
  id: string;
  projectId: string;
  parentId?: string;
  title: string;
  description?: string;
  type: 'TASK' | 'BUG' | 'FEATURE' | 'EPIC';
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  assignedTo?: number;
  reportedBy: number;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: User;
  reporter?: User;
  parent?: Task;
  children?: Task[];
  _count?: {
    comments: number;
    children?: number;
  };
  // Epic specific fields
  epicStatus?: string;
  epicStartDate?: string;
  epicEndDate?: string;
  epicProgress?: number;
  epicHealth?: 'ON_TRACK' | 'AT_RISK' | 'BLOCKED';
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  avatar?: string;
}

export interface Comment {
  id: string;
  content: string;
  entityType: 'task' | 'project';
  entityId: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  entityType: 'task' | 'project';
  entityId: string;
  uploadedBy: number;
  createdAt: string;
  description?: string;
}

// Request/Response types

export interface CreateTaskRequest {
  projectId: string;
  title: string;
  description?: string;
  type: 'TASK' | 'BUG' | 'FEATURE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo?: number;
  dueDate?: string;
  parentId?: string;
}

export interface CreateEpicRequest {
  projectId: string;
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  epicStartDate?: string;
  epicEndDate?: string;
  epicHealth?: 'ON_TRACK' | 'AT_RISK' | 'BLOCKED';
  linkedTaskIds?: string[]; // Array of task IDs to link with this epic
}

export interface UpdateTaskStatusRequest {
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
}

export interface CreateCommentRequest {
  taskId: string;
  content: string;
}

export interface UploadAttachmentRequest {
  entityType: 'task' | 'project';
  entityId: string;
  fileName: string;
  base64Content: string;
  description?: string;
}

export interface TaskFilters {
  projectId?: string;
  status?: string;
  type?: string;
  assignedTo?: number;
}

export interface EpicFilters {
  projectId?: string;
  status?: string;
}