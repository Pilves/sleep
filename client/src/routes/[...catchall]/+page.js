// This file ensures the catchall route is handled properly
// It's needed for SvelteKit to match dynamic route parameters

// We don't actually need to load any data for this 404 page
export function load({ params }) {
  // The catchall parameter contains the non-existent route path
  const path = params.catchall;
  
  return {
    // Return the path for display purposes
    path
  };
}

// Set the status code to 404 for proper SEO handling
export function entries() {
  return [];
}