import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar, Settings, Users, UserPlus, Download, LogOut, Trash2,
  ChevronRight, Pencil, Send, Plus, Pin, Edit2, X, Check, MoreHorizontal,
  Shield, Tag, Image, Copy, Crown, MessageSquare, ClipboardList, AlertTriangle, LayoutGrid, FileText,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { eventMeta } from '../lib/events';
import './Teams.css';
import { useAuth } from '../contexts/AuthContext';
import {
  firestoreService,
  type Team, type Subteam, type StreamMessage, type TeamAssignment,
  type TeamRole, type EventCategory, type CustomTest
} from '../services/firestoreService';
import PageLoadingScreen from '../components/PageLoadingScreen';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts: unknown): string {
  if (!ts) return '';
  const t = ts as { toDate?: () => Date };
  const d: Date = typeof t.toDate === 'function' ? t.toDate() : new Date(ts as string | number);
  return d.toLocaleString('default', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const BANNER_PRESETS = [
  'linear-gradient(135deg,#1757c7,#06b6d4)',
  'linear-gradient(135deg,#0c4a6e,#0ea5e9)',
  'linear-gradient(135deg,#065f46,#10b981)',
  'linear-gradient(135deg,#1e3a8a,#6366f1)',
  'linear-gradient(135deg,#7f1d1d,#f97316)',
  'linear-gradient(135deg,#0f172a,#475569)',
];

const EMOJIS = ['🧪','🔬','⚗️','🧬','🦠','⚡','🔭','🌿','🏗️','🧲','📐','🌊','🔥','💡','🏆'];
const CAT_COLORS = ['#1f6feb','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6366f1'];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

const ROLE_COLORS = ['#2563eb','#16a34a','#9333ea','#dc2626','#ea580c','#db2777','#0891b2'];

const DEFAULT_PERMISSIONS = {
  manageRoster: false, manageEvents: false, manageAssignments: false,
  manageStream: false, manageMembers: false, manageSettings: false,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Teams() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const toast = useToast();
  const uid = currentUser?.uid ?? '';
  const [nameModal, setNameModal] = useState<{ mode: 'add' | 'edit'; value: string } | null>(null);
  const [showJoinCode, setShowJoinCode] = useState(false);

  // ── State ──
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [subteams, setSubteams] = useState<Subteam[]>([]);
  const [activeSubteam, setActiveSubteam] = useState<Subteam | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster');

  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [newStreamMsg, setNewStreamMsg] = useState('');
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editMsgContent, setEditMsgContent] = useState('');
  const [openMsgMenu, setOpenMsgMenu] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<TeamAssignment[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentCustomTestId, setAssignmentCustomTestId] = useState('');
  
  const [customTests, setCustomTests] = useState<CustomTest[]>([]);

  const [profiles, setProfiles] = useState<Record<string, Record<string, string>>>({});
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [createNameInput, setCreateNameInput] = useState('');
  const [createDivisionInput, setCreateDivisionInput] = useState('C');

  // Settings state
  const [settingsTeamName, setSettingsTeamName] = useState('');
  const [settingsBanner, setSettingsBanner] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  // New role form
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0]);
  const [newRolePerms, setNewRolePerms] = useState({ ...DEFAULT_PERMISSIONS });
  // New category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEvents, setNewCatEvents] = useState('');
  const [newCatColor, setNewCatColor] = useState(CAT_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState('');
  // Editing category events inline
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState<string>('');
  const [editCatIcon, setEditCatIcon] = useState<string>('');
  const [editCatEvents, setEditCatEvents] = useState<string[]>([]);
  const [newEventInput, setNewEventInput] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // ── Auth helpers ──
  const isAdmin = (team: Team) =>
    team.ownerId === uid ||
    (() => {
      const roleId = team.memberRoles?.[uid];
      const role = roles.find(r => r.id === roleId);
      return role?.permissions?.manageSettings ?? false;
    })();

  // ── Effects ──
  useEffect(() => { 
    if (uid) {
      loadTeams();
      loadCustomTests();
    }
  }, [uid]);

  const loadCustomTests = async () => {
    if (!uid) return;
    try {
      const tests = await firestoreService.getCustomTests(uid);
      setCustomTests(tests);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!activeTeam) return;
    setSettingsTeamName(activeTeam.name);
    setSettingsBanner(activeTeam.bannerColor || BANNER_PRESETS[0]);
    loadSubteams(activeTeam.id);
    loadRoles(activeTeam.id);
    loadEventCategories(activeTeam.id);
    if (activeTab === 'stream') loadStream(activeTeam.id);
    if (activeTab === 'assignments') loadAssignments(activeTeam.id);
    if (activeTab === 'people') loadProfiles(activeTeam.members);
  }, [activeTeam]);

  useEffect(() => {
    if (!activeTeam) return;
    if (activeTab === 'stream') loadStream(activeTeam.id);
    if (activeTab === 'assignments') loadAssignments(activeTeam.id);
    if (activeTab === 'people') loadProfiles(activeTeam.members);
    if (activeTab === 'roster') loadEventCategories(activeTeam.id);
  }, [activeTab]);

  useEffect(() => {
    if (activeSubteam) setTeamMembers(activeSubteam.roster || {});
  }, [activeSubteam]);

  // close message menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMsgMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Loaders ──
  const loadTeams = async () => {
    setLoading(true);
    try {
      const ts = await firestoreService.getUserTeams(uid);
      setTeams(ts);
      if (ts.length > 0 && !activeTeam) setActiveTeam(ts[0]);
      else if (ts.length === 0) setActiveTeam(null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadSubteams = async (teamId: string) => {
    try {
      const sts = await firestoreService.getTeamSubteams(teamId);
      setSubteams(sts);
      if (sts.length > 0) setActiveSubteam(sts[0]);
    } catch (err) { console.error(err); }
  };

  const loadStream = async (teamId: string) => {
    try { setStreamMessages(await firestoreService.getStreamMessages(teamId)); }
    catch (err) { console.error(err); }
  };

  const loadAssignments = async (teamId: string) => {
    try { setAssignments(await firestoreService.getAssignments(teamId)); }
    catch (err) { console.error(err); }
  };

  const loadProfiles = async (uids: string[]) => {
    const profs: Record<string, Record<string, string>> = {};
    for (const id of uids) {
      try { profs[id] = await firestoreService.getProfile(id); }
      catch { profs[id] = {}; }
    }
    setProfiles(profs);
  };

  const loadRoles = async (teamId: string) => {
    try { setRoles(await firestoreService.getTeamRoles(teamId)); }
    catch (err) { console.error(err); }
  };

  const loadEventCategories = async (teamId: string) => {
    try { setEventCategories(await firestoreService.getEventCategories(teamId)); }
    catch (err) { console.error(err); }
  };

  // ── Handlers ──
  const handleCreateTeam = async () => {
    if (!createNameInput) return;
    try {
      const t = await firestoreService.createTeam(uid, createNameInput, createDivisionInput);
      setCreateNameInput('');
      await loadTeams();
      setActiveTeam(t);
    } catch { toast('Failed to create team', 'error'); }
  };

  const handleJoinTeam = async () => {
    if (!joinCodeInput) return;
    try {
      const t = await firestoreService.joinTeam(uid, joinCodeInput);
      if (t) { setJoinCodeInput(''); await loadTeams(); setActiveTeam(t); toast(`Joined ${t.name}`); }
      else toast('Invalid join code', 'error');
    } catch { toast('Failed to join team', 'error'); }
  };

  const handleLeaveTeam = async () => {
    if (!activeTeam) return;
    if (!window.confirm(activeTeam.ownerId === uid ? 'Delete this team permanently?' : 'Leave this team?')) return;
    if (activeTeam.ownerId === uid) await firestoreService.deleteTeam(activeTeam.id);
    else await firestoreService.leaveTeam(uid, activeTeam.id);
    setActiveTeam(null);
    loadTeams();
  };

  const updateMember = async (eventName: string, idx: number, value: string) => {
    if (!activeTeam || !activeSubteam) return;
    const updated = { ...teamMembers };
    if (!updated[eventName]) updated[eventName] = ['', ''];
    updated[eventName][idx] = value;
    setTeamMembers(updated);
    await firestoreService.updateSubteamRoster(activeTeam.id, activeSubteam.id, updated);
  };

  const handleAddSubteam = () => setNameModal({ mode: 'add', value: '' });
  const handleEditSubteamName = () => activeSubteam && setNameModal({ mode: 'edit', value: activeSubteam.name });

  const submitNameModal = async () => {
    if (!activeTeam || !nameModal) return;
    const name = nameModal.value.trim();
    if (!name) return;
    try {
      if (nameModal.mode === 'add') {
        const s = await firestoreService.addSubteam(activeTeam.id, name);
        setSubteams(p => [...p, s]); setActiveSubteam(s);
        toast(`Added ${name}`);
      } else if (activeSubteam) {
        await firestoreService.updateSubteamName(activeTeam.id, activeSubteam.id, name);
        setSubteams(p => p.map(x => (x.id === activeSubteam.id ? { ...x, name } : x)));
        setActiveSubteam(a => (a ? { ...a, name } : a));
        toast('Subteam renamed');
      }
      setNameModal(null);
    } catch { toast('Could not save subteam', 'error'); }
  };

  const handleSendStreamMessage = async () => {
    if (!activeTeam || !newStreamMsg.trim()) return;
    const authorName = profiles[uid]?.fullName || profiles[uid]?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Unknown';
    await firestoreService.addStreamMessage(activeTeam.id, uid, authorName, newStreamMsg.trim());
    setNewStreamMsg('');
    loadStream(activeTeam.id);
  };

  const handleEditMsg = async (msg: StreamMessage) => {
    if (!activeTeam || !msg.id) return;
    await firestoreService.editStreamMessage(activeTeam.id, msg.id, editMsgContent);
    setEditingMsgId(null);
    loadStream(activeTeam.id);
  };

  const handleDeleteMsg = async (msg: StreamMessage) => {
    if (!activeTeam || !msg.id) return;
    if (!window.confirm('Delete this message?')) return;
    await firestoreService.deleteStreamMessage(activeTeam.id, msg.id);
    loadStream(activeTeam.id);
  };

  const handlePinMsg = async (msg: StreamMessage) => {
    if (!activeTeam || !msg.id) return;
    await firestoreService.pinStreamMessage(activeTeam.id, msg.id, !msg.pinnedAt);
    loadStream(activeTeam.id);
  };

  const handleAddAssignment = async () => {
    if (!activeTeam || !assignmentTitle) return;
    try {
      await firestoreService.addAssignment(activeTeam.id, { 
        title: assignmentTitle, 
        description: assignmentDesc, 
        dueDate: assignmentDueDate,
        customTestId: assignmentCustomTestId || undefined
      });
      setShowAssignmentModal(false);
      setAssignmentTitle(''); setAssignmentDesc(''); setAssignmentDueDate(''); setAssignmentCustomTestId('');
      loadAssignments(activeTeam.id);
      toast('Assignment created');
    } catch { toast('Failed to create assignment', 'error'); }
  };

  const handleCreateRole = async () => {
    if (!activeTeam || !newRoleName) return;
    const r = await firestoreService.addTeamRole(activeTeam.id, { name: newRoleName, color: newRoleColor, permissions: newRolePerms });
    setRoles(p => [...p, r]);
    setNewRoleName(''); setNewRolePerms({ ...DEFAULT_PERMISSIONS });
  };

  const handleAddCategory = async () => {
    if (!activeTeam || !newCatName) return;
    const evList = newCatEvents.split(',').map(s => s.trim()).filter(Boolean);
    const catData: Omit<import('../services/firestoreService').EventCategory, 'id'> = { name: newCatName, color: newCatColor, events: evList };
    if (newCatIcon.trim()) catData.icon = newCatIcon.trim();
    const cat = await firestoreService.addEventCategory(activeTeam.id, catData);
    setEventCategories(p => [...p, cat]);
    setShowCatForm(false); setNewCatName(''); setNewCatEvents(''); setNewCatIcon('');
  };

  const handleSaveCategoryEdit = async (catId: string) => {
    if (!activeTeam) return;
    const cat = eventCategories.find(c => c.id === catId);
    if (!cat) return;
    const updatedEvents = editCatEvents.filter(e => e.trim());
    const updateData: Partial<import('../services/firestoreService').EventCategory> = { name: editCatName, events: updatedEvents, icon: editCatIcon.trim() || undefined };
    await firestoreService.updateEventCategory(activeTeam.id, catId, updateData);
    setEventCategories(p => p.map(c => c.id === catId ? { ...c, name: editCatName, events: updatedEvents, icon: editCatIcon.trim() || undefined } : c));
    setEditingCatId(null);
  };

  const handleSaveSettings = async () => {
    if (!activeTeam) return;
    setSettingsSaving(true);
    await firestoreService.updateTeamSettings(activeTeam.id, { name: settingsTeamName, bannerColor: settingsBanner });
    setActiveTeam(t => t ? { ...t, name: settingsTeamName, bannerColor: settingsBanner } : t);
    setTeams(ts => ts.map(t => t.id === activeTeam.id ? { ...t, name: settingsTeamName, bannerColor: settingsBanner } : t));
    setSettingsSaving(false);
    toast('Team settings saved');
  };

  const handleExportRoster = () => {
    if (!activeSubteam) return;
    let csv = 'Event,Member 1,Member 2\n';
    eventCategories.forEach(cat => cat.events.forEach(ev => {
      const m1 = teamMembers[ev]?.[0] || ''; const m2 = teamMembers[ev]?.[1] || '';
      csv += `"${ev}","${m1}","${m2}"\n`;
    }));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${activeTeam?.name}-${activeSubteam.name}-roster.csv`;
    a.click();
  };

  const getMemberName = (memberId: string) =>
    profiles[memberId]?.fullName || profiles[memberId]?.displayName || profiles[memberId]?.email?.split('@')[0] || 'Anonymous User';

  const getMemberRole = (memberId: string): TeamRole | null => {
    const roleId = activeTeam?.memberRoles?.[memberId];
    return roles.find(r => r.id === roleId) || null;
  };

  const pinnedMessages = streamMessages.filter(m => m.pinnedAt);
  const unpinnedMessages = streamMessages.filter(m => !m.pinnedAt);

  if (loading) return <PageLoadingScreen loading label="Loading your teams" />;

  const myName = getMemberName(uid) === 'Anonymous User'
    ? (currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You')
    : getMemberName(uid);
  const canAdmin = !!activeTeam && isAdmin(activeTeam);
  const TABS: { id: string; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'roster', label: 'Roster', icon: <LayoutGrid size={15} /> },
    { id: 'stream', label: 'Stream', icon: <MessageSquare size={15} />, count: streamMessages.length || undefined },
    { id: 'assignments', label: 'Assignments', icon: <ClipboardList size={15} />, count: assignments.length || undefined },
    { id: 'people', label: 'People', icon: <Users size={15} />, count: activeTeam?.members?.length },
    { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ];
  const today = new Date().toISOString().slice(0, 10);

  const copyJoinCode = async () => {
    if (!activeTeam) return;
    try { await navigator.clipboard.writeText(activeTeam.joinCode); toast('Join code copied'); }
    catch { setShowJoinCode(true); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="tm ui-page">
      {/* ── Sidebar ── */}
      <aside className="tm-side ui-card">
        <div className="tm-side-head">
          <span className="ui-eyebrow"><Users size={13} /> Teams</span>
        </div>

        {teams.length > 0 && (
          <div className="tm-team-list">
            {teams.map(team => (
              <button
                key={team.id}
                className={`tm-team${activeTeam?.id === team.id ? ' is-active' : ''}`}
                onClick={() => setActiveTeam(team)}
              >
                <span className="tm-team-badge" style={{ background: team.bannerColor || 'var(--brand-gradient)' }}>{initials(team.name)}</span>
                <span className="tm-team-text">
                  <span className="tm-team-name">{team.name}</span>
                  <span className="tm-team-meta">Division {team.division} · {team.members?.length ?? 0} members</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <button className={`tm-team tm-team-new${!activeTeam ? ' is-active' : ''}`} onClick={() => setActiveTeam(null)}>
          <span className="tm-team-badge is-ghost"><Plus size={16} /></span>
          <span className="tm-team-text"><span className="tm-team-name">Join or create</span></span>
        </button>

        <div className="tm-side-links">
          <Link to="/upcoming" className={`tm-side-link${location.pathname === '/upcoming' ? ' is-active' : ''}`}>
            <Calendar size={16} /> Upcoming events <ChevronRight size={14} className="tm-side-chev" />
          </Link>
          {activeTeam && (
            <button className="tm-side-link" onClick={() => setActiveTab('settings')}>
              <Settings size={16} /> Team settings
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <section className="tm-main">
        {!activeTeam ? (
          <div className="tm-empty">
            <div className="tm-empty-head">
              <div className="ui-empty-icon"><Users size={24} /></div>
              <h1>{teams.length ? 'Add another team' : 'Bring your team together'}</h1>
              <p>Rosters by event, a team stream, assignments, roles and a shared calendar. Join with a code from your captain, or start a team yourself.</p>
            </div>
            <div className="tm-empty-grid">
              <form className="ui-card tm-empty-card" onSubmit={e => { e.preventDefault(); handleJoinTeam(); }}>
                <span className="tm-empty-icon"><UserPlus size={18} /></span>
                <h3>Join a team</h3>
                <p className="ui-muted">Ask your captain for the 6-character code.</p>
                <input className="ui-input tm-code-input" placeholder="ABC123" value={joinCodeInput} onChange={e => setJoinCodeInput(e.target.value.toUpperCase())} maxLength={8} aria-label="Join code" />
                <button className="ui-btn ui-btn-ink" disabled={!joinCodeInput.trim()}>Join team</button>
              </form>
              <form className="ui-card tm-empty-card" onSubmit={e => { e.preventDefault(); handleCreateTeam(); }}>
                <span className="tm-empty-icon is-alt"><Plus size={18} /></span>
                <h3>Create a team</h3>
                <p className="ui-muted">You’ll get a join code to share.</p>
                <input className="ui-input" placeholder="Team name" value={createNameInput} onChange={e => setCreateNameInput(e.target.value)} aria-label="Team name" />
                <div className="ui-segment tm-div-seg">
                  <button type="button" className={createDivisionInput === 'B' ? 'is-active' : ''} onClick={() => setCreateDivisionInput('B')}>Division B</button>
                  <button type="button" className={createDivisionInput === 'C' ? 'is-active' : ''} onClick={() => setCreateDivisionInput('C')}>Division C</button>
                </div>
                <button className="ui-btn ui-btn-primary" disabled={!createNameInput.trim()}>Create team</button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <header className="tm-hero" style={{ background: activeTeam.bannerColor || 'var(--brand-gradient)' }}>
              <div className="tm-hero-text">
                <div className="tm-hero-chips">
                  <span className="tm-hero-chip">Division {activeTeam.division}</span>
                  <span className="tm-hero-chip">{activeTeam.members?.length || 0} member{activeTeam.members?.length === 1 ? '' : 's'}</span>
                  {activeTeam.ownerId === uid && <span className="tm-hero-chip"><Crown size={12} /> Owner</span>}
                </div>
                <h1>{activeTeam.name}</h1>
              </div>
              <div className="tm-hero-actions">
                <button className="tm-code" onClick={copyJoinCode} title="Copy join code">
                  <span className="tm-code-label">Join code</span>
                  <span className="tm-code-value">{activeTeam.joinCode}</span>
                  <Copy size={14} />
                </button>
                <button className="tm-glass" title="Export roster as CSV" onClick={handleExportRoster} aria-label="Export roster"><Download size={17} /></button>
                <button className="tm-glass is-danger" title={activeTeam.ownerId === uid ? 'Delete team' : 'Leave team'} onClick={handleLeaveTeam} aria-label={activeTeam.ownerId === uid ? 'Delete team' : 'Leave team'}>
                  {activeTeam.ownerId === uid ? <Trash2 size={17} /> : <LogOut size={17} />}
                </button>
              </div>
            </header>

            {/* ── Tabs ── */}
            <nav className="tm-tabs" role="tablist">
              {TABS.map(t => (
                <button key={t.id} role="tab" aria-selected={activeTab === t.id} className={`tm-tab${activeTab === t.id ? ' is-active' : ''}`} onClick={() => setActiveTab(t.id)}>
                  {t.icon} {t.label}
                  {t.count !== undefined && <span className="tm-tab-count ui-tnum">{t.count}</span>}
                </button>
              ))}
            </nav>

            {/* ═══════════ ROSTER ═══════════ */}
            {activeTab === 'roster' && (
              <div className="tm-panel">
                <div className="tm-toolbar">
                  <div className="tm-subteams">
                    {subteams.map(st => (
                      <button key={st.id} onClick={() => setActiveSubteam(st)} className={`ui-chip${activeSubteam?.id === st.id ? ' is-active' : ''}`}>{st.name}</button>
                    ))}
                    {subteams.length === 0 && <span className="ui-muted">No subteams yet</span>}
                  </div>
                  <div className="tm-toolbar-actions">
                    {activeSubteam && <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={handleEditSubteamName}><Pencil size={14} /> Rename</button>}
                    <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={handleAddSubteam}><Plus size={14} /> Add subteam</button>
                  </div>
                </div>

                {activeSubteam && (
                  eventCategories.length === 0 ? (
                    <div className="ui-card ui-empty">
                      <div className="ui-empty-icon"><Tag size={22} /></div>
                      <h3>No event blocks yet</h3>
                      <p>Group your events into conflict blocks (for example “Block 1” or “Chemistry Events”) and assign two members to each.</p>
                      <button className="ui-btn ui-btn-primary" onClick={() => setActiveTab('settings')}>Set up event blocks</button>
                    </div>
                  ) : (
                    <div className="tm-blocks">
                      {eventCategories.map(cat => {
                        const filled = cat.events.reduce((n, ev) => n + (teamMembers[ev]?.filter(Boolean).length ?? 0), 0);
                        return (
                          <div key={cat.id} className="ui-card tm-block" style={{ ['--cat' as string]: cat.color }}>
                            <div className="tm-block-head">
                              <span className="tm-block-title">
                                {cat.icon && <span className="tm-block-emoji">{cat.icon}</span>}
                                {cat.name}
                              </span>
                              <span className="tm-block-count ui-tnum">{filled}/{cat.events.length * 2} filled</span>
                            </div>
                            <div className="tm-events">
                              {cat.events.map((eventName, ei) => {
                                const m = eventMeta(eventName);
                                return (
                                  <div key={ei} className="tm-event">
                                    <div className="tm-event-name">
                                      <span className="tm-event-icon" style={{ color: m.color, background: `color-mix(in srgb, ${m.color} 12%, transparent)` }}><m.icon size={14} /></span>
                                      {eventName}
                                    </div>
                                    <div className="tm-event-inputs">
                                      {[0, 1].map(idx => (
                                        <input
                                          key={idx}
                                          className="ui-input"
                                          placeholder={`Partner ${idx + 1}`}
                                          value={teamMembers[eventName]?.[idx] || ''}
                                          onChange={e => updateMember(eventName, idx, e.target.value)}
                                          aria-label={`${eventName} partner ${idx + 1}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            )}

            {/* ═══════════ STREAM ═══════════ */}
            {activeTab === 'stream' && (
              <div className="tm-panel tm-narrow">
                <form className="ui-card tm-composer" onSubmit={e => { e.preventDefault(); handleSendStreamMessage(); }}>
                  <span className="tm-avatar">{initials(myName)}</span>
                  <input className="ui-input" placeholder="Announce something to your team…" value={newStreamMsg} onChange={e => setNewStreamMsg(e.target.value)} aria-label="New message" />
                  <button className="ui-btn ui-btn-primary" disabled={!newStreamMsg.trim()}><Send size={15} /> Post</button>
                </form>

                {pinnedMessages.length > 0 && (
                  <div className="tm-pinned">
                    <span className="tm-section-label"><Pin size={13} /> Pinned</span>
                    {pinnedMessages.map(msg => (
                      <StreamMsgCard key={msg.id} msg={msg} uid={uid} isAdmin={canAdmin}
                        editingMsgId={editingMsgId} editMsgContent={editMsgContent}
                        openMsgMenu={openMsgMenu} menuRef={menuRef}
                        setEditingMsgId={setEditingMsgId} setEditMsgContent={setEditMsgContent}
                        setOpenMsgMenu={setOpenMsgMenu}
                        onEdit={handleEditMsg} onDelete={handleDeleteMsg} onPin={handlePinMsg}
                        pinned />
                    ))}
                  </div>
                )}

                {unpinnedMessages.length === 0 && pinnedMessages.length === 0 ? (
                  <div className="ui-card ui-empty">
                    <div className="ui-empty-icon"><MessageSquare size={22} /></div>
                    <h3>No messages yet</h3>
                    <p>Post practice times, reminders or shout-outs. Share custom tests here from the Create page.</p>
                  </div>
                ) : (
                  <div className="tm-list">
                    {unpinnedMessages.map(msg => (
                      <StreamMsgCard key={msg.id} msg={msg} uid={uid} isAdmin={canAdmin}
                        editingMsgId={editingMsgId} editMsgContent={editMsgContent}
                        openMsgMenu={openMsgMenu} menuRef={menuRef}
                        setEditingMsgId={setEditingMsgId} setEditMsgContent={setEditMsgContent}
                        setOpenMsgMenu={setOpenMsgMenu}
                        onEdit={handleEditMsg} onDelete={handleDeleteMsg} onPin={handlePinMsg}
                        pinned={false} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════ ASSIGNMENTS ═══════════ */}
            {activeTab === 'assignments' && (
              <div className="tm-panel tm-narrow">
                <div className="tm-panel-head">
                  <div>
                    <h2>Assignments</h2>
                    <p className="ui-muted">Give the team tests to finish by a due date.</p>
                  </div>
                  {!showAssignmentModal && <button className="ui-btn ui-btn-primary" onClick={() => setShowAssignmentModal(true)}><Plus size={15} /> New assignment</button>}
                </div>

                {showAssignmentModal && (
                  <form className="ui-card tm-form" onSubmit={e => { e.preventDefault(); handleAddAssignment(); }}>
                    <h3>New assignment</h3>
                    <label><span className="ui-label">Title</span><input className="ui-input" placeholder="e.g. Disease Detectives set #3" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} autoFocus /></label>
                    <label><span className="ui-label">Description</span><textarea className="ui-input" rows={3} placeholder="Instructions for the team" value={assignmentDesc} onChange={e => setAssignmentDesc(e.target.value)} /></label>
                    <div className="tm-form-row">
                      <label><span className="ui-label">Due date</span><input className="ui-input" type="date" value={assignmentDueDate} onChange={e => setAssignmentDueDate(e.target.value)} /></label>
                      <label><span className="ui-label">Attach a test (optional)</span>
                        <select className="ui-input" value={assignmentCustomTestId} onChange={e => setAssignmentCustomTestId(e.target.value)}>
                          <option value="">None</option>
                          {customTests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="tm-form-actions">
                      <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                      <button className="ui-btn ui-btn-primary" disabled={!assignmentTitle.trim()}>Create assignment</button>
                    </div>
                  </form>
                )}

                {assignments.length === 0 ? (
                  !showAssignmentModal && (
                    <div className="ui-card ui-empty">
                      <div className="ui-empty-icon"><ClipboardList size={22} /></div>
                      <h3>No assignments yet</h3>
                      <p>Create one and attach a custom test so everyone practices the same material.</p>
                    </div>
                  )
                ) : (
                  <div className="tm-list">
                    {assignments.map(a => {
                      const overdue = !!a.dueDate && a.dueDate < today;
                      return (
                        <div key={a.id} className="ui-card tm-assign">
                          <span className={`tm-assign-icon${overdue ? ' is-late' : ''}`}><ClipboardList size={17} /></span>
                          <div className="tm-assign-body">
                            <h4>{a.title}</h4>
                            {a.description && <p>{a.description}</p>}
                            <div className="tm-assign-meta">
                              {a.dueDate && (
                                <span className={`ui-chip ${overdue ? 'ui-chip-danger' : a.dueDate === today ? 'ui-chip-warning' : ''}`}>
                                  <Calendar size={12} /> {overdue ? 'Was due' : 'Due'} {new Date(a.dueDate + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              {a.customTestId && <Link to={`/test/${a.customTestId}`} className="ui-btn ui-btn-soft ui-btn-sm"><FileText size={13} /> Take test</Link>}
                            </div>
                          </div>
                          {canAdmin && (
                            <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon tm-del" aria-label="Delete assignment"
                              onClick={async () => { if (a.id && confirm(`Delete “${a.title}”?`)) { await firestoreService.deleteAssignment(activeTeam.id, a.id); loadAssignments(activeTeam.id); } }}>
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════ PEOPLE ═══════════ */}
            {activeTab === 'people' && (
              <div className="tm-panel tm-narrow">
                <div className="tm-panel-head">
                  <div>
                    <h2>People</h2>
                    <p className="ui-muted">{activeTeam.members?.length || 0} members. Invite more with the join code <b>{activeTeam.joinCode}</b>.</p>
                  </div>
                  <button className="ui-btn ui-btn-outline" onClick={copyJoinCode}><Copy size={15} /> Copy invite code</button>
                </div>
                <div className="ui-card tm-people">
                  {activeTeam.members?.map(memberId => {
                    const memberRole = getMemberRole(memberId);
                    const name = memberId === uid ? myName : getMemberName(memberId);
                    return (
                      <div key={memberId} className="tm-person">
                        <span className="tm-avatar" style={memberRole ? { background: memberRole.color } : undefined}>{initials(name)}</span>
                        <div className="tm-person-body">
                          <span className="tm-person-name">{name}{memberId === uid && <span className="ui-muted"> (you)</span>}</span>
                          <span className="tm-person-role">
                            {memberId === activeTeam.ownerId
                              ? <span className="ui-chip ui-chip-warning"><Crown size={11} /> Owner</span>
                              : memberRole
                                ? <span className="ui-chip" style={{ background: `color-mix(in srgb, ${memberRole.color} 14%, transparent)`, color: memberRole.color, borderColor: 'transparent' }}>{memberRole.name}</span>
                                : <span className="ui-chip">Member</span>}
                          </span>
                        </div>
                        {canAdmin && memberId !== activeTeam.ownerId && (
                          <select
                            className="ui-input tm-role-select"
                            value={activeTeam.memberRoles?.[memberId] || ''}
                            aria-label={`Role for ${name}`}
                            onChange={async e => {
                              await firestoreService.assignMemberRole(activeTeam.id, memberId, e.target.value || null);
                              setActiveTeam(t => t ? { ...t, memberRoles: { ...t.memberRoles, [memberId]: e.target.value } } : t);
                              toast('Role updated');
                            }}
                          >
                            <option value="">Member</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════════ SETTINGS ═══════════ */}
            {activeTab === 'settings' && (
              <div className="tm-panel tm-narrow">
                <Section icon={<Pencil size={16} />} title="General" desc="Rename your team.">
                  <label><span className="ui-label">Team name</span><input className="ui-input" value={settingsTeamName} onChange={e => setSettingsTeamName(e.target.value)} /></label>
                  <div className="tm-form-actions">
                    <button className="ui-btn ui-btn-primary" onClick={handleSaveSettings} disabled={settingsSaving}>{settingsSaving ? 'Saving…' : 'Save changes'}</button>
                  </div>
                </Section>

                <Section icon={<Image size={16} />} title="Banner" desc="The color behind your team header.">
                  <div className="tm-banner-preview" style={{ background: settingsBanner }}><span>{settingsTeamName || activeTeam.name}</span></div>
                  <div className="tm-swatches">
                    {BANNER_PRESETS.map(bg => (
                      <button key={bg} className={`tm-banner-swatch${settingsBanner === bg ? ' is-on' : ''}`} style={{ background: bg }} onClick={() => setSettingsBanner(bg)} aria-label="Banner preset" />
                    ))}
                    <label className="tm-custom-color" title="Custom color">
                      <input type="color" value={settingsBanner.startsWith('#') ? settingsBanner : '#1f6feb'} onChange={e => setSettingsBanner(e.target.value)} />
                      Custom
                    </label>
                  </div>
                  <div className="tm-form-actions">
                    <button className="ui-btn ui-btn-primary" onClick={handleSaveSettings}>Apply banner</button>
                  </div>
                </Section>

                <Section icon={<Shield size={16} />} title="Roles & permissions" desc="Give members specific powers.">
                  <div className="tm-rows">
                    {roles.length === 0 && <p className="ui-muted tm-small">No custom roles yet.</p>}
                    {roles.map(r => (
                      <div key={r.id} className="tm-row">
                        <span className="tm-dot" style={{ background: r.color }} />
                        <span className="tm-row-title">{r.name}</span>
                        <span className="tm-row-meta">{Object.entries(r.permissions).filter(([, v]) => v).map(([k]) => k.replace('manage', '')).join(', ') || 'No permissions'}</span>
                        {canAdmin && (
                          <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" aria-label={`Delete role ${r.name}`}
                            onClick={async () => { if (r.id) { await firestoreService.deleteTeamRole(activeTeam.id, r.id); setRoles(p => p.filter(x => x.id !== r.id)); } }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="tm-subform">
                    <span className="tm-subform-title">New role</span>
                    <input className="ui-input" placeholder="Role name, e.g. Captain" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
                    <div className="tm-colors">
                      {ROLE_COLORS.map(c => (
                        <button key={c} className={`tm-color${newRoleColor === c ? ' is-on' : ''}`} style={{ background: c }} onClick={() => setNewRoleColor(c)} aria-label={`Color ${c}`} />
                      ))}
                    </div>
                    <div className="tm-perms">
                      {(Object.keys(DEFAULT_PERMISSIONS) as (keyof typeof DEFAULT_PERMISSIONS)[]).map(perm => (
                        <label key={perm} className="tm-perm">
                          <input type="checkbox" className="ui-switch" checked={newRolePerms[perm]} onChange={e => setNewRolePerms(p => ({ ...p, [perm]: e.target.checked }))} />
                          {perm.replace('manage', 'Manage ')}
                        </label>
                      ))}
                    </div>
                    <div className="tm-form-actions">
                      <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={handleCreateRole} disabled={!newRoleName.trim()}><Plus size={14} /> Create role</button>
                    </div>
                  </div>
                </Section>

                <Section icon={<Tag size={16} />} title="Event blocks" desc="Conflict blocks shown on the roster. Each event gets two partner slots.">
                  <div className="tm-rows">
                    {eventCategories.length === 0 && <p className="ui-muted tm-small">No blocks yet. Add one below.</p>}
                    {eventCategories.map(cat => (
                      <div key={cat.id} className="tm-cat" style={{ ['--cat' as string]: cat.color }}>
                        {editingCatId === cat.id ? (
                          <div className="tm-cat-edit">
                            <input className="ui-input" value={editCatName} onChange={e => setEditCatName(e.target.value)} aria-label="Block name" />
                            <EmojiPicker value={editCatIcon} onChange={setEditCatIcon} />
                            <div className="tm-tags">
                              {editCatEvents.map((ev, i) => (
                                <span key={i} className="ui-chip">
                                  {ev}
                                  <button className="tm-tag-x" onClick={() => setEditCatEvents(p => p.filter((_, idx) => idx !== i))} aria-label={`Remove ${ev}`}><X size={11} /></button>
                                </span>
                              ))}
                            </div>
                            <form className="tm-inline" onSubmit={e => { e.preventDefault(); if (newEventInput.trim()) { setEditCatEvents(p => [...p, newEventInput.trim()]); setNewEventInput(''); } }}>
                              <input className="ui-input" placeholder="Add an event…" value={newEventInput} onChange={e => setNewEventInput(e.target.value)} />
                              <button className="ui-btn ui-btn-outline ui-btn-sm">Add</button>
                            </form>
                            <div className="tm-form-actions">
                              <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => setEditingCatId(null)}>Cancel</button>
                              <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => cat.id && handleSaveCategoryEdit(cat.id)}>Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="tm-cat-head">
                              <span className="tm-row-title">{cat.icon && <span>{cat.icon}</span>} {cat.name}</span>
                              <div className="tm-cat-actions">
                                <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" aria-label={`Edit ${cat.name}`}
                                  onClick={() => { setEditingCatId(cat.id || null); setEditCatName(cat.name); setEditCatIcon(cat.icon || ''); setEditCatEvents(cat.events); setNewEventInput(''); }}>
                                  <Edit2 size={14} />
                                </button>
                                <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" aria-label={`Delete ${cat.name}`}
                                  onClick={async () => { if (cat.id && confirm(`Delete block “${cat.name}”?`)) { await firestoreService.deleteEventCategory(activeTeam.id, cat.id); setEventCategories(p => p.filter(c => c.id !== cat.id)); } }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="tm-tags">{cat.events.map(ev => <span key={ev} className="ui-chip">{ev}</span>)}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {!showCatForm ? (
                    <button className="ui-btn ui-btn-outline" onClick={() => setShowCatForm(true)}><Plus size={15} /> Add block</button>
                  ) : (
                    <div className="tm-subform">
                      <span className="tm-subform-title">New block</span>
                      <input className="ui-input" placeholder="Block name, e.g. Block 1" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                      <input className="ui-input" placeholder="Events, comma separated (e.g. Anatomy & Physiology, Codebusters)" value={newCatEvents} onChange={e => setNewCatEvents(e.target.value)} />
                      <EmojiPicker value={newCatIcon} onChange={setNewCatIcon} />
                      <div className="tm-colors">
                        {CAT_COLORS.map(c => (
                          <button key={c} className={`tm-color${newCatColor === c ? ' is-on' : ''}`} style={{ background: c }} onClick={() => setNewCatColor(c)} aria-label={`Color ${c}`} />
                        ))}
                      </div>
                      <div className="tm-form-actions">
                        <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => { setShowCatForm(false); setNewCatIcon(''); }}>Cancel</button>
                        <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={handleAddCategory} disabled={!newCatName.trim()}>Add block</button>
                      </div>
                    </div>
                  )}
                </Section>

                <Section icon={<AlertTriangle size={16} />} title="Danger zone" desc={activeTeam.ownerId === uid ? 'Deleting removes the team for everyone.' : 'You can rejoin later with the code.'} danger>
                  <button className="ui-btn ui-btn-danger" onClick={handleLeaveTeam}>
                    {activeTeam.ownerId === uid ? <><Trash2 size={15} /> Delete team</> : <><LogOut size={15} /> Leave team</>}
                  </button>
                </Section>
              </div>
            )}
          </>
        )}
      </section>

      {/* Subteam name modal */}
      {nameModal && (
        <div className="ui-modal-backdrop" onMouseDown={() => setNameModal(null)}>
          <form className="ui-modal tm-modal" onMouseDown={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); submitNameModal(); }}>
            <h3>{nameModal.mode === 'add' ? 'New subteam' : 'Rename subteam'}</h3>
            <input className="ui-input" autoFocus placeholder="e.g. Team A" value={nameModal.value} onChange={e => setNameModal({ ...nameModal, value: e.target.value })} />
            <div className="tm-form-actions">
              <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setNameModal(null)}>Cancel</button>
              <button className="ui-btn ui-btn-primary" disabled={!nameModal.value.trim()}>{nameModal.mode === 'add' ? 'Add subteam' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Join code fallback (clipboard blocked) */}
      {showJoinCode && activeTeam && (
        <div className="ui-modal-backdrop" onMouseDown={() => setShowJoinCode(false)}>
          <div className="ui-modal tm-modal" onMouseDown={e => e.stopPropagation()}>
            <h3>Join code for {activeTeam.name}</h3>
            <div className="tm-big-code">{activeTeam.joinCode}</div>
            <div className="tm-form-actions"><button className="ui-btn ui-btn-primary" onClick={() => setShowJoinCode(false)}>Done</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ icon, title, desc, children, danger }: { icon: React.ReactNode; title: string; desc?: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`ui-card tm-section${danger ? ' is-danger' : ''}`}>
      <div className="tm-section-head">
        <span className="tm-section-icon">{icon}</span>
        <div>
          <h3>{title}</h3>
          {desc && <p>{desc}</p>}
        </div>
      </div>
      <div className="tm-section-body">{children}</div>
    </section>
  );
}

function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="tm-emoji">
      <span className="tm-emoji-current">{value || '–'}</span>
      <div className="tm-emoji-list">
        {EMOJIS.map(em => (
          <button key={em} type="button" className={`tm-emoji-btn${value === em ? ' is-on' : ''}`} onClick={() => onChange(em)} aria-label={`Icon ${em}`}>{em}</button>
        ))}
        {value && <button type="button" className="tm-emoji-clear" onClick={() => onChange('')}>Clear</button>}
      </div>
    </div>
  );
}

function StreamMsgCard({ msg, uid, isAdmin, editingMsgId, editMsgContent, openMsgMenu, menuRef,
  setEditingMsgId, setEditMsgContent, setOpenMsgMenu, onEdit, onDelete, onPin, pinned }: {
  msg: StreamMessage; uid: string; isAdmin: boolean;
  editingMsgId: string | null; editMsgContent: string;
  openMsgMenu: string | null; menuRef: React.RefObject<HTMLDivElement | null>;
  setEditingMsgId: (id: string | null) => void;
  setEditMsgContent: (c: string) => void;
  setOpenMsgMenu: (id: string | null) => void;
  onEdit: (msg: StreamMessage) => void;
  onDelete: (msg: StreamMessage) => void;
  onPin: (msg: StreamMessage) => void;
  pinned: boolean;
}) {
  const canModify = msg.authorId === uid || isAdmin;
  const isEditing = editingMsgId === msg.id;

  return (
    <article className={`ui-card tm-msg${pinned ? ' is-pinned' : ''}`}>
      <span className="tm-avatar">{initials(msg.authorName || '?')}</span>
      <div className="tm-msg-body">
        <div className="tm-msg-head">
          <span className="tm-msg-author">{msg.authorName}</span>
          <span className="tm-msg-time">{formatTime(msg.timestamp)}{msg.editedAt ? ' · edited' : ''}</span>
          {pinned && <Pin size={12} className="tm-msg-pin" />}
          {canModify && (
            <div className="tm-msg-menu-wrap" ref={openMsgMenu === msg.id ? menuRef : undefined}>
              <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" aria-label="Message actions" onClick={() => setOpenMsgMenu(openMsgMenu === msg.id ? null : (msg.id || null))}>
                <MoreHorizontal size={16} />
              </button>
              {openMsgMenu === msg.id && (
                <div className="tm-menu">
                  {msg.authorId === uid && (
                    <button onClick={() => { setEditingMsgId(msg.id || null); setEditMsgContent(msg.content); setOpenMsgMenu(null); }}><Edit2 size={14} /> Edit</button>
                  )}
                  <button onClick={() => { onPin(msg); setOpenMsgMenu(null); }}><Pin size={14} /> {msg.pinnedAt ? 'Unpin' : 'Pin'}</button>
                  <button className="danger" onClick={() => { onDelete(msg); setOpenMsgMenu(null); }}><Trash2 size={14} /> Delete</button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <form className="tm-inline" onSubmit={e => { e.preventDefault(); onEdit(msg); }}>
            <input className="ui-input" value={editMsgContent} onChange={e => setEditMsgContent(e.target.value)} autoFocus />
            <button className="ui-btn ui-btn-primary ui-btn-sm ui-btn-icon" aria-label="Save"><Check size={15} /></button>
            <button type="button" className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" onClick={() => setEditingMsgId(null)} aria-label="Cancel"><X size={15} /></button>
          </form>
        ) : (
          <p className="tm-msg-text">{msg.content}</p>
        )}

        {msg.customTestId && (
          <div className="tm-attach">
            <span className="tm-attach-icon"><FileText size={16} /></span>
            <div className="tm-attach-text">
              <span className="tm-attach-title">{msg.customTestTitle || 'Custom test'}</span>
              <span className="tm-attach-sub">Shared test</span>
            </div>
            <Link to={`/test/${msg.customTestId}`} className="ui-btn ui-btn-primary ui-btn-sm">Take test</Link>
          </div>
        )}
      </div>
    </article>
  );
}
