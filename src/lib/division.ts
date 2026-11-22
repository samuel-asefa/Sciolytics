/**
 * Work out which Science Olympiad division a competitor is in from data the
 * app already has, so filters can default to it instead of "Both".
 *
 * Priority: explicit choice > team membership > graduation year.
 */
import { firestoreService } from '../services/firestoreService';

export type Division = 'B' | 'C';
export type DivisionSource = 'saved' | 'team' | 'gradYear';

export interface DivisionGuess {
  division: Division;
  source: DivisionSource;
}

const LS_KEY = (uid: string) => `sciolytics:division:${uid}`;

/** Grade (6–12) for a graduation year, using a July school-year rollover. */
export function gradeFromGradYear(gradYear: number, now = new Date()): number {
  const schoolYearEnd = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  return 12 - (gradYear - schoolYearEnd);
}

/** Div B = grades 6–9, Div C = 9–12. 9th graders can be either, so they're left undecided. */
export function divisionFromGradYear(raw: string | undefined): Division | null {
  const year = parseInt(String(raw ?? '').trim(), 10);
  if (!Number.isFinite(year) || year < 2000 || year > 2100) return null;
  const grade = gradeFromGradYear(year);
  if (grade >= 6 && grade <= 8) return 'B';
  if (grade >= 10 && grade <= 12) return 'C';
  return null;
}

function isDivision(v: unknown): v is Division {
  return v === 'B' || v === 'C';
}

export function readSavedDivision(uid: string): Division | null {
  try {
    const v = localStorage.getItem(LS_KEY(uid));
    return isDivision(v) ? v : null;
  } catch {
    return null;
  }
}

/** Remember an explicit choice locally and on the profile (syncs across devices). */
export async function saveDivision(uid: string, division: Division): Promise<void> {
  try { localStorage.setItem(LS_KEY(uid), division); } catch { /* storage unavailable */ }
  await firestoreService.saveProfile(uid, { division });
}

export async function resolveDivision(uid: string): Promise<DivisionGuess | null> {
  const local = readSavedDivision(uid);
  const [profile, teams] = await Promise.all([
    firestoreService.getProfile(uid).catch(() => ({} as Record<string, string>)),
    firestoreService.getUserTeams(uid).catch(() => []),
  ]);

  if (isDivision(profile.division)) {
    try { localStorage.setItem(LS_KEY(uid), profile.division); } catch { /* ignore */ }
    return { division: profile.division, source: 'saved' };
  }
  if (local) return { division: local, source: 'saved' };

  const teamDivisions = new Set(teams.map(t => String(t.division).toUpperCase()).filter(isDivision));
  if (teamDivisions.size === 1) return { division: [...teamDivisions][0] as Division, source: 'team' };

  const fromYear = divisionFromGradYear(profile.graduationYear);
  if (fromYear) return { division: fromYear, source: 'gradYear' };

  return null;
}
