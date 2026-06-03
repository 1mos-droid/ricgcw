import { describe, it, expect } from 'vitest';
import { generateSecurityTokens, verifySecurityToken } from './safetyTokens';

describe('Safety Check-In Security Token Utility', () => {
  it('generates matching tokens and details', () => {
    const childId = 'child-1';
    const parentId = 'parent-1';

    const tokens = generateSecurityTokens(childId, parentId);
    expect(tokens.childToken).toBeDefined();
    expect(tokens.parentToken).toBeDefined();
    expect(tokens.childToken).toBe(tokens.parentToken);
    expect(tokens.childToken.length).toBe(8);
  });

  it('verifies valid matching tokens within 12 hours TTL', () => {
    const tokens = generateSecurityTokens('c1', 'p1');
    const timestamp = Date.now();

    const isValid = verifySecurityToken(tokens.childToken, tokens.parentToken, timestamp);
    expect(isValid).toBe(true);
  });

  it('rejects mismatched tokens', () => {
    const tokensA = generateSecurityTokens('c1', 'p1');
    const tokensB = generateSecurityTokens('c2', 'p2');
    const timestamp = Date.now();

    const isValid = verifySecurityToken(tokensA.childToken, tokensB.parentToken, timestamp);
    expect(isValid).toBe(false);
  });

  it('rejects expired tokens (older than 12 hours)', () => {
    const tokens = generateSecurityTokens('c1', 'p1');
    // 13 hours ago
    const expiredTimestamp = Date.now() - 13 * 60 * 60 * 1000;

    const isValid = verifySecurityToken(tokens.childToken, tokens.parentToken, expiredTimestamp);
    expect(isValid).toBe(false);
  });
});
