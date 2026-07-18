import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './BackgroundRenderer.css';

export default function BackgroundRenderer() {
  const { bgStyle } = useTheme();
  
  if (bgStyle === 'dynamic-gradient' || bgStyle === 'static-gradient') {
    return null; // Handled by body CSS
  }

  return (
    <div className="background-renderer" data-style={bgStyle}>
      {bgStyle === 'stars' && <StarsBackground />}
      {bgStyle === 'particles' && <ParticlesBackground />}
      {bgStyle === 'wind' && <WindBackground />}
      {bgStyle === 'circuits' && <CircuitsBackground />}
      {bgStyle === 'city' && <CityBackground />}
    </div>
  );
}

function StarsBackground() {
  // Generate a random set of stars
  const [stars, setStars] = useState<{ id: number, x: number, y: number, size: number, delay: number }[]>([]);
  
  useEffect(() => {
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="bg-stars">
      {stars.map(star => (
        <div 
          key={star.id} 
          className="star" 
          style={{ 
            left: `${star.x}%`, 
            top: `${star.y}%`, 
            width: `${star.size}px`, 
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`
          }} 
        />
      ))}
    </div>
  );
}

function ParticlesBackground() {
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, size: number, delay: number, duration: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 10,
      delay: Math.random() * -20,
      duration: Math.random() * 15 + 15
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="bg-particles">
      {particles.map(p => (
        <div 
          key={p.id} 
          className="particle" 
          style={{ 
            left: `${p.x}%`, 
            top: `${p.y}%`, 
            width: `${p.size}px`, 
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }} 
        />
      ))}
    </div>
  );
}

function WindBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, brightness } = useTheme(); // Dependency ensures color updates

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Get color from theme
    const rootStyle = getComputedStyle(document.documentElement);
    const rawColor = rootStyle.getPropertyValue('--text-primary').trim() || '#ffffff';

    const particles: { x: number, y: number, age: number, lifespan: number }[] = [];
    const numParticles = Math.floor((width * height) / 2500); // Dense based on screen size

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        age: Math.random() * 100,
        lifespan: Math.random() * 150 + 50
      });
    }

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      // Slower field evolution
      time += 0.0003;

      // Fade previous frame to transparent for trails
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // Trail length
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      ctx.strokeStyle = rawColor;
      // Much more subtle color
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1.0;
      ctx.beginPath();

      particles.forEach(p => {
        // Complex noise-like field using overlapping sines
        const noise = Math.sin(p.x * 0.002 + time) + Math.cos(p.y * 0.003 - time) + Math.sin((p.x + p.y) * 0.0015);
        const angle = noise * Math.PI; 
        
        // Wind moves generally left to right but swirls heavily, slower overall
        const speed = 0.5;
        const vx = (Math.cos(angle) * 1.5 + 1.2) * speed; 
        const vy = (Math.sin(angle) * 1.5) * speed;

        const nextX = p.x + vx;
        const nextY = p.y + vy;

        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nextX, nextY);

        p.x = nextX;
        p.y = nextY;
        p.age++;

        // Respawn
        if (p.age > p.lifespan || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          // Respawn mostly on the left side to keep it flowing across the screen
          p.x = Math.random() < 0.2 ? Math.random() * width : -10; 
          p.y = Math.random() * height;
          p.age = 0;
        }
      });

      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, brightness]); // Re-init if theme changes so color updates

  return (
    <div className="bg-wind">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

function CircuitsBackground() {
  return (
    <div className="bg-circuits">
       {/* SVG pattern for circuits */}
       <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
              <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M10 10 L40 10 L50 20 L50 40 L60 50 L90 50 M20 90 L20 60 L30 50 L70 50 L80 40 L80 10 M90 90 L60 90 L50 80 L50 60 L40 50 L10 50" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.1" />
                  <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.2" />
                  <circle cx="90" cy="50" r="2" fill="currentColor" opacity="0.2" />
                  <circle cx="20" cy="90" r="2" fill="currentColor" opacity="0.2" />
                  <circle cx="80" cy="10" r="2" fill="currentColor" opacity="0.2" />
                  <circle cx="90" cy="90" r="2" fill="currentColor" opacity="0.2" />
                  <circle cx="10" cy="50" r="2" fill="currentColor" opacity="0.2" />
              </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
       </svg>
       <div className="circuit-pulse"></div>
    </div>
  );
}

function CityBackground() {
  return (
    <div className="bg-city">
       <div className="city-sky">
          <div className="moon"></div>
       </div>
       <div className="city-buildings">
          <div className="building-layer layer-back"></div>
          <div className="building-layer layer-mid"></div>
          <div className="building-layer layer-front"></div>
       </div>
    </div>
  );
}
