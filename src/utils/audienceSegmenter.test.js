import { describe, it, expect } from 'vitest';
import { segmentAudienceDynamically } from './audienceSegmenter';

describe('Dynamic CRM Audience Segmenter Engine', () => {
  const members = [
    { id: '1', name: 'Yaw', branch: 'Mallam', dob: '1995-04-10', completedClasses: ['Baptismal Class'] },
    { id: '2', name: 'Ama', branch: 'Kokrobitey', dob: '2005-08-15', completedClasses: ['Baptismal Class'] },
    { id: '3', name: 'Kojo', branch: 'Mallam', dob: '1980-01-01', completedClasses: [] },
  ];

  it('filters audience by campus branch', () => {
    const criteria = { branch: 'Mallam' };
    const result = segmentAudienceDynamically(members, criteria, '2026-06-03');
    
    expect(result.length).toBe(2);
    expect(result.map(m => m.name)).toContain('Yaw');
    expect(result.map(m => m.name)).toContain('Kojo');
  });

  it('filters audience by completed growth classes', () => {
    const criteria = { completedClass: 'Baptismal Class' };
    const result = segmentAudienceDynamically(members, criteria, '2026-06-03');

    expect(result.length).toBe(2);
    expect(result.map(m => m.name)).toContain('Yaw');
    expect(result.map(m => m.name)).toContain('Ama');
  });

  it('filters audience by age thresholds', () => {
    const criteria = { minAge: 25, maxAge: 40 };
    // Yaw is 31 in 2026. Ama is 20. Kojo is 46.
    const result = segmentAudienceDynamically(members, criteria, '2026-06-03');

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Yaw');
  });
});
