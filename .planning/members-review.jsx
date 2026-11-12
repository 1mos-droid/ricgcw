// Local, labeled sample-data review. No authentication or backend writes.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Box, Button, InputAdornment, MenuItem, TextField, useMediaQuery } from '@mui/material';
import { Users, Search, LayoutGrid, Rows3, UserPlus } from 'lucide-react';
import ThemeConfig, { useColorMode } from '../src/theme';
import MobileWorkspaceHeader from '../src/components/layout/MobileWorkspaceHeader';
import SidebarNav from '../src/components/layout/SidebarNav';
import WorkspacePageHeader from '../src/components/organisms/WorkspacePageHeader';
import MemberDirectory from '../src/components/member/MemberDirectory';
import ContinuousTabs from '../src/components/ui/watermelon/ContinuousTabs';
import { normalizeDirectoryText, sortMembersAlphabetically } from '../src/utils/memberDirectory';
import '../src/index.css';
import '../src/design-system.css';
import './visual-review.css';

const NAMES = ['Ama Osei', 'Akosua Owusu', 'Abena Mensah', 'Afia Adjei', 'Adwoa Boateng', 'Benjamin Arthur', 'Comfort Asante', 'Daniel Kwarteng', 'David Quaye', 'Éric Amoah', 'Esi Nkrumah', 'Emmanuel Appiah', 'Felicia Addo', 'Grace Agyeman', 'Hannah Akoto', 'Isaac Obeng', 'Joseph Aidoo', 'Josephine Akufo', 'Kwame Mensah', 'Kofi Asare', 'Kwaku Ofori', 'Lydia Owusu', 'Michael Ansah', 'Nana Yaa Osei-Tutu', 'Patricia Agyapong', 'Rebecca Osei', 'Samuel Adom', 'Sarah Aboagye', 'Theophilus Kwabena Mensah-Danquah', 'Victoria Sackey', 'Yaw Frimpong', 'Zoe Abankwah'];
const MEMBERS = sortMembersAlphabetically(NAMES.map((name, index) => ({ id: String(index), memberId: 'M' + String(index + 1).padStart(3, '0'), name, branch: index % 3 ? 'Mallam' : 'Kokrobitey', status: index % 7 ? 'Active' : 'Inactive', phone: index % 4 ? '+233 24 123 4567' : '', email: index % 5 ? name.toLowerCase().split(' ')[0] + '@example.org' : '', department: index % 3 ? 'Main Sanctuary' : 'Youth Ministry' })));
function Review() {
  const [mode, setMode] = useState('pills');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [campus, setCampus] = useState('all');
  const { mode: appearance, toggleColorMode } = useColorMode();
  const mobile = useMediaQuery('(max-width:899px)');
  const matches = MEMBERS.filter((member) => normalizeDirectoryText(member.name).includes(normalizeDirectoryText(query)) && (campus === 'all' || member.branch === campus));
  return <div className="review-shell"><aside className="review-sidebar"><SidebarNav navItems={[{ text: 'Members', path: '/.planning/members-review.html', icon: <Users /> }]} user={{ name: 'Component review' }} userRole="member" onProfileClick={() => {}} /></aside><section className="review-workspace">{mobile ? <Box sx={{ position: 'sticky', top: 0, zIndex: 1200 }}><MobileWorkspaceHeader department="Main Sanctuary" branch={campus} canSwitchCampus onCampusChange={(event) => setCampus(event.target.value)} user={{ name: 'Sample Administrator' }} mode={appearance} onSearch={() => document.getElementById('review-member-search').focus()} onProfileClick={() => {}} onToggleTheme={toggleColorMode} onUpdates={() => {}} /></Box> : <header className="review-topbar">Main Sanctuary<span>Component review · sample data</span></header>}<main className="review-content" style={{ '--workspace-header-height': mobile ? '112px' : '0px' }}><WorkspacePageHeader section="People & community" title="Church Members" description="Sample directory · no live member records" />
    <div className="members-toolbar"><TextField id="review-member-search" label="Find a member" placeholder="Search directory..." value={query} onChange={(event) => setQuery(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={17} /></InputAdornment> } }} /><TextField select label="Branch" value={campus} slotProps={{ select: { renderValue: (value) => value === 'all' ? (mobile ? 'All' : 'All branches') : value } }} onChange={(event) => setCampus(event.target.value)}><MenuItem value="all">All branches</MenuItem><MenuItem value="Mallam">Mallam</MenuItem><MenuItem value="Kokrobitey">Kokrobitey</MenuItem></TextField><TextField select label="Status" value="all" slotProps={{ select: { renderValue: () => mobile ? 'All' : 'All statuses' } }}><MenuItem value="all">All statuses</MenuItem></TextField><div className="members-toolbar-actions"><div><Button>Export</Button><Button>Join QR</Button></div><Button variant="contained" startIcon={<UserPlus size={16} />}>Add Member</Button></div></div>
    <div className="members-directory-summary"><div><h2>{matches.length} members</h2><p>All members shown · A–Z by name · Jump to a letter below</p></div><ContinuousTabs label="Directory layout" value={mode} onChange={setMode} tabs={[{ id: 'pills', label: <span className="directory-view-label"><Rows3 size={15} />Pills</span> }, { id: 'grid', label: <span className="directory-view-label"><LayoutGrid size={15} />Grid</span> }]} /></div>
    <MemberDirectory members={matches} mode={mode} selectedIds={selected} onSelectionChange={setSelected} onOpen={(member) => document.getElementById('review-action').textContent = 'Selected ' + member.name} onMenu={(_, member) => document.getElementById('review-action').textContent = 'Actions for ' + member.name} /><p id="review-action" role="status" />
  </main></section></div>;
}
createRoot(document.getElementById('root')).render(<ThemeConfig><BrowserRouter><Review /></BrowserRouter></ThemeConfig>);
