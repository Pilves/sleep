<script>
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/authStore';
	import { sleepApi, competitionApi } from '$lib/services/api.client.js';

	let sleepData = [];
	let competitions = [];
	let loading = true;
	let error = null;
	let userName = '';
	let currentScore = null;
	let scoreChange = null;
	let activeSyncRequest = false;
	let syncSuccess = false;
	let ouraConnected = false;
	let ouraConnectLoading = false;
	let lastSyncTime = null;

	onMount(async () => {
		if (!$authUser) return;

		userName = $authUser.displayName || 'there';

		try {
			loading = true;

			// Check if Oura is connected
			try {
				const ouraStatusResponse = await userApi.getOuraConnectionStatus();
				ouraConnected = ouraStatusResponse.data.connected;

				// Get last sync time if available
				if (ouraStatusResponse.data.lastSyncDate) {
					lastSyncTime = new Date(ouraStatusResponse.data.lastSyncDate);
				}
			} catch (ouraStatusError) {
				if (import.meta.env.DEV) {
					console.error('Error checking Oura connection status:', ouraStatusError);
				}
				// Continue loading the rest of the dashboard even if Oura status check fails
			}

			// Fetch user's sleep data (recent 7 days)
			try {
				const sleepResponse = await sleepApi.getSleepData({ days: 7 });
				sleepData = sleepResponse.data.sleepData || [];

				if (sleepData.length > 0) {
					// Get most recent data (last item in the array)
					const mostRecentData = sleepData[sleepData.length - 1];
					currentScore = mostRecentData.ouraScore;

					// Calculate score change (current vs yesterday)
					if (sleepData.length > 1) {
						const previousData = sleepData[sleepData.length - 2];
						scoreChange = currentScore - previousData.ouraScore;
					}

					// If we got sleep data but didn't get a lastSyncTime from status endpoint
					if (!lastSyncTime && sleepData[0].date) {
						lastSyncTime = new Date(sleepData[0].date);
					}
				}
			} catch (sleepError) {
				if (import.meta.env.DEV) {
					console.error('Error fetching sleep data:', sleepError);
				}
				// Continue with empty sleep data
				sleepData = [];
			}

			// Fetch active competitions
			const competitionsResponse = await competitionApi.getCompetitions();
			competitions = competitionsResponse.data.competitions || [];
		} catch (err) {
			if (import.meta.env.DEV) {
				console.error('Error fetching dashboard data:', err);
			}
			error = 'Failed to load dashboard data. Please try again later.';
		} finally {
			loading = false;
		}
	});

	async function syncSleepData() {
		if (activeSyncRequest) return;

		activeSyncRequest = true;
		syncSuccess = false;

		try {
			const syncResponse = await sleepApi.syncSleepData();

			// Update last sync time
			if (syncResponse.data.recordsProcessed > 0) {
				lastSyncTime = new Date();
			}

			// Refresh sleep data after sync
			try {
				const sleepResponse = await sleepApi.getSleepData({ days: 7 });
				sleepData = sleepResponse.data.sleepData || [];

				if (sleepData.length > 0) {
					// Get most recent data (last item in the array)
					const mostRecentData = sleepData[sleepData.length - 1];
					currentScore = mostRecentData.ouraScore;

					if (sleepData.length > 1) {
						const previousData = sleepData[sleepData.length - 2];
						scoreChange = currentScore - previousData.ouraScore;
					}
				}
			} catch (error) {
				if (import.meta.env.DEV) {
					console.error('Error refreshing sleep data:', error);
				}
				// Continue with existing sleep data
			}

			syncSuccess = true;

			// Reset success message after 3 seconds
			setTimeout(() => {
				syncSuccess = false;
			}, 3000);
		} catch (err) {
			if (import.meta.env.DEV) {
				console.error('Error syncing sleep data:', err);
			}
			error = 'Failed to sync sleep data. Please try again later.';
		} finally {
			activeSyncRequest = false;
		}
	}

	async function connectOura() {
		try {
			ouraConnectLoading = true;
			error = null;

			// Get OAuth URL
			const response = await userApi.getOuraAuthUrl();
			const authUrl = response.data.authorizationUrl;

			// Redirect to Oura authorization page
			window.location.href = authUrl;

		} catch (err) {
			if (import.meta.env.DEV) {
				console.error('Error starting Oura OAuth flow:', err);
			}
			error = err.response?.data?.message || 'Failed to start Oura authorization. Please try again.';
			ouraConnectLoading = false;
		}
	}

	function formatDate(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function getTimeOfDay() {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 18) return 'Good afternoon';
		return 'Good evening';
	}

	function getScoreClass(score) {
		if (score >= 85) return 'excellent';
		if (score >= 70) return 'good';
		if (score >= 50) return 'fair';
		return 'poor';
	}
