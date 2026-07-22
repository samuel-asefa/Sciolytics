import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Calendar, Settings, Users, UserPlus, Download, LogOut, Trash2,
  ChevronRight, Pencil, Send, Plus, Pin, Edit2, X, Check, MoreHorizontal,
  Palette, Shield, Tag, Image
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  firestoreService,
  type Team, type Subteam, type StreamMessage, type TeamAssignment,
  type TeamRole, type EventCategory, type CustomTest
} from '../services/firestoreService';
import PageLoadingScreen from '../components/PageLoadingScreen';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts: any): string {
  if (!ts) return '';
  const d: Date = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('default', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const BANNER_PRESETS = [
  'linear-gradient(135deg,#1e3a5f,#2563eb)',
  'linear-gradient(135deg,#14532d,#16a34a)',
  'linear-gradient(135deg,#581c87,#9333ea)',
  'linear-gradient(135deg,#7f1d1d,#dc2626)',
  'linear-gradient(135deg,#1c1917,#57534e)',
  'linear-gradient(135deg,#0c4a6e,#0ea5e9)',
];

const ROLE_COLORS = ['#2563eb','#16a34a','#9333ea','#dc2626','#ea580c','#db2777','#0891b2'];

const DEFAULT_PERMISSIONS = {
  manageRoster: false, manageEvents: false, manageAssignments: false,
  manageStream: false, manageMembers: false, manageSettings: false,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Teams() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

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

  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [profilesLoading, setProfilesLoading] = useState(false);
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
  const [newCatColor, setNewCatColor] = useState('#2563eb');
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
    const profs: Record<string, any> = {};
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
    } catch (err) { alert('Failed to create team.'); }
  };

  const handleJoinTeam = async () => {
    if (!joinCodeInput) return;
    try {
      const t = await firestoreService.joinTeam(uid, joinCodeInput);
      if (t) { setJoinCodeInput(''); await loadTeams(); setActiveTeam(t); }
      else alert('Invalid join code');
    } catch { alert('Failed to join team.'); }
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

  const handleAddSubteam = async () => {
    if (!activeTeam) return;
    const name = prompt('Enter new subteam name:');
    if (name) {
      const s = await firestoreService.addSubteam(activeTeam.id, name);
      setSubteams(p => [...p, s]); setActiveSubteam(s);
    }
  };

  const handleEditSubteamName = async () => {
    if (!activeTeam || !activeSubteam) return;
    const name = prompt('New subteam name:', activeSubteam.name);
    if (name) { await firestoreService.updateSubteamName(activeTeam.id, activeSubteam.id, name); loadSubteams(activeTeam.id); }
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
    } catch { alert('Failed to create assignment'); }
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

  if (loading) return <PageLoadingScreen loading={true} />;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="teams-page">

      {/* ── Sidebar ── */}
      <div className="teams-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon"></div>
            <span className="logo-text">Sciolytics</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/teams" className={location.pathname === '/teams' ? 'nav-item active' : 'nav-item'}>
            <Home size={18} /> All Teams
          </Link>
          <Link to="/upcoming" className={location.pathname === '/upcoming' ? 'nav-item active' : 'nav-item'}>
            <Calendar size={18} /> Upcoming <ChevronRight size={16} />
          </Link>
          <button
            className="nav-item"
            style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: 'inherit', fontFamily: 'inherit' }}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>

        {teams.length > 0 && (
          <div className="your-teams">
            <h4>YOUR TEAMS</h4>
            {teams.map(team => (
              <div
                key={team.id}
                className={`team-card ${activeTeam?.id === team.id ? 'active' : ''}`}
                onClick={() => setActiveTeam(team)}
                style={{ cursor: 'pointer' }}
              >
                <Users size={18} />
                <div>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{team.name}</div>
                  <div className="team-division">Division {team.division}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main ── */}
      <div className="teams-main">
        {!activeTeam ? (
          /* No team — join/create */
          <div style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
            <h2>You don't have a team yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Join an existing team or create a new one.
            </p>
            <div style={{ background: 'var(--bg-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <h3>Join a Team</h3>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input type="text" placeholder="Enter 6-character Join Code" value={joinCodeInput} onChange={e => setJoinCodeInput(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                <button className="btn-primary" onClick={handleJoinTeam}>Join</button>
              </div>
            </div>
            <div style={{ background: 'var(--bg-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h3>Create a Team</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <input type="text" placeholder="Team Name" value={createNameInput} onChange={e => setCreateNameInput(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                <select value={createDivisionInput} onChange={e => setCreateDivisionInput(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <option value="B">Division B (Middle School)</option>
                  <option value="C">Division C (High School)</option>
                </select>
                <button className="btn-primary" onClick={handleCreateTeam}>Create Team</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="teams-header" style={{ background: activeTeam.bannerColor || BANNER_PRESETS[0] }}>
              <div className="header-gradient">
                <h1>{activeTeam.name}</h1>
                <p>Division {activeTeam.division} • {activeTeam.members?.length || 0} member(s)</p>
              </div>
              <div className="header-actions">
                <button className="icon-btn" title={`Join Code: ${activeTeam.joinCode}`}
                  onClick={() => alert(`Join Code for ${activeTeam.name}:\n\n${activeTeam.joinCode}`)}>
                  <UserPlus size={20} />
                </button>
                <button className="icon-btn" title="Export Roster as CSV" onClick={handleExportRoster}>
                  <Download size={20} />
                </button>
                <button
                  className="icon-btn"
                  title={activeTeam.ownerId === uid ? 'Delete Team' : 'Leave Team'}
                  onClick={handleLeaveTeam}
                  style={{ color: '#ef4444' }}
                >
                  {activeTeam.ownerId === uid ? <Trash2 size={20} /> : <LogOut size={20} />}
                </button>
                <div className="user-menu">
                  <div className="user-avatar"><Users size={20} /></div>
                  <span>{getMemberName(uid)}</span>
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="teams-tabs">
              {['roster', 'stream', 'assignments', 'people', 'settings'].map(tab => (
                <button key={tab} className={activeTab === tab ? 'tab active' : 'tab'} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* ═══════════ ROSTER TAB ═══════════ */}
            {activeTab === 'roster' && (
              <div className="roster-content">
                <div className="roster-header">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {subteams.map(st => (
                      <button key={st.id} onClick={() => setActiveSubteam(st)}
                        className={`toggle-btn ${activeSubteam?.id === st.id ? 'active' : ''}`}>
                        {st.name}
                      </button>
                    ))}
                  </div>
                  <div className="subteam-controls">
                    {activeSubteam && (
                      <button className="subteam-btn" onClick={handleEditSubteamName}><Pencil size={16} /> Edit Name</button>
                    )}
                    <button className="add-subteam-btn" onClick={handleAddSubteam}>+ Add Subteam</button>
                  </div>
                </div>

                {activeSubteam && (
                  <>
                    {eventCategories.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>No events configured yet.</p>
                        <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => setActiveTab('settings')}>
                          Configure Events in Settings
                        </button>
                      </div>
                    ) : (
                      <div className="conflict-blocks">
                        {eventCategories.map(cat => (
                          <div key={cat.id} className="conflict-block" style={{ borderLeft: `4px solid ${cat.color}`, background: `color-mix(in srgb, ${cat.color} 8%, var(--bg-white))` }}>
                            <div style={{ fontWeight: 700, marginBottom: '12px', color: cat.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {cat.icon && <span style={{ fontSize: '1.2em', lineHeight: 1 }}>{cat.icon}</span>}
                              {cat.name}
                            </div>
                            {cat.events.map((eventName, ei) => (
                              <div key={ei} className="event-assignment">
                                <div className="event-header"><span className="event-name">{eventName}</span></div>
                                <div className="member-inputs">
                                  <input type="text" placeholder="Name" value={teamMembers[eventName]?.[0] || ''}
                                    onChange={e => updateMember(eventName, 0, e.target.value)} />
                                  <input type="text" placeholder="Name" value={teamMembers[eventName]?.[1] || ''}
                                    onChange={e => updateMember(eventName, 1, e.target.value)} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ═══════════ STREAM TAB ═══════════ */}
            {activeTab === 'stream' && (
              <div style={{ padding: '24px' }}>
                {/* Composer */}
                <div style={{ background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                  <input type="text" placeholder="Announce something to your team..." value={newStreamMsg}
                    onChange={e => setNewStreamMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendStreamMessage()}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  <button className="btn-primary" onClick={handleSendStreamMessage} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px' }}>
                    <Send size={18} /> Post
                  </button>
                </div>

                {/* Pinned */}
                {pinnedMessages.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary-color)', fontWeight: 600, fontSize: '13px' }}>
                      <Pin size={14} /> PINNED MESSAGES
                    </div>
                    {pinnedMessages.map(msg => (
                      <StreamMsgCard key={msg.id} msg={msg} uid={uid} isAdmin={!!activeTeam && isAdmin(activeTeam)}
                        editingMsgId={editingMsgId} editMsgContent={editMsgContent}
                        openMsgMenu={openMsgMenu} menuRef={menuRef}
                        setEditingMsgId={setEditingMsgId} setEditMsgContent={setEditMsgContent}
                        setOpenMsgMenu={setOpenMsgMenu}
                        onEdit={handleEditMsg} onDelete={handleDeleteMsg} onPin={handlePinMsg}
                        pinned />
                    ))}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginTop: '16px' }} />
                  </div>
                )}

                {/* Messages */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {unpinnedMessages.length === 0 && pinnedMessages.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No messages yet. Be the first!</p>
                  ) : (
                    unpinnedMessages.map(msg => (
                      <StreamMsgCard key={msg.id} msg={msg} uid={uid} isAdmin={!!activeTeam && isAdmin(activeTeam)}
                        editingMsgId={editingMsgId} editMsgContent={editMsgContent}
                        openMsgMenu={openMsgMenu} menuRef={menuRef}
                        setEditingMsgId={setEditingMsgId} setEditMsgContent={setEditMsgContent}
                        setOpenMsgMenu={setOpenMsgMenu}
                        onEdit={handleEditMsg} onDelete={handleDeleteMsg} onPin={handlePinMsg}
                        pinned={false} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ═══════════ ASSIGNMENTS TAB ═══════════ */}
            {activeTab === 'assignments' && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2>Team Assignments</h2>
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }} onClick={() => setShowAssignmentModal(true)}>
                    <Plus size={18} /> Create
                  </button>
                </div>
                {showAssignmentModal && (
                  <div style={{ background: 'var(--bg-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>New Assignment</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" placeholder="Title" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                      <textarea placeholder="Description" value={assignmentDesc} onChange={e => setAssignmentDesc(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit' }} />
                      <input type="date" value={assignmentDueDate} onChange={e => setAssignmentDueDate(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                      
                      <select 
                        value={assignmentCustomTestId} 
                        onChange={e => setAssignmentCustomTestId(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      >
                        <option value="">-- Optional: Attach a Custom Test --</option>
                        {customTests.map(t => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-primary" onClick={handleAddAssignment}>Save</button>
                        <button className="btn-secondary" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                {assignments.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No assignments yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assignments.map(a => (
                      <div key={a.id} style={{ background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ marginBottom: '4px' }}>{a.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>{a.description}</p>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {a.dueDate && <span style={{ fontSize: '12px', background: 'var(--bg-gray)', padding: '4px 8px', borderRadius: '4px' }}>Due: {a.dueDate}</span>}
                            {a.customTestId && (
                              <Link to={`/test/${a.customTestId}`} style={{ fontSize: '12px', background: 'var(--primary-color)', color: 'white', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none' }}>
                                Take Test
                              </Link>
                            )}
                          </div>
                        </div>
                        {isAdmin(activeTeam) && (
                          <button onClick={async () => { if (a.id) { await firestoreService.deleteAssignment(activeTeam.id, a.id); loadAssignments(activeTeam.id); } }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════ PEOPLE TAB ═══════════ */}
            {activeTab === 'people' && (
              <div style={{ padding: '24px' }}>
                <h2>Team Members</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  {activeTeam.members?.map(memberId => {
                    const memberRole = getMemberRole(memberId);
                    return (
                      <div key={memberId} style={{ background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="user-avatar"><Users size={20} /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{getMemberName(memberId)}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            {memberId === activeTeam.ownerId
                              ? <span style={{ color: '#f59e0b', fontWeight: 600 }}>👑 Owner</span>
                              : memberRole
                                ? <span style={{ background: memberRole.color, color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{memberRole.name}</span>
                                : 'Member'
                            }
                          </div>
                        </div>
                        {isAdmin(activeTeam) && memberId !== activeTeam.ownerId && (
                          <select
                            value={activeTeam.memberRoles?.[memberId] || ''}
                            onChange={async e => {
                              await firestoreService.assignMemberRole(activeTeam.id, memberId, e.target.value || null);
                              setActiveTeam(t => t ? { ...t, memberRoles: { ...t.memberRoles, [memberId]: e.target.value } } : t);
                            }}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                          >
                            <option value="">Member (default)</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════════ SETTINGS TAB ═══════════ */}
            {activeTab === 'settings' && (
              <div style={{ padding: '24px', maxWidth: '700px' }}>

                {/* General */}
                <Section icon={<Pencil size={18} />} title="General">
                  <label style={labelStyle}>Team Name</label>
                  <input value={settingsTeamName} onChange={e => setSettingsTeamName(e.target.value)}
                    style={inputStyle} />
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button className="btn-primary" onClick={handleSaveSettings} disabled={settingsSaving}>
                      {settingsSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </Section>

                {/* Banner */}
                <Section icon={<Image size={18} />} title="Team Banner">
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {BANNER_PRESETS.map(bg => (
                      <button key={bg} onClick={() => setSettingsBanner(bg)}
                        style={{ width: '80px', height: '44px', borderRadius: '8px', background: bg, border: settingsBanner === bg ? '3px solid var(--primary-color)' : '3px solid transparent', cursor: 'pointer' }} />
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Custom:</span>
                      <input 
                        type="color" 
                        value={settingsBanner.startsWith('#') ? settingsBanner : '#4b6ba2'} 
                        onChange={e => setSettingsBanner(e.target.value)} 
                        style={{ width: '44px', height: '44px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', height: '56px', borderRadius: '12px', background: settingsBanner }} />
                  <button className="btn-primary" onClick={handleSaveSettings} style={{ marginTop: '12px' }}>Apply Banner</button>
                </Section>

                {/* Roles */}
                <Section icon={<Shield size={18} />} title="Roles & Permissions">
                  {/* existing roles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {roles.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No custom roles yet.</p>}
                    {roles.map(r => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-gray)', border: '1px solid var(--border-color)' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                        <span style={{ fontWeight: 600, flex: 1 }}>{r.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {Object.entries(r.permissions).filter(([, v]) => v).map(([k]) => k.replace('manage', '')).join(', ') || 'No perms'}
                        </span>
                        {isAdmin(activeTeam) && (
                          <button onClick={async () => { if (r.id) { await firestoreService.deleteTeamRole(activeTeam.id, r.id); setRoles(p => p.filter(x => x.id !== r.id)); } }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* new role form */}
                  <div style={{ background: 'var(--bg-gray)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '12px' }}>Create New Role</div>
                    <input placeholder="Role name" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {ROLE_COLORS.map(c => (
                        <button key={c} onClick={() => setNewRoleColor(c)}
                          style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: newRoleColor === c ? '3px solid var(--text-primary)' : '3px solid transparent', cursor: 'pointer' }} />
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      {(Object.keys(DEFAULT_PERMISSIONS) as (keyof typeof DEFAULT_PERMISSIONS)[]).map(perm => (
                        <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={newRolePerms[perm]}
                            onChange={e => setNewRolePerms(p => ({ ...p, [perm]: e.target.checked }))} />
                          {perm.replace('manage', 'Manage ')}
                        </label>
                      ))}
                    </div>
                    <button className="btn-primary" onClick={handleCreateRole}>Create Role</button>
                  </div>
                </Section>

                {/* Event Config */}
                <Section icon={<Tag size={18} />} title="Event Categories (Roster)">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {eventCategories.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No categories yet. Add one below.</p>}
                    {eventCategories.map(cat => (
                      <div key={cat.id} style={{ padding: '12px 16px', borderRadius: '10px', borderLeft: `4px solid ${cat.color}`, background: 'var(--bg-gray)', border: `1px solid var(--border-color)`, borderLeftWidth: '4px', borderLeftColor: cat.color }}>
                        {editingCatId === cat.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input 
                              type="text" 
                              value={editCatName} 
                              onChange={e => setEditCatName(e.target.value)} 
                              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '14px', fontWeight: 600 }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>Icon (optional - emoji or text)</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '22px', minWidth: '32px', textAlign: 'center' }}>{editCatIcon || '—'}</span>
                                <input
                                  type="text"
                                  placeholder="e.g. 🧪 or 🔬"
                                  value={editCatIcon}
                                  onChange={e => setEditCatIcon(e.target.value)}
                                  maxLength={4}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '18px', width: '80px' }}
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {['🧪','🔬','⚗️','🧬','🦠','⚡','🔭','🌿','🏗️','🧲','📐','🌊','🔥','💡','🏆'].map(em => (
                                    <button key={em} onClick={() => setEditCatIcon(em)}
                                      title={em}
                                      style={{ background: editCatIcon === em ? 'var(--primary-color)' : 'var(--bg-white)', border: `1px solid ${editCatIcon === em ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '6px', padding: '2px 4px', fontSize: '16px', cursor: 'pointer' }}>
                                      {em}
                                    </button>
                                  ))}
                                  {editCatIcon && (
                                    <button onClick={() => setEditCatIcon('')}
                                      style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', color: '#ef4444' }}>
                                      ✕ Clear
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {editCatEvents.map((ev, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 6px', fontSize: '12px' }}>
                                  {ev}
                                  <button onClick={() => setEditCatEvents(p => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px', color: '#ef4444', padding: 0 }}><X size={12} /></button>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                placeholder="Add event..." 
                                value={newEventInput} 
                                onChange={e => setNewEventInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && newEventInput.trim()) { setEditCatEvents(p => [...p, newEventInput.trim()]); setNewEventInput(''); } }}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', flex: 1 }}
                              />
                              <button onClick={() => { if (newEventInput.trim()) { setEditCatEvents(p => [...p, newEventInput.trim()]); setNewEventInput(''); } }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Add</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                              <button onClick={() => setEditingCatId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px' }}>Cancel</button>
                              <button onClick={() => cat.id && handleSaveCategoryEdit(cat.id)} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {cat.icon && <span style={{ fontSize: '1.15em' }}>{cat.icon}</span>}
                                {cat.name}
                              </span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => { setEditingCatId(cat.id || null); setEditCatName(cat.name); setEditCatIcon(cat.icon || ''); setEditCatEvents(cat.events); setNewEventInput(''); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={14} /></button>
                                <button onClick={async () => { if (cat.id) { await firestoreService.deleteEventCategory(activeTeam.id, cat.id); setEventCategories(p => p.filter(c => c.id !== cat.id)); } }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{cat.events.join(', ')}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {!showCatForm ? (
                    <button className="btn-secondary" onClick={() => setShowCatForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={16} /> Add Category
                    </button>
                  ) : (
                    <div style={{ background: 'var(--bg-gray)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <input placeholder="Category name (e.g. Block 1)" value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
                      <input placeholder="Events (comma separated)" value={newCatEvents} onChange={e => setNewCatEvents(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
                      
                      {/* Icon picker */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Icon (optional)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '22px', minWidth: '32px', textAlign: 'center' }}>{newCatIcon || '—'}</span>
                          <input
                            type="text"
                            placeholder="e.g. 🧪"
                            value={newCatIcon}
                            onChange={e => setNewCatIcon(e.target.value)}
                            maxLength={4}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '18px', width: '80px' }}
                          />
                          {['🧪','🔬','⚗️','🧬','🦠','⚡','🔭','🌿','🏗️','🧲','📐','🌊','🔥','💡','🏆'].map(em => (
                            <button key={em} onClick={() => setNewCatIcon(em)}
                              title={em}
                              style={{ background: newCatIcon === em ? 'var(--primary-color)' : 'var(--bg-white)', border: `1px solid ${newCatIcon === em ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '6px', padding: '2px 4px', fontSize: '16px', cursor: 'pointer' }}>
                              {em}
                            </button>
                          ))}
                          {newCatIcon && (
                            <button onClick={() => setNewCatIcon('')}
                              style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', color: '#ef4444' }}>
                              ✕ Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {['#2563eb','#16a34a','#9333ea','#dc2626','#ea580c','#db2777'].map(c => (
                          <button key={c} onClick={() => setNewCatColor(c)}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: newCatColor === c ? '3px solid var(--text-primary)' : '3px solid transparent', cursor: 'pointer' }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" onClick={handleAddCategory}>Add</button>
                        <button className="btn-secondary" onClick={() => { setShowCatForm(false); setNewCatIcon(''); }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </Section>

                {/* Danger Zone */}
                <Section icon={<Palette size={18} />} title="Danger Zone">
                  <button
                    onClick={handleLeaveTeam}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', border: '1px solid #ef4444', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {activeTeam.ownerId === uid ? <><Trash2 size={16} /> Delete Team</> : <><LogOut size={16} /> Leave Team</>}
                  </button>
                </Section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--input-border, var(--border-color))', background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: '14px', boxSizing: 'border-box' };

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--primary-color)' }}>{icon}</span>
        <h3 style={{ margin: 0 }}>{title}</h3>
      </div>
      {children}
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
    <div style={{ background: pinned ? 'color-mix(in srgb, var(--primary-color) 6%, var(--bg-white))' : 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: `1px solid ${pinned ? 'var(--primary-color)' : 'var(--border-color)'}`, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{msg.authorName}</div>
        {canModify && (
          <div style={{ position: 'relative' }} ref={openMsgMenu === msg.id ? menuRef : undefined}>
            <button onClick={() => setOpenMsgMenu(openMsgMenu === msg.id ? null : (msg.id || null))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px 6px' }}>
              <MoreHorizontal size={18} />
            </button>
            {openMsgMenu === msg.id && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '140px', overflow: 'hidden' }}>
                {msg.authorId === uid && (
                  <button onClick={() => { setEditingMsgId(msg.id || null); setEditMsgContent(msg.content); setOpenMsgMenu(null); }} style={menuItemStyle}>
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button onClick={() => { onPin(msg); setOpenMsgMenu(null); }} style={menuItemStyle}>
                  <Pin size={14} /> {msg.pinnedAt ? 'Unpin' : 'Pin'}
                </button>
                <button onClick={() => { onDelete(msg); setOpenMsgMenu(null); }} style={{ ...menuItemStyle, color: '#ef4444' }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input value={editMsgContent} onChange={e => setEditMsgContent(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            onKeyDown={e => e.key === 'Enter' && onEdit(msg)} />
          <button onClick={() => onEdit(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}><Check size={18} /></button>
          <button onClick={() => setEditingMsgId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
        </div>
      ) : (
        <div style={{ color: 'var(--text-primary)' }}>{msg.content}</div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <span>Sent {formatTime(msg.timestamp)}</span>
        {msg.editedAt && <span>• Edited {formatTime(msg.editedAt)}</span>}
        {msg.pinnedAt && <span style={{ color: 'var(--primary-color)' }}>• 📌 Pinned</span>}
      </div>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
  padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '14px', color: 'var(--text-primary)', textAlign: 'left',
};
