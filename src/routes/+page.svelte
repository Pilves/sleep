<script>
  import { authUser } from '$lib/stores/authStore';
</script>

<div class="landing-page">
  <section class="hero">
    <h1>Sleep Olympics</h1>
    <p class="tagline">Track, Compete, and Improve Your Sleep Quality</p>
    
    {#if !$authUser}
      <div class="cta-buttons">
        <a href="/login" class="btn primary">Login</a>
        <a href="/register" class="btn secondary">Register</a>
      </div>
    {:else}
      <div class="cta-buttons">
        <a href="/dashboard" class="btn primary">Go to Dashboard</a>
      </div>
    {/if}
  </section>

  <section class="features">
    <div class="feature-card">
      <div class="icon">🌙</div>
      <h3>Track Your Sleep</h3>
      <p>Record your sleep duration and quality to get personal insights</p>
    </div>
    
    <div class="feature-card">
      <div class="icon">🏆</div>
      <h3>Compete with Friends</h3>
      <p>Join sleep competitions and see who can maintain the healthiest sleep routine</p>
    </div>
    
    <div class="feature-card">
      <div class="icon">📊</div>
      <h3>Detailed Analytics</h3>
      <p>Get personalized reports and recommendations to improve your sleep habits</p>
    </div>
  </section>

  <section class="info">
    <h2>Why Sleep Matters</h2>
    <p>Quality sleep is essential for physical health, cognitive function, and emotional well-being. 
       The Sleep Olympics platform helps you prioritize and improve your sleep through friendly competition and data-driven insights.</p>
  </section>
</div>

<style>
  .landing-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .hero {
    text-align: center;
    padding: 60px 20px;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    border-radius: 12px;
    color: white;
    margin-bottom: 40px;
  }

  h1 {
    font-size: 3.5rem;
    margin-bottom: 16px;
  }

  .tagline {
    font-size: 1.5rem;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .btn {
    padding: 12px 32px;
    border-radius: 50px;
    font-weight: bold;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
  }

  .primary {
    background-color: white;
    color: #6e8efb;
  }

  .primary:hover {
    background-color: #f0f0f0;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;
  }

  .secondary:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin: 60px 0;
  }

  .feature-card {
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    text-align: center;
    transition: transform 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-10px);
  }

  .icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }

  h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .info {
    background-color: #f9f9f9;
    padding: 40px;
    border-radius: 12px;
    margin: 40px 0;
    text-align: center;
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
  }

  p {
    line-height: 1.6;
    color: #555;
  }
</style>
