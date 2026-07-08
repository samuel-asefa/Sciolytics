/**
 * firestoreService.ts
 * All user data persistence: progress, daily sessions, answers, bookmarks, favorites.
 * Uses a robust local storage fallback to ensure all features function perfectly even if
 * Firestore is unavailable or rejects writes (e.g., due to missing permissions).
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Question } from '../data/questionBank';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserSummary {
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  favorites: string[];
  byEvent: Record<string, { answered: number; correct: number }>;
  byDifficulty: Record<string, { answered: number; correct: number }>;
}

export interface DaySession {
  date: string;       // YYYY-MM-DD
  answered: number;
  correct: number;
  accuracy: number;
}

export interface AnswerRecord {
  questionId: string;
  event: string;
  subtopic: string;
  difficulty: string;
  type: string;
  isCorrect: boolean;
  timestamp: Timestamp | ReturnType<typeof serverTimestamp>;
}

export interface BookmarkedQuestion extends Question {
  bookmarkedAt: Timestamp | ReturnType<typeof serverTimestamp> | { seconds: number };
}

// ─── Local Storage Helpers ────────────────────────────────────────────────────

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Local storage write error', err);
  }
}

// ─── Firebase Helpers ─────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function summaryRef(uid: string) {
  return doc(db, 'users', uid, 'progress', 'summary');
}

function sessionRef(uid: string, date: string) {
  return doc(db, 'users', uid, 'sessions', date);
}

function answersCol(uid: string) {
  return collection(db, 'users', uid, 'answers');
}

function bookmarksCol(uid: string) {
  return collection(db, 'users', uid, 'bookmarks');
}

function bookmarkRef(uid: string, questionId: string) {
  return doc(db, 'users', uid, 'bookmarks', questionId);
}

const defaultSummary: UserSummary = {
  questionsAnswered: 0,
  questionsCorrect: 0,
  accuracy: 0,
  favorites: [],
  byEvent: {},
  byDifficulty: {},
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const firestoreService = {
  // ── Summary / Progress ───────────────────────────────────────────────────

  async getProgress(uid: string): Promise<UserSummary> {
    const localKey = `scio_${uid}_summary`;
    const localData = getLocal<UserSummary>(localKey, defaultSummary);

    try {
      const snap = await getDoc(summaryRef(uid));
      if (snap.exists()) {
        const fbData = snap.data() as UserSummary;
        // Favor local data if it has more progress
        if (localData.questionsAnswered >= (fbData.questionsAnswered || 0)) {
          return localData;
        } else {
          setLocal(localKey, fbData);
          return fbData;
        }
      }
      return localData;
    } catch {
      return localData;
    }
  },

  // ── Daily Session ────────────────────────────────────────────────────────

  async getDailyStats(uid: string, date?: string): Promise<DaySession> {
    const d = date ?? todayStr();
    const sessKey = `scio_${uid}_sessions`;
    const sessionsMap = getLocal<Record<string, DaySession>>(sessKey, {});
    const localSession = sessionsMap[d] || { date: d, answered: 0, correct: 0, accuracy: 0 };

    try {
      const snap = await getDoc(sessionRef(uid, d));
      if (snap.exists()) {
        const fbSession = snap.data() as DaySession;
        if (localSession.answered >= (fbSession.answered || 0)) {
          return localSession;
        }
        sessionsMap[d] = fbSession;
        setLocal(sessKey, sessionsMap);
        return fbSession;
      }
      return localSession;
    } catch {
      return localSession;
    }
  },

  // ── Save Answer ──────────────────────────────────────────────────────────

  async saveAnswer(uid: string, question: Question, isCorrect: boolean): Promise<void> {
    const date = todayStr();

    // 1. Update local storage first to guarantee UI updates immediately
    const sumKey = `scio_${uid}_summary`;
    const currentSum = getLocal<UserSummary>(sumKey, defaultSummary);
    const newAnswered = currentSum.questionsAnswered + 1;
    const newCorrect = currentSum.questionsCorrect + (isCorrect ? 1 : 0);

    const eventStats = currentSum.byEvent[question.event] || { answered: 0, correct: 0 };
    const diffStats = currentSum.byDifficulty[question.difficulty] || { answered: 0, correct: 0 };

    currentSum.questionsAnswered = newAnswered;
    currentSum.questionsCorrect = newCorrect;
    currentSum.accuracy = Math.round((newCorrect / newAnswered) * 100);
    
    currentSum.byEvent[question.event] = {
      answered: eventStats.answered + 1,
      correct: eventStats.correct + (isCorrect ? 1 : 0)
    };
    currentSum.byDifficulty[question.difficulty] = {
      answered: diffStats.answered + 1,
      correct: diffStats.correct + (isCorrect ? 1 : 0)
    };
    setLocal(sumKey, currentSum);

    const sessKey = `scio_${uid}_sessions`;
    const sessions = getLocal<Record<string, DaySession>>(sessKey, {});
    const s = sessions[date] || { date, answered: 0, correct: 0, accuracy: 0 };
    s.answered += 1;
    s.correct += (isCorrect ? 1 : 0);
    s.accuracy = Math.round((s.correct / s.answered) * 100);
    sessions[date] = s;
    setLocal(sessKey, sessions);

    // 2. Try persisting to Firestore (fails silently if unconfigured/blocked)
    try {
      await addDoc(answersCol(uid), {
        questionId: question.id,
        event: question.event,
        subtopic: question.subtopic,
        difficulty: question.difficulty,
        type: question.type,
        isCorrect,
        timestamp: serverTimestamp(),
      });

      const sRef = sessionRef(uid, date);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists()) {
        const fbS = sSnap.data() as DaySession;
        await updateDoc(sRef, {
          answered: fbS.answered + 1,
          correct: fbS.correct + (isCorrect ? 1 : 0),
          accuracy: Math.round(((fbS.correct + (isCorrect ? 1 : 0)) / (fbS.answered + 1)) * 100),
        });
      } else {
        await setDoc(sRef, {
          date,
          answered: 1,
          correct: isCorrect ? 1 : 0,
          accuracy: isCorrect ? 100 : 0,
        });
      }

      const sumRef = summaryRef(uid);
      const fbSumSnap = await getDoc(sumRef);
      const fbSum = fbSumSnap.exists() ? fbSumSnap.data() as UserSummary : { ...defaultSummary };
      
      const fbNewAnswered = (fbSum.questionsAnswered || 0) + 1;
      const fbNewCorrect = (fbSum.questionsCorrect || 0) + (isCorrect ? 1 : 0);
      const fbEventStats = fbSum.byEvent?.[question.event] || { answered: 0, correct: 0 };
      const fbDiffStats = fbSum.byDifficulty?.[question.difficulty] || { answered: 0, correct: 0 };

      await setDoc(sumRef, {
        ...fbSum,
        questionsAnswered: fbNewAnswered,
        questionsCorrect: fbNewCorrect,
        accuracy: Math.round((fbNewCorrect / fbNewAnswered) * 100),
        byEvent: {
          ...fbSum.byEvent,
          [question.event]: {
            answered: fbEventStats.answered + 1,
            correct: fbEventStats.correct + (isCorrect ? 1 : 0)
          }
        },
        byDifficulty: {
          ...fbSum.byDifficulty,
          [question.difficulty]: {
            answered: fbDiffStats.answered + 1,
            correct: fbDiffStats.correct + (isCorrect ? 1 : 0)
          }
        }
      });
    } catch (err) {
      console.warn('Firestore write failed, relying on local storage fallback.', err);
    }
  },

  // ── Heatmap: last N days ─────────────────────────────────────────────────

  async getActivityHeatmap(uid: string, days = 91): Promise<{ date: string; count: number }[]> {
    const sessions = getLocal<Record<string, DaySession>>(`scio_${uid}_sessions`, {});
    const sessMap: Record<string, number> = {};
    Object.values(sessions).forEach(s => sessMap[s.date] = s.answered);

    try {
      const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
      sessionsSnap.forEach(d => {
        const s = d.data() as DaySession;
        if ((sessMap[s.date] || 0) < s.answered) sessMap[s.date] = s.answered;
      });
    } catch {}

    const result: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({ date: dateStr, count: sessMap[dateStr] ?? 0 });
    }
    return result;
  },

  // ── Weekly line chart (last 7 days) ──────────────────────────────────────

  async getWeeklyActivity(uid: string): Promise<{ name: string; questions: number; correct: number }[]> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];

    const sessMap = getLocal<Record<string, DaySession>>(`scio_${uid}_sessions`, {});

    try {
      const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
      sessionsSnap.forEach(d => {
        const s = d.data() as DaySession;
        if ((sessMap[s.date]?.answered || 0) < s.answered) sessMap[s.date] = s;
      });
    } catch {}

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const sess = sessMap[dateStr];
      result.push({
        name: days[d.getDay()],
        questions: sess?.answered ?? 0,
        correct: sess?.correct ?? 0,
      });
    }
    return result;
  },

  // ── Per-event breakdown ──────────────────────────────────────────────────

  async getEventBreakdown(uid: string): Promise<{ event: string; answered: number; correct: number; accuracy: number }[]> {
    const summary = await this.getProgress(uid);
    return Object.entries(summary.byEvent || {}).map(([event, stats]) => ({
      event,
      answered: stats.answered,
      correct: stats.correct,
      accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
    })).sort((a, b) => b.answered - a.answered);
  },

  // ── Difficulty breakdown ─────────────────────────────────────────────────

  async getDifficultyBreakdown(uid: string): Promise<{ difficulty: string; answered: number; correct: number; accuracy: number }[]> {
    const summary = await this.getProgress(uid);
    const order = ['Easy', 'Medium', 'Hard'];
    return order.map(difficulty => {
      const stats = summary.byDifficulty?.[difficulty] ?? { answered: 0, correct: 0 };
      return {
        difficulty,
        answered: stats.answered,
        correct: stats.correct,
        accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
      };
    });
  },

  // ── Daily accuracy history (last 30 days) ────────────────────────────────

  async getDailyAccuracyHistory(uid: string, days = 30): Promise<{ date: string; accuracy: number; answered: number }[]> {
    const today = new Date();
    const sessMap = getLocal<Record<string, DaySession>>(`scio_${uid}_sessions`, {});

    try {
      const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
      sessionsSnap.forEach(d => {
        const s = d.data() as DaySession;
        if ((sessMap[s.date]?.answered || 0) < s.answered) sessMap[s.date] = s;
      });
    } catch {}

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const sess = sessMap[dateStr];
      if (sess && sess.answered > 0) {
        result.push({ date: dateStr, accuracy: sess.accuracy, answered: sess.answered });
      }
    }
    return result;
  },

  // ── Favorites ────────────────────────────────────────────────────────────

  async toggleFavorite(uid: string, event: string): Promise<boolean> {
    const sumKey = `scio_${uid}_summary`;
    const data = getLocal<UserSummary>(sumKey, defaultSummary);
    const favorites = data.favorites || [];
    const idx = favorites.indexOf(event);
    
    let newFavorites: string[];
    if (idx > -1) {
      newFavorites = favorites.filter(f => f !== event);
    } else {
      newFavorites = [...favorites, event];
    }
    data.favorites = newFavorites;
    setLocal(sumKey, data);

    try {
      const sumRef = summaryRef(uid);
      const snap = await getDoc(sumRef);
      const fbData = snap.exists() ? snap.data() as UserSummary : { ...defaultSummary };
      await setDoc(sumRef, { ...fbData, favorites: newFavorites });
    } catch {}
    
    return idx === -1;
  },

  async isFavorite(uid: string, event: string): Promise<boolean> {
    const data = getLocal<UserSummary>(`scio_${uid}_summary`, defaultSummary);
    if ((data.favorites || []).includes(event)) return true;

    try {
      const snap = await getDoc(summaryRef(uid));
      if (!snap.exists()) return false;
      return (snap.data() as UserSummary).favorites?.includes(event) ?? false;
    } catch { 
      return false; 
    }
  },

  // ── Bookmarks ────────────────────────────────────────────────────────────

  async getBookmarks(uid: string): Promise<BookmarkedQuestion[]> {
    const key = `scio_${uid}_bookmarks`;
    const bmarksMap = getLocal<Record<string, BookmarkedQuestion>>(key, {});
    let localArr = Object.values(bmarksMap);

    try {
      const snap = await getDocs(bookmarksCol(uid));
      if (snap.docs.length > 0) {
        snap.docs.forEach(d => {
          bmarksMap[d.id] = d.data() as BookmarkedQuestion;
        });
        setLocal(key, bmarksMap);
        localArr = Object.values(bmarksMap);
      }
    } catch {}

    return localArr;
  },

  async toggleBookmark(uid: string, question: Question): Promise<boolean> {
    const key = `scio_${uid}_bookmarks`;
    const bmarksMap = getLocal<Record<string, BookmarkedQuestion>>(key, {});
    let isAdded = false;

    if (bmarksMap[question.id]) {
      delete bmarksMap[question.id];
    } else {
      bmarksMap[question.id] = { ...question, bookmarkedAt: { seconds: Math.floor(Date.now() / 1000) } as any };
      isAdded = true;
    }
    setLocal(key, bmarksMap);

    try {
      const ref = bookmarkRef(uid, question.id);
      if (!isAdded) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { ...question, bookmarkedAt: serverTimestamp() });
      }
    } catch {}
    return isAdded;
  },

  async isBookmarked(uid: string, questionId: string): Promise<boolean> {
    const bmarksMap = getLocal<Record<string, BookmarkedQuestion>>(`scio_${uid}_bookmarks`, {});
    if (bmarksMap[questionId]) return true;

    try {
      const snap = await getDoc(bookmarkRef(uid, questionId));
      return snap.exists();
    } catch {
      return false;
    }
  },

  // ── Profile ──────────────────────────────────────────────────────────────

  async getProfile(uid: string): Promise<Record<string, string>> {
    const key = `scio_${uid}_profile`;
    const localProfile = getLocal<Record<string, string>>(key, {});

    try {
      const snap = await getDoc(doc(db, 'users', uid, 'profile', 'data'));
      if (snap.exists()) {
        const fbProfile = snap.data() as Record<string, string>;
        setLocal(key, fbProfile);
        return fbProfile;
      }
      return localProfile;
    } catch {
      return localProfile;
    }
  },

  async saveProfile(uid: string, profileData: Record<string, string>): Promise<void> {
    const key = `scio_${uid}_profile`;
    setLocal(key, profileData);

    try {
      await setDoc(doc(db, 'users', uid, 'profile', 'data'), profileData);
    } catch (err) {
      console.warn('Firestore write failed, relying on local storage fallback.', err);
    }
  },
};
