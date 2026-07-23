import { useState } from 'react';
import { User, Mail, MessageSquare, Send, MessageCircle } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  });

  return (
    <div className="practice-page" style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="practice-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Contact Us</h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Have a question, suggestion, or need help? We'd love to hear from you!
        </p>
      </div>

      <div style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
      }}>
        <form className="config-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={15} /> Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} /> Email
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={15} /> Topic
            </label>
            <select
              className="form-select"
              value={formData.topic}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
            >
              <option value="" disabled>Select a topic</option>
              <option value="support">General Support</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="content">Content Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={15} /> Message
            </label>
            <textarea
              className="form-select"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Please describe your inquiry in detail..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Please be as detailed as possible to help us assist you better</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={15} /> Send Message
            </button>
          </div>
        </form>
      </div>

      <div style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
          Other Ways to Reach Us
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}><Mail size={20} /></div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: '4px' }}>
                <a href="mailto:support@sciolytics.com" style={{ color: 'inherit', textDecoration: 'none' }}>Email Support</a>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>We typically respond within 24 hours</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}><MessageCircle size={20} /></div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: '4px' }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Community Support</a>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Join our Discord server for community help and discussions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
