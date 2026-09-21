import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createMember, 
  updateMember, 
  deleteMember, 
  getMembers, 
  getMemberById,
  validateMemberData 
} from './memberService';
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
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn()
}));

describe('memberService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateMemberData', () => {
    it('returns error if memberData is missing or non-object', () => {
      expect(validateMemberData(null).valid).toBe(false);
      expect(validateMemberData('invalid').valid).toBe(false);
    });

    it('returns error if name is empty or missing', () => {
      expect(validateMemberData({}).valid).toBe(false);
      expect(validateMemberData({ name: '  ' }).valid).toBe(false);
    });

    it('returns valid: true for valid payload', () => {
      expect(validateMemberData({ name: 'Sister Mary' }).valid).toBe(true);
    });
  });

  describe('createMember', () => {
    it('creates member and returns standardized success response', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'member-123' });

      const result = await createMember({
        name: 'Brother Joseph',
        email: 'joseph@example.com',
        phone: '0241234567'
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('member-123');
      expect(result.data.name).toBe('Brother Joseph');
      expect(result.data.status).toBe('active');
      expect(result.data.branch).toBe('Main');
      expect(firestore.addDoc).toHaveBeenCalled();
    });

    it('returns validation error without calling firestore if name is missing', async () => {
      const result = await createMember({ email: 'test@example.com' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('name is required');
      expect(firestore.addDoc).not.toHaveBeenCalled();
    });

    it('catches firestore error and returns standardized failure', async () => {
      firestore.addDoc.mockRejectedValueOnce(new Error('Network offline'));
      const result = await createMember({ name: 'Pastor Paul' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network offline');
    });
  });

  describe('updateMember', () => {
    it('updates member document with updatedAt timestamp', async () => {
      firestore.setDoc.mockResolvedValueOnce();

      const result = await updateMember('member-123', { phone: '0559876543' });
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('member-123');
      expect(result.data.phone).toBe('0559876543');
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'member-123' }),
        expect.objectContaining({ phone: '0559876543' }),
        { merge: true }
      );
    });

    it('returns failure if memberId is invalid', async () => {
      const result = await updateMember('', { phone: '123' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Valid member ID is required');
    });

    it('catches error and returns failure on setDoc rejection', async () => {
      firestore.setDoc.mockRejectedValueOnce(new Error('Permission denied'));
      const result = await updateMember('member-123', { name: 'Test' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });
  });

  describe('deleteMember', () => {
    it('hard deletes member by default', async () => {
      firestore.deleteDoc.mockResolvedValueOnce();

      const result = await deleteMember('member-123');
      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(true);
      expect(firestore.deleteDoc).toHaveBeenCalled();
    });

    it('soft deletes member by setting status to archived when soft=true', async () => {
      firestore.setDoc.mockResolvedValueOnce();

      const result = await deleteMember('member-123', { soft: true });
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('archived');
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'member-123' }),
        expect.objectContaining({ status: 'archived' }),
        { merge: true }
      );
      expect(firestore.deleteDoc).not.toHaveBeenCalled();
    });

    it('returns error if memberId is missing', async () => {
      const result = await deleteMember(null);
      expect(result.success).toBe(false);
    });
  });

  describe('getMembers', () => {
    it('returns all members mapped from docs', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [
          { id: 'm1', data: () => ({ name: 'John' }) },
          { id: 'm2', data: () => ({ name: 'Jane' }) }
        ]
      });

      const result = await getMembers();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({ id: 'm1', name: 'John' });
    });

    it('catches and reports error if fetch fails', async () => {
      firestore.getDocs.mockRejectedValueOnce(new Error('Failed to load'));
      const result = await getMembers();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load');
    });
  });

  describe('getMemberById', () => {
    it('returns member data if found', async () => {
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'm1',
        data: () => ({ name: 'John' })
      });

      const result = await getMemberById('m1');
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('John');
    });

    it('returns error if member does not exist', async () => {
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const result = await getMemberById('m999');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Member not found');
    });
  });
});
