<script>
	import { onMount } from 'svelte';
	import { authUser, authToken } from '$lib/stores/authStore';
	import api from '$lib/services/api.client.js';
	
	let profile = null;
	let ouraConnected = false;
	let loading = true;
	let error = null;
	let successMessage = null;
	
	// Form fields
	let username = '';
	let displayName = '';
	let aboutMe = '';
	let gender = '';
	let age = '';
	let emailNotifications = true;
	let inAppNotifications = true;
	
	// Oura fields
	let ouraToken = '';
	let showOuraForm = false;
	
	onMount(async () => {
		if (!$authUser) return;
		
		try {
			loading = true;
			const response = await api.get('/users/profile');
			profile = response.data;
			
			// Populate form fields
			username = profile.username || '';
			displayName = profile.displayName || '';
			aboutMe = profile.profileData?.aboutMe || '';
			gender = profile.profileData?.gender || '';
			age = profile.profileData?.age || '';
			emailNotifications = profile.notifications?.email !== false;
			inAppNotifications = profile.notifications?.inApp !== false;
			ouraConnected = profile.ouraIntegration?.connected || false;
			
		} catch (err) {
			console.error('Error fetching profile:', err);
			error = 'Failed to load profile data. Please try again later.';
		} finally {
			loading = false;
		}
	});
	
	async function updateProfile() {
		try {
			loading = true;
			error = null;
			successMessage = null;
			
			const updateData = {
				username,
				displayName,
				profileData: {
					aboutMe,
					gender: gender || null,
					age: age ? parseInt(age) : null
				},
				notifications: {
					email: emailNotifications,
					inApp: inAppNotifications
				}
			};
			
			await api.put('/users/profile', updateData);
			successMessage = 'Profile updated successfully!';
			
			// Automatically clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
			
		} catch (err) {
			console.error('Error updating profile:', err);
			error = err.response?.data?.message || 'Failed to update profile. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	async function connectOura() {
		try {
			loading = true;
			error = null;
			successMessage = null;
			
			await api.post('/users/oura/connect', { token: ouraToken });
			ouraConnected = true;
			showOuraForm = false;
			successMessage = 'Oura Ring connected successfully!';
			
			// Automatically clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
			
		} catch (err) {
			console.error('Error connecting Oura:', err);
			error = err.response?.data?.message || 'Failed to connect Oura Ring. Please check your token and try again.';
		} finally {
			loading = false;
		}
	}
	
	async function syncSleepData() {
		try {
			loading = true;
			error = null;
			successMessage = null;
			
			await api.post('/sleep/sync');
			successMessage = 'Sleep data synced successfully!';
			
			// Automatically clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
			
		} catch (err) {
			console.error('Error syncing sleep data:', err);
			error = err.response?.data?.message || 'Failed to sync sleep data. Please try again later.';
		} finally {
			loading = false;
		}
	}
	
	function toggleOuraForm() {
		showOuraForm = !showOuraForm;
	}
</script>

<div class="profile-container">
	<h1>Your Profile</h1>
	
	{#if loading && !profile}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading your profile...</p>
		</div>
	{:else if error && !profile}
		<div class="error-container">
			<p>{error}</p>
			<button on:click={() => window.location.reload()}>Retry</button>
		</div>
	{:else}
		<div class="profile-grid">
			<!-- Profile Information Card -->
			<div class="card profile-info">
				<h2>Profile Information</h2>
				
				{#if successMessage}
					<div class="success-message">
						{successMessage}
					</div>
				{/if}
				
				{#if error}
					<div class="error-message">
						{error}
					</div>
				{/if}
				
				<form on:submit|preventDefault={updateProfile}>
					<div class="form-group">
						<label for="username">Username</label>
						<input
							type="text"
							id="username"
							bind:value={username}
							required
						/>
					</div>
					
					<div class="form-group">
						<label for="displayName">Display Name</label>
						<input
							type="text"
							id="displayName"
							bind:value={displayName}
							required
						/>
					</div>
					
					<div class="form-group">
						<label for="aboutMe">About Me</label>
						<textarea
							id="aboutMe"
							bind:value={aboutMe}
							rows="4"
						></textarea>
					</div>
					
					<div class="form-row">
						<div class="form-group">
							<label for="gender">Gender (Optional)</label>
							<select id="gender" bind:value={gender}>
								<option value="">Prefer not to say</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
							</select>
						</div>
						
						<div class="form-group">
							<label for="age">Age (Optional)</label>
							<input
								type="number"
								id="age"
								bind:value={age}
								min="13"
								max="120"
							/>
						</div>
					</div>
					
					<h3>Notification Preferences</h3>
					
					<div class="checkbox-group">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={emailNotifications} />
							<span>Email Notifications</span>
						</label>
					</div>
					
					<div class="checkbox-group">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={inAppNotifications} />
							<span>In-App Notifications</span>
						</label>
					</div>
					
					<button type="submit" class="btn primary" disabled={loading}>
						{loading ? 'Saving...' : 'Save Changes'}
					</button>
				</form>
			</div>
			
			<!-- Oura Integration Card -->
			<div class="card oura-integration">
				<h2>Sleep Tracking</h2>
				
				{#if ouraConnected}
					<div class="connected-status">
						<div class="status-icon connected">✓</div>
						<div class="status-text">
							<h3>Oura Ring Connected</h3>
							<p>Your sleep data is being tracked using your Oura Ring.</p>
						</div>
					</div>
					
					<button class="btn secondary" on:click={syncSleepData} disabled={loading}>
						{loading ? 'Syncing...' : 'Sync Sleep Data Now'}
					</button>
					
					<div class="last-sync">
						<p>Last sync: {profile?.ouraIntegration?.lastSyncDate ? new Date(profile.ouraIntegration.lastSyncDate).toLocaleString() : 'Never'}</p>
					</div>
				{:else}
					<div class="connected-status">
						<div class="status-icon disconnected">!</div>
						<div class="status-text">
							<h3>Oura Ring Not Connected</h3>
							<p>Connect your Oura Ring to start tracking your sleep for competitions.</p>
						</div>
					</div>
					
					{#if showOuraForm}
						<form on:submit|preventDefault={connectOura} class="oura-form">
							<div class="form-group">
								<label for="ouraToken">Oura API Token</label>
								<input
									type="text"
									id="ouraToken"
									bind:value={ouraToken}
									required
									placeholder="Enter your Oura API token"
								/>
								<small>You can get your token from the <a href="https://cloud.ouraring.com/personal-access-tokens" target="_blank" rel="noopener noreferrer">Oura Cloud</a> portal.</small>
							</div>
							
							<div class="form-actions">
								<button type="submit" class="btn primary" disabled={loading}>
									{loading ? 'Connecting...' : 'Connect Oura Ring'}
								</button>
								<button type="button" class="btn text" on:click={toggleOuraForm}>
									Cancel
								</button>
							</div>
						</form>
					{:else}
						<button class="btn primary" on:click={toggleOuraForm}>
							Connect Oura Ring
						</button>
					{/if}
				{/if}
			</div>
			
			<!-- Account Information Card -->
			<div class="card account-info">
				<h2>Account Information</h2>
				
				<div class="info-row">
					<div class="info-label">Email</div>
					<div class="info-value">{$authUser?.email || ''}</div>
				</div>
				
				<div class="info-row">
					<div class="info-label">Member Since</div>
					<div class="info-value">
						{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
					</div>
				</div>
				
				<div class="info-row">
					<div class="info-label">Account Status</div>
					<div class="info-value">{profile?.isActive ? 'Active' : 'Inactive'}</div>
				</div>
				
				<div class="account-actions">
					<a href="/change-password" class="btn text">Change Password</a>
					<button class="btn danger">Delete Account</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.profile-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}
	
	h1 {
		margin-bottom: 30px;
		color: #333;
	}
	
	.loading-container, .error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 50px 0;
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
	
	.profile-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 25px;
	}
	
	.card {
		background: white;
		border-radius: 12px;
		padding: 25px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}
	
	h2 {
		margin-top: 0;
		margin-bottom: 20px;
		color: #444;
		font-size: 1.4rem;
	}
	
	h3 {
		margin: 25px 0 15px 0;
		color: #555;
		font-size: 1.1rem;
	}
	
	.success-message {
		background-color: #f0fff4;
		color: #38a169;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 20px;
		border-left: 4px solid #38a169;
	}
	
	.error-message {
		background-color: #fff8f8;
		color: #e74c3c;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 20px;
		border-left: 4px solid #e74c3c;
	}
	
	.form-group {
		margin-bottom: 20px;
	}
	
	.form-row {
		display: flex;
		gap: 20px;
	}
	
	.form-row .form-group {
		flex: 1;
	}
	
	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #555;
	}
	
	input, select, textarea {
		width: 100%;
		padding: 12px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
		transition: border-color 0.3s;
	}
	
	input:focus, select:focus, textarea:focus {
		border-color: #6e8efb;
		outline: none;
	}
	
	.checkbox-group {
		margin-bottom: 15px;
	}
	
	.checkbox-label {
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	
	.checkbox-label input {
		width: auto;
		margin-right: 10px;
	}
	
	.checkbox-label span {
		color: #555;
	}
	
	.btn {
		padding: 12px 24px;
		border-radius: 6px;
		font-weight: bold;
		text-decoration: none;
		font-size: 0.9rem;
		transition: all 0.3s ease;
		display: inline-block;
		border: none;
		cursor: pointer;
	}
	
	.primary {
		background: linear-gradient(135deg, #6e8efb, #a777e3);
		color: white;
	}
	
	.primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}
	
	.secondary {
		background-color: transparent;
		color: #6e8efb;
		border: 1px solid #6e8efb;
	}
	
	.secondary:hover:not(:disabled) {
		background-color: rgba(110, 142, 251, 0.1);
	}
	
	.text {
		background: none;
		color: #6e8efb;
		padding: 10px 0;
		text-decoration: underline;
	}
	
	.danger {
		background-color: #e74c3c;
		color: white;
	}
	
	.danger:hover {
		background-color: #c0392b;
	}
	
	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.connected-status {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
		padding: 15px;
		background-color: #f9f9f9;
		border-radius: 8px;
	}
	
	.status-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		margin-right: 15px;
		flex-shrink: 0;
	}
	
	.connected {
		background-color: #38a169;
		color: white;
	}
	
	.disconnected {
		background-color: #e74c3c;
		color: white;
	}
	
	.status-text h3 {
		margin: 0 0 5px 0;
	}
	
	.status-text p {
		margin: 0;
		color: #666;
	}
	
	.oura-form {
		margin-top: 20px;
	}
	
	.oura-form small {
		display: block;
		margin-top: 5px;
		color: #666;
	}
	
	.oura-form small a {
		color: #6e8efb;
		text-decoration: none;
	}
	
	.oura-form small a:hover {
		text-decoration: underline;
	}
	
	.form-actions {
		display: flex;
		gap: 15px;
		align-items: center;
	}
	
	.last-sync {
		margin-top: 15px;
		font-size: 0.9rem;
		color: #666;
		text-align: center;
	}
	
	.info-row {
		display: flex;
		padding: 15px 0;
		border-bottom: 1px solid #eee;
	}
	
	.info-row:last-child {
		border-bottom: none;
	}
	
	.info-label {
		width: 40%;
		font-weight: 500;
		color: #555;
	}
	
	.info-value {
		width: 60%;
		color: #333;
	}
	
	.account-actions {
		margin-top: 25px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>