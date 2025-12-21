'use client';

import React, { useEffect, useState } from 'react';

// A lightweight confetti implementation using simple DOM elements and CSS
// In a real app, I'd use 'react-confetti' or 'canvas-confetti', but for this environment, 
// a custom lightweight solution ensures it runs without npm install issues.

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  delay: number;
  scale: number;
}

const colors = ['#FFD700', '#FF0000', '#FFFFFF', '#00FF00', '#00FFFF'];

export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const count = 100;
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: -10, // Start above screen
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: Math.random() * 2,
          scale: 0.5 + Math.random(),
        });
      }
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm opacity-90 animate-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            animation: `fall 3s linear forwards ${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { top: -10%; transform: rotate(0deg); opacity: 1; }
          100% { top: 110%; transform: rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};