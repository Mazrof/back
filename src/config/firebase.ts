import admin from "firebase-admin";

import path from 'path';

const serviceAccount = path.join(__dirname, '../../../serviceAccountKey.json'); // Make sure this path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
export default admin;


const bucket=null
const storage=null
export { storage, bucket };
