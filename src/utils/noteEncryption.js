/**
 * Encrypts sensitive pastoral counseling notes using a key-based rotation cipher
 * and encodes the result in Base64 for database safety.
 * 
 * @param {string} noteContent - Plaintext pastoral notes
 * @param {string} secretKey - Encryption secret key
 * @returns {string} - Encrypted cipher text encoded in Base64
 */
export function encryptSensitiveNotes(noteContent, secretKey) {
  if (!noteContent) return '';
  if (!secretKey) return noteContent;

  let cipherText = '';
  for (let i = 0; i < noteContent.length; i++) {
    const charCode = noteContent.charCodeAt(i);
    const keyChar = secretKey.charCodeAt(i % secretKey.length);
    // Shift character code by key character code
    const encryptedChar = String.fromCharCode(charCode + keyChar);
    cipherText += encryptedChar;
  }

  // Convert binary character string to Base64 safely
  return btoa(unescape(encodeURIComponent(cipherText)));
}

/**
 * Decrypts Base64 cipher text using key-based rotation cipher.
 * 
 * @param {string} cipherText - Base64 encoded cipher text
 * @param {string} secretKey - Decryption secret key
 * @returns {string} - Decrypted plaintext notes or error message
 */
export function decryptSensitiveNotes(cipherText, secretKey) {
  if (!cipherText) return '';
  if (!secretKey) return cipherText;

  try {
    // Decode Base64 string safely
    const rawCipherText = decodeURIComponent(escape(atob(cipherText)));
    let decrypted = '';
    
    for (let i = 0; i < rawCipherText.length; i++) {
      const charCode = rawCipherText.charCodeAt(i);
      const keyChar = secretKey.charCodeAt(i % secretKey.length);
      // Shift back by key character code
      const decryptedChar = String.fromCharCode(charCode - keyChar);
      decrypted += decryptedChar;
    }
    
    return decrypted;
  } catch (err) {
    return 'Decryption failed: invalid key or corrupted payload.';
  }
}
