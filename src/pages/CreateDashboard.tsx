import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Trash2, Share2, Globe, Lock, Folder, FolderPlus, Search, Wand2, MoreHorizontal, Inbox, Pencil, Check, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type CustomTest } from '../services/firestoreService';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import ShareTestModal from '../components/ShareTestModal';
import { eventMeta } from '../lib/events';
import { primaryEvent } from '../lib/testMeta';
import type { Timestamp } from 'firebase/firestore';
import './CreateDashboard.css';

type Sort = 'recent' | 'az' | 'size';
const EXTRA_FOLDERS_KEY = 'sciolytics:emptyFolders';

function readFolders(): string[] {
  try { return JSON.parse(localStorage.getItem(EXTRA_FOLDERS_KEY) || '[]'); } catch { return []; }
}

export default function CreateDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { currentUser } = useAuth();
  const [tests, setTests] = useState<CustomTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingTest, setSharingTest] = useState<CustomTest | null>(null);
  const [folder, setFolder] = useState<string>('__all');
  const [extraFolders, setExtraFolders] = useState<string[]>(readFolders);
  const [query, setQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('All');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    firestoreService.getCustomTests(currentUser.uid)
      .then(setTests)
      .catch(err => { console.error(err); toast('Could not load your tests', 'error'); })
      .finally(() => setLoading(false));
  }, [currentUser, toast]);

  useEffect(() => {
    try { localStorage.setItem(EXTRA_FOLDERS_KEY, JSON.stringify(extraFolders)); } catch { /* ignore */ }
  }, [extraFolders]);

  useEffect(() => {
    const close = () => setMenuFor(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const folders = useMemo(() => {
    const set = new Set<string>(extraFolders);
    tests.forEach(t => { if (t.folder) set.add(t.folder); });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [tests, extraFolders]);

  const events = useMemo(() => Array.from(new Set(tests.map(primaryEvent))).sort(), [tests]);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return tests
      .filter(t => folder === '__all' || (folder === '__none' ? !t.folder : t.folder === folder))
      .filter(t => eventFilter === 'All' || primaryEvent(t) === eventFilter)
      .filter(t => visibility === 'all' || (visibility === 'public' ? t.isPublic : !t.isPublic))
      .filter(t => !q || (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'az') return (a.title || '').localeCompare(b.title || '');
        if (sort === 'size') return b.questions.length - a.questions.length;
        return ((b.updatedAt as Timestamp)?.toMillis?.() ?? 0) - ((a.updatedAt as Timestamp)?.toMillis?.() ?? 0);
      });
  }, [tests, folder, eventFilter, visibility, query, sort]);

  const createNewTest = async () => {
    if (!currentUser) return;
    try {
      const id = await firestoreService.createCustomTest({
        title: 'Untitled Test',
        description: '',
        creatorId: currentUser.uid,
        questions: [],
        ...(currentUser.displayName ? { creatorName: currentUser.displayName } : {}),
        ...(folder !== '__all' && folder !== '__none' ? { folder } : {}),
      });
      navigate(`/create/editor/${id}`);
    } catch (err) {
      console.error(err);
      toast('Could not create test', 'error');
    }
  };

  // Command palette "New custom test"
  useEffect(() => {
    if ((location.state as { createNew?: boolean } | null)?.createNew && currentUser && !loading) {
      navigate('/create', { replace: true, state: null });
      createNewTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, currentUser, loading]);

  const patch = async (t: CustomTest, data: Partial<CustomTest>, msg?: string) => {
    const prev = tests;
    setTests(ts => ts.map(x => (x.id === t.id ? { ...x, ...data } : x)));
    try {
      await firestoreService.updateCustomTest(t.id!, data);
      if (msg) toast(msg);
    } catch (err) {
      console.error(err);
      setTests(prev);
      toast('Could not update test', 'error');
    }
  };

  const deleteTest = async (t: CustomTest) => {
    if (!confirm(`Delete “${t.title || 'Untitled test'}”? This can’t be undone.`)) return;
    const prev = tests;
    setTests(ts => ts.filter(x => x.id !== t.id));
    try {
      await firestoreService.deleteCustomTest(t.id!);
      toast('Test deleted');
    } catch {
      setTests(prev);
      toast('Could not delete test', 'error');
    }
  };

  const addFolder = (name: string) => {
    const n = name.trim();
    if (!n) { setNewFolder(null); return; }
    if (!folders.includes(n)) setExtraFolders(f => [...f, n]);
    setFolder(n);
    setNewFolder(null);
  };

  const renameFolder = async () => {
    if (!renaming) return;
    const to = renaming.to.trim();
    const from = renaming.from;
    setRenaming(null);
    if (!to || to === from) return;
    setExtraFolders(f => f.map(x => (x === from ? to : x)));
    const affected = tests.filter(t => t.folder === from);
    setTests(ts => ts.map(t => (t.folder === from ? { ...t, folder: to } : t)));
    setFolder(to);
    await Promise.all(affected.map(t => firestoreService.updateCustomTest(t.id!, { folder: to }).catch(console.error)));
    toast(`Renamed folder to “${to}”`);
  };

  const deleteFolder = async (name: string) => {
    if (!confirm(`Delete folder “${name}”? Tests inside move to Unfiled.`)) return;
    setExtraFolders(f => f.filter(x => x !== name));
    const affected = tests.filter(t => t.folder === name);
    setTests(ts => ts.map(t => (t.folder === name ? { ...t, folder: '' } : t)));
    setFolder('__all');
    await Promise.all(affected.map(t => firestoreService.updateCustomTest(t.id!, { folder: '' }).catch(console.error)));
  };

  if (loading) return <PageLoadingScreen loading label="Loading your tests" />;

  const count = (f: string) => tests.filter(t => (f === '__all' ? true : f === '__none' ? !t.folder : t.folder === f)).length;

  return (
    <>
      <div className="ui-page create">
        <header className="ui-page-head">
          <div>
            <span className="ui-eyebrow"><Pencil size={13} /> Test builder</span>
            <h1>Create</h1>
            <p>Write tests by hand or import them with AI. Organize them in folders, share them with your team or publish to the community.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ui-btn ui-btn-outline" onClick={createNewTest}><Wand2 size={16} /> Import with AI</button>
            <button className="ui-btn ui-btn-primary" onClick={createNewTest}><Plus size={16} /> New test</button>
          </div>
        </header>

        <div className="create-layout">
          <aside className="create-folders ui-card">
            <span className="create-folders-title">Library</span>
            <button className={`folder-item${folder === '__all' ? ' is-active' : ''}`} onClick={() => setFolder('__all')}>
              <FileText size={15} /> All tests <span className="ui-tnum">{count('__all')}</span>
            </button>
            <button className={`folder-item${folder === '__none' ? ' is-active' : ''}`} onClick={() => setFolder('__none')}>
              <Inbox size={15} /> Unfiled <span className="ui-tnum">{count('__none')}</span>
            </button>
            <span className="create-folders-title">Folders</span>
            {folders.map(f => (
              renaming?.from === f ? (
                <form key={f} className="folder-edit" onSubmit={e => { e.preventDefault(); renameFolder(); }}>
                  <input className="ui-input" autoFocus value={renaming.to} onChange={e => setRenaming({ from: f, to: e.target.value })} onBlur={renameFolder} />
                </form>
              ) : (
                <div key={f} className={`folder-item has-actions${folder === f ? ' is-active' : ''}`}>
                  <button className="folder-main" onClick={() => setFolder(f)}><Folder size={15} /> <span className="folder-name">{f}</span> <span className="ui-tnum">{count(f)}</span></button>
                  <span className="folder-actions">
                    <button aria-label={`Rename ${f}`} onClick={() => setRenaming({ from: f, to: f })}><Pencil size={12} /></button>
                    <button aria-label={`Delete ${f}`} onClick={() => deleteFolder(f)}><X size={12} /></button>
                  </span>
                </div>
              )
            ))}
            {newFolder !== null ? (
              <form className="folder-edit" onSubmit={e => { e.preventDefault(); addFolder(newFolder); }}>
                <input className="ui-input" autoFocus placeholder="Folder name" value={newFolder} onChange={e => setNewFolder(e.target.value)} onBlur={() => addFolder(newFolder)} />
                <button type="submit" className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" aria-label="Create folder"><Check size={14} /></button>
              </form>
            ) : (
              <button className="folder-item folder-add" onClick={() => setNewFolder('')}><FolderPlus size={15} /> New folder</button>
            )}
          </aside>

          <section className="create-main">
            <div className="create-toolbar">
              <label className="ui-search create-search">
                <Search size={16} />
                <input className="ui-input" placeholder="Search your tests…" value={query} onChange={e => setQuery(e.target.value)} />
              </label>
              <select className="ui-input create-select" value={eventFilter} onChange={e => setEventFilter(e.target.value)} aria-label="Filter by event">
                <option value="All">All events</option>
                {events.map(ev => <option key={ev}>{ev}</option>)}
              </select>
              <div className="ui-segment">
                <button className={visibility === 'all' ? 'is-active' : ''} onClick={() => setVisibility('all')}>All</button>
                <button className={visibility === 'public' ? 'is-active' : ''} onClick={() => setVisibility('public')}><Globe size={12} /> Public</button>
                <button className={visibility === 'private' ? 'is-active' : ''} onClick={() => setVisibility('private')}><Lock size={12} /> Private</button>
              </div>
              <select className="ui-input create-select" value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort">
                <option value="recent">Recently edited</option>
                <option value="az">A–Z</option>
                <option value="size">Most questions</option>
              </select>
            </div>

            <div className="create-grid">
              <button className="ui-card create-new" onClick={createNewTest}>
                <span><Plus size={22} /></span>
                <b>New test</b>
                <small>{folder !== '__all' && folder !== '__none' ? `in ${folder}` : 'Start from scratch or import'}</small>
              </button>

              {visible.map(t => {
                const ev = primaryEvent(t);
                const m = eventMeta(ev);
                const updated = (t.updatedAt as Timestamp)?.toDate?.();
                return (
                  <div
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    className="ui-card ui-card-interactive ctile"
                    style={{ ['--ev' as string]: m.color }}
                    onClick={() => navigate(`/create/editor/${t.id}`)}
                    onKeyDown={e => { if (e.key === 'Enter') navigate(`/create/editor/${t.id}`); }}
                  >
                    <div className="ctile-top">
                      <span className="ctile-event"><m.icon size={13} /> {ev}</span>
                      <div className="ctile-menu-wrap" onClick={e => e.stopPropagation()}>
                        <button className="ctile-menu-btn" aria-label="Test actions" onClick={e => { e.stopPropagation(); setMenuFor(menuFor === t.id ? null : t.id!); }}>
                          <MoreHorizontal size={16} />
                        </button>
                        {menuFor === t.id && (
                          <div className="ctile-menu" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setMenuFor(null); setSharingTest(t); }}><Share2 size={14} /> Share</button>
                            <button onClick={() => { setMenuFor(null); patch(t, { isPublic: !t.isPublic }, t.isPublic ? 'Test is now private' : 'Published to Community'); }}>
                              {t.isPublic ? <><Lock size={14} /> Make private</> : <><Globe size={14} /> Publish to Community</>}
                            </button>
                            <div className="ctile-menu-label">Move to folder</div>
                            <button onClick={() => { setMenuFor(null); patch(t, { folder: '' }, 'Moved to Unfiled'); }} className={!t.folder ? 'is-current' : ''}><Inbox size={14} /> Unfiled</button>
                            {folders.map(f => (
                              <button key={f} onClick={() => { setMenuFor(null); patch(t, { folder: f }, `Moved to ${f}`); }} className={t.folder === f ? 'is-current' : ''}><Folder size={14} /> {f}</button>
                            ))}
                            <div className="ctile-menu-sep" />
                            <button className="danger" onClick={() => { setMenuFor(null); deleteTest(t); }}><Trash2 size={14} /> Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3>{t.title || 'Untitled test'}</h3>
                    <p>{t.description || 'No description yet.'}</p>
                    <div className="ctile-foot">
                      <span className="ui-tnum"><FileText size={12} /> {t.questions.length}</span>
                      <span className={`ctile-vis${t.isPublic ? ' is-public' : ''}`}>{t.isPublic ? <><Globe size={12} /> Public</> : <><Lock size={12} /> Private</>}</span>
                      {t.folder && <span className="ctile-folder"><Folder size={12} /> {t.folder}</span>}
                      {updated && <span className="ctile-date">{updated.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {visible.length === 0 && tests.length > 0 && (
              <div className="ui-empty"><p>No tests match these filters.</p></div>
            )}
          </section>
        </div>
      </div>

      {sharingTest && (
        <ShareTestModal
          test={sharingTest}
          onClose={() => setSharingTest(null)}
          onShared={() => setTests(prev => prev.map(t => (t.id === sharingTest.id ? { ...t, isPublic: true } : t)))}
        />
      )}
    </>
  );
}
