import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createEvent, 
  updateVolunteerSlots, 
  getEvents, 
  updateEvent, 
  deleteEvent,
  validateEventData 
} from './eventService';
import * as firestore from 'firebase/firestore';

vi.mock('../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, name) => ({ path: name })),
  doc: vi.fn((db, name, id) => ({ path: `${name}/${id}`, id })),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn()
}));

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateEventData', () => {
    it('rejects invalid inputs', () => {
      expect(validateEventData(null).valid).toBe(false);
      expect(validateEventData({}).valid).toBe(false);
      expect(validateEventData({ title: 'Service' }).valid).toBe(false);
    });

    it('accepts valid payload', () => {
      expect(validateEventData({ title: 'Sunday Worship', date: '2026-09-27' }).valid).toBe(true);
    });
  });

  describe('createEvent', () => {
    it('creates an event document with defaults', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'event-101' });

      const result = await createEvent({
        title: 'Midweek Communion Service',
        date: '2026-09-23'
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('event-101');
      expect(result.data.title).toBe('Midweek Communion Service');
      expect(result.data.location).toBe('Main Auditorium');
      expect(result.data.volunteerSlots).toEqual([]);
      expect(firestore.addDoc).toHaveBeenCalled();
    });

    it('returns error if title is missing', async () => {
      const result = await createEvent({ date: '2026-09-23' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('title is required');
      expect(firestore.addDoc).not.toHaveBeenCalled();
    });
  });

  describe('updateVolunteerSlots', () => {
    it('updates volunteer slots on the event document', async () => {
      firestore.setDoc.mockResolvedValueOnce();

      const slots = [
        { role: 'Usher', required: 4, assigned: ['Brother A', 'Sister B'] }
      ];

      const result = await updateVolunteerSlots('event-101', slots);
      expect(result.success).toBe(true);
      expect(result.data.volunteerSlots).toEqual(slots);
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'event-101' }),
        expect.objectContaining({ volunteerSlots: slots }),
        { merge: true }
      );
    });

    it('returns error if slots is not an array', async () => {
      const result = await updateVolunteerSlots('event-101', 'invalid');
      expect(result.success).toBe(false);
      expect(result.error).toContain('must be an array');
    });
  });

  describe('getEvents', () => {
    it('fetches all events', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [
          { id: 'e1', data: () => ({ title: 'Event 1' }) },
          { id: 'e2', data: () => ({ title: 'Event 2' }) }
        ]
      });

      const result = await getEvents();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('updateEvent', () => {
    it('updates event fields', async () => {
      firestore.setDoc.mockResolvedValueOnce();

      const result = await updateEvent('e1', { time: '9:00 AM' });
      expect(result.success).toBe(true);
      expect(result.data.time).toBe('9:00 AM');
    });
  });

  describe('deleteEvent', () => {
    it('deletes event document', async () => {
      firestore.deleteDoc.mockResolvedValueOnce();

      const result = await deleteEvent('e1');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('e1');
      expect(firestore.deleteDoc).toHaveBeenCalled();
    });
  });
});
