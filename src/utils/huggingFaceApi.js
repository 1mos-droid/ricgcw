import axios from 'axios';

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const HF_REPO_ID = import.meta.env.VITE_HF_REPO_ID;

/**
 * Uploads a file to a Hugging Face Dataset repository.
 * @param {File} file - The file object to upload.
 * @param {string} path - The path inside the repository.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export const uploadToHuggingFace = async (file, path) => {
  if (!HF_TOKEN || !HF_REPO_ID) {
    throw new Error(`Hugging Face configuration missing. Please check your GitHub Secrets or .env file.`);
  }

  // Ensure path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // New Commit API endpoint
  const url = `https://huggingface.co/api/datasets/${HF_REPO_ID}/commit/main`;

  try {
    // We need to convert the file to base64 for the commit API if using JSON
    // or use FormData for binary uploads to the commit endpoint.
    // The most reliable way for browser-based large files is FormData.
    const formData = new FormData();
    formData.append('files', file, cleanPath);
    formData.append('summary', `Upload ${file.name} via RICGCW CMS`);

    const response = await axios.post(url, formData, {      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return `https://huggingface.co/datasets/${HF_REPO_ID}/resolve/main/${cleanPath}`;
  } catch (error) {
    console.error('Hugging Face Upload Error:', error.response?.data || error.message);
    const detail = error.response?.data?.error || error.message;
    throw new Error(`Upload failed: ${detail}`);
  }
};
