#!/usr/bin/env tsx

/**
 * Basic usage examples for SADMIN 2025 MCP Server
 * Run with: npx tsx examples/basic-usage.ts
 */

import axios from 'axios';

const MCP_SERVER_URL = 'http://localhost:3010';

// Helper function to call MCP functions
async function callMCPFunction(functionName: string, params: any = {}) {
  try {
    const response = await axios.post(
      `${MCP_SERVER_URL}/functions/${functionName}`,
      params,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error calling ${functionName}:`, error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 SADMIN 2025 MCP Server Examples\n');

  try {
    // 1. Check server health
    console.log('1️⃣ Checking server health...');
    const health = await axios.get(`${MCP_SERVER_URL}/health`);
    console.log('   Health:', health.data);
    console.log();

    // 2. Get all projects
    console.log('2️⃣ Getting all projects...');
    const projects = await callMCPFunction('sadmin_getProjects');
    console.log('   Projects found:', projects.data?.length || 0);
    if (projects.data?.length > 0) {
      console.log('   First project:', projects.data[0].name);
    }
    console.log();

    // 3. Get tasks for a project (use first project if available)
    if (projects.data?.length > 0) {
      const projectId = projects.data[0].id;
      console.log(`3️⃣ Getting tasks for project ${projects.data[0].name}...`);
      
      const tasks = await callMCPFunction('sadmin_getTasks', { projectId });
      console.log('   Tasks found:', tasks.data?.length || 0);
      
      // Show task types distribution
      if (tasks.data?.length > 0) {
        const types = tasks.data.reduce((acc: any, task: any) => {
          acc[task.type] = (acc[task.type] || 0) + 1;
          return acc;
        }, {});
        console.log('   Task types:', types);
      }
      console.log();

      // 4. Get epics for the project
      console.log('4️⃣ Getting epics...');
      const epics = await callMCPFunction('sadmin_getEpics', { projectId });
      console.log('   Epics found:', epics.data?.length || 0);
      if (epics.data?.length > 0) {
        console.log('   First epic:', epics.data[0].title);
      }
      console.log();

      // 5. Create a test task
      console.log('5️⃣ Creating a test task...');
      const newTask = await callMCPFunction('sadmin_createTask', {
        projectId,
        title: `Test Task from MCP Server - ${new Date().toISOString()}`,
        description: 'This is a test task created via MCP Server examples',
        type: 'TASK',
        priority: 'MEDIUM',
      });
      console.log('   Task created:', newTask.data?.id);
      console.log('   Task title:', newTask.data?.title);
      console.log();

      // 6. Add a comment to the task
      if (newTask.data?.id) {
        console.log('6️⃣ Adding a comment to the task...');
        const comment = await callMCPFunction('sadmin_addComment', {
          taskId: newTask.data.id,
          content: 'This is a test comment from MCP Server examples',
        });
        console.log('   Comment added:', comment.data?.id);
        console.log();

        // 7. Update task status
        console.log('7️⃣ Updating task status to IN_PROGRESS...');
        const updatedTask = await callMCPFunction('sadmin_updateTaskStatus', {
          id: newTask.data.id,
          status: 'IN_PROGRESS',
        });
        console.log('   Task status updated:', updatedTask.data?.status);
        console.log();

        // 8. Get task details
        console.log('8️⃣ Getting task details...');
        const taskDetails = await callMCPFunction('sadmin_getTask', {
          id: newTask.data.id,
        });
        console.log('   Task details:');
        console.log('   - Title:', taskDetails.data?.title);
        console.log('   - Status:', taskDetails.data?.status);
        console.log('   - Comments:', taskDetails.data?.comments?.length || 0);
      }
    }

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
  }
}

// Run the examples
main();