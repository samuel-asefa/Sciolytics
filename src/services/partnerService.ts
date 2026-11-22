/**
 * Partner mode (issue #12): two (or three) competitors take one test together on
 * a shared answer sheet, like a real paired Science Olympiad event.
 *
 * partnerSessions/{CODE}
 *   hostId, title, event, questionIds[], timeLimitSec, status: lobby|active|finished
 *   participants.{uid}: { name, photo, joinedAt, current }
 *   answers.{index}:   { answer, by, at }
 *   flags.{index}:     uid | null      ("partner, check this one")
 *   results:           { index: { isCorrect, feedback? } }
 */
import {
  doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, deleteField, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PartnerParticipant { name: string; photo?: string | null; joinedAt: number; current: number }
export interface PartnerAnswer { answer: string; by: string; at: number }

export interface PartnerSession {
  code: string;
  hostId: string;
  title: string;
  event: string;
  questionIds: string[];
  timeLimitSec: number | null;
  status: 'lobby' | 'active' | 'finished';
  participants: Record<string, PartnerParticipant>;
  answers?: Record<string, PartnerAnswer>;
  flags?: Record<string, string | null>;
  results?: Record<string, { isCorrect: boolean; feedback?: string }>;
  startedAt?: Timestamp | null;
  finishedBy?: string;
  createdAt?: Timestamp | null;
}

export const MAX_PARTNERS = 3;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeCode(len = 6) {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, n => ALPHABET[n % ALPHABET.length]).join('');
}

export function normalizeCode(raw: string) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

const ref = (code: string) => doc(db, 'partnerSessions', code);

interface Me { uid: string; displayName: string | null; email: string | null; photoURL: string | null }

const nameOf = (me: Me) => me.displayName || me.email?.split('@')[0] || 'Partner';

export const partnerService = {
  async create(me: Me, data: { title: string; event: string; questionIds: string[]; timeLimitSec: number | null }): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode();
      const existing = await getDoc(ref(code)).catch(() => null);
      if (existing?.exists()) continue;
      await setDoc(ref(code), {
        code,
        hostId: me.uid,
        title: data.title,
        event: data.event,
        questionIds: data.questionIds,
        timeLimitSec: data.timeLimitSec,
        status: 'lobby',
        participants: { [me.uid]: { name: nameOf(me), photo: me.photoURL ?? null, joinedAt: Date.now(), current: 0 } },
        answers: {},
        flags: {},
        createdAt: serverTimestamp(),
      });
      return code;
    }
    throw new Error('Could not allocate a session code');
  },

  subscribe(code: string, cb: (s: PartnerSession | null) => void, onError: (e: Error) => void) {
    return onSnapshot(ref(code), snap => cb(snap.exists() ? (snap.data() as PartnerSession) : null), onError);
  },

  async join(code: string, me: Me) {
    await updateDoc(ref(code), {
      [`participants.${me.uid}`]: { name: nameOf(me), photo: me.photoURL ?? null, joinedAt: Date.now(), current: 0 },
    });
  },

  async leave(code: string, uid: string) {
    await updateDoc(ref(code), { [`participants.${uid}`]: deleteField() });
  },

  async start(code: string) {
    await updateDoc(ref(code), { status: 'active', startedAt: serverTimestamp() });
  },

  async setCurrent(code: string, uid: string, index: number) {
    await updateDoc(ref(code), { [`participants.${uid}.current`]: index });
  },

  async answer(code: string, uid: string, index: number, answer: string) {
    await updateDoc(ref(code), {
      [`answers.${index}`]: answer ? { answer, by: uid, at: Date.now() } : deleteField(),
    });
  },

  async flag(code: string, uid: string, index: number, on: boolean) {
    await updateDoc(ref(code), { [`flags.${index}`]: on ? uid : deleteField() });
  },

  async finish(code: string, uid: string, results: PartnerSession['results']) {
    await updateDoc(ref(code), { status: 'finished', results, finishedBy: uid });
  },
};
