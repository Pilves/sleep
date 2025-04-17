<script>
	import { authUser, authLoading, isAdmin } from '$lib/stores/authStore';
	import { auth } from '$lib/firebase/firebase.client.js';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';

	async function handleLogout() {
		try {
			await signOut(auth);
			goto('/login');
		} catch (err) {
			console.error('Logout failed:', err);
		}
	}
</script>

<header class="header">
	<div class="container">
		<div class="logo-container">
			<a href="/" class="logo">
				<div class="logo-icon">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
						<circle cx="15" cy="15" r="13" fill="#60A5FA" />
						<path d="M15 28C7.82 28 2 22.18 2 15S7.82 2 15 2s13 5.82 13 13c0 1.49-.25 2.92-.71 4.25-2.7-3.02-6.87-4.93-11.58-4.93-4.27 0-8.11 1.57-10.8 4.07C6.09 23.25 10.17 26 15 26c2.34 0 4.51-.69 6.33-1.86.8.83 1.78 1.42 2.88 1.73C21.76 27.21 18.47 28 15 28z" fill="#fff"/>
					</svg>
				</div>
				<div class="logo-text">SLEEP OLYMPICS</div>
			</a>
		</div>

		<nav class="nav">
			{#if $authUser && !$authLoading}
				<div class="nav-items">
					<a href="/dashboard" class="nav-item">Dashboard</a>
					<a href="/competitions" class="nav-item">Competitions</a>
					<a href="/leaderboard" class="nav-item">Leaderboard</a>
					<a href="/sleep-history" class="nav-item">Sleep Data</a>

					{#if $isAdmin}
						<div class="dropdown">
							<button class="nav-item dropdown-toggle">Admin <span class="caret">▼</span></button>
							<div class="dropdown-content">
								<a href="/admin/competitions">Competitions</a>
								<a href="/admin/users">Users</a>
								<a href="/admin/invitations">Invitations</a>
							</div>
						</div>
					{/if}
				</div>

				<div class="user-menu">
					<div class="dropdown">
						<button class="dropdown-toggle user-button">
							<div class="avatar">
								{$authUser.displayName?.[0] || $authUser.email[0].toUpperCase()}
							</div>
						</button>
						<div class="dropdown-content dropdown-right">
							<div class="user-info">
								<div class="user-name">{$authUser.displayName || $authUser.email}</div>
								<div class="user-email">{$authUser.email}</div>
							</div>
							<div class="dropdown-divider"></div>
							<a href="/profile">Profile</a>
							<a href="/settings">Settings</a>
							<div class="dropdown-divider"></div>
							<button class="logout-button" on:click={handleLogout}>Logout</button>
						</div>
					</div>
				</div>
			{:else if !$authLoading}
				<div class="auth-buttons">
					<a href="/login" class="btn btn-text">Login</a>
					<a href="/register" class="btn btn-primary">Register</a>
				</div>
			{/if}
		</nav>
	</div>
</header>

<style>
	.header {
		background-color: white;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		padding: 15px 0;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.logo-icon {
		width: 36px;
		height: 36px;
		margin-right: 10px;
	}

	.logo-text {
		color: #333;
		font-weight: 600;
		font-size: 18px;
		letter-spacing: 0.5px;
	}

	.nav {
		display: flex;
		align-items: center;
	}

	.nav-items {
		display: flex;
		gap: 20px;
		margin-right: 20px;
	}

	.nav-item {
		color: #555;
		text-decoration: none;
		font-weight: 500;
		font-size: 14px;
		transition: color 0.2s;
	}

	.nav-item:hover {
		color: #60A5FA;
	}

	.user-menu {
		position: relative;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background-color: #60A5FA;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}

	.dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-toggle {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
	}

	.caret {
		font-size: 10px;
		margin-left: 5px;
	}

	.dropdown-content {
		display: none;
		position: absolute;
		top: 100%;
		left: 0;
		background-color: white;
		min-width: 180px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		padding: 10px 0;
		z-index: 100;
	}

	.dropdown-right {
		left: auto;
		right: 0;
	}

	.dropdown:hover .dropdown-content {
		display: block;
	}

	.dropdown-content a {
		color: #333;
		padding: 10px 15px;
		text-decoration: none;
		display: block;
		font-size: 14px;
	}

	.dropdown-content a:hover {
		background-color: #f8f9fa;
	}

	.user-info {
		padding: 10px 15px;
		border-bottom: 1px solid #eee;
	}

	.user-name {
		font-weight: 600;
		font-size: 14px;
		color: #333;
	}

	.user-email {
		font-size: 12px;
		color: #888;
		margin-top: 2px;
	}

	.dropdown-divider {
		height: 1px;
		background-color: #eee;
		margin: 5px 0;
	}

	.logout-button {
		background: none;
		border: none;
		text-align: left;
		padding: 10px 15px;
		width: 100%;
		font-size: 14px;
		color: #e74c3c;
		cursor: pointer;
	}

	.logout-button:hover {
		background-color: #fff8f8;
	}

	.auth-buttons {
		display: flex;
		gap: 10px;
	}

	.btn {
		padding: 8px 16px;
		border-radius: 6px;
		font-weight: 500;
		font-size: 14px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(124, 58, 237, 0.25);
	}

	.btn-text {
		color: #555;
	}

	.btn-text:hover {
		color: #60A5FA;
	}

	@media (max-width: 768px) {
		.logo-text {
			display: none;
		}

		.nav-items {
			display: none;
		}
	}
</style>
