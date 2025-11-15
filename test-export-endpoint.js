// Test script for the export API endpoint
// This tests the Excel export functionality

const BASE_URL = 'http://localhost:3001/api/admin/export-master-data';

async function testExportEndpoint() {
  try {
    // You would need to provide a valid token from your admin login
    const token = localStorage.getItem('prograde_token');
    
    if (!token) {
      console.error('No admin token found. Please login as admin first.');
      return;
    }

    console.log('Testing export endpoint...');
    
    const response = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} ${response.statusText}`);
      console.error('Response:', errorText);
      return;
    }

    console.log('Export successful!');
    console.log('Response headers:');
    console.log('- Content-Type:', response.headers.get('Content-Type'));
    console.log('- Content-Disposition:', response.headers.get('Content-Disposition'));
    
    // Get the blob
    const blob = await response.blob();
    console.log('Blob size:', blob.size, 'bytes');
    
    // Download the file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `master_data_test_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('File downloaded successfully!');
  } catch (error) {
    console.error('Error testing export:', error);
  }
}

// Call the function
testExportEndpoint();
