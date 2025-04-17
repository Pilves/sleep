import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/authStore';

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

// Handle page navigation and authentication in SvelteKit's routing system
export function load({ url }) {
  if (browser) {
    const path = url.pathname;
    
    // Track if we're on a public path
    const isPublicPath = publicPaths.some(publicPath => 
      path === publicPath || path.startsWith(publicPath)
    );
    
    return {
      url: url.pathname,
      isPublicPath
    };
  }
  
  return {
    url: url.pathname,
    isPublicPath: true // default for SSR
  };
}

// This ensures SvelteKit routes through our error page for 404s
export const handleError = ({ error, status }) => {
  console.error('Route error:', error);
  
  if (status === 404) {
    // Let our +error.svelte handle this
    return {
      message: 'Page not found',
      status: 404
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    status
  };
};