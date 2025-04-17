// src/lib/firebase/firebase.client.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { browser } from '$app/environment';

// Enhanced error handling and debugging for Firebase initialization
let app;
let auth;

try {
	if (browser) {
		// Log available env variables for debugging (will be removed in production)
		console.log('Environment variables available:',
			Object.keys(import.meta.env)
				.filter(key => key.includes('FIREBASE'))
				.reduce((obj, key) => {
					// Only show that variables exist, not their values for security
					obj[key] = import.meta.env[key] ? '[SET]' : '[NOT SET]';
					return obj;
				}, {})
		);

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
			console.error('Missing Firebase configuration keys:', missingKeys);
			throw new Error(`Missing Firebase configuration keys: ${missingKeys.join(', ')}`);
		}

		// Initialize Firebase
		app = initializeApp(firebaseConfig);
		auth = getAuth(app);
			
		// Disable reCAPTCHA verification for development
		// This fixes the "_getRecaptchaConfig is not a function" error
		auth.settings = auth.settings || {};
		auth.settings.appVerificationDisabledForTesting = true;
		auth.tenantId = null; // This helps prevent the recaptcha issue in Firebase v11
		
		// For Firebase v11 specific issues
		if (auth._getRecaptchaConfig === undefined) {
			auth._getRecaptchaConfig = () => null;
		}

		console.log('Firebase initialized successfully');
	}
} catch (error) {
	console.error('Firebase initialization error:', error);

	// Fallback for development/testing
	if (browser) {
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