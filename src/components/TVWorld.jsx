import React from 'react';

/**
 * TVWorld Component
 *
 * Dedicated container element for the CRT television display environment.
 * Positioned behind the physical CRT glass opening (z-index: 1 vs z-index: 10).
 *
 * Visual Stack inside TVWorld (bottom -> top):
 *   1. .tv-world-screen-off     — Powered-off dark base
 *   2. .crt-activation          — CRT power-on container
 *      ├── .crt-flash           — Phosphor ignition flash (pale blue-white)
 *      ├── .crt-raster-container— Vertical opening raster expander
 *      │     ├── .tv-light-world— THE WORLD BEHIND THE SCREEN
 *      │     ├── .crt-test-signal — SMPTE signal + distortion layers
 *      │     │     ├── .crt-test-phosphor-grid — Aperture grille
 *      │     │     ├── .crt-test-scanlines     — CRT scanlines
 *      │     │     ├── .crt-test-slices-wrapper — 7 tearing slices (CSS gradient SMPTE)
 *      │     │     ├── .crt-test-chroma--red/cyan — RGB ghost channels
 *      │     │     ├── .crt-test-vhold-bar     — V-Hold sync slip
 *      │     │     ├── .crt-test-phosphor-smear
 *      │     │     ├── .crt-test-glitch-interference
 *      │     │     └── .crt-test-collapse-beam
 *      └── .crt-h-line          — Horizontal startup line
 *
 * PERFORMANCE NOTE:
 *   The SMPTE-170M color pattern is rendered as a pure CSS multi-stop
 *   linear-gradient background (class .smpte-bg) on each slice and chroma
 *   div. This eliminates ~162 child DOM nodes that previously existed as
 *   duplicated <SMPTEPattern /> React component trees inside a scaled 3D
 *   blend-mode container — a primary source of compositor stalls.
 */

export default function TVWorld({ className = '', style = {} }) {
  return (
    <div
      className={`tv-world ${className}`}
      id="tvWorld"
      style={style}
    >
      {/* Layer 1: Powered-off dark screen base */}
      <div className="tv-world-screen-off" />

      {/* Layer 2: CRT Activation, Signal Acquisition & Heavenly World */}
      <div className="crt-activation" aria-hidden="true">
        {/* Pale blue-white phosphor ignition flash */}
        <div className="crt-flash" />

        {/* Raster container for vertical opening expand */}
        <div className="crt-raster-container">
          {/* ─── THE WORLD BEHIND THE SCREEN ─── */}
          <div className="tv-light-world" />

          {/* ─── SMPTE COLOR PALETTE & CRT SIGNAL DISTORTION ENGINE ─── */}
          <div className="crt-test-signal" id="crtTestSignal">
            {/* Phosphor Aperture Grille */}
            <div className="crt-test-phosphor-grid" />
            {/* CRT Scanlines */}
            <div className="crt-test-scanlines" />

            {/*
              Multi-Slice Horizontal Tearing Distortion Stack (7 Independent Raster Slices)
              Each slice uses .smpte-bg — a pure CSS linear-gradient encoding of the
              SMPTE-170M color pattern. Zero child DOM nodes vs the previous 18-node
              <SMPTEPattern /> tree per slice (~126 nodes saved here alone).
            */}
            <div className="crt-test-slices-wrapper">
              {/* Slice 1: 0% - 15% (Upper White/Yellow/Cyan peak) */}
              <div className="crt-test-slice crt-test-slice--1 smpte-bg" />
              {/* Slice 2: 15% - 30% (Mid-upper color bars) */}
              <div className="crt-test-slice crt-test-slice--2 smpte-bg" />
              {/* Slice 3: 30% - 48% (Color bar center zone) */}
              <div className="crt-test-slice crt-test-slice--3 smpte-bg" />
              {/* Slice 4: 48% - 66% (Lower color bar zone) */}
              <div className="crt-test-slice crt-test-slice--4 smpte-bg" />
              {/* Slice 5: 66% - 76% (Castellation transition band) */}
              <div className="crt-test-slice crt-test-slice--5 smpte-bg" />
              {/* Slice 6: 76% - 88% (PLUGE & I/Q upper zone) */}
              <div className="crt-test-slice crt-test-slice--6 smpte-bg" />
              {/* Slice 7: 88% - 100% (Sub-black calibration baseline) */}
              <div className="crt-test-slice crt-test-slice--7 smpte-bg" />
            </div>

            {/*
              Chromatic Aberration RGB Misconvergence Ghost Channels
              Also use .smpte-bg to eliminate 2 × 18 = 36 redundant DOM nodes.
            */}
            <div className="crt-test-chroma crt-test-chroma--red smpte-bg" />
            <div className="crt-test-chroma crt-test-chroma--cyan smpte-bg" />

            {/* Analog V-Hold Vertical Sync Slip Bar */}
            <div className="crt-test-vhold-bar">
              <div className="crt-vhold-noise-band" />
            </div>

            {/* Phosphor Smear & High-Energy Flare Streak */}
            <div className="crt-test-phosphor-smear" />
            <div className="crt-test-glitch-interference" />

            {/* Cathode Ray Magnetic Collapse Laser Beam */}
            <div className="crt-test-collapse-beam" />
          </div>

        </div>

        {/* Horizontal Startup Line — Celestial white-blue core */}
        <div className="crt-h-line" />
      </div>

      {/* Layer 3: LOCKED CRT glass overlay — sits above all screen content */}
      <div className="crt-glass" aria-hidden="true">
        <div className="crt-glass__reflection" />
        <div className="crt-glass__glare" />
      </div>
    </div>
  );
}
