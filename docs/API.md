# SADMIN 2025 MCP Server API Documentation

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [API Reference](#api-reference)
  - [Projects](#projects)
  - [Tasks](#tasks)
  - [Epics](#epics)
  - [Comments](#comments)
  - [Attachments](#attachments)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Installation

```bash
npm install @buslogic/sadmin2025-mcp
```

Or clone and run locally:

```bash
git clone https://github.com/buslogic/sadmin2025-mcp-server.git
cd sadmin2025-mcp-server
npm install
npm run build
npm start
```

## Configuration

Create a `.env` file in the root directory:

```env
# Required
SADMIN_API_URL=https://sadmin2025api.ticketing.rs/api/claude
SADMIN_API_KEY=your_api_key_here

# Optional
SADMIN_PROJECT_ID=default_project_id
MCP_SERVER_PORT=3010
MCP_LOG_LEVEL=info
```

## API Reference

### Base URL
```
http://localhost:3010
```

### Authentication
All requests to SADMIN API use the API key configured in `.env`. No additional authentication is required for MCP server endpoints.

### Projects

#### Get All Projects
```http
POST /functions/sadmin_getProjects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "code": "PROJ001",
      "status": "ACTIVE",
      "priority": "HIGH"
    }
  ]
}
```

#### Get Project by ID
```http
POST /functions/sadmin_getProject
```

**Body:**
```json
{
  "id": "project-uuid"
}
```

### Tasks

#### Get Tasks
```http
POST /functions/sadmin_getTasks
```

**Body (all optional):**
```json
{
  "projectId": "uuid",
  "status": "TODO",
  "type": "TASK"
}
```

**Valid Status Values:**
- `BACKLOG`
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`
- `CANCELLED`

**Valid Type Values:**
- `TASK`
- `BUG`
- `FEATURE`
- `EPIC`

#### Get Task by ID
```http
POST /functions/sadmin_getTask
```

**Body:**
```json
{
  "id": "task-uuid"
}
```

#### Create Task
```http
POST /functions/sadmin_createTask
```

**Body:**
```json
{
  "projectId": "uuid",
  "title": "Task Title",
  "description": "Optional description",
  "type": "TASK",
  "priority": "MEDIUM",
  "assignedTo": 1,
  "dueDate": "2025-12-31T23:59:59Z",
  "parentId": "parent-task-uuid"
}
```

**Required fields:**
- `projectId`
- `title`
- `type` (cannot be `EPIC`)

**Valid Priority Values:**
- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

#### Update Task Status
```http
POST /functions/sadmin_updateTaskStatus
```

**Body:**
```json
{
  "id": "task-uuid",
  "status": "IN_PROGRESS"
}
```

### Epics

#### Get Epics
```http
POST /functions/sadmin_getEpics
```

**Body (optional):**
```json
{
  "projectId": "uuid",
  "status": "IN_PROGRESS"
}
```

#### Create Epic
```http
POST /functions/sadmin_createEpic
```

**Body:**
```json
{
  "projectId": "uuid",
  "title": "Epic Title",
  "description": "Epic description",
  "priority": "HIGH",
  "epicStartDate": "2025-01-01T00:00:00Z",
  "epicEndDate": "2025-12-31T23:59:59Z",
  "epicHealth": "ON_TRACK"
}
```

**Required fields:**
- `projectId`
- `title`

**Valid Epic Health Values:**
- `ON_TRACK`
- `AT_RISK`
- `BLOCKED`

### Comments

#### Add Comment
```http
POST /functions/sadmin_addComment
```

**Body:**
```json
{
  "taskId": "task-uuid",
  "content": "Comment text"
}
```

**Required fields:**
- `taskId`
- `content` (1-5000 characters)

### Attachments

#### Upload Attachment
```http
POST /functions/sadmin_uploadAttachment
```

**Body:**
```json
{
  "entityType": "task",
  "entityId": "entity-uuid",
  "fileName": "document.pdf",
  "base64Content": "data:application/pdf;base64,JVBERi0xLj...",
  "description": "Optional description"
}
```

**Required fields:**
- `entityType` (`task` or `project`)
- `entityId`
- `fileName`
- `base64Content`

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes

- `400` - Validation error (invalid input)
- `401` - Unauthorized (invalid API key)
- `404` - Resource not found
- `500` - Internal server error

### Validation Errors

Input validation errors include field-specific messages:

```json
{
  "success": false,
  "error": "Validation failed: projectId: Invalid project ID format, title: Title is required"
}
```

## Examples

### Create a Task with Subtasks

```javascript
// Create parent task (Epic)
const epic = await callFunction('sadmin_createEpic', {
  projectId: 'project-uuid',
  title: 'Feature Release Q1',
  priority: 'HIGH'
});

// Create subtasks
const subtask1 = await callFunction('sadmin_createTask', {
  projectId: 'project-uuid',
  parentId: epic.data.id,
  title: 'Design UI',
  type: 'TASK',
  priority: 'HIGH'
});

const subtask2 = await callFunction('sadmin_createTask', {
  projectId: 'project-uuid',
  parentId: epic.data.id,
  title: 'Implement Backend',
  type: 'FEATURE',
  priority: 'HIGH'
});
```

### Update Task Workflow

```javascript
// Create task
const task = await callFunction('sadmin_createTask', {
  projectId: 'project-uuid',
  title: 'Fix login bug',
  type: 'BUG',
  priority: 'CRITICAL'
});

// Move to IN_PROGRESS
await callFunction('sadmin_updateTaskStatus', {
  id: task.data.id,
  status: 'IN_PROGRESS'
});

// Add progress comment
await callFunction('sadmin_addComment', {
  taskId: task.data.id,
  content: 'Found the issue - working on fix'
});

// Complete task
await callFunction('sadmin_updateTaskStatus', {
  id: task.data.id,
  status: 'DONE'
});
```

### Upload File to Task

```javascript
const fs = require('fs');

// Read file and convert to base64
const fileContent = fs.readFileSync('screenshot.png');
const base64 = `data:image/png;base64,${fileContent.toString('base64')}`;

// Upload attachment
await callFunction('sadmin_uploadAttachment', {
  entityType: 'task',
  entityId: 'task-uuid',
  fileName: 'screenshot.png',
  base64Content: base64,
  description: 'Error screenshot'
});
```

## Rate Limiting

The MCP server does not implement rate limiting, but the underlying SADMIN API may have rate limits based on your API key configuration.

## Support

- GitHub Issues: [https://github.com/buslogic/sadmin2025-mcp-server/issues](https://github.com/buslogic/sadmin2025-mcp-server/issues)
- SADMIN Platform: [https://sadmin2025.ticketing.rs](https://sadmin2025.ticketing.rs)