import * as admin from 'firebase-admin';

const projectId = 'ac-solution-t0zkx';

try {
    if (!admin.apps.length) {
        // In a managed environment, the SDK is automatically initialized.
        // In a local environment, it uses Application Default Credentials.
        // We provide the projectId to ensure it connects to the correct project.
        admin.initializeApp({ projectId });
    }
} catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
}

export const adminDb = admin.firestore();
