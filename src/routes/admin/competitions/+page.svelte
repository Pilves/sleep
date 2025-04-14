<script>
	import { onMount } from 'svelte';
	import { authUser, isAdmin } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import api from '$lib/services/api.client.js';
	
	let competitions = [];
	let loading = true;
	let error = null;
	
	// Form state
	let showForm = false;
	let formMode = 'create'; // 'create' or 'edit'
	let editingCompetition = null;
	let successMessage = null;
	
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
			
			const response = await api.get('/competitions');
			competitions = response.data;
		} catch (err) {
			console.error('Error fetching competitions:', err);
			error = 'Failed to load competitions. Please try again later.';
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
				await api.post('/competitions', competitionData);
				successMessage = 'Competition created successfully!';
			} else {
				await api.put(`/competitions/${editingCompetition.id}`, competitionData);
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
			
			await api.delete(`/competitions/${id}`);
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
</script>

<div class="admin-container">
	<div class="admin-header">
		<h1>Competition Management</h1>
		<button class="btn primary" on:click={openCreateForm}>Create New Competition</button>
	</div>
	
	{#if successMessage}
		<div class="success-message">
			{successMessage}
		</div>
	{/if}
	
	{#if error}
		<div class="error-message">
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
						<p class="description-preview">{competition.description.slice(0, 100)}{competition.description.length > 100 ? '...' : ''}</p>
					</div>
					<div class="col-dates">
						<div>Start: {formatDate(competition.startDate)}</div>
						<div>End: {formatDate(competition.endDate)}</div>
					</div>
					<div class="col-type">{competition.type}</div>
					<div class="col-status">
						<span class="status-badge {getStatusClass(competition.status)}">
							{competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
						</span>
					</div>
					<div class="col-participants">
						{competition.participants?.length || 0} users
					</div>
					<div class="col-actions">
						<button class="btn-icon edit" on:click={() => openEditForm(competition)} title="Edit">
							✏️
						</button>
						<button class="btn-icon delete" on:click={() => deleteCompetition(competition.id)} title="Delete">
							🗑️
						</button>
						<a href="/admin/competitions/{competition.id}/winners" class="btn-icon winners" title="Manage Winners">
							🏆
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
					<button class="close-btn" on:click={closeForm}>&times;</button>
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
		padding: 20px;
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
	}
	
	.btn {
		padding: 10px 20px;
		border-radius: 6px;
		font-weight: bold;
		text-decoration: none;
		font-size: 0.9rem;
		transition: all 0.3s ease;
		border: none;
		cursor: pointer;
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
	
	.success-message {
		background-color: #f0fff4;
		color: #38a169;
		padding: 15px;
		border-radius: 6px;
		margin-bottom: 20px;
		border-left: 4px solid #38a169;
	}
	
	.error-message {
		background-color: #fff8f8;
		color: #e74c3c;
		padding: 15px;
		border-radius: 6px;
		margin-bottom: 20px;
		border-left: 4px solid #e74c3c;
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
		border: 4px solid rgba(110, 142, 251, 0.2);
		border-radius: 50%;
		border-top-color: #6e8efb;
		animation: spin 1s linear infinite;
		margin-bottom: 20px;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.empty-state p {
		color: #888;
		margin: 10px 0;
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
		font-size: 1.2rem;
		padding: 5px;
		margin-right: 10px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}
	
	.btn-icon:hover {
		background-color: #f0f0f0;
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
		font-size: 1.5rem;
		cursor: pointer;
		color: #777;
	}
	
	form {
		padding: 20px;
	}
	
	.form-group {
		margin-bottom: 20px;
	}
	
	.form-row {
		display: flex;
		gap: 20px;
	}
	
	.form-row .form-group {
		flex: 1;
	}
	
	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #555;
	}
	
	input, select, textarea {
		width: 100%;
		padding: 12px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
		transition: border-color 0.3s;
	}
	
	input:focus, select:focus, textarea:focus {
		border-color: #6e8efb;
		outline: none;
	}
	
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 15px;
		margin-top: 30px;
	}
</style>