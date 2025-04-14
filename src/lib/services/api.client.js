import axios from 'axios';
import { authToken } from '$lib/stores/authStore.js';
import { get } from 'svelte/store';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
	headers: {
		'Content-Type': 'application/json'
	},
})

// Add a request interceptor to include the token
api.interceptors.request.use(
	(config) => {
		// Get the current token value from the store
		const token = get(authToken);

		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;
