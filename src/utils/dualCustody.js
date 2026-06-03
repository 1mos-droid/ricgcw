/**
 * Enforces dual custody rules on physical deposit batches.
 * Validates that exactly two distinct administrative users sign off
 * and that the sum of entries reconciles with the batch total.
 * 
 * @param {number} batchTotal - Logged total amount of the batch deposit
 * @param {Array} entries - List of individual log entries: { amount, type }
 * @param {Array} signedUsers - Array of emails representing counting signatures
 * @returns {Object} - Result: { success: boolean, reason?: string }
 */
export function validateBatchDeposit(batchTotal, entries = [], signedUsers = []) {
  // 1. Dual custody signatures check
  if (signedUsers.length !== 2) {
    return {
      success: false,
      reason: 'Dual custody requires exactly two distinct administrative auditing users.'
    };
  }

  // 2. Distinct users check
  if (signedUsers[0] === signedUsers[1]) {
    return {
      success: false,
      reason: 'Audits must be signed by two different distinct users.'
    };
  }

  // 3. Totals reconciliation check
  const totalSum = entries.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  if (totalSum !== batchTotal) {
    return {
      success: false,
      reason: `Discrepancy detected: ledger sum does not match deposit totals (expected ${batchTotal}, sum ${totalSum}).`
    };
  }

  return { success: true };
}
