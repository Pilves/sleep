<script>
	import { onMount } from 'svelte';
	import { authUser, isAdmin } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import api from '$lib/services/api.client.js';
	
	let invitations = [];
	let loading = true;
	let error = null;
	let successMessage = null;
	
	// Form state
	let showCreateForm = false;
	let emails = '';
	let expirationDays = 7;
	
	// Filters
	let statusFilter = 'all';
	
	onMount(async () => {
		// Redirect if not admin
		if (!$isAdmin) {
			goto('/dashboard');
			return;
		}
		
		await fetchInvitations();
	});
	
	async function fetchInvitations() {
		try {
			loading = true;
			error = null;
			
			// Build query params
			const params = new URLSearchParams();
			
			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}
			
			const response = await api.get(`/invitations?${params.toString()}`);
			invitations = response.data;
		} catch (err) {
			console.error('Error fetching invitations:', err);
			error = 'Failed to load invitations. Please try again later.';
		} finally {
			loading = false;
		}
	}
	
	function handleFilterChange() {
		fetchInvitations();
	}
	
	function showForm() {
		showCreateForm = true;
	}
	
	function hideForm() {
		showCreateForm = false;
	}
	
	async function sendInvitations() {
		try {
			loading = true;
			error = null;
			
			// Split and trim emails
			const emailList = emails.split(',').map(email => email.trim()).filter(email => email !== '');
			
			if (emailList.length === 0) {
				error = 'Please enter at least one email address.';
				loading = false;
				return;
			}
			
			await api.post('/invitations', {
				emails: emailList,
				expirationDays
			});
			
			// Reset form
			emails = '';
			
			// Hide form
			showCreateForm = false;
			
			// Show success message
			successMessage = `Invitations sent successfully to ${emailList.length} email${emailList.length > 1 ? 's' : ''}!`;
			
			// Refresh invitations list
			await fetchInvitations();
			
			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
			
		} catch (err) {
			console.error('Error sending invitations:', err);
			error = err.response?.data?.message || 'Failed to send invitations. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	async function resendInvitation(invitationId) {
		try {
			loading = true;
			error = null;
			
			// This endpoint needs to be added to the server
			await api.post(`/invitations/${invitationId}/resend`);
			
			// Show success message
			successMessage = 'Invitation resent successfully!';
			
			// Refresh invitations list
			await fetchInvitations();
			
			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
			
		} catch (err) {
			console.error('Error resending invitation:', err);
			error = err.response?.data?.message || 'Failed to resend invitation. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	async function revokeInvitation(invitationId) {
		if (!confirm('Are you sure you want to revoke this invitation? This action cannot be undone.')) {
			return;
		}
		
		try {
			loading = true;
			error = null;
			
			// This should be updated to match the server endpoint
			await api.put(`/invitations/${invitationId}/revoke`);
			
			// Show success message
			successMessage = 'Invitation revoked successfully!';
			
			// Refresh invitations list
			await fetchInvitations();
			
			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
			
		} catch (err) {
			console.error('Error revoking invitation:', err);
			error = err.response?.data?.message || 'Failed to revoke invitation. Please try again.';
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
		if (status === 'accepted') return 'status-accepted';
		if (status === 'sent') return 'status-sent';
		if (status === 'expired') return 'status-expired';
		return '';
	}
	
	function isExpired(expirationDate) {
		return new Date(expirationDate) < new Date();
	}
	
	function getDaysRemaining(expirationDate) {
		const today = new Date();
		const expDate = new Date(expirationDate);
		const diffTime = expDate - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	}
</script>

<div class="admin-container">
	<div class="admin-header">
		<h1>Invitation Management</h1>
		<button class="btn primary" on:click={showForm}>Send New Invitations</button>
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
	
	{#if showCreateForm}
		<div class="invitation-form-card">
			<div class="form-header">
				<h2>Send New Invitations</h2>
				<button class="close-btn" on:click={hideForm}>&times;</button>
			</div>
			
			<form on:submit|preventDefault={sendInvitations}>
				<div class="form-group">
					<label for="emails">Email Addresses</label>
					<textarea
						id="emails"
						bind:value={emails}
						placeholder="Enter email addresses separated by commas"
						rows="4"
						required
					></textarea>
					<small>You can enter multiple email addresses separated by commas</small>
				</div>
				
				<div class="form-group">
					<label for="expirationDays">Invitation Expiration</label>
					<select id="expirationDays" bind:value={expirationDays}>
						<option value={3}>3 days</option>
						<option value={7}>7 days</option>
						<option value={14}>14 days</option>
						<option value={30}>30 days</option>
					</select>
				</div>
				
				<div class="form-actions">
					<button type="button" class="btn secondary" on:click={hideForm}>Cancel</button>
					<button type="submit" class="btn primary" disabled={loading}>
						{loading ? 'Sending...' : 'Send Invitations'}
					</button>
				</div>
			</form>
		</div>
	{/if}
	
	<div class="filters-container">
		<div class="filter-group">
			<label for="status-filter">Status:</label>
			<select id="status-filter" bind:value={statusFilter} on:change={handleFilterChange}>
				<option value="all">All Statuses</option>
				<option value="sent">Pending</option>
				<option value="accepted">Accepted</option>
				<option value="expired">Expired</option>
			</select>
		</div>
	</div>
	
	{#if loading && invitations.length === 0}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading invitations...</p>
		</div>
	{:else if invitations.length === 0}
		<div class="empty-state">
			<p>No invitations found.</p>
			<p>Click "Send New Invitations" to invite users to the platform.</p>
		</div>
	{:else}
		<div class="invitations-table">
			<div class="table-header">
				<div class="col-email">Email</div>
				<div class="col-dates">Dates</div>
				<div class="col-status">Status</div>
				<div class="col-code">Invitation Code</div>
				<div class="col-invitedby">Invited By</div>
				<div class="col-actions">Actions</div>
			</div>
			
			{#each invitations as invitation}
				<div class="table-row">
					<div class="col-email">{invitation.email}</div>
					
					<div class="col-dates">
						<div>Sent: {formatDate(invitation.createdAt)}</div>
						<div>Expires: {formatDate(invitation.expiresAt)}</div>
						{#if invitation.status === 'sent' && !isExpired(invitation.expiresAt)}
							<div class="days-remaining">
								{getDaysRemaining(invitation.expiresAt)} days remaining
							</div>
						{/if}
					</div>
					
					<div class="col-status">
						<span class="status-badge {getStatusClass(invitation.status)}">
							{invitation.status === 'sent' ? 'Pending' : invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
						</span>
					</div>
					
					<div class="col-code">
						<span class="invitation-code">{invitation.code}</span>
						<button class="copy-btn" on:click={() => navigator.clipboard.writeText(invitation.code)} title="Copy code">
							📋
						</button>
					</div>
					
					<div class="col-invitedby">
						{invitation.invitedBy || 'System'}
					</div>
					
					<div class="col-actions">
						{#if invitation.status === 'sent'}
							<button 
								class="btn-icon resend" 
								on:click={() => resendInvitation(invitation.id)}
								title="Resend Invitation"
							>
								📤
							</button>
							<button 
								class="btn-icon revoke" 
								on:click={() => revokeInvitation(invitation.id)}
								title="Revoke Invitation"
							>
								❌
							</button>
						{:else}
							<span class="no-actions">No actions available</span>
						{/if}
					</div>
				</div>
			{/each}
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
	
	.invitation-form-card {
		background: white;
		border-radius: 12px;
		padding: 25px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		margin-bottom: 30px;
	}
	
	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}
	
	.form-header h2 {
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
	
	.form-group {
		margin-bottom: 20px;
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
	
	small {
		display: block;
		margin-top: 5px;
		color: #666;
		font-size: 0.9rem;
	}
	
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 15px;
		margin-top: 30px;
	}
	
	.filters-container {
		margin-bottom: 20px;
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		align-items: flex-start;
	}
	
	.filter-group {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.filter-group label {
		font-weight: 500;
		color: #555;
		margin-bottom: 0;
	}
	
	.filter-group select {
		padding: 10px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
		width: auto;
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
	
	.invitations-table {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}
	
	.table-header {
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr;
		gap: 15px;
		background-color: #f0f0f0;
		font-weight: bold;
		color: #555;
		padding: 15px;
	}
	
	.table-row {
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr;
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
	
	.col-dates div {
		margin-bottom: 5px;
		font-size: 0.9rem;
	}
	
	.days-remaining {
		color: #805ad5;
		font-weight: 500;
	}
	
	.status-badge {
		display: inline-block;
		padding: 5px 10px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
	}
	
	.status-accepted {
		background-color: #e6fffa;
		color: #38b2ac;
	}
	
	.status-sent {
		background-color: #ebf8ff;
		color: #3182ce;
	}
	
	.status-expired {
		background-color: #f0f0f0;
		color: #718096;
	}
	
	.invitation-code {
		font-family: monospace;
		background-color: #f0f0f0;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.9rem;
	}
	
	.copy-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.1rem;
		padding: 2px 5px;
		margin-left: 5px;
		vertical-align: middle;
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
	
	.no-actions {
		color: #888;
		font-size: 0.9rem;
		font-style: italic;
	}
</style>