import { useState, useEffect } from 'react';
import { Search, RefreshCw, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllEvents, getAllSubtopics } from '../data/questionBank';
import { questionService } from '../services/questionService';

const categories: Record<string, string> = {
  'Anatomy & Physiology': 'Life & Social Science',
  'Astronomy': 'Earth and Space Science',
  'Chemistry Lab': 'Physical Science & Chemistry',
  'Circuit Lab': 'Physical Science & Chemistry',
  'Codebusters': 'Inquiry & Nature of Science',
  'Disease Detectives': 'Life & Social Science',
  'Dynamic Planet': 'Earth and Space Science',
  'Entomology': 'Life & Social Science',
  'Forensics': 'Life & Social Science',
  'Machines': 'Physical Science & Chemistry',
  'Remote Sensing': 'Earth and Space Science',
  'Rocks and Minerals': 'Earth and Space Science',
  'Water Quality': 'Life & Social Science',
  'Engineering CAD': 'Engineering',
  'Experimental Design': 'Inquiry & Nature of Science',
  'Hovercraft': 'Engineering',
  'Boomilever': 'Engineering',
  'Electric Vehicle': 'Engineering',
  'Designer Genes': 'Life & Social Science',
};

const getDivisions = (event: string): string => {
  if (event === 'Astronomy' || event === 'Chemistry Lab') {
    return 'Div C';
  }
  return 'Div B, C';
};

