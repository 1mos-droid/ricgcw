import { commit } from "@huggingface/hub";

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_HF_WRITE_TOKEN;
const HF_REPO_ID = import.meta.env.VITE_HF_REPO_ID || "1mos-droid/church-media";

/**
 * Uploads a file to a Hugging Face Dataset repository using the @huggingface/hub library.
 * @param {File} file - The file object to upload.
 * @param {string} [filename] - Optional filename. If not provided, one will be generated.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export async function uploadToHuggingFace(file, filename) {
  if (!HF_TOKEN) {
    throw new Error(`Hugging Face token missing. Please check your .env file.`);
  }

  // Use provided filename or generate one based on timestamp and cleaned original name
  const actualFilename = filename || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

  try {
    const result = await commit({
      credentials: { accessToken: HF_TOKEN },
      repo: {
        type: "dataset",
        name: HF_REPO_ID
      },
      title: `CMS Upload: Added ${actualFilename}`, // Acts as the Git commit message
      operations: [
        {
          operation: "addOrUpdate",
          path: actualFilename, // Path in the repo
          content: file
        }
      ]
    });

    console.log("Success! File fully committed to Hugging Face:", result);

    // Return the URL as expected by the application
    // Resolve URL format using /resolve/ with ?download=true to force LFS binary delivery
    return `https://huggingface.co/datasets/${HF_REPO_ID}/resolve/main/${actualFilename}?download=true`;

  } catch (error) {
    console.error("Hugging Face commit error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}
