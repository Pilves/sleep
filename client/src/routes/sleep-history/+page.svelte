<script>
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/authStore';
	import { sleepApi } from '$lib/services/api.client.js';

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
		await fetchSleepData(timeRange);
	});

	async function fetchSleepData(range) {
		if (!$authUser) return;

		try {
			loading = true;
			error = null;

			const days = range === '7days' ? 7 :
					range === '14days' ? 14 :
							range === '30days' ? 30 : 90;

			// Use the sleepApi client from our structured API
			const response = await sleepApi.getSleepData({ days });
			console.log('Sleep API response:', response);
			
			// Handle different response formats
			if (response.data && response.data.sleepData && Array.isArray(response.data.sleepData)) {
				// Handle the format from the example JSON
				sleepData = response.data.sleepData;
				console.log('Using response.data.sleepData structure with', sleepData.length, 'items');
			} 
			// Handle other potential formats
			else if (response.data && Array.isArray(response.data)) {
				sleepData = response.data;
				console.log('Using response.data array structure');
			} 
			else if (response.data && response.data.data && Array.isArray(response.data.data)) {
				sleepData = response.data.data;
				console.log('Using response.data.data structure');
			} 
			else if (response.data) {
				// Convert to array if it's an object with keys
				if (typeof response.data === 'object' && !Array.isArray(response.data)) {
					sleepData = Object.values(response.data);
					console.log('Using Object.values(response.data) structure');
				} else {
					console.warn('Unrecognized data structure, initializing empty array');
					sleepData = [];
				}
			} 
			else {
				// Initialize to empty array if no valid data format found
				console.warn('Unexpected sleep data format:', response.data);
				sleepData = [];
			}
			
			// Convert sleep durations from seconds to minutes for display
			if (sleepData && Array.isArray(sleepData)) {
				sleepData = sleepData.map(day => {
					if (day && day.metrics) {
						// Convert seconds to minutes for easier display
						const metrics = { ...day.metrics };
						
						// Check if the values are in seconds (greater than 500)
						if (metrics.deepSleep > 500) {
							metrics.deepSleep = Math.round(metrics.deepSleep / 60);
						}
						
						if (metrics.remSleep > 500) {
							metrics.remSleep = Math.round(metrics.remSleep / 60);
						}
						
						if (metrics.lightSleep > 500) {
							metrics.lightSleep = Math.round(metrics.lightSleep / 60);
						}
						
						if (metrics.totalSleepTime > 500) {
							metrics.totalSleepTime = Math.round(metrics.totalSleepTime / 60);
						}
						
						return {
							...day,
							metrics
						};
					}
					return day;
				});
			}
			
			// Log the final data structure for debugging
			console.log('Final sleepData structure:', 
				sleepData && sleepData.length ? 
					`Array with ${sleepData.length} items` : 
					'Empty array');
			
			if (sleepData && sleepData.length > 0) {
				console.log('First item sample:', sleepData[0]);
			}

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

	function getScoreText(score) {
		if (score >= 85) return 'Excellent';
		if (score >= 70) return 'Good';
		if (score >= 50) return 'Fair';
		return 'Poor';
	}
	
	// Helper functions for calculations
	function getAverageSleepScore() {
		if (!Array.isArray(sleepData) || sleepData.length === 0) return 0;
		return Math.round(sleepData.reduce((sum, day) => sum + (day?.ouraScore || 0), 0) / sleepData.length);
	}
	
	function getAverageSleepDuration() {
		if (!Array.isArray(sleepData) || sleepData.length === 0) return { hours: 0, minutes: 0 };
		
		// Calculate total sleep time, converting if needed
		const totalMinutes = Math.round(sleepData.reduce((sum, day) => {
			if (!day?.metrics?.totalSleepTime) return sum;
			
			// Check if data is in seconds (greater than 500)
			if (day.metrics.totalSleepTime > 500) {
				// Convert seconds to minutes
				return sum + Math.round(day.metrics.totalSleepTime / 60);
			} else {
				// Already in minutes
				return sum + day.metrics.totalSleepTime;
			}
		}, 0) / sleepData.length);
		
		return {
			hours: Math.floor(totalMinutes / 60),
			minutes: totalMinutes % 60
		};
	}
	
	function getAverageDeepSleep() {
		if (!Array.isArray(sleepData) || sleepData.length === 0) return 0;
		
		// Calculate total deep sleep, converting if needed
		return Math.round(sleepData.reduce((sum, day) => {
			if (!day?.metrics?.deepSleep) return sum;
			
			// Check if data is in seconds (greater than 500)
			if (day.metrics.deepSleep > 500) {
				// Convert seconds to minutes
				return sum + Math.round(day.metrics.deepSleep / 60);
			} else {
				// Already in minutes
				return sum + day.metrics.deepSleep;
			}
		}, 0) / sleepData.length);
	}
	
	function getBestSleepScore() {
		if (!Array.isArray(sleepData) || sleepData.length === 0) return { score: 0, date: null };
		
		const scores = sleepData.map(day => day?.ouraScore || 0);
		const maxScore = Math.max(...scores);
		const bestDay = sleepData.find(day => day?.ouraScore === maxScore);
		
		return {
			score: maxScore,
			date: bestDay?.date || null
		};
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
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<p>{error}</p>
			<button on:click={() => fetchSleepData(timeRange)} class="btn primary">Retry</button>
		</div>
	{:else if !Array.isArray(sleepData) || sleepData.length === 0}
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
			<p>No sleep data available for the selected time range.</p>
			<p>If you're using an Oura Ring, data will appear here once you've recorded some sleep.</p>
			<button on:click={() => fetchSleepData(timeRange)} class="btn primary">Refresh Data</button>
		</div>
	{:else}
		<!-- Sleep Data Visualization -->
		<div class="visualization-card">
			<h2>Sleep Score Trend</h2>
			<div class="trend-chart">
				{#each [...sleepData].reverse() as day, i}
					<div
							class="trend-bar-container"
							style="--index: {i}; --total: {sleepData.length}"
					>
						<div
								class="trend-bar {getScoreClass(day.ouraScore || 0)}"
								style="--height: {day.ouraScore || 0}%"
						>
							<span class="trend-value">{day.ouraScore || 0}</span>
						</div>
						<div class="trend-date">{day.date ? new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '?'}</div>
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
					<span>Poor (&lt;50)</span>
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

				{#each [...sleepData].reverse() as day}
					<div class="table-row">
						<div class="date-column">{formatDate(day.date)}</div>
						<div class="score-column">
							<div class="score-pill {getScoreClass(day.ouraScore || 0)}">{day.ouraScore || 0}</div>
						</div>
						<div class="duration-column">
							{Math.floor((day.metrics?.totalSleepTime || 0) / 60)}h {(day.metrics?.totalSleepTime || 0) % 60}m
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
						{getAverageSleepScore()}
					</div>
				</div>

				<div class="stat-item">
					<h3>Average Sleep Duration</h3>
					<div class="stat-value">
						{getAverageSleepDuration().hours}h {getAverageSleepDuration().minutes}m
					</div>
				</div>

				<div class="stat-item">
					<h3>Best Sleep Score</h3>
					<div class="stat-value">{getBestSleepScore().score}</div>
					{#if getBestSleepScore().date}
						<div class="stat-date">
							on {formatDate(getBestSleepScore().date)}
						</div>
					{/if}
				</div>

				<div class="stat-item">
					<h3>Average Deep Sleep</h3>
					<div class="stat-value">
						{getAverageDeepSleep()}m
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
		font-size: 2rem;
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
		margin-top: 20px;
	}

	.btn.primary {
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		color: white;
	}

	.btn.primary:hover {
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
		animation: fadeIn 0.5s forwards;
		animation-delay: calc(var(--index) * 0.1s);
		opacity: 0;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
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

	@media (max-width: 768px) {
		.table-header, .table-row {
			grid-template-columns: 2fr 1fr 1fr 1fr;
		}

		.deep-column, .rem-column {
			display: none;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.trend-chart {
			height: 200px;
		}

		.trend-bar {
			width: 20px;
		}

		.chart-legend {
			flex-direction: column;
			align-items: flex-start;
			margin-left: 20px;
		}

		.range-selector {
			width: 100%;
			flex-direction: column;
			align-items: flex-start;
		}

		.range-selector select {
			width: 100%;
		}
	}
</style>