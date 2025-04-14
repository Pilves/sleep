<script>
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { auth } from '$lib/firebase/firebase.client.js';
	import { goto } from '$app/navigation';
	import { authError } from '$lib/stores/authStore';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let isSubmitting = false;
	let passwordMismatch = false;

	async function handleRegister() {
		if (password !== confirmPassword) {
			passwordMismatch = true;
			return;
		}

		passwordMismatch = false;
		isSubmitting = true;

		try {
			await createUserWithEmailAndPassword(auth, email, password);
			goto('/'); // Redirect to home page after successful registration
		} catch (error) {
			$authError = error.message;
			console.error("Registration failed:", error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="register-container">
	<div class="register-card">
		<h1>Create Account</h1>
		<p class="subtitle">Join Sleep Olympics and start your journey to better sleep</p>

		<form on:submit|preventDefault={handleRegister}>
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
					placeholder="Create a password"
					required
					minlength="6"
				/>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirm Password</label>
				<input
					type="password"
					id="confirmPassword"
					bind:value={confirmPassword}
					placeholder="Confirm your password"
					required
					minlength="6"
					class={passwordMismatch ? 'error' : ''}
				/>
				{#if passwordMismatch}
					<p class="validation-error">Passwords do not match</p>
				{/if}
			</div>

			{#if $authError}
				<div class="error-message">
					{$authError}
				</div>
			{/if}

			<button type="submit" class="register-button" disabled={isSubmitting}>
				{isSubmitting ? 'Creating Account...' : 'Create Account'}
			</button>
		</form>

		<div class="form-footer">
			<p>Already have an account? <a href="/login">Log in</a></p>
		</div>
	</div>
</div>

<style>
	.register-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 150px);
		padding: 20px;
	}

	.register-card {
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

	input.error {
		border-color: #e74c3c;
	}

	.validation-error {
		color: #e74c3c;
		font-size: 14px;
		margin-top: 5px;
		margin-bottom: 0;
	}

	.register-button {
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

	.register-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}

	.register-button:disabled {
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
</style>
