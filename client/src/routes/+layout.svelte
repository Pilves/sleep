<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { authUser, authLoading } from '$lib/stores/authStore';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import './app.css';
	import { goto } from '$app/navigation'; // Make sure goto is imported

	// Paths that should use the sidebar layout
	const sidebarPaths = [
		'/dashboard',
		'/competitions',
		'/leaderboard',
		'/sleep-history',
		'/profile',
		'/admin'
	];

	// Public paths that don't require authentication
	const publicPaths = [
		'/',
		'/login',
		'/register',
		'/forgot-password',
		'/reset-password'
	];

	// Determine if current path should use sidebar layout
	$: useSidebar = $authUser &&
			!$authLoading &&
			sidebarPaths.some(path => $page.url.pathname.startsWith(path));

	// Check if the current path requires authentication
	$: requiresAuth = !publicPaths.some(path =>
			$page.url.pathname === path ||
			$page.url.pathname.startsWith(path)
	);

	// Handle authentication redirect
	$: if (browser && !$authLoading) {
		if (requiresAuth && !$authUser) {
			// Redirect to login page if accessing protected route without auth
			goto('/login'); // Use goto here!
		}
	}
</script>

<div class="app-container {useSidebar ? 'with-sidebar' : ''}">
	{#if !useSidebar}
		<Header/>
	{/if}

	{#if useSidebar}
		<Sidebar/>
		<div class="main-content with-sidebar">
			<slot/>
		</div>
	{:else}
		<div class="main-content">
			<slot/>
		</div>
	{/if}

	<footer class="footer {useSidebar ? 'with-sidebar' : ''}">
		<div class="container">
			<div class="footer-content">
				<p>&copy; {new Date().getFullYear()} Sleep Olympics. All rights reserved.</p>
				<div class="footer-links">
					<a href="/privacy">Privacy Policy</a>
					<a href="/terms">Terms of Service</a>
					<a href="/contact">Contact Us</a>
				</div>
			</div>
		</div>
	</footer>
</div>
<style>
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f8f9fa;
	}

	.app-container.with-sidebar {
		padding-left: 240px;
	}

	.main-content {
		flex: 1;
		padding: 20px;
		padding-top: 80px; /* Space for fixed header */
	}

	.main-content.with-sidebar {
		padding-top: 20px;
	}

	.footer {
		background-color: white;
		padding: 20px;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
		margin-top: 40px;
	}

	.footer.with-sidebar {
		margin-left: 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.footer-content {
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

	@media (max-width: 768px) {
		.app-container.with-sidebar {
			padding-left: 70px;
		}

		.footer-content {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
