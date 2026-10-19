import { commit } from "@huggingface/hub";
import { compressImage } from "./imageCompressor";

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_HF_WRITE_TOKEN;
const HF_REPO_ID = import.meta.env.VITE_HF_REPO_ID || "1mos-droid/church-media";

/**
 * Uploads a file to a Hugging Face Dataset repository using the @huggingface/hub library.
 * Pre-compresses images client-side to ensure files stay under the ~5MB LFS threshold,
 * preventing mobile browser WebAssembly/Blob-worker failures.
 * @param {File} file - The file object to upload.
 * @param {string} [filename] - Optional filename. If not provided, one will be generated.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export async function uploadToHuggingFace(file, filename) {
  if (!HF_TOKEN) {
    throw new Error(`Hugging Face token missing. Please check your .env file.`);
  }

  // Optimize and compress images client-side to keep under LFS threshold (<5MB)
  let uploadFile = file;
  try {
    uploadFile = await compressImage(file);
  } catch (compErr) {
    console.warn("Client-side image compression fallback:", compErr);
  }

  // Use provided filename or generate one based on timestamp and cleaned original name
  const actualFilename = filename || `${Date.now()}_${(uploadFile.name || 'image').replace(/[^a-zA-Z0-9.]/g, '_')}`;

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
          content: uploadFile
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
