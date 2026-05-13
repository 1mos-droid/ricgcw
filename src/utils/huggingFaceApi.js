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
    // Convert file to Base64
    const base64Content = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const payload = {
      summary: `Upload ${file.name} via RICGCW CMS`,
      operations: [
        {
          action: 'add',
          path: cleanPath,
          content: base64Content
        }
      ]
    };
    
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // The CDN URL format is the most reliable for cross-origin image display
    return `https://huggingface.co/datasets/${HF_REPO_ID}/resolve/main/${cleanPath}`;
  } catch (error) {
    console.error('Hugging Face Upload Error:', error.response?.data || error.message);
    const detail = error.response?.data?.error || error.message;
    throw new Error(`Upload failed: ${detail}`);
  }
};
