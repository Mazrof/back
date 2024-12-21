import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import express from 'express';

// Directory where images will be saved
const assetsDir = path.join(__dirname, '../../../assets');

export const serveStaticFiles = (app) => {
  app.use('/assets', express.static(assetsDir)); // Serve static assets
};

// 1. Convert Base64 string to an image
export const convertBase64ToImage = (base64Data: string): Buffer => {
  const base64String = base64Data.split(';base64,').pop(); // Extract Base64 string
  if (!base64String) {
    throw new Error('Invalid Base64 data');
  }
  return Buffer.from(base64String, 'base64'); // Return the decoded image buffer
};

// 2. Save the image to the assets directory and return the file path
export const saveImage = (imageBuffer: Buffer)=> {
  try {
    // Generate a unique file name
    const uniqueFileName = `${crypto.randomUUID()}.png`; // You can change the extension if needed

    // Save the file in the assets directory
    const filePath = path.join(assetsDir, uniqueFileName);
    fs.writeFileSync(filePath, imageBuffer); // Write the buffer to the file

    // Return the relative path for database storage or usage
    return `/assets/${uniqueFileName}`;
  } catch (error) {
    console.log(
      'Error saving image:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
};

// 3. Convert image file to Base64 string
export const convertImageToBase64 = (filePath: string) => {
  try {
    // Read the image file from disk

    const absolutePath = path.join(__dirname, '../../../', filePath);

    const imageBuffer = fs.readFileSync(absolutePath);

    // Convert the image buffer to a Base64 string
    const base64String = imageBuffer.toString('base64');

    // Return the Base64 string with a prefix indicating the MIME type (in this case, PNG)
    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.log(
      'Error reading image:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
};
