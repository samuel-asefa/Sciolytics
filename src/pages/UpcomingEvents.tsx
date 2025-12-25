import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, Archive, Users, ChevronRight, ChevronLeft, Plus, RotateCcw } from 'lucide-react';

export default function UpcomingEvents() {
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const month = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const days = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false });
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

      <div className="events-main">
        <div className="events-header">
          <h1>Upcoming Events</h1>
          
          <div className="events-controls">
            <div className="month-navigation">
              <button onClick={() => navigateMonth('prev')} className="nav-arrow">
                <ChevronLeft size={20} />
              </button>
              <span className="month-display">{month}</span>
              <button onClick={() => navigateMonth('next')} className="nav-arrow">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="view-toggle">
              <button
                className={viewMode === 'calendar' ? 'view-btn active' : 'view-btn'}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
              <button
                className={viewMode === 'list' ? 'view-btn active' : 'view-btn'}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
            
            <button className="btn-primary">
              <Plus size={18} />
              Add Event
            </button>
            <button className="btn-secondary">
              <RotateCcw size={18} />
              Recurring
            </button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <div className="calendar-container">
            <div className="calendar-grid">
              <div className="calendar-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {days.map((date, idx) => (
                  <div
                    key={idx}
                    className={`calendar-day ${!date.isCurrentMonth ? 'other-month' : ''}`}
                  >
                    <span className="day-number">{date.day}</span>
                    {date.isCurrentMonth && (
                      <button className="add-event-btn">+</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="events-list-view">
            <p>List view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

