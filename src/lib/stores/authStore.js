// src/lib/stores/authStore.js
import { writable } from 'svelte/store';
import { auth } from '$lib/firebase/firebase.client.js';
import {
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged
} from 'firebase/auth';

import api from '$lib/services/api.client.js';

export const authUser = writable(null);
export const authToken = writable(null);
export const authLoading = writable(true);
export const authError = writable(null);

onAuthStateChanged(auth, async (user) => {
	authError.set(null);
	if (user) {
		try {
			const idToken = await user.getIdToken();
			authUser.set(user);
			authToken.set(idToken);
		} catch (err) {
			authError.set(err.message);
			await signOut(auth);
		}
	} else {
		authUser.set(null);
		authToken.set(null);
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
