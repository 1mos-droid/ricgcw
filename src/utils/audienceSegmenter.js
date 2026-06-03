/**
 * Dynamically queries and filters a list of members based on variable criteria.
 * 
 * @param {Array} members - List of all member profiles
 * @param {Object} criteria - Filtering keys: { branch, completedClass, minAge, maxAge }
 * @param {string|Date} [currentDate] - Evaluation baseline date
 * @returns {Array} - Matching members list
 */
export function segmentAudienceDynamically(members = [], criteria = {}, currentDate = new Date()) {
  const refDate = new Date(currentDate);

  const calculateAgeAtDate = (dobString, ref) => {
    if (!dobString) return 0;
    const birth = new Date(dobString);
    let age = ref.getFullYear() - birth.getFullYear();
    const m = ref.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return members.filter((m) => {
    // 1. Campus branch filter
    if (criteria.branch && m.branch !== criteria.branch) {
      return false;
    }

    // 2. Growth class filter
    if (criteria.completedClass) {
      const hasClass = Array.isArray(m.completedClasses) && m.completedClasses.includes(criteria.completedClass);
      if (!hasClass) return false;
    }

    // 3. Age filter
    if (criteria.minAge || criteria.maxAge) {
      if (!m.dob) return false; // Exclude profiles without dob when age criteria is requested
      
      const age = calculateAgeAtDate(m.dob, refDate);
      if (criteria.minAge && age < criteria.minAge) return false;
      if (criteria.maxAge && age > criteria.maxAge) return false;
    }

    return true;
  });
}
