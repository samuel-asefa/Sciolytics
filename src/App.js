// src/App.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
// Replacing VEX-specific icons with more generic/science ones from Lucide
// Added FileText, ExternalLink, Edit2 (for notes)
import {
  Play, Users, Trophy, BookOpen, Code, Zap, Target, Award, ChevronRight, X, Check, RotateCcw, Home, LogOut, Search, Eye, MessageSquare, Brain, Settings2, Puzzle, HelpCircle, Clock, BarChart2, Layers, Crosshair, Truck, Wrench, University, SquarePen, Terminal, Bot, CircuitBoard, Radar, Trash2,
  FlaskConical, Atom, Beaker, TestTube, Lightbulb, Sigma, FunctionSquare, Move, MousePointer, FileCog, PenTool, Edit3, Code2, BrainCog, Cpu, Microscope, Notebook, Telescope, Dna, Leaf, Wind, Mountain, BookMarked, UsersRound, BrainCircuit, FileQuestion, TrendingUp, BarChartHorizontal, CheckCircle, ListChecks,
  FileText, ExternalLink, Edit2, PlusCircle, Filter
} from 'lucide-react';


import { auth, db } from './Firebase'; // Assuming Sciolytics_Firebase.js is correctly configured
import { GoogleAuthProvider as FirebaseGoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, writeBatch,
  collection, query, where, getDocs, addDoc, serverTimestamp,
  increment, arrayUnion, arrayRemove, orderBy, limit, deleteDoc
} from 'firebase/firestore';

console.log("[Sciolytics_App.js] Value of 'auth' imported from ./Firebase.js:", auth);
console.log("[Sciolytics_App.js] Value of 'db' imported from ./Firebase.js:", db);

// Helper function to generate unique IDs (slugify)
const slugify = (text) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

// Helper function to generate placeholder contentDetail
const generateContentDetail = (title, customText = "", eventType = "event") => {
  const placeholderText = customText || `Explore the key concepts of ${title}. This section includes practice questions, essential theory, and resources to help you master this Science Olympiad ${eventType}.`;
  return `<h1>${title}</h1><p>${placeholderText}</p><img src='https://placehold.co/600x350/E0F2F7/00796B?text=${encodeURIComponent(title)}' alt='${title}' style='width:100%;max-width:450px;border-radius:8px;margin:1.5rem auto;display:block;border:1px solid #B2DFDB;'>`;
};

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '114611845198-3ufro2pgosmo5kma37t15v34gk7lbdvi.apps.googleusercontent.com';
const XP_PER_LEVEL = 500;
const CHALLENGE_MAX_XP = 100;
const QUESTIONS_PER_CHALLENGE = 7;
const QUESTION_TIMER_DURATION = 30;


// --- Component Definitions ---

const LoginView = ({ /* ...props... */ }) => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Atom className="brand-icon-large" style={{color: 'var(--theme-primary)'}}/> {/* Sciolytics Icon */}
          <h1>Sciolytics</h1>
          <p>Master Science Olympiad Events</p>
        </div>
        {/* ...rest of LoginView JSX, no major changes here except it will inherit new global styles */}
      </div>
    </div>
  </GoogleOAuthProvider>
);


const Navigation = ({ user, currentView, navigate, handleLogout, actionLoading }) => (
  <nav className="nav">
    <div className="nav-brand" onClick={() => user && navigate('dashboard')} style={{cursor: user ? 'pointer' : 'default'}}>
      <Atom className="brand-logo-image" style={{color: 'var(--theme-primary)'}}/>
      <span className="brand-text">Sciolytics</span>
    </div>
    {user && (
      <div className="nav-items">
        <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}><Home className="icon" />Dashboard</button>
        <button className={`nav-item ${currentView === 'events' ? 'active' : ''}`} onClick={() => navigate('events')}><Notebook className="icon" />Events</button>
        {/* NEW: Notes Navigation Link */}
        <button className={`nav-item ${currentView === 'notesDashboard' ? 'active' : ''}`} onClick={() => navigate('notesDashboard')}><FileText className="icon" />My Notes</button>
        <button className={`nav-item ${currentView === 'studygroups' ? 'active' : ''}`} onClick={() => navigate('studygroups')}><UsersRound className="icon" />Study Groups</button>
        <button className={`nav-item ${currentView === 'browseGroups' ? 'active' : ''}`} onClick={() => navigate('browseGroups')}><Search className="icon" />Browse Groups</button>
        <button className={`nav-item ${currentView === 'leaderboard' ? 'active' : ''}`} onClick={() => navigate('leaderboard')}><Trophy className="icon" />Leaderboard</button>
        <button className={`nav-item ${currentView === 'challenge' ? 'active' : ''}`} onClick={() => navigate('challenge')}><BrainCircuit className="icon" />Challenge</button>
        <div className="nav-user">
          <img src={user.avatar} alt={user.name} className="user-avatar" onError={(e)=>e.target.src='https://source.boringavatars.com/beam/120/default?colors=00796B,FF7F50,E0F2F7,343A40,264653'}/> {/* Updated boringavatars colors */}
          <div className="user-info"><span className="user-name">{user.name}</span><span className="user-level">Lvl {user.level} ({user.xp || 0} XP)</span></div>
          <button onClick={handleLogout} className="logout-btn" title="Logout" disabled={actionLoading}><LogOut size={18}/></button>
        </div>
      </div>
    )}
  </nav>
);

