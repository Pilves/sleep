<script>
  import { authUser } from '$lib/stores/authStore';
</script>

<div class="landing-page">
  <section class="hero">
    <div class="container">
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
    </div>
  </section>

  <section class="features">
    <div class="container">
      <div class="feature-cards">
        <div class="feature-card">
          <div class="icon">🌙</div>
          <h3>Track Your Sleep</h3>
          <p>Record your sleep duration and quality to get personal insights through Oura Ring integration</p>
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
      </div>
    </div>
  </section>

  <section class="how-it-works">
    <div class="container">
      <h2>How Sleep Olympics Works</h2>

      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Connect Your Oura Ring</h3>
          <p>Sync your Oura Ring data to automatically track your sleep metrics</p>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <h3>Join Competitions</h3>
          <p>Participate in various sleep competitions with different goals and timeframes</p>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <h3>Win Medals</h3>
          <p>Earn medals and achievements by improving your sleep metrics</p>
        </div>
      </div>
    </div>
  </section>

  <section class="testimonials">
    <div class="container">
      <h2>What Our Users Say</h2>

      <div class="testimonial-cards">
        <div class="testimonial-card">
          <div class="quote">"Sleep Olympics has completely transformed my sleep habits. I'm now getting consistent quality sleep for the first time in years!"</div>
          <div class="author">— Sarah K.</div>
        </div>

        <div class="testimonial-card">
          <div class="quote">"Competing with my friends made improving my sleep fun. I've seen major improvements in my energy levels during the day."</div>
          <div class="author">— Michael T.</div>
        </div>

        <div class="testimonial-card">
          <div class="quote">"The detailed analytics helped me identify patterns that were affecting my sleep quality. Truly eye-opening!"</div>
          <div class="author">— Jessica L.</div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="container">
      <h2>Ready to Transform Your Sleep?</h2>
      <p>Join Sleep Olympics today and start your journey to better sleep.</p>

      {#if !$authUser}
        <a href="/register" class="btn primary large">Get Started</a>
      {:else}
        <a href="/dashboard" class="btn primary large">Go to Dashboard</a>
      {/if}
    </div>
  </section>
</div>

<style>
  .landing-page {
    color: #333;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .hero {
    text-align: center;
    padding: 100px 0;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: white;
    margin-bottom: 60px;
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

  .btn.large {
    padding: 16px 40px;
    font-size: 1.1rem;
  }

  .primary {
    background-color: white;
    color: #6e8efb;
  }

  .hero .primary {
    background-color: white;
    color: #6e8efb;
  }

  .hero .primary:hover {
    background-color: #f0f0f0;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .cta .primary {
    background-color: #6e8efb;
    color: white;
  }

  .cta .primary:hover {
    background-color: #5a7be0;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(110, 142, 251, 0.3);
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

  .features, .how-it-works, .testimonials {
    padding: 80px 0;
  }

  .how-it-works {
    background-color: #f9f9f9;
  }

  h2 {
    text-align: center;
    font-size: 2.2rem;
    margin-bottom: 50px;
    color: #333;
  }

  .feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
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
    font-size: 1.5rem;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-top: 50px;
  }

  .step {
    text-align: center;
    position: relative;
  }

  .step-number {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0 auto 20px;
  }

  .testimonial-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .testimonial-card {
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .quote {
    font-style: italic;
    margin-bottom: 20px;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .author {
    font-weight: 600;
    color: #6e8efb;
  }

  .cta {
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: white;
    text-align: center;
    padding: 80px 0;
  }

  .cta h2 {
    color: white;
    margin-bottom: 20px;
  }

  .cta p {
    font-size: 1.2rem;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }

    .tagline {
      font-size: 1.2rem;
    }

    .feature-cards, .steps, .testimonial-cards {
      grid-template-columns: 1fr;
    }

    .hero, .features, .how-it-works, .testimonials, .cta {
      padding: 60px 0;
    }
  }
</style>
