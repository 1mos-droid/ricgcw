/**
 * Generates pairing security tokens for child check-in labels and guardian apps.
 * 
 * @returns {Object} - Matching child and parent security tokens
 */
export function generateSecurityTokens() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  // Generate a random 8-character token
  for (let i = 0; i < 8; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    token += chars[idx];
  }
  return {
    childToken: token,
    parentToken: token
  };
}

/**
 * Verifies matching guardian/child security tokens within a 12-hour TTL.
 * 
 * @param {string} childToken - Token on child label
 * @param {string} parentToken - Token scanned from parent app/ticket
 * @param {number|string|Date} tokenTimestamp - Creation timestamp of the token
 * @returns {boolean} - True if tokens match and are active within TTL
 */
export function verifySecurityToken(childToken, parentToken, tokenTimestamp) {
  if (!childToken || !parentToken || childToken !== parentToken) {
    return false;
  }

  const TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  const createdTime = new Date(tokenTimestamp).getTime();
  const elapsed = Date.now() - createdTime;

  if (elapsed > TTL || elapsed < 0) {
    return false; // Token expired or invalid timestamp
  }

  return true;
}
