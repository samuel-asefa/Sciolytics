/**
 * Study tools persistence: flashcard scheduling, cheat sheets and wiki notes.
 * Everything lives under users/{uid}/… which the existing Firestore rules allow
 * (owner read/write). A localStorage mirror keeps things instant and offline-safe.
 */
import {
  doc, getDoc, setDoc, collection, getDocs, deleteDoc, addDoc, updateDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── Flashcards ───────────────────────────────────────────────────────────────

export interface CardState {
  /** Leitner-style box 0–6 */
  box: number;
  /** epoch ms when the card is next due */
  due: number;
  reviews: number;
  lapses: number;
  /** flagged from a test result ("review my misses") */
  missed?: boolean;
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

const DAY = 86_400_000;
const BOX_DAYS = [0, 1, 3, 7, 16, 35, 90];

export function schedule(prev: CardState | undefined, rating: Rating, now = Date.now()): CardState {
  const s: CardState = prev ? { ...prev } : { box: 0, due: now, reviews: 0, lapses: 0 };
  s.reviews += 1;
  switch (rating) {
    case 'again':
      s.box = 0;
      s.lapses += 1;
      s.due = now + 10 * 60_000;
      break;
    case 'hard':
      s.box = Math.max(1, s.box);
      s.due = now + Math.max(0.5, BOX_DAYS[s.box] * 0.5) * DAY;
      break;
    case 'good':
      s.box = Math.min(6, s.box + 1);
      s.due = now + BOX_DAYS[s.box] * DAY;
      break;
    case 'easy':
      s.box = Math.min(6, s.box + 2);
      s.due = now + BOX_DAYS[s.box] * 1.4 * DAY;
      s.missed = false;
      break;
  }
  if (s.box >= 3) s.missed = false;
  return s;
}

/** Human label for what each rating would schedule ("10m", "3d"…). */
export function previewInterval(prev: CardState | undefined, rating: Rating): string {
  const now = Date.now();
  const ms = schedule(prev, rating, now).due - now;
  if (ms < 60 * 60_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < DAY) return `${Math.round(ms / 3_600_000)}h`;
  const d = ms / DAY;
  if (d < 30) return `${Math.round(d)}d`;
  return `${Math.round(d / 30)}mo`;
}

const flashDoc = (uid: string) => doc(db, 'users', uid, 'study', 'flashcards');
const lsKey = (uid: string, k: string) => `sciolytics:${k}:${uid}`;

let cardCache: { uid: string; cards: Record<string, CardState> } | null = null;
let pending: Record<string, CardState> = {};
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function readLS<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function writeLS(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / private mode */ }
}

async function flush(uid: string) {
  if (!Object.keys(pending).length) return;
  const batch = pending;
  pending = {};
  try {
    await setDoc(flashDoc(uid), { cards: batch, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error('Flashcard sync failed (kept locally):', err);
    pending = { ...batch, ...pending };
  }
}

export const studyService = {
  async getCards(uid: string): Promise<Record<string, CardState>> {
    if (cardCache?.uid === uid) return cardCache.cards;
    const local = readLS<Record<string, CardState>>(lsKey(uid, 'cards'), {});
    let remote: Record<string, CardState> = {};
    try {
      const snap = await getDoc(flashDoc(uid));
      remote = (snap.exists() ? (snap.data().cards as Record<string, CardState>) : {}) ?? {};
    } catch (err) {
      console.warn('Using local flashcard state:', err);
    }
    // Merge: whichever has more reviews wins per card
    const cards: Record<string, CardState> = { ...remote };
    for (const [id, s] of Object.entries(local)) {
      if (!cards[id] || s.reviews > cards[id].reviews) cards[id] = s;
    }
    cardCache = { uid, cards };
    writeLS(lsKey(uid, 'cards'), cards);
    return cards;
  },

  rate(uid: string, id: string, rating: Rating): CardState {
    const cards = cardCache?.uid === uid ? cardCache.cards : readLS<Record<string, CardState>>(lsKey(uid, 'cards'), {});
    const next = schedule(cards[id], rating);
    cards[id] = next;
    cardCache = { uid, cards };
    writeLS(lsKey(uid, 'cards'), cards);
    pending[id] = next;
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => flush(uid), 1500);
    return next;
  },

  /** Queue question ids for review (e.g. misses from a test). */
  async markMissed(uid: string, ids: string[]) {
    const cards = await this.getCards(uid);
    const now = Date.now();
    for (const id of ids) {
      const prev = cards[id];
      const s: CardState = prev ? { ...prev, due: Math.min(prev.due, now), missed: true, box: Math.min(prev.box, 1) } : { box: 0, due: now, reviews: 0, lapses: 0, missed: true };
      cards[id] = s;
      pending[id] = s;
    }
    writeLS(lsKey(uid, 'cards'), cards);
    await flush(uid);
  },

  flushNow(uid: string) {
    if (flushTimer) clearTimeout(flushTimer);
    return flush(uid);
  },
};

// ─── Cheat sheets ─────────────────────────────────────────────────────────────

export interface Cheatsheet {
  id: string;
  title: string;
  event: string;
  content: string;
  columns: number;
  fontSize: number;
  /** "sheet" = one 8.5×11 page (two-sided), "binder" = unlimited pages */
  format: 'sheet' | 'binder';
  updatedAt?: Timestamp | ReturnType<typeof serverTimestamp> | null;
}

const sheetsCol = (uid: string) => collection(db, 'users', uid, 'cheatsheets');

export const cheatsheetService = {
  async list(uid: string): Promise<Cheatsheet[]> {
    const snap = await getDocs(sheetsCol(uid));
    return snap.docs
      .map(d => ({ ...(d.data() as Omit<Cheatsheet, 'id'>), id: d.id }))
      .sort((a, b) => ((b.updatedAt as Timestamp)?.toMillis?.() ?? 0) - ((a.updatedAt as Timestamp)?.toMillis?.() ?? 0));
  },

  async get(uid: string, id: string): Promise<Cheatsheet | null> {
    const snap = await getDoc(doc(db, 'users', uid, 'cheatsheets', id));
    return snap.exists() ? { ...(snap.data() as Omit<Cheatsheet, 'id'>), id: snap.id } : null;
  },

  async create(uid: string, data: Omit<Cheatsheet, 'id' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(sheetsCol(uid), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async update(uid: string, id: string, data: Partial<Omit<Cheatsheet, 'id'>>) {
    await updateDoc(doc(db, 'users', uid, 'cheatsheets', id), { ...data, updatedAt: serverTimestamp() });
  },

  async remove(uid: string, id: string) {
    await deleteDoc(doc(db, 'users', uid, 'cheatsheets', id));
  },
};

// ─── Wiki annotations ─────────────────────────────────────────────────────────

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface WikiHighlight {
  id: string;
  sectionId: string;
  text: string;
  note: string;
  color: HighlightColor;
  createdAt: number;
}

const notesDoc = (uid: string, eventId: string) => doc(db, 'users', uid, 'wikiNotes', eventId);

export const wikiNotesService = {
  async get(uid: string, eventId: string): Promise<WikiHighlight[]> {
    const local = readLS<WikiHighlight[]>(lsKey(uid, `wiki:${eventId}`), []);
    try {
      const snap = await getDoc(notesDoc(uid, eventId));
      const remote = snap.exists() ? ((snap.data().highlights as WikiHighlight[]) ?? []) : [];
      const merged = remote.length >= local.length ? remote : local;
      writeLS(lsKey(uid, `wiki:${eventId}`), merged);
      return merged;
    } catch {
      return local;
    }
  },

  async save(uid: string, eventId: string, highlights: WikiHighlight[]) {
    writeLS(lsKey(uid, `wiki:${eventId}`), highlights);
    await setDoc(notesDoc(uid, eventId), { highlights, updatedAt: serverTimestamp() });
  },
};
