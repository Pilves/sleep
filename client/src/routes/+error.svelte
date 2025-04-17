<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { authUser } from '$lib/stores/authStore';
  
  // Redirect to dashboard after a short delay if user is authenticated
  // otherwise redirect to login page
  onMount(() => {
    if (browser) {
      setTimeout(() => {
        if ($authUser) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login';
        }
      }, 2000);
    }
  });
</script>

<div class="error-container">
  <div class="error-content">
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <p>You'll be redirected {$authUser ? 'to the dashboard' : 'to login'} in a few seconds...</p>
    
    <div class="buttons">
      <a href="/dashboard" class="btn primary">Go to Dashboard</a>
      <a href="/" class="btn secondary">Go to Home</a>
    </div>
  </div>
</div>

<style>
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 200px);
    text-align: center;
    padding: 0 20px;
  }
  
  .error-content {
    max-width: 500px;
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2rem;
  }
  
  p {
    color: #666;
    margin-bottom: 20px;
    font-size: 1.1rem;
  }
  
  .buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 30px;
  }
  
  .btn {
    display: inline-block;
    padding: 10px 20px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .primary {
    background: #6e8efb;
    color: white;
  }
  
  .primary:hover {
    background: #5a7dfa;
  }
  
  .secondary {
    background: #f0f0f0;
    color: #333;
  }
  
  .secondary:hover {
    background: #e0e0e0;
  }
</style>