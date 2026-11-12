// Adapted from Kokonut UI loader. Copyright (c) 2025 kokonutUI, MIT.
// Original currentColor ring masks; local CSS replaces Tailwind utilities.
import React from 'react';

const ringMask = (stops) => `radial-gradient(circle at 50% 50%, ${stops})`;
const RINGS = [
  { id: 'outer', stops: 'transparent 35%, black 37%, black 39%, transparent 41%', background: 'conic-gradient(from 0deg, transparent 0deg, currentColor 90deg, transparent 180deg)', opacity: 0.8, animationDuration: '3s' },
  { id: 'primary', stops: 'transparent 42%, black 44%, black 48%, transparent 50%', background: 'conic-gradient(from 0deg, transparent 0deg, currentColor 120deg, color-mix(in srgb, currentColor 50%, transparent) 240deg, transparent 360deg)', opacity: 0.9, animationDuration: '1.2s' },
  { id: 'counter', stops: 'transparent 52%, black 54%, black 56%, transparent 58%', background: 'conic-gradient(from 180deg, transparent 0deg, color-mix(in srgb, currentColor 60%, transparent) 45deg, transparent 90deg)', opacity: 0.35, animationDuration: '4s', animationDirection: 'reverse' },
  { id: 'accent', stops: 'transparent 61%, black 62%, black 63%, transparent 64%', background: 'conic-gradient(from 270deg, transparent 0deg, color-mix(in srgb, currentColor 40%, transparent) 20deg, transparent 40deg)', opacity: 0.5, animationDuration: '3.5s' },
];

export default function Loader({ title, subtitle, children }) {
  return (
    <div className="ku-loader">
      <div className="ku-loader-rings" aria-hidden="true">
        {RINGS.map(({ id, stops, ...style }) => <div key={id} className="ku-loader-ring" style={{ ...style, mask: ringMask(stops), WebkitMask: ringMask(stops) }} />)}
        {children}
      </div>
      <output aria-live="polite"><strong>{title}</strong><span>{subtitle}</span></output>
    </div>
  );
}
