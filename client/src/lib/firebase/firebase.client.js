// src/lib/firebase/firebase.client.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { browser } from '$app/environment';

let app;
let auth;

try {
	if (browser) {
		// Firebase configuration
		const firebaseConfig = {
			apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY,
			authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
			projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
			storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
			appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID
		};

		// Validate Firebase config before initialization
		const missingKeys = Object.keys(firebaseConfig).filter(key => !firebaseConfig[key]);
		if (missingKeys.length > 0) {
			if (import.meta.env.DEV) {
				console.error('Missing Firebase configuration keys:', missingKeys);
			}
			throw new Error(`Missing Firebase configuration keys: ${missingKeys.join(', ')}`);
		}

		// Initialize Firebase
		app = initializeApp(firebaseConfig);
		auth = getAuth(app);
			
		// Handle Firebase v11 specific issues
		auth.settings = auth.settings || {};
		auth.tenantId = null;
		
		if (auth._getRecaptchaConfig === undefined) {
			auth._getRecaptchaConfig = () => null;
		}

		if (import.meta.env.DEV) {
			console.log('Firebase initialized successfully');
			auth.settings.appVerificationDisabledForTesting = true;
		}
	}
} catch (error) {
	if (import.meta.env.DEV) {
		console.error('Firebase initialization error:', error);
	}

	// Fallback for development/testing
	if (browser && import.meta.env.DEV) {
		console.warn('Using empty Firebase implementation for development/testing');
		// Create dummy Firebase implementation
		app = { name: 'dummy-app' };
		auth = {
			currentUser: null,
			onAuthStateChanged: (callback) => {
				callback(null);
				return () => {};
			},
			settings: {
				appVerificationDisabledForTesting: true
			},
			_getRecaptchaConfig: () => null,
			tenantId: null
		};
	}
}

export { app, auth };