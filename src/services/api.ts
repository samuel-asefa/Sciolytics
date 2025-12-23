// API service for fetching team performance data
// This mimics the scio.ly API structure

export interface School {
  id: string;
  name: string;
  state: string;
  division: 'Varsity' | 'JV';
  elo: number;
  rank: number;
}

export interface EloDataPoint {
  date: string;
  [schoolName: string]: string | number;
}

export interface TournamentResult {
  id: string;
  name: string;
  date: string;
  schoolId: string;
  schoolName: string;
  rank: number;
  score: number;
}

export interface EventPerformance {
  eventName: string;
  schoolId: string;
  schoolName: string;
  averageScore: number;
  bestScore: number;
  participationCount: number;
}

// Mock API - In production, replace with actual scio.ly API endpoints
// const API_BASE_URL = 'https://api.scio.ly/v1'; // Replace with actual API URL

export const apiService = {
  // Fetch all schools with their current Elo ratings
  async getSchools(searchQuery?: string): Promise<School[]> {
    // Mock data - replace with actual API call
    const mockSchools: School[] = [
      { id: '1', name: 'A&M Consolidated High School', state: 'TX', division: 'Varsity', elo: 2850, rank: 1 },
      { id: '2', name: 'A.C. Flora High School', state: 'SC', division: 'Varsity', elo: 2800, rank: 2 },
      { id: '3', name: 'A.D. Johnston High School', state: 'MI', division: 'Varsity', elo: 2750, rank: 3 },
      { id: '4', name: 'A.R. Johnson Health Science and Engineering Magnet School', state: 'GA', division: 'Varsity', elo: 2700, rank: 4 },
      { id: '5', name: 'Abington Heights High School', state: 'PA', division: 'JV', elo: 2650, rank: 5 },
      { id: '6', name: 'Seven Lakes High School', state: 'TX', division: 'Varsity', elo: 3000, rank: 1 },
      { id: '7', name: 'Adlai E. Stevenson High School', state: 'IL', division: 'Varsity', elo: 2900, rank: 2 },
      { id: '8', name: 'Mason High School', state: 'OH', division: 'Varsity', elo: 2850, rank: 3 },
      { id: '9', name: 'Troy High School', state: 'CA', division: 'Varsity', elo: 2800, rank: 4 },
      { id: '10', name: 'Solon High School', state: 'OH', division: 'Varsity', elo: 2750, rank: 5 },
    ];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return mockSchools.filter(
        school =>
          school.name.toLowerCase().includes(query) ||
          school.state.toLowerCase().includes(query)
      );
    }

    return mockSchools;
  },

  // Fetch Elo rating history for selected schools
  async getEloHistory(schoolIds: string[], months: number = 6): Promise<EloDataPoint[]> {
    // Mock data - replace with actual API call: GET /api/elo/history?schools=id1,id2&months=6
    const dates = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - i - 1));
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    // Map to actual school names
    const schools = await this.getSchools();
    return dates.map((date, idx) => {
      const point: EloDataPoint = { date };
      schoolIds.forEach(schoolId => {
        const school = schools.find(s => s.id === schoolId);
        if (school) {
          const baseElo = school.elo;
          const variation = Math.sin((idx / months) * Math.PI * 2) * 100;
          const displayName = `${school.name} ${school.division} (${school.state})`;
          point[displayName] = Math.round(baseElo + variation);
        }
      });
      return point;
    });
  },

  // Fetch leaderboard data
  async getLeaderboard(division?: 'Varsity' | 'JV', state?: string, limit: number = 50): Promise<School[]> {
    // Mock data - replace with actual API call: GET /api/leaderboard?division=Varsity&state=TX&limit=50
    let schools = await this.getSchools();
    
    if (division) {
      schools = schools.filter(s => s.division === division);
    }
    
    if (state) {
      schools = schools.filter(s => s.state === state);
    }

    return schools.sort((a, b) => b.elo - a.elo).slice(0, limit);
  },

  // Fetch tournament results for comparison
  async getTournamentResults(schoolIds: string[]): Promise<TournamentResult[]> {
    // Mock data - replace with actual API call: GET /api/tournaments/results?schools=id1,id2
    const mockTournaments = [
      { id: 't1', name: 'National Tournament 2025', date: '2025-05-20' },
      { id: 't2', name: 'State Tournament 2025', date: '2025-04-15' },
      { id: 't3', name: 'Regional Tournament 2025', date: '2025-03-10' },
    ];

    const schools = await this.getSchools();
    const results: TournamentResult[] = [];

    mockTournaments.forEach(tournament => {
      schoolIds.forEach((schoolId, idx) => {
        const school = schools.find(s => s.id === schoolId);
        if (school) {
          results.push({
            id: `${tournament.id}-${schoolId}`,
            name: tournament.name,
            date: tournament.date,
            schoolId: school.id,
            schoolName: `${school.name} ${school.division} (${school.state})`,
            rank: idx + 1,
            score: 100 - (idx * 5),
          });
        }
      });
    });

    return results;
  },

  // Fetch event-specific performance
  async getEventPerformance(schoolIds: string[], eventName?: string): Promise<EventPerformance[]> {
    // Mock data - replace with actual API call: GET /api/events/performance?schools=id1,id2&event=Astronomy
    const events = ['Astronomy', 'Chemistry Lab', 'Circuit Lab', 'Codebusters', 'Disease Detectives'];
    const targetEvents = eventName ? [eventName] : events;
    const schools = await this.getSchools();
    const performance: EventPerformance[] = [];

    targetEvents.forEach(event => {
      schoolIds.forEach(schoolId => {
        const school = schools.find(s => s.id === schoolId);
        if (school) {
          performance.push({
            eventName: event,
            schoolId: school.id,
            schoolName: `${school.name} ${school.division} (${school.state})`,
            averageScore: 75 + Math.random() * 20,
            bestScore: 90 + Math.random() * 10,
            participationCount: Math.floor(Math.random() * 10) + 5,
          });
        }
      });
    });

    return performance;
  },
};

