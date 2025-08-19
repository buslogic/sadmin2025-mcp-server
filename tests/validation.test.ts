import { describe, it, expect } from 'vitest';
import {
  CreateTaskSchema,
  CreateEpicSchema,
  UpdateTaskStatusSchema,
  CreateCommentSchema,
  validateInput,
} from '../src/utils/validation';

describe('Validation Schemas', () => {
  describe('CreateTaskSchema', () => {
    it('should validate a valid task', () => {
      const validTask = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Task',
        description: 'Test description',
        type: 'TASK' as const,
        priority: 'HIGH' as const,
      };

      const result = validateInput(CreateTaskSchema, validTask);
      expect(result).toEqual(validTask);
    });

    it('should reject invalid project ID', () => {
      const invalidTask = {
        projectId: 'not-a-uuid',
        title: 'Test Task',
        type: 'TASK',
      };

      expect(() => validateInput(CreateTaskSchema, invalidTask)).toThrow(
        'Invalid project ID format'
      );
    });

    it('should reject empty title', () => {
      const invalidTask = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        title: '',
        type: 'TASK',
      };

      expect(() => validateInput(CreateTaskSchema, invalidTask)).toThrow(
        'Title is required'
      );
    });

    it('should reject EPIC type in CreateTaskSchema', () => {
      const invalidTask = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Task',
        type: 'EPIC',
      };

      expect(() => validateInput(CreateTaskSchema, invalidTask)).toThrow();
    });

    it('should set default priority to MEDIUM', () => {
      const task = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Task',
        type: 'TASK' as const,
      };

      const result = validateInput(CreateTaskSchema, task);
      expect(result.priority).toBe('MEDIUM');
    });
  });

  describe('CreateEpicSchema', () => {
    it('should validate a valid epic', () => {
      const validEpic = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Epic',
        description: 'Epic description',
        priority: 'HIGH' as const,
        epicHealth: 'ON_TRACK' as const,
      };

      const result = validateInput(CreateEpicSchema, validEpic);
      expect(result).toEqual(validEpic);
    });

    it('should validate epic dates', () => {
      const epicWithDates = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Epic',
        epicStartDate: '2025-01-01T00:00:00Z',
        epicEndDate: '2025-12-31T23:59:59Z',
      };

      const result = validateInput(CreateEpicSchema, epicWithDates);
      expect(result.epicStartDate).toBeDefined();
      expect(result.epicEndDate).toBeDefined();
    });
  });

  describe('UpdateTaskStatusSchema', () => {
    it('should validate valid status transitions', () => {
      const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];
      
      statuses.forEach(status => {
        const result = validateInput(UpdateTaskStatusSchema, { status });
        expect(result.status).toBe(status);
      });
    });

    it('should reject invalid status', () => {
      expect(() => validateInput(UpdateTaskStatusSchema, { status: 'INVALID' })).toThrow();
    });
  });

  describe('CreateCommentSchema', () => {
    it('should validate a valid comment', () => {
      const validComment = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'This is a test comment',
      };

      const result = validateInput(CreateCommentSchema, validComment);
      expect(result).toEqual(validComment);
    });

    it('should reject empty comment content', () => {
      const invalidComment = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: '',
      };

      expect(() => validateInput(CreateCommentSchema, invalidComment)).toThrow(
        'Comment content is required'
      );
    });

    it('should reject comment that is too long', () => {
      const invalidComment = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'a'.repeat(5001),
      };

      expect(() => validateInput(CreateCommentSchema, invalidComment)).toThrow(
        'Comment too long'
      );
    });
  });
});