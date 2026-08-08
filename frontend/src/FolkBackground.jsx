import { useState, useEffect } from "react";

const PALETTE = ["#c9973f", "#a8342a", "#e8b04b", "#8a3a52", "#3f7a5e"];

function WarliScene() {
  const spiralFigures = [];
  const numFigures = 90;
  for (let i = 0; i < numFigures; i++) {
    const t = i / numFigures;
    const angle = t * Math.PI * 8;
    const radius = 40 + t * 480;
    const x = 700 + Math.cos(angle) * radius;
    const y = 750 + Math.sin(angle) * radius * 0.85;
    const rotation = (angle * 180) / Math.PI + 90;
    spiralFigures.push({ x, y, rotation, id: i, scale: 0.85 + (i % 3) * 0.1, color: PALETTE[i % PALETTE.length] });
  }
  return (
    <g strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.6">
      {spiralFigures.map((f) => (
        <g key={f.id} stroke={f.color} transform={`translate(${f.x}, ${f.y}) rotate(${f.rotation}) scale(${f.scale})`}>
          <circle cx="0" cy="-15" r="5" fill={f.color} stroke="none" />
          <path d="M -9 9 L 0 -7 L 9 9 Z" />
          <path d="M -9 9 L -14 24 M 9 9 L 14 24" />
          <path d="M -6 -3 L -18 -12 M 6 -3 L 18 -12" />
        </g>
      ))}
      <circle cx="700" cy="750" r="26" stroke="#e8b04b" strokeWidth="2.5" />
      <circle cx="700" cy="750" r="6" fill="#e8b04b" stroke="none" />
    </g>
  );
}

function MadhubaniScene() {
  const fishRows = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      const x = 100 + col * 175 + (row % 2 === 0 ? 0 : 90);
      const y = 150 + row * 340;
      fishRows.push({ x, y, id: `${row}-${col}`, color: PALETTE[(row + col) % PALETTE.length] });
    }
  }
  return (
    <g strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55">
      {fishRows.map((f) => (
        <g key={f.id} stroke={f.color} transform={`translate(${f.x}, ${f.y})`}>
          <ellipse cx="0" cy="0" rx="30" ry="14" />
          <path d="M28 0 L46 -14 M28 0 L46 14" />
          <circle cx="-18" cy="-3" r="2.5" fill={f.color} stroke="none" />
          <path d="M-6 -8 L6 -8 M-6 8 L6 8 M-14 0 L14 0" opacity="0.7" />
          <circle cx="0" cy="0" r="46" opacity="0.35" />
        </g>
      ))}
    </g>
  );
}

function PattachitraScene() {
  const medallions = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = 150 + col * 280 + (row % 2 === 0 ? 0 : 140);
      const y = 200 + row * 480;
      medallions.push({ x, y, id: `${row}-${col}`, color: PALETTE[(row * 3 + col) % PALETTE.length] });
    }
  }
  return (
    <g strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5">
      {medallions.map((m) => (
        <g key={m.id} stroke={m.color} transform={`translate(${m.x}, ${m.y})`}>
          <circle r="55" />
          <circle r="38" />
          <circle r="20" fill={m.color} opacity="0.5" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={Math.cos(a) * 38}
                y1={Math.sin(a) * 38}
                x2={Math.cos(a) * 55}
                y2={Math.sin(a) * 55}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
}

const scenes = [WarliScene, MadhubaniScene, PattachitraScene];

function FolkBackground() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % scenes.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="folk-bg-container">
      {scenes.map((Scene, i) => (
        <svg
          key={i}
          className={`folk-bg-layer ${i === activeIndex ? "active" : ""}`}
          viewBox="0 0 1400 2200"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Scene />
        </svg>
      ))}
    </div>
  );
}

export default FolkBackground;