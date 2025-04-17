// src/lib/services/api.client.js
import axios from 'axios';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { authToken } from '$lib/stores/authStore.js';
import { auth } from '$lib/firebase/firebase.client.js';

const api = axios.create({
	baseURL: browser ? `${import.meta.env.VITE_PUBLIC_API_BASE_URL}` : '',
	headers: {
		'Content-Type': 'application/json'
	}
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

// Authentication endpoints
const authApi = {
	register: (userData) => {
		if (import.meta.env.DEV) {
			console.log('Sending registration API request:', userData);
		}
		return api.post('/api/auth/register', userData);
	},
	getCurrentUser: () => api.get('/api/auth/me'),
	resetPassword: (email) => api.post('/api/auth/reset-password', { email })
};

// User endpoints
const userApi = {
	getProfile: () => api.get('/api/users/profile'),
	updateProfile: (profileData) => api.put('/api/users/profile', profileData),
	getAllUsers: () => api.get('/api/users'),
	updateUserStatus: (userId, status) => api.put(`/api/users/${userId}/status`, { status }),
	addAdminRole: (userId) => api.post(`/api/users/${userId}/roles/admin`),
	removeAdminRole: (userId) => api.delete(`/api/users/${userId}/roles/admin`),
	getNotificationSettings: () => api.get('/api/users/notifications'),
	updateNotificationSettings: (settings) => api.put('/api/users/notifications', settings),
};

// Oura integration endpoints
const ouraApi = {
	getOuraAuthUrl: () => api.get('/api/users/oura/authorize'),
	handleOuraCallback: (code) => api.get(`/api/users/oura/callback?code=${code}`),
	getOuraConnectionStatus: () => api.get('/api/users/oura/status'),
	connectOura: (token) => api.post('/api/users/oura/connect', { token }),
	disconnectOura: () => api.post('/api/users/oura/disconnect')
};

// Sleep data endpoints
const sleepApi = {
	getSleepData: (params) => api.get('/api/sleep/data', { params }),
	getSleepByDate: (date) => api.get(`/api/sleep/data/${date}`),
	syncSleepData: () => api.post('/api/sleep/sync'),
	addSleepNote: (date, note) => api.post(`/api/sleep/data/${date}/note`, { note }),
	getSleepSummary: () => api.get('/api/sleep/summary')
};

// Notification endpoints
const notificationApi = {
	getNotifications: () => api.get('/api/notifications'),
	markAsRead: (notificationId) => api.put(`/api/notifications/${notificationId}/read`),
	markAllAsRead: () => api.put('/api/notifications/read-all'),
	getUnreadCount: () => api.get('/api/notifications/unread-count'),
	deleteNotification: (notificationId) => api.delete(`/api/notifications/${notificationId}`),
	createAdminNotification: (notification) => api.post('/api/notifications/admin/create', notification),
	createBulkNotifications: (notifications) => api.post('/api/notifications/admin/bulk-create', { notifications })
};

// Invitation endpoints
const invitationApi = {
	createInvitation: (invitationData) => api.post('/api/invitations', invitationData),
	getInvitations: () => api.get('/api/invitations'),
	revokeInvitation: (invitationId) => api.delete(`/api/invitations/${invitationId}`),
	validateInvitation: (code) => api.get(`/api/invitations/validate/${code}`),
	acceptInvitation: (data) => api.post('/api/invitations/accept', data),
	resendInvitation: (invitationId) => api.post(`/api/invitations/${invitationId}/resend`)
};

// Competition endpoints
const competitionApi = {
	getCompetitions: () => api.get('/api/competitions'),
	getCompetition: (competitionId) => api.get(`/api/competitions/${competitionId}`),
	joinCompetition: (competitionId) => api.post(`/api/competitions/${competitionId}/join`),
	leaveCompetition: (competitionId) => api.post(`/api/competitions/${competitionId}/leave`),
	getLeaderboard: (competitionId) => api.get(`/api/competitions/${competitionId}/leaderboard`),
	getUserCompetitions: () => api.get('/api/competitions/user/me'),
	createCompetition: (competitionData) => api.post('/api/competitions', competitionData),
	updateCompetition: (competitionId, competitionData) => api.put(`/api/competitions/${competitionId}`, competitionData),
	updateWinners: (competitionId, winnersData) => api.put(`/api/competitions/${competitionId}/winners`, winnersData),
	deleteCompetition: (competitionId) => api.delete(`/api/competitions/${competitionId}`)
};

export {
	authApi,
	userApi,
	ouraApi,
	sleepApi,
	notificationApi,
	invitationApi,
	competitionApi
};

export default api;