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
    throw new Error('Hugging Face token or Repo ID not configured in .env');
  }

  const url = `https://huggingface.co/api/datasets/${HF_REPO_ID}/upload/${path}`;

  try {
    const response = await axios.post(url, file, {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': file.type,
      },
    });

    // Hugging Face returns information about the commit.
    // The public URL for a file in a dataset is usually:
    // https://huggingface.co/datasets/${HF_REPO_ID}/resolve/main/${path}
    
    return `https://huggingface.co/datasets/${HF_REPO_ID}/resolve/main/${path}`;
  } catch (error) {
    console.error('Hugging Face Upload Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to upload to Hugging Face');
  }
};
