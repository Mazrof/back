import { bucket } from '../config';

export const uploadFileToFirebase = async (
  messageContent: string
): Promise<string> => {
  try {
    const randomName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const fileBuffer = Buffer.from(messageContent, 'utf-8');
    const file = bucket.file(`uploads/${randomName}.txt`);
    await file.save(fileBuffer);
    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
    return downloadUrl;
  } catch (error) {
    console.error('Error in uploadFileToFirebase:', error);
    throw error;
  }
};

export async function deleteFileFromFirebase(fileURL: string) {
  try {
    if (!fileURL) {
      throw new Error('No URL provided');
    }
    const url = new URL(fileURL);
    let path = decodeURIComponent(url.pathname.split('/uploads/')[1]); // Adjust based on your URL structure
    if (!path) {
      throw new Error('Invalid file path extracted from URL');
    }
    path = 'uploads/' + path;
    const file = bucket.file(path);
    await file.delete();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getFileFromFirebase(fileURL: string): Promise<string> {
  try {
    if (!fileURL) {
      return null;
    }
    const url = new URL(fileURL);
    let path = decodeURIComponent(url.pathname.split('/uploads/')[1]); // Adjust based on your URL structure
    if (!path) {
      throw new Error('Invalid file path extracted from URL');
    }
    path = 'uploads/' + path;
    const file = bucket.file(path);
    const [fileBuffer] = await file.download();
    const fileContent = fileBuffer.toString('utf-8');
    return fileContent;
  } catch (error) {
    console.error('Error getting file from Firebase:', error);
    return null;
  }
}
