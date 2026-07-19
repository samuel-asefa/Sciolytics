import React, { useState } from 'react';
import { Cat, Database, Zap, Code, Layout, Layers, Shield, Network, Activity, BarChart3, Binary, Server, User } from 'lucide-react';

export default function AboutUs() {
  const [activeTab, setActiveTab] = useState('questions');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'questions':
        return (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
              We manage and serve Science Olympiad practice questions using a modern React architecture powered by Firebase, ensuring lightning-fast load times and a seamless user experience.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9', marginBottom: '12px' }}>
                  <Code size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>React SPA</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  A snappy Single Page Application built with React 19 and React Router for instant page transitions.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '12px' }}>
                  <Database size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Firebase Firestore</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  A flexible, scalable NoSQL cloud database to store and sync questions and user data in real-time.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', marginBottom: '12px' }}>
                  <Zap size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Vite Build Tool</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Lightning-fast Hot Module Replacement (HMR) and optimized production builds.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px' }}>
                  <Layout size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Vanilla CSS Styling</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Clean, themeable CSS variables to support light and dark modes natively without heavy frameworks.
                </p>
              </div>
            </div>
          </>
        );
      case 'teams':
        return (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
              We leverage Firebase Authentication and structured data modeling to ensure team spaces are secure, accessible, and synchronized across devices.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '12px' }}>
                  <Shield size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Firebase Auth</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Secure, robust user sign-in flows and persistent session management.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginBottom: '12px' }}>
                  <Layers size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Document Modeling</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Structuring team rosters and membership roles seamlessly within our cloud database.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px' }}>
                  <Network size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Client-Side State</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  React Hooks to efficiently manage team data context across the application.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '12px' }}>
                  <Activity size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Lucide Icons</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Consistent, beautiful vector iconography that scales perfectly across all team dashboards.
                </p>
              </div>
            </div>
          </>
        );
      case 'analytics':
        return (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
              Visualizing performance is key. We process practice results locally and render insightful, responsive charts instantly.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9', marginBottom: '12px' }}>
                  <BarChart3 size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Recharts Integration</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  A composable charting library built on React components for beautiful, responsive data visualization.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', marginBottom: '12px' }}>
                  <Code size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Client-Side Processing</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Computing averages, accuracy trends, and event statistics directly in the browser to save server costs.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px' }}>
                  <Zap size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Performance Tuning</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Using React's useMemo and useCallback to prevent expensive chart re-renders during navigation.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '12px' }}>
                  <Server size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Framer Motion</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Adding subtle, elegant layout animations to make data interactions feel fluid and modern.
                </p>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="practice-page" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="practice-header" style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px' }}>
          About <span style={{ color: 'var(--primary-color)' }}>Sciolytics</span>
        </h1>
        <p style={{ fontSize: '18px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          We're on a mission to make Science Olympiad practice accessible, engaging, and effective for students everywhere.
        </p>
      </div>

      {/* Our Story */}
      <div style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '40px',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Our Story</h2>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: '800px' }}>
          Hey! I'm Sammy. I built Sciolytics to give Science Olympiad competitors the high-quality, centralized practice platform I always wished I had.
        </p>
      </div>

      {/* Methodology Section */}
      <div style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Methodology</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Explore how we build questions, teams, and analytics.
        </p>
        
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '32px',
          paddingBottom: '8px'
        }}>
          <button
            onClick={() => setActiveTab('questions')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 16px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'questions' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'questions' ? '2px solid var(--primary-color)' : '2px solid transparent',
              marginBottom: '-9px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Database size={16} /> Questions
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 16px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'teams' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'teams' ? '2px solid var(--primary-color)' : '2px solid transparent',
              marginBottom: '-9px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <User size={16} /> Teams
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 16px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'analytics' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'analytics' ? '2px solid var(--primary-color)' : '2px solid transparent',
              marginBottom: '-9px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <BarChart3 size={16} /> Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ textAlign: 'left' }}>
          {renderTabContent()}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Want to get in touch?</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
          We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, our team is here to help.
        </p>
        <button 
          className="btn-primary" 
          onClick={() => window.location.href = '/contact'}
        >
          Contact Us
        </button>
      </div>
    </div>
  );
}
