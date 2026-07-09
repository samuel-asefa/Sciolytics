import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, Archive, Users, UserPlus, Download, Trash2, ChevronRight, Pencil, Send, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type Team, type Subteam, type StreamMessage, type TeamAssignment } from '../services/firestoreService';

interface ConflictBlock {
  id: string;
  color: string;
  events: Array<{
    name: string;
    hasAssign: boolean;
  }>;
}

const conflictBlocks: ConflictBlock[] = [
  {
    id: '1',
    color: 'block-1',
    events: [
      { name: 'Anatomy & Physiology', hasAssign: true },
      { name: 'Engineering CAD', hasAssign: false },
      { name: 'Forensics', hasAssign: true },
    ],
  },
  {
    id: '2',
    color: 'block-2',
    events: [
      { name: 'Codebusters', hasAssign: true },
      { name: 'Disease Detectives', hasAssign: true },
      { name: 'Remote Sensing', hasAssign: true },
    ],
  },
  {
    id: '3',
    color: 'block-3',
    events: [
      { name: 'Astronomy', hasAssign: true },
      { name: 'Entomology', hasAssign: true },
    ],
  },
  {
    id: '4',
    color: 'block-4',
    events: [
      { name: 'Chemistry Lab', hasAssign: true },
      { name: 'Machines', hasAssign: true },
    ],
  },
];