const Dashboard = ({ user, userProgress, userTeam, learningModules, navigate, actionLoading }) => {
  // ... (existing Dashboard logic remains largely the same, will inherit new styles) ...
  // Minor style updates will be applied via global CSS
    if (!user) return null;
    const sciolyEvents = learningModules;

    const modulesInProgress = sciolyEvents.filter(m => {
        const prog = userProgress[m.id];
        return prog && Object.keys(prog.lessons).length > 0 && Object.keys(prog.lessons).length < m.lessons;
    });
    const recommendedNextModule = modulesInProgress.length > 0 ? modulesInProgress[0] : sciolyEvents.find(m => !userProgress[m.id] || Object.keys(userProgress[m.id].lessons).length === 0);

    const allCategories = [...new Set(sciolyEvents.map(m => m.category || 'General Science'))];
    const preferredCategoryOrder = ['Life Science', 'Earth & Space Science', 'Physical Science & Chemistry', 'Technology & Engineering', 'Inquiry & Nature of Science', 'General Science'];
    const categoryOrder = [...new Set([...preferredCategoryOrder, ...allCategories])];

    const categorizedModules = sciolyEvents.reduce((acc, module) => {
        const category = module.category || 'General Science';
        if (!acc[category]) acc[category] = [];
        acc[category].push(module);
        return acc;
    }, {});

    const completedEventsCount = sciolyEvents.filter(m => {
        const prog = userProgress[m.id];
        return prog && Object.values(prog.lessons).filter(l => l.completed).length === m.lessons;
    }).length;
    const practiceSetsAttempted = Object.values(userProgress).reduce((sum, mod) => sum + Object.keys(mod.lessons).length, 0);

    return (
    <div className="dashboard">
        <div className="dashboard-header">
        <div className="welcome-section">
            <h1>Welcome back, {user.name}!</h1>
            <p>Ready to explore Science Olympiad events?</p>
        </div>
        <div className="stats-grid">
            <div className="stat-card"><Award className="stat-icon" /><div><span className="stat-value">{user.xp || 0}</span><span className="stat-label">Total XP</span></div></div>
            <div className="stat-card"><Target className="stat-icon" /><div><span className="stat-value">{user.level}</span><span className="stat-label">Level</span></div></div>
            <div className="stat-card"><CheckCircle className="stat-icon" /><div><span className="stat-value">{completedEventsCount}</span><span className="stat-label">Events Mastered</span></div></div>
            <div className="stat-card"><ListChecks className="stat-icon" /><div><span className="stat-value">{practiceSetsAttempted}</span><span className="stat-label">Practice Sets Done</span></div></div>
        </div>
        </div>
        {userTeam && (
        <div className="team-card study-group-card">
            <div className="team-info"> <UsersRound className="team-icon" /> <div> <h3>{userTeam.name}</h3> <p>{(userTeam.memberIds ? userTeam.memberIds.length : 0)} members • Rank #{userTeam.rank || 'N/A'} • Code: <code>{userTeam.code}</code></p> </div> </div>
            <div className="team-stats"><span className="team-xp">{(userTeam.totalXP || 0).toLocaleString()} XP</span></div>
        </div>
        )}
        {recommendedNextModule && (
            <div className="recommended-module-card" onClick={() => navigate('eventView', recommendedNextModule)}>
                <div className="recommended-tag">Recommended Next</div>
                <recommendedNextModule.icon className="module-icon" style={{color: `var(--color-${recommendedNextModule.color}-500)`}}/>
                <h3>{recommendedNextModule.title}</h3>
                <p>{recommendedNextModule.description.substring(0,100)}...</p>
                <button className="start-btn small" disabled={actionLoading}>
                    {userProgress[recommendedNextModule.id] && Object.keys(userProgress[recommendedNextModule.id].lessons).length > 0 ? 'Continue Event' : 'Start Event'} <ChevronRight className="icon-small"/>
                </button>
            </div>
        )}
        <div className="modules-section">
        {categoryOrder.map(category => {
            if (!categorizedModules[category] || categorizedModules[category].length === 0) return null;
            return (
                <div key={category} className="module-category-section">
                    <h2 className="category-title">{category} Events</h2>
                    <div className="modules-grid">
                    {categorizedModules[category].map((module) => {
                        const Icon = module.icon;
                        const prog = userProgress[module.id] || { lessons: {}, moduleXp: 0 };
                        const completedCount = Object.values(prog.lessons).filter(l => l.completed).length;
                        const progressPercent = module.lessons > 0 ? (completedCount / module.lessons) * 100 : 0;
                        return (
                        <div key={module.id} className={`module-card ${module.color}`} onClick={() => navigate('eventView', module)}>
                            <div className="module-header"> <Icon className="module-icon" /> <div className="module-meta"> <span className="difficulty">{module.difficulty}</span> <span className="duration">{module.duration}</span> </div> </div>
                            <h3>{module.title}</h3> <p>{module.description}</p>
                            <div className="progress-section">
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPercent}%` }}></div></div>
                            <span className="progress-text">{completedCount}/{module.lessons} practice sets ({(prog.moduleXp || 0)} XP)</span>
                            </div>
                            <button className="start-btn" disabled={actionLoading}> {progressPercent === 100 ? 'Review Event' : progressPercent > 0 ? 'Continue Learning' : 'Start Learning'} <ChevronRight className="icon" /> </button>
                        </div>
                        );
                    })}
                    </div>
                </div>
            );
        })}
        </div>
    </div>
    );
};

const EventView = ({ selectedModule, userProgress, navigate, actionLoading, onOpenNoteEditor }) => {
  const selectedEvent = selectedModule;
  if (!selectedEvent) return <p className="error-message">Event not found. Please go back to the dashboard.</p>;
  const moduleProg = userProgress[selectedEvent.id] || { lessons: {} };
  const Icon = selectedEvent.icon;
  return (
    <div className="module-view event-view">
      <div className="module-view-header">
        <button onClick={() => navigate('events')} className="back-btn" disabled={actionLoading}><ChevronRight className="icon rotated" /> Back to Events</button>
        <div className="module-title-section">
          <Icon className="module-icon-large" style={{color: `var(--color-${selectedEvent.color}-500)`}} />
          <div>
            <span className="category-tag-module">{selectedEvent.category || 'General Science'}</span>
            <h1>{selectedEvent.title}</h1> <p>{selectedEvent.description}</p>
            <div className="module-badges">
              <span className="badge">{selectedEvent.difficulty}</span>
              <span className="badge">{selectedEvent.duration}</span>
              <span className="badge">{selectedEvent.lessons} practice sets</span>
            </div>
             {/* NEW: Official Rules Link and Notes Button */}
            <div className="event-actions-toolbar">
                {selectedEvent.officialRulesLink && (
                    <a href={selectedEvent.officialRulesLink} target="_blank" rel="noopener noreferrer" className="action-btn rules-link-btn">
                        <ExternalLink size={16}/> Official Rules
                    </a>
                )}
                <button onClick={() => onOpenNoteEditor(null, selectedEvent.id, selectedEvent.title, selectedEvent.category)} className="action-btn notes-manage-btn">
                    <Edit2 size={16}/> Manage Notes for this Event
                </button>
            </div>
          </div>
        </div>
      </div>
      <div className="lessons-list">
        {selectedEvent.content.lessons.map((lesson, index) => {
          const lessonState = moduleProg.lessons[lesson.id.replace(/\./g, '_')] || { completed: false };
          const isCompleted = lessonState.completed;
          const prevLessonSanitizedId = index > 0 ? selectedEvent.content.lessons[index - 1].id.replace(/\./g, '_') : null;
          const isLocked = index > 0 && !(moduleProg.lessons[prevLessonSanitizedId]?.completed);
          let LessonIcon = BookOpen;
          if (lesson.type === 'mcq') LessonIcon = ListChecks;
          else if (lesson.type === 'frq') LessonIcon = FileQuestion;

          return (
            <div key={lesson.id} className={`lesson-item ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => {
                if (actionLoading || (isLocked && !isCompleted)) return;
                if (lesson.type === 'lesson' || lesson.type === 'frq') navigate('lessonContent', { moduleId: selectedEvent.id, lesson });
                else if (lesson.type === 'mcq') navigate('practiceView', { moduleId: selectedEvent.id, lesson });
              }}>
              <div className="lesson-number">{isCompleted ? <Check className="icon-small" /> : index + 1}</div>
              <LessonIcon className="lesson-type-icon" style={{color: `var(--color-${selectedEvent.color}-500)`}}/>
              <div className="lesson-content"> <h3>{lesson.title}</h3> <span className="lesson-type-badge">{lesson.type.toUpperCase()} (+{lesson.xp} XP)</span> </div>
              <button className="lesson-btn" disabled={actionLoading || (isLocked && !isCompleted)}> {isCompleted ? 'Review' : (isLocked ? 'Locked' : 'Start')} <ChevronRight className="icon-small" /> </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LessonContentView = ({ currentLesson, selectedModule, userProgress, handleCompleteItem, navigate, actionLoading }) => {
  const selectedEvent = selectedModule;
  if (!currentLesson || !selectedEvent) return <p className="error-message">Lesson content not found or event context missing.</p>;
  const moduleProg = userProgress[selectedEvent.id] || { lessons: {} };
  const lessonState = moduleProg.lessons[currentLesson.id.replace(/\./g, '_')] || { completed: false };
  const isCompleted = lessonState.completed;

  const handleMarkCompleteAndContinue = () => { /* ... (existing logic) ... */ };
  const LessonTypeIcon = currentLesson.type === 'frq' ? FileQuestion : MessageSquare;

  return (
    <div className="lesson-content-view">
      <button onClick={() => navigate('eventView', {id: selectedEvent.id})} className="back-btn" disabled={actionLoading}><ChevronRight className="icon rotated" /> Back to {selectedEvent.title}</button>
      <div className="lesson-title-header">
          <LessonTypeIcon className="lesson-type-icon-large" style={{color: `var(--color-${selectedEvent.color}-500)`}}/>
          <h2>{currentLesson.title} ({currentLesson.type.toUpperCase()})</h2>
      </div>
      <div className="content-area" dangerouslySetInnerHTML={{ __html: currentLesson.contentDetail || `<p>No detailed content available for this ${currentLesson.type}.</p>` }} />
      {currentLesson.type === 'frq' && (
        <div className="frq-self-assessment">
          <h4>Model Answer/Rubric (Self-Assess)</h4>
          <div className="model-answer-placeholder">
            {/* UPDATED FRQ Prompt */}
            <p><strong>Self-Assessment Guidance:</strong> Review the model answer below. Consider the following as you evaluate your own response:</p>
            <ul>
                <li>Did you address all parts of the question?</li>
                <li>Is your terminology accurate and specific?</li>
                <li>Is your explanation clear and logical?</li>
                <li>Are there any key concepts from the model answer that you missed?</li>
            </ul>
            <p><strong>Model Answer:</strong><br/>{currentLesson.modelAnswer || "Model answer or scoring rubric would appear here for self-assessment."}</p>
          </div>
        </div>
      )}
      <button onClick={handleMarkCompleteAndContinue} className="complete-lesson-btn" disabled={actionLoading}>
        {isCompleted ? 'Continue to Next Item' : `Mark as Reviewed & Continue (+${currentLesson.xp} XP)`}
        <ChevronRight className="icon-small"/>
      </button>
    </div>
  );
};

const PracticeView = ({ /* ...props... */ }) => { /* ... (existing PracticeView, will inherit styles) ... */};
const StudyGroupsView = ({ /* ...props... */ }) => { /* ... (existing StudyGroupsView, will inherit styles) ... */};
const BrowseGroupsView = ({ /* ...props... */ }) => { /* ... (existing BrowseGroupsView, will inherit styles) ... */};
const LeaderboardView = ({ /* ...props... */ }) => { /* ... (existing LeaderboardView, will inherit styles) ... */};
const SciolyticsChallengeView = ({ /* ...props... */ }) => { /* ... (existing SciolyticsChallengeView, will inherit styles) ... */};


// --- NEW: Notes Components ---
const NoteEditorModal = ({
  isOpen,
  onClose,
  onSave,
  noteData, // { id?, title, content, eventId, eventTitle, eventCategory }
  sciolyEvents, // To select an event if not pre-filled
  actionLoading
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title || '');
      setContent(noteData.content || '');
      setSelectedEventId(noteData.eventId || '');
    } else { // Reset for new note
      setTitle('');
      setContent('');
      setSelectedEventId('');
    }
  }, [noteData, isOpen]); // Re-populate when modal opens with new data

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedEventId && (!noteData || !noteData.eventId)) {
        alert("Please select an event for this note."); // Replace with better UI feedback
        return;
    }
    const currentEventId = noteData?.eventId || selectedEventId;
    const eventDetails = sciolyEvents.find(e => e.id === currentEventId);

    onSave({
      id: noteData?.id, // Will be undefined for new notes
      title: title.trim() || `Note on ${eventDetails?.title || 'Event'}`,
      content,
      eventId: currentEventId,
      eventTitle: eventDetails?.title,
      eventCategory: eventDetails?.category,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content note-editor-modal">
        <div className="modal-header">
          <h2>{noteData?.id ? 'Edit Note' : 'Create New Note'}</h2>
          <button onClick={onClose} className="modal-close-btn" disabled={actionLoading}><X size={20}/></button>
        </div>
        <div className="modal-body">
          {(!noteData || !noteData.eventId) && !selectedEventId && ( // Only show event selector if event isn't fixed
            <div className="form-group">
              <label htmlFor="noteEvent">Science Olympiad Event:</label>
              <select
                id="noteEvent"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={actionLoading || (noteData && noteData.eventId)}
              >
                <option value="">Select an Event</option>
                {sciolyEvents.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
          )}
          { (selectedEventId || (noteData && noteData.eventId)) &&
            <p className="note-event-context">
                Event: <strong>{sciolyEvents.find(e => e.id === (noteData?.eventId || selectedEventId))?.title || "Unknown Event"}</strong>
            </p>
          }

          <div className="form-group">
            <label htmlFor="noteTitle">Note Title:</label>
            <input
              type="text"
              id="noteTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your note"
              disabled={actionLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="noteContent">Content:</label>
            <textarea
              id="noteContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="10"
              placeholder="Start writing your notes here..."
              disabled={actionLoading}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary" disabled={actionLoading}>Cancel</button>
          <button onClick={handleSubmit} className="btn-primary" disabled={actionLoading || (!selectedEventId && (!noteData || !noteData.eventId))}>
            {actionLoading ? 'Saving...' : (noteData?.id ? 'Save Changes' : 'Create Note')}
          </button>
        </div>
      </div>
    </div>
  );
};

const NotesDashboardView = ({
    userNotes, // Array of note objects
    sciolyEvents, // For context and potential filtering
    navigate,
    onOpenNoteEditor,
    onDeleteNote,
    actionLoading
}) => {
    const [filterEventId, setFilterEventId] = useState(''); // For future filtering

    const notesToDisplay = useMemo(() => {
        if (!filterEventId) return userNotes;
        return userNotes.filter(note => note.eventId === filterEventId);
    }, [userNotes, filterEventId]);

    const getEventTitle = (eventId) => sciolyEvents.find(e => e.id === eventId)?.title || "Unknown Event";

    return (
        <div className="notes-dashboard-view">
            <div className="view-header">
                <FileText className="header-icon" />
                <h1>My Study Notes</h1>
                <p>Organize your thoughts, key concepts, and reminders for each Science Olympiad event.</p>
            </div>

            <div className="notes-actions-bar">
                <button onClick={() => onOpenNoteEditor(null)} className="btn-primary add-note-btn">
                    <PlusCircle size={18}/> Add New Note
                </button>
                {/* Basic filter placeholder - can be expanded */}
                <div className="notes-filter-section">
                    <Filter size={18} />
                    <select value={filterEventId} onChange={(e) => setFilterEventId(e.target.value)} disabled={actionLoading}>
                        <option value="">All Events</option>
                        {sciolyEvents.map(event => (
                            <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {actionLoading && notesToDisplay.length === 0 && <div className="full-page-loader"><div className="spinner"></div><p>Loading notes...</p></div>}
            {!actionLoading && userNotes.length === 0 && (
                 <div className="empty-state-card">
                    <FileText size={48} className="empty-state-icon"/>
                    <h2>No Notes Yet</h2>
                    <p>Start capturing your insights by creating your first note!</p>
                    <button onClick={() => onOpenNoteEditor(null)} className="btn-primary">
                        <PlusCircle size={18}/> Create First Note
                    </button>
                </div>
            )}

            {notesToDisplay.length > 0 && (
                <div className="notes-grid">
                    {notesToDisplay.sort((a,b) => (b.updatedAt?.toDate() || 0) - (a.updatedAt?.toDate() || 0)).map(note => (
                        <div key={note.id} className="note-card">
                            <div className="note-card-header">
                                <h3>{note.title}</h3>
                                <span className="note-event-tag">{getEventTitle(note.eventId)}</span>
                            </div>
                            <p className="note-content-snippet">
                                {note.content ? (note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '')) : <em>No content.</em>}
                            </p>
                            <div className="note-card-footer">
                                <span className="note-timestamp">
                                    Last updated: {note.updatedAt ? new Date(note.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                                </span>
                                <div className="note-actions">
                                    <button onClick={() => onOpenNoteEditor(note)} className="btn-icon" title="Edit Note" disabled={actionLoading}><Edit3 size={16}/></button>
                                    <button onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete the note "${note.title}"?`)) {
                                            onDeleteNote(note.id);
                                        }
                                    }} className="btn-icon btn-delete" title="Delete Note" disabled={actionLoading}><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Main App Component ---
const App = () => {
  const [user, setUser] = useState(null);
  // ... (other existing states)
  const [userNotes, setUserNotes] = useState([]); // NEW: For notes
  const [isNoteEditorModalOpen, setIsNoteEditorModalOpen] = useState(false); // NEW
  const [currentEditingNote, setCurrentEditingNote] = useState(null); // NEW: Note object or null

  // ... (rest of existing states)
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentView, setCurrentView] = useState('login');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [userStudyGroup, setUserStudyGroup] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [practiceSetData, setPracticeSetData] = useState(null);

  const [joinGroupCodeInput, setJoinGroupCodeInput] = useState('');
  const [createGroupNameInput, setCreateGroupNameInput] = useState('');
  const [allStudyGroups, setAllStudyGroups] = useState([]);

  const [challengeState, setChallengeState] = useState('idle');
  // ... (other challenge states)


  // Sciolytics Learning Modules (Science Olympiad Events) - ADD officialRulesLink
  const sciolyEvents = useMemo(() => [
    {
      id: slugify('Anatomy and Physiology'), category: 'Life Science', title: 'Anatomy and Physiology',
      description: 'Understand the structure and function of human body systems. Focus on nervous, endocrine, and sensory systems for 2025-26.',
      duration: 'Approx. 60 min', lessons: 3, difficulty: 'Intermediate', color: 'green', icon: Brain,
      officialRulesLink: 'https://www.soinc.org/anatomy-and-physiology-c', // Example Link
      content: { /* ... */ }
    },
    {
      id: slugify('Astronomy'), category: 'Earth & Space Science', title: 'Astronomy',
      description: 'Journey through stellar evolution, star formation, and exoplanets.',
      duration: 'Approx. 75 min', lessons: 2, difficulty: 'Advanced', color: 'purple', icon: Telescope,
      officialRulesLink: 'https://www.soinc.org/astronomy-c', // Example Link
      content: { /* ... */ }
    },
     {
      id: slugify('Chemistry Lab'), category: 'Physical Science & Chemistry', title: 'Chemistry Lab',
      description: 'Focus on concepts of periodicity and equilibrium. Hands-on knowledge and calculations.',
      duration: 'Approx. 90 min', lessons: 3, difficulty: 'Advanced', color: 'orange', icon: Beaker,
      officialRulesLink: 'https://www.soinc.org/chemistry-lab-c', // Example Link
      content: { /* ... */ }
    },
    // ... (add officialRulesLink to other events as well)
      {
        id: slugify('Disease Detectives'), category: 'Life Science', title: 'Disease Detectives',
        description: 'Use investigative skills in the scientific study of disease, injury, health, and disability in populations.',
        duration: 'Approx. 60 min', lessons: 2, difficulty: 'Intermediate', color: 'red', icon: Microscope,
        officialRulesLink: 'https://www.soinc.org/disease-detectives-c', // Example Link
        content: { /* ... */ }
    },
    {
        id: slugify('Write It Do It'), category: 'Inquiry & Nature of Science', title: 'Write It Do It',
        description: 'One student writes a description of an object and how to build it, and the other student attempts to reconstruct the object from the description.',
        duration: 'Approx. 45 min', lessons: 2, difficulty: 'Beginner', color: 'blue', icon: Edit3,
        officialRulesLink: 'https://www.soinc.org/write-it-do-it-c', // Example Link
        content: { /* ... */ }
    },
  ], []);

  const sampleMcqs = useMemo(() => ({ /* ... existing data ... */ }), []);
  const sciolyticsChallengeBank = useMemo(() => [ /* ... existing data ... */ ], []);


  // --- NEW: Note Management Functions ---
  const fetchUserNotes = useCallback(async (currentUserId) => {
    if (!db || !currentUserId) return;
    console.log("Fetching notes for user:", currentUserId);
    setActionLoading(true);
    try {
      const notesQuery = query(collection(db, "userNotes"), where("userId", "==", currentUserId), orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(notesQuery);
      const fetchedNotes = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setUserNotes(fetchedNotes);
      console.log("User notes fetched:", fetchedNotes.length);
    } catch (error) {
      console.error("Error fetching user notes:", error);
      setMessage("Could not load your notes: " + error.message);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleSaveNote = async (noteDataToSave) => {
    if (!user || !user.id || !db) {
      setMessage("Error: Cannot save note. User not logged in or database unavailable.");
      return;
    }
    setActionLoading(true);
    setMessage("Saving note...");
    try {
      const { id, title, content, eventId, eventTitle, eventCategory } = noteDataToSave;
      const notePayload = {
        userId: user.id,
        title: title || "Untitled Note",
        content: content || "",
        eventId,
        eventTitle,
        eventCategory,
        updatedAt: serverTimestamp(),
      };

      if (id) { // Update existing note
        const noteRef = doc(db, "userNotes", id);
        await updateDoc(noteRef, notePayload);
        setUserNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, ...notePayload, updatedAt: new Date() } : n)); // Optimistic update for timestamp
        setMessage("Note updated successfully!");
      } else { // Create new note
        notePayload.createdAt = serverTimestamp();
        const noteRef = await addDoc(collection(db, "userNotes"), notePayload);
        setUserNotes(prevNotes => [{ id: noteRef.id, ...notePayload, createdAt: new Date(), updatedAt: new Date() }, ...prevNotes]);
        setMessage("Note created successfully!");
      }
      setIsNoteEditorModalOpen(false);
      setCurrentEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      setMessage("Failed to save note: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!user || !user.id || !db) {
      setMessage("Error: Cannot delete note. User not logged in or database unavailable.");
      return;
    }
    setActionLoading(true);
    setMessage("Deleting note...");
    try {
      await deleteDoc(doc(db, "userNotes", noteId));
      setUserNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
      setMessage("Note deleted successfully.");
    } catch (error) {
      console.error("Error deleting note:", error);
      setMessage("Failed to delete note: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openNoteEditorModal = (note = null, eventId = null, eventTitle = null, eventCategory = null) => {
    if (note) { // Editing existing note
        setCurrentEditingNote(note);
    } else if (eventId) { // Creating new note for a specific event
        setCurrentEditingNote({ eventId, eventTitle, eventCategory, title: '', content: '' });
    }
     else { // Creating a new note, event will be selected in modal
        setCurrentEditingNote({ title: '', content: ''});
    }
    setIsNoteEditorModalOpen(true);
  };


  const fetchUserProfile = useCallback(async (firebaseUserId) => { /* ... existing code ... */ }, []);
  const fetchUserProgress = useCallback(async (firebaseUserId) => { /* ... existing code ... */ }, []);
  const fetchUserStudyGroup = useCallback(async (groupId, currentUserIdToUpdate) => { /* ... existing code ... */ }, []);

  useEffect(() => {
    // ... (existing onAuthStateChanged logic)
    // INSIDE onAuthStateChanged, after user profile is set:
    // if (firebaseAuthUser) {
    //   ...
    //   setUser(userProfile);
    //   await fetchUserProgress(firebaseAuthUser.uid);
    //   await fetchUserNotes(firebaseAuthUser.uid); // NEW: Fetch notes
    //   ...
    // }
    console.log("Sciolytics_App.js: Auth listener effect is running.");
    if (!auth) { /* ... */ return; }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseAuthUser) => {
      console.log("Sciolytics_App.js: onAuthStateChanged triggered. Firebase Auth User:", firebaseAuthUser ? firebaseAuthUser.uid : 'null');
      try {
        if (firebaseAuthUser) {
          // ... (existing profile fetching/creation logic) ...
          let userProfile = await fetchUserProfile(firebaseAuthUser.uid);
          // ... (profile creation/update) ...
          setUser(userProfile);
          await fetchUserProgress(firebaseAuthUser.uid);
          await fetchUserNotes(firebaseAuthUser.uid); // Fetch notes after user is set

          if (userProfile.studyGroupId) { /* ... */ }
          else { setUserStudyGroup(null); }
          setCurrentView('dashboard');
          setMessage('');
        } else {
          setUser(null); setUserStudyGroup(null); setUserProgress({}); setUserNotes([]); // Clear notes on logout
          setCurrentView('login');
          // ... (other state resets)
        }
      } catch (error) { /* ... */ }
      finally { setLoading(false); }
    });
    return () => unsubscribe();
  }, [fetchUserProfile, fetchUserProgress, fetchUserStudyGroup, fetchUserNotes]); // Added fetchUserNotes

  // ... (other useEffects like category setup, challenge timer, login/logout handlers, level up)

  const handleLoginSuccess = async (credentialResponse) => { /* ... existing code ... */ };
  const handleLoginError = (error) => { /* ... existing code ... */ };
  const handleLogout = async () => { /* ... existing code ... */ };


  const navigate = (view, data = null) => {
    setMessage('');
    setCurrentView(view);
    // ... (existing navigation logic for other views)
    if (view === 'eventView') {
        const eventData = sciolyEvents.find(m => m.id === (data.id || data));
        setSelectedEvent(eventData);
        setCurrentLesson(null);
    } else if (view === 'lessonContent' && data.lesson && data.moduleId) {
        // ...
    } else if (view === 'practiceView') {
        // ...
    } else if (view === 'notesDashboard') {
        // No specific data needed here usually, notes are fetched globally
    }
    // ... (reset states if navigating away)
  };

  // ... (useEffect for message auto-clear, user leveling up)
  // ... (handleCompleteItem, study group functions, challenge functions)
  const handleCompleteItem = async (moduleId, lessonId, itemType, score = null, xpEarned = 0) => { /* ... */ };
  const handleJoinStudyGroup = async (groupCodeToJoinArg = joinGroupCodeInput) => { /* ... */ };
  const handleCreateStudyGroup = async () => { /* ... */ };
  const handleLeaveStudyGroup = async () => { /* ... */ };
  const handleDeleteStudyGroup = async () => { /* ... */ };
  const fetchAllStudyGroupsForBrowse = useCallback(async () => { /* ... */ }, [currentView, user, allStudyGroups.length]);
  useEffect(() => { if (user) { fetchAllStudyGroupsForBrowse(); } }, [user, fetchAllStudyGroupsForBrowse]);
  const startSciolyticsChallenge = () => { /* ... */ };
  const handleNextChallengeQuestion = async () => { /* ... */ };
  const resetSciolyticsChallenge = () => { /* ... */ };


  if (loading) { /* ... (loading UI) ... */ }

  return (
    <>
      {!user ? (
        <LoginView /* ...props... */ />
      ) : (
        <div className="app">
          <Navigation
            user={user}
            currentView={currentView}
            navigate={navigate}
            handleLogout={handleLogout}
            actionLoading={actionLoading}
          />
          <main className="main-content">
            {message && (currentView !== 'login' || user) &&
                <div className={`message app-message ${message.includes('failed')||message.includes('Error')||message.includes('Invalid')?'error':(message.includes('Level Up')||message.includes('Completed')||message.includes('🎉')||message.includes('Challenge finished')||message.includes('Successfully')||message.includes('created')||message.includes('Note') ?'success':'info')}`}>{message}</div>
            }
            {actionLoading && currentView !== 'login' && (
                 <div className="loading-section page-loader"><div className="spinner" /> <p>Processing...</p></div>
            )}

            {currentView === 'dashboard' && <Dashboard user={user} userProgress={userProgress} userTeam={userStudyGroup} learningModules={sciolyEvents} navigate={navigate} actionLoading={actionLoading} />}
            {currentView === 'events' && <Dashboard user={user} userProgress={userProgress} userTeam={userStudyGroup} learningModules={sciolyEvents} navigate={navigate} actionLoading={actionLoading} />}
            {currentView === 'eventView' && selectedEvent && <EventView selectedModule={selectedEvent} userProgress={userProgress} navigate={navigate} actionLoading={actionLoading} onOpenNoteEditor={openNoteEditorModal} />}
            {currentView === 'lessonContent' && currentLesson && selectedEvent && <LessonContentView currentLesson={currentLesson} selectedModule={selectedEvent} userProgress={userProgress} handleCompleteItem={handleCompleteItem} navigate={navigate} actionLoading={actionLoading} />}
            {currentView === 'practiceView' && practiceSetData && <PracticeView quizData={practiceSetData} sampleQuizzes={sampleMcqs} userProgress={userProgress} selectedModule={selectedEvent} handleCompleteItem={handleCompleteItem} navigate={navigate} actionLoading={actionLoading} setMessage={setMessage} />}
            {/* NEW: Notes Dashboard View */}
            {currentView === 'notesDashboard' && <NotesDashboardView userNotes={userNotes} sciolyEvents={sciolyEvents} navigate={navigate} onOpenNoteEditor={openNoteEditorModal} onDeleteNote={handleDeleteNote} actionLoading={actionLoading} />}
            {currentView === 'studygroups' && <StudyGroupsView user={user} userTeam={userStudyGroup} actionLoading={actionLoading} joinTeamCodeInput={joinGroupCodeInput} setJoinTeamCodeInput={setJoinGroupCodeInput} createTeamNameInput={createGroupNameInput} setCreateTeamNameInput={setCreateGroupNameInput} onJoinTeam={handleJoinStudyGroup} onCreateTeam={handleCreateStudyGroup} onLeaveTeam={handleLeaveStudyGroup} onDeleteTeam={handleDeleteStudyGroup} />}
            {currentView === 'browseGroups' && <BrowseGroupsView allTeams={allStudyGroups} actionLoading={actionLoading} user={user} currentView={currentView} fetchAllTeams={fetchAllStudyGroupsForBrowse} userTeam={userStudyGroup} onJoinTeam={handleJoinStudyGroup} />}
            {currentView === 'leaderboard' && <LeaderboardView allTeams={allStudyGroups} actionLoading={actionLoading} user={user} currentView={currentVeiw} fetchAllTeams={fetchAllStudyGroupsForBrowse} userTeam={userStudyGroup} />}
            {currentView === 'challenge' && <SciolyticsChallengeView /* ...props... */ />}
          </main>
        </div>
      )}

      {/* NEW: Note Editor Modal */}
      <NoteEditorModal
        isOpen={isNoteEditorModalOpen}
        onClose={() => { setIsNoteEditorModalOpen(false); setCurrentEditingNote(null); }}
        onSave={handleSaveNote}
        noteData={currentEditingNote}
        sciolyEvents={sciolyEvents}
        actionLoading={actionLoading}
      />

      {/* Global Styles - Sciolytics Horizon Theme */}
      <style jsx global>{`
        :root {
            --theme-primary: #00796B; /* Deep Teal */
            --theme-primary-dark: #004D40;
            --theme-primary-light: #B2DFDB; /* Light Teal */
            --theme-primary-hover: #E0F2F7; /* Lighter Teal/Blue */

            --theme-secondary: #FF7F50; /* Coral */
            --theme-accent: #FCA311; /* Mango/Gold */

            --text-primary: #212529; /* Darker Grey, Bootstrap-like */
            --text-secondary: #495057; /* Medium Grey */
            --text-light: #6c757d;   /* Lighter Grey */

            --bg-main: #f8f9fa;    /* Very Light Grey */
            --bg-card: #ffffff;
            --border-color: #dee2e6; /* Standard Grey Border */

            --success-bg: #d1e7dd; --success-text: #0a3622; --success-border: #a3cfbb;
            --error-bg: #f8d7da; --error-text: #58151c; --error-border: #f1aeb5;
            --info-bg: #cff4fc; --info-text: #055160; --info-border: #9eeaf9;

            --shadow-sm: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
            --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
            --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.03);

            /* Color mapping for modules/events - Can be kept or adjusted */
            --color-blue-500: #4A90E2; --color-blue-100: #D1E8FF;
            --color-green-500: #2ECC71; --color-green-100: #D5F5E3;
            --color-purple-500: #9B59B6; --color-purple-100: #EBDEF0;
            --color-orange-500: #F39C12; --color-orange-100: #FDEBD0;
            --color-red-500: #E74C3C; --color-red-100: #FADBD8;
        }
        /* ... (Keep existing base styles for *, html, body, but they'll inherit new vars) ... */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background-color: var(--bg-main);
          color: var(--text-primary);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .app { min-height: 100vh; display: flex; flex-direction: column; }

        button, .btn-primary, .btn-secondary {
            font-family: inherit; cursor: pointer; border:none;
            transition: all 0.2s ease-in-out;
            padding: 0.65rem 1.25rem;
            border-radius: 6px;
            font-weight: 500;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        .btn-primary { background-color: var(--theme-primary); color: white; }
        .btn-primary:hover:not(:disabled) { background-color: var(--theme-primary-dark); }
        .btn-secondary { background-color: var(--text-light); color: white; }
        .btn-secondary:hover:not(:disabled) { background-color: var(--text-secondary); }

        button:disabled { cursor: not-allowed; opacity: 0.65; }

        input[type="text"], input[type="password"], input[type="email"], select, textarea {
          font-family: inherit; padding: 0.75rem 1rem; border: 1px solid var(--border-color);
          border-radius: 6px; font-size: 1rem; width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s; background-color: var(--bg-card);
        }
        input[type="text"]:focus, input[type="password"]:focus, input[type="email"]:focus, select:focus, textarea:focus {
          outline: none; border-color: var(--theme-primary); box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.15);
        }
        /* ... (other global styles like code, icon, messages, loaders - update colors) ... */

        .nav { background: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 4.5rem; position: sticky; top: 0; z-index: 1000; box-shadow: var(--shadow-sm); }
        /* ... (Nav styles - check colors) ... */
        .nav-item.active { background: var(--theme-primary); color: white; }
        .nav-item:hover { background: var(--theme-primary-hover); color: var(--theme-primary-dark); }


        .main-content { flex: 1; padding: 2.5rem; max-width: 1320px; margin: 0 auto; width: 100%; }
        .view-header { text-align: center; margin-bottom: 2.5rem; padding-bottom:1.5rem; border-bottom: 1px solid var(--border-color);}
        .view-header .header-icon { width: 3.5rem; height: 3.5rem; color: var(--theme-primary); margin: 0 auto 1rem; }
        /* ... (Card styles: stat-card, team-card, module-card etc. - check shadows, borders, bg) ... */
        .module-card { background: var(--bg-card); padding: 1.5rem; border-radius: 10px; box-shadow: var(--shadow-md); display: flex; flex-direction: column; cursor:pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid var(--border-color); }
        .module-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--theme-primary-light); }
        .module-card .start-btn { /* use .btn-primary style */ }


        /* NEW: Event View Toolbar */
        .event-actions-toolbar {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .action-btn { /* General style for these buttons */
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            font-weight: 500;
            font-size: 0.9rem;
            transition: background-color 0.2s, color 0.2s;
        }
        .rules-link-btn {
            background-color: var(--theme-secondary);
            color: white;
            text-decoration: none;
        }
        .rules-link-btn:hover {
            background-color: #E66A3D; /* Darker coral */
        }
        .notes-manage-btn {
            background-color: var(--theme-accent);
            color: white;
        }
        .notes-manage-btn:hover {
            background-color: #D98C0A; /* Darker mango */
        }


        /* NEW: Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1050; padding:1rem; }
        .modal-content { background: var(--bg-card); padding: 2rem; border-radius: 12px; box-shadow: var(--shadow-lg); width: 100%; max-width: 600px; animation: modalFadeIn 0.3s ease-out; }
        @keyframes modalFadeIn { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); }
        .modal-header h2 { font-size: 1.6rem; color: var(--text-primary); }
        .modal-close-btn { background: transparent; border: none; cursor: pointer; color: var(--text-light); padding:0.25rem;}
        .modal-close-btn:hover { color: var(--text-primary); }
        .modal-body .form-group { margin-bottom: 1.25rem; }
        .modal-body .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: var(--text-secondary); font-size:0.9rem; }
        .note-event-context { font-size:0.9rem; color:var(--text-light); margin-bottom:1rem; padding:0.5rem; background:var(--theme-primary-hover); border-radius:4px;}
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }

        /* NEW: Notes Dashboard Styles */
        .notes-dashboard-view { display: flex; flex-direction: column; gap: 2rem; }
        .notes-actions-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding: 1rem; background-color: var(--bg-card); border-radius: 8px; box-shadow: var(--shadow-sm); margin-bottom: 1rem; }
        .notes-actions-bar .add-note-btn { background-color: var(--theme-accent); color:white;}
        .notes-actions-bar .add-note-btn:hover { background-color: #D98C0A; }
        .notes-filter-section { display: flex; align-items: center; gap: 0.75rem; }
        .notes-filter-section select { width: auto; min-width: 200px; }

        .notes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .note-card { background: var(--bg-card); border-radius: 8px; box-shadow: var(--shadow-md); padding: 1.5rem; display: flex; flex-direction: column; border: 1px solid var(--border-color); transition: all 0.2s ease-in-out; }
        .note-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
        .note-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .note-card-header h3 { font-size: 1.25rem; color: var(--theme-primary); margin-right: 0.5rem; font-weight:600; }
        .note-event-tag { font-size: 0.8rem; background-color: var(--theme-primary-hover); color: var(--theme-primary-dark); padding: 0.25rem 0.6rem; border-radius: 12px; white-space: nowrap; }
        .note-content-snippet { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem; flex-grow: 1; word-break: break-word; }
        .note-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: auto; }
        .note-timestamp { font-size: 0.8rem; color: var(--text-light); }
        .note-actions .btn-icon { background: transparent; padding: 0.5rem; color: var(--text-light); }
        .note-actions .btn-icon:hover { color: var(--theme-primary); }
        .note-actions .btn-delete:hover { color: var(--error-text); }

        .empty-state-card { background: var(--bg-card); padding: 2.5rem; border-radius: 10px; text-align: center; box-shadow: var(--shadow-md); margin-top: 1rem; border: 1px solid var(--border-color); }
        .empty-state-icon { color: var(--text-light); margin-bottom: 1rem; }
        .empty-state-card h2 { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary); }
        .empty-state-card p { color: var(--text-secondary); margin-bottom: 1.5rem; }


        /* Ensure FRQ self assessment guidance has good styling */
        .frq-self-assessment ul { margin-top: 0.5rem; margin-bottom: 1rem; padding-left: 1.5rem; }
        .frq-self-assessment li { margin-bottom: 0.3rem; color: var(--text-secondary); }
        .model-answer-placeholder > p > strong { display:block; margin-top:1rem; margin-bottom:0.5rem; font-size:1rem; color: var(--text-primary); }

        /* ... (Keep existing media queries, they will adapt to new variables and styles) ... */
        @media (max-width: 768px) {
            .notes-actions-bar { flex-direction: column; align-items: stretch; }
        }

      `}</style>
    </>
  );
};

export default App;