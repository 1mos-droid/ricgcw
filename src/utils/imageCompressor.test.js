import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isImageFile, calculateScaledDimensions, compressImage } from './imageCompressor';

describe('imageCompressor utility', () => {
  describe('isImageFile', () => {
    it('returns false for falsy values', () => {
      expect(isImageFile(null)).toBe(false);
      expect(isImageFile(undefined)).toBe(false);
    });

    it('returns true when file.type starts with image/', () => {
      const file = new File(['dummy'], 'poster.jpg', { type: 'image/jpeg' });
      expect(isImageFile(file)).toBe(true);

      const pngFile = new File(['dummy'], 'photo.png', { type: 'image/png' });
      expect(isImageFile(pngFile)).toBe(true);
    });

    it('returns true for common image extensions even when type is empty (mobile camera/heic edge cases)', () => {
      const heicFile = new File(['dummy'], 'IMG_1234.HEIC', { type: '' });
      expect(isImageFile(heicFile)).toBe(true);

      const heifFile = new File(['dummy'], 'IMG_1234.heif', { type: 'application/octet-stream' });
      expect(isImageFile(heifFile)).toBe(true);

      const jpegFile = new File(['dummy'], 'church_event.JPEG', { type: '' });
      expect(isImageFile(jpegFile)).toBe(true);
    });

    it('returns false for non-image files', () => {
      const pdf = new File(['dummy'], 'report.pdf', { type: 'application/pdf' });
      expect(isImageFile(pdf)).toBe(false);

      const text = new File(['dummy'], 'notes.txt', { type: 'text/plain' });
      expect(isImageFile(text)).toBe(false);
    });
  });

  describe('calculateScaledDimensions', () => {
    it('returns original dimensions if already within bounds', () => {
      const dims = calculateScaledDimensions(800, 600, 1920, 1920);
      expect(dims).toEqual({ width: 800, height: 600 });
    });

    it('scales down wide images proportionally', () => {
      // 3840 x 2160 (16:9 4K) scaled to max 1920
      const dims = calculateScaledDimensions(3840, 2160, 1920, 1920);
      expect(dims.width).toBe(1920);
      expect(dims.height).toBe(1080);
    });

    it('scales down tall images proportionally', () => {
      // 2000 x 4000 (1:2 vertical phone shot) scaled to max 1920
      const dims = calculateScaledDimensions(2000, 4000, 1920, 1920);
      expect(dims.height).toBe(1920);
      expect(dims.width).toBe(960);
    });

    it('handles zero or invalid dimensions gracefully', () => {
      const dims = calculateScaledDimensions(0, 0, 1920, 1920);
      expect(dims).toEqual({ width: 1920, height: 1920 });
    });
  });

  describe('compressImage', () => {
    let originalCreateObjectURL;
    let originalRevokeObjectURL;
    let originalImage;

    beforeEach(() => {
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
      originalImage = window.Image;
      URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      window.Image = originalImage;
      vi.restoreAllMocks();
    });

    it('returns non-image files as-is', async () => {
      const nonImage = new File(['text content'], 'doc.pdf', { type: 'application/pdf' });
      const result = await compressImage(nonImage);
      expect(result).toBe(nonImage);
    });

    it('returns SVG vector files as-is without rasterizing', async () => {
      const svg = new File(['<svg></svg>'], 'logo.svg', { type: 'image/svg+xml' });
      const result = await compressImage(svg);
      expect(result).toBe(svg);
    });

    it('falls back to original file if image decoding encounters an error', async () => {
      class FailingImage {
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('Decode error'));
          }, 10);
        }
      }
      window.Image = FailingImage;

      const file = new File(['corrupted'], 'corrupt.jpg', { type: 'image/jpeg' });
      const result = await compressImage(file);
      expect(result).toBe(file);
    });

    it('compresses and outputs a resized JPEG File when canvas is available', async () => {
      const mockBlob = new Blob(['compressed-data'], { type: 'image/jpeg' });
      
      const mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn()
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((cb) => cb(mockBlob))
      };

      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') return mockCanvas;
        return document.createElement(tagName);
      });

      class SuccessfulImage {
        constructor() {
          this.width = 4000;
          this.height = 3000;
          this.naturalWidth = 4000;
          this.naturalHeight = 3000;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 10);
        }
      }
      window.Image = SuccessfulImage;

      const largePhonePhoto = new File(['raw phone photo data'], 'IMG_9999.HEIC', { type: 'image/heic' });
      const result = await compressImage(largePhonePhoto, { maxWidth: 1920, maxHeight: 1920, quality: 0.8 });

      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('IMG_9999.jpg');
      expect(result.type).toBe('image/jpeg');
      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
