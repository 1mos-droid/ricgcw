/**
 * Attendance Service - Encapsulates check-ins, attendance tracking, and queries.
 * Decouples Firestore operations from React UI components per architectural decision D-03/D-04.
 *
 * @module services/attendanceService
 */

import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';

const ATTENDANCE_COLLECTION = 'attendance';

/**
 * Standard response shape returned by all service functions.
 * @typedef {Object} ServiceResponse
 * @property {boolean} success - Whether operation succeeded
 * @property {any} [data] - Returned payload on success
 * @property {string} [error] - Error message on failure
 */

/**
 * Validates attendance record payload.
 * @param {Object} data 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateAttendanceData = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Attendance data must be an object' };
  }
  if (!data.date || typeof data.date !== 'string') {
    return { valid: false, error: 'Attendance date is required (YYYY-MM-DD)' };
  }
  return { valid: true };
};

/**
 * Records or updates an attendance entry.
 * Checks for duplicate check-ins if attendeeId is specified.
 * 
 * @param {Object} attendanceData - Attendance payload
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const recordAttendance = async (attendanceData) => {
  try {
    const validation = validateAttendanceData(attendanceData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const recordId = attendanceData.id || `${attendanceData.date}_${attendanceData.serviceType || 'main'}`;
    const recordRef = doc(db, ATTENDANCE_COLLECTION, recordId);
    
    // Check if doc exists to detect duplicate check-ins
    const existingDoc = await getDoc(recordRef);
    if (existingDoc.exists() && attendanceData.newAttendee) {
      const existingAttendees = existingDoc.data().attendees || [];
      const newAtt = attendanceData.newAttendee;
      const isDuplicate = existingAttendees.some(a => {
        const matchId = a.id && newAtt.id && a.id === newAtt.id;
        const matchMemberId = a.memberId && newAtt.memberId && a.memberId === newAtt.memberId;
        return matchId || matchMemberId;
      });
      if (isDuplicate) {
        return { 
          success: false, 
          error: `Member is already checked in for this service (${attendanceData.date})` 
        };
      }
      
      const updatedAttendees = [...existingAttendees, attendanceData.newAttendee];
      const payload = {
        ...existingDoc.data(),
        attendees: updatedAttendees,
        count: updatedAttendees.length,
        updatedAt: new Date().toISOString()
      };
      await setDoc(recordRef, payload, { merge: true });
      return { success: true, data: { id: recordId, ...payload } };
    }

    const payload = {
      serviceType: 'main',
      branch: 'Main',
      recordedBy: 'system',
      createdAt: new Date().toISOString(),
      ...attendanceData,
      count: attendanceData.count ?? (attendanceData.attendees ? attendanceData.attendees.length : 0),
      attendees: attendanceData.attendees || (attendanceData.newAttendee ? [attendanceData.newAttendee] : []),
    };

    await setDoc(recordRef, payload, { merge: true });
    return { 
      success: true, 
      data: { id: recordId, ...payload } 
    };
  } catch (err) {
    console.error('attendanceService.recordAttendance error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to record attendance' 
    };
  }
};

/**
 * Fetches all attendance records.
 * 
 * @returns {Promise<ServiceResponse>} List of all attendance records
 */
export const getAttendanceRecords = async () => {
  try {
    const snapshot = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    const records = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    return { success: true, data: records };
  } catch (err) {
    console.error('attendanceService.getAttendanceRecords error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to fetch attendance records' 
    };
  }
};

/**
 * Fetches attendance records for a specific date or date range.
 * 
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<ServiceResponse>} List of attendance sessions on that date
 */
export const getAttendanceByDate = async (date) => {
  try {
    if (!date) {
      return { success: false, error: 'Date is required to fetch attendance' };
    }
    const snapshot = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    const records = snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter(record => record.date === date);

    return { success: true, data: records };
  } catch (err) {
    console.error(`attendanceService.getAttendanceByDate error for ${date}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to fetch attendance for date' 
    };
  }
};

/**
 * Updates an existing attendance record.
 * 
 * @param {string} recordId
 * @param {Object} updateData
 * @returns {Promise<ServiceResponse>}
 */
export const updateAttendanceRecord = async (recordId, updateData) => {
  try {
    if (!recordId) {
      return { success: false, error: 'Record ID is required for update' };
    }
    const recordRef = doc(db, ATTENDANCE_COLLECTION, recordId);
    const payload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    if (payload.attendees) {
      payload.count = payload.attendees.length;
    }
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    await setDoc(recordRef, payload, { merge: true });
    return { success: true, data: { id: recordId, ...payload } };
  } catch (err) {
    console.error(`attendanceService.updateAttendanceRecord error for ${recordId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to update attendance record' 
    };
  }
};

/**
 * Deletes an attendance record by document ID.
 * 
 * @param {string} recordId 
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const deleteAttendanceRecord = async (recordId) => {
  try {
    if (!recordId) {
      return { success: false, error: 'Record ID is required for deletion' };
    }
    await deleteDoc(doc(db, ATTENDANCE_COLLECTION, recordId));
    return { success: true, data: { id: recordId } };
  } catch (err) {
    console.error(`attendanceService.deleteAttendanceRecord error for ${recordId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to delete attendance record' 
    };
  }
};
