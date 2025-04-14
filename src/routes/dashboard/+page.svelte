<script>
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/authStore';
	import api from '$lib/services/api.client.js';
	
	let sleepData = [];
	let competitions = [];
	let loading = true;
	let error = null;
	
	onMount(async () => {
		if (!$authUser) return;
		
		try {
			loading = true;
			// Fetch user's sleep data (recent 7 days)
			const sleepResponse = await api.get('/sleep/data?days=7');
			sleepData = sleepResponse.data;
			
			// Fetch active competitions
			const competitionsResponse = await api.get('/competitions?status=active');
			competitions = competitionsResponse.data;
		} catch (err) {
			console.error('Error fetching dashboard data:', err);
			error = 'Failed to load dashboard data. Please try again later.';
		} finally {
			loading = false;
		}
	});
	
	function formatDate(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<div class="dashboard">
	<h1>Sleep Dashboard</h1>
	
	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading your sleep data...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<p>{error}</p>
			<button on:click={() => window.location.reload()}>Retry</button>
		</div>
	{:else}
		<div class="dashboard-grid">
			<!-- Sleep Summary Card -->
			<div class="card sleep-summary">
				<h2>Recent Sleep Quality</h2>
				{#if sleepData.length === 0}
					<p class="no-data">No sleep data available. Connect your Oura Ring to start tracking.</p>
					<a href="/profile" class="btn primary">Connect Oura Ring</a>
				{:else}
					<div class="sleep-score">
						<div class="score-circle" style="--score: {sleepData[0]?.ouraScore || 0}%">
							<span>{sleepData[0]?.ouraScore || 0}</span>
						</div>
						<div class="score-label">
							<h3>Latest Sleep Score</h3>
							<p>{formatDate(sleepData[0]?.date)}</p>
						</div>
					</div>
					
					<div class="sleep-metrics">
						<div class="metric">
							<span class="metric-value">{sleepData[0]?.metrics?.totalSleepTime || 0}</span>
							<span class="metric-label">Total Sleep (min)</span>
						</div>
						<div class="metric">
							<span class="metric-value">{sleepData[0]?.metrics?.efficiency || 0}%</span>
							<span class="metric-label">Efficiency</span>
						</div>
						<div class="metric">
							<span class="metric-value">{sleepData[0]?.metrics?.deepSleep || 0}</span>
							<span class="metric-label">Deep Sleep (min)</span>
						</div>
					</div>
					
					<a href="/sleep-history" class="view-all">View Sleep History</a>
				{/if}
			</div>
			
			<!-- Active Competitions Card -->
			<div class="card competitions">
				<h2>Active Competitions</h2>
				{#if competitions.length === 0}
					<p class="no-data">You're not participating in any competitions.</p>
					<a href="/competitions" class="btn primary">Join a Competition</a>
				{:else}
					<ul class="competition-list">
						{#each competitions as competition}
							<li class="competition-item">
								<div class="competition-info">
									<h3>{competition.title}</h3>
									<p class="dates">
										{formatDate(competition.startDate)} - {formatDate(competition.endDate)}
									</p>
								</div>
								<a href="/competitions/{competition.id}" class="btn secondary">View</a>
							</li>
						{/each}
					</ul>
					<a href="/competitions" class="view-all">View All Competitions</a>
				{/if}
			</div>
			
			<!-- Sleep Trend Preview -->
			<div class="card sleep-trend">
				<h2>Sleep Trend</h2>
				{#if sleepData.length < 3}
					<p class="no-data">Not enough data to show trends. Keep tracking your sleep!</p>
				{:else}
					<div class="trend-chart">
						<!-- Placeholder for a chart - we would implement with a charting library -->
						<div class="chart-placeholder">
							<div class="bar-container">
								{#each sleepData.slice(0, 7).reverse() as day}
									<div class="bar-wrapper">
										<div class="bar" style="--height: {day.ouraScore}%"></div>
										<span class="date-label">{new Date(day.date).getDate()}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Quick Stats -->
			<div class="card quick-stats">
				<h2>Your Sleep Stats</h2>
				{#if sleepData.length === 0}
					<p class="no-data">No sleep data available yet.</p>
				{:else}
					<div class="stats-grid">
						<div class="stat">
							<span class="stat-label">Average Score</span>
							<span class="stat-value">
								{Math.round(sleepData.reduce((sum, day) => sum + day.ouraScore, 0) / sleepData.length)}
							</span>
						</div>
						<div class="stat">
							<span class="stat-label">Best Night</span>
							<span class="stat-value">
								{Math.max(...sleepData.map(day => day.ouraScore))}
							</span>
						</div>
						<div class="stat">
							<span class="stat-label">Tracked Nights</span>
							<span class="stat-value">{sleepData.length}</span>
						</div>
						<div class="stat">
							<span class="stat-label">Avg. Deep Sleep</span>
							<span class="stat-value">
								{Math.round(sleepData.reduce((sum, day) => sum + (day.metrics?.deepSleep || 0), 0) / sleepData.length)} min
							</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}
	
	h1 {
		margin-bottom: 30px;
		color: #333;
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
	
	.no-data {
		color: #888;
		text-align: center;
		margin: 25px 0;
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
		background: conic-gradient(#6e8efb 0% var(--score), #eee var(--score) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20px;
	}
	
	.score-circle::before {
		content: '';
		position: absolute;
		width: 85px;
		height: 85px;
		border-radius: 50%;
		background: white;
	}
	
	.score-circle span {
		position: relative;
		font-size: 1.8rem;
		font-weight: bold;
		color: #333;
	}
	
	.score-label h3 {
		margin: 0 0 5px 0;
		font-size: 1.1rem;
	}
	
	.score-label p {
		margin: 0;
		color: #888;
	}
	
	.sleep-metrics {
		display: flex;
		justify-content: space-between;
		margin-bottom: 25px;
	}
	
	.metric {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}
	
	.metric-value {
		font-size: 1.4rem;
		font-weight: bold;
		color: #333;
		margin-bottom: 5px;
	}
	
	.metric-label {
		font-size: 0.9rem;
		color: #888;
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
	
	.dates {
		margin: 0;
		color: #888;
		font-size: 0.9rem;
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
	
	.secondary {
		background-color: transparent;
		color: #6e8efb;
		border: 1px solid #6e8efb;
	}
	
	.secondary:hover {
		background-color: rgba(110, 142, 251, 0.1);
	}
	
	.view-all {
		display: block;
		text-align: center;
		color: #6e8efb;
		text-decoration: none;
		margin-top: 15px;
		font-weight: 500;
	}
	
	.view-all:hover {
		text-decoration: underline;
	}
	
	.chart-placeholder {
		height: 200px;
		width: 100%;
		display: flex;
		align-items: flex-end;
		background: #f9f9f9;
		border-radius: 8px;
		padding: 15px;
	}
	
	.bar-container {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		width: 100%;
		height: 100%;
	}
	
	.bar-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		flex: 1;
	}
	
	.bar {
		width: 30px;
		height: calc(var(--height) * 1%);
		background: linear-gradient(to top, #6e8efb, #a777e3);
		border-radius: 4px 4px 0 0;
	}
	
	.date-label {
		font-size: 0.8rem;
		color: #888;
		margin-top: 5px;
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}
	
	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 15px;
		background: #f9f9f9;
		border-radius: 8px;
	}
	
	.stat-label {
		font-size: 0.9rem;
		color: #888;
		margin-bottom: 5px;
	}
	
	.stat-value {
		font-size: 1.6rem;
		font-weight: bold;
		color: #333;
	}
</style>