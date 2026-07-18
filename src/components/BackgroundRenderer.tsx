import React, { useEffect, useState } from 'react';
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
  const [streams, setStreams] = useState<{ id: number, top: number, height: number, delay: number, duration: number, opacity: number }[]>([]);

  useEffect(() => {
    const newStreams = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      height: Math.random() * 6 + 2,
      delay: Math.random() * -10,
      duration: Math.random() * 10 + 5,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setStreams(newStreams);
  }, []);

  return (
    <div className="bg-wind">
      {streams.map(stream => (
        <div 
          key={stream.id} 
          className="wind-stream" 
          style={{ 
            top: `${stream.top}%`, 
            height: `${stream.height}px`,
            opacity: stream.opacity,
            animationDelay: `${stream.delay}s`,
            animationDuration: `${stream.duration}s`
          }} 
        />
      ))}
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
