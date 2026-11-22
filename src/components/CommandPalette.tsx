import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, CornerDownLeft, LayoutDashboard, PenTool, BarChart3, Users, Globe, PlusSquare, BookOpen,
  Layers, FileText, Bookmark, Handshake, User, Settings, HelpCircle, Info, Mail, HeartHandshake, Moon,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { EVENTS } from '../lib/events';

interface Command {
  id: string;
  label: string;
  group: 'Pages' | 'Practice' | 'Study' | 'Actions';
  icon: LucideIcon;
  hint?: string;
  color?: string;
  keywords?: string;
  run: () => void;
  requiresAuth?: boolean;
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toggleDark, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (to: string, state?: unknown) => () => navigate(to, state ? { state } : undefined);
    const pages: Command[] = [
      { id: 'p-dash', label: 'Dashboard', group: 'Pages', icon: LayoutDashboard, run: go('/dashboard'), requiresAuth: true },
      { id: 'p-practice', label: 'Practice', group: 'Pages', icon: PenTool, run: go('/practice'), requiresAuth: true, keywords: 'test quiz' },
      { id: 'p-analytics', label: 'Analytics', group: 'Pages', icon: BarChart3, run: go('/analytics'), requiresAuth: true, keywords: 'stats progress' },
      { id: 'p-teams', label: 'Teams', group: 'Pages', icon: Users, run: go('/teams'), requiresAuth: true, keywords: 'roster club' },
      { id: 'p-community', label: 'Community tests', group: 'Pages', icon: Globe, run: go('/community'), requiresAuth: true },
      { id: 'p-create', label: 'Create a test', group: 'Pages', icon: PlusSquare, run: go('/create'), requiresAuth: true, keywords: 'editor import ai' },
      { id: 'p-wiki', label: 'Event Wiki', group: 'Pages', icon: BookOpen, run: go('/wiki'), keywords: 'rules notes' },
      { id: 'p-flash', label: 'Flashcards', group: 'Pages', icon: Layers, run: go('/flashcards'), requiresAuth: true, keywords: 'review memorize' },
      { id: 'p-cheat', label: 'Cheat Sheets', group: 'Pages', icon: FileText, run: go('/cheatsheets'), requiresAuth: true, keywords: 'notes binder print' },
      { id: 'p-bookmarks', label: 'Bookmarks', group: 'Pages', icon: Bookmark, run: go('/bookmarks'), requiresAuth: true, keywords: 'saved' },
      { id: 'p-partner', label: 'Partner Mode', group: 'Pages', icon: Handshake, run: go('/partner'), requiresAuth: true, keywords: 'together live' },
      { id: 'p-profile', label: 'Profile', group: 'Pages', icon: User, run: go('/profile'), requiresAuth: true },
      { id: 'p-settings', label: 'Settings', group: 'Pages', icon: Settings, run: go('/settings'), requiresAuth: true, keywords: 'theme color appearance' },
      { id: 'p-help', label: 'Help & FAQ', group: 'Pages', icon: HelpCircle, run: go('/help') },
      { id: 'p-about', label: 'About Sciolytics', group: 'Pages', icon: Info, run: go('/about') },
      { id: 'p-contact', label: 'Contact', group: 'Pages', icon: Mail, run: go('/contact') },
      { id: 'p-join', label: 'Join the team', group: 'Pages', icon: HeartHandshake, run: go('/join') },
    ];

    const practice: Command[] = EVENTS.map(e => ({
      id: `e-${e.slug}`,
      label: e.name,
      group: 'Practice' as const,
      icon: e.icon,
      color: e.color,
      hint: 'Practice',
      keywords: e.category,
      requiresAuth: true,
      run: go('/practice', { selectedEvent: e.name }),
    }));

