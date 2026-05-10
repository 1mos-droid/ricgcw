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

/**
 * Calculates age from a date value.
 */
export const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = safeParseDate(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Determines the correct department based on age.
 * Under 13: Children's Court
 * 13 and above: Youth
 * (Can be extended for other departments)
 */
export const getDepartmentByAge = (dob) => {
  const age = calculateAge(dob);
  if (age === null) return null;
  
  if (age < 13) return "Children's Court";
  if (age >= 13 && age < 35) return "Youth"; // Example upper bound for Youth
  
  return null; // Return null if no age-based department applies (e.g. for adults)
};
