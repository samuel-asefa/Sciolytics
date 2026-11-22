import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Highlighter, StickyNote, Trash2, X, PenTool, Layers, FileText, LogIn, Clock, Users, ShieldCheck, Package,
} from 'lucide-react';
import { wikiData, type WikiInfobox, type WikiContentBlock } from '../data/wikiData';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { wikiNotesService, cheatsheetService, type WikiHighlight, type HighlightColor } from '../services/studyService';
import { EVENTS } from '../lib/events';
import './EventWiki.css';

const COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'pink'];

// ─── Highlight rendering ──────────────────────────────────────────────────────

function applyHighlights(text: string, hls: WikiHighlight[], onOpen: (h: WikiHighlight, el: HTMLElement) => void): React.ReactNode {
  if (!hls.length || !text) return text;
  // Find non-overlapping matches, earliest first
  const ranges: { start: number; end: number; h: WikiHighlight }[] = [];
  for (const h of hls) {
    const idx = text.indexOf(h.text);
    if (idx < 0) continue;
    const end = idx + h.text.length;
    if (ranges.some(r => idx < r.end && end > r.start)) continue;
    ranges.push({ start: idx, end, h });
  }
  if (!ranges.length) return text;
  ranges.sort((a, b) => a.start - b.start);
  const out: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    if (r.start > cursor) out.push(text.slice(cursor, r.start));
    out.push(
      <mark
        key={`${r.h.id}-${i}`}
        className={`wiki-hl hl-${r.h.color}${r.h.note ? ' has-note' : ''}`}
        data-hl={r.h.id}
        tabIndex={0}
        onClick={e => { e.stopPropagation(); onOpen(r.h, e.currentTarget); }}
        onKeyDown={e => { if (e.key === 'Enter') onOpen(r.h, e.currentTarget); }}
        title={r.h.note || 'Highlight: click to add a note'}
      >
        {text.slice(r.start, r.end)}
        {r.h.note && <StickyNote size={11} className="wiki-hl-note-icon" />}
      </mark>
    );
    cursor = r.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

// ─── Infobox ──────────────────────────────────────────────────────────────────

function InfoboxRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="infobox-row">
      <td className="infobox-label">{label}</td>
      <td className="infobox-value">{children}</td>
    </tr>
  );
}

