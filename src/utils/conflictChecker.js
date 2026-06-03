/**
 * Validates whether a proposed booking conflicts with existing bookings,
 * maintenance slots, or exceeds room capacities.
 * 
 * @param {Object} proposed - Proposed booking: { roomId, assetId, start, end, groupSize }
 * @param {Array} existing - List of existing bookings
 * @param {Array} maintenance - List of asset maintenance schedules
 * @param {number} capacity - Maximum capacity of the room
 * @returns {Object} - Conflict details: { conflict: boolean, type?: string, message?: string }
 */
export function resolveResourceConflict(proposed, existing = [], maintenance = [], capacity = 999999) {
  // 1. Capacity check
  if (proposed.groupSize && proposed.groupSize > capacity) {
    return {
      conflict: true,
      type: 'capacity_exceeded',
      message: 'Group size exceeds maximum room capacity.'
    };
  }

  const pStart = new Date(proposed.start).getTime();
  const pEnd = new Date(proposed.end).getTime();

  // Overlap checker helper: true if two date intervals intersect
  const isOverlapping = (startA, endA, startB, endB) => {
    return Math.max(startA, startB) < Math.min(endA, endB);
  };

  // 2. Check overlap with maintenance schedules
  for (const m of maintenance) {
    if (m.assetId === proposed.assetId) {
      const mStart = new Date(m.start).getTime();
      const mEnd = new Date(m.end).getTime();
      if (isOverlapping(pStart, pEnd, mStart, mEnd)) {
        return {
          conflict: true,
          type: 'maintenance',
          message: 'Asset is undergoing scheduled maintenance.'
        };
      }
    }
  }

  // 3. Check overlap with existing bookings (same asset or same room)
  for (const e of existing) {
    const isSameAsset = proposed.assetId && e.assetId === proposed.assetId;
    const isSameRoom = proposed.roomId && e.roomId === proposed.roomId;
    
    if (isSameAsset || isSameRoom) {
      const eStart = new Date(e.start).getTime();
      const eEnd = new Date(e.end).getTime();
      if (isOverlapping(pStart, pEnd, eStart, eEnd)) {
        return {
          conflict: true,
          type: 'double_booking',
          message: 'Asset already booked for this timeline.'
        };
      }
    }
  }

  return { conflict: false };
}
