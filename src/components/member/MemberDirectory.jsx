import React, { useId, useMemo } from 'react';
import { ButtonBase, Checkbox, IconButton, Tooltip } from '@mui/material';
import { ArrowUp, ArrowUpRight, Mail, MoreHorizontal, Phone } from 'lucide-react';
import UserAvatar from '../atoms/UserAvatar';
import { getDirectoryName, groupMembersByLetter } from '../../utils/memberDirectory';
import './MemberDirectory.css';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function DirectoryMember({ member, mode, selected, onSelect, onOpen, onMenu }) {
  const name = getDirectoryName(member);
  const isGrid = mode === 'grid';
  const status = String(member.status || 'Active');
  const state = status.toLowerCase();
  return (
    <li className={`directory-member directory-member--${mode}`} data-selected={selected}>
      <div className="directory-member-tools">
        <Checkbox checked={selected} onChange={() => onSelect(member.id)} size="small" inputProps={{ 'aria-label': `Select ${name}` }} />
        <Tooltip title="Member actions"><IconButton size="small" aria-label={`Actions for ${name}`} onClick={(event) => onMenu(event, member)}><MoreHorizontal size={18} /></IconButton></Tooltip>
      </div>
      <ButtonBase className="directory-profile" onClick={() => onOpen(member)} aria-label={`View ${name}`}>
        <UserAvatar name={name} src={member.photoURL || member.photoUrl || ''} size={isGrid ? 48 : 40} />
        <span className="directory-identity"><strong title={name}>{name}</strong><span>{member.memberId || 'ID pending'}<span aria-hidden="true"> · </span>{member.branch || 'Main'}</span></span>
        {!isGrid && <ArrowUpRight className="directory-open-icon" size={16} aria-hidden="true" />}
      </ButtonBase>
      {isGrid && <div className="directory-contacts">
        {member.email ? <a href={`mailto:${member.email}`} title={member.email}><Mail size={14} aria-hidden="true" /><span>{member.email}</span></a> : <span className="directory-contact-missing"><Mail size={14} aria-hidden="true" />Email not added</span>}
        {member.phone ? <a href={`tel:${member.phone}`}><Phone size={14} aria-hidden="true" /><span>{member.phone}</span></a> : <span className="directory-contact-missing"><Phone size={14} aria-hidden="true" />Phone not added</span>}
      </div>}
      <div className="directory-member-status"><span className="directory-status" data-status={state}><i aria-hidden="true" />{status}</span>{isGrid && <span className="directory-ministry" title={member.department || ''}>{member.department || 'Member'}</span>}</div>
    </li>
  );
}

export default function MemberDirectory({ members, mode = 'pills', selectedIds = [], onSelectionChange, onOpen, onMenu }) {
  const id = useId().replace(/:/g, '');
  const groups = useMemo(() => groupMembersByLetter(members), [members]);
  const available = new Set(groups.map((group) => group.letter));
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const topId = `${id}-directory-start`;
  const headingId = (letter) => `${id}-member-group-${letter === '#' ? 'other' : letter}`;
  const jumpTo = (event, targetId) => {
    event.preventDefault();
    const heading = document.getElementById(targetId);
    heading?.scrollIntoView({ block: 'start', behavior: 'auto' });
    heading?.focus({ preventScroll: true });
  };
  const toggleSelection = (memberId) => onSelectionChange(selected.has(memberId) ? selectedIds.filter((value) => value !== memberId) : [...selectedIds, memberId]);
  return (
    <div className={`member-directory member-directory--${mode}`}>
      <h2 id={topId} className="directory-sr-heading" tabIndex={-1}>Member directory, A to Z</h2>
      <nav className="directory-alphabet" aria-label="Jump to members by first letter">
        <span className="directory-alphabet-label">Jump to</span>
        <div className="directory-letters">{[...LETTERS, ...(available.has('#') ? ['#'] : [])].map((letter) => available.has(letter) ? <a key={letter} href={`#${headingId(letter)}`} aria-label={`Jump to ${letter === '#' ? 'other names' : letter}`} onClick={(event) => jumpTo(event, headingId(letter))}>{letter}</a> : <span key={letter} aria-hidden="true">{letter}</span>)}</div>
      </nav>
      {groups.map((group) => <section key={group.letter} aria-labelledby={headingId(group.letter)} className="directory-group">
        <div className="directory-group-heading"><h3 id={headingId(group.letter)} tabIndex={-1}>{group.letter === '#' ? 'Other names' : group.letter}</h3><span>{group.members.length} {group.members.length === 1 ? 'member' : 'members'}</span><span className="directory-group-rule" /></div>
        <ul className="directory-entries">{group.members.map((member) => <DirectoryMember key={member.id} member={member} mode={mode} selected={selected.has(member.id)} onSelect={toggleSelection} onOpen={onOpen} onMenu={onMenu} />)}</ul>
      </section>)}
      <div className="directory-end"><span>End of directory · {members.length} {members.length === 1 ? 'member' : 'members'}</span><a href={`#${topId}`} onClick={(event) => jumpTo(event, topId)}>Back to top <ArrowUp size={13} /></a></div>
    </div>
  );
}
