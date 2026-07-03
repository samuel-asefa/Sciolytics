import { BookOpen, Link as LinkIcon, Download, Video, FileText } from 'lucide-react';

export default function Resources() {
  return (
    <div className="practice-page">
      <div className="practice-header">
        <h1>Resources & Study Materials</h1>
        <p>Explore a comprehensive collection of resources to dominate your Science Olympiad events.</p>
      </div>

      <div className="events-panel" style={{ gridColumn: 'span 2', padding: '30px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          Official Links
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <a href="https://www.soinc.org" target="_blank" rel="noreferrer" className="action-card" style={{ textDecoration: 'none' }}>
            <LinkIcon className="action-icon" size={24} />
            <div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Science Olympiad Inc.</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>The official website for rules and news.</p>
            </div>
          </a>
          <a href="https://scioly.org/wiki/index.php/Main_Page" target="_blank" rel="noreferrer" className="action-card" style={{ textDecoration: 'none' }}>
            <BookOpen className="action-icon green" size={24} />
            <div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Scioly.org Wiki</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>Community-driven event guides and notes.</p>
            </div>
          </a>
          <a href="https://scioly.org/tests/" target="_blank" rel="noreferrer" className="action-card" style={{ textDecoration: 'none' }}>
            <Download className="action-icon" size={24} />
            <div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Test Exchange</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>Thousands of past tournament tests.</p>
            </div>
          </a>
        </div>

        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          Recommended Textbooks by Subject
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Life Sciences (Anatomy, Disease Detectives)</h3>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)' }}>
              <li><strong>Campbell Biology (12th Edition)</strong> - The holy grail for any life science event.</li>
              <li><strong>Vander's Human Physiology</strong> - Excellent for Anatomy & Physiology.</li>
              <li><strong>Principles of Epidemiology in Public Health Practice (CDC)</strong> - Essential for Disease Detectives.</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Earth & Space Sciences (Astronomy, Dynamic Planet)</h3>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)' }}>
              <li><strong>Foundations of Astronomy (Seeds/Backman)</strong> - Great overview for Astronomy.</li>
              <li><strong>Tarbuck's Earth Science</strong> - Foundational text for Rocks & Minerals and Dynamic Planet.</li>
              <li><strong>AAVSO Webinars</strong> - Great video resources for advanced Astronomy topics.</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Physical Sciences (Chem Lab, Forensics)</h3>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)' }}>
              <li><strong>Zumdahl Chemistry</strong> - Detailed textbook for Chem Lab.</li>
              <li><strong>Saferstein's Criminalistics: An Introduction to Forensic Science</strong> - Standard for Forensics.</li>
            </ul>
          </div>
        </div>

        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          Video Channels & Online Courses
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Video size={32} color="var(--primary-color)" />
            <div>
              <h4 style={{ margin: 0 }}>CrashCourse</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Great for reviewing basic concepts quickly.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Video size={32} color="var(--primary-color)" />
            <div>
              <h4 style={{ margin: 0 }}>Khan Academy</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>In-depth AP-level material for biology and chemistry.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <FileText size={32} color="var(--primary-color)" />
            <div>
              <h4 style={{ margin: 0 }}>MIT OpenCourseWare</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Advanced material for thermodynamics and physics events.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}