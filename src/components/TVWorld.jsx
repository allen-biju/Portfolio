import React, { useEffect, useRef } from 'react';

/**
 * TVWorld Component
 *
 * Dedicated container element for the CRT television display environment.
 * Positioned behind the physical CRT glass opening (z-index: 1 vs z-index: 10).
 *
 * Visual Stack inside TVWorld (bottom -> top):
 *   1. .tv-world-screen-off     — Powered-off dark base
 *   2. .crt-activation          — CRT power-on container
 *      ├── .crt-flash           — Phosphor ignition flash
 *      ├── .crt-raster-container— Vertical opening raster expander
 *      │     └── .crt-static-screen
 *      │           ├── Canvas   — Fine analog noise grain (cool phosphor tint)
 *      │           ├── .crt-vsync-bar — Rolling vertical sync distortion band
 *      │           ├── .crt-interference-bands — Irregular horizontal interference
 *      │           ├── .crt-signal-tear-layer — Thin horizontal signal displacement slices
 *      │           ├── .crt-chromatic-bleed   — Restrained cyan/blue signal fringe
 *      │           ├── .crt-luminance-pulse   — Irregular CRT brightness pulses
 *      │           └── .crt-scanlines         — Subtle texture scanline raster
 *      └── .crt-h-line          — Horizontal startup line
 *   3. .crt-glass               — LOCKED physical glass layer (reflection, glare, edge depth)
 */
