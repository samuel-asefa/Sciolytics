import type { CustomTest } from '../services/firestoreService';

/** Primary event for a test: explicit, else the most common question event. */
export function primaryEvent(t: CustomTest): string {
  if (t.event) return t.event;
  const counts: Record<string, number> = {};
  t.questions.forEach(q => { if (q.event && q.event !== 'General') counts[q.event] = (counts[q.event] ?? 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return 'General';
  return Object.keys(counts).length > 2 && top[1] < t.questions.length / 2 ? 'Mixed' : top[0];
}

export function primaryDivision(t: CustomTest): 'B' | 'C' | 'Both' {
  if (t.division) return t.division;
  const ds = new Set(t.questions.map(q => q.division));
  if (ds.size === 1) return [...ds][0];
  return 'Both';
}
