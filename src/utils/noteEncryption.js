import CryptoJS from 'crypto-js';

/**
 * Encrypts sensitive pastoral counseling notes using AES-256 encryption.
 * 
 * @param {string} noteContent - Plaintext pastoral notes
 * @param {string} secretKey - Encryption secret key
 * @returns {string} - Encrypted cipher text (AES-256)
 */
export function encryptSensitiveNotes(noteContent, secretKey) {
  if (!noteContent) return '';
  if (!secretKey) return noteContent;

  try {
    return CryptoJS.AES.encrypt(noteContent, secretKey).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return noteContent; // Fallback to plain text if encryption fails
  }
}

/**
 * Decrypts AES-256 cipher text.
 * 
 * @param {string} cipherText - AES-256 encrypted cipher text
 * @param {string} secretKey - Decryption secret key
 * @returns {string} - Decrypted plaintext notes or error message
 */
export function decryptSensitiveNotes(cipherText, secretKey) {
  if (!cipherText) return '';
  if (!secretKey) return cipherText;

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
        throw new Error('Invalid key or corrupted payload');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return 'Decryption failed: invalid key or corrupted payload.';
  }
}
