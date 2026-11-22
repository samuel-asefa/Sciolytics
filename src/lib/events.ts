/**
 * Shared metadata for the 2026 Science Olympiad event list: category, colour and
 * a lucide icon name. Kept separate from the 700 KB question bank so light pages
 * (landing, nav, command palette) can import it without pulling the bank in.
 */
import {
  HeartPulse, Telescope, Hammer, Leaf, FlaskConical, Zap, KeyRound, Box, Dna, Bug,
  Mountain, Car, Lightbulb, Fingerprint, Wind, Puzzle, Plane, Microscope, Satellite,
  Gem, Thermometer, Droplets, Feather, Code2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type EventCategory =
  | 'Life, Personal & Social Science'
  | 'Earth & Space Science'
  | 'Physical Science & Chemistry'
  | 'Technology & Engineering Design'
  | 'Inquiry & Nature of Science'
  | 'Featured Trial Event';

export interface EventMeta {
  name: string;
  slug: string;
  category: EventCategory;
  kind: 'Study' | 'Lab' | 'Build' | 'Hybrid';
  icon: LucideIcon;
  color: string;
  /** id in wikiData, when a wiki page exists */
  wikiId?: string;
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  'Life, Personal & Social Science': '#10b981',
  'Earth & Space Science': '#6366f1',
  'Physical Science & Chemistry': '#f59e0b',
  'Technology & Engineering Design': '#ef4444',
  'Inquiry & Nature of Science': '#0ea5e9',
  'Featured Trial Event': '#a855f7',
};

export const CATEGORY_SHORT: Record<EventCategory, string> = {
  'Life, Personal & Social Science': 'Life Science',
  'Earth & Space Science': 'Earth & Space',
  'Physical Science & Chemistry': 'Physical & Chem',
  'Technology & Engineering Design': 'Engineering',
  'Inquiry & Nature of Science': 'Inquiry',
  'Featured Trial Event': 'Trial',
};

const E = (
  name: string,
  category: EventCategory,
  kind: EventMeta['kind'],
  icon: LucideIcon,
  wikiId?: string
): EventMeta => ({
  name,
  slug: name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  category,
  kind,
  icon,
  color: CATEGORY_COLORS[category],
  wikiId,
});

export const EVENTS: EventMeta[] = [
  E('Anatomy & Physiology', 'Life, Personal & Social Science', 'Study', HeartPulse, 'anatomy'),
  E('Botany', 'Life, Personal & Social Science', 'Study', Leaf, 'botany'),
  E('Designer Genes', 'Life, Personal & Social Science', 'Study', Dna, 'designer-genes'),
  E('Disease Detectives', 'Life, Personal & Social Science', 'Study', Bug, 'disease-detectives'),
  E('Water Quality', 'Life, Personal & Social Science', 'Hybrid', Droplets, 'water-quality'),
  E('Astronomy', 'Earth & Space Science', 'Study', Telescope, 'astronomy'),
  E('Dynamic Planet', 'Earth & Space Science', 'Study', Mountain, 'dynamic-planet'),
  E('Remote Sensing', 'Earth & Space Science', 'Study', Satellite, 'remote-sensing'),
  E('Rocks and Minerals', 'Earth & Space Science', 'Study', Gem, 'rocks-and-minerals'),
  E('Chemistry Lab', 'Physical Science & Chemistry', 'Lab', FlaskConical, 'chemistry-lab'),
  E('Circuit Lab', 'Physical Science & Chemistry', 'Lab', Zap, 'circuit-lab'),
  E('Forensics', 'Physical Science & Chemistry', 'Lab', Fingerprint, 'forensics'),
  E('Hovercraft', 'Physical Science & Chemistry', 'Hybrid', Wind, 'hovercraft'),
  E('Protein Modeling', 'Physical Science & Chemistry', 'Hybrid', Microscope, 'protein-modeling'),
  E('Thermodynamics', 'Physical Science & Chemistry', 'Hybrid', Thermometer, 'thermodynamics'),
  E('Boomilever', 'Technology & Engineering Design', 'Build', Hammer, 'boomilever'),
  E('Electric Vehicle', 'Technology & Engineering Design', 'Build', Car, 'electric-vehicle'),
  E('Mission Possible', 'Technology & Engineering Design', 'Build', Lightbulb, 'mission-possible'),
  E('Wright Stuff', 'Technology & Engineering Design', 'Build', Plane, 'wright-stuff'),
  E('Codebusters', 'Inquiry & Nature of Science', 'Study', KeyRound, 'codebusters'),
  E('Engineering CAD', 'Inquiry & Nature of Science', 'Build', Box, 'engineering-cad'),
  E('Experimental Design', 'Inquiry & Nature of Science', 'Lab', Puzzle, 'experimental-design'),
  E('Ping Pong Parachute', 'Inquiry & Nature of Science', 'Build', Feather, 'ping-pong-parachute'),
  E('Code Craze', 'Featured Trial Event', 'Study', Code2, 'code-craze'),
];

const byName = new Map(EVENTS.map(e => [e.name, e]));

export function eventMeta(name: string): EventMeta {
  return byName.get(name) ?? {
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: 'Inquiry & Nature of Science',
    kind: 'Study',
    icon: Puzzle,
    color: '#64748b',
  };
}

/** Events that have written-test content (worth flashcards / cheat sheets). */
export const STUDY_EVENTS = EVENTS.filter(e => e.kind !== 'Build');