export default function Teams() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [subteams, setSubteams] = useState<Subteam[]>([]);
  const [activeSubteam, setActiveSubteam] = useState<Subteam | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('roster');
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [newStreamMsg, setNewStreamMsg] = useState('');
  
  const [assignments, setAssignments] = useState<TeamAssignment[]>([]);

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [createNameInput, setCreateNameInput] = useState('');
  const [createDivisionInput, setCreateDivisionInput] = useState('C');
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');

  useEffect(() => {
    if (!uid) return;
    loadTeams();
  }, [uid]);

  useEffect(() => {
    if (activeTeam) {
      loadSubteams(activeTeam.id);
      if (activeTab === 'stream') loadStream(activeTeam.id);
      if (activeTab === 'assignments') loadAssignments(activeTeam.id);
      if (activeTab === 'people') loadProfiles(activeTeam.members);
    }
  }, [activeTeam, activeTab]);

  useEffect(() => {
    if (activeSubteam) {
      setTeamMembers(activeSubteam.roster || {});
    }
  }, [activeSubteam]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const userTeams = await firestoreService.getUserTeams(uid);
      setTeams(userTeams);
      if (userTeams.length > 0 && !activeTeam) {
        setActiveTeam(userTeams[0]);
      } else if (userTeams.length === 0) {
        setActiveTeam(null);
      }
    } catch (err) {
      console.error("Error loading teams:", err);
      alert("Error loading teams. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubteams = async (teamId: string) => {
    try {
      const sts = await firestoreService.getTeamSubteams(teamId);
      setSubteams(sts);
      if (sts.length > 0) {
        setActiveSubteam(sts[0]);
      }
    } catch (err) {
      console.error("Error loading subteams:", err);
    }
  };

  const loadStream = async (teamId: string) => {
    try {
      const msgs = await firestoreService.getStreamMessages(teamId);
      setStreamMessages(msgs);
    } catch (err) {
      console.error("Error loading stream:", err);
    }
  };

  const loadAssignments = async (teamId: string) => {
    try {
      const asgs = await firestoreService.getAssignments(teamId);
      setAssignments(asgs);
    } catch (err) {
      console.error("Error loading assignments:", err);
    }
  };

  const loadProfiles = async (uids: string[]) => {
    const profs: Record<string, any> = {};
    for (const id of uids) {
      try {
        profs[id] = await firestoreService.getProfile(id);
      } catch (err) {
        console.error("Error loading profile for", id, err);
        profs[id] = {};
      }
    }
    setProfiles(profs);
  };

  const handleAddAssignment = async () => {
    if (!activeTeam || !assignmentTitle) return;
    try {
      await firestoreService.addAssignment(activeTeam.id, {
        title: assignmentTitle,
        description: assignmentDesc,
        dueDate: assignmentDueDate
      });
      setShowAssignmentModal(false);
      setAssignmentTitle('');
      setAssignmentDesc('');
      setAssignmentDueDate('');
      loadAssignments(activeTeam.id);
    } catch (err) {
      console.error("Error creating assignment:", err);
      alert("Failed to create assignment");
    }
  };

  const handleCreateTeam = async () => {
    if (!createNameInput) return;
    try {
      const newTeam = await firestoreService.createTeam(uid, createNameInput, createDivisionInput);
      setCreateNameInput('');
      await loadTeams();
      setActiveTeam(newTeam);
    } catch (err) {
      console.error("Error creating team:", err);
      alert("Failed to create team. Ensure you have permissions.");
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCodeInput) return;
    try {
      const joinedTeam = await firestoreService.joinTeam(uid, joinCodeInput);
      if (joinedTeam) {
        setJoinCodeInput('');
        await loadTeams();
        setActiveTeam(joinedTeam);
      } else {
        alert('Invalid join code');
      }
    } catch (err) {
      console.error("Error joining team:", err);
      alert("Failed to join team.");
    }
  };

  const handleLeaveTeam = async () => {
    if (!activeTeam) return;
    if (window.confirm('Are you sure you want to leave this team?')) {
      if (activeTeam.ownerId === uid) {
        await firestoreService.deleteTeam(activeTeam.id);
      } else {
        await firestoreService.leaveTeam(uid, activeTeam.id);
      }
      setActiveTeam(null);
      loadTeams();
    }
  };

  const updateMember = async (eventName: string, index: number, value: string) => {
    if (!activeTeam || !activeSubteam) return;
    
    const newMembersDict = { ...teamMembers };
    if (!newMembersDict[eventName]) {
      newMembersDict[eventName] = ['', ''];
    }
    newMembersDict[eventName][index] = value;
    setTeamMembers(newMembersDict);

    // Save to firebase
    await firestoreService.updateSubteamRoster(activeTeam.id, activeSubteam.id, newMembersDict);
  };

  const handleAddSubteam = async () => {
    if (!activeTeam) return;
    const name = prompt('Enter new subteam name:');
    if (name) {
      const newSub = await firestoreService.addSubteam(activeTeam.id, name);
      setSubteams([...subteams, newSub]);
      setActiveSubteam(newSub);
    }
  };

  const handleEditSubteamName = async () => {
    if (!activeTeam || !activeSubteam) return;
    const name = prompt('Enter new name for this subteam:', activeSubteam.name);
    if (name) {
      await firestoreService.updateSubteamName(activeTeam.id, activeSubteam.id, name);
      loadSubteams(activeTeam.id);
    }
  };

  const handleSendStreamMessage = async () => {
    if (!activeTeam || !newStreamMsg) return;
    const authorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Unknown';
    await firestoreService.addStreamMessage(activeTeam.id, authorName, newStreamMsg);
    setNewStreamMsg('');
    loadStream(activeTeam.id);
  };

  const handleExportRoster = () => {
    if (!activeSubteam) return;
    let csv = 'Event,Member 1,Member 2\n';
    conflictBlocks.forEach(block => {
      block.events.forEach(ev => {
        const m1 = teamMembers[ev.name]?.[0] || '';
        const m2 = teamMembers[ev.name]?.[1] || '';
        csv += `"${ev.name}","${m1}","${m2}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTeam?.name}-${activeSubteam.name}-roster.csv`;
    a.click();
  };

  if (loading) {
    return <div className="teams-page"><p style={{padding: '2rem'}}>Loading teams...</p></div>;
  }

  return (
    <div className="teams-page">
      <div className="teams-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon"></div>
            <span className="logo-text">Sciolytics</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/teams" className={location.pathname === '/teams' ? 'nav-item active' : 'nav-item'}>
            <Home size={18} />
            All Teams
          </Link>
          <Link to="/upcoming" className={location.pathname === '/upcoming' ? 'nav-item active' : 'nav-item'}>
            <Calendar size={18} />
            Upcoming
            <ChevronRight size={16} />
          </Link>
          <a href="#" className="nav-item">
            <Settings size={18} />
            Settings
          </a>
        </nav>

        {teams.length > 0 && (
          <div className="your-teams">
            <h4>YOUR TEAMS</h4>
            {teams.map(team => (
              <div 
                key={team.id} 
                className={`team-card ${activeTeam?.id === team.id ? 'active' : ''}`}
                onClick={() => setActiveTeam(team)}
                style={{cursor: 'pointer'}}
              >
                <Users size={18} />
                <div>
                  <div style={{fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px'}}>
                    {team.name}
                  </div>
                  <div className="team-division">Division {team.division}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="teams-main">
        {!activeTeam ? (
          <div style={{padding: '3rem', maxWidth: '500px', margin: '0 auto'}}>
            <h2>You don't have a team yet</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>Join an existing team or create a new one to manage rosters and assignments.</p>
            
            <div style={{background: 'var(--bg-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px'}}>
              <h3>Join a Team</h3>
              <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                <input 
                  type="text" 
                  placeholder="Enter 6-character Join Code" 
                  value={joinCodeInput}
                  onChange={e => setJoinCodeInput(e.target.value)}
                  style={{flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}}
                />
                <button className="btn-primary" onClick={handleJoinTeam}>Join</button>
              </div>
            </div>

            <div style={{background: 'var(--bg-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)'}}>
              <h3>Create a Team</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px'}}>
                <input 
                  type="text" 
                  placeholder="Team Name (e.g. Springfield High)" 
                  value={createNameInput}
                  onChange={e => setCreateNameInput(e.target.value)}
                  style={{padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}}
                />
                <select 
                  value={createDivisionInput} 
                  onChange={e => setCreateDivisionInput(e.target.value)}
                  style={{padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}}
                >
                  <option value="B">Division B (Middle School)</option>
                  <option value="C">Division C (High School)</option>
                </select>
                <button className="btn-primary" onClick={handleCreateTeam}>Create Team</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="teams-header">
              <div className="header-gradient">
                <h1>{activeTeam.name}</h1>
                <p>Division {activeTeam.division} • {activeTeam.members?.length || 0} member(s)</p>
              </div>
              <div className="header-actions">
                <button className="icon-btn" title="Invite Code" onClick={() => alert(`Join Code for ${activeTeam.name}:\n\n${activeTeam.joinCode}`)}>
                  <UserPlus size={20} />
                </button>
                <button className="icon-btn" title="Export Roster as CSV" onClick={handleExportRoster}>
                  <Download size={20} />
                </button>
                <button className="icon-btn" title={activeTeam.ownerId === uid ? "Delete Team" : "Leave Team"} onClick={handleLeaveTeam}>
                  <Trash2 size={20} color={activeTeam.ownerId === uid ? "var(--primary-color)" : "inherit"} />
                </button>
                <div className="user-menu">
                  <div className="user-avatar">
                    <Users size={20} />
                  </div>
                  <span>{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}</span>
                </div>
              </div>
            </div>

            <div className="teams-tabs">
              <button className={activeTab === 'roster' ? 'tab active' : 'tab'} onClick={() => setActiveTab('roster')}>Roster</button>
              <button className={activeTab === 'stream' ? 'tab active' : 'tab'} onClick={() => setActiveTab('stream')}>Stream</button>
              <button className={activeTab === 'assignments' ? 'tab active' : 'tab'} onClick={() => setActiveTab('assignments')}>Assignments</button>
              <button className={activeTab === 'people' ? 'tab active' : 'tab'} onClick={() => setActiveTab('people')}>People</button>
            </div>

            {activeTab === 'roster' && (
              <div className="roster-content">
                <div className="roster-header">
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    {subteams.map(st => (
                      <button 
                        key={st.id} 
                        onClick={() => setActiveSubteam(st)}
                        className={`toggle-btn ${activeSubteam?.id === st.id ? 'active' : ''}`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                  <div className="subteam-controls">
                    {activeSubteam && (
                      <button className="subteam-btn" onClick={handleEditSubteamName}>
                        <Pencil size={16} /> Edit Name
                      </button>
                    )}
                    <button className="add-subteam-btn" onClick={handleAddSubteam}>+ Add Subteam</button>
                  </div>
                </div>

                {activeSubteam && (
                  <div className="conflict-blocks">
                    {conflictBlocks.map((block) => (
                      <div key={block.id} className={`conflict-block ${block.color}`}>
                        {block.events.map((event, eventIdx) => (
                          <div key={eventIdx} className="event-assignment">
                            <div className="event-header">
                              <span className="event-name">{event.name}</span>
                            </div>
                            <div className="member-inputs">
                              <input
                                type="text"
                                placeholder="Name"
                                value={teamMembers[event.name]?.[0] || ''}
                                onChange={(e) => updateMember(event.name, 0, e.target.value)}
                              />
                              <input
                                type="text"
                                placeholder="Name"
                                value={teamMembers[event.name]?.[1] || ''}
                                onChange={(e) => updateMember(event.name, 1, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stream' && (
              <div style={{padding: '24px'}}>
                <div style={{background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', gap: '12px'}}>
                  <input 
                    type="text" 
                    placeholder="Announce something to your team..." 
                    value={newStreamMsg}
                    onChange={e => setNewStreamMsg(e.target.value)}
                    style={{flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)'}}
                    onKeyDown={e => e.key === 'Enter' && handleSendStreamMessage()}
                  />
                  <button className="btn-primary" onClick={handleSendStreamMessage} style={{display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', padding: '0 20px'}}>
                    <Send size={18} /> Post
                  </button>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  {streamMessages.length === 0 ? (
                    <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem'}}>No messages yet. Be the first to say hello!</p>
                  ) : (
                    streamMessages.map(msg => (
                      <div key={msg.id} style={{background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                        <div style={{fontWeight: 600, marginBottom: '4px'}}>{msg.authorName}</div>
                        <div style={{color: 'var(--text-primary)'}}>{msg.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div style={{padding: '24px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <h2>Team Assignments</h2>
                  <button className="btn-primary" style={{display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', padding: '8px 16px'}} onClick={() => setShowAssignmentModal(true)}>
                    <Plus size={18} /> Create
                  </button>
                </div>
                {showAssignmentModal && (
                  <div style={{background: 'var(--bg-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px'}}>
                    <h3 style={{marginBottom: '16px'}}>New Assignment</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      <input 
                        type="text" 
                        placeholder="Title" 
                        value={assignmentTitle}
                        onChange={e => setAssignmentTitle(e.target.value)}
                        style={{padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}}
                      />
                      <textarea 
                        placeholder="Description" 
                        value={assignmentDesc}
                        onChange={e => setAssignmentDesc(e.target.value)}
                        style={{padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit'}}
                      />
                      <input 
                        type="date" 
                        value={assignmentDueDate}
                        onChange={e => setAssignmentDueDate(e.target.value)}
                        style={{padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}}
                      />
                      <div style={{display: 'flex', gap: '12px', marginTop: '8px'}}>
                        <button className="btn-primary" onClick={handleAddAssignment}>Save Assignment</button>
                        <button className="btn-secondary" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                {assignments.length === 0 ? (
                  <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem'}}>No assignments yet.</p>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {assignments.map(a => (
                      <div key={a.id} style={{background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                        <h4 style={{marginBottom: '4px'}}>{a.title}</h4>
                        <p style={{color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px'}}>{a.description}</p>
                        <span style={{fontSize: '12px', background: 'var(--bg-gray)', padding: '4px 8px', borderRadius: '4px'}}>Due: {a.dueDate}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'people' && (
              <div style={{padding: '24px'}}>
                <h2>Team Members</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px'}}>
                  {activeTeam.members?.map(memberId => (
                    <div key={memberId} style={{background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px'}}>
                      <div className="user-avatar"><Users size={20} /></div>
                      <div>
                        <div style={{fontWeight: 600}}>{profiles[memberId]?.fullName || profiles[memberId]?.displayName || profiles[memberId]?.email?.split('@')[0] || 'Anonymous User'}</div>
                        <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>{memberId === activeTeam.ownerId ? 'Team Owner' : 'Member'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
