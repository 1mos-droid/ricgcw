import { describe, it, expect } from 'vitest';
import { checkChurnRisk } from './churnAlert';

describe('Churn Risk & Stagnation Alert Engine', () => {
  const mockMember = { id: 'm1', name: 'Brother Kofi', status: 'active' };

  it('returns isAtRisk: false if member is active recently (e.g. checked in 1 week ago)', () => {
    const checkins = [{ date: '2026-05-25T10:00:00Z', memberId: 'm1' }];
    const contributions = [];
    
    // Evaluation date: 2026-06-03 (about 9 days later)
    const result = checkChurnRisk(mockMember, checkins, contributions, '2026-06-03T12:00:00Z');
    expect(result.isAtRisk).toBe(false);
  });

  it('returns isAtRisk: false if member contributed recently (e.g. 2 weeks ago)', () => {
    const checkins = [];
    const contributions = [{ date: '2026-05-20T10:00:00Z', amount: 100, memberId: 'm1' }];

    const result = checkChurnRisk(mockMember, checkins, contributions, '2026-06-03T12:00:00Z');
    expect(result.isAtRisk).toBe(false);
  });

  it('returns isAtRisk: true if member has no activity (checkin or contribution) for 4 weeks (28 days)', () => {
    const checkins = [{ date: '2026-04-30T10:00:00Z', memberId: 'm1' }]; // > 28 days ago
    const contributions = [{ date: '2026-04-25T10:00:00Z', amount: 50, memberId: 'm1' }]; // > 28 days ago

    const result = checkChurnRisk(mockMember, checkins, contributions, '2026-06-03T12:00:00Z');
    expect(result.isAtRisk).toBe(true);
    expect(result.actionRequired).toBe('Pastoral Care Check-In');
  });

  it('returns isAtRisk: false if member status is not active (e.g. already inactive or discontinued)', () => {
    const inactiveMember = { id: 'm2', name: 'Sister Efua', status: 'inactive' };
    const checkins = [];
    const contributions = [];

    const result = checkChurnRisk(inactiveMember, checkins, contributions, '2026-06-03T12:00:00Z');
    expect(result.isAtRisk).toBe(false);
  });
});
