import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion';
import gsap from 'gsap';
import Lenis from 'lenis';
import HeroScene from './components/HeroScene';
import IntroOverlay from './components/IntroOverlay';
import SkillDetailPage from './components/SkillDetailPage';
import { playHover, playClick, preloadSounds, playUILong, playShard } from './hooks/useSounds';

const TOTAL_SCENES = 4;

function ProjectCard3D({ proj, i, scrollProgress, cursorHandlers }) {
  // Accelerated Assembly: Map scroll progress (0.60 to 0.76) to 3D states
  const start = 0.60 + (i * 0.02);
  const end = 0.72 + (i * 0.02);

  const rotateX = useTransform(scrollProgress, [start, end], [180, 0]);
  const rotateY = useTransform(scrollProgress, [start, end], [130, 0]);
  const rotateZ = useTransform(scrollProgress, [start, end], [25, 0]);
  const scale = useTransform(scrollProgress, [start, end], [0.5, 1]);
  const opacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const z = useTransform(scrollProgress, [start, end], [-400, 0]);

  // Subtle auto-drift once on screen
  const autoDriftX = useMotionValue(0);
  useAnimationFrame((t) => {
    if (scrollProgress.get() > 0.7) {
      autoDriftX.set(Math.sin(t / 2500 + i) * 12);
    }
  });

  return (
    <motion.div
      className="gallery-card"
      style={{
        rotateX, rotateY, rotateZ, scale, opacity, z,
        x: autoDriftX,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ y: -20, z: 20 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className="project-number">0{i + 1}</div>
      <div className="project-image-wrapper">
        <img src={proj.img} alt={proj.name} />
      </div>
      <div className="card-info">
        <div className="project-tags">
          {proj.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
        <h3 className="title-font">{proj.name}</h3>
        <p>{proj.desc}</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {proj.link ? (
            <motion.a
              href={proj.link}
              target="_blank"
              className="visit-btn"
              onMouseEnter={() => cursorHandlers.hover('EXPLORE')()}
              onMouseLeave={cursorHandlers.leave}
            >
              LAUNCH PROJECT
            </motion.a>
          ) : (
            <span className="visit-btn" style={{ opacity: 0.5, borderBottomColor: 'rgba(255,255,255,0.2)' }}>
              CASE STUDY COMING SOON
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const [activeScene, setActiveScene] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [cursorText, setCursorText] = useState("");
  const cursorDot = useRef(null);
  const cursorOutline = useRef(null);
  const cursorTextRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const trackX = useTransform(scrollYProgress, [0.76, 0.92], [0, -1200]);

  // Initialize Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 2.5,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Clean cinematic curve
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Stabilized Scene Transitions (Locked Dwell Zones)
  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      let newScene = activeScene;

      // Scene 0 (Intro): 0.0 - 0.25 (Expanded dwell)
      if (v <= 0.25) newScene = 0;
      // Scene 1 (Arsenal): 0.26 - 0.55
      else if (v > 0.26 && v <= 0.55) newScene = 1;
      // Scene 2 (Works): 0.56 - 0.92
      else if (v > 0.56 && v <= 0.92) newScene = 2;
      // Scene 3 (Contact): 0.93+
      else if (v > 0.93) newScene = 3;

      if (newScene !== activeScene) {
        setActiveScene(newScene);
      }
    });
  }, [scrollYProgress, activeScene]);

  // Sound preloading
  useEffect(() => {
    try { preloadSounds(); } catch (_) { }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      gsap.set(cursorDot.current, { x: e.clientX, y: e.clientY });
      gsap.to(cursorOutline.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      });
      if (cursorTextRef.current) {
        gsap.to(cursorTextRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: 'power2.out'
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    // Audio unlocker: Resume context on first real interaction
    const unlockAudio = () => {
      preloadSounds(); // ensure sounds are decoeded
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const pageVariants = {
    initial: { opacity: 0, scale: 1.05, filter: "blur(10px)" },
    in: { opacity: 1, scale: 1, filter: "blur(0px)" },
    out: { opacity: 0, scale: 0.95, filter: "blur(10px)" }
  };

  const pageTransition = { type: "spring", stiffness: 60, damping: 20, duration: 1.2 };

  const handleCursorHover = (text) => () => {
    setCursorText(text);
    if (activeScene !== 0) playHover();
  };
  const handleCursorLeave = () => setCursorText("");

  return (
    <div className="main-content-wrapper">
      {/* Cinematic Intro Overlay */}
      <IntroOverlay onComplete={() => setIntroComplete(true)} />

      <div className="scene-sticky-container" style={{ opacity: introComplete ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        {/* 3D Preloader */}
        <Loader
          containerStyles={{ background: '#0A192F' }}
          innerStyles={{ background: 'rgba(100, 255, 218, 0.2)', height: '4px', width: '250px' }}
          barStyles={{ background: '#64FFDA', height: '4px' }}
          dataInterpolation={(p) => `INITIALIZING WEBGL CORE ${p.toFixed(0)}%`}
          dataStyles={{ fontFamily: 'clash-display', color: '#64FFDA', fontSize: '1.5rem', letterSpacing: '2px' }}
        />

        {/* Context-Aware Custom Cursor */}
        <div className={`cursor-dot ${cursorText ? 'hidden' : ''}`} ref={cursorDot}></div>
        <div className={`cursor-outline ${cursorText ? 'expanded' : ''}`} ref={cursorOutline}></div>
        <div className="cursor-text" ref={cursorTextRef} style={{ opacity: cursorText ? 1 : 0 }}>
          {cursorText}
        </div>

        <nav className="main-nav" style={{ position: 'fixed', mixBlendMode: 'difference' }}>
          <div className="nav-content">
            <div className="logo magnetic" onMouseEnter={handleCursorHover('HOME')} onMouseLeave={handleCursorLeave}>ALLEN.</div>
            <div className="nav-links">
              <span style={{ color: 'var(--color-accent)' }}>FRAME {activeScene + 1}/{TOTAL_SCENES}</span>
            </div>
          </div>
        </nav>

        {/* WebGL Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <Canvas eventSource={document.body} eventPrefix="client" camera={{ position: [0, 0, 10], fov: 45 }}>
            <React.Suspense fallback={null}>
              <HeroScene activeScene={activeScene} />
            </React.Suspense>
          </Canvas>
        </div>

        <AnimatePresence mode="wait">
          {/* Frame 0: Cinematic Introduction */}
          {activeScene === 0 && (
            <motion.div
              key="scene0"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="frame-container padded-left"
            >
              <div className="intro-text-content">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <h1
                    className="intro-name"
                    onMouseEnter={handleCursorHover('SAY HI')}
                    onMouseLeave={handleCursorLeave}
                  >
                    ALLEN BIJU.
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <h2 className="intro-role">Full Stack Developer & Digital Architect</h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <p className="intro-bio">
                    I craft seamless digital ecosystems. From high-performance full-stack applications
                    and immersive frontends to cinematic video editing and AI-driven solutions—I bridge
                    the gap between complex engineering and creative storytelling.
                  </p>
                </motion.div>

                <motion.div
                  className="scroll-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <div className="scroll-line"></div>
                  <span>SCROLL TO EXPLORE</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Frame 1: Skills HUD — Game-like */}
          {activeScene === 1 && (
            <motion.div key="scene1" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5vw', pointerEvents: 'none' }}
            >
              {/* Scanline overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
              }} />

              {/* Corner HUD brackets */}
              {[
                { top: 16, left: 16, borderTop: '2px solid', borderLeft: '2px solid' },
                { top: 16, right: 16, borderTop: '2px solid', borderRight: '2px solid' },
                { bottom: 16, left: 16, borderBottom: '2px solid', borderLeft: '2px solid' },
                { bottom: 16, right: 16, borderBottom: '2px solid', borderRight: '2px solid' },
              ].map((style, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 1.3 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  style={{ position: 'absolute', width: 28, height: 28, borderColor: 'var(--color-accent)', pointerEvents: 'none', zIndex: 11, ...style }} />
              ))}

              <div className="skills-wrapper" style={{ position: 'relative', zIndex: 5, maxWidth: '1100px', width: '100%' }}>

                {/* Glitch heading */}
                <motion.h2 className="title-font"
                  initial={{ opacity: 0, x: -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'relative', display: 'inline-block', fontSize: '2.8rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--color-text-main)' }}
                >
                  ARSENAL
                  {/* Glitch ghost layers */}
                  <motion.span aria-hidden style={{
                    position: 'absolute', top: 0, left: 0, color: '#E8A020',
                    fontFamily: 'inherit', fontWeight: 'inherit', fontSize: 'inherit',
                    clipPath: 'polygon(0 20%, 100% 20%, 100% 40%, 0 40%)',
                    pointerEvents: 'none',
                  }}
                    animate={{ x: [-3, 3, -2, 0], opacity: [0, 0.7, 0, 0] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.5 }}
                  >ARSENAL</motion.span>
                  <motion.span aria-hidden style={{
                    position: 'absolute', top: 0, left: 0, color: '#4A90D9',
                    fontFamily: 'inherit', fontWeight: 'inherit', fontSize: 'inherit',
                    clipPath: 'polygon(0 55%, 100% 55%, 100% 75%, 0 75%)',
                    pointerEvents: 'none',
                  }}
                    animate={{ x: [3, -3, 2, 0], opacity: [0, 0.7, 0, 0] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.5, delay: 0.05 }}
                  >ARSENAL</motion.span>

                  {/* Blinking status */}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: 'var(--color-accent)', marginLeft: '0.6rem', verticalAlign: 'middle' }}
                  />
                </motion.h2>

                {/* HUD label */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '1rem', marginTop: '0.2rem' }}
                >
                  &gt; SKILL_MATRIX v2.4.1 — ONLINE
                </motion.p>

                <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {[
                    {
                      name: 'Full Stack Dev', xp: 94, icon: '🖥️', rank: 'S', tags: ['React', 'Node', 'MongoDB'], color: '#E8A020',
                      desc: 'End-to-end web application development across the full stack — from pixel-perfect interfaces to scalable APIs and database architecture.',
                      tools: ['React / Next.js', 'Node.js / Express', 'MongoDB / PostgreSQL', 'REST & GraphQL', 'Docker', 'Vercel / Railway'],
                      projects: ['Campus Marketplace', 'Hostel Management System', 'AI SaaS Dashboard'],
                    },
                    {
                      name: 'Frontend Dev', xp: 96, icon: '🎨', rank: 'S+', tags: ['HTML/CSS', 'Next.js', 'Three.js'], color: '#4A90D9',
                      desc: 'Crafting immersive, responsive, and high-performance frontend experiences with cutting-edge frameworks and advanced animation tooling.',
                      tools: ['HTML5 / CSS3', 'React / Next.js', 'Three.js / R3F', 'Framer Motion', 'GSAP', 'Figma → Code'],
                      projects: ['WebGL Portfolio', 'Cinematic Landing Pages', 'Interactive 3D Product Pages'],
                    },
                    {
                      name: 'Logo Creator', xp: 88, icon: '✏️', rank: 'A+', tags: ['Illustrator', 'Figma', 'Brand'], color: '#C084FC',
                      desc: 'Designing iconic, memorable logos and full brand identities that communicate a story at first glance — from concept to final vector.',
                      tools: ['Adobe Illustrator', 'Figma', 'Photoshop', 'Canva Pro', 'SVG Animation', 'Brand Guidelines'],
                      projects: ['Startup Brand Identity', 'Campus Club Logos', 'Social Media Kits'],
                    },
                    {
                      name: 'Video Editing', xp: 82, icon: '🎬', rank: 'A', tags: ['Premiere', 'After Effects', 'Color'], color: '#34D399',
                      desc: 'Producing cinematic, story-driven video content with pro-level color grading, motion graphics, and clean audio mixing.',
                      tools: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Audition', 'CapCut', 'LUTs / Color Grading'],
                      projects: ['Marketing Reels', 'Documentary Short Films', 'Social Content Packages'],
                    },
                    {
                      name: 'Transcription', xp: 90, icon: '🎙️', rank: 'A+', tags: ['Audio', 'Subtitles', 'SRT'], color: '#F472B6',
                      desc: 'Accurate, fast transcription of audio and video content with subtitle generation, SRT formatting, and multilingual support.',
                      tools: ['Whisper AI', 'Descript', 'Adobe Audition', 'SRT / VTT', 'Rev.com', 'Manual Review'],
                      projects: ['Podcast Transcripts', 'Lecture & Interview Subtitles', 'Legal Documentation'],
                    },
                    {
                      name: 'AI Artist', xp: 91, icon: '🤖', rank: 'S', tags: ['Midjourney', 'Stable Diff', 'LoRA'], color: '#FB923C',
                      desc: 'Generating stunning, unique AI artwork with fine-tuned models, custom LoRAs, and prompt engineering for commercial-grade visuals.',
                      tools: ['Midjourney v6', 'Stable Diffusion XL', 'ComfyUI', 'LoRA Training', 'ControlNet', 'Inpainting / Upscaling'],
                      projects: ['AI Brand Illustrations', 'Custom Character Sheets', 'AI-Generated NFT Series'],
                    },
                  ].map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      className="bento-card"
                      initial={{ opacity: 0, y: 40, scale: 0.88, rotateX: 15 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                      transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      onMouseEnter={() => { handleCursorHover('INSPECT')(); playHover(); }}
                      onMouseLeave={handleCursorLeave}
                      onClick={() => { playClick(); setSelectedSkill(skill); }}
                      whileHover={{ scale: 1.04, y: -5, rotateY: i % 2 === 0 ? 4 : -4 }}
                      style={{ cursor: 'none', transformStyle: 'preserve-3d', perspective: 800, overflow: 'hidden' }}
                    >
                      {/* Radial hover glow */}
                      <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }}
                        style={{
                          position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 12,
                          background: `radial-gradient(ellipse at top left, ${skill.color}18, transparent 65%)`
                        }} />

                      {/* Card scan line animation on hover */}
                      <motion.div initial={{ top: '-100%' }} whileHover={{ top: '150%' }}
                        transition={{ duration: 0.6, ease: 'linear' }}
                        style={{
                          position: 'absolute', left: 0, width: '100%', height: '3px', pointerEvents: 'none',
                          background: `linear-gradient(90deg, transparent, ${skill.color}60, transparent)`
                        }} />

                      {/* Header row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <motion.span style={{ fontSize: '1.5rem' }}
                            animate={{ rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 3.5, delay: i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
                          >{skill.icon}</motion.span>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
                            {skill.name}
                          </h3>
                        </div>
                        {/* Rank badge */}
                        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 400 }}
                          style={{
                            fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700,
                            color: skill.color, border: `1px solid ${skill.color}60`,
                            padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em',
                            background: `${skill.color}12`
                          }}
                        >
                          {skill.rank}
                        </motion.div>
                      </div>

                      {/* XP Bar */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            XP LEVEL
                          </span>
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                            style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', color: skill.color, fontWeight: 700 }}>
                            {skill.xp}/100
                          </motion.span>
                        </div>
                        {/* Track */}
                        <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                          <motion.div
                            style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${skill.color}90, ${skill.color})`, position: 'relative' }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${skill.xp}%` }}
                            transition={{ duration: 1.2, delay: 0.6 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {/* Shimmer */}
                            <motion.div
                              style={{
                                position: 'absolute', top: 0, right: 0, width: 12, height: '100%',
                                background: 'rgba(255,255,255,0.7)', borderRadius: 3
                              }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.5, delay: 1.8 + i * 0.1, repeat: Infinity, repeatDelay: 3 }}
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {skill.tags.map((tag, ti) => (
                          <motion.span key={tag}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + i * 0.1 + ti * 0.06 }}
                            style={{
                              fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                              padding: '2px 7px', borderRadius: 3, color: skill.color,
                              border: `1px solid ${skill.color}30`, background: `${skill.color}08`
                            }}
                          >{tag}</motion.span>
                        ))}
                      </div>

                      <div className="glow-bar" style={{ background: skill.color }} />
                    </motion.div>
                  ))}
                </div>

                {/* Stats row */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.85 }}
                  style={{ display: 'flex', gap: '1.5rem', marginTop: '0.9rem', paddingLeft: '0.1rem', alignItems: 'center' }}
                >
                  {[
                    { val: '3+', label: 'YRS XP', color: '#E8A020' },
                    { val: '15+', label: 'PROJECTS', color: '#4A90D9' },
                    { val: '6', label: 'SKILLS', color: '#C084FC' },
                  ].map(({ val, label, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 3, height: 28, background: color, borderRadius: 2 }} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
                      </div>
                    </div>
                  ))}

                  {/* Blinking READY indicator */}
                  <motion.div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#34D399', textTransform: 'uppercase' }}>ONLINE</span>
                  </motion.div>
                </motion.div>

              </div>
            </motion.div>
          )}


          {/* Frame 2: Stabilized 3D Project Showcase */}
          {activeScene === 2 && (
            <motion.div key="scene2" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="frame-container centered">
              <div className="gallery-wrapper">
                <div style={{ textAlign: 'center', marginBottom: '8vh' }}>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="title-font"
                    style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', letterSpacing: '-0.03em', marginBottom: '1rem' }}
                  >
                    SELECTED WORKS
                  </motion.h2>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ width: '80px', height: '1px', background: 'var(--color-accent)', margin: '0 auto' }}
                  />
                </div>

                <motion.div className="gallery-track" style={{ x: trackX }}>
                  {[
                    {
                      name: "CEV Connect",
                      desc: "A centralized digital ecosystem bridging the gap between campus commerce and housing data.",
                      link: "https://cev-connect.vercel.app",
                      tags: ["React", "FastAPI", "Postgres"],
                      img: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop"
                    },
                    {
                      name: "Cinematic Reels",
                      desc: "High-fidelity video production and AI-augmented motion graphics for global brands.",
                      tags: ["Premiere", "After Effects", "AI"],
                      img: "https://images.unsplash.com/photo-1492691523567-6170c24dac3a?q=80&w=1200&auto=format&fit=crop"
                    },
                    {
                      name: "Neural Identity",
                      desc: "Synthesizing traditional design principles with generative AI neural networks.",
                      tags: ["Figma", "Stable Diffusion", "Brand"],
                      img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200&auto=format&fit=crop"
                    }
                  ].map((proj, i) => (
                    <ProjectCard3D
                      key={i}
                      proj={proj}
                      i={i}
                      scrollProgress={scrollYProgress}
                      cursorHandlers={{ hover: handleCursorHover, leave: handleCursorLeave }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Frame 3: Contact Form */}
          {activeScene === 3 && (
            <motion.div key="scene3" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="frame-container centered">
              <div className="contact-wrapper">
                <h2 className="title-font section-heading" style={{ textAlign: 'center' }}>INITIATE TRANSMISSION</h2>
                <form className="modern-form" onSubmit={(e) => e.preventDefault()}>
                  <motion.div className="form-group" whileFocus={{ scale: 1.02 }}>
                    <input type="text" required placeholder=" " onMouseEnter={handleCursorHover('TYPE')} onMouseLeave={handleCursorLeave} />
                    <label>Identification (Name)</label>
                    <div className="form-line"></div>
                  </motion.div>

                  <motion.div className="form-group" whileFocus={{ scale: 1.02 }}>
                    <input type="email" required placeholder=" " onMouseEnter={handleCursorHover('TYPE')} onMouseLeave={handleCursorLeave} />
                    <label>Signal Node (Email)</label>
                    <div className="form-line"></div>
                  </motion.div>

                  <motion.div className="form-group" whileFocus={{ scale: 1.02 }}>
                    <textarea required placeholder=" " rows="3" onMouseEnter={handleCursorHover('TYPE')} onMouseLeave={handleCursorLeave}></textarea>
                    <label>Encrypted Payload (Message)</label>
                    <div className="form-line"></div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="submit-btn"
                    onMouseEnter={handleCursorHover('SEND')}
                    onMouseLeave={handleCursorLeave}
                    whileHover={{ scale: 1.05, backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    DECRYPT & SEND
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'fixed', bottom: '40px', right: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[0, 1, 2, 3].map((scene) => (
            <div key={scene} style={{
              width: '4px', height: activeScene === scene ? '40px' : '20px',
              backgroundColor: activeScene === scene ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.5s cubic-bezier(0.77, 0, 0.175, 1)'
            }}
            />
          ))}
        </div>
        {/* Full-page Skill Detail */}
        <AnimatePresence>
          {selectedSkill && (
            <SkillDetailPage
              key={selectedSkill.name}
              skill={selectedSkill}
              onBack={() => setSelectedSkill(null)}
            />
          )}
        </AnimatePresence>


      </div>{/* end main content wrapper */}
    </div>
  );
}

export default App;
