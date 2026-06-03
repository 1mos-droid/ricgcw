import { describe, it, expect } from 'vitest';
import { autoAssignVolunteers } from './autoRoster';

describe('Volunteer Roster Optimization Scheduler', () => {
  const slots = [
    { id: 'slot-1', role: 'Usher', serviceDate: '2026-06-07', dayOfWeek: 'Sunday' },
    { id: 'slot-2', role: 'Audio Tech', serviceDate: '2026-06-07', dayOfWeek: 'Sunday' },
  ];

  const volunteers = [
    { id: 'v1', name: 'Sister Ama', roles: ['Usher'], availability: ['Sunday'], lastServed: '2026-05-24', gapWeeks: 1 },
    { id: 'v2', name: 'Brother Kofi', roles: ['Audio Tech'], availability: ['Sunday'], lastServed: '2026-05-31', gapWeeks: 2 }, // last served 1 week ago, gap preference is 2 weeks
    { id: 'v3', name: 'Brother Yaw', roles: ['Audio Tech'], availability: ['Sunday'], lastServed: '2026-05-17', gapWeeks: 2 },  // last served 3 weeks ago, gap preference is 2 weeks
  ];

  it('assigns volunteers matching their role and day availability', () => {
    const assignments = autoAssignVolunteers(slots, volunteers);
    
    // slot-1 requires Usher -> v1 (Sister Ama)
    const usherAssignment = assignments.find(a => a.slotId === 'slot-1');
    expect(usherAssignment).toBeDefined();
    expect(usherAssignment.volunteerId).toBe('v1');
  });

  it('respects serving gap preferences and selects the optimal volunteer', () => {
    const assignments = autoAssignVolunteers(slots, volunteers);
    
    // slot-2 requires Audio Tech. Kofi and Yaw are techs.
    // Kofi served 1 week ago (needs 2 week gap -> rejected).
    // Yaw served 3 weeks ago (needs 2 week gap -> approved).
    const techAssignment = assignments.find(a => a.slotId === 'slot-2');
    expect(techAssignment).toBeDefined();
    expect(techAssignment.volunteerId).toBe('v3');
  });
});
