import { describe, it, expect } from 'vitest';
import { getUpcomingEvents } from './eventFilters';

describe('getUpcomingEvents helper', () => {
  const mockEvents = [
    {
      id: '1',
      name: 'Past Event',
      date: '2026-06-01T00:00:00.000Z',
      time: '18:00'
    },
    {
      id: '2',
      name: 'Far Future Event',
      date: '2026-06-30T00:00:00.000Z',
      time: '10:00'
    },
    {
      id: '3',
      name: 'Near Future Event',
      date: '2026-06-25T00:00:00.000Z',
      time: '09:00'
    }
  ];

  it('should filter out past events and return upcoming events sorted ascendingly', () => {
    // Reference date: June 20, 2026
    const refDate = new Date('2026-06-20T12:00:00.000Z');
    const results = getUpcomingEvents(mockEvents, refDate);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('3'); // Near Future Event (June 25)
    expect(results[1].id).toBe('2'); // Far Future Event (June 30)
  });

  it('should return empty list if all events are in the past', () => {
    const refDate = new Date('2026-07-01T12:00:00.000Z');
    const results = getUpcomingEvents(mockEvents, refDate);

    expect(results).toHaveLength(0);
  });

  it('should handle null, empty or invalid parameters gracefully', () => {
    expect(getUpcomingEvents(null, new Date())).toEqual([]);
    expect(getUpcomingEvents(undefined, new Date())).toEqual([]);
    expect(getUpcomingEvents([], new Date())).toEqual([]);
  });
});
