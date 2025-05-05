// Route checker script
// You can access this at http://localhost:4000/lms/route-checker.js
// Or copy and paste into browser console

(function() {
  const routes = [
    '/lms',
    '/lms/',
    '/lms/login',
    '/lms/signup',
    '/lms/student/dashboard',
    '/lms/admin/dashboard',
    '/lms/workshop/adv-cognitive-techniques',
    '/lms/workshop/adv-cognitive-techniques/materials',
    '/lms/workshop/session/123'
  ];

  const results = {
    accessible: [],
    inaccessible: []
  };

  async function checkRoute(route) {
    try {
      const response = await fetch(route, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Route accessible: ${route}`);
        results.accessible.push(route);
      } else {
        console.log(`❌ Route not accessible: ${route} - Status: ${response.status}`);
        results.inaccessible.push(`${route} (Status: ${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Error accessing route: ${route} - ${error.message}`);
      results.inaccessible.push(`${route} (Error: ${error.message})`);
    }
  }

  async function checkAllRoutes() {
    for (const route of routes) {
      await checkRoute(route);
    }
    
    console.log("\n=== SUMMARY ===");
    console.log(`✅ Accessible routes: ${results.accessible.length}`);
    console.log(`❌ Inaccessible routes: ${results.inaccessible.length}`);
    
    if (results.inaccessible.length > 0) {
      console.log("\nInaccessible routes:");
      results.inaccessible.forEach(route => console.log(`- ${route}`));
    }
  }

  console.log("=== CHECKING ROUTES ===");
  checkAllRoutes();
})(); 