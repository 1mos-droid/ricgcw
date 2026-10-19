import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@huggingface/hub', () => ({
  commit: vi.fn().mockResolvedValue({ commitOid: 'mock-commit-123' })
}));

vi.mock('./imageCompressor', () => ({
  compressImage: vi.fn(async () => {
    // Return simulated compressed file
    return new File(['compressed content'], 'compressed.jpg', { type: 'image/jpeg' });
  })
}));

import { commit } from '@huggingface/hub';
import { compressImage } from './imageCompressor';
import { uploadToHuggingFace } from './huggingFaceApi';

describe('huggingFaceApi uploadToHuggingFace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('compresses image prior to committing to Hugging Face Hub', async () => {
    const rawFile = new File(['massive-phone-photo'], 'IMG_1234.HEIC', { type: 'image/heic' });
    
    const resultUrl = await uploadToHuggingFace(rawFile);

    // Verify compressImage was called with the raw file
    expect(compressImage).toHaveBeenCalledWith(rawFile);

    // Verify commit was called with compressed file
    expect(commit).toHaveBeenCalledTimes(1);
    const commitArg = vi.mocked(commit).mock.calls[0][0];
    expect(commitArg.operations[0].content.name).toBe('compressed.jpg');
    expect(resultUrl).toContain('https://huggingface.co/datasets/');
    expect(resultUrl).toContain('?download=true');
  });

  it('throws an error if commit fails', async () => {
    vi.mocked(commit).mockRejectedValueOnce(new Error('Network failure'));

    const file = new File(['data'], 'test.png', { type: 'image/png' });
    await expect(uploadToHuggingFace(file)).rejects.toThrow('Upload failed: Network failure');
  });
});
