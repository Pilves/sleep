// src/lib/stores/authStore.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '$lib/firebase/firebase.client.js';
import api from '$lib/services/api.client.js';

// Create stores
export const authUser = writable(null);
export const authToken = writable(null);
export const authLoading = writable(true);
export const authError = writable(null);
export const userRoles = writable([]);
export const adminFlag = writable(false);
export const isAdmin = derived([userRoles, adminFlag], ([$userRoles, $adminFlag]) => {
  // User is admin if they have the admin role OR the isAdmin flag is true
  return $userRoles.includes('admin') || $adminFlag === true;
});

// Function to refresh token periodically
async function refreshTokenPeriodically() {
	if (browser && auth.currentUser) {
		try {
			const idToken = await auth.currentUser.getIdToken(true);
			authToken.set(idToken);
		} catch (err) {
			console.error('Error refreshing token:', err);
		}
	}
}

// Set up a periodic refresh every 55 minutes (tokens expire in 60 minutes)
if (browser) {
	setInterval(refreshTokenPeriodically, 55 * 60 * 1000);
}

// Set up auth state observer
if (browser) {
	onAuthStateChanged(auth, async (user) => {
		authError.set(null);
		if (user) {
			try {
				const idToken = await user.getIdToken();
				authUser.set(user);
				authToken.set(idToken);

				// Fetch user profile to get roles
				try {
					const userResponse = await api.get('/api/users/profile');
					userRoles.set(userResponse.data.roles || ['user']);
				} catch (profileErr) {
					console.error('Error fetching user profile:', profileErr);
					userRoles.set(['user']);
				}
			} catch (err) {
				authError.set(err.message);
				await signOut(auth);
			}
		} else {
			authUser.set(null);
			authToken.set(null);
			userRoles.set([]);
		}
		authLoading.set(false);
	});
}

// Auth functions
export async function loginUser(email, password) {
	authLoading.set(true);
	authError.set(null);
	try {
		await signInWithEmailAndPassword(auth, email, password);
	} catch (err) {
		authError.set(err.message);
		throw err;
	} finally {
		authLoading.set(false);
	}
}

// Function to check authentication and redirect if not authenticated
export function requireAuth(returnTo = `${base}/login`) {
	if (browser && !authLoading.get()) {
		if (!auth.currentUser) {
			// Redirect to login page if not authenticated
			goto(returnTo);
			return false;
		}
		return true;
	}
	return null; // Still loading
}

export async function registerUser(email, password, userData) {
	authLoading.set(true);
	authError.set(null);
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);

		// Call the API to set additional user data
		if (userData) {
			await api.post('/api/users/profile', {
				...userData,
				uid: userCredential.user.uid
			});
		}

		return userCredential.user;
	} catch (err) {
		authError.set(err.message);
		throw err;
	} finally {
		authLoading.set(false);
	}
}

export async function logoutUser() {
	authLoading.set(true);
	authError.set(null);
	try {
		await signOut(auth);
	} catch (err) {
		authError.set(err.message);
		throw err;
	} finally {
		authLoading.set(false);
	}
}

export async function resetPassword(email) {
	authLoading.set(true);
	authError.set(null);
	try {
		await sendPasswordResetEmail(auth, email);
	} catch (err) {
		authError.set(err.message);
		throw err;
	} finally {
		authLoading.set(false);
	}
}
