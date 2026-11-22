import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Printer, Check, Loader2, Bold, Highlighter, Heading2, List, Table, Subscript, Superscript,
  BookOpen, AlertTriangle, CheckCircle2, Minus, Plus, Eye, PenLine,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cheatsheetService, type Cheatsheet } from '../services/studyService';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import { renderSheet, wikiToMarkup } from '../lib/sheetMarkup';
import { wikiData } from '../data/wikiData';
import { EVENTS } from '../lib/events';
import './Cheatsheets.css';

// US Letter at 96dpi with 0.35in margins
const PAGE_W = 816;
const PAGE_H = 1056;
const MARGIN = 34;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CONTENT_H = PAGE_H - MARGIN * 2;
const GAP = 14;

type SaveState = 'saved' | 'saving' | 'dirty' | 'error';

export default function CheatsheetEditor() {
  const { sheetId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const [sheet, setSheet] = useState<Cheatsheet | null>(null);
  const [save, setSave] = useState<SaveState>('saved');
  const [pages, setPages] = useState(1);
  const [scale, setScale] = useState(0.6);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const textRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<Cheatsheet | null>(null);

  useEffect(() => {
    if (!uid) return;
    cheatsheetService.get(uid, sheetId).then(s => {
      if (!s) { toast('Sheet not found', 'error'); navigate('/cheatsheets', { replace: true }); return; }
      setSheet(s);
      latest.current = s;
    }).catch(() => { toast('Could not open sheet', 'error'); navigate('/cheatsheets', { replace: true }); });
  }, [uid, sheetId, navigate, toast]);

  const persist = useCallback(async () => {
    const s = latest.current;
    if (!s || !uid) return;
    setSave('saving');
    try {
      await cheatsheetService.update(uid, s.id, {
        title: s.title, event: s.event, content: s.content, columns: s.columns, fontSize: s.fontSize, format: s.format,
      });
      setSave('saved');
    } catch {
      setSave('error');
    }
  }, [uid]);

  const update = (patch: Partial<Cheatsheet>) => {
    setSheet(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      latest.current = next;
      return next;
    });
    setSave('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(persist, 900);
  };

  // Save on unmount / tab close
  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => { if (save === 'dirty' || save === 'saving') { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [save]);

  useEffect(() => () => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); persist(); }
  }, [persist]);

  const rendered = useMemo(() => (sheet ? renderSheet(sheet.content) : null), [sheet]);

  // Measure how many pages the multi-column flow needs
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el || !sheet) return;
    // Synchronous read (layout effects run after DOM commit); rAF would stall in background tabs.
    const measure = () => setPages(Math.max(1, Math.round((el.scrollWidth + GAP) / (CONTENT_W + GAP))));
    measure();
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) measure(); });
    return () => { alive = false; };
  }, [rendered, sheet]);

  // Fit preview to pane width
  const hasSheet = sheet !== null;
  useEffect(() => {
    const el = previewPaneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, (entry.contentRect.width - 8) / PAGE_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasSheet]);

  if (!sheet) return <PageLoadingScreen loading label="Opening sheet" />;

  const wrap = (before: string, after = before, placeholder = 'text') => {
    const ta = textRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    update({ content: next });
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length); });
  };

  const insertLine = (text: string) => {
    const ta = textRef.current;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const next = value.slice(0, lineStart) + text + value.slice(lineStart);
    update({ content: next });
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(lineStart + text.length, lineStart + text.length); });
  };

  const importWiki = () => {
    const w = Object.values(wikiData).find(x => x.name === sheet.event);
    if (!w || w.subtopics.length === 0) { toast('No wiki notes for this event yet', 'info'); return; }
    update({ content: `${sheet.content.trimEnd()}\n\n${wikiToMarkup(w)}` });
    toast('Wiki notes appended');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); wrap('**'); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'h') { e.preventDefault(); wrap('=='); }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); if (saveTimer.current) clearTimeout(saveTimer.current); persist(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: en, value } = ta;
      update({ content: value.slice(0, s) + '  ' + value.slice(en) });
      requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
    }
  };

  const capacity = sheet.format === 'sheet' ? 2 : Infinity;
  const fits = pages <= capacity;
  const flowStyle: React.CSSProperties = {
    width: CONTENT_W,
    height: CONTENT_H,
    columnCount: sheet.columns,
    columnGap: GAP,
    columnFill: 'auto',
    fontSize: `${sheet.fontSize}pt`,
  };

  const pageList = Array.from({ length: pages }, (_, k) => k);

  return (
    <div className="sheet-editor">
      <div className="sheet-toolbar no-print">
        <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => navigate('/cheatsheets')}><ArrowLeft size={15} /> Sheets</button>
        <input
          className="sheet-title-input"
          value={sheet.title}
          onChange={e => update({ title: e.target.value })}
          aria-label="Sheet title"
        />
        <span className={`sheet-save is-${save}`}>
          {save === 'saving' ? <><Loader2 size={13} className="spin" /> Saving</> : save === 'dirty' ? 'Edited' : save === 'error' ? <><AlertTriangle size={13} /> Not saved</> : <><Check size={13} /> Saved</>}
        </span>
        <div className="sheet-toolbar-right">
          <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => window.print()}><Printer size={15} /> Print / PDF</button>
        </div>
      </div>

      <div className="sheet-controls no-print">
        <label className="sheet-ctl">
          <span>Event</span>
          <select className="ui-input" value={sheet.event} onChange={e => update({ event: e.target.value })}>
            {EVENTS.map(ev => <option key={ev.name}>{ev.name}</option>)}
          </select>
        </label>
        <div className="sheet-ctl">
          <span>Format</span>
          <div className="ui-segment">
            <button className={sheet.format === 'sheet' ? 'is-active' : ''} onClick={() => update({ format: 'sheet' })}>Sheet</button>
            <button className={sheet.format === 'binder' ? 'is-active' : ''} onClick={() => update({ format: 'binder' })}>Binder</button>
          </div>
        </div>
        <div className="sheet-ctl">
          <span>Columns</span>
          <div className="ui-segment">
            {[1, 2, 3, 4].map(c => <button key={c} className={sheet.columns === c ? 'is-active' : ''} onClick={() => update({ columns: c })}>{c}</button>)}
          </div>
        </div>
        <div className="sheet-ctl">
          <span>Font size</span>
          <div className="stepper sheet-stepper">
            <button aria-label="Smaller" onClick={() => update({ fontSize: Math.max(5, +(sheet.fontSize - 0.5).toFixed(1)) })}><Minus size={13} /></button>
            <span className="ui-tnum">{sheet.fontSize}pt</span>
            <button aria-label="Larger" onClick={() => update({ fontSize: Math.min(16, +(sheet.fontSize + 0.5).toFixed(1)) })}><Plus size={13} /></button>
          </div>
        </div>
        <div className={`sheet-fit ${sheet.format === 'binder' ? 'is-info' : fits ? 'is-ok' : 'is-over'}`}>
          {sheet.format === 'binder' ? (
            <><BookOpen size={15} /> {pages} page{pages === 1 ? '' : 's'}</>
          ) : fits ? (
            <><CheckCircle2 size={15} /> Fits on one sheet · {pages === 1 ? 'front only' : 'front & back'}</>
          ) : (
            <><AlertTriangle size={15} /> {pages} pages: {pages - 2} over. Shrink the font or add columns.</>
          )}
        </div>
      </div>

      <div className="sheet-mobile-tabs no-print">
        <div className="ui-segment">
          <button className={mobileTab === 'edit' ? 'is-active' : ''} onClick={() => setMobileTab('edit')}><PenLine size={14} /> Edit</button>
          <button className={mobileTab === 'preview' ? 'is-active' : ''} onClick={() => setMobileTab('preview')}><Eye size={14} /> Preview</button>
        </div>
      </div>

      <div className={`sheet-panes no-print show-${mobileTab}`}>
        <div className="sheet-edit-pane ui-card">
          <div className="sheet-format-bar">
            <button title="Heading" onClick={() => insertLine('## ')}><Heading2 size={15} /></button>
            <button title="Bold (⌘B)" onClick={() => wrap('**')}><Bold size={15} /></button>
            <button title="Highlight (⌘H)" onClick={() => wrap('==')}><Highlighter size={15} /></button>
            <button title="Subscript, e.g. H~2~O" onClick={() => wrap('~', '~', '2')}><Subscript size={15} /></button>
            <button title="Superscript, e.g. x^2^" onClick={() => wrap('^', '^', '2')}><Superscript size={15} /></button>
            <button title="Bullet list" onClick={() => insertLine('- ')}><List size={15} /></button>
            <button title="Table" onClick={() => insertLine('| Term | Meaning |\n| --- | --- |\n|  |  |\n')}><Table size={15} /></button>
            <span className="sheet-format-sep" />
            <button className="sheet-format-text" title="Append this event’s wiki notes" onClick={importWiki}><BookOpen size={14} /> Import wiki</button>
          </div>
          <textarea
            ref={textRef}
            className="sheet-textarea"
            value={sheet.content}
            onChange={e => update({ content: e.target.value })}
            onKeyDown={onKeyDown}
            spellCheck
            aria-label="Cheat sheet content"
          />
          <div className="sheet-syntax">
            <code># Heading</code><code>- list</code><code>**bold**</code><code>==mark==</code><code>H~2~O</code><code>x^2^</code><code>| table |</code><code>---</code>
          </div>
        </div>

        <div className="sheet-preview-pane" ref={previewPaneRef}>
          {pageList.map(k => (
            <div key={k} className="sheet-page-wrap" style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
              <div className={`sheet-page${sheet.format === 'sheet' && k >= 2 ? ' is-over' : ''}`} style={{ transform: `scale(${scale})` }}>
                <div className="sheet-page-clip">
                  <div className="sheet-flow" style={{ ...flowStyle, transform: `translateX(-${k * (CONTENT_W + GAP)}px)` }}>
                    {rendered}
                  </div>
                </div>
                <span className="sheet-page-num">{sheet.format === 'sheet' ? (k === 0 ? 'Front' : k === 1 ? 'Back' : `Over · page ${k + 1}`) : `Page ${k + 1}`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden measurer */}
      <div className="sheet-measure" aria-hidden="true">
        <div ref={measureRef} className="sheet-flow" style={{ ...flowStyle, overflow: 'hidden' }}>{rendered}</div>
      </div>

      {/* Print output: same flow, one page per sheet side */}
      <div className="sheet-print">
        {pageList.map(k => (
          <div key={k} className="sheet-print-page">
            <div className="sheet-page-clip">
              <div className="sheet-flow" style={{ ...flowStyle, transform: `translateX(-${k * (CONTENT_W + GAP)}px)` }}>{rendered}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
