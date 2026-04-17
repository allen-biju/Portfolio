import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPageWipe, playBack, playProjectText, scheduleTypewriterTicks, getCtx } from '../hooks/useSounds';

/* ── Typewriter Hook ────────────────────────── */
const SPEED = 22;        // ms per character — must match scheduleTypewriterTicks call
const START_DELAY = 900; // ms before typing begins

function useTypewriter(text) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const stopAudio = useRef(null);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let frame;
    let cancelled = false;

    async function syncTypewriter() {
      // 1️⃣  Pre-schedule audio and get the controller
      const result = await scheduleTypewriterTicks(text.length, SPEED, START_DELAY);
      if (cancelled || !result) return;

      const { startTime: audioStartTime, stop } = result;
      stopAudio.current = stop;

      // 2️⃣  Visual Driver: Sync to AudioContext hardware clock
      const intervalSec = SPEED / 1000;

      const update = () => {
        const now = getCtx().currentTime;
        const audioElapsed = now - audioStartTime;

        if (audioElapsed >= 0) {
          const charsToShow = Math.floor(audioElapsed / intervalSec) + 1;
          const clampedChars = Math.min(charsToShow, text.length);

          setDisplayed(text.slice(0, clampedChars));

          if (clampedChars >= text.length) {
            setDone(true);
            window.__typewriterAnchor = null;
            return; // stop loop
          }
        }

        frame = requestAnimationFrame(update);
      };

      // Play the reveal burst sound
      setTimeout(() => {
        if (!cancelled) playProjectText();
      }, START_DELAY - 100);

      frame = requestAnimationFrame(update);
    }

    syncTypewriter();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (stopAudio.current) {
        stopAudio.current();
        stopAudio.current = null;
      }
      window.__typewriterAnchor = null;
    };
  }, [text]);

  return { displayed, done };
}




