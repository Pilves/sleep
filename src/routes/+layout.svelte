<script>
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import { authUser, authLoading } from '$lib/stores/authStore';
	import '../app.css';
</script>

<div class="app">
	<Header />
	
	<main>
		<slot />
	</main>
	
	<footer>
		<div class="footer-content">
			<p>&copy; {new Date().getFullYear()} Sleep Olympics. All rights reserved.</p>
			<div class="footer-links">
				<a href="/privacy">Privacy Policy</a>
				<a href="/terms">Terms of Service</a>
				<a href="/contact">Contact Us</a>
			</div>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f8f9fa;
	}
	
	main {
		flex: 1;
	}
	
	footer {
		background-color: white;
		padding: 20px;
		box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
		margin-top: 40px;
	}
	
	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 20px;
	}
	
	.footer-content p {
		margin: 0;
		color: #666;
	}
	
	.footer-links {
		display: flex;
		gap: 20px;
	}
	
	.footer-links a {
		color: #6e8efb;
		text-decoration: none;
		font-size: 0.9rem;
	}
	
	.footer-links a:hover {
		text-decoration: underline;
	}
	
	@media (max-width: 600px) {
		.footer-content {
			flex-direction: column;
			text-align: center;
		}
	}
</style>