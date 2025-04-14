<script>
	import { loginUser, authError, authLoading, authUser } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let isSubmitting = false;

	async function handleLogin() {
		isSubmitting = true;
		try {
			await loginUser(email, password);
			goto('/'); // Redirect after login
		} catch (err) {
			console.error("Login failed", err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="login-container">
	<div class="login-card">
		<h1>Welcome Back</h1>
		<p class="subtitle">Log in to track your sleep and compete with friends</p>

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
				<p><a href="/forgot-password">Forgot password?</a></p>
			</div>
		{/if}
	</div>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 150px);
		padding: 20px;
	}

	.login-card {
		background: white;
		padding: 40px;
		border-radius: 12px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 450px;
	}

	h1 {
		margin: 0 0 10px 0;
		color: #333;
		text-align: center;
	}

	.subtitle {
		text-align: center;
		color: #666;
		margin-bottom: 30px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #555;
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
		border-color: #6e8efb;
		outline: none;
	}

	.login-button {
		width: 100%;
		padding: 14px;
		background: linear-gradient(135deg, #6e8efb, #a777e3);
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
	}

	.form-footer {
		margin-top: 30px;
		text-align: center;
		color: #666;
	}

	.form-footer a {
		color: #6e8efb;
		text-decoration: none;
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
		border: 4px solid rgba(110, 142, 251, 0.2);
		border-radius: 50%;
		border-top-color: #6e8efb;
		animation: spin 1s linear infinite;
		margin-bottom: 20px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
