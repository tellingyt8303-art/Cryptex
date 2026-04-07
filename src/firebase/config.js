/**
 * ================================================================
 * Firebase Configuration
 * ================================================================
 * LOCAL DEV:
 *   src/firebase/config.js mein directly values paste karo
 *
 * PRODUCTION (Render):
 *   Render Static Site → Environment Variables mein add karo
 *   VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID etc.
 *
 * FIRESTORE RULES (Firebase Console → Firestore → Rules):
 * ─────────────────────────────────────────────────────────
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null
 *                          && request.auth.uid == userId;
 *     }
 *     match /payments/{paymentId} {
 *       allow read: if request.auth != null;
 *     }
 *   }
 * }
 * ─────────────────────────────────────────────────────────
 */

import { initializeApp }  from 'firebase/app';
import { getAuth }        from 'firebase/auth';
import { getFirestore }   from 'firebase/firestore';

// ── Firebase Config ───────────────────────────────────────────────
// Production: values come from Render env vars (VITE_*)
// Development: replace with your actual values directly

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "YOUR_API_KEY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "YOUR_PROJECT.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "YOUR_PROJECT_ID",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "YOUR_SENDER_ID",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
