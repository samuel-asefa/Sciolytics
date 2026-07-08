import { useState } from 'react';
import { Lock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoadTest() {
  const [testCode, setTestCode] = useState('');
  const navigate = useNavigate();

  const handleLoadTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (testCode.trim()) {
      alert(`Loading test session with code: ${testCode}`);
      navigate('/practice/test'); // Navigate to a practice session
    }
  };

  return (
    <div className="practice-page">
      <div className="practice-header">
        <h1>Load Test with Code</h1>
        <p>Enter a test code provided by a friend or coach to take a specific test.</p>
      </div>

      <div className="events-panel" style={{ gridColumn: 'span 2', maxWidth: '600px', margin: '0 auto' }}>
        <div className="events-header">
          <h2>Enter Test Code</h2>
          <Lock className="action-icon" />
        </div>
        
        <form onSubmit={handleLoadTest} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <div className="form-group">
            <label htmlFor="testCode">Test Code</label>
            <input
              type="text"
              id="testCode"
              className="form-input"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              placeholder="e.g. SCIO-2027-ABC"
              required
              style={{ fontSize: '18px', padding: '16px', letterSpacing: '2px', textAlign: 'center' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px' }}>
            <Play size={20} />
            Start Test
          </button>
        </form>
      </div>
    </div>
  );
}