    const study: Command[] = EVENTS.flatMap(e => [
      ...(e.wikiId ? [{
        id: `w-${e.slug}`,
        label: `${e.name} wiki`,
        group: 'Study' as const,
        icon: BookOpen,
        color: e.color,
        hint: 'Wiki',
        run: go(`/wiki/${e.wikiId}`),
      }] : []),
      ...(e.kind !== 'Build' ? [{
        id: `f-${e.slug}`,
        label: `${e.name} flashcards`,
        group: 'Study' as const,
        icon: Layers,
        color: e.color,
        hint: 'Flashcards',
        requiresAuth: true,
        run: go(`/flashcards/${e.slug}`),
      }] : []),
    ]);

    const actions: Command[] = [
      { id: 'a-dark', label: isDark ? 'Switch to light mode' : 'Switch to dark mode', group: 'Actions', icon: Moon, run: toggleDark, keywords: 'theme dark light' },
      { id: 'a-new', label: 'New custom test', group: 'Actions', icon: Sparkles, run: go('/create', { createNew: true }), requiresAuth: true },
      { id: 'a-partner', label: 'Start a partner session', group: 'Actions', icon: Handshake, run: go('/partner'), requiresAuth: true },
    ];

    return [...actions, ...pages, ...practice, ...study].filter(c => currentUser || !c.requiresAuth);
  }, [navigate, currentUser, toggleDark, isDark]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default view: actions + pages + a handful of events
      return commands.filter(c => c.group === 'Actions' || c.group === 'Pages').slice(0, 14);
    }
    const tokens = q.split(/\s+/);
    return commands
      .map(c => {
        const hay = `${c.label} ${c.keywords ?? ''} ${c.hint ?? ''}`.toLowerCase();
        if (!tokens.every(t => hay.includes(t))) return null;
        const label = c.label.toLowerCase();
        let score = 0;
        if (label.startsWith(q)) score += 10;
        if (label.includes(q)) score += 4;
        if (c.group === 'Pages') score += 2;
        if (c.group === 'Practice') score += 1;
        return { c, score };
      })
      .filter((x): x is { c: Command; score: number } => !!x)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(x => x.c);
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const run = (c: Command) => {
    onClose();
    c.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) run(results[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  let lastGroup = '';

  return (
    <div className="ui-modal-backdrop" onMouseDown={onClose}>
      <div className="ui-modal cmdk" role="dialog" aria-label="Command palette" onMouseDown={e => e.stopPropagation()}>
        <div className="cmdk-input-row">
          <Search size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search events, pages and actions…"
            aria-label="Search"
            aria-controls="cmdk-list"
            aria-activedescendant={results[active] ? `cmdk-${results[active].id}` : undefined}
          />
          <kbd className="ui-kbd">esc</kbd>
        </div>
        <div className="cmdk-list" id="cmdk-list" ref={listRef} role="listbox">
          {results.length === 0 && <div className="cmdk-empty">No results for “{query}”</div>}
          {results.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return (
              <div key={c.id}>
                {header && <div className="cmdk-group">{header}</div>}
                <button
                  id={`cmdk-${c.id}`}
                  data-idx={i}
                  role="option"
                  aria-selected={i === active}
                  className={`cmdk-item${i === active ? ' is-active' : ''}`}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(c)}
                >
                  <span className="cmdk-icon" style={c.color ? { color: c.color, background: `color-mix(in srgb, ${c.color} 12%, transparent)` } : undefined}>
                    <c.icon size={16} />
                  </span>
                  <span className="cmdk-label">{c.label}</span>
                  {c.hint && <span className="cmdk-hint">{c.hint}</span>}
                  {i === active && <CornerDownLeft size={14} className="cmdk-enter" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="cmdk-foot">
          <span><kbd className="ui-kbd">↑</kbd><kbd className="ui-kbd">↓</kbd> navigate</span>
          <span><kbd className="ui-kbd">↵</kbd> open</span>
          <span className="cmdk-foot-tip">Tip: press <kbd className="ui-kbd">/</kbd> anywhere</span>
        </div>
      </div>
    </div>
  );
}
