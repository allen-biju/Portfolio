import React from 'react';

/**
 * TVWorld Component
 *
 * Dedicated container element for the CRT television screen environment.
 * Positioned using tvScreenAnchor as its geometry reference.
 * Stacked behind the transparent CRT screen opening in heroImg (z-index: 1 vs z-index: 2).
 *
 * Displays the visual appearance of a powered-off CRT display screen.
 */
export default function TVWorld({ className = '', style = {} }) {
  return (
    <div
      className={`tv-world ${className}`}
      id="tvWorld"
      style={style}
    >
      <div className="tv-world-screen-off" />
    </div>
  );
}
