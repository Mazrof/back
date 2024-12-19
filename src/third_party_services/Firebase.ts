import { bucket } from '../config';

export const uploadFileToFirebase = async (
  messageContent: string
): Promise<string> => {
  try {
    const randomName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Convert the string into a Buffer
    const fileBuffer = Buffer.from(messageContent, 'utf-8');

    const file = bucket.file(`uploads/${randomName}.txt`);
    await file.save(fileBuffer);

    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // Expiration date for the URL after 30 days
    });

    return downloadUrl;
  } catch (error) {
    console.error('Error in uploadFileToFirebase:', error);
    throw error; // Re-throw for higher-level handling
  }
};
export async function deleteFileFromFirebase(fileURL: string) {
  try {
    if (!fileURL) {
      throw new Error('No URL provided');
    }

    // Parse the URL to extract the file path
    const url = new URL(fileURL);
    let path = decodeURIComponent(url.pathname.split('/uploads/')[1]); // Adjust based on your URL structure

    // Ensure that the extracted path is valid
    if (!path) {
      throw new Error('Invalid file path extracted from URL');
    }
    path = 'uploads/' + path;
    // Get a reference to the file in Firebase Storage
    const file = bucket.file(path);

    // Delete the file
    await file.delete();
  } catch (error) {
    return null;
  }
}
export async function getFileFromFirebase(fileURL: string): Promise<string> {
  try {
    if (!fileURL) {
      throw new Error('No URL provided');
    }

    // Parse the URL to extract the file path
    const url = new URL(fileURL);
    let path = decodeURIComponent(url.pathname.split('/uploads/')[1]); // Adjust based on your URL structure

    // Ensure that the extracted path is valid
    if (!path) {
      throw new Error('Invalid file path extracted from URL');
    }
    path = 'uploads/' + path;

    // Get a reference to the file in Firebase Storage
    const file = bucket.file(path);

    // Download the file content
    const [fileBuffer] = await file.download();

    // Convert the Buffer to a string (assuming UTF-8 encoding)
    const fileContent = fileBuffer.toString('utf-8');
    return fileContent;
  } catch (error) {
    return null;
  }
}