export default function Practice() {
  const navigate = useNavigate();
  const events = getAllEvents();
  const subtopicsMap = getAllSubtopics();
  
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState('10');
  const [timeLimit, setTimeLimit] = useState('15');
  const [questionType, setQuestionType] = useState<'mcq' | 'mcq-frq' | 'frq'>('mcq');
  const [division, setDivision] = useState<'b' | 'both' | 'c'>('both');
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('All Subtopics');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(questionService.getProgress().favorites);

  const availableSubtopics = selectedEvent ? subtopicsMap[selectedEvent] || [] : [];

  useEffect(() => {
    if (selectedEvent && availableSubtopics.length > 0 && selectedSubtopic === 'All Subtopics') {
      // Keep current selection or reset
    }
  }, [selectedEvent]);

  const toggleFavorite = (eventName: string) => {
    questionService.toggleFavorite(eventName);
    setFavorites(questionService.getProgress().favorites);
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.toLowerCase().includes(searchQuery.toLowerCase());
      if (sortBy === 'favorites') {
        return matchesSearch && favorites.includes(event);
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') return a.localeCompare(b);
      if (sortBy === 'category') return (categories[a] || '').localeCompare(categories[b] || '');
      if (sortBy === 'favorites') {
        const aFav = favorites.includes(a);
        const bFav = favorites.includes(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.localeCompare(b);
      }
      return 0;
    });

  const handleGenerateTest = () => {
    if (!selectedEvent) {
      alert('Please select an event');
      return;
    }

    const filter = {
      event: selectedEvent,
      subtopic: selectedSubtopic !== 'All Subtopics' ? selectedSubtopic : undefined,
      division: division === 'both' ? 'Both' : (division.toUpperCase() as 'B' | 'C'),
      type: questionType === 'mcq' ? 'MCQ' as const : questionType === 'frq' ? 'FRQ' as const : 'All' as const,
      difficulty: difficulty !== 'All' ? difficulty : undefined,
      limit: parseInt(numQuestions) || 10,
    };

    // Store test config and navigate to test page
    sessionStorage.setItem('testConfig', JSON.stringify(filter));
    sessionStorage.setItem('timeLimit', timeLimit);
    navigate('/practice/test');
  };

  const handleUnlimited = () => {
    if (!selectedEvent) {
      alert('Please select an event');
      return;
    }

    const filter = {
      event: selectedEvent,
      subtopic: selectedSubtopic !== 'All Subtopics' ? selectedSubtopic : undefined,
      division: division === 'both' ? 'Both' : (division.toUpperCase() as 'B' | 'C'),
      type: questionType === 'mcq' ? 'MCQ' as const : questionType === 'frq' ? 'FRQ' as const : 'All' as const,
      difficulty: difficulty !== 'All' ? difficulty : undefined,
    };

    sessionStorage.setItem('testConfig', JSON.stringify(filter));
    sessionStorage.setItem('unlimitedMode', 'true');
    navigate('/practice/test');
  };

  return (
    <div className="practice-page">
      <div className="practice-header">
        <h1>Practice</h1>
        <p>Select an event from the 2026 events list and configure your practice session</p>
      </div>

      <div className="practice-content">
        <div className="events-panel">
          <div className="events-header">
            <h2>Available Events</h2>
            <div className="events-controls">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="alphabetical">Sort: Alphabetical</option>
                <option value="category">Sort: Category</option>
                <option value="favorites">Sort: Favorites</option>
              </select>
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="icon-button" onClick={() => setSearchQuery('')}>
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="events-list">
            {filteredEvents.map((eventName, idx) => {
              const isFavorite = favorites.includes(eventName);
              return (
                <div
                  key={idx}
                  className={`event-item ${selectedEvent === eventName ? 'selected' : ''} ${isFavorite ? 'favorited' : ''}`}
                  onClick={() => setSelectedEvent(eventName)}
                >
                  <div className="event-item-header">
                    <div className="event-name">{eventName}</div>
                    <button
                      className={`favorite-event-btn ${isFavorite ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(eventName);
                      }}
                    >
                      <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="event-tags">
                    <span className="tag category">{categories[eventName] || 'General'}</span>
                    <span className="tag division">{getDivisions(eventName)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="config-panel">
          <div className="config-header">
            <h2>Test Configuration</h2>
            {selectedEvent && (
              <button
                className={`favorite-button ${favorites.includes(selectedEvent) ? 'active' : ''}`}
                onClick={() => toggleFavorite(selectedEvent)}
                title={favorites.includes(selectedEvent) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={18} fill={favorites.includes(selectedEvent) ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>Number of Questions</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                min="1"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Time Limit (minutes)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Question Types</label>
              <div className="button-group">
                <button
                  className={questionType === 'mcq' ? 'btn-option active' : 'btn-option'}
                  onClick={() => setQuestionType('mcq')}
                >
                  MCQ only
                </button>
                <button
                  className={questionType === 'mcq-frq' ? 'btn-option active' : 'btn-option'}
                  onClick={() => setQuestionType('mcq-frq')}
                >
                  MCQ + FRQ
                </button>
                <button
                  className={questionType === 'frq' ? 'btn-option active' : 'btn-option'}
                  onClick={() => setQuestionType('frq')}
                >
                  FRQ only
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Division</label>
              <div className="button-group">
                <button
                  className={division === 'b' ? 'btn-option active' : 'btn-option'}
                  onClick={() => setDivision('b')}
                >
                  Division B
                </button>
                <button
                  className={division === 'both' ? 'btn-option active green' : 'btn-option'}
                  onClick={() => setDivision('both')}
                >
                  Both
                </button>
                <button
                  className={division === 'c' ? 'btn-option active' : 'btn-option'}
                  onClick={() => setDivision('c')}
                >
                  Division C
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              >
                <option>All Difficulties</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Subtopics</label>
              <select
                className="form-select"
                value={selectedSubtopic}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
                disabled={!selectedEvent}
              >
                <option>All Subtopics</option>
                {availableSubtopics.map((subtopic) => (
                  <option key={subtopic} value={subtopic}>
                    {subtopic}
                  </option>
                ))}
              </select>
              {!selectedEvent && (
                <p className="form-hint">Select an event to see subtopics</p>
              )}
            </div>

            <div className="config-actions">
              <button className="btn-primary" onClick={handleGenerateTest}>
                Generate Test
              </button>
              <button className="btn-secondary" onClick={handleUnlimited}>
                Unlimited
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
