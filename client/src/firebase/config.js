// Add your Firebase configuration here
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Disable reCAPTCHA verification for development
auth.settings = auth.settings || {};
auth.settings.appVerificationDisabledForTesting = true;
auth.tenantId = null; // This helps prevent the recaptcha issue in Firebase v11

// For Firebase v11 specific issues
if (auth._getRecaptchaConfig === undefined) {
  auth._getRecaptchaConfig = () => null;
}

export { db, auth };