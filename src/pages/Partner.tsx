import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Handshake, Users, Radio, Flag, Timer, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { questionService, type QuestionFilter } from '../services/questionService';
import { partnerService, normalizeCode } from '../services/partnerService';
import { useToast } from '../components/Toast';
import { STUDY_EVENTS } from '../lib/events';
import './Partner.css';

export default function Partner() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { currentUser } = useAuth();
  const incoming = location.state as { filter?: QuestionFilter; timeLimit?: number } | null;

  const [event, setEvent] = useState(incoming?.filter?.event ?? STUDY_EVENTS[0].name);
  const [count, setCount] = useState(incoming?.filter?.limit ?? 15);
  const [minutes, setMinutes] = useState(incoming?.timeLimit ?? 20);
  const [type, setType] = useState<'All' | 'MCQ'>(incoming?.filter?.type === 'MCQ' ? 'MCQ' : 'All');
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [available, setAvailable] = useState<number | null>(null);

  useEffect(() => {
    questionService.initialize().then(() => {
      setAvailable(questionService.getQuestions({ ...(incoming?.filter ?? {}), event, type, limit: undefined }).length);
    });
  }, [event, type, incoming?.filter]);

  const host = async () => {
    if (!currentUser) return;
    setCreating(true);
    try {
      await questionService.initialize();
      const filter: QuestionFilter = { ...(incoming?.filter ?? {}), event, type, limit: count };
      const qs = questionService.getQuestions(filter);
      if (!qs.length) { toast('No questions match. Pick another event.', 'error'); setCreating(false); return; }
      const sessionCode = await partnerService.create(currentUser, {
        title: `${event}${filter.subtopic ? ` · ${filter.subtopic}` : ''}`,
        event,
        questionIds: qs.map(q => q.id),
        timeLimitSec: minutes > 0 ? minutes * 60 : null,
      });
      navigate(`/partner/${sessionCode}`);
    } catch (err) {
      console.error(err);
      toast('Could not create a session. Partner mode needs the latest Firestore rules deployed.', 'error');
      setCreating(false);
    }
  };

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    const c = normalizeCode(code);
    if (c.length !== 6) { toast('Codes are 6 characters', 'info'); return; }
    navigate(`/partner/${c}`);
  };

  return (
    <div className="ui-page partner">
      <header className="partner-hero">
        <span className="ui-eyebrow"><Handshake size={13} /> Partner mode</span>
        <h1>Practice like it’s <span className="ui-serif" style={{ fontStyle: 'italic' }}>competition day</span>.</h1>
        <p>Most Science Olympiad events are taken in pairs. Share a code, take one test on a shared answer sheet, and see each other’s work live.</p>
      </header>

      <div className="partner-grid">
        <section className="ui-card partner-card">
          <div className="partner-card-head">
            <span className="partner-card-icon"><Radio size={18} /></span>
            <div>
              <h2>Host a session</h2>
              <p className="ui-muted">Pick a test, then send your partner the code.</p>
            </div>
          </div>
          <div className="partner-form">
            <label>
              <span className="ui-label">Event</span>
              <select className="ui-input" value={event} onChange={e => setEvent(e.target.value)}>
                {STUDY_EVENTS.map(ev => <option key={ev.name}>{ev.name}</option>)}
              </select>
            </label>
            <div className="partner-row">
              <label>
                <span className="ui-label">Questions</span>
                <input className="ui-input" type="number" min={1} max={100} value={count} onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))} />
              </label>
              <label>
                <span className="ui-label">Minutes (0 = untimed)</span>
                <input className="ui-input" type="number" min={0} max={180} value={minutes} onChange={e => setMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))} />
              </label>
            </div>
            <div>
              <span className="ui-label">Question types</span>
              <div className="ui-segment" style={{ display: 'flex' }}>
                <button style={{ flex: 1 }} className={type === 'All' ? 'is-active' : ''} onClick={() => setType('All')}>Mixed</button>
                <button style={{ flex: 1 }} className={type === 'MCQ' ? 'is-active' : ''} onClick={() => setType('MCQ')}>Multiple choice only</button>
              </div>
            </div>
            {available !== null && <span className="partner-avail ui-tnum">{available} questions available{incoming?.filter?.subtopic ? ` in ${incoming.filter.subtopic}` : ''}</span>}
            <button className="ui-btn ui-btn-primary ui-btn-lg" onClick={host} disabled={creating}>
              {creating ? <Loader2 size={16} className="spin" /> : <Radio size={16} />} {creating ? 'Creating…' : 'Create session'}
            </button>
          </div>
        </section>

        <section className="ui-card partner-card">
          <div className="partner-card-head">
            <span className="partner-card-icon is-alt"><KeyRound size={18} /></span>
            <div>
              <h2>Join a partner</h2>
              <p className="ui-muted">Enter the 6-character code they sent you.</p>
            </div>
          </div>
          <form className="partner-join" onSubmit={join}>
            <input
              className="partner-code-input"
              value={code}
              onChange={e => setCode(normalizeCode(e.target.value))}
              placeholder="ABC123"
              maxLength={6}
              aria-label="Session code"
              autoCapitalize="characters"
              spellCheck={false}
            />
            <button className="ui-btn ui-btn-ink ui-btn-lg" disabled={code.length !== 6}>Join <ArrowRight size={16} /></button>
          </form>

          <ul className="partner-how">
            <li><Users size={16} /><span><b>One shared sheet.</b> Either partner can answer, and you see who did.</span></li>
            <li><Flag size={16} /><span><b>Flag for your partner.</b> Mark a question “check this” and they’ll see it.</span></li>
            <li><Timer size={16} /><span><b>Shared timer.</b> Same clock for both of you, just like the real thing.</span></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
