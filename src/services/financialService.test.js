import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  recordTransaction, 
  recordBatchDeposit, 
  getTransactions, 
  updateTransaction,
  deleteTransaction,
  validateTransaction 
} from './financialService';
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

describe('financialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateTransaction', () => {
    it('rejects invalid inputs and non-positive amounts', () => {
      expect(validateTransaction(null).valid).toBe(false);
      expect(validateTransaction({ amount: 0, type: 'tithe' }).valid).toBe(false);
      expect(validateTransaction({ amount: -50, type: 'tithe' }).valid).toBe(false);
      expect(validateTransaction({ amount: 'invalid', type: 'tithe' }).valid).toBe(false);
    });

    it('rejects payload missing type', () => {
      expect(validateTransaction({ amount: 100 }).valid).toBe(false);
    });

    it('accepts valid payload', () => {
      expect(validateTransaction({ amount: 100, type: 'tithe' }).valid).toBe(true);
    });
  });

  describe('recordTransaction', () => {
    it('creates a transaction document with default GHS currency', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'tx-123' });

      const result = await recordTransaction({
        amount: 250,
        type: 'tithe',
        memberName: 'Sister Abigail'
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tx-123');
      expect(result.data.amount).toBe(250);
      expect(result.data.currency).toBe('GHS');
      expect(result.data.status).toBe('completed');
      expect(firestore.addDoc).toHaveBeenCalled();
    });

    it('returns validation error without calling firestore if amount is invalid', async () => {
      const result = await recordTransaction({ amount: 0, type: 'tithe' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('positive number');
      expect(firestore.addDoc).not.toHaveBeenCalled();
    });

    it('catches firestore exceptions gracefully', async () => {
      firestore.addDoc.mockRejectedValueOnce(new Error('Permission denied'));
      const result = await recordTransaction({ amount: 100, type: 'offering' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });
  });

  describe('recordBatchDeposit', () => {
    it('records batch deposit when dual custody conditions are met', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'batch-tx-999' });

      const entries = [
        { amount: 300, type: 'tithe' },
        { amount: 200, type: 'offering' }
      ];
      const signers = ['auditor1@church.org', 'auditor2@church.org'];

      const result = await recordBatchDeposit(500, entries, signers, { branch: 'Main' });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('batch-tx-999');
      expect(result.data.amount).toBe(500);
      expect(result.data.dualCustodyVerified).toBe(true);
      expect(result.data.signedUsers).toEqual(signers);
      expect(firestore.addDoc).toHaveBeenCalled();
    });

    it('rejects batch deposit if dual custody has fewer than two signers', async () => {
      const entries = [{ amount: 100 }];
      const signers = ['solo@church.org'];

      const result = await recordBatchDeposit(100, entries, signers);
      expect(result.success).toBe(false);
      expect(result.error).toContain('two distinct');
      expect(firestore.addDoc).not.toHaveBeenCalled();
    });

    it('rejects batch deposit if ledger math does not reconcile', async () => {
      const entries = [{ amount: 100 }, { amount: 50 }];
      const signers = ['a@church.org', 'b@church.org'];

      const result = await recordBatchDeposit(200, entries, signers); // Expected 200, sum is 150
      expect(result.success).toBe(false);
      expect(result.error).toContain('Discrepancy detected');
      expect(firestore.addDoc).not.toHaveBeenCalled();
    });
  });

  describe('getTransactions', () => {
    it('returns all ledger transactions', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [
          { id: 'tx-1', data: () => ({ amount: 100, type: 'tithe' }) },
          { id: 'tx-2', data: () => ({ amount: 50, type: 'offering' }) }
        ]
      });

      const result = await getTransactions();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('tx-1');
    });
  });

  describe('updateTransaction', () => {
    it('updates transaction document with updatedAt', async () => {
      firestore.setDoc.mockResolvedValueOnce();

      const result = await updateTransaction('tx-1', { category: 'Youth' });
      expect(result.success).toBe(true);
      expect(result.data.category).toBe('Youth');
      expect(firestore.setDoc).toHaveBeenCalled();
    });
  });

  describe('deleteTransaction', () => {
    it('deletes document and returns success', async () => {
      firestore.deleteDoc.mockResolvedValueOnce();

      const result = await deleteTransaction('tx-1');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tx-1');
      expect(firestore.deleteDoc).toHaveBeenCalled();
    });
  });
});
