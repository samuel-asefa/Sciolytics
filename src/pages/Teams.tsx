import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, Archive, Users, UserPlus, Download, Trash2, ChevronRight, Pencil } from 'lucide-react';

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
    color: 'lightblue',
    events: [
      { name: 'Anatomy & Physiology', hasAssign: true },
      { name: 'Engineering CAD', hasAssign: false },
      { name: 'Forensics', hasAssign: true },
    ],
  },
  {
    id: '2',
    color: 'lightgreen',
    events: [
      { name: 'Codebusters', hasAssign: true },
      { name: 'Disease Detectives', hasAssign: true },
      { name: 'Remote Sensing', hasAssign: true },
    ],
  },
  {
    id: '3',
    color: 'lightyellow',
    events: [
      { name: 'Astronomy', hasAssign: true },
      { name: 'Entomology', hasAssign: true },
    ],
  },
  {
    id: '4',
    color: 'lightpink',
    events: [
      { name: 'Chemistry Lab', hasAssign: true },
      { name: 'Machines', hasAssign: true },
    ],
  },
];

export default function Teams() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('roster');
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});

  const updateMember = (eventName: string, index: number, value: string) => {
    const key = eventName;
    if (!teamMembers[key]) {
      teamMembers[key] = ['', ''];
    }
    const newMembers = [...teamMembers[key]];
    newMembers[index] = value;
    setTeamMembers({ ...teamMembers, [key]: newMembers });
  };

  return (
    <div className="teams-page">
      <div className="teams-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">🦉</div>
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
          <a href="#" className="nav-item">
            <Archive size={18} />
            Archived
          </a>
        </nav>

        <div className="your-teams">
          <h4>YOUR TEAMS</h4>
          <div className="team-card active">
            <Users size={18} />
            <div>
              <div>South Brunswick ...</div>
              <div className="team-division">Division C</div>
            </div>
          </div>
        </div>
      </div>

      <div className="teams-main">
        <div className="teams-header">
          <div className="header-gradient">
            <h1>South Brunswick High School</h1>
            <p>Division C</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <UserPlus size={20} />
            </button>
            <button className="icon-btn">
              <Download size={20} />
            </button>
            <button className="icon-btn">
              <Trash2 size={20} />
            </button>
            <div className="user-menu">
              <div className="user-avatar">
                <Users size={20} />
              </div>
              <span>samuelasefa20</span>
            </div>
          </div>
        </div>

        <div className="teams-tabs">
          <button
            className={activeTab === 'roster' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('roster')}
          >
            Roster
          </button>
          <button
            className={activeTab === 'stream' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('stream')}
          >
            Stream
          </button>
          <button
            className={activeTab === 'assignments' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
          <button
            className={activeTab === 'people' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('people')}
          >
            People
          </button>
        </div>

        {activeTab === 'roster' && (
          <div className="roster-content">
            <div className="roster-header">
              <h2>Team Roster</h2>
              <div className="subteam-controls">
                <button className="subteam-btn">
                  <Pencil size={16} />
                  Team A
                </button>
                <button className="add-subteam-btn">+ Add Subteam</button>
              </div>
            </div>

            <div className="conflict-blocks">
              {conflictBlocks.map((block) => (
                <div key={block.id} className={`conflict-block ${block.color}`}>
                  {block.events.map((event, eventIdx) => (
                    <div key={eventIdx} className="event-assignment">
                      <div className="event-header">
                        <span className="event-name">{event.name}</span>
                        <div className="event-actions">
                          {event.hasAssign && <a href="#" className="action-link">Assign?</a>}
                          <a href="#" className="action-link">Remove?</a>
                        </div>
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
          </div>
        )}

        {activeTab === 'stream' && (
          <div className="stream-placeholder">
            <p>Stream view coming soon...</p>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="assignments-placeholder">
            <p>Assignments view coming soon...</p>
          </div>
        )}

        {activeTab === 'people' && (
          <div className="people-placeholder">
            <p>People view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

