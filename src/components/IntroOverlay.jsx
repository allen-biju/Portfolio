import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function IntroOverlay({ onComplete }) {
  const overlayRef = useRef(null);
  const panelTopRef = useRef(null);
  const panelBottomRef = useRef(null);
  const logoRef = useRef(null);
  const lineRef = useRef(null);
  const subtitleRef = useRef(null);
  const charRefs = useRef([]);

  const NAME = "ALLEN BIJU";

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlayRef.current, { display: 'none' });
        onComplete();
      }
    });

    // 1. Chars fly in staggered from below
    tl.fromTo(
      charRefs.current,
      { y: 100, opacity: 0, skewX: 20 },
      {
        y: 0,
        opacity: 1,
        skewX: 0,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.06,
      },
      0
    );

    // 2. Draw the gold accent line
    tl.fromTo(
      lineRef.current,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.6, ease: 'power3.inOut' },
      0.7
    );

    // 3. Subtitle fades in
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      1.0
    );

    // 4. Hold
    tl.to({}, { duration: 0.9 });

    // 5. Chars blast upward (kinetic exit)
    tl.to(
      charRefs.current,
      {
        y: -130,
        opacity: 0,
        skewX: -8,
        duration: 0.5,
        ease: 'power3.in',
        stagger: { each: 0.04, from: 'center' },
      }
    );
    tl.to(
      [lineRef.current, subtitleRef.current],
      { opacity: 0, duration: 0.3, ease: 'power2.in' },
      '<'
    );

    // 6. Panels split open
    tl.to(
      panelTopRef.current,
      { y: '-100%', duration: 0.9, ease: 'power3.inOut' },
      '-=0.05'
    );
    tl.to(
      panelBottomRef.current,
      { y: '100%', duration: 0.9, ease: 'power3.inOut' },
      '<'
    );
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'all',
      }}
    >
      {/* Top panel */}
      <div
        ref={panelTopRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '51%',
          background: '#0D1B2A',
          zIndex: 2,
        }}
      />
      {/* Bottom panel */}
      <div
        ref={panelBottomRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '51%',
          background: '#0D1B2A',
          zIndex: 2,
        }}
      />

      {/* Centered content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          pointerEvents: 'none',
        }}
      >
        {/* Animated letters */}
        <div style={{ display: 'flex', gap: '0.04em' }}>
          {NAME.split('').map((char, i) => (
            <span
              key={i}
              ref={el => (charRefs.current[i] = el)}
              style={{
                display: 'inline-block',
                fontFamily: "'clash-display', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(3rem, 9vw, 7.5rem)',
                letterSpacing: '0.1em',
                color: '#CCD6F6',
                lineHeight: 1,
                opacity: 0,
                willChange: 'transform, opacity',
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Gold accent line */}
        <div
          ref={lineRef}
          style={{
            width: 'clamp(180px, 38vw, 460px)',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #E8A020, transparent)',
            borderRadius: '2px',
          }}
        />

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(0.65rem, 1.2vw, 0.9rem)',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: '#4A6080',
            opacity: 0,
            marginTop: '0.4rem',
          }}
        >
          Creative Engineering · WebGL · Design
        </p>
      </div>
    </div>
  );
}
