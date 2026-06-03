import { describe, it, expect } from 'vitest';
import { encryptSensitiveNotes, decryptSensitiveNotes } from './noteEncryption';

describe('Pastoral Note Field-Level Cryptography Helper', () => {
  const noteText = 'The member requested counseling for family transitions.';
  const secretKey = 'pastor-secure-key-777';

  it('encrypts and decrypts notes successfully using the same secret key', () => {
    const cipherText = encryptSensitiveNotes(noteText, secretKey);
    expect(cipherText).toBeDefined();
    expect(cipherText).not.toBe(noteText);

    const decrypted = decryptSensitiveNotes(cipherText, secretKey);
    expect(decrypted).toBe(noteText);
  });

  it('fails to decrypt or returns corrupted results when using the wrong key', () => {
    const cipherText = encryptSensitiveNotes(noteText, secretKey);
    
    // Decrypting with wrong key
    const corruptedDecryption = decryptSensitiveNotes(cipherText, 'wrong-key');
    expect(corruptedDecryption).not.toBe(noteText);
  });
});
