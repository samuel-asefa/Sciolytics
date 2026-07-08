import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Target, BarChart2, Calendar, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Login() {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };
  const mockStats = [
    { name: 'Anatomy', accuracy: 85 },
    { name: 'Astronomy', accuracy: 62 },
    { name: 'Disease', accuracy: 90 },
    { name: 'Fossils', accuracy: 45 }
  ];

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <span>Sciolytics</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <button className="btn-primary" onClick={handleGoogleSignIn} disabled={loading}>
            {loading ? 'Opening...' : 'Open App'}
          </button>
        </div>
      </nav>
      <section className="landing-hero">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.h1 variants={fadeInUp}>
            The #1 Science Olympiad Platform.<br />
            Now with advanced analytics.
          </motion.h1>
          <motion.p variants={fadeInUp}>
            Thousands of expert-written questions. Deep performance tracking.<br />
            Everything you need to medal in your events.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <button className="btn-primary hero-btn" onClick={handleGoogleSignIn} disabled={loading}>
              Start practicing
            </button>
            {error && <p style={{ color: 'red', marginTop: '1rem', fontSize: '1rem' }}>{error}</p>}
          </motion.div>
        </motion.div>
      </section>
      <section className="social-proof">
        <p>Sciolytics helps students win medals at Science Olympiad Invitationals hosted by:</p>
        <div className="social-proof-logos">
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>MIT</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'serif' }}>Stanford</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'serif' }}>Harvard</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'serif' }}>Yale</span>
        </div>
      </section>
      <section id="features" className="feature-section">
        <motion.div 
          className="feature-row"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="feature-text">
            <h2>Never stay stuck on a question</h2>
            <p>
              Over 500+ human-written Science Olympiad questions across 20+ events, 
              each with a step-by-step walkthrough and instant feedback to ensure you 
              understand the core scientific concepts.
            </p>
            <br/>
            <button className="btn-primary" onClick={handleGoogleSignIn}>Get started for free</button>
          </div>
          <div className="feature-graphic">
            <div className="mock-ui">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <BookOpen size={20} color="var(--primary-color-dark)"/> 
                <span style={{ fontWeight: 600 }}>Anatomy & Physiology</span>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                <strong>Q:</strong> Which of the following is an example of a steroid hormone?
              </p>
              <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>✕</span>
                Insulin
              </div>
              <div style={{ padding: '0.75rem', background: '#d1fae5', color: '#059669', borderRadius: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>✓</span>
                Cortisol
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: '#475569' }}>
                <strong>Explanation:</strong> Cortisol is a steroid hormone produced by the adrenal cortex. Insulin is a peptide hormone.
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="feature-row reverse"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="feature-text">
            <h2>Know your weak spots</h2>
            <p>
              See weekly activity, accuracy by topic, and time share by difficulty 
              so you know exactly what to study. Our advanced analytics break down 
              your performance across every subtopic.
            </p>
            <br/>
            <button className="btn-primary" onClick={handleGoogleSignIn}>Get started for free</button>
          </div>
          <div className="feature-graphic">
            <div className="mock-ui">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BarChart2 size={20} color="var(--primary-color-dark)"/> 
                <span style={{ fontWeight: 600 }}>Accuracy by Event</span>
              </div>
              <div style={{ height: '200px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStats} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={80} axisLine={false} tickLine={false} style={{ fontSize: '0.8rem' }} />
                    <Tooltip />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={12}>
                      {mockStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.accuracy > 70 ? '#10b981' : entry.accuracy > 50 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="feature-row"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="feature-text">
            <h2>Stop wondering what to study next</h2>
            <p>
              Each week's schedule is built from your tournament date and latest activity. 
              The plan recalibrates as your accuracy changes, ensuring you are always focused 
              on the highest-impact areas.
            </p>
          </div>
          <div className="feature-graphic">
            <div className="mock-ui" style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '12px' }}>
                <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: '8px' }}>
                  <Target color="#4f46e5" size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Fossils Practice Set</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Mixed • 45 min • 20 questions</p>
                </div>
                <button className="btn-primary" style={{ marginLeft: 'auto', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Start</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '12px' }}>
                <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '8px' }}>
                  <Calendar color="#d97706" size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>State Tournament</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>49 days 12 hrs remaining</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </section>
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          Sciolytics
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} Sciolytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

