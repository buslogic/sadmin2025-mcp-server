#!/usr/bin/env node

/**
 * MCP Protocol Server for SADMIN 2025
 * Ovo je MCP wrapper koji koristi naš postojeći REST API server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { config } from './config.js';

// Koristi postojeći REST API server
const API_BASE_URL = process.env.MCP_API_URL || 'http://localhost:3010';

// Kreiraj axios instancu za komunikaciju sa našim REST serverom
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Lista dostupnih alata
const AVAILABLE_TOOLS = [
  {
    name: 'sadmin_getProjects',
    description: 'Get list of all active projects',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'sadmin_getProject',
    description: 'Get project details by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'sadmin_getTasks',
    description: 'Get list of tasks with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Filter by project ID' },
        status: { 
          type: 'string', 
          enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
          description: 'Filter by status' 
        },
        type: {
          type: 'string',
          enum: ['TASK', 'BUG', 'FEATURE', 'EPIC'],
          description: 'Filter by type'
        },
      },
    },
  },
  {
    name: 'sadmin_getTask',
    description: 'Get task details by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'sadmin_createTask',
    description: 'Create a new task',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        type: { 
          type: 'string',
          enum: ['TASK', 'BUG', 'FEATURE'],
          description: 'Task type (not EPIC)'
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Task priority'
        },
        assignedTo: { type: 'number', description: 'User ID to assign to' },
        parentId: { type: 'string', description: 'Parent task/epic ID' },
      },
      required: ['projectId', 'title', 'type'],
    },
  },
  {
    name: 'sadmin_updateTaskStatus',
    description: 'Update task status',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        status: {
          type: 'string',
          enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
          description: 'New status'
        },
      },
      required: ['id', 'status'],
    },
  },
  {
    name: 'sadmin_getEpics',
    description: 'Get list of epics with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Filter by project ID' },
        status: {
          type: 'string',
          enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
          description: 'Filter by status'
        },
      },
    },
  },
  {
    name: 'sadmin_createEpic',
    description: 'Create a new epic',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        title: { type: 'string', description: 'Epic title' },
        description: { type: 'string', description: 'Epic description' },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Epic priority'
        },
        epicHealth: {
          type: 'string',
          enum: ['ON_TRACK', 'AT_RISK', 'BLOCKED'],
          description: 'Epic health status'
        },
      },
      required: ['projectId', 'title'],
    },
  },
  {
    name: 'sadmin_getComments',
    description: 'Get comments for a task',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'sadmin_addComment',
    description: 'Add comment to a task',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' },
        content: { type: 'string', description: 'Comment content' },
      },
      required: ['taskId', 'content'],
    },
  },
  {
    name: 'sadmin_getAttachments',
    description: 'Get attachments for an entity',
    inputSchema: {
      type: 'object',
      properties: {
        entityType: {
          type: 'string',
          enum: ['task', 'project'],
          description: 'Entity type'
        },
        entityId: { type: 'string', description: 'Entity ID' },
      },
      required: ['entityType', 'entityId'],
    },
  },
  {
    name: 'sadmin_uploadAttachment',
    description: 'Upload file attachment',
    inputSchema: {
      type: 'object',
      properties: {
        entityType: {
          type: 'string',
          enum: ['task', 'project'],
          description: 'Entity type'
        },
        entityId: { type: 'string', description: 'Entity ID' },
        fileName: { type: 'string', description: 'File name' },
        base64Content: { type: 'string', description: 'Base64 encoded content' },
        description: { type: 'string', description: 'Optional description' },
      },
      required: ['entityType', 'entityId', 'fileName', 'base64Content'],
    },
  },
  {
    name: 'sadmin_downloadAttachment',
    description: 'Download attachment by ID',
    inputSchema: {
      type: 'object',
      properties: {
        attachmentId: { type: 'string', description: 'Attachment ID' },
      },
      required: ['attachmentId'],
    },
  },
  {
    name: 'sadmin_updateTask',
    description: 'Update task details',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        type: {
          type: 'string',
          enum: ['TASK', 'BUG', 'FEATURE', 'EPIC'],
          description: 'Task type'
        },
        status: {
          type: 'string',
          enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
          description: 'Task status'
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Task priority'
        },
        parentId: { type: 'string', description: 'Parent task/epic ID' },
        assignedTo: { type: 'number', description: 'User ID to assign to' },
        estimatedHours: { type: 'number', description: 'Estimated hours' },
        storyPoints: { type: 'number', description: 'Story points' },
        dueDate: { type: 'string', description: 'Due date (ISO string)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'sadmin_updateEpic',
    description: 'Update epic details',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Epic ID' },
        title: { type: 'string', description: 'Epic title' },
        description: { type: 'string', description: 'Epic description' },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Epic priority'
        },
        epicStatus: {
          type: 'string',
          enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
          description: 'Epic status'
        },
        epicHealth: {
          type: 'string',
          enum: ['ON_TRACK', 'AT_RISK', 'BLOCKED'],
          description: 'Epic health status'
        },
        epicStartDate: { type: 'string', description: 'Epic start date (ISO string)' },
        epicEndDate: { type: 'string', description: 'Epic end date (ISO string)' },
        epicProgress: { type: 'number', description: 'Epic progress percentage (0-100)' },
        estimatedHours: { type: 'number', description: 'Estimated hours' },
        storyPoints: { type: 'number', description: 'Story points' },
        assignedTo: { type: 'number', description: 'User ID to assign to' },
      },
      required: ['id'],
    },
  },
  // Wiki tools
  {
    name: 'sadmin_getWikiSpaces',
    description: 'Get Wiki spaces by project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'sadmin_getWikiPages',
    description: 'Get Wiki pages by space',
    inputSchema: {
      type: 'object',
      properties: {
        spaceId: { type: 'string', description: 'Wiki space ID' },
        categoryId: { type: 'string', description: 'Filter by category ID' },
      },
      required: ['spaceId'],
    },
  },
  {
    name: 'sadmin_getWikiPage',
    description: 'Get Wiki page by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Wiki page ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'sadmin_createWikiSpace',
    description: 'Create new Wiki space',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        type: { type: 'string', description: 'Wiki space type', enum: ['PROJECT_DOCS', 'TECHNICAL', 'USER_MANUAL', 'API_DOCS', 'KNOWLEDGE_BASE'] },
        name: { type: 'string', description: 'Wiki space name' },
        slug: { type: 'string', description: 'URL slug' },
        description: { type: 'string', description: 'Description' },
        icon: { type: 'string', description: 'Icon (emoji or URL)' },
        isPublic: { type: 'boolean', description: 'Is public', default: false },
      },
      required: ['projectId', 'name', 'slug'],
    },
  },
  {
    name: 'sadmin_createWikiPage',
    description: 'Create new Wiki page',
    inputSchema: {
      type: 'object',
      properties: {
        spaceId: { type: 'string', description: 'Wiki space ID' },
        categoryId: { type: 'string', description: 'Category ID' },
        parentId: { type: 'string', description: 'Parent page ID' },
        slug: { type: 'string', description: 'URL slug' },
        title: { type: 'string', description: 'Page title' },
        content: { type: 'string', description: 'Markdown content' },
        summary: { type: 'string', description: 'Brief summary' },
        status: { type: 'string', description: 'Page status', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
        visibility: { type: 'string', description: 'Visibility', enum: ['PUBLIC', 'PRIVATE', 'TEAM'] },
        keywords: { type: 'array', items: { type: 'string' }, description: 'Keywords for search' },
      },
      required: ['spaceId', 'slug', 'title', 'content'],
    },
  },
  {
    name: 'sadmin_updateWikiPage',
    description: 'Update Wiki page',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Wiki page ID' },
        title: { type: 'string', description: 'Page title' },
        content: { type: 'string', description: 'Markdown content' },
        summary: { type: 'string', description: 'Brief summary' },
        status: { type: 'string', description: 'Page status', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
        visibility: { type: 'string', description: 'Visibility', enum: ['PUBLIC', 'PRIVATE', 'TEAM'] },
        versionSummary: { type: 'string', description: 'Version change summary' },
      },
      required: ['id'],
    },
  },
  {
    name: 'sadmin_deleteWikiPage',
    description: 'Soft delete Wiki page',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Wiki page ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'sadmin_uploadWikiMedia',
    description: 'Upload media file to Wiki page',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string', description: 'Wiki page ID' },
        fileName: { type: 'string', description: 'File name' },
        base64Content: { type: 'string', description: 'Base64 encoded content with data URL' },
        description: { type: 'string', description: 'Media description' },
        altText: { type: 'string', description: 'Alt text for images' },
      },
      required: ['pageId', 'fileName', 'base64Content'],
    },
  },
  {
    name: 'sadmin_getWikiMedia',
    description: 'Get Wiki media file',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Media attachment ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'sadmin_searchWiki',
    description: 'Search Wiki pages',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search query' },
        spaceId: { type: 'string', description: 'Limit to specific space' },
      },
      required: ['q'],
    },
  },
];

async function main() {
  // Kreiraj MCP server
  const server = new Server(
    {
      name: 'sadmin2025-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handler za listu alata
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: AVAILABLE_TOOLS,
    };
  });

  // Handler za pozivanje alata
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      // Pozovi naš REST API server
      const response = await api.post(`/functions/${name}`, args || {});
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.response?.data?.error || error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Pokreni server sa stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('SADMIN 2025 MCP Server started');
  console.error(`Connected to REST API at: ${API_BASE_URL}`);
  console.error(`Environment: ${config.environment}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});