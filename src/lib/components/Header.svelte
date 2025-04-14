<script>
	import { authUser, authError, authLoading, logoutUser, isAdmin } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';

	async function handleLogout() {
		try {
			await logoutUser();
			goto('/login');
		} catch (error) {
			console.error("Logout failed:", error);
		}
	}
</script>

<header>
	<nav>
		<a href="/" class="logo">Sleep Olympics</a>
		<div class="nav-links">
			{#if $authUser}
				<a href="/dashboard">Dashboard</a>
				<a href="/leaderboard">Leaderboard</a>
				<a href="/competitions">Competitions</a>
				<a href="/sleep-history">Sleep History</a>
				
				{#if $isAdmin}
					<div class="admin-dropdown">
						<button class="dropdown-btn">Admin</button>
						<div class="dropdown-content">
							<a href="/admin/competitions">Manage Competitions</a>
							<a href="/admin/users">Manage Users</a>
							<a href="/admin/invitations">Manage Invitations</a>
						</div>
					</div>
				{/if}
				
				<a href="/profile">Profile</a>
				<span class="user-greeting">Welcome, {$authUser.email}</span>
				<button on:click={handleLogout} class="logout-btn">Logout</button>
			{:else if !$authLoading}
				<a href="/login">Login</a>
				<a href="/register">Register</a>
			{/if}
		</div>
	</nav>
	{#if $authError}
		<p class="error">Auth Error: {$authError}</p>
	{/if}
</header>

<style>
    header {
        background-color: white;
        padding: 15px 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
    }

    .logo {
        font-size: 1.5rem;
        font-weight: bold;
        color: #6e8efb;
        text-decoration: none;
    }

    .nav-links {
        display: flex;
        gap: 20px;
        align-items: center;
    }

    nav a {
        text-decoration: none;
        color: #555;
        font-weight: 500;
        transition: color 0.3s;
    }

    nav a:hover {
        color: #6e8efb;
    }

    .user-greeting {
        color: #333;
        font-weight: 500;
        margin-left: 10px;
    }

    .logout-btn {
        background: none;
        border: 1px solid #6e8efb;
        color: #6e8efb;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
    }

    .logout-btn:hover {
        background: #6e8efb;
        color: white;
    }

    .error {
        color: #e74c3c;
        margin-top: 5px;
        text-align: center;
    }
	
    .admin-dropdown {
        position: relative;
        display: inline-block;
    }
	
    .dropdown-btn {
        background-color: #f44336;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
    }
	
    .dropdown-btn:hover {
        background-color: #d32f2f;
    }
	
    .dropdown-content {
        display: none;
        position: absolute;
        background-color: white;
        min-width: 200px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        border-radius: 4px;
        padding: 8px 0;
        z-index: 1000;
    }
	
    .dropdown-content a {
        display: block;
        padding: 8px 16px;
        color: #555;
    }
	
    .dropdown-content a:hover {
        background-color: #f1f1f1;
    }
	
    .admin-dropdown:hover .dropdown-content {
        display: block;
    }
</style>