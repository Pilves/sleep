<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAdmin, authLoading } from '$lib/stores/authStore';
	import { page } from '$app/stores';

	let currentPath = '';

	// Update current path for active menu highlighting
	$: if ($page) {
		currentPath = $page.url.pathname;
	}

	onMount(() => {
		// Wait for auth state to be determined
		const unsubscribe = authLoading.subscribe(loading => {
			if (!loading) {
				// Check if user is admin
				let adminUnsubscribe = isAdmin.subscribe(admin => {
					if (!admin) {
						// Redirect non-admin users to the dashboard
						goto('/dashboard');
					}
				});
				
				// Make sure we unsubscribe when component is destroyed
				return () => {
					if (adminUnsubscribe) {
						adminUnsubscribe();
					}
				};
			}
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<div class="admin-layout">
	<div class="admin-sidebar">
		<h2>Admin Panel</h2>
		<nav>
			<a
					href="/admin/competitions"
					class:active={currentPath.includes('/admin/competitions')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm14-10V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v5h14zm-8-4a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
					<path d="M4 15h2M4 15v3a2 2 0 0 0 2 2h2M4 15V5"/>
				</svg>
				Competitions
			</a>
			<a
					href="/admin/users"
					class:active={currentPath.includes('/admin/users')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
					<circle cx="9" cy="7" r="4"></circle>
					<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
					<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
				</svg>
				Users
			</a>
			<a
					href="/admin/invitations"
					class:active={currentPath.includes('/admin/invitations')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
					<polyline points="22,6 12,13 2,6"></polyline>
				</svg>
				Invitations
			</a>
		</nav>
		<div class="back-link">
			<a href="/dashboard">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="19" y1="12" x2="5" y2="12"></line>
					<polyline points="12 19 5 12 12 5"></polyline>
				</svg>
				Back to Dashboard
			</a>
		</div>
	</div>

	<div class="admin-content">
		<slot></slot>
	</div>
</div>

<style>
	.admin-layout {
		display: flex;
		min-height: calc(100vh - 70px);
	}

	.admin-sidebar {
		width: 250px;
		background-color: #1e293b;
		color: white;
		padding: 25px 0;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
	}

	.admin-sidebar h2 {
		padding: 0 25px;
		margin: 0 0 25px 0;
		font-size: 1.2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 15px;
	}

	.admin-sidebar nav {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.admin-sidebar a {
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		padding: 12px 25px;
		transition: all 0.3s;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.admin-sidebar a:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.admin-sidebar a.active {
		background-color: rgba(255, 255, 255, 0.15);
		color: white;
		border-left: 4px solid #60A5FA;
		padding-left: 21px; /* 25px - 4px border */
	}

	.admin-sidebar svg {
		opacity: 0.8;
	}

	.admin-sidebar a:hover svg,
	.admin-sidebar a.active svg {
		opacity: 1;
	}

	.back-link {
		margin-top: auto;
		padding: 20px 25px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.back-link a {
		color: rgba(255, 255, 255, 0.6);
		text-decoration: none;
		font-size: 0.9rem;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.back-link a:hover {
		color: white;
		background: none;
	}

	.admin-content {
		flex: 1;
		padding: 30px;
		margin-left: 250px;
		background-color: #f8f9fa;
		min-height: 100vh;
	}

	@media (max-width: 768px) {
		.admin-sidebar {
			width: 60px;
			padding: 15px 0;
		}

		.admin-sidebar h2 {
			font-size: 0;
			padding: 0;
			margin: 15px 0;
			border-bottom: none;
			text-align: center;
		}

		.admin-sidebar h2::after {
			content: "👑";
			font-size: 20px;
			display: inline-block;
		}

		.admin-sidebar a {
			padding: 15px 0;
			justify-content: center;
		}

		.admin-sidebar a.active {
			padding-left: 0;
			border-left: none;
			border-left: 4px solid #60A5FA;
		}

		.admin-sidebar a span {
			display: none;
		}

		.admin-content {
			margin-left: 60px;
			padding: 20px;
		}

		.back-link {
			padding: 15px 0;
			text-align: center;
		}

		.back-link a {
			justify-content: center;
		}

		.back-link a span {
			display: none;
		}
	}
</style>
