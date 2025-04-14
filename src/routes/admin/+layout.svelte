<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAdmin, authLoading } from '$lib/stores/authStore';
	
	onMount(() => {
		// Wait for auth state to be determined
		const unsubscribe = authLoading.subscribe(loading => {
			if (!loading) {
				// Check if user is admin
				const unsubAdmin = isAdmin.subscribe(admin => {
					if (!admin) {
						// Redirect non-admin users to the dashboard
						goto('/dashboard');
					}
					unsubAdmin();
				});
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
			<a href="/admin/competitions" class:active={location.pathname.includes('/admin/competitions')}>
				Competitions
			</a>
			<a href="/admin/users" class:active={location.pathname.includes('/admin/users')}>
				Users
			</a>
			<a href="/admin/invitations" class:active={location.pathname.includes('/admin/invitations')}>
				Invitations
			</a>
		</nav>
		<div class="back-link">
			<a href="/dashboard">← Back to Dashboard</a>
		</div>
	</div>
	
	<div class="admin-content">
		<slot></slot>
	</div>
</div>

<style>
	.admin-layout {
		display: flex;
		min-height: calc(100vh - 70px - 100px); /* Adjust based on header and footer heights */
	}
	
	.admin-sidebar {
		width: 250px;
		background-color: #2d3748;
		color: white;
		padding: 25px 0;
		flex-shrink: 0;
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
	}
	
	.admin-sidebar a {
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		padding: 12px 25px;
		transition: all 0.3s;
		font-weight: 500;
	}
	
	.admin-sidebar a:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: white;
	}
	
	.admin-sidebar a.active {
		background-color: #4a5568;
		color: white;
		border-left: 4px solid #6e8efb;
		padding-left: 21px; /* 25px - 4px border */
	}
	
	.back-link {
		margin-top: auto;
		padding: 20px 25px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: 30px;
	}
	
	.back-link a {
		color: rgba(255, 255, 255, 0.6);
		text-decoration: none;
		font-size: 0.9rem;
	}
	
	.back-link a:hover {
		color: white;
	}
	
	.admin-content {
		flex: 1;
		padding: 30px;
		background-color: #f8f9fa;
	}
	
	@media (max-width: 768px) {
		.admin-layout {
			flex-direction: column;
		}
		
		.admin-sidebar {
			width: 100%;
			padding: 15px 0;
		}
		
		.admin-content {
			padding: 20px;
		}
	}
</style>