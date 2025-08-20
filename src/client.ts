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
      (response) => {
        // Debug log for all responses
        if (response.config.url?.includes('/epics')) {
          console.error('[AXIOS DEBUG] Epic endpoint response:', {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            hasData: !!response.data,
            dataType: typeof response.data,
            dataKeys: response.data ? Object.keys(response.data).slice(0, 5) : [],
          });
        }
        return response;
      },
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
    console.error('[CLIENT DEBUG] Sending request:', JSON.stringify(validatedRequest, null, 2));
    const response = await this.client.post<Task>('/tasks', validatedRequest);
    console.error('[CLIENT DEBUG] Got response:', JSON.stringify(response.data, null, 2));
    return response.data;
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
    console.error('[CLIENT DEBUG] Creating epic with request:', JSON.stringify(validatedRequest, null, 2));
    console.error('[CLIENT DEBUG] Has linkedTaskIds?:', !!validatedRequest.linkedTaskIds);
    console.error('[CLIENT DEBUG] LinkedTaskIds:', validatedRequest.linkedTaskIds);
    // IMPORTANT: Do NOT send 'type' field - backend returns empty response when type is included
    const response = await this.client.post<Task>('/epics', validatedRequest);
    console.error('[CLIENT DEBUG] Epic response status:', response.status);
    console.error('[CLIENT DEBUG] Epic response data:', JSON.stringify(response.data, null, 2));
    return response.data;
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

  // Wiki methods
  async getWikiSpaces(projectId: string): Promise<any> {
    if (!projectId) throw new Error('Project ID is required');
    const { data } = await this.client.get('/wiki/spaces', {
      params: { projectId },
    });
    return data;
  }

  async getWikiPages(spaceId: string, categoryId?: string): Promise<any> {
    if (!spaceId) throw new Error('Space ID is required');
    const { data } = await this.client.get('/wiki/pages', {
      params: { spaceId, categoryId },
    });
    return data;
  }

  async getWikiPage(id: string): Promise<any> {
    if (!id) throw new Error('Wiki page ID is required');
    const { data } = await this.client.get(`/wiki/pages/${id}`);
    return data;
  }

  async createWikiSpace(request: any): Promise<any> {
    const { data } = await this.client.post('/wiki/spaces', request);
    return data;
  }

  async createWikiPage(request: any): Promise<any> {
    const { data } = await this.client.post('/wiki/pages', request);
    return data;
  }

  async updateWikiPage(id: string, request: any): Promise<any> {
    if (!id) throw new Error('Wiki page ID is required');
    const { data } = await this.client.put(`/wiki/pages/${id}`, request);
    return data;
  }

  async deleteWikiPage(id: string): Promise<any> {
    if (!id) throw new Error('Wiki page ID is required');
    const { data } = await this.client.delete(`/wiki/pages/${id}`);
    return data;
  }

  async uploadWikiMedia(request: any): Promise<any> {
    const { data } = await this.client.post('/wiki/media/upload', request);
    return data;
  }

  async getWikiMedia(id: string): Promise<any> {
    if (!id) throw new Error('Media ID is required');
    const { data } = await this.client.get(`/wiki/media/${id}`);
    return data;
  }

  async searchWikiPages(query: string, spaceId?: string): Promise<any> {
    if (!query) throw new Error('Search query is required');
    const { data } = await this.client.get('/wiki/search', {
      params: { q: query, spaceId },
    });
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