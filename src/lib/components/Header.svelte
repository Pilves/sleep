<script>
	import { authUser, authError, authLoading, logoutUser } from '$lib/stores/authStore';
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
				<a href="/profile">Profile</a>
				<span>Welcome, {$authUser.email}</span>
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

    nav span {
        color: #333;
        font-weight: 500;
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
</style>
