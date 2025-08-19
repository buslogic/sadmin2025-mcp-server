import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from './config';
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
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const { data } = await this.client.get<Task[]>(`/tasks?${params.toString()}`);
    return data;
  }

  async getTask(id: string): Promise<Task> {
    const { data } = await this.client.get<Task>(`/task/${id}`);
    return data;
  }

  async createTask(request: CreateTaskRequest): Promise<Task> {
    const { data } = await this.client.post<Task>('/tasks', request);
    return data;
  }

  async updateTaskStatus(id: string, request: UpdateTaskStatusRequest): Promise<Task> {
    const { data } = await this.client.patch<Task>(`/task/${id}/status`, request);
    return data;
  }

  // Epics
  async getEpics(filters?: EpicFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    
    const { data } = await this.client.get<Task[]>(`/epics?${params.toString()}`);
    return data;
  }

  async createEpic(request: CreateEpicRequest): Promise<Task> {
    const { data } = await this.client.post<Task>('/epics', request);
    return data;
  }

  // Comments
  async createComment(request: CreateCommentRequest): Promise<Comment> {
    const { data } = await this.client.post<Comment>('/comments', request);
    return data;
  }

  // Attachments
  async uploadAttachment(request: UploadAttachmentRequest): Promise<Attachment> {
    const { data } = await this.client.post<Attachment>('/attachments', request);
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