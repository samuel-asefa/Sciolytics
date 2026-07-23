import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { wikiData, type WikiInfobox } from '../data/wikiData';
import './EventWiki.css';

// ─── Infobox Component ────────────────────────────────────────────────────────
function InfoboxRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="infobox-row">
      <td className="infobox-label">{label}</td>
      <td className="infobox-value">{children}</td>
    </tr>
  );
}

function Infobox({ name, infobox }: { name: string; infobox: WikiInfobox }) {
  return (
    <aside className="wiki-infobox">
      <table className="infobox-table">
        <tbody>
          <tr>
            <td colSpan={2} className="infobox-header">
              {name}
            </td>
          </tr>
          {infobox.type && <InfoboxRow label="Type">{infobox.type}</InfoboxRow>}
          {infobox.category && <InfoboxRow label="Category">{infobox.category}</InfoboxRow>}
          {infobox.participants !== undefined && (
            <InfoboxRow label="Participants">{infobox.participants}</InfoboxRow>
          )}

          {/* Event Information divider */}
          <tr>
            <td colSpan={2} className="infobox-section-header">Event Information</td>
          </tr>

          {infobox.eyeProtection && (
            <InfoboxRow label="Eye Protection">{infobox.eyeProtection}</InfoboxRow>
          )}
          {infobox.impound !== undefined && (
            <InfoboxRow label="Impound">{infobox.impound ? 'Yes' : 'No'}</InfoboxRow>
          )}
          {infobox.allowedResources && infobox.allowedResources.length > 0 && (
            <InfoboxRow label="Allowed Resources">
              <ul className="infobox-list">
                {infobox.allowedResources.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </InfoboxRow>
          )}
          {infobox.approxTime && (
            <InfoboxRow label="Approx. Time">{infobox.approxTime}</InfoboxRow>
          )}

          {/* History divider */}
          <tr>
            <td colSpan={2} className="infobox-section-header">History</td>
          </tr>

          {infobox.firstAppearance && (
            <InfoboxRow label="First Appearance">{infobox.firstAppearance}</InfoboxRow>
          )}
          {infobox.latestAppearance && (
            <InfoboxRow label="Latest Appearance">{infobox.latestAppearance}</InfoboxRow>
          )}
          {infobox.rotates !== undefined && (
            <InfoboxRow label="Rotates">{infobox.rotates ? 'Yes' : 'No'}</InfoboxRow>
          )}

          {/* Official Resources */}

        </tbody>
      </table>
    </aside>
  );
}

// ─── Table of Contents ────────────────────────────────────────────────────────
function TableOfContents({
  subtopics,
  activeId,
}: {
  subtopics: { id: string; title: string }[];
  activeId: string | null;
}) {
  const [open, setOpen] = useState(true);

  if (subtopics.length === 0) return null;

  return (
    <nav className="wiki-toc">
      <div className="toc-header" onClick={() => setOpen(o => !o)}>
        <span className="toc-title">Contents</span>
        <button className="toc-toggle" aria-label="toggle contents">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
      {open && (
        <ol className="toc-list">
          {subtopics.map((s, i) => (
            <li key={s.id} className={`toc-item ${activeId === s.id ? 'toc-active' : ''}`}>
              <a
                href={`#${s.id}`}
                className="toc-link"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                  window.history.replaceState(null, '', `#${s.id}`);
                }}
              >
                <span className="toc-num">{i + 1}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function EventWiki() {
  const { eventId } = useParams<{ eventId: string }>();
  const data = eventId ? wikiData[eventId] : null;
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll spy — track which section is in view
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!data) return;

    const ids = data.subtopics.map(s => s.id);
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    elements.forEach(el => observerRef.current!.observe(el));
  }, [data]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveId(null);
    const timer = setTimeout(setupObserver, 100);
    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [eventId, setupObserver]);

  if (!data) {
    return (
      <div className="wiki-not-found">
        <h2>Event Not Found</h2>
        <p>The wiki page for this event does not exist yet.</p>
        <Link to="/wiki" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>
          ← Back to Wiki
        </Link>
      </div>
    );
  }

  const tocItems = data.subtopics.map(s => ({ id: s.id, title: s.title }));

  return (
    <div className="wiki-page-wrapper">
      {/* Breadcrumb */}
      <div className="wiki-breadcrumb">
        <Link to="/wiki" className="wiki-breadcrumb-link">
          <ChevronLeft size={16} /> Wiki
        </Link>
        <span className="wiki-breadcrumb-sep">/</span>
        <span className="wiki-breadcrumb-current">{data.name}</span>
      </div>

      {/* Page title */}
      <h1 className="wiki-page-title">{data.name}</h1>



      {/* Body — ToC | Content | Infobox */}
      <div className="wiki-body">

        {/* LEFT: sticky ToC */}
        <div className="wiki-sidebar-left">
          <TableOfContents subtopics={tocItems} activeId={activeId} />
        </div>

        {/* CENTER: main article content */}
        <article className="wiki-article">
          {/* Lead / description */}
          <p className="wiki-lead">{data.description}</p>

          {data.subtopics.length === 0 && (
            <div className="wiki-empty-state">
              <div className="wiki-empty-icon">📝</div>
              <h3>This page is a stub</h3>
              <p>Content for <strong>{data.name}</strong> hasn't been added yet. Check back later — notes will appear here once added.</p>
            </div>
          )}

          {data.subtopics.map((subtopic, sectionIndex) => (
            <section
              key={subtopic.id}
              id={subtopic.id}
              className="wiki-section"
            >
              <h2 className="wiki-section-heading">
                <span className="wiki-section-num">{sectionIndex + 1}</span>
                {subtopic.title}
              </h2>

              <div className="wiki-section-body">
                {subtopic.blocks.map((block, bIdx) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p key={bIdx} className="wiki-paragraph">{block.content}</p>
                    );
                  }
                  if (block.type === 'list' && block.items) {
                    return (
                      <ul key={bIdx} className="wiki-list">
                        {block.items.map((item, iIdx) => {
                          const [bold, ...rest] = item.split(': ');
                          return (
                            <li key={iIdx}>
                              {rest.length > 0
                                ? <><strong>{bold}:</strong> {rest.join(': ')}</>
                                : item}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }
                  if (block.type === 'heading') {
                    const Tag = `h${block.level || 3}` as 'h2' | 'h3';
                    return <Tag key={bIdx} className="wiki-sub-heading">{block.content}</Tag>;
                  }
                  if (block.type === 'image' && block.url) {
                    return (
                      <figure key={bIdx} className="wiki-figure">
                        <img src={block.url} alt={block.alt || ''} className="wiki-img" />
                        {block.caption && <figcaption className="wiki-caption">{block.caption}</figcaption>}
                      </figure>
                    );
                  }
                  if (block.type === 'table' && block.headers && block.rows) {
                    return (
                      <div key={bIdx} className="wiki-table-wrap">
                        <table className="wiki-table">
                          <thead>
                            <tr>{block.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {block.rows.map((row, rIdx) => (
                              <tr key={rIdx}>{row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}</tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </section>
          ))}
        </article>

        {/* RIGHT: infobox */}
        <div className="wiki-sidebar-right">
          {data.infobox && <Infobox name={data.name} infobox={data.infobox} />}
        </div>
      </div>
    </div>
  );
}
