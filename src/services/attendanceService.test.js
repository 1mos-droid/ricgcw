import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  recordAttendance, 
  getAttendanceByDate, 
  deleteAttendanceRecord,
  getAttendanceRecords,
  updateAttendanceRecord,
  validateAttendanceData 
} from './attendanceService';
import * as firestore from 'firebase/firestore';

vi.mock('../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, name) => ({ path: name })),
  doc: vi.fn((db, name, id) => ({ path: `${name}/${id}`, id })),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn()
}));

describe('attendanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateAttendanceData', () => {
    it('rejects null or non-object payloads', () => {
      expect(validateAttendanceData(null).valid).toBe(false);
      expect(validateAttendanceData('2026-09-21').valid).toBe(false);
    });

    it('rejects payload missing date', () => {
      expect(validateAttendanceData({ serviceType: 'sunday' }).valid).toBe(false);
    });

    it('accepts valid payload with date', () => {
      expect(validateAttendanceData({ date: '2026-09-21' }).valid).toBe(true);
    });
  });

  describe('recordAttendance', () => {
    it('creates a new attendance record if none exists', async () => {
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => false
      });
      firestore.setDoc.mockResolvedValueOnce();

      const result = await recordAttendance({
        date: '2026-09-21',
        serviceType: 'Sunday Service',
        attendees: [{ id: 'm1', name: 'John Doe' }]
      });

      expect(result.success).toBe(true);
      expect(result.data.date).toBe('2026-09-21');
      expect(result.data.count).toBe(1);
      expect(firestore.setDoc).toHaveBeenCalled();
    });

    it('appends attendee if document exists and attendee is not duplicated', async () => {
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          date: '2026-09-21',
          attendees: [{ id: 'm1', name: 'John Doe' }]
        })
      });
      firestore.setDoc.mockResolvedValueOnce();

      const result = await recordAttendance({
        date: '2026-09-21',
        serviceType: 'Sunday Service',
        newAttendee: { id: 'm2', name: 'Jane Doe' }
      });

      expect(result.success).toBe(true);
      expect(result.data.attendees).toHaveLength(2);
      expect(result.data.count).toBe(2);
    });

    it('rejects duplicate check-in for the same attendee on the same date', async () => {
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          date: '2026-09-21',
          attendees: [{ id: 'm1', name: 'John Doe' }]
        })
      });

      const result = await recordAttendance({
        date: '2026-09-21',
        serviceType: 'Sunday Service',
        newAttendee: { id: 'm1', name: 'John Doe' }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already checked in');
      expect(firestore.setDoc).not.toHaveBeenCalled();
    });

    it('catches firestore exceptions gracefully', async () => {
      firestore.getDoc.mockRejectedValueOnce(new Error('Firestore connection timeout'));

      const result = await recordAttendance({ date: '2026-09-21' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Firestore connection timeout');
    });
  });

  describe('getAttendanceByDate', () => {
    it('returns filtered records matching date', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [
          { id: 'rec-1', data: () => ({ date: '2026-09-21', count: 45 }) },
          { id: 'rec-2', data: () => ({ date: '2026-09-20', count: 30 }) }
        ]
      });

      const result = await getAttendanceByDate('2026-09-21');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('rec-1');
    });

    it('returns failure if date is omitted', async () => {
      const result = await getAttendanceByDate('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Date is required');
    });
  });

  describe('deleteAttendanceRecord', () => {
    it('deletes document and returns success', async () => {
      firestore.deleteDoc.mockResolvedValueOnce();

      const result = await deleteAttendanceRecord('rec-1');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('rec-1');
      expect(firestore.deleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'rec-1' })
      );
    });

    it('returns failure if recordId is missing', async () => {
      const result = await deleteAttendanceRecord(null);
      expect(result.success).toBe(false);
    });
  });

  describe('getAttendanceRecords', () => {
    it('returns all attendance documents from collection', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [
          { id: 'rec-1', data: () => ({ date: '2026-09-21', count: 10 }) },
          { id: 'rec-2', data: () => ({ date: '2026-09-20', count: 15 }) }
        ]
      });

      const result = await getAttendanceRecords();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('rec-1');
    });

    it('handles errors gracefully', async () => {
      firestore.getDocs.mockRejectedValueOnce(new Error('Fetch failed'));
      const result = await getAttendanceRecords();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });

  describe('updateAttendanceRecord', () => {
    it('updates record and recalculates count if attendees passed', async () => {
      firestore.setDoc.mockResolvedValueOnce();

      const result = await updateAttendanceRecord('rec-1', {
        attendees: [{ id: 'm1', name: 'John' }, { id: 'm2', name: 'Jane' }]
      });

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(2);
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'rec-1' }),
        expect.objectContaining({ count: 2 }),
        { merge: true }
      );
    });

    it('returns error if recordId is missing', async () => {
      const result = await updateAttendanceRecord(null, {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Record ID is required');
    });
  });
});
