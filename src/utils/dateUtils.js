import { parseISO, isValid } from 'date-fns';

/**
 * Safely converts various date formats (ISO string, Firestore Timestamp, Date object)
 * to a standard JavaScript Date object.
 */
export const safeParseDate = (dateVal) => {
  if (!dateVal) return new Date();
  
  // Handle Firestore Timestamp
  if (typeof dateVal.toDate === 'function') {
    return dateVal.toDate();
  }
  
  // Handle object with seconds/nanoseconds (raw Firestore Timestamp)
  if (dateVal && typeof dateVal === 'object' && 'seconds' in dateVal) {
    return new Date(dateVal.seconds * 1000 + (dateVal.nanoseconds || 0) / 1000000);
  }

  // Handle ISO strings or other string formats
  if (typeof dateVal === 'string') {
    const parsed = parseISO(dateVal);
    if (isValid(parsed)) return parsed;
    const fallback = new Date(dateVal);
    return isValid(fallback) ? fallback : new Date();
  }

  // Handle Date objects
  if (dateVal instanceof Date && isValid(dateVal)) {
    return dateVal;
  }

  return new Date();
};

/**
 * Returns a YYYY-MM-DD string from various date formats.
 */
export const getISOStringDate = (dateVal) => {
  try {
    const date = safeParseDate(dateVal);
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error("Error formatting date:", e);
    return new Date().toISOString().split('T')[0];
  }
};