</script>

<div class="dashboard-container">
	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading your dashboard...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<p>{error}</p>
			<button on:click={() => window.location.reload()} class="retry-button">Retry</button>
		</div>
	{:else}
		<div class="dashboard-header">
			<h1>{getTimeOfDay()}, {userName}</h1>
			{#if currentScore}
				<p class="sleep-message">Your sleep score is {scoreChange > 0 ? 'improving' : scoreChange < 0 ? 'decreasing' : 'stable'}! Keep it up.</p>
			{:else}
				<p class="sleep-message">Connect your Oura Ring to start tracking your sleep.</p>
			{/if}
		</div>

		{#if !ouraConnected}
			<div class="oura-banner">
				<div class="oura-banner-content">
					<div class="oura-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17 18a5 5 0 0 0-10 0"></path>
							<line x1="12" y1="2" x2="12" y2="9"></line>
							<line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
							<line x1="1" y1="18" x2="3" y2="18"></line>
							<line x1="21" y1="18" x2="23" y2="18"></line>
							<line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
							<line x1="23" y1="22" x2="1" y2="22"></line>
							<polyline points="8 6 12 2 16 6"></polyline>
						</svg>
					</div>
					<div class="oura-banner-text">
						<h3>Connect your Oura Ring to participate in competitions</h3>
						<p>Track your sleep and compete with others for better sleep habits!</p>
					</div>
					<button
						class="btn primary oura-connect-btn"
						on:click={connectOura}
						disabled={ouraConnectLoading}
					>
						{ouraConnectLoading ? 'Connecting...' : 'Connect Oura Ring'}
					</button>
				</div>
			</div>
		{/if}

		<div class="dashboard-grid">
			<!-- Sleep Summary Card -->
			<div class="card sleep-summary">
				<h2>Current Sleep Score</h2>
				{#if sleepData.length === 0}
					<div class="empty-state">
						<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17 18a5 5 0 0 0-10 0"></path>
							<line x1="12" y1="2" x2="12" y2="9"></line>
							<line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
							<line x1="1" y1="18" x2="3" y2="18"></line>
							<line x1="21" y1="18" x2="23" y2="18"></line>
							<line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
							<line x1="23" y1="22" x2="1" y2="22"></line>
							<polyline points="8 6 12 2 16 6"></polyline>
						</svg>
						<p>No sleep data available</p>
						{#if !ouraConnected}
							<p>Connect your Oura Ring to start tracking</p>
						{:else}
							<p>You haven't recorded any sleep data yet</p>
						{/if}
						{#if !ouraConnected}
							<button
								class="btn primary oura-connect-btn"
								on:click={connectOura}
								disabled={ouraConnectLoading}
								style="margin-top: 15px;"
							>
								{ouraConnectLoading ? 'Connecting...' : 'Connect Oura Ring Now'}
							</button>
						{:else}
							<button on:click={syncSleepData} class="btn primary" disabled={activeSyncRequest}>
									{activeSyncRequest ? 'Syncing...' : 'Sync Sleep Data'}
								</button>
								{#if lastSyncTime}
									<p class="sync-time">Last synced: {lastSyncTime.toLocaleString()}</p>
								{/if}
						{/if}
					</div>
				{:else}
					<div class="sleep-score">
						<div class="score-circle {getScoreClass(currentScore)}">
							<span>{currentScore}</span>
							{#if scoreChange !== null}
								<div class="score-change {scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">
									{scoreChange > 0 ? '+' : ''}{scoreChange}
								</div>
							{/if}
						</div>
						<div class="score-label">
							<h3>Latest Sleep Score</h3>
							<p>{sleepData[sleepData.length-1]?.date ? formatDate(sleepData[sleepData.length-1].date) : ''}</p>

							{#if sleepData[sleepData.length-1]?.metrics}
								<div class="sleep-metrics">
									<div class="metric">
										{#if sleepData[sleepData.length-1].metrics.totalSleepTime > 500}
											<!-- Assuming it's in seconds, convert to h:m format -->
											<span class="metric-value">{Math.floor(sleepData[sleepData.length-1].metrics.totalSleepTime / 3600)}h {Math.floor((sleepData[sleepData.length-1].metrics.totalSleepTime % 3600) / 60)}m</span>
										{:else}
											<!-- Assuming it's already in minutes -->
											<span class="metric-value">{Math.floor(sleepData[sleepData.length-1].metrics.totalSleepTime / 60)}h {sleepData[sleepData.length-1].metrics.totalSleepTime % 60}m</span>
										{/if}
										<span class="metric-label">Sleep Duration</span>
									</div>
									<div class="metric">
										<span class="metric-value">{sleepData[sleepData.length-1].metrics.efficiency || 0}%</span>
										<span class="metric-label">Efficiency</span>
									</div>
									<div class="metric">
										{#if sleepData[sleepData.length-1].metrics.deepSleep > 500}
											<!-- Assuming it's in seconds, convert to minutes -->
											<span class="metric-value">{Math.round(sleepData[sleepData.length-1].metrics.deepSleep / 60)}m</span>
										{:else}
											<!-- Assuming it's already in minutes -->
											<span class="metric-value">{sleepData[sleepData.length-1].metrics.deepSleep || 0}m</span>
										{/if}
										<span class="metric-label">Deep Sleep</span>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<div class="sync-container">
						<button
								class="sync-button {activeSyncRequest ? 'syncing' : ''}"
								on:click={syncSleepData}
								disabled={activeSyncRequest}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
							</svg>
							{activeSyncRequest ? 'Syncing...' : 'Sync Sleep Data'}
						</button>

						{#if syncSuccess}
							<div class="sync-success">Sleep data synced successfully!</div>
						{:else if lastSyncTime}
							<div class="last-sync">Last synced: {lastSyncTime.toLocaleString()}</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Active Competitions Card -->
			<div class="card competitions">
				<h2>Active Competitions</h2>
				{#if competitions.length === 0}
					<div class="empty-state">
						<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm14-10V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v5h14zm-8-4a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
							<path d="M4 15h2M4 15v3a2 2 0 0 0 2 2h2M4 15V5"/>
						</svg>
						<p>You're not participating in any competitions</p>
						<a href="sleep/competitions" class="btn primary">Join a Competition</a>
					</div>
				{:else}
					<ul class="competition-list">
						{#each competitions as competition}
							<li class="competition-item">
								<div class="competition-info">
									<h3>{competition.title}</h3>
									<p class="competition-dates">
										{formatDate(competition.startDate)} - {formatDate(competition.endDate)}
									</p>
									{#if competition.currentRank}
										<p class="competition-rank">Your rank: <span class="rank">{competition.currentRank}</span> of {competition.participants?.length || 0}</p>
									{/if}
								</div>
								<a href="sleep/competitions/{competition.id}" class="view-link">View</a>
							</li>
						{/each}
					</ul>
					<a href="sleep/competitions" class="view-all">View All Competitions</a>
				{/if}
			</div>

			<!-- Sleep Trend Preview -->
			<div class="card sleep-trend">
				<h2>Sleep Trend</h2>
				{#if sleepData.length < 3}
					<div class="empty-state">
						<p>Not enough data to show trends. Keep tracking your sleep!</p>
					</div>
				{:else}
					<div class="trend-chart">
						{#each [...sleepData].reverse().slice(0, 7) as day, index}
							<div
									class="bar-container"
									style="--index: {index}; --total: {Math.min(sleepData.length, 7)}"
							>
								<div
										class="bar {getScoreClass(day.ouraScore)}"
										style="--height: {day.ouraScore}%"
								>
									<span class="bar-value">{day.ouraScore}</span>
								</div>
								<div class="bar-date">{formatDate(day.date).split(' ')[1]}</div>
							</div>
						{/each}
					</div>

					<div class="trend-legend">
						<div class="legend-item">
							<span class="legend-color excellent"></span>
							<span>Excellent (85+)</span>
						</div>
						<div class="legend-item">
							<span class="legend-color good"></span>
							<span>Good (70-84)</span>
						</div>
						<div class="legend-item">
							<span class="legend-color fair"></span>
							<span>Fair (50-69)</span>
						</div>
						<div class="legend-item">
							<span class="legend-color poor"></span>
							<span>Poor (&lt;50)</span>
						</div>
					</div>

					<a href="sleep/sleep-history" class="view-all">View Sleep History</a>
				{/if}
			</div>

			<!-- Quick Stats -->
			<div class="card quick-stats">
				<h2>Sleep Stats</h2>
				{#if sleepData.length === 0}
					<div class="empty-state">
						<p>No sleep data available yet.</p>
					</div>
				{:else}
					<div class="stats-grid">
						<div class="stat">
              <span class="stat-value">
                {Math.round(sleepData.reduce((sum, day) => sum + day.ouraScore, 0) / sleepData.length)}
              </span>
							<span class="stat-label">Average Score</span>
						</div>

						<div class="stat">
              <span class="stat-value">
                {Math.max(...sleepData.map(day => day.ouraScore))}
              </span>
							<span class="stat-label">Best Night</span>
						</div>

						<div class="stat">
							<span class="stat-value">{sleepData.length}</span>
							<span class="stat-label">Tracked Nights</span>
						</div>

						<div class="stat">
              <span class="stat-value">
                {Math.round(sleepData.reduce((sum, day) => {
                  // Check if we need to convert from seconds to minutes
                  if (day.metrics?.deepSleep > 500) {
                    return sum + (Math.round(day.metrics.deepSleep / 60) || 0);
                  } else {
                    return sum + (day.metrics?.deepSleep || 0);
                  }
                }, 0) / sleepData.length)}m
              </span>
							<span class="stat-label">Avg. Deep Sleep</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.dashboard-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	.dashboard-header {
		margin-bottom: 30px;
	}

	h1 {
		margin: 0 0 5px 0;
		color: #333;
		font-size: 2rem;
	}

	.sleep-message {
		color: #666;
		margin: 0;
	}

	.dashboard-grid {
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

	.loading-container, .error-container, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 30px 0;
		text-align: center;
		color: #666;
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

	.retry-button {
		margin-top: 20px;
		padding: 8px 16px;
		background-color: #60A5FA;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.sleep-score {
		display: flex;
		align-items: center;
		margin-bottom: 25px;
	}

	.score-circle {
		position: relative;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 25px;
		font-size: 2rem;
		font-weight: bold;
		color: white;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.score-circle.excellent {
		background: linear-gradient(135deg, #38a169, #48bb78);
	}

	.score-circle.good {
		background: linear-gradient(135deg, #3182ce, #4299e1);
	}

	.score-circle.fair {
		background: linear-gradient(135deg, #ecc94b, #f6e05e);
	}

	.score-circle.poor {
		background: linear-gradient(135deg, #e53e3e, #fc8181);
	}

	.score-change {
		position: absolute;
		bottom: -5px;
		right: -5px;
		background-color: white;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.score-change.positive {
		color: #38a169;
	}

	.score-change.negative {
		color: #e53e3e;
	}

	.score-change.neutral {
		color: #718096;
	}

	.score-label h3 {
		margin: 0 0 5px 0;
		font-size: 1.1rem;
	}

	.score-label p {
		margin: 0 0 10px 0;
		color: #888;
		font-size: 0.9rem;
	}

	.sleep-metrics {
		display: flex;
		gap: 20px;
		margin-top: 15px;
	}

	.metric {
		display: flex;
		flex-direction: column;
	}

	.metric-value {
		font-weight: 600;
		color: #333;
		font-size: 1.1rem;
	}

	.metric-label {
		font-size: 0.85rem;
		color: #666;
	}

	.sync-container {
		display: flex;
		align-items: center;
		margin-top: 20px;
	}

	.sync-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		background-color: #60A5FA;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.sync-button:hover:not(:disabled) {
		background-color: #3B82F6;
	}

	.sync-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.sync-button.syncing svg {
		animation: spin 1s linear infinite;
	}

	.sync-success {
		margin-left: 15px;
		color: #38a169;
		font-size: 0.9rem;
	}

	.last-sync, .sync-time {
		margin-left: 15px;
		color: #718096;
		font-size: 0.85rem;
		margin-top: 5px;
	}

	.competition-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.competition-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 0;
		border-bottom: 1px solid #eee;
	}

	.competition-item:last-child {
		border-bottom: none;
	}

	.competition-info h3 {
		margin: 0 0 5px 0;
		font-size: 1.1rem;
	}

	.competition-dates {
		margin: 0 0 3px 0;
		color: #888;
		font-size: 0.9rem;
	}

	.competition-rank {
		margin: 0;
		font-size: 0.9rem;
	}

	.rank {
		font-weight: 600;
		color: #3182ce;
	}

	.view-link {
		color: #60A5FA;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9rem;
	}

	.view-link:hover {
		text-decoration: underline;
	}

	.view-all {
		display: block;
		text-align: center;
		margin-top: 20px;
		color: #60A5FA;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9rem;
	}

	.view-all:hover {
		text-decoration: underline;
	}

	.btn {
		display: inline-block;
		padding: 10px 20px;
		background-color: #60A5FA;
		color: white;
		border: none;
		border-radius: 4px;
		font-weight: 500;
		text-decoration: none;
		text-align: center;
		transition: all 0.2s;
		margin-top: 15px;
	}

	.btn:hover {
		background-color: #3B82F6;
		transform: translateY(-3px);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
	}

	.trend-chart {
		height: 200px;
		display: flex;
		align-items: flex-end;
		gap: 10px;
		margin-bottom: 20px;
	}

	.bar-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: fadeIn 0.5s ease-out;
		animation-delay: calc(var(--index) * 0.1s);
		opacity: 0;
		animation-fill-mode: forwards;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.bar {
		width: 30px;
		height: calc(var(--height) * 1.8px);
		border-radius: 4px 4px 0 0;
		position: relative;
	}

	.bar.excellent {
		background: linear-gradient(to top, #38a169, #48bb78);
	}

	.bar.good {
		background: linear-gradient(to top, #3182ce, #4299e1);
	}

	.bar.fair {
		background: linear-gradient(to top, #ecc94b, #f6e05e);
	}

	.bar.poor {
		background: linear-gradient(to top, #e53e3e, #fc8181);
	}

	.bar-value {
		position: absolute;
		top: -25px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.85rem;
		font-weight: 600;
		color: #555;
	}

	.bar-date {
		margin-top: 10px;
		font-size: 0.85rem;
		color: #888;
	}

	.trend-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		justify-content: center;
		margin-bottom: 20px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.85rem;
		color: #666;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}

	.legend-color.excellent {
		background-color: #38a169;
	}

	.legend-color.good {
		background-color: #3182ce;
	}

	.legend-color.fair {
		background-color: #ecc94b;
	}

	.legend-color.poor {
		background-color: #e53e3e;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.stat {
		background-color: #f7fafc;
		padding: 15px;
		border-radius: 8px;
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 1.6rem;
		font-weight: 600;
		color: #333;
		margin-bottom: 5px;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #666;
	}

	.oura-banner {
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		border-radius: 12px;
		margin-bottom: 25px;
		padding: 20px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.oura-banner-content {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.oura-icon {
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.oura-icon svg {
		color: white;
	}

	.oura-banner-text {
		flex: 1;
	}

	.oura-banner-text h3 {
		color: white;
		margin: 0 0 5px 0;
		font-size: 1.2rem;
	}

	.oura-banner-text p {
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		font-size: 0.95rem;
	}

	.oura-connect-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: 500;
		padding: 10px 20px;
		background-color: white;
		color: #7C3AED;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.3s;
		font-size: 0.95rem;
	}

	.oura-connect-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(255, 255, 255, 0.3);
	}

	.oura-connect-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}

		.sleep-score {
			flex-direction: column;
			text-align: center;
		}

		.score-circle {
			margin-right: 0;
			margin-bottom: 20px;
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: 15px;
		}

		.oura-banner-content {
			flex-direction: column;
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.sleep-metrics {
			flex-direction: column;
			gap: 10px;
		}

		.trend-legend {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
