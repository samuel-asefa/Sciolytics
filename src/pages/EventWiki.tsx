import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import { wikiData } from '../data/wikiData';
import '../App.css'; // or you can make a specific EventWiki.css if needed

export default function EventWiki() {
  const { eventId } = useParams<{ eventId: string }>();
  const data = eventId ? wikiData[eventId] : null;

  // Handle anchor scrolling for subtopics if there's a hash in the URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [eventId]);

  if (!data) {
    return (
      <div className="practice-page">
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Event Not Found</h2>
          <p>The wiki page for this event does not exist yet.</p>
          <Link to="/resources" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>
            Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/resources" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>
          <ChevronLeft size={20} /> Back to Resources
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Sidebar Navigation */}
        <aside style={{ position: 'sticky', top: '20px', background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <FileText size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Contents</h3>
          </div>
          <nav>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.subtopics.map(subtopic => (
                <li key={subtopic.id}>
                  <a 
                    href={`#${subtopic.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(subtopic.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        window.history.pushState(null, '', `#${subtopic.id}`);
                      }
                    }}
                    style={{ 
                      color: 'var(--text-secondary)', 
                      textDecoration: 'none', 
                      fontSize: '14px',
                      display: 'block',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      transition: 'background 0.2s, color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {subtopic.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={{ paddingBottom: '100px' }}>
          <header style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', color: 'var(--text-primary)' }}>{data.name}</h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>{data.description}</p>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {data.subtopics.map(subtopic => (
              <section key={subtopic.id} id={subtopic.id} style={{ scrollMarginTop: '40px' }}>
                <h2 style={{ fontSize: '24px', color: 'var(--primary-color)', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                  {subtopic.title}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {subtopic.blocks.map((block, index) => {
                    if (block.type === 'paragraph') {
                      return <p key={index} style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-primary)' }}>{block.content}</p>;
                    }
                    if (block.type === 'list' && block.items) {
                      return (
                        <ul key={index} style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                          {block.items.map((item, i) => (
                            <li key={i} style={{ marginBottom: '5px' }}>{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.type === 'image' && block.url) {
                      return (
                        <div key={index} style={{ margin: '15px 0' }}>
                          <img src={block.url} alt={block.alt || 'Wiki Image'} style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
