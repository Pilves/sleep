<script>
	import {onMount} from 'svelte';
	import {authUser} from '$lib/stores/authStore';
	import {competitionApi} from '$lib/services/api.client.js';

	let competitions = [];
	let selectedCompetition = null;
	let leaderboard = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			loading = true;
			// Fetch active competitions using the API client
			const competitionsResponse = await competitionApi.getCompetitions();
			
			// Handle different response formats and filter for active competitions
			if (competitionsResponse.data && competitionsResponse.data.competitions && Array.isArray(competitionsResponse.data.competitions)) {
				competitions = competitionsResponse.data.competitions.filter(comp => 
					comp && comp.status && comp.status.toUpperCase() === 'ACTIVE');
			} else if (competitionsResponse.data && Array.isArray(competitionsResponse.data)) {
				competitions = competitionsResponse.data.filter(comp => 
					comp && comp.status && comp.status.toUpperCase() === 'ACTIVE');
			} else {
				console.error('Unexpected API response structure:', competitionsResponse.data);
				competitions = [];
			}

			if (competitions.length > 0) {
				// Select the first competition by default
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
			const response = await competitionApi.getLeaderboard(competitionId);
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

	function getCompetitionEndDate(id) {
		const competition = competitions.find(comp => comp.id === id);
		if (!competition || !competition.endDate) return '';

		const endDate = new Date(competition.endDate);
		const now = new Date();
		const diff = endDate - now;

		// If less than 0, competition has ended
		if (diff < 0) return 'Ended';

		// Calculate days, hours
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		return `${days} days, ${hours} hours`;
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
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
				 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<p>{error}</p>
			<button on:click={() => window.location.reload()} class="btn primary">Retry</button>
		</div>
	{:else if competitions.length === 0}
		<div class="empty-state">
			<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
				 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm14-10V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v5h14zm-8-4a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
				<path d="M4 15h2M4 15v3a2 2 0 0 0 2 2h2M4 15V5"/>
			</svg>
			<p>No active competitions found.</p>
			<a href="/competitions" class="btn primary">View All Competitions</a>
		</div>
	{:else}
		<div class="competition-selector">
			<div class="selector-wrapper">
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

			<div class="competition-info">
				<div class="info-item">
					<span class="info-label">Competition ends in:</span>
					<span class="info-value">{getCompetitionEndDate(selectedCompetition)}</span>
				</div>
			</div>
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
					<button on:click={() => fetchLeaderboard(selectedCompetition)} class="btn primary sm">Retry</button>
				</div>
			{:else if leaderboard.length === 0}
				<div class="empty-state">
					<p>No rankings available for this competition yet.</p>
					<p>Be the first to join!</p>
					<a href="/competitions" class="btn primary sm">Join Competition</a>
				</div>
			{:else}
				<div class="podium">
					{#if leaderboard.length > 1}
						<div class="podium-item second">
							<div class="avatar">
								{leaderboard[1].displayName?.[0] || leaderboard[1].username?.[0] || '2'}
							</div>
							<div class="rank">2</div>
							<div class="name">{leaderboard[1].displayName || leaderboard[1].username}</div>
							<div class="score">{leaderboard[1].score} points</div>
						</div>
					{/if}

					{#if leaderboard.length > 0}
						<div class="podium-item first">
							<div class="avatar">
								{leaderboard[0].displayName?.[0] || leaderboard[0].username?.[0] || '1'}
							</div>
							<div class="rank">1</div>
							<div class="name">{leaderboard[0].displayName || leaderboard[0].username}</div>
							<div class="score">{leaderboard[0].score} points</div>
						</div>
					{/if}

					{#if leaderboard.length > 2}
						<div class="podium-item third">
							<div class="avatar">
								{leaderboard[2].displayName?.[0] || leaderboard[2].username?.[0] || '3'}
							</div>
							<div class="rank">3</div>
							<div class="name">{leaderboard[2].displayName || leaderboard[2].username}</div>
							<div class="score">{leaderboard[2].score} points</div>
						</div>
					{/if}
				</div>

				{#if leaderboard.length > 3}
					<div class="leaderboard-table">
						<div class="table-header">
							<div class="rank-column">Rank</div>
							<div class="user-column">User</div>
							<div class="score-column">Score</div>
							<div class="change-column">Change</div>
						</div>

						{#each leaderboard.slice(3) as entry, index}
							<div
									class="table-row {entry.userId === $authUser?.uid ? 'current-user' : ''}"
							>
								<div class="rank-column">{index + 4}</div>
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
				{/if}

				<div class="leaderboard-footer">
					<p>Last updated: {new Date().toLocaleString()}</p>
					<button
							class="btn refresh"
							on:click={() => fetchLeaderboard(selectedCompetition)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
							 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
						</svg>
						Refresh
					</button>
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
		font-size: 2rem;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 25px;
		color: #444;
		font-size: 1.5rem;
		text-align: center;
	}

	.loading-container, .error-container, .empty-state {
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

	.btn.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}

	.btn.refresh {
		background-color: #f0f0f0;
		color: #555;
	}

	.btn.refresh:hover {
		background-color: #e5e5e5;
	}

	.competition-selector {
		background-color: white;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 25px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 20px;
	}

	.selector-wrapper {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.selector-wrapper label {
		font-weight: 500;
		color: #555;
		white-space: nowrap;
	}

	select {
		padding: 10px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		background-color: white;
		font-size: 0.95rem;
		min-width: 250px;
	}

	select:focus {
		border-color: #60A5FA;
		outline: none;
	}

	.competition-info {
		display: flex;
		gap: 20px;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.info-label {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 3px;
	}

	.info-value {
		font-weight: 600;
		color: #333;
	}

	.leaderboard-card {
		background: white;
		border-radius: 12px;
		padding: 25px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.podium {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		margin-bottom: 40px;
		padding: 0 20px;
		height: 240px;
	}

	.podium-item {
		text-align: center;
		margin: 0 15px;
		position: relative;
		animation: slideUp 0.5s ease-out forwards;
		opacity: 0;
	}

	.podium-item.first {
		animation-delay: 0.2s;
		z-index: 3;
	}

	.podium-item.second {
		animation-delay: 0.3s;
		z-index: 2;
	}

	.podium-item.third {
		animation-delay: 0.4s;
		z-index: 1;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.podium-item::after {
		content: "";
		position: absolute;
		bottom: -20px;
		left: 50%;
		transform: translateX(-50%);
		width: 80px;
		height: 25px;
		border-radius: 4px 4px 0 0;
		z-index: -1;
	}

	.podium-item.first::after {
		background-color: #FFD700;
		height: 80px;
	}

	.podium-item.second::after {
		background-color: #C0C0C0;
		height: 60px;
	}

	.podium-item.third::after {
		background-color: #CD7F32;
		height: 40px;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.8rem;
		font-weight: 600;
		margin: 0 auto 10px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.first .avatar {
		background: linear-gradient(135deg, #FFD700, #FFC400);
		color: white;
		width: 72px;
		height: 72px;
		font-size: 2rem;
	}

	.second .avatar {
		background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
		color: white;
	}

	.third .avatar {
		background: linear-gradient(135deg, #CD7F32, #B87333);
		color: white;
	}

	.rank {
		position: absolute;
		top: -10px;
		right: -5px;
		width: 25px;
		height: 25px;
		border-radius: 50%;
		background-color: #333;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 600;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.first .rank {
		background-color: #FFD700;
		color: #333;
	}

	.second .rank {
		background-color: #C0C0C0;
		color: #333;
	}

	.third .rank {
		background-color: #CD7F32;
		color: white;
	}

	.name {
		font-weight: 600;
		color: #333;
		margin-bottom: 5px;
	}

	.score {
		font-size: 0.9rem;
		color: #666;
	}

	.leaderboard-table {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		margin-bottom: 20px;
		border: 1px solid #eee;
	}

	.table-header {
		display: grid;
		grid-template-columns: 80px 1fr 120px 120px;
		background-color: #f0f0f0;
		font-weight: 600;
		color: #555;
		padding: 15px;
	}

	.table-row {
		display: grid;
		grid-template-columns: 80px 1fr 120px 120px;
		padding: 15px;
		border-bottom: 1px solid #eee;
		align-items: center;
		transition: background-color 0.2s;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-row:hover {
		background-color: #f9f9f9;
	}

	.table-row.current-user {
		background-color: rgba(96, 165, 250, 0.1);
	}

	.rank-column {
		font-weight: 600;
		color: #555;
		text-align: center;
	}

	.username {
		font-weight: 500;
		color: #333;
	}

	.score-column {
		text-align: center;
		font-weight: 600;
		color: #333;
	}

	.change-column {
		text-align: center;
	}

	.change {
		display: inline-block;
		padding: 3px 8px;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.positive {
		background-color: #e6fffa;
		color: #38a169;
	}

	.negative {
		background-color: #fff5f5;
		color: #e53e3e;
	}

	.neutral {
		background-color: #f7fafc;
		color: #718096;
	}

	.leaderboard-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 30px;
		color: #666;
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.competition-selector {
			flex-direction: column;
			align-items: flex-start;
		}

		.selector-wrapper {
			width: 100%;
		}

		select {
			width: 100%;
		}

		.info-item {
			align-items: flex-start;
		}

		.podium {
			height: auto;
			flex-wrap: wrap;
			gap: 30px;
		}

		.podium-item {
			margin-bottom: 30px;
		}

		.table-header, .table-row {
			grid-template-columns: 60px 1fr 80px 80px;
			font-size: 0.9rem;
		}

		.change {
			padding: 2px 6px;
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.table-header, .table-row {
			grid-template-columns: 50px 1fr 70px;
		}

		.change-column {
			display: none;
		}
	}
</style>
