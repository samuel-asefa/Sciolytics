import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { firestoreService } from './firestoreService';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'team' | 'assignment' | 'event' | 'system';
  teamId?: string;
  teamName?: string;
  createdAt: Timestamp | null;
}

function notificationsCol(uid: string) {
  return collection(db, 'users', uid, 'notifications');
}

function notificationRef(uid: string, notifId: string) {
  return doc(db, 'users', uid, 'notifications', notifId);
}

function relativeTime(ts: Timestamp | null): string {
  if (!ts) return 'just now';
  const now = Date.now();
  const ms = ts.toMillis();
  const diff = now - ms;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export const notificationService = {
  /**
   * Subscribe to real-time notifications for a user.
   * Returns an unsubscribe function.
   */
  subscribe(uid: string, onChange: (notifs: AppNotification[]) => void): () => void {
    const q = query(notificationsCol(uid), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const notifs: AppNotification[] = snap.docs.map((d) => {
        const data = d.data();
        const ts = data.createdAt as Timestamp | null;
        return {
          id: d.id,
          title: data.title,
          message: data.message,
          time: relativeTime(ts),
          read: data.read ?? false,
          type: data.type ?? 'system',
          teamId: data.teamId,
          teamName: data.teamName,
          createdAt: ts,
        };
      });
      onChange(notifs);
    });
  },

  /** Mark a single notification as read */
  async markRead(uid: string, notifId: string): Promise<void> {
    await updateDoc(notificationRef(uid, notifId), { read: true });
  },

  /** Mark all notifications as read */
  async markAllRead(uid: string): Promise<void> {
    const snap = await getDocs(query(notificationsCol(uid), where('read', '==', false)));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  },

  /** Delete a notification */
  async deleteNotification(uid: string, notifId: string): Promise<void> {
    await deleteDoc(notificationRef(uid, notifId));
  },

  /**
   * Sync real notifications from team activity.
   * Checks each team the user belongs to for recent stream messages,
   * assignments, and events — creates notifications for new ones only.
   */
  async syncFromTeamActivity(uid: string): Promise<void> {
    try {
      const teams = await firestoreService.getUserTeams(uid);
      if (!teams.length) return;

      // Collect existing sourceIds to avoid duplicates
      const existingSnap = await getDocs(notificationsCol(uid));
      const existingSourceIds = new Set<string>(
        existingSnap.docs
          .map((d) => d.data().sourceId as string | undefined)
          .filter((s): s is string => !!s)
      );

      const batch = writeBatch(db);
      let added = 0;

      for (const team of teams) {
        // ── Stream messages (most recent 3, excluding own messages) ─────────
        try {
          const msgSnap = await getDocs(collection(db, 'teams', team.id, 'stream'));
          const messages = msgSnap.docs
            .map((d) => ({ ...d.data(), id: d.id }))
            .filter((m: any) => m.authorId !== uid)
            .sort((a: any, b: any) => {
              const tA = (a.timestamp as Timestamp)?.toMillis?.() ?? 0;
              const tB = (b.timestamp as Timestamp)?.toMillis?.() ?? 0;
              return tB - tA;
            })
            .slice(0, 3);

          for (const msg of messages as any[]) {
            const sourceId = `stream-${msg.id}`;
            if (existingSourceIds.has(sourceId)) continue;

            const newRef = doc(notificationsCol(uid));
            const content: string = msg.content ?? '';
            batch.set(newRef, {
              title: `New message in ${team.name}`,
              message: `${msg.authorName}: ${content.slice(0, 80)}${content.length > 80 ? '…' : ''}`,
              read: false,
              type: 'team',
              teamId: team.id,
              teamName: team.name,
              sourceId,
              createdAt: msg.timestamp ?? serverTimestamp(),
            });
            added++;
          }
        } catch (_) {
          // stream collection may not exist yet
        }

        // ── Assignments ──────────────────────────────────────────────────────
        try {
          const assignSnap = await getDocs(collection(db, 'teams', team.id, 'assignments'));
          const assignments = assignSnap.docs
            .map((d) => ({ ...d.data(), id: d.id }))
            .slice(0, 5);

          for (const a of assignments as any[]) {
            const sourceId = `assignment-${a.id}`;
            if (existingSourceIds.has(sourceId)) continue;

            const newRef = doc(notificationsCol(uid));
            batch.set(newRef, {
              title: `New assignment in ${team.name}`,
              message: `"${a.title}" — due ${a.dueDate}`,
              read: false,
              type: 'assignment',
              teamId: team.id,
              teamName: team.name,
              sourceId,
              createdAt: a.createdAt ?? serverTimestamp(),
            });
            added++;
          }
        } catch (_) {
          // assignments collection may not exist yet
        }

        // ── Upcoming events (next 30 days) ───────────────────────────────────
        try {
          const today = new Date().toISOString().slice(0, 10);
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 30);
          const futureDateStr = futureDate.toISOString().slice(0, 10);

          const eventsSnap = await getDocs(collection(db, 'teams', team.id, 'events'));
          const upcomingEvents = eventsSnap.docs
            .map((d) => ({ ...d.data(), id: d.id }))
            .filter((e: any) => e.date >= today && e.date <= futureDateStr)
            .slice(0, 3);

          for (const e of upcomingEvents as any[]) {
            const sourceId = `event-${e.id}`;
            if (existingSourceIds.has(sourceId)) continue;

            const newRef = doc(notificationsCol(uid));
            const desc: string = e.description ?? '';
            batch.set(newRef, {
              title: `Upcoming event: ${team.name}`,
              message: `"${e.title}" on ${e.date}${desc ? ` — ${desc.slice(0, 60)}` : ''}`,
              read: false,
              type: 'event',
              teamId: team.id,
              teamName: team.name,
              sourceId,
              createdAt: serverTimestamp(),
            });
            added++;
          }
        } catch (_) {
          // events collection may not exist yet
        }
      }

      if (added > 0) {
        await batch.commit();
      }
    } catch (err) {
      console.error('notificationService.syncFromTeamActivity error:', err);
    }
  },

  /** Create a one-off system notification for a user */
  async createSystemNotification(uid: string, title: string, message: string): Promise<void> {
    await addDoc(notificationsCol(uid), {
      title,
      message,
      read: false,
      type: 'system',
      createdAt: serverTimestamp(),
    });
  },
};
