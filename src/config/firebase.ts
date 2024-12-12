import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = path.join(__dirname, '../../../serviceAccountKey.json'); // Make sure this path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // If you're using Cloud Storage
});
const storage = admin.storage();
const bucket = storage.bucket();
export { storage, bucket };
