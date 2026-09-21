/**
 * Financial Service - Treasury management, giving logs, and dual-custody verification.
 * Decouples Firestore operations from React UI components per architectural decision D-03/D-04.
 *
 * @module services/financialService
 */

import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { validateBatchDeposit } from '../utils/dualCustody';

const TRANSACTIONS_COLLECTION = 'transactions';

/**
 * Standard response shape returned by all service functions.
 * @typedef {Object} ServiceResponse
 * @property {boolean} success - Whether operation succeeded
 * @property {any} [data] - Returned payload on success
 * @property {string} [error] - Error message on failure
 */

/**
 * Validates transaction payload.
 * @param {Object} data 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateTransaction = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Transaction data must be a valid object' };
  }
  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Transaction amount must be a positive number' };
  }
  if (!data.type && !data.givingType) {
    return { valid: false, error: 'Transaction type or givingType is required' };
  }
  return { valid: true };
};

/**
 * Records an individual transaction (offering, tithe, digital giving, expense).
 * 
 * @param {Object} transactionData - Transaction details
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const recordTransaction = async (transactionData) => {
  try {
    const validation = validateTransaction(transactionData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const payload = {
      ...transactionData,
      amount: Number(transactionData.amount),
      currency: transactionData.currency || 'GHS',
      date: transactionData.date || new Date().toISOString(),
      createdAt: transactionData.createdAt || new Date().toISOString(),
      status: transactionData.status || 'completed'
    };

    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), payload);
    return { 
      success: true, 
      data: { id: docRef.id, ...payload } 
    };
  } catch (err) {
    console.error('financialService.recordTransaction error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to record transaction' 
    };
  }
};

/**
 * Records a reconciled batch physical deposit with dual-custody administrative validation.
 * 
 * @param {number} batchTotal - Expected total sum of deposit
 * @param {Array<Object>} entries - Individual cash log entries { amount, type, ... }
 * @param {Array<string>} signedUsers - Exactly two distinct auditor emails
 * @param {Object} [metadata] - Additional batch details (date, bankAccount, branch)
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const recordBatchDeposit = async (batchTotal, entries = [], signedUsers = [], metadata = {}) => {
  try {
    const custodyCheck = validateBatchDeposit(batchTotal, entries, signedUsers);
    if (!custodyCheck.success) {
      return { 
        success: false, 
        error: custodyCheck.reason || 'Dual-custody verification failed' 
      };
    }

    const payload = {
      ...metadata,
      type: 'batch_deposit',
      amount: Number(batchTotal),
      currency: 'GHS',
      entries,
      signedUsers,
      auditedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'reconciled',
      dualCustodyVerified: true
    };

    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), payload);
    return { 
      success: true, 
      data: { id: docRef.id, ...payload } 
    };
  } catch (err) {
    console.error('financialService.recordBatchDeposit error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to record batch deposit' 
    };
  }
};

/**
 * Fetches all transactions from the financial ledger.
 * 
 * @returns {Promise<ServiceResponse>} List of transaction objects
 */
export const getTransactions = async () => {
  try {
    const snapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    const transactions = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return { success: true, data: transactions };
  } catch (err) {
    console.error('financialService.getTransactions error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to fetch transactions' 
    };
  }
};

/**
 * Updates an existing transaction in the ledger.
 * 
 * @param {string} transactionId 
 * @param {Object} updates 
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const updateTransaction = async (transactionId, updates) => {
  try {
    if (!transactionId) {
      return { success: false, error: 'Transaction ID is required' };
    }
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId), payload, { merge: true });
    return { success: true, data: { id: transactionId, ...payload } };
  } catch (err) {
    console.error(`financialService.updateTransaction error for ${transactionId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to update transaction' 
    };
  }
};

/**
 * Deletes a transaction from the ledger.
 * 
 * @param {string} transactionId 
 * @returns {Promise<ServiceResponse>} Standardized service response
 */
export const deleteTransaction = async (transactionId) => {
  try {
    if (!transactionId) {
      return { success: false, error: 'Transaction ID is required' };
    }
    await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId));
    return { success: true, data: { id: transactionId } };
  } catch (err) {
    console.error(`financialService.deleteTransaction error for ${transactionId}:`, err);
    return { 
      success: false, 
      error: err.message || 'Failed to delete transaction' 
    };
  }
};
