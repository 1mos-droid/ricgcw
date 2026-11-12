import { describe, expect, it } from 'vitest';
import { getDirectoryName, getDirectoryLetter, normalizeDirectoryText, sortMembersAlphabetically, groupMembersByLetter } from './memberDirectory';

describe('member directory ordering', () => {
  it('sorts full display names case/accent-insensitively without changing input records', () => {
    const members = [{ id: 'z', name: 'Zoe' }, { id: 'e', name: 'Éric' }, { id: 'a', name: '  ama   Osei ' }, { id: 'b', name: 'Bob' }];
    expect(sortMembersAlphabetically(members).map((member) => member.id)).toEqual(['a', 'b', 'e', 'z']);
    expect(members[0].id).toBe('z');
    expect(members[2].name).toBe('  ama   Osei ');
  });

  it('uses stable identifiers to order duplicate names and puts other names last', () => {
    const members = [{ id: '2', name: 'Ama' }, { id: 'unknown' }, { id: '1', name: 'Ama' }, { id: 'number', name: '123' }];
    expect(sortMembersAlphabetically(members).slice(0, 2).map((member) => member.id)).toEqual(['1', '2']);
    expect(sortMembersAlphabetically(members).slice(2).every((member) => getDirectoryLetter(member) === '#')).toBe(true);
  });

  it('groups the complete sorted set, including accented and unnamed members', () => {
    const sorted = sortMembersAlphabetically([{ id: '1', name: 'Áma' }, { id: '2', name: 'Ada' }, { id: '3', name: 'Kwame' }, { id: '4', name: '' }]);
    const groups = groupMembersByLetter(sorted);
    expect(groups.map(({ letter, members }) => [letter, members.length])).toEqual([['A', 2], ['K', 1], ['#', 1]]);
    expect(getDirectoryName(sorted[3])).toBe('Unnamed member');
    expect(normalizeDirectoryText('  ÉRIC ')).toBe('eric');
  });
});
