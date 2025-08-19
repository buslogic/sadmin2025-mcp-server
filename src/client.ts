import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from './config';
import {
  validateInput,
  CreateTaskSchema,
  CreateEpicSchema,
  UpdateTaskStatusSchema,
  CreateCommentSchema,
  UploadAttachmentSchema,
  TaskFiltersSchema,
  EpicFiltersSchema,
} from './utils/validation';
import type {
  Project,
  Task,
  Comment,
  Attachment,
  CreateTaskRequest,
  CreateEpicRequest,
  UpdateTaskStatusRequest,
  CreateCommentRequest,
  UploadAttachmentRequest,
  TaskFilters,
  EpicFilters,
} from './types';

export class SadminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.sadminApiUrl,
      headers: {
        'X-API-Key': config.sadminApiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const message = (error.response.data as any)?.message || error.message;
          throw new Error(`API Error (${error.response.status}): ${message}`);
        } else if (error.request) {
          throw new Error('No response from SADMIN API. Please check if the server is running.');
        } else {
          throw new Error(`Request setup error: ${error.message}`);
        }
      }
    );
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const { data } = await this.client.get<Project[]>('/projects');
    return data;
  }

  async getProject(id: string): Promise<Project> {
    const { data } = await this.client.get<Project>(`/projects/${id}`);
    return data;
  }

  // Tasks
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const validatedFilters = filters ? validateInput(TaskFiltersSchema, filters) : undefined;
    const params = new URLSearchParams();
    if (validatedFilters?.projectId) params.append('projectId', validatedFilters.projectId);
    if (validatedFilters?.status) params.append('status', validatedFilters.status);
    if (validatedFilters?.type) params.append('type', validatedFilters.type);
    
    const { data } = await this.client.get<Task[]>(`/tasks?${params.toString()}`);
    return data;
  }

  async getTask(id: string): Promise<Task> {
    if (!id) throw new Error('Task ID is required');
    const { data } = await this.client.get<Task>(`/task/${id}`);
    return data;
  }

  async createTask(request: CreateTaskRequest): Promise<Task> {
    const validatedRequest = validateInput(CreateTaskSchema, request);
    const { data } = await this.client.post<Task>('/tasks', validatedRequest);
    return data;
  }

  async updateTaskStatus(id: string, request: UpdateTaskStatusRequest): Promise<Task> {
    if (!id) throw new Error('Task ID is required');
    const validatedRequest = validateInput(UpdateTaskStatusSchema, request);
    const { data } = await this.client.patch<Task>(`/task/${id}/status`, validatedRequest);
    return data;
  }

  async updateTask(id: string, request: any): Promise<Task> {
    if (!id) throw new Error('Task ID is required');
    const { data } = await this.client.patch<Task>(`/tasks/${id}`, request);
    return data;
  }

  async updateEpic(id: string, request: any): Promise<Task> {
    if (!id) throw new Error('Epic ID is required');
    const { data } = await this.client.patch<Task>(`/epics/${id}`, request);
    return data;
  }

  // Epics
  async getEpics(filters?: EpicFilters): Promise<Task[]> {
    const validatedFilters = filters ? validateInput(EpicFiltersSchema, filters) : undefined;
    const params = new URLSearchParams();
    if (validatedFilters?.projectId) params.append('projectId', validatedFilters.projectId);
    if (validatedFilters?.status) params.append('status', validatedFilters.status);
    
    const { data } = await this.client.get<Task[]>(`/epics?${params.toString()}`);
    return data;
  }

  async createEpic(request: CreateEpicRequest): Promise<Task> {
    const validatedRequest = validateInput(CreateEpicSchema, request);
    const { data } = await this.client.post<Task>('/epics', {
      ...validatedRequest,
      type: 'EPIC', // Ensure type is always EPIC
    });
    return data;
  }

  // Comments
  async getComments(taskId: string): Promise<Comment[]> {
    if (!taskId || !taskId.trim()) {
      throw new Error('Task ID is required');
    }
    const { data } = await this.client.get<Comment[]>(`/comments?taskId=${encodeURIComponent(taskId)}`);
    return data;
  }

  async createComment(request: CreateCommentRequest): Promise<Comment> {
    const validatedRequest = validateInput(CreateCommentSchema, request);
    const { data } = await this.client.post<Comment>('/comments', validatedRequest);
    return data;
  }

  // Attachments
  async getAttachments(entityType: 'task' | 'project', entityId: string): Promise<Attachment[]> {
    if (!entityId || !entityId.trim()) {
      throw new Error('Entity ID is required');
    }
    const params = new URLSearchParams({
      entityType,
      entityId
    });
    const { data } = await this.client.get<Attachment[]>(`/attachments?${params.toString()}`);
    return data;
  }

  async uploadAttachment(request: UploadAttachmentRequest): Promise<Attachment> {
    const validatedRequest = validateInput(UploadAttachmentSchema, request);
    const { data } = await this.client.post<Attachment>('/attachments', validatedRequest);
    return data;
  }

  async downloadAttachment(attachmentId: string): Promise<{ fileName: string; base64Content: string }> {
    if (!attachmentId || !attachmentId.trim()) {
      throw new Error('Attachment ID is required');
    }
    const { data } = await this.client.get<{ fileName: string; base64Content: string }>(`/attachments/${attachmentId}/download`);
    return data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const { data } = await this.client.get('/health');
    return data;
  }
}

// Singleton instance
export const sadminClient = new SadminApiClient();