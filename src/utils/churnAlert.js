/**
 * Evaluates whether a member is at churn risk (no check-in or financial activity for 4 consecutive weeks).
 * 
 * @param {Object} member - The member record
 * @param {Array} checkins - All check-in records
 * @param {Array} contributions - All contribution records
 * @param {string|Date} [evaluationDate] - Optional evaluation date for testing (defaults to now)
 * @returns {Object} - Result detailing risk status and pastoral actions
 */
export function checkChurnRisk(member, checkins = [], contributions = [], evaluationDate = new Date()) {
  // Only evaluate active members
  if (!member || member.status !== 'active') {
    return { isAtRisk: false };
  }

  const evalMs = new Date(evaluationDate).getTime();
  const MS_IN_4_WEEKS = 4 * 7 * 24 * 60 * 60 * 1000; // 28 days in milliseconds

  // 1. Find most recent check-in date for this member
  const memberCheckins = checkins
    .filter(c => c.memberId === member.id && c.date)
    .map(c => new Date(c.date).getTime())
    .sort((a, b) => b - a);
  
  const latestCheckinTime = memberCheckins[0] || null;

  // 2. Find most recent contribution date for this member
  const memberContributions = contributions
    .filter(c => c.memberId === member.id && c.date)
    .map(c => new Date(c.date).getTime())
    .sort((a, b) => b - a);

  const latestContributionTime = memberContributions[0] || null;

  // 3. Determine the latest activity time
  let latestActivityTime = null;
  if (latestCheckinTime && latestContributionTime) {
    latestActivityTime = Math.max(latestCheckinTime, latestContributionTime);
  } else {
    latestActivityTime = latestCheckinTime || latestContributionTime || null;
  }

  // 4. If no activity ever recorded, check when the profile was created
  if (!latestActivityTime) {
    const creationTime = member.createdAt ? new Date(member.createdAt).getTime() : null;
    if (creationTime) {
      const timeDiff = evalMs - creationTime;
      if (timeDiff >= MS_IN_4_WEEKS) {
        return {
          isAtRisk: true,
          reason: 'No check-in or contribution logs since profile creation over 4 weeks ago.',
          actionRequired: 'Pastoral Care Check-In'
        };
      }
    }
    return { isAtRisk: false };
  }

  // 5. Compare latest activity with evaluation date
  const elapsed = evalMs - latestActivityTime;
  if (elapsed >= MS_IN_4_WEEKS) {
    return {
      isAtRisk: true,
      reason: 'No check-in or contribution for 4 consecutive weeks.',
      actionRequired: 'Pastoral Care Check-In'
    };
  }

  return { isAtRisk: false };
}
