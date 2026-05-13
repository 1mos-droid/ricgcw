import { storage, ID } from '../appwrite';

const BUCKET_ID = 'gallery'; // You will need to create this bucket in Appwrite Console

/**
 * Uploads a file to Appwrite Storage.
 * @param {File} file - The file object to upload.
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
export const uploadToAppwrite = async (file) => {
  try {
    // 1. Upload the file to Appwrite
    const response = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    );

    // 2. Construct the view URL
    // Format: [endpoint]/storage/buckets/[bucketId]/files/[fileId]/view?project=[projectId]
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '69bd9a9000090f983d70';
    
    return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${projectId}`;
  } catch (error) {
    console.error('Appwrite Upload Error:', error);
    throw new Error(error.message || 'Failed to upload to Appwrite Storage');
  }
};
