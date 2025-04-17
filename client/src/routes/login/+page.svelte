<script>
	import { authError, authLoading, authUser } from '$lib/stores/authStore';
	import { authApi } from '$lib/services/api.client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase/firebase.client.js';
	import { signInWithEmailAndPassword } from 'firebase/auth';

	let email = '';
	let password = '';
	let isSubmitting = false;
	let rememberMe = false;

	onMount(() => {
		// If user is already logged in, redirect to dashboard
		if ($authUser) {
			goto('/dashboard');
		}
	});

	async function handleLogin() {
		if (isSubmitting) return;

		isSubmitting = true;
		$authError = null;
		try {
			console.log("Auth object:", auth);
			
			// Set recaptcha settings right before signing in
			if (!auth.settings) auth.settings = {};
			auth.settings.appVerificationDisabledForTesting = true;
			
			// Use Firebase Auth for authentication
			await signInWithEmailAndPassword(auth, email, password);
			
			// Then fetch current user profile using our API client
			await authApi.getCurrentUser();
			
			// Redirect to dashboard after successful login
			goto('/dashboard');
		} catch (err) {
			console.error("Login failed", err);
			console.error("Error details:", err.code, err.message, err.stack);
			$authError = err.message;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<div class="logo">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="40" height="40">
					<circle cx="15" cy="15" r="13" fill="#60A5FA"/>
					<path d="M15 28C7.82 28 2 22.18 2 15S7.82 2 15 2s13 5.82 13 13c0 1.49-.25 2.92-.71 4.25-2.7-3.02-6.87-4.93-11.58-4.93-4.27 0-8.11 1.57-10.8 4.07C6.09 23.25 10.17 26 15 26c2.34 0 4.51-.69 6.33-1.86.8.83 1.78 1.42 2.88 1.73C21.76 27.21 18.47 28 15 28z"
						  fill="#fff"/>
				</svg>
			</div>
			<h1>Welcome Back</h1>
			<p class="subtitle">Log in to track your sleep and compete with friends</p>
		</div>

		{#if $authLoading}
			<div class="loading-spinner">
				<div class="spinner"></div>
				<p>Loading...</p>
			</div>
		{:else}
			<form on:submit|preventDefault={handleLogin}>
				<div class="form-group">
					<label for="email">Email</label>
					<input
							type="email"
							id="email"
							bind:value={email}
							placeholder="Enter your email"
							required
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
							type="password"
							id="password"
							bind:value={password}
							placeholder="Enter your password"
							required
					/>
				</div>

				<div class="form-options">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={rememberMe}/>
						<span>Remember me</span>
					</label>
					<a href="/forgot-password" class="forgot-link">Forgot password?</a>
				</div>

				{#if $authError}
					<div class="error-message">
						{$authError}
					</div>
				{/if}

				<button type="submit" class="login-button" disabled={isSubmitting}>
					{isSubmitting ? 'Logging in...' : 'Log In'}
				</button>
			</form>

			<div class="form-footer">
				<p>Don't have an account? <a href="/register">Register</a></p>
			</div>
		{/if}
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 150px);
		padding: 20px;
	}

	.auth-card {
		background: white;
		padding: 40px;
		border-radius: 12px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 450px;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 30px;
	}

	.logo {
		margin-bottom: 20px;
	}

	h1 {
		margin: 0 0 10px 0;
		color: #333;
		font-size: 2rem;
	}

	.subtitle {
		color: #666;
		margin-bottom: 0;
	}

	.form-group {
		margin-bottom: 20px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #555;
		font-size: 0.95rem;
	}

	input {
		width: 100%;
		padding: 12px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
		transition: border-color 0.3s;
	}

	input:focus {
		border-color: #60A5FA;
		outline: none;
	}

	.form-options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		font-size: 0.9rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.checkbox-label input {
		width: auto;
		margin-right: 8px;
	}

	.forgot-link {
		color: #60A5FA;
		text-decoration: none;
	}

	.forgot-link:hover {
		text-decoration: underline;
	}

	.login-button {
		width: 100%;
		padding: 14px;
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: transform 0.3s, box-shadow 0.3s;
		margin-top: 10px;
	}

	.login-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}

	.login-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.error-message {
		background-color: #fff8f8;
		color: #e74c3c;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 20px;
		border-left: 4px solid #e74c3c;
		font-size: 0.9rem;
	}

	.form-footer {
		margin-top: 30px;
		text-align: center;
		color: #666;
		font-size: 0.95rem;
	}

	.form-footer a {
		color: #60A5FA;
		text-decoration: none;
		font-weight: 500;
	}

	.form-footer a:hover {
		text-decoration: underline;
	}

	.loading-spinner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 30px;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(96, 165, 250, 0.2);
		border-radius: 50%;
		border-top-color: #60A5FA;
		animation: spin 1s linear infinite;
		margin-bottom: 20px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
