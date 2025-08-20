// Test to see what MCP protocol sends
const axios = require('axios');

async function testMCPProtocol() {
  try {
    // Simulate what MCP might send - array as JSON string
    const mcpStyleParams = {
      projectId: 'cacf6ec3-e988-4969-9448-be741ddcaee4',
      title: 'Test Epic - Array as String',
      description: 'Testing how to handle array sent as string',
      priority: 'HIGH',
      epicHealth: 'ON_TRACK',
      linkedTaskIds: '["badf6ed8-cdfe-47d4-b825-29e31e7f1ffd", "1697df44-2d52-4b3e-8f83-766234b281e4"]'
    };
    
    console.log('Sending linkedTaskIds as STRING:', mcpStyleParams.linkedTaskIds);
    console.log('Type:', typeof mcpStyleParams.linkedTaskIds);
    
    // Test if we can parse it
    if (typeof mcpStyleParams.linkedTaskIds === 'string') {
      try {
        const parsed = JSON.parse(mcpStyleParams.linkedTaskIds);
        console.log('Parsed to array:', parsed);
        console.log('Is array?:', Array.isArray(parsed));
        mcpStyleParams.linkedTaskIds = parsed;
      } catch (e) {
        console.log('Failed to parse as JSON');
      }
    }
    
    // Now try to send to API
    const response = await axios.post('http://localhost:3010/functions/sadmin_createEpic', mcpStyleParams);
    console.log('\nEpic created successfully!');
    console.log('Epic ID:', response.data.data.id);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testMCPProtocol();