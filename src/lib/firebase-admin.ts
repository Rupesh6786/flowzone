import * as admin from 'firebase-admin';

// Your project's storage bucket name
const BUCKET_NAME = "ac-solution-t0zkx.appspot.com";

try {
    if (!admin.apps.length) {
        // Initialize the app with a service account is not needed in App Hosting.
        // It automatically uses the runtime service account.
        admin.initializeApp({
            storageBucket: BUCKET_NAME,
        });
    }
} catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export const bucket = adminStorage.bucket();