export default function TVWorld({ className = '', style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Refined resolution for fine cyberpunk digital & analog hybrid noise
    const w = 240;
    const h = 180;
    canvas.width = w;
    canvas.height = h;

    // Pre-generate 16 high-tech glitch noise frames with neon RGB splitting & digital corrupt blocks
    const numFrames = 16;
    const frames = [];

    // Blend theme colors (amber #E8A020, navy #0D1B2A) with cyberpunk neons
    const cyberpunkColors = [
      [232, 160, 32],  // Theme Amber / Accent (#E8A020)
      [255, 185, 50],  // Amber Glow (brighter variant)
      [0, 243, 255],   // Neon Cyan
      [204, 214, 246], // Theme Slate Blue (#CCD6F6)
      [255, 0, 127],   // Neon Magenta
      [78, 120, 200],  // Theme Card Blue (muted)
      [120, 0, 255],   // Deep Violet
      [255, 140, 20],  // Amber Flare
    ];

    for (let f = 0; f < numFrames; f++) {
      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;

      // Fill canvas with theme deep navy background (#0D1B2A)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 13;  // R  #0D
        data[i + 1] = 27;  // G  #1B
        data[i + 2] = 42;  // B  #2A
        data[i + 3] = 255;
      }

      // Draw onto offscreen context to add digital glitch blocks and cyber code streams
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.putImageData(imgData, 0, 0);

      // Cyberpunk Digital Glitch Rectangles
      const numGlitchBlocks = Math.floor(Math.random() * 6) + 3;
      for (let b = 0; b < numGlitchBlocks; b++) {
        const blockX = Math.floor(Math.random() * w);
        const blockY = Math.floor(Math.random() * h);
        const blockW = Math.floor(Math.random() * 70) + 12;
        const blockH = Math.floor(Math.random() * 10) + 2;
        const color = cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];

        tempCtx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.4 + Math.random() * 0.5})`;
        tempCtx.fillRect(blockX, blockY, blockW, blockH);
      }

      // Horizontal corrupt scan slice shift
      if (f % 3 === 0) {
        const sliceY = Math.floor(Math.random() * (h - 15));
        const sliceH = Math.floor(Math.random() * 12) + 3;
        const shiftX = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 15) + 5);
        const sliceData = tempCtx.getImageData(0, sliceY, w, sliceH);
        tempCtx.putImageData(sliceData, shiftX, sliceY);
      }

      frames.push(tempCtx.getImageData(0, 0, w, h));
    }

    let frameIndex = 0;
    let animId;
    let lastTime = 0;
    const fps = 24; // High-tech jittery video refresh
    const interval = 1000 / fps;

    function render(currentTime) {
      animId = requestAnimationFrame(render);
      if (currentTime - lastTime < interval) return;
      lastTime = currentTime;

      ctx.putImageData(frames[frameIndex], 0, 0);
      frameIndex = (frameIndex + 1) % numFrames;
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className={`tv-world ${className}`}
      id="tvWorld"
      style={style}
    >
      {/* Layer 1: Powered-off dark screen base with Cosmic Galaxy preview */}
      <div className="tv-world-screen-off">
        <div className="galaxy-bg-base" />
        <div className="galaxy-nebula-wrapper" style={{ opacity: 0.6 }}>
          <div className="galaxy-nebula-cloud-1" />
          <div className="galaxy-nebula-cloud-2" />
        </div>
        <div className="galaxy-starfield-wrapper">
          <div className="galaxy-stars-bg" style={{ opacity: 0.5 }} />
          <div className="galaxy-stars-mid" style={{ opacity: 0.7 }} />
        </div>
      </div>

      {/* Layer 2: Cyberpunk CRT Activation & Futuristic Digital Signal System */}
      <div className="crt-activation" aria-hidden="true">
        {/* Neon Cyber Phosphor ignition flash */}
        <div className="crt-flash cyber-flash" />

        {/* Raster container for vertical opening expand */}
        <div className="crt-raster-container">
          <div className="crt-static-screen cyber-static-screen">
            {/* 1. Fine cyberpunk digital noise canvas */}
            <canvas ref={canvasRef} className="crt-static-canvas cyber-static-canvas" />

            {/* 2. Cyber Holographic Grid Background */}
            <div className="cyber-grid" />

            {/* 3. Rolling high-speed digital V-Sync Distortion Bar */}
            <div className="crt-vsync-bar cyber-vsync-bar" />

            {/* 4. Irregular horizontal neon interference bands */}
            <div className="crt-interference-bands cyber-interference-bands">
              <div className="crt-band crt-band--1 cyber-band--1" />
              <div className="crt-band crt-band--2 cyber-band--2" />
              <div className="crt-band crt-band--3 cyber-band--3" />
            </div>

            {/* 5. Cyberpunk RGB Split Slices & Chromatic Tearing */}
            <div className="crt-signal-tear-layer cyber-tear-layer">
              <div className="crt-tear-slice crt-tear-slice--1 cyber-tear-slice--1" />
              <div className="crt-tear-slice crt-tear-slice--2 cyber-tear-slice--2" />
              <div className="crt-tear-slice crt-tear-slice--3 cyber-tear-slice--3" />
              <div className="crt-tear-slice crt-tear-slice--4 cyber-tear-slice--4" />
            </div>

            {/* 6. Cyber Glitch Macroblock Fragments */}
            <div className="cyber-glitch-blocks">
              <div className="cyber-block cyber-block--1" />
              <div className="cyber-block cyber-block--2" />
              <div className="cyber-block cyber-block--3" />
            </div>

            {/* 7. Cyberpunk HUD & Futuristic Data Stream Overlays */}
            <div className="cyber-hud-layer">
              <div className="cyber-hud-header">
                <span className="cyber-hud-tag">[ SYS_OVERRIDE_0x7F ]</span>
                <span className="cyber-hud-status">CORRUPTED</span>
              </div>
              <div className="cyber-hud-crosshair">┼</div>
              <div className="cyber-hud-footer">
                <span className="cyber-hud-code">01100011 01111001 01100010 01100101 01110010</span>
              </div>
              <div className="cyber-hud-glitch-badge">NET_FAIL</div>
            </div>

            {/* 8. Neon Laser Beam Sweeper */}
            <div className="cyber-laser-beam" />

            {/* 9. Theme-colored neon chromatic fringe */}
            <div className="crt-chromatic-bleed cyber-chromatic-bleed" />

            {/* 10. CRT Cyber Pulsing Luminance */}
            <div className="crt-luminance-pulse cyber-luminance-pulse" />

            {/* 11. Futuristic Laser Scanlines */}
            <div className="crt-scanlines cyber-scanlines" />

            {/* 12. Dynamic Flickering Inner Bezel Border Reflection */}
            <div className="crt-bezel-reflection" aria-hidden="true" />
          </div>
        </div>

        {/* Horizontal Neon Startup Line */}
        <div className="crt-h-line cyber-h-line" />
      </div>

      {/* Layer 3: LOCKED CRT glass overlay — sits above all screen content */}
      <div className="crt-glass cyber-glass-border" aria-hidden="true">
        <div className="crt-glass__reflection" />
        <div className="crt-glass__glare" />
      </div>
    </div>
  );
}
