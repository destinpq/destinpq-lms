// Simple fetch for local testing

const testWorkshopAPI = async () => {
  try {
    console.log('Checking localStorage for token...');
    // Use localStorage or fallback to hardcoded token for testing
    const token = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;
    
    if (!token) {
      console.error('No authentication token found in localStorage');
      return;
    }
    
    console.log('Found token, making API request...');
    
    const response = await fetch('http://localhost:4001/student/workshops', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`Found ${data.length} workshops for the current user`);
      data.forEach(workshop => {
        console.log(`- Workshop ${workshop.id}: ${workshop.title} (${new Date(workshop.scheduledAt).toLocaleString()})`);
        console.log(`  Attendees: ${workshop.attendees?.length || 0}`);
      });
    } else {
      console.log('No workshops found for the current user');
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

// Run the test if in browser context
if (typeof window !== 'undefined') {
  console.log('Running API test...');
  testWorkshopAPI();
} else {
  console.log('This script is designed to run in a browser context');
}

// Export for use in Node.js
if (typeof module !== 'undefined') {
  module.exports = { testWorkshopAPI };
} 