import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type TeamEvent, type Team } from '../services/firestoreService';

const EVENT_COLORS = [
  { label: 'Blue',   value: '#2563eb' },
  { label: 'Green',  value: '#16a34a' },
  { label: 'Red',    value: '#dc2626' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Pink',   value: '#db2777' },
];

function formatTimestamp(ts: string | null | undefined): string {
  if (!ts) return '';
  return new Date(ts).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UpcomingEvents() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [events, setEvents] = useState<TeamEvent[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addDate, setAddDate] = useState('');
  const [addTitle, setAddTitle] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addColor, setAddColor] = useState('#2563eb');

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    firestoreService.getUserTeams(uid).then(ts => {
      setTeams(ts);
      if (ts.length > 0) setActiveTeam(ts[0]);
    }).catch(console.error);
  }, [uid]);

  useEffect(() => {
    if (!activeTeam) return;
    firestoreService.getTeamEvents(activeTeam.id).then(setEvents).catch(console.error);
  }, [activeTeam]);

  const month = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const year = currentDate.getFullYear();
  const monthIdx = currentDate.getMonth();
  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIdx, 0).getDate();

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const days: { day: number; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = monthIdx === 0 ? 12 : monthIdx;
    const y = monthIdx === 0 ? year - 1 : year;
    days.push({ day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false, isToday: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const ds = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, dateStr: ds, isCurrentMonth: true, isToday: ds === todayStr });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const m = monthIdx + 2 > 12 ? 1 : monthIdx + 2;
    const y = monthIdx + 2 > 12 ? year + 1 : year;
    days.push({ day: i, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`, isCurrentMonth: false, isToday: false });
  }

  // figure out which row contains today (for week highlight)
  const todayRowIndex = (() => {
    const idx = days.findIndex(d => d.isToday);
    if (idx === -1) return -1;
    return Math.floor(idx / 7);
  })();

  const eventsOnDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const navigateMonth = (dir: 'prev' | 'next') => {
    setCurrentDate(new Date(year, monthIdx + (dir === 'next' ? 1 : -1), 1));
  };

  const handleAddEvent = async () => {
    if (!activeTeam || !addTitle || !addDate) return;
    const newEvent = await firestoreService.addTeamEvent(activeTeam.id, {
      title: addTitle,
      date: addDate,
      description: addDesc,
      color: addColor,
      createdBy: uid,
    });
    setEvents(prev => [...prev, newEvent]);
    setShowAddModal(false);
    setAddTitle(''); setAddDesc(''); setAddDate(''); setAddColor('#2563eb');
  };

  const handleDeleteEvent = async (ev: TeamEvent) => {
    if (!activeTeam || !ev.id) return;
    await firestoreService.deleteTeamEvent(activeTeam.id, ev.id);
    setEvents(prev => prev.filter(e => e.id !== ev.id));
  };

  const upcomingEvents = [...events]
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="teams-page">
      {/* Sidebar */}
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
          <Link to="/teams" className="nav-item" onClick={() => {}}>
            <Settings size={18} /> Settings
          </Link>
        </nav>

        {teams.length > 0 && (
          <div className="your-teams">
            <h4>YOUR TEAMS</h4>
            {teams.map(t => (
              <div
                key={t.id}
                className={`team-card ${activeTeam?.id === t.id ? 'active' : ''}`}
                onClick={() => setActiveTeam(t)}
                style={{ cursor: 'pointer' }}
              >
                <Calendar size={18} />
                <div>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{t.name}</div>
                  <div className="team-division">Division {t.division}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="events-main">
        <div className="events-header">
          <h1>Upcoming Events</h1>

          <div className="events-controls">
            <div className="month-navigation">
              <button onClick={() => navigateMonth('prev')} className="nav-arrow"><ChevronLeft size={20} /></button>
              <span className="month-display">{month}</span>
              <button onClick={() => navigateMonth('next')} className="nav-arrow"><ChevronRight size={20} /></button>
            </div>

            <div className="view-toggle">
              <button className={viewMode === 'calendar' ? 'view-btn active' : 'view-btn'} onClick={() => setViewMode('calendar')}>Calendar</button>
              <button className={viewMode === 'list' ? 'view-btn active' : 'view-btn'} onClick={() => setViewMode('list')}>List</button>
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => { setShowAddModal(true); setAddDate(todayStr); }}>
              <Plus size={18} /> Add Event
            </button>
          </div>
        </div>

        {!activeTeam && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Join or create a team to manage events.</p>
            <Link to="/teams" className="btn-primary" style={{ display: 'inline-flex', marginTop: '12px' }}>Go to Teams</Link>
          </div>
        )}

        {activeTeam && viewMode === 'calendar' && (
          <div className="calendar-container">
            <div className="calendar-grid">
              <div className="calendar-header">
                {weekDays.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
              </div>
              <div className="calendar-days">
                {days.map((date, idx) => {
                  const rowIdx = Math.floor(idx / 7);
                  const isCurrentWeekRow = rowIdx === todayRowIndex;
                  const dayEvents = eventsOnDate(date.dateStr);
                  return (
                    <div
                      key={idx}
                      className={`calendar-day ${!date.isCurrentMonth ? 'other-month' : ''} ${date.isToday ? 'today' : ''}`}
                      style={isCurrentWeekRow && !date.isToday ? { background: 'color-mix(in srgb, var(--primary-color) 4%, var(--bg-white))' } : undefined}
                      onClick={() => { if (date.isCurrentMonth) { setSelectedDay(selectedDay === date.dateStr ? null : date.dateStr); } }}
                    >
                      <span className={`day-number ${date.isToday ? 'today-number' : ''}`}>{date.day}</span>
                      {date.isCurrentMonth && (
                        <button
                          className="add-event-btn"
                          onClick={e => { e.stopPropagation(); setShowAddModal(true); setAddDate(date.dateStr); }}
                        >+</button>
                      )}
                      <div className="day-events">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} className="cal-event-pill" style={{ background: ev.color || 'var(--primary-color)' }}>
                            <span>{ev.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && <div className="cal-event-more">+{dayEvents.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTeam && viewMode === 'list' && (
          <div style={{ padding: '24px' }}>
            {upcomingEvents.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No upcoming events. Add one above!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingEvents.map(ev => (
                  <div key={ev.id} style={{ background: 'var(--bg-white)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: ev.color || 'var(--primary-color)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{ev.title}</div>
                      {ev.description && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ev.description}</div>}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatTimestamp(ev.date)}</div>
                    <button onClick={() => handleDeleteEvent(ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Popup for selected day events */}
        {selectedDay && eventsOnDate(selectedDay).length > 0 && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', width: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong>{formatTimestamp(selectedDay)}</strong>
              <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            {eventsOnDate(selectedDay).map(ev => (
              <div key={ev.id} style={{ padding: '10px', borderRadius: '8px', borderLeft: `4px solid ${ev.color || 'var(--primary-color)'}`, background: 'var(--bg-gray)', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600 }}>{ev.title}</div>
                {ev.description && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ev.description}</div>}
                <button onClick={() => handleDeleteEvent(ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'var(--bg-white)', borderRadius: '20px', padding: '32px', width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>New Event</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="Event title" value={addTitle} onChange={e => setAddTitle(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '15px' }} />
              <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <textarea placeholder="Description (optional)" value={addDesc} onChange={e => setAddDesc(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>COLOR</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {EVENT_COLORS.map(c => (
                    <button key={c.value} onClick={() => setAddColor(c.value)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: c.value, border: addColor === c.value ? '3px solid var(--text-primary)' : '3px solid transparent', cursor: 'pointer' }}
                      title={c.label} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn-primary" onClick={handleAddEvent} style={{ flex: 1 }}>Save Event</button>
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .today { background: color-mix(in srgb, var(--primary-color) 8%, var(--bg-white)) !important; }
        .today-number {
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .day-events { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
        .cal-event-pill {
          font-size: 10px;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
        }
        .cal-event-more { font-size: 10px; color: var(--text-secondary); padding: 2px 4px; }
        .calendar-day { cursor: pointer; }
        .calendar-day:hover { background: var(--bg-gray) !important; }
      `}</style>
    </div>
  );
}
