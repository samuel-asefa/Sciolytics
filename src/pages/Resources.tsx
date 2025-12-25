import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Lock, Bookmark, TrendingUp, Heart } from 'lucide-react';

export default function Resources() {
  return (
    <div className="resources-page">
      <h1>Resources</h1>
      <p>Explore various resources to help you prepare for Science Olympiad competitions.</p>
      <div className="resource-cards">
        <div className="resource-card">
          <Lock size={32} />
          <h3>Secure Study Materials</h3>
          <p>Access a curated list of study materials and guides.</p>
        </div>
        <div className="resource-card">
          <Bookmark size={32} />
          <h3>Bookmark Important Topics</h3>
          <p>Save topics you want to revisit later for quick access.</p>
        </div>
        <div className="resource-card">
          <TrendingUp size={32} />
          <h3>Track Your Progress</h3>
          <p>Monitor your learning progress and improve over time.</p>
        </div>
        </div>
    </div>
  );
}