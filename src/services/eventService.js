/**
 * Event Service - Church events, volunteer assignments, and scheduling.
 * Decouples Firestore operations from React UI components per architectural decision D-03/D-04.
 *
 * @module services/eventService
 */

import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';

/**
 * Standard response shape returned by all service functions.
 * @typedef {Object} ServiceResponse
 * @property {boolean} success - Whether operation succeeded
 * @property {any} [data] - Returned payload on success
 * @property {string} [error] - Error message on failure
 */

/**
 * Validates event payload.
 * @param {Object} data 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateEventData = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Event data must be an object' };
  }
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    return { valid: false, error: 'Event title is required' };
  }
  if (!data.date || typeof data.date !== 'string') {
    return { valid: false, error: 'Event date is required' };
  }
  return { valid: true };
};

/**
 * Creates a new church event.
 * 
 * @param {Object} eventData - Event details
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const createEvent = async (eventData) => {
  try {
    const validation = validateEventData(eventData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const payload = {
      ...eventData,
      title: eventData.title.trim(),
      date: eventData.date,
      time: eventData.time || '10:00 AM',
      location: eventData.location || 'Main Auditorium',
      branch: eventData.branch || 'Main',
      volunteerSlots: eventData.volunteerSlots || [],
      createdAt: eventData.createdAt || new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), payload);
    return { 
      success: true, 
      data: { id: docRef.id, ...payload } 
    };
  } catch (err) {
    console.error('eventService.createEvent error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to create event' 
    };
  }
};

/**
 * Updates volunteer slots for an event.
 * 
 * @param {string} eventId - Target event document ID
 * @param {Array<Object>} slots - Updated array of volunteer assignment slots
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const updateVolunteerSlots = async (eventId, slots) => {
  try {
    if (!eventId) {
      return { success: false, error: 'Event ID is required' };
    }
    if (!Array.isArray(slots)) {
      return { success: false, error: 'Volunteer slots must be an array' };
    }

    const payload = {
      volunteerSlots: slots,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, EVENTS_COLLECTION, eventId), payload, { merge: true });
    return { 
      success: true, 
      data: { id: eventId, ...payload } 
    };
  } catch (err) {
    console.error(`eventService.updateVolunteerSlots error for ${eventId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to update volunteer slots' 
    };
  }
};

/**
 * Fetches all events from Firestore.
 * 
 * @returns {Promise<ServiceResponse>} List of all events
 */
export const getEvents = async () => {
  try {
    const snapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    const events = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return { success: true, data: events };
  } catch (err) {
    console.error('eventService.getEvents error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to fetch events' 
    };
  }
};

/**
 * Updates an event's details.
 * 
 * @param {string} eventId 
 * @param {Object} updates 
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const updateEvent = async (eventId, updates) => {
  try {
    if (!eventId) {
      return { success: false, error: 'Event ID is required' };
    }
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, EVENTS_COLLECTION, eventId), payload, { merge: true });
    return { success: true, data: { id: eventId, ...payload } };
  } catch (err) {
    console.error(`eventService.updateEvent error for ${eventId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to update event' 
    };
  }
};

/**
 * Deletes an event by document ID.
 * 
 * @param {string} eventId 
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const deleteEvent = async (eventId) => {
  try {
    if (!eventId) {
      return { success: false, error: 'Event ID is required' };
    }
    await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
    return { success: true, data: { id: eventId } };
  } catch (err) {
    console.error(`eventService.deleteEvent error for ${eventId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to delete event' 
    };
  }
};
