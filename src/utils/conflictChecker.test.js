import { describe, it, expect } from 'vitest';
import { resolveResourceConflict } from './conflictChecker';

describe('Logistics Resource Conflict Resolver', () => {
  const proposedBooking = {
    roomId: 'sanctuary',
    assetId: 'sound-system-1',
    start: '2026-06-03T18:00:00Z',
    end: '2026-06-03T20:00:00Z',
    groupSize: 120
  };

  const existingBookings = [
    {
      roomId: 'sanctuary',
      assetId: 'sound-system-1',
      start: '2026-06-03T19:00:00Z', // Overlaps proposed booking
      end: '2026-06-03T21:00:00Z'
    }
  ];

  const maintenanceSlots = [
    {
      assetId: 'sound-system-1',
      start: '2026-06-03T08:00:00Z',
      end: '2026-06-03T10:00:00Z'
    }
  ];

  it('detects double-booking conflict for overlapping timelines', () => {
    const result = resolveResourceConflict(proposedBooking, existingBookings, maintenanceSlots, 150);
    expect(result.conflict).toBe(true);
    expect(result.type).toBe('double_booking');
  });

  it('detects asset maintenance conflicts', () => {
    const maintenanceConflictBooking = {
      roomId: 'sanctuary',
      assetId: 'sound-system-1',
      start: '2026-06-03T09:00:00Z', // Overlaps maintenance slot
      end: '2026-06-03T11:00:00Z',
      groupSize: 50
    };

    const result = resolveResourceConflict(maintenanceConflictBooking, [], maintenanceSlots, 150);
    expect(result.conflict).toBe(true);
    expect(result.type).toBe('maintenance');
  });

  it('detects capacity exceeded blocks', () => {
    const largeGroupBooking = {
      roomId: 'chapel-room-b',
      assetId: 'keyboard-1',
      start: '2026-06-03T14:00:00Z',
      end: '2026-06-03T16:00:00Z',
      groupSize: 80 // Exceeds room capacity of 50
    };

    const result = resolveResourceConflict(largeGroupBooking, [], [], 50);
    expect(result.conflict).toBe(true);
    expect(result.type).toBe('capacity_exceeded');
  });

  it('returns conflict: false for safe bookings', () => {
    const safeBooking = {
      roomId: 'chapel-room-b',
      assetId: 'keyboard-1',
      start: '2026-06-03T12:00:00Z',
      end: '2026-06-03T13:00:00Z',
      groupSize: 30
    };

    const result = resolveResourceConflict(safeBooking, [], [], 50);
    expect(result.conflict).toBe(false);
  });
});
