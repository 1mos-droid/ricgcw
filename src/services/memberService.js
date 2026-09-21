/**
 * Member Service - Centralized data access and mutations for church members.
 * Decouples Firestore operations from React UI components per architectural decision D-03/D-04.
 *
 * @module services/memberService
 */

import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';

const MEMBERS_COLLECTION = 'members';

/**
 * Standard response shape returned by all service functions.
 * @typedef {Object} ServiceResponse
 * @property {boolean} success - Whether operation succeeded
 * @property {any} [data] - Returned payload on success
 * @property {string} [error] - Error message on failure
 */

/**
 * Validates member data before creation.
 * @param {Object} memberData 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateMemberData = (memberData) => {
  if (!memberData || typeof memberData !== 'object') {
    return { valid: false, error: 'Member data must be a valid object' };
  }
  if (!memberData.name || typeof memberData.name !== 'string' || !memberData.name.trim()) {
    return { valid: false, error: 'Member full name is required' };
  }
  return { valid: true };
};

/**
 * Creates a new member document in Firestore.
 * 
 * @param {Object} memberData - Member details (name, email, phone, branch, etc.)
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const createMember = async (memberData) => {
  try {
    const validation = validateMemberData(memberData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const payload = {
      ...memberData,
      name: memberData.name.trim(),
      email: memberData.email ? String(memberData.email).trim().toLowerCase() : null,
      phone: memberData.phone ? String(memberData.phone).trim() : null,
      branch: memberData.branch ? String(memberData.branch).trim() : 'Main',
      status: memberData.status || 'active',
      createdAt: memberData.createdAt || new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), payload);
    return { 
      success: true, 
      data: { id: docRef.id, ...payload } 
    };
  } catch (err) {
    console.error('memberService.createMember error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to create member record' 
    };
  }
};

/**
 * Updates an existing member document.
 * 
 * @param {string} memberId - ID of member to update
 * @param {Object} updates - Fields to merge into member document
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const updateMember = async (memberId, updates) => {
  try {
    if (!memberId || typeof memberId !== 'string') {
      return { success: false, error: 'Valid member ID is required for update' };
    }
    if (!updates || typeof updates !== 'object') {
      return { success: false, error: 'Valid update payload is required' };
    }

    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, MEMBERS_COLLECTION, memberId), payload, { merge: true });
    return { 
      success: true, 
      data: { id: memberId, ...payload } 
    };
  } catch (err) {
    console.error(`memberService.updateMember error for ${memberId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to update member record' 
    };
  }
};

/**
 * Deletes or archives a member document.
 * 
 * @param {string} memberId - ID of member
 * @param {Object} [options] - Deletion options
 * @param {boolean} [options.soft=false] - If true, sets status='archived' instead of hard delete
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const deleteMember = async (memberId, { soft = false } = {}) => {
  try {
    if (!memberId || typeof memberId !== 'string') {
      return { success: false, error: 'Valid member ID is required for deletion' };
    }

    if (soft) {
      const payload = { 
        status: 'archived', 
        archivedAt: new Date().toISOString() 
      };
      await setDoc(doc(db, MEMBERS_COLLECTION, memberId), payload, { merge: true });
      return { success: true, data: { id: memberId, status: 'archived' } };
    }

    await deleteDoc(doc(db, MEMBERS_COLLECTION, memberId));
    return { success: true, data: { id: memberId, deleted: true } };
  } catch (err) {
    console.error(`memberService.deleteMember error for ${memberId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to delete member record' 
    };
  }
};

/**
 * Fetches all members from Firestore.
 * 
 * @returns {Promise<ServiceResponse>} List of all member objects with IDs
 */
export const getMembers = async () => {
  try {
    const snapshot = await getDocs(collection(db, MEMBERS_COLLECTION));
    const members = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return { success: true, data: members };
  } catch (err) {
    console.error('memberService.getMembers error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to fetch members' 
    };
  }
};

/**
 * Fetches a single member by document ID.
 * 
 * @param {string} memberId - Member document ID
 * @returns {Promise<ServiceResponse>} Member data or not found error
 */
export const getMemberById = async (memberId) => {
  try {
    if (!memberId) {
      return { success: false, error: 'Member ID is required' };
    }
    const docSnap = await getDoc(doc(db, MEMBERS_COLLECTION, memberId));
    if (!docSnap.exists()) {
      return { success: false, error: 'Member not found' };
    }
    return { 
      success: true, 
      data: { id: docSnap.id, ...docSnap.data() } 
    };
  } catch (err) {
    console.error(`memberService.getMemberById error for ${memberId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to fetch member details' 
    };
  }
};
