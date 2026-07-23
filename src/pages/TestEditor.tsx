import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Printer, Wand2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type CustomTest } from '../services/firestoreService';
import { aiTestImportService } from '../services/aiTestImportService';
import type { Question } from '../data/questionBank';
import PageLoadingScreen from '../components/PageLoadingScreen';
import './TestEditor.css';

export default function TestEditor() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [test, setTest] = useState<CustomTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiEvent, setAiEvent] = useState('General');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !testId) return;
    loadTest();
  }, [currentUser, testId]);

  const loadTest = async () => {
    try {
      const data = await firestoreService.getCustomTest(testId!);
      if (!data || data.creatorId !== currentUser?.uid) {
        alert('Test not found or unauthorized.');
        navigate('/create');
        return;
      }
      setTest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!test || !testId) return;
    setSaving(true);
    try {
      await firestoreService.updateCustomTest(testId, {
        title: test.title,
        description: test.description,
        questions: test.questions
      });
      // maybe show a toast
    } catch (err) {
      console.error('Error saving', err);
      alert('Failed to save test.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!test) return;
    const newQ: Question = {
      id: crypto.randomUUID(),
      event: 'General',
      subtopic: 'General',
      division: 'Both',
      difficulty: 'Medium',
      type: 'MCQ',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    };
    setTest({ ...test, questions: [...test.questions, newQ] });
  };

  const handleRemoveQuestion = (id: string) => {
    if (!test) return;
    setTest({ ...test, questions: test.questions.filter(q => q.id !== id) });
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    if (!test) return;
    setTest({
      ...test,
      questions: test.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
    });
  };

  const handleOptionChange = (qId: string, optIndex: number, val: string) => {
    if (!test) return;
    setTest({
      ...test,
      questions: test.questions.map(q => {
        if (q.id === qId && q.options) {
          const newOpts = [...q.options];
          newOpts[optIndex] = val;
          return { ...q, options: newOpts };
        }
        return q;
      })
    });
  };

  const handleAiImport = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const generated = await aiTestImportService.generateTestFromText(aiText, aiEvent);
      if (test) {
        setTest({ ...test, questions: [...test.questions, ...generated] });
      }
      setShowAiModal(false);
      setAiText('');
    } catch (err) {
      console.error('AI Import Error', err);
      alert('Failed to generate questions from text. Please try again or provide different text.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !test) return <PageLoadingScreen loading={true} />;

  return (
    <div className="test-editor-page">
      <div className="editor-header no-print">
        <button className="back-btn" onClick={() => navigate('/create')}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="editor-actions">
          <button className="btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print / PDF
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} 
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="test-meta">
          <input 
            type="text" 
            className="test-title-input" 
            value={test.title} 
            onChange={e => setTest({...test, title: e.target.value})}
            placeholder="Test Title"
          />
          <textarea 
            className="test-desc-input"
            value={test.description}
            onChange={e => setTest({...test, description: e.target.value})}
            placeholder="Test Description or Instructions"
          />
        </div>

        <div className="questions-list">
          {test.questions.map((q, i) => (
            <div key={q.id} className="question-card">
              <div className="question-header no-print">
                <span className="q-number">Question {i + 1}</span>
                <div className="q-controls">
                  <select value={q.type} onChange={e => handleQuestionChange(q.id, 'type', e.target.value)}>
                    <option value="MCQ">Multiple Choice</option>
                    <option value="FRQ">Free Response</option>
                  </select>
                  <select value={q.difficulty} onChange={e => handleQuestionChange(q.id, 'difficulty', e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <button className="btn-icon danger" onClick={() => handleRemoveQuestion(q.id)}><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Print Only Header */}
              <div className="print-only print-q-header">
                <strong>{i + 1}.</strong> 
              </div>

              <textarea 
                className="q-text-input" 
                value={q.question} 
                onChange={e => handleQuestionChange(q.id, 'question', e.target.value)}
                placeholder="Question text..."
              />

              {q.type === 'MCQ' && (
                <div className="q-options">
                  {q.options?.map((opt, oIdx) => (
                    <div key={oIdx} className="option-row">
                      <div className="opt-letter">{String.fromCharCode(65 + oIdx)}.</div>
                      <input 
                        type="text" 
                        value={opt} 
                        onChange={e => handleOptionChange(q.id, oIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      />
                      <input 
                        type="radio" 
                        name={`answer-${q.id}`} 
                        checked={q.correctAnswer === opt && opt !== ''} 
                        onChange={() => handleQuestionChange(q.id, 'correctAnswer', opt)}
                        className="no-print"
                      />
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'FRQ' && (
                <div className="q-frq-answer">
                  <textarea 
                    value={q.correctAnswer}
                    onChange={e => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                    placeholder="Correct Answer Key..."
                  />
                  <div className="print-only print-frq-lines"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="editor-footer no-print">
          <button className="btn-add" onClick={handleAddQuestion}>
            <Plus size={16} /> Add Question
          </button>
          <button className="btn-ai" onClick={() => setShowAiModal(true)}>
            <Wand2 size={16} /> Import with AI
          </button>
        </div>
      </div>

      {showAiModal && (
        <div className="modal-overlay no-print">
          <div className="modal-content ai-modal">
            <h2>Import with Antigravity AI</h2>
            <p>Paste notes, Wikipedia articles, or study guides below. Gemini will extract high-quality MCQ and FRQ questions.</p>
            
            <label>Event Category</label>
            <input type="text" value={aiEvent} onChange={e => setAiEvent(e.target.value)} placeholder="e.g. Anatomy, Astronomy..." />

            <label>Source Text</label>
            <textarea 
              value={aiText} 
              onChange={e => setAiText(e.target.value)} 
              placeholder="Paste text here..."
              rows={10}
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAiModal(false)} disabled={aiLoading}>Cancel</button>
              <button className="btn-primary" onClick={handleAiImport} disabled={aiLoading || !aiText.trim()}>
                {aiLoading ? <><Loader2 size={16} className="spin" /> Generating...</> : 'Generate Questions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
