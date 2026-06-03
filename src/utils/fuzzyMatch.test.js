import { describe, it, expect } from 'vitest';
import { calculateSimilarity, findDuplicates } from './fuzzyMatch';

describe('Fuzzy Duplicate Detection Engine', () => {
  it('returns 1.0 similarity for exact email or phone matches', () => {
    const memberA = { name: 'Kofi Annan', email: 'kofi@example.com', phone: '0241112222' };
    const memberB = { name: 'Kofi A.', email: 'kofi@example.com', phone: '0249999999' };
    const memberC = { name: 'Kofi B.', email: 'other@example.com', phone: '0241112222' };

    expect(calculateSimilarity(memberA, memberB)).toBe(1.0);
    expect(calculateSimilarity(memberA, memberC)).toBe(1.0);
  });

  it('calculates name similarity using Levenshtein distance', () => {
    const memberA = { name: 'Johnathan Doe', email: 'a@example.com', phone: '1' };
    const memberB = { name: 'Johnathan Dow', email: 'b@example.com', phone: '2' };
    
    const similarity = calculateSimilarity(memberA, memberB);
    expect(similarity).toBeGreaterThan(0.7);
    expect(similarity).toBeLessThan(1.0);
  });

  it('returns low similarity for unrelated members', () => {
    const memberA = { name: 'Alice Walker', email: 'alice@example.com', phone: '123' };
    const memberB = { name: 'Bob Marley', email: 'bob@example.com', phone: '456' };

    expect(calculateSimilarity(memberA, memberB)).toBeLessThan(0.3);
  });

  it('finds duplicates in a list of members', () => {
    const members = [
      { id: '1', name: 'Kofi Annan', email: 'kofi@example.com', phone: '0241112222' },
      { id: '2', name: 'Kofi Anan', email: 'kofi-alternate@example.com', phone: '0241112222' }, // duplicate by phone
      { id: '3', name: 'Alice Walker', email: 'alice@example.com', phone: '0243333333' },
      { id: '4', name: 'Kofi Annon', email: 'kofi-other@example.com', phone: '0248888888' }, // fuzzy duplicate by name
    ];

    const duplicates = findDuplicates(members);
    expect(duplicates.length).toBeGreaterThanOrEqual(2);
    // Should have detected matching pairs
    const duplicateIds = duplicates.flatMap(d => [d.member1.id, d.member2.id]);
    expect(duplicateIds).toContain('1');
    expect(duplicateIds).toContain('2');
    expect(duplicateIds).toContain('4');
  });
});
