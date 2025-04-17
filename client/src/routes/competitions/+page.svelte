<script>
	import {onMount} from 'svelte';
	import {authUser} from '$lib/stores/authStore';
	import {competitionApi} from '$lib/services/api.client.js';

	let activeCompetitions = [];
	let upcomingCompetitions = [];
	let pastCompetitions = [];
	let selectedTab = 'active';
	let loading = true;
	let error = null;
	let successMessage = null;

	onMount(async () => {
		fetchCompetitions();
	});

	async function fetchCompetitions() {
		try {
			loading = true;
			error = null;

			// Get all competitions using the API client
			const response = await competitionApi.getCompetitions();
			
			// Initialize as empty arrays
			activeCompetitions = [];
			upcomingCompetitions = [];
			pastCompetitions = [];
			
			// Check if response data has the expected structure
			if (response && response.data) {
				let competitions = [];
				
				// Handle both possible API response formats
				if (response.data.competitions && Array.isArray(response.data.competitions)) {
					competitions = response.data.competitions;
				} else if (Array.isArray(response.data)) {
					competitions = response.data;
				} else {
					console.error('Unexpected response structure:', response.data);
					error = 'Invalid data format from server.';
					return;
				}
				
				// Filter competitions by status (case insensitive)
				if (competitions && competitions.length > 0) {
					// Filter with null checks
					activeCompetitions = competitions.filter(comp => 
						comp && comp.status && comp.status.toUpperCase() === 'ACTIVE');
					upcomingCompetitions = competitions.filter(comp => 
						comp && comp.status && comp.status.toUpperCase() === 'PENDING');
					pastCompetitions = competitions.filter(comp => 
						comp && comp.status && comp.status.toUpperCase() === 'COMPLETED');
				}
			} else {
				error = 'No data received from server.';
			}
		} catch (err) {
			console.error('Error fetching competitions:', err);
			error = 'Failed to load competitions. Please try again later.';
		} finally {
			loading = false;
		}
	}

	async function joinCompetition(competitionId) {
		try {
			loading = true;
			successMessage = null;
			error = null;

			await competitionApi.joinCompetition(competitionId);

			// Refresh competitions data
			await fetchCompetitions();

			successMessage = 'Successfully joined the competition!';

			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);

		} catch (err) {
			console.error('Error joining competition:', err);
			error = err.response?.data?.message || 'Failed to join competition. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function leaveCompetition(competitionId) {
		if (!confirm('Are you sure you want to leave this competition?')) {
			return;
		}

		try {
			loading = true;
			successMessage = null;
			error = null;

			await competitionApi.leaveCompetition(competitionId);

			// Refresh competitions data
			await fetchCompetitions();

			successMessage = 'Successfully left the competition.';

			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);

		} catch (err) {
			console.error('Error leaving competition:', err);
			error = err.response?.data?.message || 'Failed to leave competition. Please try again.';
		} finally {
			loading = false;
		}
	}

	function formatDate(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
	}

	function setTab(tab) {
		selectedTab = tab;
	}

	function isUserParticipating(competition) {
		return competition.participants && competition.participants.includes($authUser?.uid);
	}

	function getDaysRemaining(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = date - now;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}
</script>

