import { z } from 'zod';

// Task type enum
export const TaskTypeEnum = z.enum(['TASK', 'BUG', 'FEATURE', 'EPIC']);
export const TaskStatusEnum = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']);
export const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const EpicHealthEnum = z.enum(['ON_TRACK', 'AT_RISK', 'BLOCKED']);

// Validation schemas
export const CreateTaskSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  type: TaskTypeEnum.exclude(['EPIC']),
  priority: PriorityEnum.optional().default('MEDIUM'),
  assignedTo: z.number().optional(),
  dueDate: z.string().datetime().optional(),
  parentId: z.string().uuid().optional(),
});

export const CreateEpicSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  priority: PriorityEnum.optional().default('MEDIUM'),
  epicStartDate: z.string().datetime().optional(),
  epicEndDate: z.string().datetime().optional(),
  epicHealth: EpicHealthEnum.optional(),
});

export const UpdateTaskStatusSchema = z.object({
  status: TaskStatusEnum,
});

export const CreateCommentSchema = z.object({
  taskId: z.string().uuid('Invalid task ID format'),
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment too long'),
});

export const UploadAttachmentSchema = z.object({
  entityType: z.enum(['task', 'project']),
  entityId: z.string().uuid('Invalid entity ID format'),
  fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  base64Content: z.string().min(1, 'File content is required'),
  description: z.string().max(1000, 'Description too long').optional(),
});

export const TaskFiltersSchema = z.object({
  projectId: z.string().uuid().optional(),
  status: TaskStatusEnum.optional(),
  type: TaskTypeEnum.optional(),
  assignedTo: z.number().optional(),
});

export const EpicFiltersSchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.string().optional(),
});

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errors}`);
    }
    throw error;
  }
}