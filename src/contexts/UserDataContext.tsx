import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { firestoreService, type UserSummary, type DaySession } from '../services/firestoreService';

interface EventStat { event: string; answered: number; correct: number; accuracy: number }
interface DifficultyStat { difficulty: string; answered: number; correct: number; accuracy: number }
interface DayAccuracy { date: string; accuracy: number; answered: number }
interface HeatCell { date: string; count: number }
interface WeekDay { name: string; questions: number; correct: number }

interface UserDataState {
  summary: UserSummary | null;
  dailyStats: DaySession;
  heatmapData: HeatCell[];
  eventStats: EventStat[];
  difficultyStats: DifficultyStat[];
  historyData: DayAccuracy[];
  chartData7: WeekDay[];
  chartData30: WeekDay[];
  chartData90: WeekDay[];
  loaded: boolean;
}

interface UserDataContextType extends UserDataState {
  refresh: () => Promise<void>;
  invalidate: () => void;
}

const defaultDailyStats: DaySession = { date: '', answered: 0, correct: 0, accuracy: 0 };

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const [state, setState] = useState<UserDataState>({
    summary: null,
    dailyStats: defaultDailyStats,
    heatmapData: [],
    eventStats: [],
    difficultyStats: [],
    historyData: [],
    chartData7: [],
    chartData30: [],
    chartData90: [],
    loaded: false,
  });

  // Track in-flight fetches to avoid duplicate requests
  const fetchingRef = useRef(false);
  const lastUidRef = useRef('');

  const fetchAll = useCallback(async (userId: string) => {
    if (!userId || fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const [
        summary,
        dailyStats,
        heatmapData,
        eventStats,
        difficultyStats,
        historyData,
        chartData7,
        chartData30,
        chartData90,
      ] = await Promise.all([
        firestoreService.getProgress(userId),
        firestoreService.getDailyStats(userId),
        firestoreService.getActivityHeatmap(userId, 91),
        firestoreService.getEventBreakdown(userId),
        firestoreService.getDifficultyBreakdown(userId),
        firestoreService.getDailyAccuracyHistory(userId, 30),
        firestoreService.getChartActivity(userId, 7),
        firestoreService.getChartActivity(userId, 30),
        firestoreService.getChartActivity(userId, 90),
      ]);

      setState({
        summary,
        dailyStats,
        heatmapData,
        eventStats,
        difficultyStats,
        historyData,
        chartData7,
        chartData30,
        chartData90,
        loaded: true,
      });
    } catch (err) {
      console.error('UserDataContext fetchAll error:', err);
      setState(prev => ({ ...prev, loaded: true }));
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!uid) {
      setState(prev => ({ ...prev, loaded: false }));
      lastUidRef.current = '';
      return;
    }
    // Only re-fetch if the user changed (not on every re-render)
    if (uid === lastUidRef.current && state.loaded) return;
    lastUidRef.current = uid;
    fetchAll(uid);
  }, [uid, fetchAll]);

  const refresh = useCallback(() => fetchAll(uid), [uid, fetchAll]);

  const invalidate = useCallback(() => {
    setState(prev => ({ ...prev, loaded: false }));
    fetchAll(uid);
  }, [uid, fetchAll]);

  return (
    <UserDataContext.Provider value={{ ...state, refresh, invalidate }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
