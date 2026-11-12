import React, { useId, useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, Select } from '@mui/material';
import { Search, MoreHorizontal, Moon, Sun, Bell } from 'lucide-react';
import UserAvatar from '../atoms/UserAvatar';
import './MobileWorkspaceHeader.css';

export default function MobileWorkspaceHeader({ department, branch, canSwitchCampus, onCampusChange, user, onSearch, onProfileClick, mode, onToggleTheme, onUpdates, notificationCount = 0 }) {
  const [anchor, setAnchor] = useState(null);
  const id = useId();
  const contextLabel = !canSwitchCampus && branch && branch !== 'all' ? [department, branch].filter(Boolean).join(' · ') : department;
  const choose = (action) => { setAnchor(null); action(); };
  return <div className="mobile-workspace-header">
    <div className="mobile-header-primary">
      <div className="mobile-header-brand"><img src="/ricgcw.png" alt="" width="32" height="32" /><div><strong>RICGCW</strong><span title={contextLabel}>{contextLabel || 'Church workspace'}</span></div></div>
      <div className="mobile-header-actions">
        <IconButton aria-label="Open Search" onClick={onSearch}><Search size={20} /></IconButton>
        <IconButton aria-label="More header actions" aria-controls={anchor ? id : undefined} aria-haspopup="menu" aria-expanded={Boolean(anchor)} onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={21} /></IconButton>
        <IconButton aria-label="Open account menu" onClick={onProfileClick}><UserAvatar name={user?.name || user?.email || 'User'} size={32} /></IconButton>
      </div>
    </div>
    {canSwitchCampus && <div className="mobile-header-campus"><span id={`${id}-campus-label`}>Campus</span><Select size="small" labelId={`${id}-campus-label`} value={branch || 'all'} onChange={onCampusChange} inputProps={{ 'aria-label': 'Select Campus' }}>
      <MenuItem value="all">All Campuses</MenuItem>{['Mallam', 'Kokrobitey', 'Langma', 'Diaspora'].map((campus) => <MenuItem value={campus} key={campus}>{campus}</MenuItem>)}
    </Select></div>}
    <Menu id={id} anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
      <MenuItem aria-label="Toggle theme mode" onClick={() => choose(onToggleTheme)}><ListItemIcon>{mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</ListItemIcon>{mode === 'dark' ? 'Use light appearance' : 'Use dark appearance'}</MenuItem>
      <MenuItem onClick={() => choose(onUpdates)}><ListItemIcon><Bell size={18} /></ListItemIcon>Events & updates{notificationCount > 0 ? ` (${notificationCount})` : ''}</MenuItem>
    </Menu>
  </div>;
}
