#!/usr/bin/env node

import express from 'express';
import { sadminClient } from './client';
import { config } from './config';

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const health = await sadminClient.healthCheck();
    res.json({
      mcpServer: 'healthy',
      sadminApi: health,
    });
  } catch (error) {
    res.status(503).json({
      mcpServer: 'healthy',
      sadminApi: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// MCP-style function endpoints
app.post('/functions/:functionName', async (req, res) => {
  const { functionName } = req.params;
  const params = req.body;

  try {
    let result;

    switch (functionName) {
      // Projects
      case 'sadmin_getProjects':
        result = await sadminClient.getProjects();
        break;
      
      case 'sadmin_getProject':
        result = await sadminClient.getProject(params.id);
        break;

      // Tasks
      case 'sadmin_getTasks':
        result = await sadminClient.getTasks(params);
        break;

      case 'sadmin_getTask':
        result = await sadminClient.getTask(params.id);
        break;

      case 'sadmin_createTask':
        result = await sadminClient.createTask(params);
        break;

      case 'sadmin_updateTaskStatus':
        result = await sadminClient.updateTaskStatus(params.id, { status: params.status });
        break;

      // Epics
      case 'sadmin_getEpics':
        result = await sadminClient.getEpics(params);
        break;

      case 'sadmin_createEpic':
        result = await sadminClient.createEpic(params);
        break;

      // Comments
      case 'sadmin_getComments':
        result = await sadminClient.getComments(params.taskId);
        break;

      case 'sadmin_addComment':
        result = await sadminClient.createComment(params);
        break;

      // Attachments
      case 'sadmin_getAttachments':
        result = await sadminClient.getAttachments(params.entityType, params.entityId);
        break;

      case 'sadmin_uploadAttachment':
        result = await sadminClient.uploadAttachment(params);
        break;

      case 'sadmin_downloadAttachment':
        result = await sadminClient.downloadAttachment(params.attachmentId);
        break;

      // Update functions
      case 'sadmin_updateTask':
        const { id: taskId, ...taskUpdateData } = params;
        result = await sadminClient.updateTask(taskId, taskUpdateData);
        break;

      case 'sadmin_updateEpic':
        const { id: epicId, ...epicUpdateData } = params;
        result = await sadminClient.updateEpic(epicId, epicUpdateData);
        break;

      default:
        res.status(404).json({
          success: false,
          error: `Function '${functionName}' not found`,
        });
        return;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List available functions
app.get('/functions', (_req, res) => {
  res.json({
    functions: [
      {
        name: 'sadmin_getProjects',
        description: 'Get list of all active projects',
        parameters: {},
      },
      {
        name: 'sadmin_getProject',
        description: 'Get project details by ID',
        parameters: {
          id: { type: 'string', required: true },
        },
      },
      {
        name: 'sadmin_getTasks',
        description: 'Get list of tasks with optional filters',
        parameters: {
          projectId: { type: 'string' },
          status: { type: 'string' },
          type: { type: 'string' },
        },
      },
      {
        name: 'sadmin_getTask',
        description: 'Get task details by ID',
        parameters: {
          id: { type: 'string', required: true },
        },
      },
      {
        name: 'sadmin_createTask',
        description: 'Create a new task',
        parameters: {
          projectId: { type: 'string', required: true },
          title: { type: 'string', required: true },
          description: { type: 'string' },
          type: { type: 'string', required: true },
          priority: { type: 'string' },
        },
      },
      {
        name: 'sadmin_updateTaskStatus',
        description: 'Update task status',
        parameters: {
          id: { type: 'string', required: true },
          status: { type: 'string', required: true },
        },
      },
      {
        name: 'sadmin_getEpics',
        description: 'Get list of epics with optional filters',
        parameters: {
          projectId: { type: 'string' },
          status: { type: 'string' },
        },
      },
      {
        name: 'sadmin_createEpic',
        description: 'Create a new epic',
        parameters: {
          projectId: { type: 'string', required: true },
          title: { type: 'string', required: true },
          description: { type: 'string' },
          priority: { type: 'string' },
        },
      },
      {
        name: 'sadmin_getComments',
        description: 'Get comments for a task',
        parameters: {
          taskId: { type: 'string', required: true },
        },
      },
      {
        name: 'sadmin_addComment',
        description: 'Add a comment to a task',
        parameters: {
          taskId: { type: 'string', required: true },
          content: { type: 'string', required: true },
        },
      },
      {
        name: 'sadmin_getAttachments',
        description: 'Get attachments for an entity',
        parameters: {
          entityType: { type: 'string', required: true },
          entityId: { type: 'string', required: true },
        },
      },
      {
        name: 'sadmin_uploadAttachment',
        description: 'Upload a file attachment',
        parameters: {
          entityType: { type: 'string', required: true },
          entityId: { type: 'string', required: true },
          fileName: { type: 'string', required: true },
          base64Content: { type: 'string', required: true },
          description: { type: 'string' },
        },
      },
      {
        name: 'sadmin_downloadAttachment',
        description: 'Download attachment by ID',
        parameters: {
          attachmentId: { type: 'string', required: true },
        },
      },
      {
        name: 'sadmin_updateTask',
        description: 'Update task details',
        parameters: {
          id: { type: 'string', required: true },
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          status: { type: 'string' },
          priority: { type: 'string' },
          parentId: { type: 'string' },
          assignedTo: { type: 'number' },
          estimatedHours: { type: 'number' },
          storyPoints: { type: 'number' },
          dueDate: { type: 'string' },
        },
      },
      {
        name: 'sadmin_updateEpic',
        description: 'Update epic details',
        parameters: {
          id: { type: 'string', required: true },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string' },
          epicStatus: { type: 'string' },
          epicHealth: { type: 'string' },
          epicStartDate: { type: 'string' },
          epicEndDate: { type: 'string' },
          epicProgress: { type: 'number' },
          estimatedHours: { type: 'number' },
          storyPoints: { type: 'number' },
          assignedTo: { type: 'number' },
        },
      },
    ],
  });
});

// Start server
const PORT = config.mcpServerPort || 3010;

async function main() {
  try {
    console.log('🚀 Starting SADMIN 2025 MCP Server...');
    console.log(`🌍 Environment: ${config.environment.toUpperCase()}`);
    console.log(`📍 API URL: ${config.sadminApiUrl}`);
    console.log(`🔑 API Key: ${config.sadminApiKey.substring(0, 10)}...`);
    
    // Test API connection
    const health = await sadminClient.healthCheck();
    console.log(`✅ API connection successful: ${health.status}`);
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🎉 MCP Server is running on port ${PORT}!`);
      console.log(`📚 View available functions: http://localhost:${PORT}/functions`);
      console.log(`❤️ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down MCP server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down MCP server...');
  process.exit(0);
});

// Run the server
main();