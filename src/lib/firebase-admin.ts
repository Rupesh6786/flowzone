import * as admin from 'firebase-admin';

try {
    if (!admin.apps.length) {
        // In a managed environment like App Hosting, the SDK is automatically
        // initialized with the project's configuration and credentials.
        // We don't need to provide a service account or storage bucket.
        admin.initializeApp();
    }
} catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
}

export const adminDb = admin.firestore();
