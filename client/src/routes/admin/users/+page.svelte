<script>
	import { onMount } from 'svelte';
	import { authUser, isAdmin } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { userApi } from '$lib/services/api.client.js';

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

			// Get all users with the structured API client
			const response = await userApi.getAllUsers();
			
			// Filter and paginate on the client side if needed
			const allUsers = response.data;
			
			// Apply filters manually if the API doesn't support them
			let filteredUsers = allUsers;
			
			if (searchQuery) {
				const searchLower = searchQuery.toLowerCase();
				filteredUsers = filteredUsers.filter(user => 
					(user.email && user.email.toLowerCase().includes(searchLower)) ||
					(user.username && user.username.toLowerCase().includes(searchLower)) ||
					(user.displayName && user.displayName.toLowerCase().includes(searchLower))
				);
			}
			
			if (roleFilter !== 'all') {
				filteredUsers = filteredUsers.filter(user => 
					user.roles && user.roles.includes(roleFilter)
				);
			}
			
			if (statusFilter !== 'all') {
				const isActive = statusFilter === 'active';
				filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
			}
			
			// Calculate pagination
			totalUsers = filteredUsers.length;
			const startIndex = (currentPage - 1) * usersPerPage;
			const endIndex = startIndex + usersPerPage;
			users = filteredUsers.slice(startIndex, endIndex);
			
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

			await userApi.updateUserStatus(userId, !currentStatus);

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

			if (isCurrentlyAdmin) {
				// Remove admin role
				await userApi.removeAdminRole(userId);
			} else {
				// Add admin role
				await userApi.addAdminRole(userId);
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

	function getInitials(name) {
		if (!name) return '';
		return name.split(' ').map(n => n[0]).join('').toUpperCase();
	}
</script>

<div class="admin-container">
	<div class="admin-header">
		<h1>User Management</h1>
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
			<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
				<circle cx="9" cy="7" r="4"></circle>
				<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
				<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
			</svg>
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
							<div class="avatar">{getInitials(user.displayName || user.username || user.email)}</div>
							<div>
								<h3>{user.displayName || user.username || 'Unnamed User'}</h3>
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
								disabled={user.id === $authUser?.uid}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								{#if user.isActive}
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
									<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
								{:else}
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
									<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
									<line x1="12" y1="15" x2="12" y2="17"></line>
								{/if}
							</svg>
						</button>

						<button
								class="btn-icon {user.roles?.includes('admin') ? 'remove-admin' : 'make-admin'}"
								on:click={() => toggleAdminRole(user.id, user.roles || ['user'])}
								title={user.roles?.includes('admin') ? 'Remove Admin Role' : 'Grant Admin Role'}
								disabled={user.id === $authUser?.uid}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								{#if user.roles?.includes('admin')}
									<circle cx="12" cy="8" r="6"></circle>
									<path d="M15.9 15.39l-2.83 4.66a1.8 1.8 0 0 1-2.23.63 1.8 1.8 0 0 1-.62-2.72l2.5-3.73"></path>
									<path d="M8.1 15.39l2.83 4.66a1.8 1.8 0 0 0 2.23.63 1.8 1.8 0 0 0 .62-2.72l-2.5-3.73"></path>
								{:else}
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
									<circle cx="9" cy="7" r="4"></circle>
									<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
								{/if}
							</svg>
						</button>

						<a href="/admin/users/{user.id}" class="btn-icon view" title="View Details">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
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
	}

	.primary {
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		color: white;
	}

	.primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
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
		font-size: 0.95rem;
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
		font-size: 0.95rem;
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

	.avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: linear-gradient(135deg, #60A5FA, #7C3AED);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.2rem;
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
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: background-color 0.2s;
	}

	.btn-icon:hover:not(:disabled) {
		background-color: #f0f0f0;
	}

	.btn-icon:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.col-details p {
		margin: 5px 0;
		font-size: 0.9rem;
	}

	.col-actions {
		display: flex;
		gap: 5px;
	}

	.btn-icon.activate svg {
		color: #38b2ac;
	}

	.btn-icon.deactivate svg {
		color: #e53e3e;
	}

	.btn-icon.make-admin svg {
		color: #d97706;
	}

	.btn-icon.remove-admin svg {
		color: #4b5563;
	}

	.btn-icon.view svg {
		color: #3182ce;
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
		background-color: #60A5FA;
		color: white;
		border-color: #60A5FA;
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

	@media (max-width: 1024px) {
		.table-header, .table-row {
			grid-template-columns: 2fr 1.5fr 1fr 1fr;
		}

		.col-oura, .col-details {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.filter-selectors {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}

		.filter-group {
			width: 100%;
		}

		.filter-group select {
			width: 100%;
		}

		.table-header, .table-row {
			grid-template-columns: 2fr 1fr 1fr;
		}

		.col-oura, .col-details, .col-roles {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.search-container {
			flex-direction: column;
		}

		.search-container button {
			width: 100%;
		}

		.table-header, .table-row {
			grid-template-columns: 2fr 1fr;
		}

		.col-status {
			display: none;
		}
	}
</style>
