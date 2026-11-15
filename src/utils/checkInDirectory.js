import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// The public QR check-in page must let visitors find their name without being
// able to read member records (phone, address, date of birth...). Staff publish
// this names-only roster instead; it is the only member data readable without
// signing in.
const DIRECTORY_COLLECTION = 'checkin_directory';
const DIRECTORY_DOC = 'all';

/**
 * Reduces member records to the fields the check-in search needs.
 * @param {Array<object>} members - Full member records.
 * @returns {Array<{id: string, name: string, memberId: string, branch: string, department: string}>}
 */
export const toDirectoryEntries = (members) =>
  (members || [])
    .filter((m) => m && m.id && String(m.name || '').trim())
    .map((m) => ({
      id: String(m.id),
      name: String(m.name).trim(),
      memberId: m.memberId ? String(m.memberId) : '',
      branch: m.branch ? String(m.branch) : '',
      department: m.department ? String(m.department) : '',
    }));

/**
 * Publishes the names-only roster used by the public check-in page.
 * @param {Array<object>} members - Full member records (staff only).
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const publishCheckInDirectory = async (members) => {
  try {
    await setDoc(doc(db, DIRECTORY_COLLECTION, DIRECTORY_DOC), {
      entries: toDirectoryEntries(members),
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (err) {
    console.error('Check-in Directory Publish Error:', err?.code || err?.message);
    return { success: false, error: err?.message || 'Failed to publish the check-in directory.' };
  }
};

/**
 * Loads the names-only roster for the public check-in page.
 * @returns {Promise<{success: boolean, data: Array<object>, error?: string}>}
 */
export const fetchCheckInDirectory = async () => {
  try {
    const snapshot = await getDoc(doc(db, DIRECTORY_COLLECTION, DIRECTORY_DOC));
    return { success: true, data: snapshot.exists() ? snapshot.data().entries || [] : [] };
  } catch (err) {
    console.error('Check-in Directory Fetch Error:', err?.code || err?.message);
    return { success: false, data: [], error: err?.message || 'Failed to load the check-in directory.' };
  }
};
