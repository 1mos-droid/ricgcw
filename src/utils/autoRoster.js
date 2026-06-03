/**
 * Automatically assigns volunteers to open ministry slots.
 * Matches on requested role, day of availability, and serving gap preferences.
 * 
 * @param {Array} slots - Roster slots: { id, role, serviceDate, dayOfWeek }
 * @param {Array} volunteers - Volunteers list: { id, name, roles, availability, lastServed, gapWeeks }
 * @returns {Array} - List of slot assignments: { slotId, volunteerId, volunteerName }
 */
export function autoAssignVolunteers(slots = [], volunteers = []) {
  const assignments = [];
  const assignedDatesByVolunteer = {};

  for (const slot of slots) {
    const roleNeeded = slot.role;
    const dayNeeded = slot.dayOfWeek;
    const serviceDateTime = new Date(slot.serviceDate).getTime();

    // Filter potential candidates matching role and availability rules
    const candidates = volunteers.filter((v) => {
      // Role match check
      const hasRole = Array.isArray(v.roles) && v.roles.includes(roleNeeded);
      if (!hasRole) return false;

      // Availability check
      const isAvailable = Array.isArray(v.availability) && v.availability.includes(dayNeeded);
      if (!isAvailable) return false;

      // Serve gap checks
      if (v.lastServed) {
        const lastServedTime = new Date(v.lastServed).getTime();
        const weeksElapsed = (serviceDateTime - lastServedTime) / (7 * 24 * 60 * 60 * 1000);
        const gapRequired = Number(v.gapWeeks) || 1;
        if (weeksElapsed < gapRequired) {
          return false; // Does not satisfy preferred gap limit
        }
      }

      // Avoid double scheduling on the same day
      if (assignedDatesByVolunteer[v.id]?.includes(serviceDateTime)) {
        return false;
      }

      return true;
    });

    // Select candidate that served least recently (to balance coordination workload)
    candidates.sort((a, b) => {
      const lastA = a.lastServed ? new Date(a.lastServed).getTime() : 0;
      const lastB = b.lastServed ? new Date(b.lastServed).getTime() : 0;
      return lastA - lastB;
    });

    if (candidates.length > 0) {
      const selected = candidates[0];
      assignments.push({
        slotId: slot.id,
        volunteerId: selected.id,
        volunteerName: selected.name,
      });

      if (!assignedDatesByVolunteer[selected.id]) {
        assignedDatesByVolunteer[selected.id] = [];
      }
      assignedDatesByVolunteer[selected.id].push(serviceDateTime);
    }
  }

  return assignments;
}
