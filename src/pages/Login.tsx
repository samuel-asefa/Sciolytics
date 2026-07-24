import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Target, BarChart2, Calendar, BookOpen, Users, Globe, Sparkles, Share2, LayoutList } from 'lucide-react';
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
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign in with Google');
      }
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
          <button className="btn-primary" style={{ borderRadius: '9999px' }} onClick={handleGoogleSignIn} disabled={loading}>
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
            <button className="btn-primary hero-btn" style={{ borderRadius: '9999px' }} onClick={handleGoogleSignIn} disabled={loading}>
              Start practicing
            </button>
            {error && <p style={{ color: 'red', marginTop: '1rem', fontSize: '1rem' }}>{error}</p>}
          </motion.div>
        </motion.div>
      </section>
      <section className="social-proof">
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', fontWeight: 500 }}>
          Sciolytics helps students win medals at Science Olympiad Invitationals hosted by:
        </p>
        <div className="social-proof-marquee">
          <div className="social-proof-logos">
            <img src="/mit.png" alt="MIT" />
            <img src="/stanford.png" alt="Stanford" />
            <img src="/harvard.png" alt="Harvard" />
            <img src="/princeton.png" alt="Princeton" />
            <img src="/yale.png" alt="Yale" />
            <img src="/columbia.png" alt="Columbia" />
            <img src="/upenn.png" alt="UPenn" />
            <img src="/cornell.png" alt="Cornell" />
            <img src="/berkeley.png" alt="Berkeley" />
            <img src="/cmu.png" alt="CMU" />
            {/* Duplicated for seamless scrolling */}
            <img src="/mit.png" alt="MIT" />
            <img src="/stanford.png" alt="Stanford" />
            <img src="/harvard.png" alt="Harvard" />
            <img src="/princeton.png" alt="Princeton" />
            <img src="/yale.png" alt="Yale" />
            <img src="/columbia.png" alt="Columbia" />
            <img src="/upenn.png" alt="UPenn" />
            <img src="/cornell.png" alt="Cornell" />
            <img src="/berkeley.png" alt="Berkeley" />
            <img src="/cmu.png" alt="CMU" />
          </div>
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
            <button className="btn-primary" style={{ borderRadius: '9999px' }} onClick={handleGoogleSignIn}>Get started for free</button>
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
            <button className="btn-primary" style={{ borderRadius: '9999px' }} onClick={handleGoogleSignIn}>Get started for free</button>
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
        <motion.div 
          className="feature-row reverse"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="feature-text">
            <h2>Turn any PDF into a practice test</h2>
            <p>
              Don't want to type out questions? Use our Antigravity AI Test Importer (Powered by Gemini) 
              to instantly convert old tournament PDFs into interactive, digital practice tests in seconds.
            </p>
          </div>
          <div className="feature-graphic">
            <div className="mock-ui" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', background: '#e0e7ff', borderRadius: '50%', marginBottom: '1rem' }}>
                <Sparkles size={32} color="#4f46e5" />
              </div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>AI Importer</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Upload a PDF exam and let Gemini do the rest.</p>
              <div style={{ padding: '1.5rem', border: '2px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Drop tournament_test.pdf here</span>
              </div>
              <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%', borderRadius: '8px' }}>Generate Test</button>
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
            <h2>Train together, win together</h2>
            <p>
              Create teams, invite your partners, and share custom tests directly to your team's stream. 
              Compete on leaderboards and see exactly where your team needs the most practice.
            </p>
          </div>
          <div className="feature-graphic">
            <div className="mock-ui">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <Users size={20} color="var(--primary-color-dark)"/> 
                <span style={{ fontWeight: 600 }}>Science Olympiad Team</span>
                <span style={{ marginLeft: 'auto', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>PRO</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>1. Alice S.</span>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>92% Avg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>2. Bob M.</span>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>88% Avg</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                  <Share2 size={16} /> Shared "Hard Anatomy Set" to stream
                </div>
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
            <h2>Create & publish to the Community</h2>
            <p>
              Build your own custom practice tests and publish them to the official Community Bank. 
              Admins review submissions to ensure the highest quality questions are available for everyone.
            </p>
          </div>
          <div className="feature-graphic">
            <div className="mock-ui">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Globe size={20} color="#10b981"/> 
                <span style={{ fontWeight: 600 }}>Community Tests</span>
              </div>
              <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '12px', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>Ultimate Cell Biology Quiz</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>By Samuel • 50 Questions</p>
                <div style={{ display: 'inline-block', background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                  ✓ OFFICIAL
                </div>
              </div>
              <button className="btn-primary" style={{ width: '100%', borderRadius: '8px', background: '#10b981' }}>Take Test</button>
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
            <h2>Beautiful Event Wikis</h2>
            <p>
              Ditch the messy Google Docs. Our event wikis are clean, distraction-free, 
              and designed specifically for deep study. Access rules, study guides, and past exams all in one place.
            </p>
          </div>
          <div className="feature-graphic">
            <div className="mock-ui" style={{ background: '#f8fafc', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 12px 24px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <LayoutList size={20} color="#3b82f6"/> 
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Event Wiki</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '30%', borderRight: '1px solid #e2e8f0', paddingRight: '1rem' }}>
                  <div style={{ height: '8px', background: '#bfdbfe', borderRadius: '4px', marginBottom: '0.5rem', width: '80%' }}></div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '0.5rem', width: '60%' }}></div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', width: '90%' }}></div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800 }}>Anatomy & Physiology</h3>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '0.5rem', width: '100%' }}></div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '0.5rem', width: '100%' }}></div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', width: '70%' }}></div>
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

