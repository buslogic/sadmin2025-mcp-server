# SADMIN 2025 MCP Server

MCP (Model Context Protocol) server for native SADMIN 2025 API integration with Claude Code.

## Features

- 🔧 Type-safe API integration
- 📋 Task management (CRUD operations)
- 📊 Epic management
- 💬 Comments system
- 📎 File attachments
- 🔍 Smart search and filtering
- ⚡ Auto-completion support
- 🛡️ Built-in error handling

## Installation

```bash
npm install @buslogic/sadmin2025-mcp
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your SADMIN API credentials:
```env
SADMIN_API_URL=https://sadmin2025api.ticketing.rs/api/claude
SADMIN_API_KEY=your_api_key_here
SADMIN_PROJECT_ID=your_project_id_here
```

## Usage

### As MCP Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### In Claude Code

Once the MCP server is running, Claude Code will automatically detect and use the available functions:

- `sadmin_getTasks` - Get list of tasks
- `sadmin_getTask` - Get task details
- `sadmin_createTask` - Create new task
- `sadmin_updateTaskStatus` - Update task status
- `sadmin_getEpics` - Get list of epics
- `sadmin_createEpic` - Create new epic
- `sadmin_getComments` - Get comments for a task
- `sadmin_addComment` - Add comment to task
- `sadmin_getAttachments` - Get attachments for an entity
- `sadmin_uploadAttachment` - Upload file attachment
- `sadmin_downloadAttachment` - Download attachment by ID

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run test coverage
npm run test:coverage

# Build for production
npm run build

# Test the server
./scripts/test-server.sh
```

## Project Structure

```
sadmin2025-mcp-server/
├── src/
│   ├── index.ts          # Express server and MCP endpoints
│   ├── client.ts         # SADMIN API client
│   ├── config.ts         # Configuration management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
│       └── validation.ts # Zod validation schemas
├── tests/                # Unit tests
├── examples/             # Usage examples
├── docs/                 # Documentation
│   └── API.md           # API reference
└── scripts/              # Utility scripts
    └── test-server.sh   # Server testing script
```

## API Functions

### Task Management

#### `sadmin_getTasks(options?)`
Get list of tasks with optional filters.

```typescript
const tasks = await sadmin_getTasks({
  projectId: "project-id",
  status: "TODO",
  type: "TASK"
});
```

#### `sadmin_createTask(data)`
Create a new task.

```typescript
const task = await sadmin_createTask({
  projectId: "project-id",
  title: "New task",
  description: "Task description",
  type: "TASK",
  priority: "HIGH"
});
```

### Epic Management

#### `sadmin_getEpics(options?)`
Get list of epics with optional filters.

```typescript
const epics = await sadmin_getEpics({
  projectId: "project-id",
  status: "IN_PROGRESS"
});
```

## License

MIT

## Author

buslogic

## Links

- [GitHub Repository](https://github.com/buslogic/sadmin2025-mcp-server)
- [NPM Package](https://www.npmjs.com/package/@buslogic/sadmin2025-mcp)
- [SADMIN 2025](https://sadmin2025.ticketing.rs)