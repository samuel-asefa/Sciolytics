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

export interface UserSummary {
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  favorites: string[];
  byEvent: Record<string, { answered: number; correct: number }>;
  byDifficulty: Record<string, { answered: number; correct: number }>;
}

export interface DaySession {
  date: string;
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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
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

export const firestoreService = {
  async getProgress(uid: string): Promise<UserSummary> {
    const snap = await getDoc(summaryRef(uid));
    return snap.exists() ? (snap.data() as UserSummary) : { ...defaultSummary };
  },

  async getDailyStats(uid: string, date?: string): Promise<DaySession> {
    const d = date ?? todayStr();
    const snap = await getDoc(sessionRef(uid, d));
    return snap.exists() ? (snap.data() as DaySession) : { date: d, answered: 0, correct: 0, accuracy: 0 };
  },

  async saveAnswer(uid: string, question: Question, isCorrect: boolean): Promise<void> {
    const date = todayStr();

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
      const s = sSnap.data() as DaySession;
      const newAnswered = s.answered + 1;
      const newCorrect = s.correct + (isCorrect ? 1 : 0);
      await updateDoc(sRef, {
        answered: newAnswered,
        correct: newCorrect,
        accuracy: Math.round((newCorrect / newAnswered) * 100),
      });
    } else {
      await setDoc(sRef, { date, answered: 1, correct: isCorrect ? 1 : 0, accuracy: isCorrect ? 100 : 0 });
    }

    const sumRef = summaryRef(uid);
    const sumSnap = await getDoc(sumRef);
    const currentData = sumSnap.exists() ? sumSnap.data() : {};
    const current: UserSummary = {
      ...defaultSummary,
      ...currentData,
      byEvent: (currentData as any).byEvent || {},
      byDifficulty: (currentData as any).byDifficulty || {},
      favorites: (currentData as any).favorites || [],
    };

    const newAnswered = current.questionsAnswered + 1;
    const newCorrect = current.questionsCorrect + (isCorrect ? 1 : 0);
    const eventStats = current.byEvent[question.event] ?? { answered: 0, correct: 0 };
    const diffStats = current.byDifficulty[question.difficulty] ?? { answered: 0, correct: 0 };

    await setDoc(sumRef, {
      ...current,
      questionsAnswered: newAnswered,
      questionsCorrect: newCorrect,
      accuracy: Math.round((newCorrect / newAnswered) * 100),
      byEvent: {
        ...current.byEvent,
        [question.event]: { answered: eventStats.answered + 1, correct: eventStats.correct + (isCorrect ? 1 : 0) },
      },
      byDifficulty: {
        ...current.byDifficulty,
        [question.difficulty]: { answered: diffStats.answered + 1, correct: diffStats.correct + (isCorrect ? 1 : 0) },
      },
    });
  },

  async getActivityHeatmap(uid: string, days = 91): Promise<{ date: string; count: number }[]> {
    const today = new Date();
    const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
    const sessMap: Record<string, number> = {};
    sessionsSnap.forEach(d => { const s = d.data() as DaySession; sessMap[s.date] = s.answered; });

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().slice(0, 10);
      return { date: dateStr, count: sessMap[dateStr] ?? 0 };
    });
  },

  async getWeeklyActivity(uid: string): Promise<{ name: string; questions: number; correct: number }[]> {
    return this.getChartActivity(uid, 7);
  },

  async getChartActivity(uid: string, days: 7 | 30 | 90 = 7): Promise<{ name: string; questions: number; correct: number }[]> {
    const today = new Date();
    const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
    const sessMap: Record<string, DaySession> = {};
    sessionsSnap.forEach(d => { const s = d.data() as DaySession; sessMap[s.date] = s; });

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const sess = sessMap[dateStr];
      let label: string;
      if (days === 7) {
        label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      } else if (days === 30) {
        label = `${d.getMonth() + 1}/${d.getDate()}`;
      } else {
        label = i % 10 === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : '';
      }
      return { name: label, questions: sess?.answered ?? 0, correct: sess?.correct ?? 0 };
    });
  },

  async getAnsweredQuestionIds(uid: string): Promise<Set<string>> {
    const snap = await getDocs(collection(db, 'users', uid, 'answers'));
    const ids = new Set<string>();
    snap.forEach(doc => {
      const qid = doc.data().questionId;
      if (qid) ids.add(qid);
    });
    return ids;
  },

  async getEventBreakdown(uid: string): Promise<{ event: string; answered: number; correct: number; accuracy: number }[]> {
    const summary = await this.getProgress(uid);
    return Object.entries(summary.byEvent)
      .map(([event, stats]) => ({
        event,
        answered: stats.answered,
        correct: stats.correct,
        accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
      }))
      .sort((a, b) => b.answered - a.answered);
  },

  async getDifficultyBreakdown(uid: string): Promise<{ difficulty: string; answered: number; correct: number; accuracy: number }[]> {
    const summary = await this.getProgress(uid);
    return ['Easy', 'Medium', 'Hard'].map(difficulty => {
      const stats = summary.byDifficulty[difficulty] ?? { answered: 0, correct: 0 };
      return {
        difficulty,
        answered: stats.answered,
        correct: stats.correct,
        accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
      };
    });
  },

  async getDailyAccuracyHistory(uid: string, days = 30): Promise<{ date: string; accuracy: number; answered: number }[]> {
    const today = new Date();
    const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
    const sessMap: Record<string, DaySession> = {};
    sessionsSnap.forEach(d => { const s = d.data() as DaySession; sessMap[s.date] = s; });

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const sess = sessMap[dateStr];
      if (sess && sess.answered > 0) result.push({ date: dateStr, accuracy: sess.accuracy, answered: sess.answered });
    }
    return result;
  },

  async toggleFavorite(uid: string, event: string): Promise<boolean> {
    const sumRef = summaryRef(uid);
    const snap = await getDoc(sumRef);
    const currentData = snap.exists() ? snap.data() : {};
    const data: UserSummary = { ...defaultSummary, ...(currentData as any), favorites: (currentData as any).favorites || [] };
    const idx = data.favorites.indexOf(event);
    const newFavorites = idx > -1 ? data.favorites.filter(f => f !== event) : [...data.favorites, event];
    await setDoc(sumRef, { ...data, favorites: newFavorites });
    return idx === -1;
  },

  async isFavorite(uid: string, event: string): Promise<boolean> {
    const snap = await getDoc(summaryRef(uid));
    return snap.exists() ? ((snap.data() as UserSummary).favorites ?? []).includes(event) : false;
  },

  async getBookmarks(uid: string): Promise<BookmarkedQuestion[]> {
    const snap = await getDocs(bookmarksCol(uid));
    return snap.docs.map(d => d.data() as BookmarkedQuestion);
  },

  async toggleBookmark(uid: string, question: Question): Promise<boolean> {
    const ref = bookmarkRef(uid, question.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await deleteDoc(ref);
      return false;
    }
    await setDoc(ref, { ...question, bookmarkedAt: serverTimestamp() });
    return true;
  },

  async isBookmarked(uid: string, questionId: string): Promise<boolean> {
    return (await getDoc(bookmarkRef(uid, questionId))).exists();
  },

  async getProfile(uid: string): Promise<Record<string, string>> {
    const snap = await getDoc(doc(db, 'users', uid, 'profile', 'data'));
    return snap.exists() ? (snap.data() as Record<string, string>) : {};
  },

  async saveProfile(uid: string, profileData: Record<string, string>): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'profile', 'data'), profileData);
  },
};