function Infobox({ infobox }: { infobox: WikiInfobox }) {
  return (
    <aside className="wiki-infobox">
      <div className="infobox-header">Event info</div>
      <table className="infobox-table">
        <tbody>
          {infobox.type && <InfoboxRow label="Type">{infobox.type}</InfoboxRow>}
          {infobox.category && <InfoboxRow label="Category">{infobox.category}</InfoboxRow>}
          {infobox.participants !== undefined && <InfoboxRow label="Participants">{infobox.participants}</InfoboxRow>}
          {infobox.eyeProtection && <InfoboxRow label="Eye protection">{infobox.eyeProtection}</InfoboxRow>}
          {infobox.impound !== undefined && <InfoboxRow label="Impound">{infobox.impound ? 'Yes' : 'No'}</InfoboxRow>}
          {infobox.allowedResources && infobox.allowedResources.length > 0 && (
            <InfoboxRow label="Allowed">
              <ul className="infobox-list">{infobox.allowedResources.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </InfoboxRow>
          )}
          {infobox.approxTime && <InfoboxRow label="Time">{infobox.approxTime}</InfoboxRow>}
          {infobox.firstAppearance && <InfoboxRow label="First seen">{infobox.firstAppearance}</InfoboxRow>}
          {infobox.latestAppearance && <InfoboxRow label="Latest">{infobox.latestAppearance}</InfoboxRow>}
          {infobox.rotates !== undefined && <InfoboxRow label="Rotates">{infobox.rotates ? 'Yes' : 'No'}</InfoboxRow>}
        </tbody>
      </table>
      {infobox.officialLink && (
        <a className="infobox-link" href={infobox.officialLink} target="_blank" rel="noreferrer">Official event page ↗</a>
      )}
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Popover { x: number; y: number }

export default function EventWiki() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const data = eventId ? wikiData[eventId] : null;
  const meta = EVENTS.find(e => e.wikiId === eventId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<WikiHighlight[]>([]);
  const [selection, setSelection] = useState<{ text: string; sectionId: string; pos: Popover } | null>(null);
  const [editing, setEditing] = useState<{ h: WikiHighlight; pos: Popover } | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const articleRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load notes
  useEffect(() => {
    if (!currentUser || !eventId) { setHighlights([]); return; }
    wikiNotesService.get(currentUser.uid, eventId).then(setHighlights).catch(console.error);
  }, [currentUser, eventId]);

  const persist = useCallback((next: WikiHighlight[]) => {
    setHighlights(next);
    if (currentUser && eventId) {
      wikiNotesService.save(currentUser.uid, eventId, next).catch(() => toast('Saved on this device only (offline?)', 'info'));
    }
  }, [currentUser, eventId, toast]);

  // Scroll spy
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveId(null);
    if (!data) return;
    const els = data.subtopics.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(entries => {
      const v = entries.filter(e => e.isIntersecting);
      if (v.length) setActiveId(v[0].target.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [eventId, data]);

  // Text selection → highlight toolbar
  useEffect(() => {
    const onUp = () => {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !articleRef.current || !wrapperRef.current) { setSelection(null); return; }
        const text = sel.toString().replace(/\s+/g, ' ').trim();
        if (text.length < 2) { setSelection(null); return; }
        const range = sel.getRangeAt(0);
        if (!articleRef.current.contains(range.commonAncestorContainer)) { setSelection(null); return; }
        const anchorEl = (range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement) as HTMLElement;
        const block = anchorEl.closest('[data-hl-block]');
        const section = anchorEl.closest('section.wiki-section');
        const rect = range.getBoundingClientRect();
        const wrapRect = wrapperRef.current.getBoundingClientRect();
        const pos = { x: rect.left + rect.width / 2 - wrapRect.left, y: rect.top - wrapRect.top };
        if (!block || !section) { setSelection({ text: '', sectionId: '', pos }); return; }
        setSelection({ text: text.slice(0, 600), sectionId: section.id, pos });
      }, 0);
    };
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    return () => { document.removeEventListener('mouseup', onUp); document.removeEventListener('touchend', onUp); };
  }, []);

  const addHighlight = (color: HighlightColor, withNote = false) => {
    if (!selection?.text) return;
    if (!currentUser) { toast('Sign in to save highlights', 'info'); return; }
    const h: WikiHighlight = {
      id: Math.random().toString(36).slice(2, 10),
      sectionId: selection.sectionId,
      text: selection.text,
      note: '',
      color,
      createdAt: Date.now(),
    };
    persist([...highlights, h]);
    window.getSelection()?.removeAllRanges();
    if (withNote) { setEditing({ h, pos: selection.pos }); setNoteDraft(''); }
    setSelection(null);
  };

  const openHighlight = useCallback((h: WikiHighlight, el: HTMLElement) => {
    if (!wrapperRef.current) return;
    const r = el.getBoundingClientRect();
    const w = wrapperRef.current.getBoundingClientRect();
    setEditing({ h, pos: { x: r.left + r.width / 2 - w.left, y: r.bottom - w.top + 8 } });
    setNoteDraft(h.note);
  }, []);

  const saveNote = () => {
    if (!editing) return;
    persist(highlights.map(x => (x.id === editing.h.id ? { ...x, note: noteDraft.trim() } : x)));
    setEditing(null);
  };

  const recolor = (c: HighlightColor) => {
    if (!editing) return;
    const next = highlights.map(x => (x.id === editing.h.id ? { ...x, color: c } : x));
    persist(next);
    setEditing({ ...editing, h: { ...editing.h, color: c } });
  };

  const removeHighlight = (id: string) => {
    persist(highlights.filter(x => x.id !== id));
    setEditing(null);
  };

  const bySection = useMemo(() => {
    const m: Record<string, WikiHighlight[]> = {};
    highlights.forEach(h => (m[h.sectionId] ??= []).push(h));
    return m;
  }, [highlights]);

  const exportToSheet = async () => {
    if (!currentUser || !data) return;
    const lines = [`# ${data.name}: my notes`, ''];
    data.subtopics.forEach(s => {
      const hs = bySection[s.id];
      if (!hs?.length) return;
      lines.push(`## ${s.title}`);
      hs.forEach(h => lines.push(`- ==${h.text}==${h.note ? ` — ${h.note}` : ''}`));
      lines.push('');
    });
    try {
      const id = await cheatsheetService.create(currentUser.uid, {
        title: `${data.name}: wiki notes`, event: data.name, content: lines.join('\n'), columns: 2, fontSize: 9, format: 'sheet',
      });
      toast('Cheat sheet created from your notes');
      navigate(`/cheatsheets/${id}`);
    } catch {
      toast('Could not create cheat sheet', 'error');
    }
  };

  if (!data) {
    return (
      <div className="ui-page">
        <div className="ui-empty">
          <h2>Event not found</h2>
          <p>The wiki page for this event doesn’t exist yet.</p>
          <Link to="/wiki" className="ui-btn ui-btn-outline">← Back to the wiki</Link>
        </div>
      </div>
    );
  }

  const renderText = (text: string, sectionId: string) => applyHighlights(text, bySection[sectionId] ?? [], openHighlight);

  const renderBlock = (block: WikiContentBlock, bIdx: number, sectionId: string) => {
    if (block.type === 'paragraph') {
      return <p key={bIdx} className="wiki-paragraph" data-hl-block>{renderText(block.content ?? '', sectionId)}</p>;
    }
    if (block.type === 'list' && block.items) {
      return (
        <ul key={bIdx} className="wiki-list">
          {block.items.map((item, iIdx) => {
            const [bold, ...rest] = item.split(': ');
            return (
              <li key={iIdx} data-hl-block>
                {rest.length > 0
                  ? <><strong>{renderText(bold, sectionId)}:</strong> {renderText(rest.join(': '), sectionId)}</>
                  : renderText(item, sectionId)}
              </li>
            );
          })}
        </ul>
      );
    }
    if (block.type === 'heading') {
      const Tag = `h${block.level || 3}` as 'h2' | 'h3';
      return <Tag key={bIdx} className="wiki-sub-heading" data-hl-block>{renderText(block.content ?? '', sectionId)}</Tag>;
    }
    if (block.type === 'image' && block.url) {
      return (
        <figure key={bIdx} className="wiki-figure">
          <img src={block.url} alt={block.alt || ''} className="wiki-img" loading="lazy" />
          {block.caption && <figcaption className="wiki-caption">{block.caption}</figcaption>}
        </figure>
      );
    }
    if (block.type === 'table' && block.headers && block.rows) {
      return (
        <div key={bIdx} className="wiki-table-wrap">
          <table className="wiki-table">
            <thead><tr>{block.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx}>{row.map((cell, cIdx) => <td key={cIdx} data-hl-block>{renderText(cell, sectionId)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  const Icon = meta?.icon;
  const color = meta?.color ?? 'var(--primary-color)';
  const info = data.infobox;

  return (
    <div className="wiki-page-wrapper" ref={wrapperRef} style={{ ['--ev' as string]: color }} onMouseDown={e => {
      if (!(e.target as HTMLElement).closest('.wiki-pop')) setEditing(null);
    }}>
      {/* Hero */}
      <header className="wiki-hero">
        <Link to="/wiki" className="wiki-breadcrumb-link"><ChevronLeft size={15} /> Event Wiki</Link>
        <div className="wiki-hero-row">
          {Icon && <span className="wiki-hero-icon"><Icon size={26} /></span>}
          <div className="wiki-hero-text">
            <h1 className="wiki-page-title">{data.name}</h1>
            <p className="wiki-lead">{data.description}</p>
          </div>
        </div>
        <div className="wiki-hero-meta">
          {info?.type && <span className="ui-chip"><Package size={12} /> {info.type}{info.category ? ` · ${info.category}` : ''}</span>}
          {info?.participants !== undefined && <span className="ui-chip"><Users size={12} /> {info.participants} participants</span>}
          {info?.approxTime && <span className="ui-chip"><Clock size={12} /> {info.approxTime}</span>}
          {info?.eyeProtection && <span className="ui-chip"><ShieldCheck size={12} /> Eye protection: {info.eyeProtection}</span>}
        </div>
        <div className="wiki-hero-actions">
          {currentUser ? (
            <>
              <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => navigate('/practice', { state: { selectedEvent: data.name } })}><PenTool size={14} /> Practice</button>
              {meta && meta.kind !== 'Build' && <Link to={`/flashcards/${meta.slug}`} className="ui-btn ui-btn-outline ui-btn-sm"><Layers size={14} /> Flashcards</Link>}
              <span className="wiki-hint"><Highlighter size={13} /> Select any text to highlight or annotate</span>
            </>
          ) : (
            <Link to="/login" state={{ from: `/wiki/${eventId}` }} className="ui-btn ui-btn-ink ui-btn-sm"><LogIn size={14} /> Sign in to practice &amp; take notes</Link>
          )}
        </div>
      </header>

      {/* Mobile TOC */}
      {data.subtopics.length > 0 && (
        <nav className="wiki-toc-mobile" aria-label="Sections">
          {data.subtopics.map(s => (
            <a key={s.id} href={`#${s.id}`} className={activeId === s.id ? 'is-active' : ''} onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{s.title}</a>
          ))}
        </nav>
      )}

      <div className="wiki-body">
        <div className="wiki-sidebar-left">
          {data.subtopics.length > 0 && (
            <nav className="wiki-toc" aria-label="Contents">
              <div className="toc-title">On this page</div>
              <ol className="toc-list">
                {data.subtopics.map((s, i) => (
                  <li key={s.id} className={`toc-item ${activeId === s.id ? 'toc-active' : ''}`}>
                    <a
                      href={`#${s.id}`}
                      className="toc-link"
                      onClick={e => {
                        e.preventDefault();
                        document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                        window.history.replaceState(null, '', `#${s.id}`);
                      }}
                    >
                      <span className="toc-num">{i + 1}</span>
                      {s.title}
                      {(bySection[s.id]?.length ?? 0) > 0 && <span className="toc-hl-count">{bySection[s.id].length}</span>}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

        <article className="wiki-article" ref={articleRef}>
          {data.subtopics.length === 0 && (
            <div className="wiki-empty-state">
              <div className="wiki-empty-icon"><FileText size={24} /></div>
              <h3>This page is a stub</h3>
              <p>Notes for <strong>{data.name}</strong> haven’t been written yet. Know this event well? <Link to="/join">Help write it</Link>.</p>
            </div>
          )}

          {data.subtopics.map((subtopic, sectionIndex) => (
            <section key={subtopic.id} id={subtopic.id} className="wiki-section">
              <h2 className="wiki-section-heading">
                <span className="wiki-section-num">{sectionIndex + 1}</span>
                {subtopic.title}
              </h2>
              <div className="wiki-section-body">
                {subtopic.blocks.map((block, bIdx) => renderBlock(block, bIdx, subtopic.id))}
              </div>
            </section>
          ))}
        </article>

        <div className="wiki-sidebar-right">
          {info && <Infobox infobox={info} />}
          {currentUser && (
            <div className="wiki-notes">
              <div className="wiki-notes-head">
                <span><Highlighter size={14} /> My notes</span>
                <b className="ui-tnum">{highlights.length}</b>
              </div>
              {highlights.length === 0 ? (
                <p className="wiki-notes-empty">Select text in the article to highlight it. Click a highlight to attach a note.</p>
              ) : (
                <>
                  <ul className="wiki-notes-list">
                    {highlights.slice().sort((a, b) => b.createdAt - a.createdAt).map(h => (
                      <li key={h.id}>
                        <button
                          className={`wiki-note-item hl-border-${h.color}`}
                          onClick={() => {
                            const el = document.querySelector(`[data-hl="${h.id}"]`) as HTMLElement | null;
                            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('is-pulse'); setTimeout(() => el.classList.remove('is-pulse'), 1200); }
                          }}
                        >
                          <span className="wiki-note-text">“{h.text.length > 90 ? h.text.slice(0, 90) + '…' : h.text}”</span>
                          {h.note && <span className="wiki-note-note">{h.note}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button className="ui-btn ui-btn-soft ui-btn-sm" style={{ width: '100%' }} onClick={exportToSheet}><FileText size={14} /> Turn into cheat sheet</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selection toolbar */}
      {selection && (
        <div className="wiki-pop wiki-sel-toolbar" style={{ left: selection.pos.x, top: selection.pos.y }} onMouseDown={e => e.preventDefault()}>
          {!selection.text ? (
            <span className="wiki-sel-msg">Select within one paragraph to highlight</span>
          ) : !currentUser ? (
            <Link to="/login" state={{ from: `/wiki/${eventId}` }} className="wiki-sel-msg"><LogIn size={13} /> Sign in to highlight</Link>
          ) : (
            <>
              {COLORS.map(c => (
                <button key={c} className={`wiki-swatch sw-${c}`} aria-label={`Highlight ${c}`} onClick={() => addHighlight(c)} />
              ))}
              <span className="wiki-sel-sep" />
              <button className="wiki-sel-note" onClick={() => addHighlight('yellow', true)}><StickyNote size={14} /> Note</button>
            </>
          )}
        </div>
      )}

      {/* Highlight editor */}
      {editing && (
        <div className="wiki-pop wiki-note-pop" style={{ left: editing.pos.x, top: editing.pos.y }}>
          <div className="wiki-note-pop-head">
            <div className="wiki-note-swatches">
              {COLORS.map(c => (
                <button key={c} className={`wiki-swatch sw-${c}${editing.h.color === c ? ' is-on' : ''}`} aria-label={`Color ${c}`} onClick={() => recolor(c)} />
              ))}
            </div>
            <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" onClick={() => removeHighlight(editing.h.id)} title="Delete highlight"><Trash2 size={14} /></button>
            <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" onClick={() => setEditing(null)} aria-label="Close"><X size={14} /></button>
          </div>
          <textarea
            className="ui-input"
            rows={3}
            autoFocus
            placeholder="Add a note: a mnemonic, a source, a question…"
            value={noteDraft}
            onChange={e => setNoteDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveNote(); }}
          />
          <div className="wiki-note-pop-foot">
            <span>⌘↵ to save</span>
            <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={saveNote}>Save note</button>
          </div>
        </div>
      )}
    </div>
  );
}
