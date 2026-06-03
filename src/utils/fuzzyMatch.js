/**
 * Calculates the Levenshtein distance between two strings.
 */
function levenshtein(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
}

/**
 * Calculates similarity between two member records.
 * Returns a score between 0.0 and 1.0.
 */
export function calculateSimilarity(m1, m2) {
  if (!m1 || !m2) return 0;

  // Exact email match -> 1.0 similarity
  if (m1.email && m2.email && m1.email.trim().toLowerCase() === m2.email.trim().toLowerCase()) {
    return 1.0;
  }

  // Exact phone match -> 1.0 similarity
  if (m1.phone && m2.phone && m1.phone.trim().replace(/\D/g, '') === m2.phone.trim().replace(/\D/g, '')) {
    return 1.0;
  }

  // Fuzzy name matching (stripping common church honorifics like Brother, Sister, Elder, Pastor)
  if (m1.name && m2.name) {
    const cleanName1 = m1.name.toLowerCase().replace(/^(brother|sister|elder|pastor|deacon|deaconess)\s+/i, '').trim();
    const cleanName2 = m2.name.toLowerCase().replace(/^(brother|sister|elder|pastor|deacon|deaconess)\s+/i, '').trim();

    const maxLen = Math.max(cleanName1.length, cleanName2.length);
    if (maxLen === 0) return 0;

    const distance = levenshtein(cleanName1, cleanName2);
    const nameSim = 1 - distance / maxLen;
    return nameSim;
  }

  return 0;
}

/**
 * Finds all potential duplicate pairs in a list of members.
 */
export function findDuplicates(members = []) {
  const duplicates = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const similarity = calculateSimilarity(members[i], members[j]);
      if (similarity >= 0.75) {
        duplicates.push({
          member1: members[i],
          member2: members[j],
          score: similarity
        });
      }
    }
  }
  return duplicates;
}
