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