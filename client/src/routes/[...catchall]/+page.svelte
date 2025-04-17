<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { authUser, authLoading } from '$lib/stores/authStore';
  import { page } from '$app/stores';
  
  // Get the current path for display
  $: currentPath = $page.url.pathname;
  
  // Redirect after a short delay
  onMount(() => {
    if (browser) {
      setTimeout(() => {
        if ($authUser) {
          goto('/dashboard');
        } else {
          goto('/login');
        }
      }, 2000);
    }
  });
</script>

<div class="catchall-container">
  <div class="error-box">
    <h1>Page Not Found</h1>
    <p>Sorry, the page <code>{currentPath}</code> doesn't exist.</p>
    <p>You'll be redirected {$authUser ? 'to the dashboard' : 'to login'} in a few seconds...</p>
    
    <div class="actions">
      <a href="/dashboard" class="btn primary">Go to Dashboard</a>
      <a href="/" class="btn secondary">Go to Home</a>
    </div>
  </div>
</div>

<style>
  .catchall-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 200px);
    padding: 0 20px;
  }
  
  .error-box {
    max-width: 600px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
    text-align: center;
  }
  
  h1 {
    color: #2d3748;
    margin-bottom: 20px;
    font-size: 2rem;
  }
  
  p {
    color: #4a5568;
    margin-bottom: 16px;
    font-size: 1.1rem;
    line-height: 1.5;
  }
  
  code {
    background: #f7fafc;
    padding: 3px 6px;
    border-radius: 4px;
    font-family: monospace;
    color: #e53e3e;
  }
  
  .actions {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .btn {
    display: inline-block;
    padding: 10px 24px;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .primary {
    background: #6e8efb;
    color: white;
  }
  
  .primary:hover {
    background: #5a7dfa;
    transform: translateY(-2px);
  }
  
  .secondary {
    background: #edf2f7;
    color: #4a5568;
  }
  
  .secondary:hover {
    background: #e2e8f0;
    transform: translateY(-2px);
  }
</style>