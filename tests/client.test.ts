import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { SadminApiClient } from '../src/client';

// Mock axios
vi.mock('axios');

describe('SadminApiClient', () => {
  let client: SadminApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    // Mock axios.create
    (axios.create as any).mockReturnValue(mockAxiosInstance);

    // Create client instance
    client = new SadminApiClient();
  });

  describe('getTasks', () => {
    it('should fetch tasks without filters', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', type: 'TASK' },
        { id: '2', title: 'Task 2', type: 'BUG' },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockTasks });

      const result = await client.getTasks();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tasks?');
      expect(result).toEqual(mockTasks);
    });

    it('should fetch tasks with filters', async () => {
      const mockTasks = [{ id: '1', title: 'Task 1', type: 'TASK' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockTasks });

      const filters = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'TODO' as const,
        type: 'TASK' as const,
      };

      const result = await client.getTasks(filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('projectId=550e8400-e29b-41d4-a716-446655440000')
      );
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('status=TODO')
      );
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('type=TASK')
      );
      expect(result).toEqual(mockTasks);
    });
  });

  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const newTask = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'New Task',
        description: 'Task description',
        type: 'TASK' as const,
        priority: 'HIGH' as const,
      };

      const mockResponse = { ...newTask, id: 'task-123' };
      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await client.createTask(newTask);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tasks', newTask);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid task data', async () => {
      const invalidTask = {
        projectId: 'invalid-uuid',
        title: '',
        type: 'TASK' as const,
      };

      await expect(client.createTask(invalidTask as any)).rejects.toThrow();
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const taskId = 'task-123';
      const newStatus = { status: 'IN_PROGRESS' as const };
      const mockResponse = { id: taskId, status: 'IN_PROGRESS' };
      
      mockAxiosInstance.patch.mockResolvedValue({ data: mockResponse });

      const result = await client.updateTaskStatus(taskId, newStatus);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        `/task/${taskId}/status`,
        newStatus
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for empty task ID', async () => {
      await expect(
        client.updateTaskStatus('', { status: 'IN_PROGRESS' })
      ).rejects.toThrow('Task ID is required');
    });
  });

  describe('createEpic', () => {
    it('should create an epic with type EPIC', async () => {
      const epicData = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'New Epic',
        description: 'Epic description',
        priority: 'HIGH' as const,
        epicHealth: 'ON_TRACK' as const,
      };

      const mockResponse = { ...epicData, id: 'epic-123', type: 'EPIC' };
      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await client.createEpic(epicData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/epics',
        expect.objectContaining({
          ...epicData,
          type: 'EPIC',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const commentData = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'This is a comment',
      };

      const mockResponse = { ...commentData, id: 'comment-123' };
      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await client.createComment(commentData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/comments', commentData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for empty comment', async () => {
      const invalidComment = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: '',
      };

      await expect(client.createComment(invalidComment)).rejects.toThrow(
        'Comment content is required'
      );
    });
  });

  describe('error handling', () => {
    it('should handle API errors with status code', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Task not found' },
        },
      };
      mockAxiosInstance.get.mockRejectedValue(errorResponse);

      await expect(client.getTask('nonexistent')).rejects.toThrow(
        'API Error (404): Task not found'
      );
    });

    it('should handle network errors', async () => {
      const networkError = {
        request: {},
      };
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(client.getTasks()).rejects.toThrow(
        'No response from SADMIN API'
      );
    });
  });
});