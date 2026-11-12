import React from 'react';
import { Plus, ArrowUpRight, CalendarDays } from 'lucide-react';
import { Box, Button } from '@mui/material';
import SlideTextButton from '../ui/kokonut/SlideTextButton';
import RevealText from '../ui/smooth/RevealText';

export default function WorkspaceOverviewHeader({ greeting, name, department, date, onAddMember, onAttendance }) {
  return <Box className="workspace-overview-header">
    <div><span className="eyebrow">Church overview</span><h2><RevealText>{greeting + ', ' + name + '.'}</RevealText></h2><p>A clear view of your people, ministry, and the week ahead.</p><span className="workspace-location"><span />{department}</span></div>
    <div className="workspace-header-actions"><span className="workspace-date"><CalendarDays size={14} />{date}</span><div><Button onClick={onAttendance} endIcon={<ArrowUpRight size={15} />}>Take attendance</Button><SlideTextButton variant="contained" onClick={onAddMember} startIcon={<Plus size={16} />}>Add Member</SlideTextButton></div></div>
  </Box>;
}
