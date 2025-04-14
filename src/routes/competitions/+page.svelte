<script>
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/authStore';
	import api from '$lib/services/api.client.js';
	
	let activeCompetitions = [];
	let upcomingCompetitions = [];
	let pastCompetitions = [];
	let selectedTab = 'active';
	let loading = true;
	let error = null;
	
	onMount(async () => {
		fetchCompetitions();
	});
	
	async function fetchCompetitions() {
		try {
			loading = true;
			error = null;
			
			// Fetch all competitions
			const response = await api.get('/competitions');
			const allCompetitions = response.data;
			
			// Better to use the server's filtering capabilities
			// Get active competitions
			const activeResponse = await api.get('/competitions?status=active');
			activeCompetitions = activeResponse.data;
			
			// Get upcoming competitions
			const upcomingResponse = await api.get('/competitions?status=upcoming');
			upcomingCompetitions = upcomingResponse.data;
			
			// Get past competitions
			const pastResponse = await api.get('/competitions?status=completed');
			pastCompetitions = pastResponse.data;
			
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
			await api.post(`/competitions/${competitionId}/join`);
			
			// Refresh competitions data
			await fetchCompetitions();
			
		} catch (err) {
			console.error('Error joining competition:', err);
			error = err.response?.data?.message || 'Failed to join competition. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	function formatDate(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
	
	function setTab(tab) {
		selectedTab = tab;
	}
	
	function isUserParticipating(competition) {
		return competition.participants && competition.participants.includes($authUser?.uid);
	}
</script>

<div class="competitions-container">
	<h1>Competitions</h1>
	
	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading competitions...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<p>{error}</p>
			<button on:click={fetchCompetitions}>Retry</button>
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
					<p>No active competitions at the moment.</p>
					<p>Check the upcoming tab for new competitions or create your own!</p>
					<button class="btn primary">Create Competition</button>
				</div>
			{:else if selectedTab === 'upcoming' && upcomingCompetitions.length === 0}
				<div class="empty-state">
					<p>No upcoming competitions scheduled.</p>
					<p>Check back later or create your own competition!</p>
					<button class="btn primary">Create Competition</button>
				</div>
			{:else if selectedTab === 'past' && pastCompetitions.length === 0}
				<div class="empty-state">
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
										<span class="info-value">{competition.winners[0]?.displayName || 'Unknown'}</span>
									</div>
								{/if}
							</div>
						</div>
						
						<div class="competition-actions">
							{#if selectedTab === 'active'}
								{#if isUserParticipating(competition)}
									<div class="participation-badge">
										<span class="badge">✓ Participating</span>
										<a href="/leaderboard?competition={competition.id}" class="btn secondary">View Leaderboard</a>
									</div>
								{:else}
									<button 
										class="btn primary" 
										on:click={() => joinCompetition(competition.id)}
										disabled={loading}
									>
										Join Competition
									</button>
								{/if}
							{:else if selectedTab === 'upcoming'}
								{#if isUserParticipating(competition)}
									<div class="participation-badge">
										<span class="badge">✓ Registered</span>
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
									Starts in {Math.ceil((new Date(competition.startDate) - new Date()) / (1000 * 60 * 60 * 24))} days
								</p>
							{:else if selectedTab === 'past'}
								<a href="/competitions/{competition.id}/results" class="btn secondary">View Results</a>
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
	
	.error-container p {
		color: #e74c3c;
		margin-bottom: 15px;
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
		color: #6e8efb;
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
		color: #6e8efb;
	}
	
	.empty-state {
		text-align: center;
		padding: 40px 0;
		color: #888;
	}
	
	.empty-state p {
		margin: 10px 0;
	}
	
	.empty-state .btn {
		margin-top: 20px;
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
	
	.competition-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 180px;
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
		text-align: center;
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
	
	.secondary:hover {
		background-color: rgba(110, 142, 251, 0.1);
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
		background-color: #e6f5ec;
		color: #38a169;
		padding: 8px 15px;
		border-radius: 50px;
		font-weight: 500;
		font-size: 0.9rem;
	}
	
	.starts-in {
		margin-top: 15px;
		text-align: center;
		font-size: 0.9rem;
		color: #888;
	}
	
	@media (max-width: 768px) {
		.competition-card {
			flex-direction: column;
			gap: 20px;
		}
		
		.competition-actions {
			min-width: auto;
		}
	}
</style>