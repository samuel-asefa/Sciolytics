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
              We obtained Science Olympiad tournament archives with permission. Then, we ran PDF and .docx files of past tests through the latest Google Gemini model to process these questions into a machine-readable format, which are served through a custom API.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Card 1 */}
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px' }}>
                  <Code size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>PDF Processing</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Extract questions from archives, verify Gemini schema with Pydantic.
                </p>
              </div>
              {/* Card 2 */}
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginBottom: '12px' }}>
                  <Zap size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Google Gemini</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Advanced AI processing &amp; answer generation
                </p>
              </div>
              {/* Card 3 */}
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '12px' }}>
                  <Database size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Processing &amp; Storage</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Filter, validate &amp; store in PostgreSQL
                </p>
              </div>
              {/* Card 4 */}
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', marginBottom: '12px' }}>
                  <Layout size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Deployment &amp; Frontend</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Next.js frontend on Serverless Functions
                </p>
              </div>
            </div>
          </>
        );
      case 'teams':
        return (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
              Team spaces combine Postgres-backed rosters, Supabase auth, tRPC APIs, and Ably realtime so captains can manage people, assignments, and live streams without leaving the app.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px' }}>
                  <Layers size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Drizzle &amp; Postgres</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Relational models for teams, memberships, rosters, and assignments.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px' }}>
                  <Shield size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Supabase Auth</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Session handling and secure access to team-scoped data.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginBottom: '12px' }}>
                  <Network size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>tRPC APIs</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  End-to-end typed procedures for team CRUD and roster operations.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '12px' }}>
                  <Activity size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Ably Realtime</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Pub/sub channels for team streams, presence, and live updates in the Next.js app.
                </p>
              </div>
            </div>
          </>
        );
      case 'analytics':
        return (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
              Analytics turn historical results into Elo trends, comparisons, and charts. Offline jobs tune parameters against pairwise loss; visualized with memoized Chart.js configs.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', marginBottom: '12px' }}>
                  <Code size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Offline tuning</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Python scripts optimize config weights against tournament loss surfaces—stochastic refinement of nationals vs. state tradeoffs before we freeze params for the next publish.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px' }}>
                  <Activity size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Elo rating engine</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Score-based pairwise updates with K-factors that shrink as teams play more, damped deltas, recency-weighted events, and season-to-season regression toward a target rating between events.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '12px' }}>
                  <Server size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Precomputed state</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  MessagePack bundles ship precomputed Elo, metadata, and histories per division and state group so the dashboard loads compact static files instead of recomputing ratings in the browser.
                </p>
              </div>
              <div style={{ background: 'var(--bg-gray)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9', marginBottom: '12px' }}>
                  <BarChart3 size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Frontend</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Memoized Chart.js configs, memo-wrapped chart tabs, and useLazyEloData merging msgpack slices so school, event, and season changes recompute trend lines only when the loaded Elo series change.
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
