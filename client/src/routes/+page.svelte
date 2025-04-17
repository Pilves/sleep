<script>
  import { authUser } from '$lib/stores/authStore';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  // Handle redirects from 404.html for GitHub Pages SPA routing
  onMount(() => {
    if (browser) {
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirect');

      if (redirectPath) {
        // Remove the redirect parameter to prevent loops
        params.delete('redirect');
        const newUrl = new URL(window.location.href);
        newUrl.search = params.toString();
        history.replaceState(null, '', newUrl.toString());

        // Navigate to the correct path with base
        const fullPath = `${base}${redirectPath}`;
        goto(fullPath);
      }
    }
  });
</script>

<div class="landing-page">
  <section class="hero">
    <div class="container">
      <h1>Sleep Redreamed</h1>
      <p class="tagline">Elevate your rest. Track your journey. Transform your life.</p>

      {#if !$authUser}
        <div class="cta-buttons">
          <a href="{base}/login" class="btn primary">Experience</a>
          <a href="{base}/register" class="btn secondary">Join</a>
        </div>
      {:else}
        <div class="cta-buttons">
          <a href="{base}/dashboard" class="btn primary">Dashboard</a>
        </div>
      {/if}
    </div>
  </section>

  <section class="features">
    <div class="container">
      <div class="section-header">
        <h2>Redefine Your Sleep Experience</h2>
      </div>
      <div class="feature-cards">
        <div class="feature-card">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 18a5 5 0 0 0-10 0"></path>
              <line x1="12" y1="2" x2="12" y2="9"></line>
              <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
              <line x1="1" y1="18" x2="3" y2="18"></line>
              <line x1="21" y1="18" x2="23" y2="18"></line>
              <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
              <line x1="23" y1="22" x2="1" y2="22"></line>
              <polyline points="16 6 12 2 8 6"></polyline>
            </svg>
          </div>
          <h3>Mindful Tracking</h3>
          <p>Visualize your sleep patterns with intuitive insights through seamless Oura Ring integration</p>
        </div>

        <div class="feature-card">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm14-10V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v5h14zm-8-4a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
              <path d="M4 15h2M4 15v3a2 2 0 0 0 2 2h2M4 15V5"/>
            </svg>
          </div>
          <h3>Purposeful Competition</h3>
          <p>Connect with like-minded individuals who seek better sleep through gentle, intentional challenges</p>
        </div>

        <div class="feature-card">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z"/>
              <path d="M10 2c1 .5 2 2 2 5"/>
            </svg>
          </div>
          <h3>Calm Analytics</h3>
          <p>Discover personalized sleep insights with elegant, meaningful visualizations that guide improvement</p>
        </div>
      </div>
    </div>
  </section>

  <section class="concept">
    <div class="container">
      <div class="concept-content">
        <div class="concept-text">
          <h2>A New Philosophy of Rest</h2>
          <p>Sleep Olympics brings Nordic simplicity to the science of sleep. We believe quality rest should be celebrated, not commodified—embraced as both an art and a science.</p>
          <p>Through mindful tracking and gentle competition with friends, discover what optimal sleep means for your unique body and mind.</p>
        </div>
        <div class="concept-image">
          <div class="image-placeholder"></div>
        </div>
      </div>
    </div>
  </section>

  <section class="testimonials">
    <div class="container">
      <div class="section-header">
        <h2>Stories of Transformation</h2>
      </div>

      <div class="testimonial-cards">
        <div class="testimonial-card">
          <div class="quote">"Sleep Olympics changed my relationship with rest. The quiet competition with friends turned something I neglected into something I prioritize."</div>
          <div class="author">— Elise K.</div>
        </div>

        <div class="testimonial-card">
          <div class="quote">"The minimalist approach to tracking helped me see patterns I'd missed for years. Now I understand my body's rhythms with clarity."</div>
          <div class="author">— Thomas M.</div>
        </div>

        <div class="testimonial-card">
          <div class="quote">"I've tried many sleep apps, but none with this elegant simplicity. The insights feel meaningful rather than overwhelming."</div>
          <div class="author">— Sofia L.</div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="container">
      <h2>Begin Your Sleep Journey</h2>
      <p>Join a community that values the art of rest.</p>

      {#if !$authUser}
        <a href="{base}/register" class="btn primary large">Get Started</a>
      {:else}
        <a href="{base}/dashboard" class="btn primary large">View Dashboard</a>
      {/if}
    </div>
  </section>
</div>

<style>
  .landing-page {
    color: #333;
    font-family: 'Inter', sans-serif;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 50px;
  }

  .section-header h2 {
    position: relative;
    display: inline-block;
    font-weight: 500;
    margin-bottom: 15px;
  }

  .section-header h2:after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: #6e8efb;
  }

  /* Hero Section */
  .hero {
    height: 100vh;
    min-height: 600px;
    display: flex;
    align-items: center;
    text-align: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%);
    overflow: hidden;
    position: relative;
  }

  .hero:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="0.5" fill="%23a0aec0" opacity="0.2"/></svg>');
    z-index: 0;
  }

  .hero .container {
    position: relative;
    z-index: 1;
  }

  h1 {
    font-size: 4.5rem;
    margin-bottom: 16px;
    font-weight: 300;
    letter-spacing: -1px;
    color: #1a202c;
  }

  .tagline {
    font-size: 1.5rem;
    margin-bottom: 40px;
    color: #4a5568;
    font-weight: 300;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .btn {
    padding: 16px 40px;
    border-radius: 4px;
    font-weight: 500;
    text-decoration: none;
    letter-spacing: 1px;
    transition: all 0.3s ease;
  }

  .btn.large {
    padding: 18px 48px;
    font-size: 1rem;
  }

  .primary {
    background-color: #6e8efb;
    color: white;
    border: none;
  }

  .primary:hover {
    background-color: #5a7be0;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(110, 142, 251, 0.2);
  }

  .secondary {
    background-color: transparent;
    color: #6e8efb;
    border: 1px solid #6e8efb;
  }

  .secondary:hover {
    background-color: rgba(110, 142, 251, 0.05);
    transform: translateY(-3px);
  }

  /* Features Section */
  .features {
    padding: 120px 0;
    background-color: #fff;
  }

  .feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
  }

  .feature-card {
    text-align: center;
    padding: 40px 30px;
    border-radius: 4px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  }

  .icon {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
    color: #6e8efb;
  }

  h3 {
    margin-bottom: 15px;
    color: #1a202c;
    font-size: 1.5rem;
    font-weight: 500;
  }

  .feature-card p {
    color: #4a5568;
    line-height: 1.7;
  }

  /* Concept Section */
  .concept {
    padding: 120px 0;
    background-color: #f8f9fa;
  }

  .concept-content {
    display: flex;
    align-items: center;
    gap: 60px;
  }

  .concept-text {
    flex: 1;
  }

  .concept-text h2 {
    font-size: 2.5rem;
    margin-bottom: 25px;
    font-weight: 400;
    color: #1a202c;
  }

  .concept-text p {
    color: #4a5568;
    margin-bottom: 20px;
    line-height: 1.8;
    font-size: 1.1rem;
  }

  .concept-image {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .image-placeholder {
    width: 100%;
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, #6e8efb22, #a777e322);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .image-placeholder:after {
    content: "睡眠";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 5rem;
    color: #6e8efb;
    opacity: 0.2;
  }

  /* Testimonials Section */
  .testimonials {
    padding: 120px 0;
    background-color: #fff;
  }

  .testimonial-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
  }

  .testimonial-card {
    background-color: #fff;
    padding: 40px;
    border-radius: 4px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    position: relative;
  }

  .testimonial-card:before {
    content: """;
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 5rem;
    color: #f7fafc;
    font-family: serif;
    line-height: 1;
    z-index: 0;
  }

  .quote {
    position: relative;
    z-index: 1;
    font-style: italic;
    margin-bottom: 20px;
    color: #4a5568;
    line-height: 1.7;
  }

  .author {
    font-weight: 500;
    color: #6e8efb;
  }

  /* CTA Section */
  .cta {
    background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%);
    color: #1a202c;
    text-align: center;
    padding: 120px 0;
  }

  .cta h2 {
    color: #1a202c;
    margin-bottom: 20px;
    font-size: 2.5rem;
    font-weight: 400;
  }

  .cta p {
    font-size: 1.2rem;
    margin-bottom: 40px;
    color: #4a5568;
    font-weight: 300;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 3rem;
    }

    .tagline {
      font-size: 1.2rem;
    }

    .concept-content {
      flex-direction: column;
    }

    .hero, .features, .concept, .testimonials, .cta {
      padding: 80px 0;
    }

    .hero {
      height: auto;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 2.5rem;
    }

    .btn {
      padding: 14px 28px;
    }
  }
</style>
