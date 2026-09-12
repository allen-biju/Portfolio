import React, { forwardRef } from 'react';
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
  return (
    <div
      ref={ref}
      className={`cosmic-galaxy-3d-viewport ${className}`}
      style={style}
    >
      <div className="galaxy-3d-scene">
        {/* Deep Void Base */}
        <div className="galaxy-void-base" />

        {/* 3D Gallery Vortex */}
        <GalleryVortex />
      </div>
    </div>
  );
});

export default CosmicGalaxy3D;
