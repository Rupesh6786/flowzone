import * as admin from 'firebase-admin';

const BUCKET_NAME = 'ac-solution-t0zkx.appspot.com';

try {
    if (!admin.apps.length) {
        // In a managed environment, the SDK is often automatically initialized.
        // We explicitly provide the storage bucket to ensure it's always available.
        admin.initializeApp({
            storageBucket: BUCKET_NAME,
        });
    }
} catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
