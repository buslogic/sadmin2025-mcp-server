#!/usr/bin/env tsx

/**
 * Epic workflow example for SADMIN 2025 MCP Server
 * Demonstrates creating and managing epics with child tasks
 * Run with: npx tsx examples/epic-workflow.ts
 */

import axios from 'axios';

const MCP_SERVER_URL = 'http://localhost:3010';

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
  console.log('🎯 SADMIN 2025 MCP Server - Epic Workflow Example\n');

  try {
    // Get first project
    const projects = await callMCPFunction('sadmin_getProjects');
    if (!projects.data?.length) {
      console.log('No projects found. Please create a project first.');
      return;
    }

    const projectId = projects.data[0].id;
    const projectName = projects.data[0].name;
    console.log(`📁 Using project: ${projectName}\n`);

    // 1. Create an Epic
    console.log('1️⃣ Creating an Epic...');
    const epic = await callMCPFunction('sadmin_createEpic', {
      projectId,
      title: 'Q1 2025 Feature Release',
      description: `Major feature release for Q1 2025
      
## Goals:
- Implement new dashboard
- Add reporting features
- Improve performance

## Success Criteria:
- All features tested
- Documentation complete
- Performance improved by 20%`,
      priority: 'HIGH',
      epicStartDate: new Date().toISOString(),
      epicEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      epicHealth: 'ON_TRACK',
    });

    console.log('   Epic created:', epic.data?.title);
    console.log('   Epic ID:', epic.data?.id);
    console.log();

    const epicId = epic.data?.id;

    // 2. Create child tasks for the Epic
    console.log('2️⃣ Creating child tasks for the Epic...');
    
    const childTasks = [
      {
        title: 'Design new dashboard layout',
        type: 'TASK' as const,
        priority: 'HIGH' as const,
        description: 'Create mockups and wireframes for the new dashboard',
      },
      {
        title: 'Implement dashboard components',
        type: 'FEATURE' as const,
        priority: 'HIGH' as const,
        description: 'Build React components for the dashboard',
      },
      {
        title: 'Add export functionality',
        type: 'FEATURE' as const,
        priority: 'MEDIUM' as const,
        description: 'Implement CSV and PDF export for reports',
      },
      {
        title: 'Fix performance bottlenecks',
        type: 'BUG' as const,
        priority: 'HIGH' as const,
        description: 'Optimize database queries and API calls',
      },
      {
        title: 'Write user documentation',
        type: 'TASK' as const,
        priority: 'MEDIUM' as const,
        description: 'Create user guides and API documentation',
      },
    ];

    const createdTasks = [];
    for (const taskData of childTasks) {
      const task = await callMCPFunction('sadmin_createTask', {
        projectId,
        parentId: epicId,
        ...taskData,
      });
      createdTasks.push(task.data);
      console.log(`   ✅ Created: ${taskData.title}`);
    }
    console.log();

    // 3. Get Epic with children
    console.log('3️⃣ Getting Epic details with children...');
    const epicDetails = await callMCPFunction('sadmin_getTask', { id: epicId });
    console.log('   Epic:', epicDetails.data?.title);
    console.log('   Children count:', epicDetails.data?.children?.length || 0);
    console.log();

    // 4. Update some task statuses
    console.log('4️⃣ Updating task statuses...');
    if (createdTasks.length > 0) {
      // Move first task to IN_PROGRESS
      await callMCPFunction('sadmin_updateTaskStatus', {
        id: createdTasks[0].id,
        status: 'IN_PROGRESS',
      });
      console.log(`   ✅ "${createdTasks[0].title}" → IN_PROGRESS`);

      // Move second task to TODO
      if (createdTasks.length > 1) {
        await callMCPFunction('sadmin_updateTaskStatus', {
          id: createdTasks[1].id,
          status: 'TODO',
        });
        console.log(`   ✅ "${createdTasks[1].title}" → TODO`);
      }
    }
    console.log();

    // 5. Add progress comments
    console.log('5️⃣ Adding progress comments...');
    await callMCPFunction('sadmin_addComment', {
      taskId: epicId,
      content: `Epic kickoff meeting completed. Team is aligned on goals and timeline.
      
Key decisions:
- Dashboard will use new design system
- Performance target: 20% improvement
- Weekly progress reviews scheduled`,
    });
    console.log('   ✅ Added kickoff comment to Epic');

    if (createdTasks.length > 0) {
      await callMCPFunction('sadmin_addComment', {
        taskId: createdTasks[0].id,
        content: 'Started working on initial wireframes. Will share draft by EOD.',
      });
      console.log(`   ✅ Added progress comment to first task`);
    }
    console.log();

    // 6. Get all Epics for the project
    console.log('6️⃣ Getting all Epics for the project...');
    const allEpics = await callMCPFunction('sadmin_getEpics', { projectId });
    console.log('   Total Epics:', allEpics.data?.length || 0);
    
    if (allEpics.data?.length > 0) {
      console.log('   Epic list:');
      allEpics.data.forEach((e: any) => {
        console.log(`   - ${e.title} (${e.status})`);
      });
    }

    console.log('\n✅ Epic workflow example completed successfully!');
    console.log('📝 Created 1 Epic with 5 child tasks');
  } catch (error) {
    console.error('\n❌ Epic workflow failed:', error);
  }
}

// Run the example
main();