// filepath: /Users/victor/dev/superVitre/lib/firebaseAdmin.js
import admin from 'firebase-admin';

// Ensure this environment variable is set with your service account key JSON content.
// DO NOT hardcode the service account key here or commit the JSON file to your repository.
const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (serviceAccountKeyString) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKeyString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
        // If you use Realtime Database or other services requiring a databaseURL:
        // databaseURL: `https://<YOUR_PROJECT_ID>.firebaseio.com`
      });
      console.log('Firebase Admin SDK initialized.');
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY or initializing Firebase Admin SDK:', error);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Firebase Admin SDK not initialized.');
  }
}

export default admin;
