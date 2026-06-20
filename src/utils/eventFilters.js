/**
 * Filters and sorts upcoming events from a list.
 * @param {Array} events - The list of all event objects
 * @param {Date} referenceDate - The reference date to compare against (usually current time)
 * @returns {Array} List of upcoming events sorted by date ascending
 */
export const getUpcomingEvents = (events, referenceDate) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  const now = referenceDate || new Date();

  return events
    .filter(event => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      
      // Integrate time if present
      if (event.time && typeof event.time === 'string') {
        const parts = event.time.split(':');
        const hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;
        eventDate.setHours(hours);
        eventDate.setMinutes(minutes);
        eventDate.setSeconds(0);
        eventDate.setMilliseconds(0);
      } else {
        eventDate.setHours(23, 59, 59, 999);
      }
      
      return eventDate >= now;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};
