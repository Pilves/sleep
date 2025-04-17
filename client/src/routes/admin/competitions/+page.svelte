<script>
	import { onMount } from 'svelte';
	import { authUser, isAdmin } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { competitionApi } from '$lib/services/api.client.js';

	let competitions = [];
	let loading = true;
	let error = null;
	let successMessage = null;

	// Form state
	let showForm = false;
	let formMode = 'create'; // 'create' or 'edit'
	let editingCompetition = null;

	// Form fields
	let title = '';
	let description = '';
	let type = 'highest_score';
	let startDate = '';
	let endDate = '';
	let status = 'upcoming';

	const types = [
		{ value: 'highest_score', label: 'Highest Sleep Score' },
		{ value: 'improvement', label: 'Most Improved' },
		{ value: 'consistency', label: 'Most Consistent' },
		{ value: 'deep_sleep', label: 'Best Deep Sleep' },
		{ value: 'efficiency', label: 'Best Sleep Efficiency' }
	];

	const statuses = [
		{ value: 'upcoming', label: 'Upcoming' },
		{ value: 'active', label: 'Active' },
		{ value: 'completed', label: 'Completed' }
	];

	onMount(async () => {
		// Redirect if not admin
		if (!$isAdmin) {
			goto('/dashboard');
			return;
		}

		await fetchCompetitions();
	});

	async function fetchCompetitions() {
		try {
			loading = true;
			error = null;

			const response = await competitionApi.getCompetitions();
			
			// Check if response data has the expected structure
			if (response && response.data) {
				if (response.data.competitions && Array.isArray(response.data.competitions)) {
					competitions = response.data.competitions;
				} else if (Array.isArray(response.data)) {
					competitions = response.data;
				} else {
					console.error('Unexpected response structure:', response.data);
					error = 'Invalid data format from server.';
					competitions = [];
				}
			} else {
				competitions = [];
				error = 'No data received from server.';
			}
		} catch (err) {
			console.error('Error fetching competitions:', err);
			error = 'Failed to load competitions. Please try again later.';
			competitions = [];
		} finally {
			loading = false;
		}
	}

	function openCreateForm() {
		// Reset form
		title = '';
		description = '';
		type = 'highest_score';

		// Set default dates (start: tomorrow, end: 14 days later)
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		startDate = tomorrow.toISOString().split('T')[0];

		const endDay = new Date();
		endDay.setDate(endDay.getDate() + 15);
		endDate = endDay.toISOString().split('T')[0];

		status = 'upcoming';

		formMode = 'create';
		showForm = true;
		editingCompetition = null;
	}

	function openEditForm(competition) {
		title = competition.title;
		description = competition.description;
		type = competition.type;

		// Format dates for input
		const start = new Date(competition.startDate);
		startDate = start.toISOString().split('T')[0];

		const end = new Date(competition.endDate);
		endDate = end.toISOString().split('T')[0];

		status = competition.status;

		formMode = 'edit';
		showForm = true;
		editingCompetition = competition;
	}

	function closeForm() {
		showForm = false;
	}

	async function handleSubmit() {
		try {
			loading = true;
			error = null;

			const competitionData = {
				title,
				description,
				type,
				startDate: new Date(startDate).toISOString(),
				endDate: new Date(endDate).toISOString(),
				status
			};

			if (formMode === 'create') {
				await competitionApi.createCompetition(competitionData);
				successMessage = 'Competition created successfully!';
			} else {
				await competitionApi.updateCompetition(editingCompetition.id, competitionData);
				successMessage = 'Competition updated successfully!';
			}

			// Refresh competitions list
			await fetchCompetitions();

			// Close form after successful submission
			showForm = false;

			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);

		} catch (err) {
			console.error('Error saving competition:', err);
			error = err.response?.data?.message || 'Failed to save competition. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function deleteCompetition(id) {
		if (!confirm('Are you sure you want to delete this competition? This action cannot be undone.')) {
			return;
		}

		try {
			loading = true;
			error = null;

			await competitionApi.deleteCompetition(id);
			successMessage = 'Competition deleted successfully!';

			// Refresh competitions list
			await fetchCompetitions();

			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);

		} catch (err) {
			console.error('Error deleting competition:', err);
			error = err.response?.data?.message || 'Failed to delete competition. Please try again.';
		} finally {
			loading = false;
		}
	}

	function formatDate(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getStatusClass(status) {
		if (status === 'active') return 'status-active';
		if (status === 'upcoming') return 'status-upcoming';
		if (status === 'completed') return 'status-completed';
		return '';
	}

	function getStatusText(statusValue) {
		return statuses.find(s => s.value === statusValue)?.label || statusValue;
	}

	function getTypeText(typeValue) {
		return types.find(t => t.value === typeValue)?.label || typeValue;
	}
</script>

<div class="admin-container">
	<div class="admin-header">
		<h1>Manage Competitions</h1>
		<button class="btn primary" on:click={openCreateForm}>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
			Create New Competition
		</button>
	</div>

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

	{#if loading && competitions.length === 0}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading competitions...</p>
		</div>
	{:else if competitions.length === 0}
		<div class="empty-state">
			<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm14-10V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v5h14zm-8-4a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
				<path d="M4 15h2M4 15v3a2 2 0 0 0 2 2h2M4 15V5"/>
			</svg>
			<p>No competitions found.</p>
			<p>Click the "Create New Competition" button to create your first competition.</p>
		</div>
	{:else}
		<div class="competitions-table">
			<div class="table-header">
				<div class="col-title">Title</div>
				<div class="col-dates">Dates</div>
				<div class="col-type">Type</div>
				<div class="col-status">Status</div>
				<div class="col-participants">Participants</div>
				<div class="col-actions">Actions</div>
			</div>

			{#each competitions as competition}
				<div class="table-row">
					<div class="col-title">
						<h3>{competition.title}</h3>
						<p class="description-preview">
  {competition.description && typeof competition.description === 'string' ? 
    (competition.description.length > 100 ? 
      competition.description.slice(0, 100) + '...' : 
      competition.description) : 
    'No description'
  }
</p>
					</div>
					<div class="col-dates">
						<div>Start: {formatDate(competition.startDate)}</div>
						<div>End: {formatDate(competition.endDate)}</div>
					</div>
					<div class="col-type">{getTypeText(competition.type)}</div>
					<div class="col-status">
            <span class="status-badge {getStatusClass(competition.status)}">
              {getStatusText(competition.status)}
            </span>
					</div>
					<div class="col-participants">
						{competition.participants?.length || 0} users
					</div>
					<div class="col-actions">
						<button class="btn-icon edit" on:click={() => openEditForm(competition)} title="Edit">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
							</svg>
						</button>
						<button class="btn-icon delete" on:click={() => deleteCompetition(competition.id)} title="Delete">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="3 6 5 6 21 6"></polyline>
								<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
								<line x1="10" y1="11" x2="10" y2="17"></line>
								<line x1="14" y1="11" x2="14" y2="17"></line>
							</svg>
						</button>
						<a href="/admin/competitions/{competition.id}/winners" class="btn-icon winners" title="Manage Winners">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="8" r="7"></circle>
								<polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
							</svg>
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if showForm}
		<div class="modal-overlay">
			<div class="modal-content">
				<div class="modal-header">
					<h2>{formMode === 'create' ? 'Create New Competition' : 'Edit Competition'}</h2>
					<button class="close-btn" on:click={closeForm}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				<form on:submit|preventDefault={handleSubmit}>
					<div class="form-group">
						<label for="title">Title</label>
						<input
								type="text"
								id="title"
								bind:value={title}
								placeholder="Enter competition title"
								required
						/>
					</div>

					<div class="form-group">
						<label for="description">Description</label>
						<textarea
								id="description"
								bind:value={description}
								placeholder="Enter competition description"
								rows="4"
								required
						></textarea>
					</div>

					<div class="form-group">
						<label for="type">Competition Type</label>
						<select id="type" bind:value={type} required>
							{#each types as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="startDate">Start Date</label>
							<input
									type="date"
									id="startDate"
									bind:value={startDate}
									required
							/>
						</div>

						<div class="form-group">
							<label for="endDate">End Date</label>
							<input
									type="date"
									id="endDate"
									bind:value={endDate}
									required
							/>
						</div>
					</div>

					<div class="form-group">
						<label for="status">Status</label>
						<select id="status" bind:value={status} required>
							{#each statuses as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>

					<div class="form-actions">
						<button type="button" class="btn secondary" on:click={closeForm}>Cancel</button>
						<button type="submit" class="btn primary" disabled={loading}>
							{loading ? 'Saving...' : formMode === 'create' ? 'Create Competition' : 'Update Competition'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
	}

	h1 {
		margin: 0;
		color: #333;
		font-size: 2rem;
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

	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
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
		to { transform: rotate(360deg); }
	}

	.empty-state p {
		color: #666;
		margin: 5px 0;
	}

	.empty-state svg {
		margin-bottom: 20px;
		color: #aaa;
	}

	.competitions-table {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.table-header {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
		gap: 15px;
		background-color: #f0f0f0;
		font-weight: bold;
		color: #555;
		padding: 15px;
	}

	.table-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
		gap: 15px;
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

	.col-title h3 {
		margin: 0 0 5px 0;
		font-size: 1.1rem;
	}

	.description-preview {
		margin: 0;
		color: #777;
		font-size: 0.9rem;
	}

	.status-badge {
		display: inline-block;
		padding: 5px 10px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.status-active {
		background-color: #e6fffa;
		color: #38b2ac;
	}

	.status-upcoming {
		background-color: #ebf8ff;
		color: #3182ce;
	}

	.status-completed {
		background-color: #f0f0f0;
		color: #718096;
	}

	.btn-icon {
		background: none;
		border: none;
		cursor: pointer;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: background-color 0.2s;
	}

	.btn-icon:hover {
		background-color: #f0f0f0;
	}

	.btn-icon.edit svg {
		color: #3182ce;
	}

	.btn-icon.delete svg {
		color: #e53e3e;
	}

	.btn-icon.winners svg {
		color: #d69e2e;
	}

	.col-actions {
		display: flex;
		gap: 5px;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background-color: white;
		border-radius: 12px;
		width: 90%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #eee;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.4rem;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #777;
	}

	.close-btn:hover {
		color: #333;
	}

	form {
		padding: 20px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
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

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 15px;
		margin-top: 25px;
	}

	@media (max-width: 768px) {
		.table-header, .table-row {
			grid-template-columns: 2fr 1fr 1fr;
		}

		.col-dates, .col-type, .col-participants {
			display: none;
		}

		.form-row {
			grid-template-columns: 1fr;
			gap: 15px;
		}
	}

</style>
