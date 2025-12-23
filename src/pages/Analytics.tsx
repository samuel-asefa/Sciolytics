import { useState, useEffect } from 'react';
import { BarChart3, Trophy, GitCompare, Info, Medal, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar } from 'recharts';
import { apiService } from '../services/api';
import type { School, EloDataPoint, TournamentResult, EventPerformance } from '../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('charts');
  const [activeFilter, setActiveFilter] = useState('overall');
  const [selectedSchools, setSelectedSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [eloData, setEloData] = useState<EloDataPoint[]>([]);
  const [leaderboard, setLeaderboard] = useState<School[]>([]);
  const [tournamentResults, setTournamentResults] = useState<TournamentResult[]>([]);
  const [eventPerformance, setEventPerformance] = useState<EventPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [divisionFilter, setDivisionFilter] = useState<'Varsity' | 'JV' | 'All'>('All');
  const [stateFilter, setStateFilter] = useState<string>('');

  useEffect(() => {
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (selectedSchools.length > 0) {
      loadEloData();
      loadTournamentResults();
      loadEventPerformance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchools, activeFilter]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionFilter, stateFilter, activeTab]);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSchools(searchQuery);
      setSchools(data);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEloData = async () => {
    setLoading(true);
    try {
      const schoolIds = selectedSchools.map(s => s.id);
      const data = await apiService.getEloHistory(schoolIds, 6);
      setEloData(data);
    } catch (error) {
      console.error('Failed to load Elo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const division = divisionFilter === 'All' ? undefined : divisionFilter;
      const data = await apiService.getLeaderboard(division, stateFilter || undefined, 50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTournamentResults = async () => {
    setLoading(true);
    try {
      const schoolIds = selectedSchools.map(s => s.id);
      const data = await apiService.getTournamentResults(schoolIds);
      setTournamentResults(data);
    } catch (error) {
      console.error('Failed to load tournament results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventPerformance = async () => {
    setLoading(true);
    try {
      const schoolIds = selectedSchools.map(s => s.id);
      const eventName = activeFilter === 'event' ? 'Astronomy' : undefined;
      const data = await apiService.getEventPerformance(schoolIds, eventName);
      setEventPerformance(data);
    } catch (error) {
      console.error('Failed to load event performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSchool = (school: School) => {
    if (selectedSchools.find(s => s.id === school.id)) {
      setSelectedSchools(selectedSchools.filter(s => s.id !== school.id));
    } else {
      setSelectedSchools([...selectedSchools, school]);
    }
  };

  const getSchoolDisplayName = (school: School) => {
    return `${school.name} ${school.division} (${school.state})`;
  };

  const filteredSchools = schools.filter(school =>
    getSchoolDisplayName(school).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Team Performance Analysis</h1>
          <p>Track team performance across seasons and events.</p>
        </div>
      </div>

      <div className="analytics-tabs">
        <button
          className={activeTab === 'charts' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('charts')}
        >
          <BarChart3 size={18} />
          Charts
        </button>
        <button
          className={activeTab === 'leaderboard' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={18} />
          Leaderboard
        </button>
        <button
          className={activeTab === 'compare' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('compare')}
        >
          <GitCompare size={18} />
          Compare
        </button>
      </div>

      {activeTab === 'charts' && (
        <>
          <div className="filter-tabs">
            <button
              className={activeFilter === 'overall' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setActiveFilter('overall')}
            >
              Overall
            </button>
            <button
              className={activeFilter === 'event' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setActiveFilter('event')}
            >
              Event
            </button>
            <button
              className={activeFilter === 'season' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setActiveFilter('season')}
            >
              By Season
            </button>
            <button
              className={activeFilter === 'tournament' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setActiveFilter('tournament')}
            >
              By Tournament
            </button>
          </div>

          <div className="analytics-content">
            <div className="school-selector">
              <h3>Select Schools</h3>
              <input
                type="text"
                placeholder="Search schools..."
                className="school-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="schools-list">
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : (
                  filteredSchools.map((school) => {
                    const isSelected = selectedSchools.find(s => s.id === school.id);
                    return (
                      <div
                        key={school.id}
                        className={`school-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSchool(school)}
                      >
                        {getSchoolDisplayName(school)}
                      </div>
                    );
                  })
                )}
              </div>
              {selectedSchools.length > 0 && (
                <div className="selected-schools">
                  {selectedSchools.map((school) => (
                    <div key={school.id} className="selected-tag">
                      {getSchoolDisplayName(school)}
                      <button onClick={() => toggleSchool(school)}>×</button>
                    </div>
                  ))}
                  <button className="clear-all" onClick={() => setSelectedSchools([])}>
                    Clear All
                  </button>
                </div>
              )}
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>Elo Rating</h3>
                <Info size={16} className="info-icon" />
              </div>
              {loading ? (
                <div className="loading">Loading chart data...</div>
              ) : eloData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={eloData}>
                    <XAxis dataKey="date" />
                    <YAxis domain={[2400, 3200]} />
                    <Tooltip />
                    <Legend />
                    {selectedSchools.map((school, idx) => (
                      <Line
                        key={school.id}
                        type="monotone"
                        dataKey={getSchoolDisplayName(school)}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">Select schools to view Elo rating history</div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'leaderboard' && (
        <div className="leaderboard-container">
          <div className="leaderboard-filters">
            <div className="filter-group">
              <label>Division:</label>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value as 'Varsity' | 'JV' | 'All')}
                className="filter-select"
              >
                <option value="All">All Divisions</option>
                <option value="Varsity">Varsity</option>
                <option value="JV">JV</option>
              </select>
            </div>
            <div className="filter-group">
              <label>State:</label>
              <input
                type="text"
                placeholder="Filter by state..."
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading leaderboard...</div>
          ) : (
            <div className="leaderboard-table">
              <div className="leaderboard-header">
                <div className="rank-col">Rank</div>
                <div className="school-col">School</div>
                <div className="elo-col">Elo Rating</div>
                <div className="trend-col">Trend</div>
              </div>
              {leaderboard.map((school, idx) => (
                <div key={school.id} className="leaderboard-row">
                  <div className="rank-col">
                    {idx < 3 ? (
                      <Medal size={20} className={`medal-${idx + 1}`} />
                    ) : (
                      <span className="rank-number">{idx + 1}</span>
                    )}
                  </div>
                  <div className="school-col">
                    <div className="school-name">{school.name}</div>
                    <div className="school-meta">{school.division} • {school.state}</div>
                  </div>
                  <div className="elo-col">
                    <span className="elo-value">{school.elo}</span>
                  </div>
                  <div className="trend-col">
                    <TrendingUp size={16} className="trend-icon" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="compare-container">
          <div className="compare-selector">
            <h3>Select Schools to Compare</h3>
            <input
              type="text"
              placeholder="Search schools..."
              className="school-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="schools-list">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : (
                filteredSchools.map((school) => {
                  const isSelected = selectedSchools.find(s => s.id === school.id);
                  return (
                    <div
                      key={school.id}
                      className={`school-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSchool(school)}
                    >
                      {getSchoolDisplayName(school)}
                    </div>
                  );
                })
              )}
            </div>
            {selectedSchools.length > 0 && (
              <div className="selected-schools">
                {selectedSchools.map((school) => (
                  <div key={school.id} className="selected-tag">
                    {getSchoolDisplayName(school)}
                    <button onClick={() => toggleSchool(school)}>×</button>
                  </div>
                ))}
                <button className="clear-all" onClick={() => setSelectedSchools([])}>
                  Clear All
                </button>
              </div>
            )}
          </div>

          {selectedSchools.length > 0 && (
            <div className="compare-content">
              <div className="compare-section">
                <h3>Tournament Results</h3>
                {loading ? (
                  <div className="loading">Loading tournament data...</div>
                ) : tournamentResults.length > 0 ? (
                  <div className="tournament-results">
                    {Array.from(new Set(tournamentResults.map(t => t.name))).map(tournamentName => (
                      <div key={tournamentName} className="tournament-card">
                        <h4>{tournamentName}</h4>
                        <div className="tournament-schools">
                          {tournamentResults
                            .filter(t => t.name === tournamentName)
                            .map(result => (
                              <div key={result.id} className="tournament-result">
                                <span className="result-school">{result.schoolName}</span>
                                <span className="result-rank">Rank: {result.rank}</span>
                                <span className="result-score">Score: {result.score}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">No tournament data available</div>
                )}
              </div>

              <div className="compare-section">
                <h3>Event Performance</h3>
                {loading ? (
                  <div className="loading">Loading event data...</div>
                ) : eventPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={(() => {
                      // Group by event and create data points for each school
                      const events = Array.from(new Set(eventPerformance.map(e => e.eventName)));
                      return events.map(eventName => {
                        const point: Record<string, string | number> = { eventName };
                        selectedSchools.forEach(school => {
                          const perf = eventPerformance.find(
                            e => e.eventName === eventName && e.schoolId === school.id
                          );
                          if (perf) {
                            point[getSchoolDisplayName(school)] = Math.round(perf.averageScore);
                          }
                        });
                        return point;
                      });
                    })()}>
                      <XAxis dataKey="eventName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {selectedSchools.map((school, idx) => (
                        <Bar
                          key={school.id}
                          dataKey={getSchoolDisplayName(school)}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">No event performance data available</div>
                )}
              </div>
            </div>
          )}

          {selectedSchools.length === 0 && (
            <div className="compare-placeholder">
              <p>Select schools to compare their performance</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