/* ── Animated counter ───────────────────────── */
function Counter({ target, duration = 1200, delay = 600 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    let frame;
    const step = (ts) => {
      if (!start) start = ts + delay;
      const elapsed = Math.max(0, ts - start);
      const progress = Math.min(elapsed / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{val}</>;
}

/* ── Main Component ─────────────────────────── */
export default function SkillDetailPage({ skill, onBack }) {
  const { displayed, done } = useTypewriter(skill.desc);

  // Play whoosh on page enter
  useEffect(() => { playPageWipe(); }, []);


  return (
    <motion.div
      key={skill.name}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)' }}
      transition={{ duration: 0.65, ease: [0.77, 0, 0.175, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: '#0D1B2A',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Noise texture overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, zIndex: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '200px 200px',
      }} />

      {/* ── Scanlines ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
      }} />

      {/* ── Giant background icon ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.04, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          position: 'absolute', right: '-2rem', bottom: '-2rem',
          fontSize: 'min(55vw, 55vh)', lineHeight: 1,
          pointerEvents: 'none', zIndex: 0, userSelect: 'none',
        }}
      >{skill.icon}</motion.div>

      {/* ── Left colour strip ── */}
      <motion.div
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, ${skill.color}, transparent)`,
          transformOrigin: 'top', zIndex: 1,
        }}
      />

      {/* ── Top bar ── */}
      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 2, width: '100%', flexShrink: 0,
          background: `linear-gradient(90deg, ${skill.color}, transparent)`,
          transformOrigin: 'left', zIndex: 2,
        }}
      />

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)' }}>

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => { playBack(); onBack(); }}
            whileHover={{ x: -4 }}
            style={{
              background: 'transparent', border: 'none', cursor: 'none',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: skill.color, fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              marginBottom: '2.5rem', padding: 0,
            }}
          >
            <span style={{ fontSize: '1rem' }}>←</span> ARSENAL / {skill.name}
          </motion.button>

          {/* ── Hero header ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              style={{
                fontSize: 'clamp(3rem, 7vw, 5rem)', lineHeight: 1,
                background: `${skill.color}15`,
                border: `1px solid ${skill.color}30`,
                borderRadius: 16, padding: '0.5rem 0.8rem',
              }}
            >{skill.icon}</motion.div>

            <div style={{ flex: 1 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: 1 }}
              >{skill.name}</motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem', flexWrap: 'wrap' }}
              >
                <span style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700,
                  color: skill.color, border: `1px solid ${skill.color}60`,
                  padding: '4px 14px', borderRadius: 6, background: `${skill.color}12`, letterSpacing: '0.08em'
                }}>RANK {skill.rank}</span>

                {/* Tags */}
                {skill.tags.map((tag, i) => (
                  <motion.span key={tag}
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    style={{
                      fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '3px 10px', borderRadius: 4, color: 'var(--color-text-muted)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >{tag}</motion.span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* XP Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                PROFICIENCY LEVEL
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: skill.color, fontWeight: 700 }}>
                <Counter target={skill.xp} />/100
              </span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${skill.xp}%` }}
                transition={{ duration: 1.3, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${skill.color}70, ${skill.color})`, position: 'relative' }}
              >
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6, delay: 1.8, repeat: Infinity, repeatDelay: 4 }}
                  style={{ position: 'absolute', right: 0, top: 0, width: 16, height: '100%', background: 'rgba(255,255,255,0.6)', borderRadius: 4 }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: 1, background: `linear-gradient(90deg, ${skill.color}40, transparent)`, marginBottom: '2rem', transformOrigin: 'left' }}
          />

          {/* ── Overview with TYPEWRITER ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.25em', color: skill.color, textTransform: 'uppercase', marginBottom: '1rem' }}>
              &gt;_ OVERVIEW
            </p>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--color-text-main)',
              lineHeight: 1.8, opacity: 0.88, minHeight: '5rem',
              fontFamily: 'var(--font-body)',
            }}>
              {displayed}
              {/* Blinking cursor while typing */}
              {!done && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ color: skill.color, fontWeight: 700 }}
                >|</motion.span>
              )}
            </p>
          </motion.div>

          {/* ── Two-column: Tools + Projects ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

            {/* Tools */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{
                background: `${skill.color}06`, border: `1px solid ${skill.color}20`,
                borderRadius: 14, padding: '1.5rem',
              }}
            >
              <p style={{ fontSize: '0.58rem', letterSpacing: '0.25em', color: skill.color, textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                &gt;_ TOOLS & TECH
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {skill.tools.map((tool, ti) => (
                  <motion.div key={tool}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.85 + ti * 0.07 }}
                    whileHover={{ x: 6 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'none' }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2, delay: ti * 0.3, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: skill.color, flexShrink: 0 }}
                    />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-main)', opacity: 0.85 }}>{tool}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Projects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p style={{ fontSize: '0.58rem', letterSpacing: '0.25em', color: skill.color, textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                &gt;_ NOTABLE PROJECTS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {skill.projects.map((proj, pi) => (
                  <motion.div key={proj}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + pi * 0.1 }}
                    whileHover={{ x: -6, background: `${skill.color}12` }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.9rem 1.1rem', borderRadius: 10,
                      background: `${skill.color}07`,
                      border: `1px solid ${skill.color}18`,
                      transition: 'background 0.2s',
                      cursor: 'none',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontWeight: 700,
                      fontSize: '0.75rem', color: skill.color,
                      minWidth: 28,
                    }}>{String(pi + 1).padStart(2, '0')}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--color-text-main)', opacity: 0.88 }}>{proj}</div>
                    </div>
                    <motion.span
                      style={{ marginLeft: 'auto', color: skill.color, opacity: 0.5, fontSize: '0.8rem' }}
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: pi * 0.4 }}
                    >→</motion.span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom back button */}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            onClick={() => { playBack(); onBack(); }}
            whileHover={{ scale: 1.03, borderColor: skill.color }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: '3rem', background: 'transparent',
              border: `1px solid ${skill.color}40`,
              color: skill.color, padding: '14px 28px',
              fontFamily: 'var(--font-heading)', fontSize: '0.78rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.6rem',
              transition: 'border-color 0.3s',
            }}
          >
            ← BACK TO ARSENAL
          </motion.button>

        </div>
      </div>
    </motion.div>
  );
}
