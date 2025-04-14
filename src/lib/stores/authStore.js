// src/lib/stores/authStore.js
import { writable, derived } from 'svelte/store';
import { auth } from '$lib/firebase/firebase.client.js';
import {
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged
} from 'firebase/auth';

import api from '$lib/services/api.client.js';

export const authUser = writable(null);
export const authToken = writable(null);
export const userRoles = writable([]);
export const authLoading = writable(true);
export const authError = writable(null);
export const isAdmin = derived(userRoles, $userRoles => $userRoles.includes('admin'));

onAuthStateChanged(auth, async (user) => {
	authError.set(null);
	if (user) {
		try {
			const idToken = await user.getIdToken();
			authUser.set(user);
			authToken.set(idToken);
			
			// Fetch user profile to get roles
			try {
				const userResponse = await api.get('/users/profile');
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
