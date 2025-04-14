import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// load env variables
const firebaseConfig = {
	apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID,
}

// initialize firebase
let app;
if (getApps().length === 0) {
	app = initializeApp(firebaseConfig);
} else {
	app = getApps()[0];
}

// initialize auth
const auth = getAuth(app);

export { app, auth };