<div class="competitions-container">
	<h1>Competitions</h1>

	{#if successMessage}
		<div class="success-message">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
				 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
				<polyline points="22 4 12 14.01 9 11.01"></polyline>
			</svg>
			{successMessage}
		</div>
	{/if}

	{#if error}
		<div class="error-message">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
				 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			{error}
		</div>
	{/if}

	{#if loading && !activeCompetitions.length && !upcomingCompetitions.length && !pastCompetitions.length}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading competitions...</p>
		</div>
	{:else}
		<div class="tabs">
			<button
					class="tab {selectedTab === 'active' ? 'active' : ''}"
					on:click={() => setTab('active')}
			>
				Active <span class="count">{activeCompetitions.length}</span>
			</button>
			<button
					class="tab {selectedTab === 'upcoming' ? 'active' : ''}"
					on:click={() => setTab('upcoming')}
			>
				Upcoming <span class="count">{upcomingCompetitions.length}</span>
			</button>
			<button
					class="tab {selectedTab === 'past' ? 'active' : ''}"
					on:click={() => setTab('past')}
			>
				Past <span class="count">{pastCompetitions.length}</span>
			</button>
		</div>

		<div class="competitions-list">
			{#if selectedTab === 'active' && activeCompetitions.length === 0}
				<div class="empty-state">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
						 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm14-10V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v5h14zm-8-4a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
						<path d="M4 15h2M4 15v3a2 2 0 0 0 2 2h2M4 15V5"/>
					</svg>
					<p>No active competitions at the moment.</p>
					<p>Check the upcoming tab for new competitions or create your own!</p>
				</div>
			{:else if selectedTab === 'upcoming' && upcomingCompetitions.length === 0}
				<div class="empty-state">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
						 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
					<p>No upcoming competitions scheduled.</p>
					<p>Check back later or check with the admin to schedule new competitions!</p>
				</div>
			{:else if selectedTab === 'past' && pastCompetitions.length === 0}
				<div class="empty-state">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
						 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"></circle>
						<polyline points="12 6 12 12 16 14"></polyline>
					</svg>
					<p>No past competitions found.</p>
					<p>Join an active competition to see results here later.</p>
				</div>
			{:else}
				{#each (selectedTab === 'active' ? activeCompetitions : selectedTab === 'upcoming' ? upcomingCompetitions : pastCompetitions) as competition}
					<div class="competition-card">
						<div class="competition-details">
							<h2>{competition.title}</h2>
							<p class="dates">
								{formatDate(competition.startDate)} - {formatDate(competition.endDate)}
							</p>
							<p class="description">{competition.description}</p>

							<div class="competition-info">
								<div class="info-item">
									<span class="info-label">Type:</span>
									<span class="info-value">{competition.type}</span>
								</div>
								<div class="info-item">
									<span class="info-label">Participants:</span>
									<span class="info-value">{competition.participants?.length || 0}</span>
								</div>
								{#if competition.winners && competition.winners.length > 0 && selectedTab === 'past'}
									<div class="info-item">
										<span class="info-label">Winner:</span>
										<span class="info-value winner">{competition.winners[0]?.displayName || 'Unknown'}</span>
									</div>
								{/if}
							</div>
						</div>

						<div class="competition-actions">
							{#if selectedTab === 'active'}
								{#if isUserParticipating(competition)}
									<div class="participation-badge">
										<span class="badge participating">✓ Participating</span>
										<div class="action-buttons">
											<a href="/leaderboard?competition={competition.id}" class="btn secondary">View
												Leaderboard</a>
											<button
													class="btn text-danger"
													on:click={() => leaveCompetition(competition.id)}
													disabled={loading}
											>
												Leave Competition
											</button>
										</div>
									</div>
								{:else}
									<button
											class="btn primary"
											on:click={() => joinCompetition(competition.id)}
											disabled={loading}
									>
										{loading ? 'Joining...' : 'Join Competition'}
									</button>
								{/if}
							{:else if selectedTab === 'upcoming'}
								{#if isUserParticipating(competition)}
									<div class="participation-badge">
										<span class="badge registered">✓ Registered</span>
										<button
												class="btn text-danger"
												on:click={() => leaveCompetition(competition.id)}
												disabled={loading}
										>
											Cancel Registration
										</button>
									</div>
								{:else}
									<button
											class="btn primary"
											on:click={() => joinCompetition(competition.id)}
											disabled={loading}
									>
										Register Now
									</button>
								{/if}
								<p class="starts-in">
									Starts in {Math.max(0, getDaysRemaining(competition.startDate))} days
								</p>
							{:else if selectedTab === 'past'}
								<div class="past-actions">
									{#if isUserParticipating(competition)}
										<span class="badge participated">Participated</span>
									{/if}
									<a href="/competitions/{competition.id}/results" class="btn secondary">View
										Results</a>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.competitions-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px;
	}

	h1 {
		margin-bottom: 30px;
		color: #333;
		font-size: 2rem;
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

	.loading-container, .empty-state {
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
		to {
			transform: rotate(360deg);
		}
	}

	.empty-state p {
		color: #666;
		margin: 5px 0;
	}

	.empty-state svg {
		margin-bottom: 20px;
		color: #aaa;
	}

	.tabs {
		display: flex;
		margin-bottom: 25px;
		background-color: #f0f0f0;
		border-radius: 50px;
		padding: 5px;
	}

	.tab {
		flex: 1;
		padding: 12px 20px;
		background: none;
		border: none;
		border-radius: 50px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
		color: #555;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.tab:hover {
		background-color: rgba(110, 142, 251, 0.1);
	}

	.tab.active {
		background-color: white;
		color: #60A5FA;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
	}

	.count {
		background-color: #eee;
		color: #555;
		border-radius: 50px;
		padding: 2px 8px;
		font-size: 0.8rem;
		min-width: 24px;
		text-align: center;
	}

	.tab.active .count {
		background-color: #e6ebff;
		color: #60A5FA;
	}

	.competition-card {
		background: white;
		border-radius: 12px;
		padding: 25px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
		margin-bottom: 25px;
		display: flex;
		gap: 30px;
	}

	.competition-details {
		flex: 1;
	}

	h2 {
		margin: 0 0 10px 0;
		color: #333;
		font-size: 1.5rem;
	}

	.dates {
		color: #888;
		margin-bottom: 15px;
		font-size: 0.9rem;
	}

	.description {
		margin-bottom: 20px;
		color: #555;
		line-height: 1.5;
	}

	.competition-info {
		display: flex;
		gap: 20px;
		margin-top: 20px;
		flex-wrap: wrap;
	}

	.info-item {
		display: flex;
		flex-direction: column;
	}

	.info-label {
		font-size: 0.9rem;
		color: #888;
		margin-bottom: 3px;
	}

	.info-value {
		font-weight: 500;
		color: #333;
	}

	.info-value.winner {
		color: #d4af37;
	}

	.competition-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 180px;
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
		text-align: center;
	}

	.primary {
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		color: white;
	}

	.primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}

	.secondary {
		background-color: #f0f0f0;
		color: #555;
	}

	.secondary:hover {
		background-color: #e5e5e5;
	}

	.text-danger {
		background: none;
		color: #e53e3e;
		padding: 5px 0;
	}

	.text-danger:hover {
		text-decoration: underline;
	}

	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.participation-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.badge {
		display: inline-block;
		padding: 5px 12px;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.participating {
		background-color: #e6fffa;
		color: #38a169;
	}

	.registered {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.participated {
		background-color: #f0f0f0;
		color: #555;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
	}

	.starts-in {
		margin-top: 15px;
		text-align: center;
		font-size: 0.9rem;
		color: #888;
	}

	.past-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	@media (max-width: 768px) {
		.competition-card {
			flex-direction: column;
			gap: 20px;
		}

		.competition-actions {
			min-width: auto;
		}

		.tabs {
			flex-direction: row;
			flex-wrap: wrap;
		}

		.tab {
			padding: 10px;
			font-size: 0.9rem;
		}

		.competition-info {
			flex-direction: column;
			gap: 10px;
		}
	}
</style>
