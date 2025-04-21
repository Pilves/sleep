<script>
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/authStore';
	import { page } from '$app/stores';
	import { userApi, sleepApi } from '$lib/services/api.client.js';

	let profile = null;
	let ouraConnected = false;
	let loading = true;
	let error = null;
	let successMessage = null;
	let showOuraPrompt = false;

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
	let ouraLastSync = null;
	let syncing = false;

	// Profile edit state
	let editingProfile = false;

	onMount(async () => {
		if (!$authUser) return;

		// Check if redirected from registration
		if ($page.url.searchParams.get('newUser') === 'true') {
			showOuraPrompt = true;
			successMessage = 'Account created! Connect your Oura Ring to start tracking sleep.';
			showOuraForm = true;
		}

		try {
			loading = true;
			const response = await userApi.getProfile();
			profile = response.data;

			// Populate form fields
			username = profile.username || '';
			displayName = profile.displayName || '';
			aboutMe = profile.profileData?.aboutMe || '';
			gender = profile.profileData?.gender || '';
			age = profile.profileData?.age ? profile.profileData.age.toString() : '';
			emailNotifications = profile.notifications?.email !== false;
			inAppNotifications = profile.notifications?.inApp !== false;

			// Set Oura connection status
			ouraConnected = profile.ouraIntegration?.connected || false;
			ouraLastSync = profile.ouraIntegration?.lastSyncDate || null;

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

			await userApi.updateProfile(updateData);
			successMessage = 'Profile updated successfully!';
			editingProfile = false;

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

			// Get OAuth URL instead of using token directly
			const response = await sleepApi.getOuraAuthUrl();
			const authUrl = response.data.authorizationUrl;
			
			// Redirect to Oura authorization page
			window.location.href = authUrl;

		} catch (err) {
			console.error('Error starting Oura OAuth flow:', err);
			error = err.response?.data?.message || 'Failed to start Oura authorization. Please try again.';
			loading = false;
		}
	}

	async function syncSleepData() {
		if (syncing) return;

		try {
			syncing = true;
			error = null;
			successMessage = null;

			await sleepApi.syncSleepData();
			ouraLastSync = new Date().toISOString();
			successMessage = 'Sleep data synced successfully!';

			// Automatically clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);

		} catch (err) {
			console.error('Error syncing sleep data:', err);
			error = err.response?.data?.message || 'Failed to sync sleep data. Please try again later.';
		} finally {
			syncing = false;
		}
	}

	function toggleOuraForm() {
		showOuraForm = !showOuraForm;
	}

	function formatDate(dateString) {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getInitials(name) {
		if (!name) return '';
		return name.split(' ').map(n => n[0]).join('').toUpperCase();
	}
</script>

<div class="profile-container">
	{#if loading && !profile}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading your profile...</p>
		</div>
	{:else if error && !profile}
		<div class="error-container">
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<p>{error}</p>
			<button on:click={() => window.location.reload()} class="btn primary">Retry</button>
		</div>
	{:else}
		{#if successMessage}
			<div class="success-message">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
				{successMessage}
			</div>
		{/if}

		{#if error}
			<div class="error-message">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				{error}
			</div>
		{/if}
		
		{#if showOuraPrompt && !ouraConnected}
			<div class="oura-prompt-banner">
				<div class="oura-prompt-content">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
					<div>
						<h3>Connect Your Oura Ring</h3>
						<p>To participate in sleep competitions, you need to connect your Oura Ring. This allows us to track your sleep data.</p>
					</div>
				</div>
				<button class="btn-close" on:click={() => showOuraPrompt = false}>×</button>
			</div>
		{/if}

		<div class="profile-grid">
			<!-- Profile Information Card -->
			<div class="card profile-info">
				<div class="profile-header">
					<div class="avatar-container">
						<div class="avatar">{getInitials(displayName)}</div>
					</div>
					<div class="profile-title">
						<h1>{displayName || username || 'User'}</h1>
						<p class="joined-date">Joined: {profile?.createdAt ? formatDate(profile.createdAt).split(',')[0] : 'Unknown'}</p>
						{#if !editingProfile}
							<button class="btn secondary sm" on:click={() => editingProfile = true}>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
									<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
								</svg>
								Edit Profile
							</button>
						{/if}
					</div>
				</div>

				{#if editingProfile}
					<form on:submit|preventDefault={updateProfile} class="profile-form">
						<div class="form-row">
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
						</div>

						<div class="form-group">
							<label for="aboutMe">About Me</label>
							<textarea
									id="aboutMe"
									bind:value={aboutMe}
									rows="4"
									placeholder="Tell others about yourself, your sleep goals, and interests..."
							></textarea>
						</div>

						<div class="form-row">
							<div class="form-group">
								<label for="gender">Gender (Optional)</label>
								<select id="gender" bind:value={gender}>
									<option value="">Prefer not to say</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
									<option value="non-binary">Non-binary</option>
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

						<div class="form-actions">
							<button type="button" class="btn secondary" on:click={() => editingProfile = false}>Cancel</button>
							<button type="submit" class="btn primary" disabled={loading}>
								{loading ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</form>
				{:else}
					<div class="profile-details">
						{#if aboutMe}
							<div class="detail-section">
								<div class="section-header">
									<h3>About Me</h3>
									<button class="btn-icon" on:click={() => editingProfile = true}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
										</svg>
									</button>
								</div>
								<p>{aboutMe}</p>
							</div>
						{:else}
							<div class="detail-section empty-about">
								<h3>About Me</h3>
								<p class="empty-message">Add information about yourself</p>
								<button class="btn secondary sm" on:click={() => editingProfile = true}>
									Add Bio
								</button>
							</div>
						{/if}

						<div class="detail-section">
							<div class="section-header">
								<h3>Profile Information</h3>
								<button class="btn-icon" on:click={() => editingProfile = true}>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
									</svg>
								</button>
							</div>
							<div class="detail-item">
								<span class="detail-label">Email:</span>
								<span class="detail-value">{$authUser?.email || 'Not set'}</span>
							</div>

							<div class="detail-item">
								<span class="detail-label">Username:</span>
								<span class="detail-value">{username || 'Not set'}</span>
							</div>

							{#if gender}
								<div class="detail-item">
									<span class="detail-label">Gender:</span>
									<span class="detail-value">{gender}</span>
								</div>
							{:else}
								<div class="detail-item">
									<span class="detail-label">Gender:</span>
									<span class="detail-value empty">Not set</span>
								</div>
							{/if}

							{#if age}
								<div class="detail-item">
									<span class="detail-label">Age:</span>
									<span class="detail-value">{age}</span>
								</div>
							{:else}
								<div class="detail-item">
									<span class="detail-label">Age:</span>
									<span class="detail-value empty">Not set</span>
								</div>
							{/if}
						</div>

						<div class="detail-section">
							<div class="section-header">
								<h3>Notification Preferences</h3>
								<button class="btn-icon" on:click={() => editingProfile = true}>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
									</svg>
								</button>
							</div>
							<div class="detail-item">
								<span class="detail-label">Email Notifications:</span>
								<span class="detail-value">{emailNotifications ? 'Enabled' : 'Disabled'}</span>
							</div>

							<div class="detail-item">
								<span class="detail-label">In-App Notifications:</span>
								<span class="detail-value">{inAppNotifications ? 'Enabled' : 'Disabled'}</span>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Oura Integration Card -->
			<div class="card oura-integration">
				<h2>Sleep Tracking</h2>

				{#if ouraConnected}
					<div class="connected-status">
						<div class="status-icon connected">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
								<polyline points="22 4 12 14.01 9 11.01"></polyline>
							</svg>
						</div>
						<div class="status-text">
							<h3>Oura Ring Connected</h3>
							<p>Your sleep data is being tracked using your Oura Ring.</p>
						</div>
					</div>

					<div class="sync-container">
						<button class="btn primary" on:click={syncSleepData} disabled={syncing}>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
							</svg>
							{syncing ? 'Syncing...' : 'Sync Sleep Data Now'}
						</button>

						<div class="last-sync">
							<p>Last sync: {formatDate(ouraLastSync)}</p>
						</div>
					</div>
				{:else}
					<div class="connected-status">
						<div class="status-icon disconnected">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
						</div>
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

			<!-- Achievements Card -->
			<div class="card achievements">
				<h2>Achievements</h2>

				{#if profile?.achievements?.length > 0}
					<div class="achievements-grid">
						{#each profile.achievements as achievement}
							<div class="achievement-item">
								<div class="achievement-icon">
									{#if achievement.type === 'competition_win'}
										🏆
									{:else if achievement.type === 'streak'}
										🔥
									{:else if achievement.type === 'perfect_week'}
										✅
									{:else}
										🎯
									{/if}
								</div>
								<div class="achievement-details">
									<h4>{achievement.title}</h4>
									<p>{achievement.description}</p>
									<span class="achievement-date">{formatDate(achievement.date).split(',')[0]}</span>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<p>No achievements yet. Start tracking your sleep and joining competitions to earn achievements!</p>
					</div>
				{/if}
			</div>

			<!-- Sleep Stats Summary -->
			<div class="card sleep-stats">
				<h2>Sleep Statistics</h2>

				{#if profile?.sleepStats}
					<div class="stats-grid">
						<div class="stat-item">
							<div class="stat-icon">📊</div>
							<h3>Average Sleep Score</h3>
							<div class="stat-value">{profile.sleepStats.averageScore || 0}</div>
						</div>

						<div class="stat-item">
							<div class="stat-icon">⏱️</div>
							<h3>Average Sleep Duration</h3>
							<div class="stat-value">
								{Math.floor((profile.sleepStats.averageDuration || 0) / 60)}h
								{Math.round((profile.sleepStats.averageDuration || 0) % 60)}m
							</div>
						</div>

						<div class="stat-item">
							<div class="stat-icon">🌟</div>
							<h3>Best Sleep Score</h3>
							<div class="stat-value">{profile.sleepStats.bestScore || 0}</div>
							{#if profile.sleepStats.bestScoreDate}
								<div class="stat-date">
									on {formatDate(profile.sleepStats.bestScoreDate).split(',')[0]}
								</div>
							{/if}
						</div>

						<div class="stat-item">
							<div class="stat-icon">🌊</div>
							<h3>Average Deep Sleep</h3>
							<div class="stat-value">
								{Math.round(profile.sleepStats.averageDeepSleep || 0)}m
							</div>
						</div>
					</div>
				{:else}
					<div class="empty-state">
						<p>No sleep statistics available yet. Connect your Oura Ring to start tracking your sleep.</p>
					</div>
				{/if}
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

	h1 {
		margin: 0 0 5px 0;
		color: #333;
		font-size: 1.8rem;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 20px;
		color: #444;
		font-size: 1.4rem;
	}

	h3 {
		margin: 0 0 15px 0;
		color: #555;
		font-size: 1.1rem;
		font-weight: 600;
	}

	h4 {
		margin: 0 0 5px 0;
		color: #333;
		font-size: 1rem;
	}

	.loading-container, .error-container, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 50px 0;
		text-align: center;
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
		to { transform: rotate(360deg); }
	}

	.success-message, .error-message {
		display: flex;
		align-items: center;
		padding: 15px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-size: 0.95rem;
	}

	.success-message {
		background-color: #f0fff4;
		color: #38a169;
		border-left: 4px solid #38a169;
	}

	.error-message {
		background-color: #fff8f8;
		color: #e74c3c;
		border-left: 4px solid #e74c3c;
	}

	.success-message svg, .error-message svg {
		margin-right: 10px;
		flex-shrink: 0;
	}
	
	.oura-prompt-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #ebf8ff;
		border-left: 4px solid #3182ce;
		padding: 15px 20px;
		border-radius: 8px;
		margin-bottom: 25px;
	}
	
	.oura-prompt-content {
		display: flex;
		align-items: center;
		gap: 15px;
	}
	
	.oura-prompt-content svg {
		color: #3182ce;
		flex-shrink: 0;
	}
	
	.oura-prompt-content h3 {
		margin: 0 0 5px 0;
		color: #2c5282;
	}
	
	.oura-prompt-content p {
		margin: 0;
		color: #4a5568;
		font-size: 0.95rem;
	}
	
	.btn-close {
		background: none;
		border: none;
		color: #4a5568;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.profile-header {
		display: flex;
		align-items: center;
		margin-bottom: 30px;
	}

	.avatar-container {
		margin-right: 20px;
	}

	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 600;
	}

	.profile-title {
		flex: 1;
	}

	.joined-date {
		color: #666;
		font-size: 0.95rem;
		margin: 5px 0 15px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 6px;
		font-weight: 500;
		font-size: 0.95rem;
		transition: all 0.3s;
		border: none;
		cursor: pointer;
		text-decoration: none;
	}

	.btn.sm {
		padding: 6px 12px;
		font-size: 0.85rem;
	}

	.btn.primary {
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		color: white;
	}

	.btn.primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}

	.btn.secondary {
		background-color: #f0f0f0;
		color: #333;
	}

	.btn.secondary:hover {
		background-color: #e5e5e5;
	}

	.btn.text {
		background: none;
		color: #60A5FA;
		padding-left: 0;
		padding-right: 0;
	}

	.btn.text:hover {
		text-decoration: underline;
	}

	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.btn-icon {
		background: none;
		border: none;
		padding: 5px;
		border-radius: 50%;
		color: #718096;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	
	.btn-icon:hover {
		background-color: #f0f0f0;
		color: #4A5568;
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.section-header h3 {
		margin-bottom: 0;
	}

	.profile-details {
		display: flex;
		flex-direction: column;
		gap: 25px;
	}

	.detail-section {
		border-bottom: 1px solid #eee;
		padding-bottom: 20px;
	}

	.detail-section:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	
	.empty-about {
		text-align: center;
		padding: 25px 0;
	}
	
	.empty-message {
		color: #A0AEC0;
		margin-bottom: 15px;
	}
	
	.detail-value.empty {
		color: #A0AEC0;
		font-style: italic;
	}

	.detail-item {
		display: flex;
		margin-bottom: 10px;
	}

	.detail-item:last-child {
		margin-bottom: 0;
	}

	.detail-label {
		width: 150px;
		font-weight: 500;
		color: #555;
	}

	.detail-value {
		flex: 1;
		color: #333;
	}

	.profile-form {
		margin-top: 20px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 20px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #555;
		font-size: 0.95rem;
	}

	input, select, textarea {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 0.95rem;
		transition: border-color 0.3s;
	}

	input:focus, select:focus, textarea:focus {
		border-color: #60A5FA;
		outline: none;
	}

	textarea {
		resize: vertical;
		min-height: 100px;
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

	small {
		display: block;
		margin-top: 5px;
		color: #666;
		font-size: 0.85rem;
	}

	small a {
		color: #60A5FA;
		text-decoration: none;
	}

	small a:hover {
		text-decoration: underline;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 15px;
		margin-top: 25px;
	}

	.connected-status {
		display: flex;
		align-items: center;
		margin-bottom: 25px;
		padding: 15px;
		background-color: #f8f9fa;
		border-radius: 8px;
	}

	.status-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 15px;
		flex-shrink: 0;
	}

	.status-icon.connected {
		background-color: #def7ec;
		color: #38a169;
	}

	.status-icon.disconnected {
		background-color: #fed7d7;
		color: #e53e3e;
	}

	.status-text h3 {
		margin: 0 0 5px 0;
	}

	.status-text p {
		margin: 0;
		color: #666;
		font-size: 0.95rem;
	}

	.sync-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.last-sync {
		color: #666;
		font-size: 0.9rem;
	}

	.oura-form {
		margin-top: 20px;
		padding: 20px;
		background-color: #f8f9fa;
		border-radius: 8px;
	}

	.achievements-grid {
		display: grid;
		gap: 20px;
	}

	.achievement-item {
		display: flex;
		align-items: center;
		padding: 15px;
		background-color: #f8f9fa;
		border-radius: 8px;
	}

	.achievement-icon {
		width: 48px;
		height: 48px;
		background-color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 15px;
		font-size: 1.5rem;
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
		flex-shrink: 0;
	}

	.achievement-details {
		flex: 1;
	}

	.achievement-details p {
		margin: 0 0 5px 0;
		color: #666;
		font-size: 0.9rem;
	}

	.achievement-date {
		color: #888;
		font-size: 0.8rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.stat-item {
		background-color: #f8f9fa;
		padding: 20px;
		border-radius: 8px;
		text-align: center;
	}

	.stat-icon {
		font-size: 1.8rem;
		margin-bottom: 10px;
	}

	.stat-item h3 {
		margin: 0 0 10px 0;
		font-size: 0.95rem;
		color: #555;
	}

	.stat-value {
		font-size: 1.8rem;
		font-weight: 600;
		color: #333;
		margin-bottom: 5px;
	}

	.stat-date {
		font-size: 0.8rem;
		color: #888;
	}

	@media (max-width: 768px) {
		.profile-grid {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
			gap: 15px;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>