// src/lib/services/api.client.js
import axios from 'axios';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { authToken } from '$lib/stores/authStore.js';
import { auth } from '$lib/firebase/firebase.client.js';

// Use the correct backend URL based on domain
const BACKEND_URL = 'https://api.chaidla.ee';

const api = axios.create({
	baseURL: browser ? BACKEND_URL : '',
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use(
	(config) => {
		if (browser) {
			// Get current token value from store
			const token = get(authToken);

			if (token) {
				config.headers['Authorization'] = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If error is token expired and we haven't already tried to refresh
		if (browser && error.response?.status === 401 &&
			error.response?.data?.error === 'TokenExpired' &&
			!originalRequest._retry) {

			originalRequest._retry = true;

			try {
				// Refresh the token
				const user = auth.currentUser;
				if (user) {
					const newToken = await user.getIdToken(true);
					authToken.set(newToken);

					// Update the auth header and retry
					originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
					return api(originalRequest);
				}
			} catch (refreshError) {
				if (import.meta.env.DEV) {
					console.error('Error refreshing token:', refreshError);
				}
			}
		}

		// Redirect to homepage on auth failure (401 Unauthorized or 403 Forbidden)
		if (browser && (error.response?.status === 401 || error.response?.status === 403)) {
			// Check if we're not already on a public page
			const currentPath = window.location.pathname;
			const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

			if (!publicPaths.some(path => currentPath === path || currentPath.startsWith(path))) {
				if (import.meta.env.DEV) {
					console.log('Redirecting to homepage due to authentication failure');
				}
				window.location.href = '/';
			}
		}

		return Promise.reject(error);
	}
);

// Authentication endpoints - Based on API_ENDPOINTS.md
const authApi = {
	// Register a new user with invitation code
	register: (userData) => {
		if (import.meta.env.DEV) {
			console.log('Sending registration API request:', userData);
		}
		return api.post('/api/auth/register', userData);
	},
	// Login with email/password
	login: (credentials) => api.post('/api/auth/login', credentials),
	// Refresh authentication token
	refreshToken: () => api.post('/api/auth/refresh'),
	// Request password reset
	resetPassword: (email) => api.post('/api/auth/reset-password', { email }),
	// Get current user profile
	getCurrentUser: () => api.get('/api/auth/me')
};

// User Management endpoints - Based on API_ENDPOINTS.md
const userApi = {
	// Get current user profile
	getProfile: () => api.get('/api/users/profile'),
	// Update user profile
	updateProfile: (profileData) => api.put('/api/users/profile', profileData),
	// Update notification preferences
	updateNotificationPreferences: (preferences) => api.put('/api/users/notifications/preferences', preferences),
	
	// Admin-only endpoints - From NEEDED_API_ENDPOINTS.md
	getAllUsers: (params) => api.get('/api/users', { params }),
	updateUserStatus: (userId, status) => api.put(`/api/users/${userId}/status`, { status }),
	addAdminRole: (userId) => api.post(`/api/users/${userId}/roles/admin`),
	removeAdminRole: (userId) => api.delete(`/api/users/${userId}/roles/admin`)
};

// Sleep Data endpoints - Based on API_ENDPOINTS.md
const sleepApi = {
	// Get sleep data for specific date
	getSleepByDate: (date) => api.get(`/api/sleep/daily/${date}`),
	// Get sleep data for date range
	getSleepByRange: (params) => api.get('/api/sleep/range', { params }),
	// Get sleep summary statistics
	getSleepSummary: () => api.get('/api/sleep/summary'),
	// Add notes to sleep data
	addSleepNote: (date, note) => api.post(`/api/sleep/daily/${date}/notes`, { note }),
	// Connect Oura Ring account
	connectOura: (token) => api.post('/api/sleep/oura/connect', { token }),
	// Manually trigger Oura data sync
	syncOuraData: () => api.post('/api/sleep/oura/sync'),
	// Disconnect Oura Ring account
	disconnectOura: () => api.post('/api/sleep/oura/disconnect'),
	
	// Oura methods moved from ouraApi to sleepApi 
	getOuraAuthUrl: () => api.get('/api/sleep/oura/authorize'),
	getOuraConnectionStatus: () => api.get('/api/sleep/oura/status'),
	
	// Legacy methods for backward compatibility
	getSleepData: (params) => api.get('/api/sleep/range', { params }),
	syncSleepData: () => api.post('/api/sleep/oura/sync')
};

// Competitions endpoints - Based on API_ENDPOINTS.md
const competitionApi = {
	// Get all competitions (filter by status with ?status=)
	getCompetitions: (params) => api.get('/api/competitions', { params }),
	// Get a specific competition
	getCompetition: (competitionId) => api.get(`/api/competitions/${competitionId}`),
	// Join a competition
	joinCompetition: (competitionId) => api.post(`/api/competitions/${competitionId}/join`),
	// Leave a competition
	leaveCompetition: (competitionId) => api.post(`/api/competitions/${competitionId}/leave`),
	// Get competition leaderboard
	getLeaderboard: (competitionId) => api.get(`/api/competitions/${competitionId}/leaderboard`),
	// Get user's competitions
	getUserCompetitions: () => api.get('/api/competitions/user/me'),
	// Update competition status (participants only)
	updateCompetitionStatus: (competitionId, status) => api.patch(`/api/competitions/${competitionId}/status`, { status }),
	
	// Admin-only endpoints
	createCompetition: (competitionData) => api.post('/api/competitions', competitionData),
	updateCompetition: (competitionId, competitionData) => api.put(`/api/competitions/${competitionId}`, competitionData),
	updateWinners: (competitionId, winnersData) => api.put(`/api/competitions/${competitionId}/winners`, winnersData),
	deleteCompetition: (competitionId) => api.delete(`/api/competitions/${competitionId}`)
};

// Admin Invitations endpoints - Based on API_ENDPOINTS.md
const invitationApi = {
	// Create new invitation code
	createInvitation: (invitationData) => api.post('/api/invitations', invitationData),
	// List all invitation codes
	getInvitations: (params) => api.get('/api/invitations', { params }),
	// Revoke invitation (using DELETE method as per API_ENDPOINTS.md)
	revokeInvitation: (invitationId) => api.delete(`/api/invitations/${invitationId}`),
	
	// Additional methods needed but not in API_ENDPOINTS.md
	validateInvitation: (code) => api.get(`/api/invitations/validate/${code}`),
	acceptInvitation: (data) => api.post('/api/invitations/accept', data),
	resendInvitation: (invitationId) => api.post(`/api/invitations/${invitationId}/resend`)
};

// Notifications endpoints - Based on API_ENDPOINTS.md
const notificationApi = {
	// Get user notifications
	getNotifications: () => api.get('/api/notifications'),
	// Mark notification as read
	markAsRead: (notificationId) => api.put(`/api/notifications/${notificationId}/read`),
	// Mark all notifications as read
	markAllAsRead: () => api.put('/api/notifications/read-all'),
	
	// Additional endpoints needed but not in API_ENDPOINTS.md
	getUnreadCount: () => api.get('/api/notifications/unread-count'),
	deleteNotification: (notificationId) => api.delete(`/api/notifications/${notificationId}`),
	createAdminNotification: (notification) => api.post('/api/notifications/admin/create', notification),
	createBulkNotifications: (notifications) => api.post('/api/notifications/admin/bulk-create', { notifications })
};

// Remove ouraApi export as functionality is now in sleepApi
export {
	authApi,
	userApi,
	sleepApi,
	notificationApi,
	invitationApi,
	competitionApi
};

export default api;
