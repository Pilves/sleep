<script>
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/authStore';
	import api from '$lib/services/api.client.js';
	
	let sleepData = [];
	let loading = true;
	let error = null;
	let timeRange = '7days'; // default to last 7 days
	
	// Filter options
	const timeRanges = [
		{ value: '7days', label: 'Last 7 Days' },
		{ value: '14days', label: 'Last 14 Days' },
		{ value: '30days', label: 'Last 30 Days' },
		{ value: '90days', label: 'Last 90 Days' }
	];
	
	onMount(async () => {
		fetchSleepData(timeRange);
	});
	
	async function fetchSleepData(range) {
		if (!$authUser) return;
		
		try {
			loading = true;
			error = null;
			
			const days = range === '7days' ? 7 : 
						 range === '14days' ? 14 : 
						 range === '30days' ? 30 : 90;
			
			const response = await api.get(`/sleep/data?days=${days}`);
			sleepData = response.data;
			
		} catch (err) {
			console.error('Error fetching sleep data:', err);
			error = 'Failed to load sleep history. Please try again later.';
		} finally {
			loading = false;
		}
	}
	
	function handleRangeChange(event) {
		timeRange = event.target.value;
		fetchSleepData(timeRange);
	}
	
	function formatDate(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
	
	function getScoreClass(score) {
		if (score >= 85) return 'excellent';
		if (score >= 70) return 'good';
		if (score >= 50) return 'fair';
		return 'poor';
	}
</script>

<div class="sleep-history-container">
	<h1>Sleep History</h1>
	
	<div class="filter-controls">
		<div class="range-selector">
			<label for="time-range">Time Range:</label>
			<select id="time-range" bind:value={timeRange} on:change={handleRangeChange}>
				{#each timeRanges as range}
					<option value={range.value}>{range.label}</option>
				{/each}
			</select>
		</div>
	</div>
	
	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading your sleep data...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<p>{error}</p>
			<button on:click={() => fetchSleepData(timeRange)}>Retry</button>
		</div>
	{:else if sleepData.length === 0}
		<div class="empty-state">
			<p>No sleep data available for the selected time range.</p>
			<p>Connect your Oura Ring on the profile page to start tracking your sleep!</p>
			<a href="/profile" class="btn primary">Go to Profile</a>
		</div>
	{:else}
		<!-- Sleep Data Visualization -->
		<div class="visualization-card">
			<h2>Sleep Score Trend</h2>
			<div class="trend-chart">
				{#each sleepData.slice().reverse() as day, i}
					<div 
						class="trend-bar-container" 
						style="--index: {i}; --total: {sleepData.length}"
					>
						<div 
							class="trend-bar {getScoreClass(day.ouraScore)}" 
							style="--height: {day.ouraScore}%"
						>
							<span class="trend-value">{day.ouraScore}</span>
						</div>
						<div class="trend-date">{new Date(day.date).getDate()}</div>
					</div>
				{/each}
			</div>
			<div class="chart-legend">
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
					<span>Poor (<50)</span>
				</div>
			</div>
		</div>
		
		<!-- Detailed Sleep Records -->
		<div class="sleep-records-card">
			<h2>Detailed Sleep Records</h2>
			<div class="records-table">
				<div class="table-header">
					<div class="date-column">Date</div>
					<div class="score-column">Sleep Score</div>
					<div class="duration-column">Duration</div>
					<div class="efficiency-column">Efficiency</div>
					<div class="deep-column">Deep Sleep</div>
					<div class="rem-column">REM Sleep</div>
				</div>
				
				{#each sleepData as day}
					<div class="table-row">
						<div class="date-column">{formatDate(day.date)}</div>
						<div class="score-column">
							<div class="score-pill {getScoreClass(day.ouraScore)}">{day.ouraScore}</div>
						</div>
						<div class="duration-column">
							{Math.floor(day.metrics?.totalSleepTime / 60)}h {day.metrics?.totalSleepTime % 60}m
						</div>
						<div class="efficiency-column">{day.metrics?.efficiency || 0}%</div>
						<div class="deep-column">{day.metrics?.deepSleep || 0}m</div>
						<div class="rem-column">{day.metrics?.remSleep || 0}m</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Sleep Stats Summary -->
		<div class="sleep-stats-card">
			<h2>Sleep Statistics</h2>
			<div class="stats-grid">
				<div class="stat-item">
					<h3>Average Sleep Score</h3>
					<div class="stat-value">
						{Math.round(sleepData.reduce((sum, day) => sum + day.ouraScore, 0) / sleepData.length)}
					</div>
				</div>
				
				<div class="stat-item">
					<h3>Average Sleep Duration</h3>
					<div class="stat-value">
						{Math.floor(sleepData.reduce((sum, day) => sum + (day.metrics?.totalSleepTime || 0), 0) / sleepData.length / 60)}h 
						{Math.round(sleepData.reduce((sum, day) => sum + (day.metrics?.totalSleepTime || 0), 0) / sleepData.length % 60)}m
					</div>
				</div>
				
				<div class="stat-item">
					<h3>Best Sleep Score</h3>
					<div class="stat-value">{Math.max(...sleepData.map(day => day.ouraScore))}</div>
					<div class="stat-date">
						on {formatDate(sleepData.find(day => day.ouraScore === Math.max(...sleepData.map(d => d.ouraScore))).date)}
					</div>
				</div>
				
				<div class="stat-item">
					<h3>Average Deep Sleep</h3>
					<div class="stat-value">
						{Math.round(sleepData.reduce((sum, day) => sum + (day.metrics?.deepSleep || 0), 0) / sleepData.length)}m
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.sleep-history-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 20px;
	}
	
	h1 {
		margin-bottom: 30px;
		color: #333;
	}
	
	h2 {
		margin-top: 0;
		margin-bottom: 20px;
		color: #444;
		font-size: 1.4rem;
	}
	
	h3 {
		margin: 0 0 10px 0;
		color: #555;
		font-size: 1rem;
		font-weight: 500;
	}
	
	.filter-controls {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 25px;
	}
	
	.range-selector {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.range-selector label {
		font-weight: 500;
		color: #555;
	}
	
	.range-selector select {
		padding: 8px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		background-color: white;
		font-size: 0.9rem;
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
	
	.empty-state p {
		color: #888;
		margin: 10px 0;
	}
	
	.btn {
		padding: 12px 24px;
		border-radius: 6px;
		font-weight: bold;
		text-decoration: none;
		font-size: 0.9rem;
		transition: all 0.3s ease;
		display: inline-block;
		margin-top: 20px;
	}
	
	.primary {
		background: linear-gradient(135deg, #6e8efb, #a777e3);
		color: white;
	}
	
	.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}
	
	.visualization-card, .sleep-records-card, .sleep-stats-card {
		background: white;
		border-radius: 12px;
		padding: 25px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		margin-bottom: 30px;
	}
	
	.trend-chart {
		display: flex;
		align-items: flex-end;
		height: 250px;
		gap: 5px;
		padding: 10px 0;
		overflow-x: auto;
	}
	
	.trend-bar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		min-width: 30px;
	}
	
	.trend-bar {
		width: 30px;
		height: calc(var(--height) * 2px);
		border-radius: 4px 4px 0 0;
		position: relative;
	}
	
	.trend-value {
		position: absolute;
		top: -25px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.8rem;
		font-weight: bold;
		color: #666;
	}
	
	.trend-date {
		margin-top: 10px;
		font-size: 0.9rem;
		color: #888;
	}
	
	.excellent {
		background: linear-gradient(to top, #38a169, #48bb78);
	}
	
	.good {
		background: linear-gradient(to top, #3182ce, #4299e1);
	}
	
	.fair {
		background: linear-gradient(to top, #ecc94b, #f6e05e);
	}
	
	.poor {
		background: linear-gradient(to top, #e53e3e, #fc8181);
	}
	
	.chart-legend {
		display: flex;
		justify-content: center;
		gap: 20px;
		margin-top: 20px;
		flex-wrap: wrap;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.9rem;
		color: #666;
	}
	
	.legend-color {
		width: 15px;
		height: 15px;
		border-radius: 3px;
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
	
	.records-table {
		width: 100%;
		overflow-x: auto;
	}
	
	.table-header {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
		gap: 10px;
		background-color: #f0f0f0;
		font-weight: bold;
		color: #555;
		padding: 15px;
		border-radius: 8px 8px 0 0;
	}
	
	.table-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
		gap: 10px;
		padding: 15px;
		border-bottom: 1px solid #eee;
		align-items: center;
	}
	
	.table-row:last-child {
		border-bottom: none;
	}
	
	.table-row:hover {
		background-color: #f9f9f9;
	}
	
	.score-pill {
		display: inline-block;
		padding: 5px 10px;
		border-radius: 15px;
		font-weight: bold;
		color: white;
		font-size: 0.9rem;
		text-align: center;
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
	}
	
	.stat-item {
		background-color: #f9f9f9;
		padding: 20px;
		border-radius: 8px;
		text-align: center;
	}
	
	.stat-value {
		font-size: 2rem;
		font-weight: bold;
		color: #333;
		margin: 10px 0;
	}
	
	.stat-date {
		font-size: 0.9rem;
		color: #888;
	}
</style>