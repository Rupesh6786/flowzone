import * as admin from 'firebase-admin';

try {
    if (!admin.apps.length) {
        // In a managed environment like Firebase Studio, the SDK is automatically initialized.
        // We call initializeApp() without arguments to use the environment's configuration.
        admin.initializeApp();
    }
} catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
}

export const adminDb = admin.firestore();
