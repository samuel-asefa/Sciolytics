import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Plus, Trash2, Printer, Wand2, ArrowLeft, Loader2, Share2, Sparkles, ChevronUp, ChevronDown, Copy,
  Check, X, Globe, Lock, Play,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type CustomTest } from '../services/firestoreService';
import { aiTestImportService } from '../services/aiTestImportService';
import { aiTutorService, type QuestionModification } from '../services/aiTutorService';
import type { Question } from '../data/questionBank';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import ShareTestModal from '../components/ShareTestModal';
import { EVENTS } from '../lib/events';
import './TestEditor.css';

const AI_ACTIONS: { mode: QuestionModification; label: string }[] = [
  { mode: 'harder', label: 'Make harder' },
  { mode: 'easier', label: 'Make easier' },
  { mode: 'rephrase', label: 'Rephrase for clarity' },
  { mode: 'distractors', label: 'Stronger distractors' },
  { mode: 'explanation', label: 'Write explanation' },
  { mode: 'toFRQ', label: 'Convert to free response' },
  { mode: 'toMCQ', label: 'Convert to multiple choice' },
];

interface Proposal { qid: string; before: Question; after: Question }

export default function TestEditor() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();

  const [test, setTest] = useState<CustomTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiEvent, setAiEvent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [aiMenuFor, setAiMenuFor] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const testRef = useRef<CustomTest | null>(null);

  useEffect(() => { testRef.current = test; }, [test]);

  useEffect(() => {
    if (!currentUser || !testId) return;
    firestoreService.getCustomTest(testId).then(data => {
      if (!data || data.creatorId !== currentUser.uid) {
        toast('Test not found or not yours', 'error');
        navigate('/create', { replace: true });
        return;
      }
      setTest({ ...data, questions: data.questions ?? [] });
      setAiEvent(data.event || '');
    }).catch(err => { console.error(err); toast('Could not load test', 'error'); })
      .finally(() => setLoading(false));
    firestoreService.getCustomTests(currentUser.uid)
      .then(ts => setFolders(Array.from(new Set(ts.map(t => t.folder).filter(Boolean) as string[]))))
      .catch(() => {});
  }, [currentUser, testId, navigate, toast]);

  const mutate = (fn: (t: CustomTest) => CustomTest) => {
    setTest(prev => (prev ? fn(prev) : prev));
    setDirty(true);
  };

  const handleSave = useCallback(async (silent = false) => {
    const t = testRef.current;
    if (!t || !testId) return;
    setSaving(true);
    try {
      const questions = t.questions.map(q => ({
        ...q,
        options: q.type === 'MCQ' ? (q.options ?? []) : [],
        correctAnswer: q.correctAnswer ?? '',
        question: q.question ?? '',
        explanation: q.explanation ?? '',
        event: q.event && q.event !== 'General' ? q.event : (t.event || 'General'),
      }));
      await firestoreService.updateCustomTest(testId, {
        title: t.title,
        description: t.description,
        isPublic: t.isPublic || false,
        questions,
        event: t.event || '',
        division: t.division || 'Both',
        folder: t.folder || '',
      });
      setDirty(false);
      if (!silent) toast('Saved');
    } catch (err) {
      console.error('Error saving', err);
      toast('Failed to save test', 'error');
    } finally {
      setSaving(false);
    }
  }, [testId, toast]);

  // ⌘S to save, warn on unload
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); handleSave(); }
    };
    const onBefore = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onBefore);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('beforeunload', onBefore); };
  }, [handleSave, dirty]);

  useEffect(() => {
    const close = () => setAiMenuFor(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const addQuestion = (type: 'MCQ' | 'FRQ' = 'MCQ') => mutate(t => ({
    ...t,
    questions: [...t.questions, {
      id: crypto.randomUUID(),
      event: t.event || 'General',
      subtopic: 'General',
      division: t.division || 'Both',
      difficulty: 'Medium',
      type,
      question: '',
      options: type === 'MCQ' ? ['', '', '', ''] : [],
      correctAnswer: '',
      explanation: '',
    }],
  }));

  const updateQ = (id: string, patch: Partial<Question>) =>
    mutate(t => ({ ...t, questions: t.questions.map(q => (q.id === id ? { ...q, ...patch } : q)) }));

  const removeQ = (id: string) => mutate(t => ({ ...t, questions: t.questions.filter(q => q.id !== id) }));

  const duplicateQ = (id: string) => mutate(t => {
    const i = t.questions.findIndex(q => q.id === id);
    const copy = { ...t.questions[i], id: crypto.randomUUID(), options: [...(t.questions[i].options ?? [])] };
    const qs = [...t.questions];
    qs.splice(i + 1, 0, copy);
    return { ...t, questions: qs };
  });

  const moveQ = (id: string, dir: -1 | 1) => mutate(t => {
    const i = t.questions.findIndex(q => q.id === id);
    const j = i + dir;
    if (j < 0 || j >= t.questions.length) return t;
    const qs = [...t.questions];
    [qs[i], qs[j]] = [qs[j], qs[i]];
    return { ...t, questions: qs };
  });

  const setOption = (q: Question, idx: number, val: string) => {
    const opts = [...(q.options ?? [])];
    const wasCorrect = q.correctAnswer === opts[idx] && opts[idx] !== '';
    opts[idx] = val;
    updateQ(q.id, { options: opts, ...(wasCorrect ? { correctAnswer: val } : {}) });
  };

  const changeType = (q: Question, type: 'MCQ' | 'FRQ') => {
    updateQ(q.id, type === 'MCQ'
      ? { type, options: q.options?.length ? q.options : ['', '', '', ''], correctAnswer: '' }
      : { type, options: [] });
  };

  const handleAiImport = async () => {
    if (!aiText.trim() || !test) return;
    setAiLoading(true);
    try {
      const generated = await aiTestImportService.generateTestFromText(aiText, aiEvent || test.event || 'General');
      mutate(t => ({ ...t, questions: [...t.questions, ...generated] }));
      toast(`Added ${generated.length} questions`);
      setShowAiModal(false);
      setAiText('');
    } catch (err) {
      console.error('AI Import Error', err);
      toast('AI import failed. Try different text.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const runAi = async (q: Question, mode: QuestionModification, instruction?: string) => {
    setAiMenuFor(null);
    setAiBusy(q.id);
    try {
      const patch = await aiTutorService.modifyQuestion({ ...q, event: q.event !== 'General' ? q.event : (test?.event || 'General') }, mode, instruction);
      setProposal({ qid: q.id, before: q, after: { ...q, ...patch } });
    } catch (err) {
      console.error(err);
      toast('AI couldn’t modify that question. Try again.', 'error');
    } finally {
      setAiBusy(null);
      setCustomPrompt('');
    }
  };

  const acceptProposal = () => {
    if (!proposal) return;
    updateQ(proposal.qid, proposal.after);
    setProposal(null);
    toast('AI changes applied');
  };

  if (loading || !test) return <PageLoadingScreen loading label="Opening editor" />;

  const mcqCount = test.questions.filter(q => q.type === 'MCQ').length;
  const missingKey = test.questions.filter(q => !q.correctAnswer).length;

  return (
    <div className="test-editor-page">
      <div className="te-bar no-print">
        <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => { if (!dirty || confirm('Leave without saving?')) navigate('/create'); }}>
          <ArrowLeft size={15} /> Tests
        </button>
        <span className={`te-status${dirty ? ' is-dirty' : ''}`}>{saving ? <><Loader2 size={13} className="spin" /> Saving</> : dirty ? 'Unsaved changes' : <><Check size={13} /> All changes saved</>}</span>
        <div className="te-bar-actions">
          <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => window.print()}><Printer size={15} /> Print</button>
          <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => setShowShareModal(true)}><Share2 size={15} /> Share</button>
          <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={async () => { await handleSave(true); navigate(`/test/${testId}`); }} disabled={!test.questions.length}><Play size={14} /> Preview</button>
          <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => handleSave()} disabled={saving}>
            {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />} Save <kbd className="te-kbd">⌘S</kbd>
          </button>
        </div>
      </div>

      <div className="te-layout">
        <div className="te-main">
          <div className="ui-card te-meta">
            <input
              className="test-title-input"
              value={test.title}
              onChange={e => mutate(t => ({ ...t, title: e.target.value }))}
              placeholder="Test title"
              aria-label="Test title"
            />
            <textarea
              className="test-desc-input"
              value={test.description}
              onChange={e => mutate(t => ({ ...t, description: e.target.value }))}
              placeholder="Description or instructions for test takers"
              rows={2}
              aria-label="Test description"
            />
          </div>

          <div className="questions-list">
            {test.questions.map((q, i) => (
              <div key={q.id} className={`ui-card question-card${aiBusy === q.id ? ' is-busy' : ''}`}>
                <div className="question-header no-print">
                  <span className="q-number">Q{i + 1}</span>
                  <div className="ui-segment te-type">
                    <button className={q.type === 'MCQ' ? 'is-active' : ''} onClick={() => changeType(q, 'MCQ')}>Multiple choice</button>
                    <button className={q.type === 'FRQ' ? 'is-active' : ''} onClick={() => changeType(q, 'FRQ')}>Free response</button>
                  </div>
                  <select className="ui-input te-diff" value={q.difficulty} onChange={e => updateQ(q.id, { difficulty: e.target.value as Question['difficulty'] })} aria-label="Difficulty">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                  <div className="q-controls">
                    <div className="te-ai-wrap" onClick={e => e.stopPropagation()}>
                      <button className="te-ai-btn" onClick={() => setAiMenuFor(aiMenuFor === q.id ? null : q.id)} disabled={aiBusy === q.id} title="AI tools">
                        {aiBusy === q.id ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} AI
                      </button>
                      {aiMenuFor === q.id && (
                        <div className="te-ai-menu">
                          {AI_ACTIONS.filter(a => !(a.mode === 'toFRQ' && q.type === 'FRQ') && !(a.mode === 'toMCQ' && q.type === 'MCQ')).map(a => (
                            <button key={a.mode} onClick={() => runAi(q, a.mode)} disabled={!q.question.trim() && a.mode !== 'custom'}>{a.label}</button>
                          ))}
                          <form className="te-ai-custom" onSubmit={e => { e.preventDefault(); if (customPrompt.trim()) runAi(q, 'custom', customPrompt); }}>
                            <input className="ui-input" placeholder="Custom: “add a calculation step”…" value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} />
                          </form>
                          {!q.question.trim() && <p className="te-ai-hint">Write a draft question first, or use a custom instruction to generate one.</p>}
                        </div>
                      )}
                    </div>
                    <button className="te-icon" onClick={() => moveQ(q.id, -1)} disabled={i === 0} aria-label="Move up"><ChevronUp size={15} /></button>
                    <button className="te-icon" onClick={() => moveQ(q.id, 1)} disabled={i === test.questions.length - 1} aria-label="Move down"><ChevronDown size={15} /></button>
                    <button className="te-icon" onClick={() => duplicateQ(q.id)} aria-label="Duplicate"><Copy size={14} /></button>
                    <button className="te-icon danger" onClick={() => removeQ(q.id)} aria-label="Delete question"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="print-only print-q-header"><strong>{i + 1}.</strong></div>

                <textarea
                  className="q-text-input"
                  value={q.question}
                  onChange={e => updateQ(q.id, { question: e.target.value })}
                  placeholder="Write the question…"
                  rows={2}
                />

                {q.type === 'MCQ' && (
                  <div className="q-options">
                    {(q.options ?? []).map((opt, oIdx) => {
                      const correct = q.correctAnswer === opt && opt !== '';
                      return (
                        <div key={oIdx} className={`option-row${correct ? ' is-correct' : ''}`}>
                          <button
                            className="opt-letter no-print-style"
                            onClick={() => opt && updateQ(q.id, { correctAnswer: opt })}
                            title={opt ? 'Mark as correct answer' : 'Type an option first'}
                            aria-label={`Mark option ${String.fromCharCode(65 + oIdx)} correct`}
                          >
                            {correct ? <Check size={13} /> : String.fromCharCode(65 + oIdx)}
                          </button>
                          <input type="text" value={opt} onChange={e => setOption(q, oIdx, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} />
                          {(q.options?.length ?? 0) > 2 && (
                            <button className="te-icon no-print" onClick={() => updateQ(q.id, { options: q.options!.filter((_, k) => k !== oIdx), ...(correct ? { correctAnswer: '' } : {}) })} aria-label="Remove option"><X size={13} /></button>
                          )}
                        </div>
                      );
                    })}
                    {(q.options?.length ?? 0) < 6 && (
                      <button className="te-add-opt no-print" onClick={() => updateQ(q.id, { options: [...(q.options ?? []), ''] })}><Plus size={13} /> Add option</button>
                    )}
                    {!q.correctAnswer && <span className="te-warn no-print">Click a letter to mark the correct answer</span>}
                  </div>
                )}

                {q.type === 'FRQ' && (
                  <div className="q-frq-answer">
                    <textarea
                      value={q.correctAnswer}
                      onChange={e => updateQ(q.id, { correctAnswer: e.target.value })}
                      placeholder="Answer key (used by the AI grader)"
                      rows={2}
                    />
                    <div className="print-only print-frq-lines"></div>
                  </div>
                )}

                <details className="te-explain no-print" open={!!q.explanation}>
                  <summary>Explanation {q.explanation ? '' : '(optional)'}</summary>
                  <textarea
                    value={q.explanation ?? ''}
                    onChange={e => updateQ(q.id, { explanation: e.target.value })}
                    placeholder="Why is this the answer? Shown to students after they answer."
                    rows={2}
                  />
                </details>
              </div>
            ))}

            {test.questions.length === 0 && (
              <div className="ui-card ui-empty te-empty no-print">
                <div className="ui-empty-icon"><Wand2 size={22} /></div>
                <h3>Add your first question</h3>
                <p>Write questions by hand, or paste notes and let AI draft a full test you can edit.</p>
              </div>
            )}
          </div>

          <div className="editor-footer no-print">
            <button className="btn-add" onClick={() => addQuestion('MCQ')}><Plus size={16} /> Multiple choice</button>
            <button className="btn-add" onClick={() => addQuestion('FRQ')}><Plus size={16} /> Free response</button>
            <button className="btn-ai" onClick={() => setShowAiModal(true)}><Wand2 size={16} /> Import with AI</button>
          </div>
        </div>

        <aside className="te-side no-print">
          <div className="ui-card te-panel">
            <h3>Settings</h3>
            <label>
              <span className="ui-label">Event</span>
              <select className="ui-input" value={test.event || ''} onChange={e => mutate(t => ({ ...t, event: e.target.value }))}>
                <option value="">Auto-detect from questions</option>
                {EVENTS.map(ev => <option key={ev.name}>{ev.name}</option>)}
              </select>
            </label>
            <div>
              <span className="ui-label">Division</span>
              <div className="ui-segment" style={{ display: 'flex' }}>
                {(['B', 'Both', 'C'] as const).map(d => (
                  <button key={d} style={{ flex: 1 }} className={(test.division || 'Both') === d ? 'is-active' : ''} onClick={() => mutate(t => ({ ...t, division: d }))}>{d === 'Both' ? 'Both' : `Div ${d}`}</button>
                ))}
              </div>
            </div>
            <label>
              <span className="ui-label">Folder</span>
              <input className="ui-input" list="te-folders" value={test.folder || ''} placeholder="Unfiled" onChange={e => mutate(t => ({ ...t, folder: e.target.value }))} />
              <datalist id="te-folders">{folders.map(f => <option key={f} value={f} />)}</datalist>
            </label>
            <label className="toggle-row">
              <span>
                <span className="toggle-title">{test.isPublic ? <><Globe size={13} /> Public</> : <><Lock size={13} /> Private</>}</span>
                <span className="toggle-desc">{test.isPublic ? 'Listed in Community for anyone to take' : 'Only you and people you share with'}</span>
              </span>
              <input type="checkbox" className="ui-switch" checked={!!test.isPublic} onChange={e => mutate(t => ({ ...t, isPublic: e.target.checked }))} />
            </label>
          </div>

          <div className="ui-card te-panel">
            <h3>Summary</h3>
            <div className="te-stats">
              <div><b className="ui-tnum">{test.questions.length}</b><span>questions</span></div>
              <div><b className="ui-tnum">{mcqCount}</b><span>MCQ</span></div>
              <div><b className="ui-tnum">{test.questions.length - mcqCount}</b><span>FRQ</span></div>
            </div>
            {missingKey > 0 && <p className="te-warn">{missingKey} question{missingKey === 1 ? '' : 's'} missing an answer key</p>}
          </div>
        </aside>
      </div>

      {showAiModal && (
        <div className="ui-modal-backdrop no-print" onMouseDown={() => !aiLoading && setShowAiModal(false)}>
          <div className="ui-modal te-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label="Import with AI">
            <div className="te-modal-head">
              <span className="te-modal-icon"><Wand2 size={18} /></span>
              <div>
                <h3>Import with AI</h3>
                <p>Paste notes, a study guide or the text of an old test. AI drafts MCQ and FRQ questions you can edit.</p>
              </div>
            </div>
            <div className="te-modal-body">
              <label>
                <span className="ui-label">Event</span>
                <select className="ui-input" value={aiEvent} onChange={e => setAiEvent(e.target.value)}>
                  <option value="">{test.event || 'General'}</option>
                  {EVENTS.map(ev => <option key={ev.name}>{ev.name}</option>)}
                </select>
              </label>
              <label>
                <span className="ui-label">Source text</span>
                <textarea className="ui-input" value={aiText} onChange={e => setAiText(e.target.value)} placeholder="Paste text here…" rows={10} />
              </label>
              <span className="te-modal-count ui-tnum">{aiText.length.toLocaleString()} characters</span>
            </div>
            <div className="te-modal-foot">
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowAiModal(false)} disabled={aiLoading}>Cancel</button>
              <button className="ui-btn ui-btn-primary" onClick={handleAiImport} disabled={aiLoading || !aiText.trim()}>
                {aiLoading ? <><Loader2 size={15} className="spin" /> Generating…</> : <><Sparkles size={15} /> Generate questions</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {proposal && (
        <div className="ui-modal-backdrop no-print" onMouseDown={() => setProposal(null)}>
          <div className="ui-modal te-diff-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label="Review AI changes">
            <div className="te-modal-head">
              <span className="te-modal-icon"><Sparkles size={18} /></span>
              <div>
                <h3>Review AI changes</h3>
                <p>Nothing changes until you accept. AI can make mistakes, so double-check the answer key.</p>
              </div>
            </div>
            <div className="te-diff-grid">
              {[proposal.before, proposal.after].map((q, k) => (
                <div key={k} className={`te-diff-col${k === 1 ? ' is-after' : ''}`}>
                  <span className="te-diff-label">{k === 0 ? 'Before' : 'After'} · {q.type} · {q.difficulty}</span>
                  <p className="te-diff-q">{q.question || <em>Empty</em>}</p>
                  {q.type === 'MCQ' && (
                    <ul>{(q.options ?? []).map((o, i) => <li key={i} className={o === q.correctAnswer ? 'is-correct' : ''}><b>{String.fromCharCode(65 + i)}</b> {o}</li>)}</ul>
                  )}
                  {q.type === 'FRQ' && <p className="te-diff-key"><b>Key:</b> {q.correctAnswer}</p>}
                  {q.explanation && <p className="te-diff-exp">{q.explanation}</p>}
                </div>
              ))}
            </div>
            <div className="te-modal-foot">
              <button className="ui-btn ui-btn-ghost" onClick={() => setProposal(null)}>Discard</button>
              <button className="ui-btn ui-btn-primary" onClick={acceptProposal}><Check size={15} /> Accept changes</button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareTestModal
          test={test}
          onClose={() => setShowShareModal(false)}
          onShared={() => setTest(prev => (prev ? { ...prev, isPublic: true } : prev))}
        />
      )}
    </div>
  );
}
