import { Mail, Book, MessageCircle } from 'lucide-react';

export default function Help() {
  return (
    <div className="resources-page">
      <h1>Help & Support</h1>
      <p>Need assistance? Find answers to common questions or reach out to our team.</p>
      
      <div className="resource-cards" style={{ marginTop: '30px' }}>
        <div className="resource-card">
          <Book size={32} />
          <h3>Getting Started Guide</h3>
          <p>Learn the basics of how to use Sciolytics to improve your Science Olympiad scores.</p>
        </div>
        <div className="resource-card">
          <MessageCircle size={32} />
          <h3>FAQ</h3>
          <p>Browse through frequently asked questions about events, scoring, and app features.</p>
        </div>
        <div className="resource-card">
          <Mail size={32} />
          <h3>Contact Support</h3>
          <p>Can't find what you're looking for? Email us at support@sciolytics.com.</p>
        </div>
      </div>

      <div className="events-panel" style={{ marginTop: '40px', padding: '30px' }}>
        <h2>Frequently Asked Questions</h2>
        
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-primary)' }}>How do I change my theme?</h4>
            <p style={{ color: 'var(--text-secondary)' }}>You can change your theme by navigating to your Profile page and selecting a new color from the App Theme palette.</p>
          </div>
          
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-primary)' }}>How are questions scored?</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Multiple Choice questions (MCQ) are automatically graded. Free Response questions (FRQ) are graded based on whether your answer contains the required keywords for the topic.</p>
          </div>
          
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-primary)' }}>Where do the practice questions come from?</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Our question bank is curated from past Science Olympiad tournaments, official study materials, and community contributions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
