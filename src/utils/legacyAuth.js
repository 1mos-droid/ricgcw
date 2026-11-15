import { account } from '../appwrite';

/**
 * Why a legacy (Appwrite) credential check did not succeed.
 * - `invalid`: Appwrite positively rejected the email/password pair.
 * - `blocked`: the legacy account was disabled by an administrator.
 * - `rate_limited`: too many attempts for this email; retry later.
 * - `unavailable`: Appwrite could not be reached or refused the request for a
 *   reason unrelated to the password (paused project, unknown origin, network).
 */
export const LEGACY_AUTH_REASONS = {
  INVALID: 'invalid',
  BLOCKED: 'blocked',
  RATE_LIMITED: 'rate_limited',
  UNAVAILABLE: 'unavailable',
};

const classifyLegacyError = (err) => {
  if (err?.type === 'user_invalid_credentials') return LEGACY_AUTH_REASONS.INVALID;
  if (err?.type === 'user_blocked') return LEGACY_AUTH_REASONS.BLOCKED;
  if (err?.code === 429) return LEGACY_AUTH_REASONS.RATE_LIMITED;
  return LEGACY_AUTH_REASONS.UNAVAILABLE;
};

/**
 * Appwrite refuses to create a session while another one is active. Browsers
 * that were signed in before the Firebase migration still hold that old
 * session, so the refusal says nothing about the password being checked.
 */
const isStaleSessionError = (err) =>
  err?.type === 'user_session_already_exists' ||
  (err?.code === 401 && err?.type !== 'user_invalid_credentials' && err?.type !== 'user_blocked');

const clearLegacySession = async () => {
  try {
    await account.deleteSession('current');
  } catch (err) {
    console.warn('Legacy Auth: session cleanup note:', err?.message);
  }
};

/**
 * Verifies an email/password pair against the legacy Appwrite user directory.
 * Never leaves an Appwrite session behind.
 * @param {string} email - Normalised (trimmed, lower-case) email address.
 * @param {string} password - Password the user typed.
 * @returns {Promise<{success: true, name: string} | {success: false, reason: string, error: string}>}
 */
export const verifyLegacyCredentials = async (email, password) => {
  try {
    try {
      await account.createEmailPasswordSession(email, password);
    } catch (firstErr) {
      if (!isStaleSessionError(firstErr)) throw firstErr;
      await clearLegacySession();
      await account.createEmailPasswordSession(email, password);
    }
  } catch (err) {
    console.warn('Legacy Auth: credential check failed:', err?.type || err?.code || err?.message);
    return {
      success: false,
      reason: classifyLegacyError(err),
      error: err?.message || 'Legacy credential check failed.',
    };
  }

  // A created session already proves the password. The profile lookup is only
  // for the display name and can fail where third-party cookies are blocked.
  let name = '';
  try {
    const legacyUser = await account.get();
    name = legacyUser?.name || '';
  } catch (err) {
    console.warn('Legacy Auth: profile lookup skipped:', err?.message);
  }

  await clearLegacySession();
  return { success: true, name };
};
