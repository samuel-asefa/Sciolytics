import { useState } from 'react';
import { Mail, BookOpen, MessageCircle, ChevronDown, Zap, Users, BarChart2, Settings2, Bookmark, Star } from 'lucide-react';

const faqs = [
  {
    q: 'How do I change my theme?',
    a: 'Navigate to Settings and pick any color from the App Theme palette. You can also adjust brightness (Light, Default, Dim, Dark, Darker) and the background style — including animated options like stars, wind streams, and city skyline.',
    icon: 'settings',
  },
  {
    q: 'How are questions scored?',
    a: 'Multiple Choice (MCQ) answers are graded instantly and automatically. Free Response (FRQ) answers are compared against a set of required keywords — your score reflects how many key concepts your answer contains.',
    icon: 'zap',
  },
  {
    q: 'Where do the practice questions come from?',
    a: 'Our question bank is curated from past Science Olympiad invitational and official tournaments, official study materials, and community contributions. All questions are reviewed for accuracy.',
    icon: 'book',
  },
  {
    q: "Why don't my favorited events show up on the dashboard?",
    a: 'Make sure you star events in the Practice section by clicking the heart icon next to an event name. Favorites sync automatically and will appear on your Dashboard as quick-launch cards.',
    icon: 'star',
  },
  {
    q: 'How can I update my profile details?',
    a: 'Go to your Profile page and click "Edit Profile". Update your display name, bio, school, or grade level, then click "Save Changes". All changes are securely saved to your account in real time.',
    icon: 'users',
  },
  {
    q: 'How do I track my progress?',
    a: 'Visit the Analytics page to see detailed breakdowns of your accuracy by event, question type, and difficulty. The Dashboard also shows your daily activity heatmap and weekly performance chart.',
    icon: 'chart',
  },
  {
    q: 'What are Bookmarks?',
    a: 'You can bookmark any question during a practice session by clicking the bookmark icon. Revisit all saved questions anytime from the Bookmarks page to review material you found challenging.',
    icon: 'bookmark',
  },
  {
    q: 'How do Teams work?',
    a: 'Teams let you collaborate with teammates. Create a team, share your join code, assign events to members, post updates in the team stream, and set up roles with custom permissions — all in one place.',
    icon: 'users',
  },
];

const iconMap: Record<string, React.ReactNode> = {
  settings: <Settings2 size={17} />,
  zap: <Zap size={17} />,
  book: <BookOpen size={17} />,
  star: <Star size={17} />,
  users: <Users size={17} />,
  chart: <BarChart2 size={17} />,
  bookmark: <Bookmark size={17} />,
};

const quickLinks = [
  {
    icon: <BookOpen size={22} />,
    title: 'Getting Started',
    desc: 'Learn the basics and get up to speed with Sciolytics in minutes.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
  },
  {
    icon: <MessageCircle size={22} />,
    title: 'FAQ',
    desc: 'Answers to the most common questions about events, scoring, and features.',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.12)',
  },
  {
    icon: <Mail size={22} />,
    title: 'Contact Support',
    desc: "Email us at support@sciolytics.com",
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    href: 'mailto:support@sciolytics.com',
  },
];

function FAQItem({ q, a, icon }: { q: string; a: string; icon: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1px solid var(--border)',
        background: 'var(--bg-white)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--card-shadow)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '18px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--primary-color)', flexShrink: 0 }}>{iconMap[icon]}</span>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{q}</span>
        </div>
        <span style={{ color: 'var(--text-secondary)', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-flex' }}>
          <ChevronDown size={17} />
        </span>
      </button>
      {open && (
        <div style={{
          padding: '14px 20px 18px 50px',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          lineHeight: 1.75,
          borderTop: '1px solid var(--border)',
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <div className="practice-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="practice-header" style={{ marginBottom: '32px' }}>
        <h1>Help &amp; Support</h1>
        <p>Find answers, get guidance, or reach out — we've got you covered.</p>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '40px' }}>
        {quickLinks.map(link => (
          <div
            key={link.title}
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              cursor: link.href ? 'pointer' : 'default',
              transition: 'transform 0.18s, box-shadow 0.18s',
            }}
            onClick={() => link.href && window.open(link.href)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.color }}>
              {link.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{link.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{link.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Frequently Asked Questions</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '18px' }}>Click any question to expand the answer.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} icon={f.icon} />)}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        marginTop: '36px',
        padding: '26px 28px',
        borderRadius: '16px',
        background: 'color-mix(in srgb, var(--primary-color) 10%, var(--bg-white))',
        border: '1px solid color-mix(in srgb, var(--primary-color) 25%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '3px' }}>Still need help?</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Our support team typically replies within 24 hours.</div>
        </div>
        <a
          href="mailto:support@sciolytics.com"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          <Mail size={15} />
          Email Support
        </a>
      </div>
    </div>
  );
}
