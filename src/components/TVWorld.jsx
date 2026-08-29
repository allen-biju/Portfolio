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
 *      │     ├── .tv-light-world— THE WORLD BEHIND THE SCREEN (already present, waiting to be received)
 *      │     │     ├── .tv-light__aura
 *      │     │     ├── .tv-light__rays
 *      │     │     ├── .tv-light__lobe-primary
 *      │     │     ├── .tv-light__lobe-secondary
 *      │     │     ├── .tv-light__lobe-tertiary
 *      │     │     ├── .tv-light__core
 *      │     │     └── .tv-light__shimmer
 *      │     ├── .crt-no-signal-blackout — NO-SIGNAL DARKNESS (blacks out world until signal is acquired)
 *      │     │     ├── .crt-no-signal-base
 *      │     │     └── .crt-no-signal-noise
 *      │     └── .crt-static-screen — DAMAGED CRT SIGNAL INTERFERENCE & GLITCH
 *      │           ├── Canvas   — Fine analog phosphor grain & noise
 *      │           ├── .crt-vsync-bar — Rolling vertical sync distortion band
 *      │           ├── .crt-interference-bands — Horizontal signal interference
 *      │           ├── .crt-signal-tear-layer — Horizontal signal displacement slices
 *      │           ├── .crt-chromatic-bleed   — Restrained cyan/blue signal fringe
 *      │           ├── .crt-luminance-pulse   — CRT brightness pulses
 *      │           ├── .crt-scanlines         — CRT texture scanlines
 *      │           └── .crt-bezel-reflection  — Inner bezel illuminated by the light
 *      └── .crt-h-line          — Horizontal startup line
/**
 * Authentic SMPTE-170M Color Test Pattern Sub-component
 * Tier 1: 67% Top Color Bars (75% amplitude)
 * Tier 2: 8% Castellation transition bars
 * Tier 3: 25% Bottom -I, 100% White, +Q, 0% Black, PLUGE step ramp
 */
function SMPTEPattern() {
  return (
    <div className="smpte-pattern" aria-hidden="true">
      {/* Tier 1: 67% Main Color Bars */}
      <div className="smpte-top">
        <div className="smpte-bar smpte-bar--gray" />
        <div className="smpte-bar smpte-bar--yellow" />
        <div className="smpte-bar smpte-bar--cyan" />
        <div className="smpte-bar smpte-bar--green" />
        <div className="smpte-bar smpte-bar--magenta" />
        <div className="smpte-bar smpte-bar--red" />
        <div className="smpte-bar smpte-bar--blue" />
      </div>

      {/* Tier 2: 8% Castellation Bars */}
      <div className="smpte-mid">
        <div className="smpte-bar smpte-bar--blue" />
        <div className="smpte-bar smpte-bar--black" />
        <div className="smpte-bar smpte-bar--magenta" />
        <div className="smpte-bar smpte-bar--black" />
        <div className="smpte-bar smpte-bar--cyan" />
        <div className="smpte-bar smpte-bar--black" />
        <div className="smpte-bar smpte-bar--gray" />
      </div>

      {/* Tier 3: 25% Bottom I/Q & PLUGE Black-Level Calibration */}
      <div className="smpte-bot">
        <div className="smpte-block smpte-block--navy" title="-I" />
        <div className="smpte-block smpte-block--white" title="100% White" />
        <div className="smpte-block smpte-block--purple" title="+Q" />
        <div className="smpte-block smpte-block--black-0" />
        <div className="smpte-block smpte-block--pluge">
          <div className="pluge-sub-black" title="-4% Sub-black" />
          <div className="pluge-black" title="0% Black" />
          <div className="pluge-super-black" title="+4% Super-black" />
        </div>
        <div className="smpte-block smpte-block--black-0" />
      </div>
    </div>
  );
}

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
          {/* ─── THE WORLD BEHIND THE SCREEN (Already exists, waiting for signal) ─── */}
          <div className="tv-light-world">
            {/* Deep Atmospheric Cosmic Aura */}
            <div className="tv-light__aura" />

            {/* Subtle Celestial Rays & Atmospheric Depth */}
            <div className="tv-light__rays" />

            {/* Organic Primary Lobe (Asymmetric soft opening) */}
            <div className="tv-light__lobe-primary" />

            {/* Organic Secondary Lobe (Irregular aperture variation) */}
            <div className="tv-light__lobe-secondary" />

            {/* Tertiary Atmospheric Bleed */}
            <div className="tv-light__lobe-tertiary" />

            {/* Blazing Incandescent Core (White / Pale Blue-White) */}
            <div className="tv-light__core" />

            {/* Living Celestial Shimmer */}
            <div className="tv-light__shimmer" />
          </div>

          {/* ─── ADVANCED SMPTE COLOR PALETTE & CRT SIGNAL DISTORTION ENGINE ─── */}
          <div className="crt-test-signal" id="crtTestSignal">
            {/* Base Phosphor Subpixel Aperture Grille & Scanlines */}
            <div className="crt-test-phosphor-grid" />
            <div className="crt-test-scanlines" />


            {/* Multi-Slice Horizontal Tearing Distortion Stack (7 Independent Raster Slices) */}
            <div className="crt-test-slices-wrapper">
              {/* Slice 1: 0% - 15% (Upper White/Yellow/Cyan peak) */}
              <div className="crt-test-slice crt-test-slice--1">
                <SMPTEPattern />
              </div>
              {/* Slice 2: 15% - 30% (Mid-upper color bars) */}
              <div className="crt-test-slice crt-test-slice--2">
                <SMPTEPattern />
              </div>
              {/* Slice 3: 30% - 48% (Color bar center zone) */}
              <div className="crt-test-slice crt-test-slice--3">
                <SMPTEPattern />
              </div>
              {/* Slice 4: 48% - 66% (Lower color bar zone) */}
              <div className="crt-test-slice crt-test-slice--4">
                <SMPTEPattern />
              </div>
              {/* Slice 5: 66% - 76% (Castellation transition band) */}
              <div className="crt-test-slice crt-test-slice--5">
                <SMPTEPattern />
              </div>
              {/* Slice 6: 76% - 88% (PLUGE & I/Q upper zone) */}
              <div className="crt-test-slice crt-test-slice--6">
                <SMPTEPattern />
              </div>
              {/* Slice 7: 88% - 100% (Sub-black calibration baseline) */}
              <div className="crt-test-slice crt-test-slice--7">
                <SMPTEPattern />
              </div>
            </div>

            {/* Chromatic Aberration RGB Misconvergence Ghost Channels */}
            <div className="crt-test-chroma crt-test-chroma--red">
              <SMPTEPattern />
            </div>
            <div className="crt-test-chroma crt-test-chroma--cyan">
              <SMPTEPattern />
            </div>

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
