<script>
	import { onMount } from 'svelte';
	import { authUser, isAdmin } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import api from '$lib/services/api.client.js';
	
	let users = [];
	let loading = true;
	let error = null;
	let successMessage = null;
	
	// Filters
	let searchQuery = '';
	let roleFilter = 'all';
	let statusFilter = 'all';
	
	// Pagination
	let currentPage = 1;
	let usersPerPage = 10;
	let totalUsers = 0;
	
	onMount(async () => {
		// Redirect if not admin
		if (!$isAdmin) {
			goto('/dashboard');
			return;
		}
		
		await fetchUsers();
	});
	
	async function fetchUsers() {
		try {
			loading = true;
			error = null;
			
			// Build query params
			const params = new URLSearchParams();
			params.append('page', currentPage.toString());
			params.append('limit', usersPerPage.toString());
			
			if (searchQuery) {
				params.append('search', searchQuery);
			}
			
			if (roleFilter !== 'all') {
				params.append('role', roleFilter);
			}
			
			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}
			
			// Note: This endpoint needs to be implemented on the server
			// For now, use the users endpoint with admin middleware
			const response = await api.get(`/users?${params.toString()}`);
			users = response.data.users;
			totalUsers = response.data.total;
		} catch (err) {
			console.error('Error fetching users:', err);
			error = 'Failed to load users. Please try again later.';
		} finally {
			loading = false;
		}
	}
	
	function handleSearch() {
		currentPage = 1;
		fetchUsers();
	}
	
	function handleFilterChange() {
		currentPage = 1;
		fetchUsers();
	}
	
	function goToPage(page) {
		currentPage = page;
		fetchUsers();
	}
	
	async function toggleUserStatus(userId, currentStatus) {
		try {
			loading = true;
			error = null;
			
			// Note: This endpoint needs to be implemented on the server
			// For now, it's a placeholder
			await api.put(`/users/${userId}/status`, {
				status: !currentStatus
			});
			
			// Refresh user list
			await fetchUsers();
			
			successMessage = 'User status updated successfully!';
			
			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
			
		} catch (err) {
			console.error('Error updating user status:', err);
			error = err.response?.data?.message || 'Failed to update user status. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	async function toggleAdminRole(userId, currentRoles) {
		const isCurrentlyAdmin = currentRoles.includes('admin');
		
		try {
			loading = true;
			error = null;
			
			// Note: These endpoints need to be implemented on the server
			// For now, they're placeholders
			if (isCurrentlyAdmin) {
				// Remove admin role
				await api.delete(`/users/${userId}/roles/admin`);
			} else {
				// Add admin role
				await api.post(`/users/${userId}/roles/admin`);
			}
			
			// Refresh user list
			await fetchUsers();
			
			successMessage = `Admin ${isCurrentlyAdmin ? 'privileges removed' : 'privileges granted'} successfully!`;
			
			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
			
		} catch (err) {
			console.error('Error updating user roles:', err);
			error = err.response?.data?.message || 'Failed to update user roles. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	function formatDate(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
	
	function getTotalPages() {
		return Math.ceil(totalUsers / usersPerPage);
	}
	
	// Generate pagination array with first, last, current, and nearby pages
	function getPaginationArray() {
		const totalPages = getTotalPages();
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}
		
		const pages = [1];
		
		let startPage = Math.max(2, currentPage - 1);
		let endPage = Math.min(totalPages - 1, currentPage + 1);
		
		if (currentPage > 4) {
			pages.push('...');
		}
		
		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}
		
		if (currentPage < totalPages - 3) {
			pages.push('...');
		}
		
		pages.push(totalPages);
		
		return pages;
	}
</script>

<div class="admin-container">
	<div class="admin-header">
		<h1>User Management</h1>
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
	
	<div class="filters-container">
		<div class="search-container">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search by email, username, or display name"
				on:keyup={(e) => e.key === 'Enter' && handleSearch()}
			/>
			<button class="btn primary" on:click={handleSearch}>Search</button>
		</div>
		
		<div class="filter-selectors">
			<div class="filter-group">
				<label for="role-filter">Role:</label>
				<select id="role-filter" bind:value={roleFilter} on:change={handleFilterChange}>
					<option value="all">All Roles</option>
					<option value="admin">Admin</option>
					<option value="user">User</option>
				</select>
			</div>
			
			<div class="filter-group">
				<label for="status-filter">Status:</label>
				<select id="status-filter" bind:value={statusFilter} on:change={handleFilterChange}>
					<option value="all">All Statuses</option>
					<option value="active">Active</option>
					<option value="inactive">Inactive</option>
				</select>
			</div>
		</div>
	</div>
	
	{#if loading && users.length === 0}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading users...</p>
		</div>
	{:else if users.length === 0}
		<div class="empty-state">
			<p>No users found matching your criteria.</p>
		</div>
	{:else}
		<div class="users-table">
			<div class="table-header">
				<div class="col-user">User</div>
				<div class="col-details">Details</div>
				<div class="col-oura">Oura Connection</div>
				<div class="col-roles">Roles</div>
				<div class="col-status">Status</div>
				<div class="col-actions">Actions</div>
			</div>
			
			{#each users as user}
				<div class="table-row">
					<div class="col-user">
						<div class="user-info">
							{#if user.profileData?.profilePicture}
								<img src={user.profileData.profilePicture} alt="{user.displayName}" class="avatar" />
							{:else}
								<div class="avatar-placeholder">{user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}</div>
							{/if}
							<div>
								<h3>{user.displayName || user.username}</h3>
								<p class="user-email">{user.email}</p>
							</div>
						</div>
					</div>
					
					<div class="col-details">
						<p>Username: {user.username || 'Not set'}</p>
						<p>Created: {formatDate(user.createdAt)}</p>
						{#if user.profileData?.age}
							<p>Age: {user.profileData.age}</p>
						{/if}
					</div>
					
					<div class="col-oura">
						{#if user.ouraIntegration?.connected}
							<span class="badge connected">Connected</span>
							<p class="sync-date">Last synced: {formatDate(user.ouraIntegration.lastSyncDate)}</p>
						{:else}
							<span class="badge not-connected">Not Connected</span>
						{/if}
					</div>
					
					<div class="col-roles">
						{#each user.roles || ['user'] as role}
							<span class="role-badge {role === 'admin' ? 'admin' : 'user'}">{role}</span>
						{/each}
					</div>
					
					<div class="col-status">
						<span class="status-badge {user.isActive ? 'active' : 'inactive'}">
							{user.isActive ? 'Active' : 'Inactive'}
						</span>
					</div>
					
					<div class="col-actions">
						<button 
							class="btn-icon {user.isActive ? 'deactivate' : 'activate'}" 
							on:click={() => toggleUserStatus(user.id, user.isActive)}
							title={user.isActive ? 'Deactivate User' : 'Activate User'}
						>
							{user.isActive ? '🔒' : '🔓'}
						</button>
						
						<button 
							class="btn-icon {user.roles?.includes('admin') ? 'remove-admin' : 'make-admin'}" 
							on:click={() => toggleAdminRole(user.id, user.roles || ['user'])}
							title={user.roles?.includes('admin') ? 'Remove Admin Role' : 'Grant Admin Role'}
						>
							{user.roles?.includes('admin') ? '👤' : '👑'}
						</button>
						
						<a href="/admin/users/{user.id}" class="btn-icon view" title="View Details">
							👁️
						</a>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Pagination -->
		{#if getTotalPages() > 1}
			<div class="pagination">
				<button 
					class="pagination-btn" 
					disabled={currentPage === 1}
					on:click={() => goToPage(currentPage - 1)}
				>
					&laquo; Prev
				</button>
				
				{#each getPaginationArray() as page}
					{#if page === '...'}
						<span class="pagination-ellipsis">...</span>
					{:else}
						<button
							class="pagination-btn {currentPage === page ? 'active' : ''}"
							on:click={() => goToPage(page)}
						>
							{page}
						</button>
					{/if}
				{/each}
				
				<button 
					class="pagination-btn" 
					disabled={currentPage === getTotalPages()}
					on:click={() => goToPage(currentPage + 1)}
				>
					Next &raquo;
				</button>
			</div>
		{/if}
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
	
	.filters-container {
		margin-bottom: 20px;
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		align-items: flex-start;
	}
	
	.search-container {
		display: flex;
		gap: 10px;
		flex: 1;
		min-width: 300px;
	}
	
	.search-container input {
		flex: 1;
		padding: 10px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
	}
	
	.filter-selectors {
		display: flex;
		gap: 15px;
	}
	
	.filter-group {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.filter-group label {
		font-weight: 500;
		color: #555;
	}
	
	.filter-group select {
		padding: 10px 15px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
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
	
	.users-table {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		overflow: hidden;
		margin-bottom: 20px;
	}
	
	.table-header {
		display: grid;
		grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
		gap: 15px;
		background-color: #f0f0f0;
		font-weight: bold;
		color: #555;
		padding: 15px;
	}
	
	.table-row {
		display: grid;
		grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
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
	
	.user-info {
		display: flex;
		align-items: center;
		gap: 15px;
	}
	
	.avatar, .avatar-placeholder {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #eee;
		color: #333;
		font-weight: bold;
		font-size: 1.2rem;
	}
	
	.avatar {
		object-fit: cover;
	}
	
	.user-info h3 {
		margin: 0 0 5px 0;
		font-size: 1.1rem;
	}
	
	.user-email {
		margin: 0;
		color: #777;
		font-size: 0.9rem;
	}
	
	.badge {
		display: inline-block;
		padding: 5px 10px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
	}
	
	.connected {
		background-color: #e6fffa;
		color: #38b2ac;
	}
	
	.not-connected {
		background-color: #fff5f5;
		color: #e53e3e;
	}
	
	.sync-date {
		margin: 5px 0 0 0;
		font-size: 0.8rem;
		color: #777;
	}
	
	.role-badge {
		display: inline-block;
		padding: 5px 10px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
		margin-right: 5px;
		text-transform: capitalize;
	}
	
	.role-badge.admin {
		background-color: #fef3c7;
		color: #d97706;
	}
	
	.role-badge.user {
		background-color: #e0e7ff;
		color: #4f46e5;
	}
	
	.status-badge {
		display: inline-block;
		padding: 5px 10px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
	}
	
	.active {
		background-color: #e6fffa;
		color: #38b2ac;
	}
	
	.inactive {
		background-color: #f3f4f6;
		color: #4b5563;
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
	
	.col-details p {
		margin: 5px 0;
		font-size: 0.9rem;
	}
	
	.pagination {
		display: flex;
		justify-content: center;
		gap: 5px;
		margin-top: 30px;
	}
	
	.pagination-btn {
		padding: 8px 12px;
		border: 1px solid #ddd;
		background-color: white;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.3s;
	}
	
	.pagination-btn:hover:not(:disabled) {
		background-color: #f9f9f9;
	}
	
	.pagination-btn.active {
		background-color: #6e8efb;
		color: white;
		border-color: #6e8efb;
	}
	
	.pagination-btn:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	
	.pagination-ellipsis {
		display: flex;
		align-items: center;
		padding: 0 5px;
	}
</style>