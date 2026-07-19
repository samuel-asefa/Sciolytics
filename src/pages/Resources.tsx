import { Link } from 'react-router-dom';
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
          <div style={{ background: 'var(--bg-white)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Life, Personal &amp; Social Science (Anatomy, Botany, Designer Genes, Disease Detectives, Water Quality)</h3>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)' }}>
              <li><strong>Campbell Biology (12th Edition)</strong> - The holy grail for any life science event.</li>
              <li><strong>Vander's Human Physiology</strong> - Excellent for Anatomy &amp; Physiology.</li>
              <li><strong>Principles of Epidemiology in Public Health Practice (CDC)</strong> - Essential for Disease Detectives.</li>
              <li><strong>Lewin's Genes</strong> - Ideal for Designer Genes and molecular biology.</li>
              <li><strong>Raven's Biology of Plants</strong> - The go-to reference for Botany.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg-white)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Earth &amp; Space Science (Astronomy, Dynamic Planet, Remote Sensing, Rocks and Minerals)</h3>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)' }}>
              <li><strong>Foundations of Astronomy (Seeds/Backman)</strong> - Great overview for Astronomy.</li>
              <li><strong>Tarbuck's Earth Science</strong> - Foundational text for Rocks &amp; Minerals and Dynamic Planet.</li>
              <li><strong>AAVSO Webinars</strong> - Great video resources for advanced Astronomy topics.</li>
              <li><strong>NASA Earthdata Resources</strong> - Essential for Remote Sensing concepts.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg-white)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Physical Science &amp; Chemistry (Circuit Lab, Chem Lab, Forensics, Hovercraft, Protein Modeling, Thermodynamics)</h3>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)' }}>
              <li><strong>Zumdahl Chemistry</strong> - Detailed textbook for Chem Lab (focus on Kinetics and Gases).</li>
              <li><strong>Saferstein's Criminalistics</strong> - Standard reference for Forensics.</li>
              <li><strong>Halliday/Resnick Fundamentals of Physics</strong> - Core resource for Circuit Lab and Thermodynamics.</li>
              <li><strong>Lehninger Principles of Biochemistry</strong> - Ideal for Protein Modeling.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg-white)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Technology, Engineering &amp; Inquiry (Boomilever, Electric Vehicle, Mission Possible, Wright Stuff, Codebusters, Engineering CAD, Experimental Design, Ping Pong Parachute)</h3>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)' }}>
              <li><strong>Scioly.org Wiki</strong> - Community build tips and past test resources for every event.</li>
              <li><strong>Applied Cryptography (Schneier)</strong> - Deep dive for Codebusters.</li>
              <li><strong>Autodesk Fusion 360 Tutorials</strong> - Free online training for Engineering CAD.</li>
              <li><strong>Scioly.org Test Exchange</strong> - Thousands of past tournament tests for every event.</li>
            </ul>
          </div>
        </div>

        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          Interactive Practice Tools
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="action-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Flashcard Apps</h4>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>Anki and Quizlet are great for memorizing terms and scientific classifications.</p>
          </div>
          <div className="action-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Online Simulators</h4>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>PhET Interactive Simulations are excellent for physics and chemistry concepts.</p>
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