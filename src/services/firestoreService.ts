/**
 * firestoreService.ts
 * All user data persistence: progress, daily sessions, answers, bookmarks, favorites.
 * Replaces all localStorage usage for user-specific data.
 *
 * Firestore schema:
 *   users/{uid}/progress/summary       → UserSummary
 *   users/{uid}/sessions/{YYYY-MM-DD}  → DaySession
 *   users/{uid}/answers/{autoId}       → AnswerRecord
 *   users/{uid}/bookmarks/{questionId} → BookmarkedQuestion
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
  bookmarkedAt: Timestamp | ReturnType<typeof serverTimestamp>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    try {
      const snap = await getDoc(summaryRef(uid));
      if (snap.exists()) {
        return snap.data() as UserSummary;
      }
      return { ...defaultSummary };
    } catch {
      return { ...defaultSummary };
    }
  },

  // ── Daily Session ────────────────────────────────────────────────────────

  async getDailyStats(uid: string, date?: string): Promise<DaySession> {
    const d = date ?? todayStr();
    try {
      const snap = await getDoc(sessionRef(uid, d));
      if (snap.exists()) return snap.data() as DaySession;
      return { date: d, answered: 0, correct: 0, accuracy: 0 };
    } catch {
      return { date: d, answered: 0, correct: 0, accuracy: 0 };
    }
  },

  // ── Save Answer ──────────────────────────────────────────────────────────

  async saveAnswer(uid: string, question: Question, isCorrect: boolean): Promise<void> {
    const date = todayStr();

    // 1. Write the answer record
    await addDoc(answersCol(uid), {
      questionId: question.id,
      event: question.event,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      type: question.type,
      isCorrect,
      timestamp: serverTimestamp(),
    } satisfies Omit<AnswerRecord, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> });

    // 2. Update daily session
    const sRef = sessionRef(uid, date);
    const sSnap = await getDoc(sRef);
    if (sSnap.exists()) {
      const s = sSnap.data() as DaySession;
      const newAnswered = s.answered + 1;
      const newCorrect = s.correct + (isCorrect ? 1 : 0);
      await updateDoc(sRef, {
        answered: newAnswered,
        correct: newCorrect,
        accuracy: Math.round((newCorrect / newAnswered) * 100),
      });
    } else {
      await setDoc(sRef, {
        date,
        answered: 1,
        correct: isCorrect ? 1 : 0,
        accuracy: isCorrect ? 100 : 0,
      });
    }

    // 3. Update summary
    const sumRef = summaryRef(uid);
    const sumSnap = await getDoc(sumRef);
    const current: UserSummary = sumSnap.exists()
      ? (sumSnap.data() as UserSummary)
      : { ...defaultSummary };

    const newAnswered = current.questionsAnswered + 1;
    const newCorrect = current.questionsCorrect + (isCorrect ? 1 : 0);

    // Per-event
    const eventKey = question.event;
    const eventStats = current.byEvent[eventKey] ?? { answered: 0, correct: 0 };
    const newByEvent = {
      ...current.byEvent,
      [eventKey]: {
        answered: eventStats.answered + 1,
        correct: eventStats.correct + (isCorrect ? 1 : 0),
      },
    };

    // Per-difficulty
    const diffKey = question.difficulty;
    const diffStats = current.byDifficulty[diffKey] ?? { answered: 0, correct: 0 };
    const newByDifficulty = {
      ...current.byDifficulty,
      [diffKey]: {
        answered: diffStats.answered + 1,
        correct: diffStats.correct + (isCorrect ? 1 : 0),
      },
    };

    await setDoc(sumRef, {
      ...current,
      questionsAnswered: newAnswered,
      questionsCorrect: newCorrect,
      accuracy: Math.round((newCorrect / newAnswered) * 100),
      byEvent: newByEvent,
      byDifficulty: newByDifficulty,
    });
  },

  // ── Heatmap: last N days ─────────────────────────────────────────────────

  async getActivityHeatmap(uid: string, days = 91): Promise<{ date: string; count: number }[]> {
    const result: { date: string; count: number }[] = [];
    const today = new Date();

    // Build a date→count map from sessions sub-collection
    const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
    const sessMap: Record<string, number> = {};
    sessionsSnap.forEach(d => {
      const s = d.data() as DaySession;
      sessMap[s.date] = s.answered;
    });

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

    const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
    const sessMap: Record<string, DaySession> = {};
    sessionsSnap.forEach(d => {
      const s = d.data() as DaySession;
      sessMap[s.date] = s;
    });

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
    return Object.entries(summary.byEvent).map(([event, stats]) => ({
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
      const stats = summary.byDifficulty[difficulty] ?? { answered: 0, correct: 0 };
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
    const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
    const sessMap: Record<string, DaySession> = {};
    sessionsSnap.forEach(d => {
      const s = d.data() as DaySession;
      sessMap[s.date] = s;
    });

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
    const sumRef = summaryRef(uid);
    const snap = await getDoc(sumRef);
    const data: UserSummary = snap.exists() ? (snap.data() as UserSummary) : { ...defaultSummary };
    const idx = data.favorites.indexOf(event);
    let newFavorites: string[];
    if (idx > -1) {
      newFavorites = data.favorites.filter(f => f !== event);
    } else {
      newFavorites = [...data.favorites, event];
    }
    await setDoc(sumRef, { ...data, favorites: newFavorites });
    return idx === -1; // true = now favorited
  },

  async isFavorite(uid: string, event: string): Promise<boolean> {
    const snap = await getDoc(summaryRef(uid));
    if (!snap.exists()) return false;
    return (snap.data() as UserSummary).favorites.includes(event);
  },

  // ── Bookmarks ────────────────────────────────────────────────────────────

  async getBookmarks(uid: string): Promise<BookmarkedQuestion[]> {
    const snap = await getDocs(bookmarksCol(uid));
    return snap.docs.map(d => d.data() as BookmarkedQuestion);
  },

  async toggleBookmark(uid: string, question: Question): Promise<boolean> {
    const ref = bookmarkRef(uid, question.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await deleteDoc(ref);
      return false; // removed
    } else {
      await setDoc(ref, { ...question, bookmarkedAt: serverTimestamp() });
      return true; // added
    }
  },

  async isBookmarked(uid: string, questionId: string): Promise<boolean> {
    const snap = await getDoc(bookmarkRef(uid, questionId));
    return snap.exists();
  },

  // ── Profile ──────────────────────────────────────────────────────────────

  async getProfile(uid: string): Promise<Record<string, string>> {
    const snap = await getDoc(doc(db, 'users', uid, 'profile', 'data'));
    return snap.exists() ? (snap.data() as Record<string, string>) : {};
  },

  async saveProfile(uid: string, profileData: Record<string, string>): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'profile', 'data'), profileData);
  },
};
