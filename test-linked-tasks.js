const axios = require('axios');

async function testLinkedTasks() {
  try {
    // First create 2 test tasks
    console.log('Creating test tasks...');
    
    const task1 = await axios.post('http://localhost:3010/functions/sadmin_createTask', {
      projectId: 'cacf6ec3-e988-4969-9448-be741ddcaee4',
      title: 'Test Task 1 for Linking',
      description: 'This task will be linked to epic',
      type: 'TASK',
      priority: 'MEDIUM'
    });
    
    const task2 = await axios.post('http://localhost:3010/functions/sadmin_createTask', {
      projectId: 'cacf6ec3-e988-4969-9448-be741ddcaee4',
      title: 'Test Task 2 for Linking',
      description: 'This task will be linked to epic',
      type: 'BUG',
      priority: 'HIGH'
    });
    
    console.log('Task 1 created:', task1.data.data.id);
    console.log('Task 2 created:', task2.data.data.id);
    
    // Now create an epic with linkedTaskIds
    console.log('\nCreating epic with linkedTaskIds...');
    console.log('Sending linkedTaskIds:', [task1.data.data.id, task2.data.data.id]);
    
    const epicResponse = await axios.post('http://localhost:3010/functions/sadmin_createEpic', {
      projectId: 'cacf6ec3-e988-4969-9448-be741ddcaee4',
      title: 'Test Epic with Linked Tasks',
      description: 'This epic should have 2 linked tasks',
      priority: 'HIGH',
      epicHealth: 'ON_TRACK',
      linkedTaskIds: [task1.data.data.id, task2.data.data.id]
    });
    
    console.log('\nEpic created:');
    console.log('Epic ID:', epicResponse.data.data.id);
    console.log('Epic Title:', epicResponse.data.data.title);
    
    // Check if tasks were linked
    console.log('\nChecking if tasks were linked...');
    const updatedTask1 = await axios.post('http://localhost:3010/functions/sadmin_getTask', {
      id: task1.data.data.id
    });
    
    const updatedTask2 = await axios.post('http://localhost:3010/functions/sadmin_getTask', {
      id: task2.data.data.id
    });
    
    console.log('Task 1 parentId:', updatedTask1.data.data.parentId);
    console.log('Task 2 parentId:', updatedTask2.data.data.parentId);
    
    if (updatedTask1.data.data.parentId === epicResponse.data.data.id) {
      console.log('✅ Task 1 successfully linked to Epic!');
    } else {
      console.log('❌ Task 1 NOT linked to Epic');
    }
    
    if (updatedTask2.data.data.parentId === epicResponse.data.data.id) {
      console.log('✅ Task 2 successfully linked to Epic!');
    } else {
      console.log('❌ Task 2 NOT linked to Epic');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testLinkedTasks();