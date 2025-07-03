import * as admin from 'firebase-admin';

// The bucket name is available in your Firebase project settings.
const BUCKET_NAME = 'ac-solution-t0zkx.appspot.com';

try {
    if (!admin.apps.length) {
        // In a managed cloud environment, the SDK is often automatically initialized.
        // We explicitly provide the storage bucket to ensure it's always available for our actions.
        admin.initializeApp({
            storageBucket: BUCKET_NAME,
        });
    }
} catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
