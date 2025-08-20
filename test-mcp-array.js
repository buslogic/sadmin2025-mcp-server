// Test to see how MCP sends array parameters
const params = {
  projectId: 'cacf6ec3-e988-4969-9448-be741ddcaee4',
  title: 'Test Epic with MCP Arrays',
  description: 'Testing array parameter handling',
  priority: 'HIGH',
  epicHealth: 'ON_TRACK',
  linkedTaskIds: [
    'badf6ed8-cdfe-47d4-b825-29e31e7f1ffd',
    '1697df44-2d52-4b3e-8f83-766234b281e4'
  ]
};

console.log('Original params:', JSON.stringify(params, null, 2));
console.log('Type of linkedTaskIds:', typeof params.linkedTaskIds);
console.log('Is array?:', Array.isArray(params.linkedTaskIds));

// Simulate what MCP might send
const mcpSimulated = JSON.parse(JSON.stringify(params));
console.log('\nAfter JSON parse/stringify:', JSON.stringify(mcpSimulated, null, 2));
console.log('Type of linkedTaskIds:', typeof mcpSimulated.linkedTaskIds);
console.log('Is array?:', Array.isArray(mcpSimulated.linkedTaskIds));