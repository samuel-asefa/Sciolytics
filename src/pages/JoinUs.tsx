import React, { useState } from 'react';
import { User, Mail, MessageCircle, Briefcase, Clock, GraduationCap, Heart } from 'lucide-react';

export default function JoinUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    communication: '',
    position: '',
    hours: '',
    experience: '',
    whyJoin: '',
  });

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="practice-page" style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="practice-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Join Our Team</h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Become a Sciolytics developer! Join a team of highly motivated high school and college students working on a site that thousands of competitors use every day.<br />
          <strong style={{ color: 'var(--text-primary)' }}>Better Science Olympiad practice, for everyone.</strong>
        </p>
      </div>

      <div style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
      }}>
        <form className="config-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={15} /> Full Name *
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} /> Email *
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={15} /> Preferred communication medium
            </label>
            <input
              type="text"
              placeholder="For example: Text messages, 123-456-7890"
              value={formData.communication}
              onChange={e => setFormData({ ...formData, communication: e.target.value })}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>How should we communicate with you day-to-day? A Discord handle is preferred but not required!</span>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={15} /> Position of Interest *
            </label>
            <select
              className="form-select"
              value={formData.position}
              onChange={e => setFormData({ ...formData, position: e.target.value })}
              required
            >
              <option value="" disabled>Select a position</option>
              <option value="frontend">Frontend Developer (React/Next.js)</option>
              <option value="backend">Backend Developer (PostgreSQL/Supabase)</option>
              <option value="design">UI/UX Designer</option>
              <option value="marketing">Marketing & Outreach</option>
              <option value="content">Content Writer (Questions & Wiki)</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} /> Hours Able to Contribute per Week *
            </label>
            <select
              className="form-select"
              value={formData.hours}
              onChange={e => setFormData({ ...formData, hours: e.target.value })}
              required
            >
              <option value="" disabled>Select hours per week</option>
              <option value="1-3">1-3 hours</option>
              <option value="3-5">3-5 hours</option>
              <option value="5-10">5-10 hours</option>
              <option value="10+">10+ hours</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={15} /> Relevant Experience
            </label>
            <textarea
              className="form-select"
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Tell us about your relevant experience, skills, and background... (50 words max)"
              value={formData.experience}
              onChange={e => setFormData({ ...formData, experience: e.target.value })}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '-4px' }}>
              <span style={{ maxWidth: '85%' }}>We're looking for people ready to hustle! If you have any, link relevant projects, Instagram accounts if you want to market, GitHub if you want to write code, etc.</span>
              <span style={{ color: getWordCount(formData.experience) > 50 ? 'red' : 'inherit' }}>
                {getWordCount(formData.experience)}/50 words
              </span>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={15} /> Why do ya wanna join? *
            </label>
            <textarea
              className="form-select"
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Please tell us why you'd like to join our team and what you can bring to Sciolytics... (50 words max)"
              value={formData.whyJoin}
              onChange={e => setFormData({ ...formData, whyJoin: e.target.value })}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '-4px' }}>
              <span style={{ maxWidth: '85%' }}>Yes, it's a resume line. But what else interests you about a position with Sciolytics?</span>
              <span style={{ color: getWordCount(formData.whyJoin) > 50 ? 'red' : 'inherit' }}>
                {getWordCount(formData.whyJoin)}/50 words
              </span>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '16px', width: '100%' }}>
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
