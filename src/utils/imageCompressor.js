/**
 * Image compression and validation utility for client-side uploads.
 * Standardizes images and resizes them before sending to storage providers (Hugging Face / Firebase).
 * Prevents massive raw smartphone camera photos (>5MB-25MB) from triggering
 * mobile browser WebAssembly/Blob-worker Git LFS crashes on mobile devices.
 */

/**
 * Checks whether a given file is an image based on MIME type or filename extension.
 * Gracefully handles situations where mobile file pickers return empty or generic MIME types.
 * 
 * @param {File|Blob} file 
 * @returns {boolean}
 */
export const isImageFile = (file) => {
  if (!file) return false;
  if (file.type && typeof file.type === 'string' && file.type.startsWith('image/')) {
    return true;
  }
  const name = file.name || '';
  return /\.(jpe?g|png|webp|gif|bmp|heic|heif|avif)$/i.test(name);
};

/**
 * Calculates scaled dimensions proportionally to fit within max bounds.
 * 
 * @param {number} width 
 * @param {number} height 
 * @param {number} [maxWidth=1920] 
 * @param {number} [maxHeight=1920] 
 * @returns {{ width: number, height: number }}
 */
export const calculateScaledDimensions = (width, height, maxWidth = 1920, maxHeight = 1920) => {
  if (!width || !height || width <= 0 || height <= 0) {
    return { width: maxWidth, height: maxHeight };
  }
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio))
  };
};

/**
 * Compresses an image client-side to web-optimized dimensions and file size.
 * 
 * @param {File|Blob} file - The original image file from input.
 * @param {object} [options]
 * @param {number} [options.maxWidth=1920] - Maximum width constraint.
 * @param {number} [options.maxHeight=1920] - Maximum height constraint.
 * @param {number} [options.quality=0.82] - JPEG compression quality (0 to 1).
 * @param {string} [options.outputType='image/jpeg'] - Output image MIME format.
 * @returns {Promise<File|Blob>} - Resolves to the compressed File, or original if compression unsupported.
 */
export const compressImage = async (file, options = {}) => {
  if (!file || !isImageFile(file)) {
    return file;
  }

  // Skip SVG graphics
  if (file.type === 'image/svg+xml' || (file.name && file.name.toLowerCase().endsWith('.svg'))) {
    return file;
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    outputType = 'image/jpeg'
  } = options;

  // If in a non-browser environment (e.g. SSR or testing without canvas), return original
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    let objectUrl = null;

    const cleanup = () => {
      if (objectUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // Object URL may already be released
        }
      }
    };

    const failAndReturnOriginal = (err) => {
      if (err) {
        console.warn('Image compression fallback to original file:', err);
      }
      cleanup();
      resolve(file);
    };

    try {
      const img = new Image();

      img.onload = () => {
        try {
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          // If image is already within bounds, small enough (< 1MB), and already in target format, return it
          if (
            originalWidth <= maxWidth &&
            originalHeight <= maxHeight &&
            file.size &&
            file.size < 1024 * 1024 &&
            file.type === outputType
          ) {
            cleanup();
            return resolve(file);
          }

          const { width, height } = calculateScaledDimensions(
            originalWidth,
            originalHeight,
            maxWidth,
            maxHeight
          );

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return failAndReturnOriginal(new Error('Canvas 2D context unavailable'));
          }

          // Fill with solid white background for transparent PNG/WebP conversion to JPEG
          if (outputType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Standardize filename with appropriate extension
          const originalName = file.name || 'image';
          const baseName = originalName.replace(/\.[^/.]+$/, '');
          const extension = outputType === 'image/jpeg' ? 'jpg' : (outputType.split('/')[1] || 'jpg');
          const finalFileName = `${baseName}.${extension}`;

          if (canvas.toBlob) {
            canvas.toBlob(
              (blob) => {
                cleanup();
                if (!blob) {
                  return resolve(file);
                }
                try {
                  const compressedFile = new File([blob], finalFileName, {
                    type: outputType,
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                } catch {
                  resolve(blob);
                }
              },
              outputType,
              quality
            );
          } else {
            // Fallback for environments lacking canvas.toBlob
            const dataUrl = canvas.toDataURL(outputType, quality);
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || outputType;
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            cleanup();
            try {
              const compressedFile = new File([u8arr], finalFileName, {
                type: mime,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } catch {
              resolve(new Blob([u8arr], { type: mime }));
            }
          }
        } catch (processErr) {
          failAndReturnOriginal(processErr);
        }
      };

      img.onerror = (err) => {
        failAndReturnOriginal(err || new Error('Image decoding failed'));
      };

      if (typeof URL !== 'undefined' && URL.createObjectURL) {
        objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = failAndReturnOriginal;
        reader.readAsDataURL(file);
      }
    } catch (err) {
      failAndReturnOriginal(err);
    }
  });
};
