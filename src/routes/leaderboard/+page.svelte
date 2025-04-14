<script>
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/authStore';
	import api from '$lib/services/api.client.js';
	
	let competitions = [];
	let selectedCompetition = null;
	let leaderboard = [];
	let loading = true;
	let error = null;
	
	onMount(async () => {
		try {
			loading = true;
			// Fetch active competitions
			const competitionsResponse = await api.get('/competitions?status=active');
			competitions = competitionsResponse.data;
			
			if (competitions.length > 0) {
				selectedCompetition = competitions[0].id;
				await fetchLeaderboard(selectedCompetition);
			}
		} catch (err) {
			console.error('Error fetching competitions:', err);
			error = 'Failed to load competitions. Please try again later.';
		} finally {
			loading = false;
		}
	});
	
	async function fetchLeaderboard(competitionId) {
		if (!competitionId) return;
		
		try {
			loading = true;
			const response = await api.get(`/competitions/${competitionId}/leaderboard`);
			leaderboard = response.data.rankings || [];
		} catch (err) {
			console.error('Error fetching leaderboard:', err);
			error = 'Failed to load leaderboard. Please try again later.';
		} finally {
			loading = false;
		}
	}
	
	function handleCompetitionChange(event) {
		selectedCompetition = event.target.value;
		fetchLeaderboard(selectedCompetition);
	}
	
	function getCompetitionTitle(id) {
		return competitions.find(comp => comp.id === id)?.title || '';
	}
</script>

<div class="leaderboard-container">
	<h1>Leaderboard</h1>
	
	{#if loading && competitions.length === 0}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading competitions...</p>
		</div>
	{:else if error && competitions.length === 0}
		<div class="error-container">
			<p>{error}</p>
			<button on:click={() => window.location.reload()}>Retry</button>
		</div>
	{:else if competitions.length === 0}
		<div class="no-competitions">
			<p>No active competitions found.</p>
			<a href="/competitions" class="btn primary">View All Competitions</a>
		</div>
	{:else}
		<div class="competition-selector">
			<label for="competition-select">Select Competition:</label>
			<select 
				id="competition-select" 
				bind:value={selectedCompetition} 
				on:change={handleCompetitionChange}
			>
				{#each competitions as competition}
					<option value={competition.id}>{competition.title}</option>
				{/each}
			</select>
		</div>
		
		<div class="leaderboard-card">
			<h2>{getCompetitionTitle(selectedCompetition)}</h2>
			
			{#if loading}
				<div class="loading-container">
					<div class="spinner"></div>
					<p>Loading leaderboard...</p>
				</div>
			{:else if error}
				<div class="error-container">
					<p>{error}</p>
					<button on:click={() => fetchLeaderboard(selectedCompetition)}>Retry</button>
				</div>
			{:else if leaderboard.length === 0}
				<p class="no-data">No rankings available for this competition yet.</p>
			{:else}
				<div class="leaderboard-table">
					<div class="leaderboard-header">
						<div class="rank-column">Rank</div>
						<div class="user-column">User</div>
						<div class="score-column">Score</div>
						<div class="change-column">Change</div>
					</div>
					
					{#each leaderboard as entry, index}
						<div 
							class="leaderboard-row {entry.userId === $authUser?.uid ? 'current-user' : ''}" 
							class:top-three={index < 3}
						>
							<div class="rank-column">
								{#if index === 0}
									<div class="medal gold">1</div>
								{:else if index === 1}
									<div class="medal silver">2</div>
								{:else if index === 2}
									<div class="medal bronze">3</div>
								{:else}
									{entry.rank}
								{/if}
							</div>
							<div class="user-column">
								<span class="username">{entry.displayName || entry.username}</span>
							</div>
							<div class="score-column">{entry.score}</div>
							<div class="change-column">
								{#if entry.change > 0}
									<span class="change positive">+{entry.change}</span>
								{:else if entry.change < 0}
									<span class="change negative">{entry.change}</span>
								{:else}
									<span class="change neutral">0</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
				
				<div class="leaderboard-info">
					<p>Last updated: {new Date().toLocaleString()}</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.leaderboard-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px;
	}
	
	h1 {
		margin-bottom: 30px;
		color: #333;
	}
	
	.loading-container, .error-container, .no-competitions {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 0;
		text-align: center;
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
	
	.btn {
		padding: 10px 20px;
		border-radius: 50px;
		font-weight: bold;
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-size: 0.8rem;
		transition: all 0.3s ease;
		display: inline-block;
	}
	
	.primary {
		background: linear-gradient(135deg, #6e8efb, #a777e3);
		color: white;
	}
	
	.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}
	
	.competition-selector {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
	}
	
	.competition-selector label {
		margin-right: 15px;
		font-weight: 500;
		color: #555;
	}
	
	.competition-selector select {
		flex: 1;
		padding: 10px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
		background-color: white;
		cursor: pointer;
		max-width: 400px;
	}
	
	.leaderboard-card {
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
	
	.no-data {
		color: #888;
		text-align: center;
		margin: 25px 0;
	}
	
	.leaderboard-table {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		margin-bottom: 20px;
	}
	
	.leaderboard-header {
		display: flex;
		background-color: #f0f0f0;
		font-weight: bold;
		color: #555;
		padding: 15px;
		border-radius: 8px 8px 0 0;
	}
	
	.leaderboard-row {
		display: flex;
		padding: 15px;
		border-bottom: 1px solid #eee;
		transition: background-color 0.2s;
	}
	
	.leaderboard-row:last-child {
		border-bottom: none;
		border-radius: 0 0 8px 8px;
	}
	
	.leaderboard-row:hover {
		background-color: #f9f9f9;
	}
	
	.leaderboard-row.current-user {
		background-color: rgba(110, 142, 251, 0.1);
	}
	
	.leaderboard-row.top-three {
		font-weight: 500;
	}
	
	.rank-column {
		width: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.user-column {
		flex: 1;
		padding-left: 10px;
	}
	
	.score-column {
		width: 100px;
		text-align: center;
	}
	
	.change-column {
		width: 100px;
		text-align: center;
	}
	
	.medal {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
	}
	
	.gold {
		background: linear-gradient(45deg, #FFD700, #FFC400);
		box-shadow: 0 2px 5px rgba(255, 215, 0, 0.3);
	}
	
	.silver {
		background: linear-gradient(45deg, #C0C0C0, #A9A9A9);
		box-shadow: 0 2px 5px rgba(192, 192, 192, 0.3);
	}
	
	.bronze {
		background: linear-gradient(45deg, #CD7F32, #B87333);
		box-shadow: 0 2px 5px rgba(205, 127, 50, 0.3);
	}
	
	.username {
		font-weight: 500;
	}
	
	.change {
		font-weight: bold;
		border-radius: 4px;
		padding: 2px 6px;
	}
	
	.positive {
		color: #27ae60;
		background-color: rgba(39, 174, 96, 0.1);
	}
	
	.negative {
		color: #e74c3c;
		background-color: rgba(231, 76, 60, 0.1);
	}
	
	.neutral {
		color: #7f8c8d;
		background-color: rgba(127, 140, 141, 0.1);
	}
	
	.leaderboard-info {
		text-align: right;
		font-size: 0.9rem;
		color: #888;
	}
</style>