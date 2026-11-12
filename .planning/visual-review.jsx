// Local component review only. Not an app entry, auth bypass, or production route.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Box, Button, Grid } from '@mui/material';
import { Users, CreditCard, ArrowDownLeft, Calendar, LayoutDashboard, ListChecks, BookOpen, Settings, Bell, Moon } from 'lucide-react';
import { Toaster, sileo } from 'sileo';
import 'sileo/styles.css';
import ThemeConfig from '../src/theme';
import SidebarNav from '../src/components/layout/SidebarNav';
import WorkspaceOverviewHeader from '../src/components/organisms/WorkspaceOverviewHeader';
import MetricCard from '../src/components/organisms/MetricCard';
import UpcomingEventsWidget from '../src/components/organisms/UpcomingEventsWidget';
import RecentActivityFeed from '../src/components/organisms/RecentActivityFeed';
import TrendChartCard from '../src/components/organisms/TrendChartCard';
import ContinuousTabs from '../src/components/ui/watermelon/ContinuousTabs';
import MasterDataGrid from '../src/components/molecules/MasterDataGrid';
import BrandLoader from '../src/components/BrandLoader';
import '../src/index.css';
import '../src/design-system.css';
import './visual-review.css';

const NAV = [['Dashboard', LayoutDashboard, '/'], ['Members', Users, '/members'], ['Attendance', ListChecks, '/attendance'], ['Financials', CreditCard, '/financials'], ['Events', Calendar, '/events'], ['Bible Studies', BookOpen, '/bible-studies'], ['Settings', Settings, '/settings']].map(([text, Icon, path]) => ({ text, icon: React.createElement(Icon, { size: 18 }), path }));
const SAMPLE_MEMBERS = [{ id: '01', name: 'Ama Mensah', branch: 'Mallam', ministry: 'Worship', status: 'Active' }, { id: '02', name: 'Kwame Osei', branch: 'Langma', ministry: 'Ushers', status: 'Active' }, { id: '03', name: 'Akosua Owusu', branch: 'Mallam', ministry: 'Youth', status: 'Active' }];
const notify = () => sileo.success({ title: 'Component preview', description: 'This is sample data. No church records were changed.', fill: 'var(--bg-paper)', styles: { title: 'workspace-toast-title' } });
function Review() {
  const [tab, setTab] = useState('overview');
  return <ThemeConfig><BrowserRouter><div className="review-shell"><aside className="review-sidebar"><SidebarNav navItems={NAV} user={{ name: 'Design review', email: 'Sample data' }} userRole="member" onProfileClick={notify} /></aside><section className="review-workspace"><header className="review-topbar"><span>Main Sanctuary <small> / Church workspace</small></span><div><span>Component review · sample data</span><Moon size={17} /><Bell size={17} /><i>AM</i></div></header><main className="review-content"><WorkspaceOverviewHeader greeting="Good morning" name="Ama" department="Main Sanctuary" date="Sunday, 15 November" onAddMember={notify} onAttendance={notify} /><Box sx={{ mb: 3, maxWidth: 480 }}><ContinuousTabs label="Review section" tabs={[{ id: 'overview', label: 'Overview' }, { id: 'registry', label: 'Registry' }, { id: 'analytics', label: 'Analytics' }, { id: 'loader', label: 'Loading' }]} value={tab} onChange={setTab} /></Box>
    {tab === 'loader' ? <BrandLoader /> : tab === 'registry' ? <MasterDataGrid title="Church members" rows={SAMPLE_MEMBERS} columns={['name', 'branch', 'ministry', 'status'].map((id) => ({ id, label: id }))} actions={<Button variant="contained" onClick={notify}>Add member</Button>} /> : <><Grid container spacing={2.5} sx={{ mb: 3 }}><Grid size={{ xs: 12, sm: 4 }}><MetricCard title="Active Membership" value="248" icon={Users} trend="up" trendValue={8.2} trendLabel="compared with last month" /></Grid><Grid size={{ xs: 12, sm: 4 }}><MetricCard title="Total Revenue" value="GH₵ 18,450" icon={CreditCard} trendLabel="giving this month" /></Grid><Grid size={{ xs: 12, sm: 4 }}><MetricCard title="Total Expenses" value="GH₵ 6,280" icon={ArrowDownLeft} trendLabel="recorded this month" /></Grid></Grid><Grid container spacing={3}><Grid size={{ xs: 12, lg: 8 }}>{tab === 'analytics' ? <TrendChartCard title="Giving overview" data={[{ name: 'Mon', value: 250 }, { name: 'Tue', value: 600 }, { name: 'Wed', value: 400 }, { name: 'Thu', value: 1250 }, { name: 'Fri', value: 900 }, { name: 'Sat', value: 1800 }, { name: 'Sun', value: 2450 }]} /> : <RecentActivityFeed activities={[{ id: '1', userName: 'Ama Mensah', action: 'joined', target: 'Worship Ministry', timestamp: '09:41 AM' }, { id: '2', userName: 'Kwame Osei', action: 'updated', target: 'member profile', timestamp: '09:25 AM' }, { id: '3', userName: 'Akosua Owusu', action: 'registered for', target: 'Sunday Service', timestamp: '08:52 AM' }, { id: '4', userName: 'Finance team', action: 'recorded', target: 'Sunday giving', timestamp: '08:30 AM' }]} />}</Grid><Grid size={{ xs: 12, lg: 4 }}><UpcomingEventsWidget events={[{ id: '1', month: 'NOV', day: '15', title: 'Sunday Service', time: '9:00 AM', location: 'Main Sanctuary' }, { id: '2', month: 'NOV', day: '18', title: 'Midweek Bible Study', time: '6:30 PM', location: 'Mallam' }, { id: '3', month: 'NOV', day: '21', title: 'Workers Fellowship', time: '8:00 AM', location: 'Main Sanctuary' }]} /></Grid></Grid></>}
    <footer className="review-footer">RICGCW · Church management <span>Built for the people who serve.</span></footer></main></section></div><Toaster position="top-center" /></BrowserRouter></ThemeConfig>;
}
createRoot(document.getElementById('root')).render(<Review />);
