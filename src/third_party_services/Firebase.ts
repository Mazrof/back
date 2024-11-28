import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

const Blob = require('node-blob');
import { storage } from '../config';

export const uploadFileToFirebase = async (
  messageContent: string
): Promise<string> => {
  try {
    const randomName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    console.log('Generated file name:', randomName);

    // Convert the string into a Buffer
    const fileBuffer = Buffer.from(messageContent, 'utf-8');
    console.log('Buffer created successfully.');

    const storageRef = ref(storage, `uploads/${randomName}.txt`);
    console.log('Storage reference created:', storageRef);

    await uploadBytes(storageRef, fileBuffer);
    console.log('File uploaded successfully.');

    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL obtained:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error in uploadFileToFirebase:', error);
    throw error; // Re-throw for higher-level handling
  }
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
