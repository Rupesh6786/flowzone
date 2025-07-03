import * as admin from 'firebase-admin';

try {
    if (!admin.apps.length) {
        // In a managed cloud environment, the SDK is often automatically initialized.
        admin.initializeApp();
    }
} catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
}

export const adminDb = admin.firestore();
