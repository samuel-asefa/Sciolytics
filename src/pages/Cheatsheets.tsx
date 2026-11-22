import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Trash2, BookOpen, X, Printer, Columns3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cheatsheetService, type Cheatsheet } from '../services/studyService';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import { EVENTS, eventMeta } from '../lib/events';
import { wikiData } from '../data/wikiData';
import { wikiToMarkup } from '../lib/sheetMarkup';
import type { Timestamp } from 'firebase/firestore';
import './Cheatsheets.css';

const STARTER = (event: string) => `# ${event}

## Key formulas
- **Example:** write formulas inline, e.g. E = mc^2^ or H~2~O
- ==Highlight== anything you must not forget

## Definitions
| Term | Meaning |
| --- | --- |
| Term 1 | What it means |

## Quick facts
1. Numbered lists work too
2. Use --- for a divider

> Tip: shrink the font or add columns until the fit meter turns green.
`;

export default function Cheatsheets() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [sheets, setSheets] = useState<Cheatsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [event, setEvent] = useState(EVENTS[0].name);
  const [format, setFormat] = useState<'sheet' | 'binder'>('sheet');
  const [fromWiki, setFromWiki] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    cheatsheetService.list(currentUser.uid)
      .then(setSheets)
      .catch(err => { console.error(err); toast('Could not load cheat sheets', 'error'); })
      .finally(() => setLoading(false));
  }, [currentUser, toast]);

  const wiki = Object.values(wikiData).find(w => w.name === event);
  const wikiHasContent = !!wiki && wiki.subtopics.length > 0;

  const create = async () => {
    if (!currentUser) return;
    setBusy(true);
    try {
      const content = fromWiki && wikiHasContent ? wikiToMarkup(wiki!) : STARTER(event);
      const id = await cheatsheetService.create(currentUser.uid, {
        title: `${event} ${format === 'sheet' ? 'note sheet' : 'binder'}`,
        event,
        content,
        columns: format === 'sheet' ? 3 : 2,
        fontSize: format === 'sheet' ? 7.5 : 10,
        format,
      });
      navigate(`/cheatsheets/${id}`);
    } catch (err) {
      console.error(err);
      toast('Could not create sheet', 'error');
      setBusy(false);
    }
  };

  const remove = async (s: Cheatsheet) => {
    if (!currentUser || !confirm(`Delete “${s.title}”? This can’t be undone.`)) return;
    const prev = sheets;
    setSheets(x => x.filter(y => y.id !== s.id));
    try {
      await cheatsheetService.remove(currentUser.uid, s.id);
      toast('Sheet deleted');
    } catch {
      setSheets(prev);
      toast('Could not delete sheet', 'error');
    }
  };

  if (loading) return <PageLoadingScreen loading label="Loading cheat sheets" />;

  return (
    <div className="ui-page">
      <header className="ui-page-head">
        <div>
          <span className="ui-eyebrow"><FileText size={13} /> Note sheets &amp; binders</span>
          <h1>Cheat sheets</h1>
          <p>Build dense, print-perfect note sheets. A live fit meter tells you whether it fits on one 8.5×11 sheet, front and back.</p>
        </div>
        <button className="ui-btn ui-btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> New sheet</button>
      </header>

      {sheets.length === 0 ? (
        <div className="ui-card sheets-empty">
          <div className="sheets-empty-art" aria-hidden="true">
            <div className="paper"><i /><i /><i /><i /><i /><i /></div>
            <div className="paper p2"><i /><i /><i /><i /><i /></div>
          </div>
          <div>
            <h3>Your first note sheet is one click away</h3>
            <p className="ui-muted">Start from the event wiki or a blank template, then trim it down to what you’ll actually need at the tournament.</p>
            <ul className="sheets-perks">
              <li><Columns3 size={15} /> 1–4 columns, 6–14pt type</li>
              <li><BookOpen size={15} /> Import straight from the wiki</li>
              <li><Printer size={15} /> Print or save as PDF</li>
            </ul>
            <button className="ui-btn ui-btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Create a sheet</button>
          </div>
        </div>
      ) : (
        <div className="sheets-grid">
          <button className="ui-card sheet-new" onClick={() => setCreating(true)}>
            <span><Plus size={22} /></span>
            New sheet
          </button>
          {sheets.map(s => {
            const m = eventMeta(s.event);
            const updated = (s.updatedAt as Timestamp)?.toDate?.();
            return (
              <Link key={s.id} to={`/cheatsheets/${s.id}`} className="ui-card ui-card-interactive sheet-card" style={{ ['--ev' as string]: m.color }}>
                <div className="sheet-thumb" style={{ ['--cols' as string]: s.columns }}>
                  {Array.from({ length: s.columns }).map((_, c) => (
                    <div key={c}>{Array.from({ length: 9 }).map((__, r) => <i key={r} style={{ width: `${55 + ((r * 37 + c * 13) % 45)}%` }} />)}</div>
                  ))}
                </div>
                <div className="sheet-info">
                  <span className="sheet-event"><m.icon size={13} /> {s.event}</span>
                  <h3>{s.title}</h3>
                  <span className="sheet-meta">{s.format === 'sheet' ? 'Note sheet' : 'Binder'} · {s.columns} col · {s.fontSize}pt{updated ? ` · ${updated.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}</span>
                </div>
                <button className="sheet-del" aria-label={`Delete ${s.title}`} onClick={e => { e.preventDefault(); e.stopPropagation(); remove(s); }}>
                  <Trash2 size={15} />
                </button>
              </Link>
            );
          })}
        </div>
      )}

      {creating && (
        <div className="ui-modal-backdrop" onMouseDown={() => !busy && setCreating(false)}>
          <div className="ui-modal sheet-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label="New cheat sheet">
            <div className="sheet-modal-head">
              <h3>New cheat sheet</h3>
              <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" onClick={() => setCreating(false)} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="sheet-modal-body">
              <label>
                <span className="ui-label">Event</span>
                <select className="ui-input" value={event} onChange={e => setEvent(e.target.value)}>
                  {EVENTS.map(e => <option key={e.name}>{e.name}</option>)}
                </select>
              </label>
              <div>
                <span className="ui-label">Format</span>
                <div className="format-pick">
                  <button className={format === 'sheet' ? 'is-active' : ''} onClick={() => setFormat('sheet')}>
                    <b>Note sheet</b>
                    <span>One 8.5×11 page, both sides. Most study events allow this.</span>
                  </button>
                  <button className={format === 'binder' ? 'is-active' : ''} onClick={() => setFormat('binder')}>
                    <b>Binder</b>
                    <span>Unlimited pages for binder events.</span>
                  </button>
                </div>
              </div>
              <label className="toggle-row">
                <span>
                  <span className="toggle-title">Start from the wiki</span>
                  <span className="toggle-desc">{wikiHasContent ? `Import the ${event} wiki notes` : 'No wiki notes for this event yet, so you’ll get a template'}</span>
                </span>
                <input type="checkbox" className="ui-switch" checked={fromWiki && wikiHasContent} disabled={!wikiHasContent} onChange={e => setFromWiki(e.target.checked)} />
              </label>
              <p className="sheet-modal-note">Always check your event’s rules for exactly what’s allowed.</p>
            </div>
            <div className="sheet-modal-foot">
              <button className="ui-btn ui-btn-ghost" onClick={() => setCreating(false)} disabled={busy}>Cancel</button>
              <button className="ui-btn ui-btn-primary" onClick={create} disabled={busy}>{busy ? 'Creating…' : 'Create sheet'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
