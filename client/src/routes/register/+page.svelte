<script>
	import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
	import { auth } from '$lib/firebase/firebase.client.js';
	import { goto } from '$app/navigation';
	import { authError } from '$lib/stores/authStore';
	import { authApi } from '$lib/services/api.client.js';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let displayName = '';
	let username = '';
	let isSubmitting = false;
	let invitationCode = '';
	let passwordMismatch = false;
	let passwordStrength = 0;
	let showPasswordReqs = false;
	let termsAccepted = false;
	let successMessage = '';

	// Check password requirements
	function checkPassword(pass) {
		let strength = 0;

		// Length check
		if (pass.length >= 8) strength += 1;

		// Contains numbers
		if (/\d/.test(pass)) strength += 1;

		// Contains lowercase
		if (/[a-z]/.test(pass)) strength += 1;

		// Contains uppercase
		if (/[A-Z]/.test(pass)) strength += 1;

		// Contains special chars
		if (/[^A-Za-z0-9]/.test(pass)) strength += 1;

		passwordStrength = strength;
	}

	function getStrengthClass(strength) {
		if (strength <= 1) return 'poor';
		if (strength <= 3) return 'fair';
		if (strength <= 4) return 'good';
		return 'excellent';
	}

	function getStrengthText(strength) {
		if (strength <= 1) return 'Poor';
		if (strength <= 3) return 'Fair';
		if (strength <= 4) return 'Good';
		return 'Excellent';
	}

	function handlePasswordInput() {
		checkPassword(password);
		passwordMismatch = password !== confirmPassword && confirmPassword !== '';
	}

	function handleConfirmPasswordInput() {
		passwordMismatch = password !== confirmPassword;
	}

	async function handleRegister() {
		if (password !== confirmPassword) {
			passwordMismatch = true;
			return;
		}

		if (passwordStrength < 3) {
			showPasswordReqs = true;
			return;
		}

		if (!termsAccepted) {
			return;
		}

		passwordMismatch = false;
		isSubmitting = true;
		$authError = null;

		try {
			// Create user with Firebase auth
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			try {
				// Update profile with display name
				await updateProfile(user, {
					displayName: displayName
				});

				// Get ID token for API call
				const idToken = await user.getIdToken();

				console.log('Registering user with backend...', {
					email,
					username,
					displayName,
					invitationCode,
					uid: user.uid
				});
					
				// Create user profile in backend
				const response = await authApi.register({
					email,
					username,
					displayName,
					invitationCode: invitationCode || 'DEV123', // Ensure we always have a code
					uid: user.uid // Pass the Firebase UID to ensure consistency
				});
					
				console.log('Backend registration successful:', response.data);

				// Show success message with appropriate message
				if (response?.data?.needLogin) {
					// If server indicated user needs to login separately
					successMessage = 'Account created! Please sign in with your credentials.';
					setTimeout(() => {
						goto('/login?newRegistration=true');
					}, 2000);
				} else {
					// Regular success case
					successMessage = 'Account created successfully!';
					setTimeout(() => {
						goto('/profile?newUser=true');
					}, 1500);
				}
			} catch (backendError) {
				// If backend registration fails, delete the Firebase Auth user only if it's a new user
				// Check if this is a duplicate registration error
				const isDuplicateError = backendError?.response?.data?.error?.includes('already registered') ||
				                         backendError?.response?.data?.error?.includes('already in use');
				
				if (!isDuplicateError) {
					try {
						console.log("Deleting Firebase Auth user due to backend failure");
						await user.delete();
					} catch (deleteError) {
						console.error("Error deleting Firebase user after failed registration:", deleteError);
					}
				} else {
					console.log("Not deleting Firebase Auth user as it may be a duplicate registration");
				}
				// Re-throw backend error with Axios response details
				throw backendError;
			}
		} catch (error) {
			console.error("Registration failed:", error);
			// Handle Axios error responses
			if (error.response && error.response.data && error.response.data.error) {
				$authError = error.response.data.error;
			} else {
				$authError = error.message || 'Registration failed. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="register-container">
	<div class="register-card">
		<h1>Create Account</h1>
		<p class="subtitle">Join Sleep Olympics and start your journey to better sleep</p>

		{#if successMessage}
			<div class="success-message">
				<span>✓</span> {successMessage}
			</div>
		{:else}
			<form on:submit|preventDefault={handleRegister}>
				<div class="form-row">
					<div class="form-group">
						<label for="displayName">Full Name</label>
						<input
								type="text"
								id="displayName"
								bind:value={displayName}
								placeholder="Enter your full name"
								required
						/>
					</div>

					<div class="form-group">
						<label for="username">Username</label>
						<input
								type="text"
								id="username"
								bind:value={username}
								placeholder="Choose a username"
								required
						/>
					</div>
				</div>

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
							on:input={handlePasswordInput}
							on:focus={() => showPasswordReqs = true}
							placeholder="Create a password"
							required
							minlength="8"
					/>

					{#if showPasswordReqs}
						<div class="password-strength">
							<div class="strength-meter">
								<div
										class="strength-bar {getStrengthClass(passwordStrength)}"
										style="width: {passwordStrength * 20}%"
								></div>
							</div>
							<span class="strength-text {getStrengthClass(passwordStrength)}">
								{getStrengthText(passwordStrength)}
							</span>

							<ul class="password-requirements">
								<li class={password.length >= 8 ? 'met' : ''}>
									At least 8 characters
								</li>
								<li class={/\d/.test(password) ? 'met' : ''}>
									Contains a number
								</li>
								<li class={/[a-z]/.test(password) ? 'met' : ''}>
									Contains a lowercase letter
								</li>
								<li class={/[A-Z]/.test(password) ? 'met' : ''}>
									Contains an uppercase letter
								</li>
								<li class={/[^A-Za-z0-9]/.test(password) ? 'met' : ''}>
									Contains a special character
								</li>
							</ul>
						</div>
					{/if}
				</div>

				<div class="form-group">
					<label for="confirmPassword">Confirm Password</label>
					<input
							type="password"
							id="confirmPassword"
							bind:value={confirmPassword}
							on:input={handleConfirmPasswordInput}
							placeholder="Confirm your password"
							required
							minlength="8"
							class={passwordMismatch ? 'error' : ''}
					/>
					{#if passwordMismatch}
						<p class="validation-error">Passwords do not match</p>
					{/if}
				</div>

				<div class="form-group">
					<label for="invitationCode">Invitation Code</label>
					<input
							type="text"
							id="invitationCode"
							bind:value={invitationCode}
							placeholder="Enter invitation code"
							required
					/>
					<small class="hint-text">Use 'DEV123' for testing purposes</small>
				</div>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={termsAccepted} required/>
						<span>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a
								href="/privacy" target="_blank">Privacy Policy</a></span>
					</label>
				</div>

				{#if $authError}
					<div class="error-message">
						<strong>Registration Failed:</strong> {$authError}
					</div>
				{/if}

				<button type="submit" class="register-button"
						disabled={isSubmitting || !termsAccepted || passwordMismatch}>
					{isSubmitting ? 'Creating Account...' : 'Create Account'}
				</button>
			</form>

			<div class="form-footer">
				<p>Already have an account? <a href="/login">Log in</a></p>
			</div>
		{/if}
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
		max-width: 600px;
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

	.form-row {
		display: flex;
		gap: 20px;
	}

	.form-row .form-group {
		flex: 1;
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

	.checkbox-group {
		margin-bottom: 20px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
	}

	.checkbox-label input {
		width: auto;
	}

	.checkbox-label span a {
		color: #6e8efb;
		text-decoration: none;
	}

	.checkbox-label span a:hover {
		text-decoration: underline;
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

	.success-message {
		background-color: #f0fff4;
		color: #38a169;
		padding: 15px;
		border-radius: 6px;
		margin-bottom: 20px;
		border-left: 4px solid #38a169;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.success-message span {
		background-color: #38a169;
		color: white;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
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

	/* Password strength styles */
	.password-strength {
		margin-top: 10px;
	}

	.strength-meter {
		height: 6px;
		background-color: #eee;
		border-radius: 3px;
		margin-bottom: 8px;
		overflow: hidden;
	}

	.strength-bar {
		height: 100%;
		transition: width 0.3s ease;
	}

	.strength-bar.poor {
		background-color: #e74c3c;
	}

	.strength-bar.fair {
		background-color: #f39c12;
	}

	.strength-bar.good {
		background-color: #3498db;
	}

	.strength-bar.excellent {
		background-color: #2ecc71;
	}

	.strength-text {
		font-size: 0.8rem;
		font-weight: 500;
	}

	.strength-text.poor {
		color: #e74c3c;
	}

	.strength-text.fair {
		color: #f39c12;
	}

	.strength-text.good {
		color: #3498db;
	}

	.strength-text.excellent {
		color: #2ecc71;
	}

	.password-requirements {
		list-style: none;
		padding-left: 0;
		margin: 10px 0 0 0;
		font-size: 0.85rem;
		color: #777;
	}

	.password-requirements li {
		padding-left: 20px;
		position: relative;
		margin-bottom: 5px;
	}

	.password-requirements li::before {
		content: "✗";
		position: absolute;
		left: 0;
		color: #e74c3c;
	}

	.password-requirements li.met::before {
		content: "✓";
		color: #2ecc71;
	}
	
	.hint-text {
		display: block;
		color: #666;
		font-size: 0.8rem;
		margin-top: 4px;
	}

	@media (max-width: 600px) {
		.form-row {
			flex-direction: column;
			gap: 0;
		}
	}
</style>