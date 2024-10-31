import { initializeApp } from 'firebase/app';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export const uploadFileToFirebase = async (
  messageContent: string
): Promise<string> => {
  const randomName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const stringBlob = new Blob([messageContent], { type: 'text/plain' });
  const storageRef = ref(storage, `uploads/${randomName}.txt`);
  await uploadBytes(storageRef, stringBlob);
  return await getDownloadURL(storageRef);
};

export const deleteFileFromFirebase = async (
  fileUrl: string
): Promise<void> => {
  try {
    // Extract the file path from the URL
    const filePath = decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]);
    // Create a reference to the file in the storage
    const fileRef = ref(storage, filePath);
    // Delete the file
    await deleteObject(fileRef);
    console.log(`File ${filePath} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
