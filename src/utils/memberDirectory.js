const NAME_COLLATOR = new Intl.Collator('en-GH', { sensitivity: 'base', numeric: true });

/** Return a clean display name without changing the stored member record. */
export const getDirectoryName = (member) => String(member?.name || '').trim().replace(/\s+/g, ' ') || 'Unnamed member';

/** Normalize directory text for case- and accent-insensitive searching. */
export const normalizeDirectoryText = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Return the A–Z navigation group, with other or missing names grouped under #. */
export const getDirectoryLetter = (member) => {
  if (!String(member?.name || '').trim()) return '#';
  const letter = normalizeDirectoryText(member.name).charAt(0).toUpperCase();
  return /^[A-Z]$/.test(letter) ? letter : '#';
};

/** Sort a copy of the directory by name, keeping non-alphabetic/missing names last. */
export const sortMembersAlphabetically = (members = []) => members
  .filter((member) => member && typeof member === 'object')
  .sort((first, second) => {
    const firstOther = getDirectoryLetter(first) === '#';
    const secondOther = getDirectoryLetter(second) === '#';
    if (firstOther !== secondOther) return firstOther ? 1 : -1;
    return NAME_COLLATOR.compare(getDirectoryName(first), getDirectoryName(second))
      || NAME_COLLATOR.compare(String(first.id || ''), String(second.id || ''));
  });

/** Group an alphabetically ordered directory for jump links and section headings. */
export const groupMembersByLetter = (members = []) => {
  const groups = new Map();
  members.forEach((member) => {
    const letter = getDirectoryLetter(member);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(member);
  });
  return Array.from(groups, ([letter, entries]) => ({ letter, members: entries }));
};
