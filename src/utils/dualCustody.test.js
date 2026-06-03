import { describe, it, expect } from 'vitest';
import { validateBatchDeposit } from './dualCustody';

describe('Financial Dual-Custody Audit Validator', () => {
  const correctEntries = [
    { id: '1', amount: 500, type: 'cash' },
    { id: '2', amount: 300, type: 'check' },
    { id: '3', amount: 200, type: 'cash' }
  ];

  it('approves reconciled batches with two distinct auditing user signatures', () => {
    const signedUsers = ['counter1@ricgcw.com', 'counter2@ricgcw.com'];
    const result = validateBatchDeposit(1000, correctEntries, signedUsers);
    
    expect(result.success).toBe(true);
  });

  it('rejects batch entries with matching total but missing second signature', () => {
    const signedUsers = ['counter1@ricgcw.com'];
    const result = validateBatchDeposit(1000, correctEntries, signedUsers);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('Dual custody requires exactly two distinct administrative auditing users.');
  });

  it('rejects batch entries signed twice by the same user', () => {
    const signedUsers = ['counter1@ricgcw.com', 'counter1@ricgcw.com'];
    const result = validateBatchDeposit(1000, correctEntries, signedUsers);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('Audits must be signed by two different distinct users.');
  });

  it('rejects batch when sum of entries does not match deposit totals', () => {
    const signedUsers = ['counter1@ricgcw.com', 'counter2@ricgcw.com'];
    // Total is 1000, but we specify 950
    const result = validateBatchDeposit(950, correctEntries, signedUsers);

    expect(result.success).toBe(false);
    expect(result.reason).toContain('Discrepancy detected: ledger sum does not match');
  });
});
