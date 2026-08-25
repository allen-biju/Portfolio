import React, { forwardRef, useMemo } from 'react';
import GalleryVortex from './GalleryVortex';
import './CosmicGalaxy3D.css';

/**
 * CosmicGalaxy3D Component
 *
 * True 3D space-flight environment hosting:
 * 1. Surrounding Cosmic Galaxy starfield & diffuse nebulae
 * 2. 3D Gallery Vortex (helical spiral of floating project cards)
 * 3. Deep void base & edge depth vignette
 */
const CosmicGalaxy3D = forwardRef(function CosmicGalaxy3D({ className = '', style = {} }, ref) {

  const stars = useMemo(() => {
    const NUM_STARS = 800;

    return Array.from({ length: NUM_STARS }, (_, i) => {
      // Deterministic pseudo-random seed generator
      const seed = (i * 1103515245 + 12345) & 0x7fffffff;
      const rand1 = ((seed >> 0) & 0xffff) / 0xffff;
      const rand2 = ((seed >> 8) & 0xffff) / 0xffff;
      const rand3 = ((seed >> 16) & 0xffff) / 0xffff;

      // Natural golden ratio angle + subtle random jitter
      const phi = (i * 137.5077640500378 + rand1 * 30) * (Math.PI / 180);

      // Radial distribution: concentration in center (r=0-25%) with smooth outer spread
      const r = Math.pow(rand2, 0.75) * 58;
      const x = 50 + Math.cos(phi) * r;
      const y = 50 + Math.sin(phi) * r;

      // Z depth distribution from -5600px up to -80px
      const zProgress = i / (NUM_STARS - 1);
      const z = -5600 + Math.pow(zProgress, 0.85) * 5520;

      // Size distribution: micro, small, medium, large
      const sizeType =
        i % 24 === 0 ? 'large' :
        i % 7 === 0  ? 'medium' :
        i % 3 === 0  ? 'small' :
                       'micro';

      const twinkleDelay = (rand3 * 4.0);

      return {
        id: i,
        x: Math.max(0.5, Math.min(99.5, x)),
        y: Math.max(0.5, Math.min(99.5, y)),
        z,
        sizeType,
        twinkleDelay,
      };
    });
  }, []);

  return (
    <div
      ref={ref}
      className={`cosmic-galaxy-3d-viewport ${className}`}
      style={style}
    >
      <div className="galaxy-3d-scene">
        {/* Deep Void Base */}
        <div className="galaxy-void-base" />

        {/* ── TEMPORARILY COMMENTED OUT for gallery isolation review ──
        <div className="galaxy-nebula-3d">
          <div className="galaxy-nebula-cloud-far" />
          <div className="galaxy-nebula-cloud-mid" />
          <div className="galaxy-nebula-cloud-cyan" />
        </div>

        <div className="galaxy-stars-volume">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`star-3d star-3d--${star.sizeType} star-twinkle`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: `translateZ(${star.z}px)`,
                animationDelay: `${star.twinkleDelay}s`,
              }}
            />
          ))}
        </div>
        ── END COMMENT ── */}

        {/* 3D Gallery Vortex */}
        <GalleryVortex />

        {/* ── TEMPORARILY COMMENTED OUT
        <div className="galaxy-vignette-3d" />
        ── END COMMENT ── */}
      </div>
    </div>
  );
});

export default CosmicGalaxy3D;
