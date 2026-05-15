import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useAnimationFrame, useSpring } from 'framer-motion';
import gsap from 'gsap';
import Lenis from 'lenis';
import HeroScene from './components/HeroScene';
import IntroOverlay from './components/IntroOverlay';
import SkillDetailPage from './components/SkillDetailPage';
import ResumeModal from './components/ResumeModal';
import { playHover, playClick, preloadSounds, playUILong, playShard, getIsMuted, toggleMute } from './hooks/useSounds';
import emailjs from '@emailjs/browser';

const TOTAL_SCENES = 4;

function ProjectCard3D({ proj, i, scrollProgress, cursorHandlers }) {
  const cardRef = useRef(null);

  // Accelerated Assembly
  const start = 0.44 + (i * 0.02);
  const end = 0.56 + (i * 0.02);

  const assemblyRotateX = useTransform(scrollProgress, [start, end], [180, 0]);
  const assemblyRotateY = useTransform(scrollProgress, [start, end], [130, 0]);
  const assemblyRotateZ = useTransform(scrollProgress, [start, end], [25, 0]);
  const scale = useTransform(scrollProgress, [start, end], [0.5, 1]);
  const opacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const z = useTransform(scrollProgress, [start, end], [-400, 0]);

  // Interactive Tilt Logic (Replaces autoDrift for better stability)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const springTiltX = useSpring(tiltX, { stiffness: 150, damping: 20 });
  const springTiltY = useSpring(tiltY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    // Tilt degree logic (-15 to 15 degrees)
    tiltX.set((e.clientY - centerY) / (rect.height / 2) * -15);
    tiltY.set((e.clientX - centerX) / (rect.width / 2) * 15);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    cursorHandlers.leave();
  };

  // Combine assembly rotation and tilt rotation
  const finalRotateX = useTransform([assemblyRotateX, springTiltX], ([a, t]) => a + t);
  const finalRotateY = useTransform([assemblyRotateY, springTiltY], ([a, t]) => a + t);

  return (
    <motion.div
      ref={cardRef}
      className="gallery-card"
      style={{
        rotateX: finalRotateX,
        rotateY: finalRotateY,
        rotateZ: assemblyRotateZ,
        scale,
        opacity,
        z,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => cursorHandlers.hover('VIEW PROJECT')()}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      {/* HUD Accents */}
      <div className="card-hud-brackets">
        <div className="bracket tl" />
        <div className="bracket tr" />
        <div className="bracket bl" />
        <div className="bracket br" />
      </div>

      <div className="project-number">
        <span className="scanning-dot" />
        PROJ_0{i + 1}
      </div>

      <div className="project-image-wrapper">
        <img src={proj.img} alt={proj.name} />
        <div className="image-overlay-glitch" />
      </div>

      <div className="card-info">
        <div className="project-tags">
          {proj.tags.map(tag => (
            <span key={tag} className="tag-hud">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="title-font project-name-display">{proj.name}</h3>
        <p className="project-desc-display">{proj.desc}</p>

        <div className="card-action-row">
          {proj.link ? (
            <motion.a
              href={proj.link}
              target="_blank"
              className="visit-btn-modern"
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => cursorHandlers.hover('LAUNCH')()}
              onMouseLeave={() => cursorHandlers.hover('VIEW PROJECT')()}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              ACCESS CORE
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </motion.a>
          ) : (
            <div className="visit-btn-disabled">
              <span>ENCRYPTED_FILES</span>
              <div className="lock-icon" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const [activeScene, setActiveScene] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const fullCaption = "Turning ideas into fast, modern, and immersive web experiences";

  useEffect(() => {
    if (introComplete) {
      // Wait for image slide-in to finish (1.8s) before starting typewriter
      const timer = setTimeout(() => {
        let i = 0;
        const interval = setInterval(() => {
          setCaptionText(fullCaption.substring(0, i + 1));
          i++;
          if (i === fullCaption.length) clearInterval(interval);
        }, 30);
      }, 1800);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [introComplete]);

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showEntryFlash, setShowEntryFlash] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [muted, setMuted] = useState(getIsMuted());
  const [bentoInView, setBentoInView] = useState(false);

  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Only flag as touch if it's a mobile/tablet viewport with touch support
    const checkTouch = () => {
      const isMobileSize = window.innerWidth <= 1024;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouch(isMobileSize && hasTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const handleToggleMute = () => {
    const newState = toggleMute();
    setMuted(newState);
    playClick(); // Play click sound before it totally mutes or if unmuting
  };
  const [cursorText, setCursorText] = useState("");
  const cursorDot = useRef(null);
  const cursorOutline = useRef(null);
  const cursorTextRef = useRef(null);

  // Transmission Form States
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [terminalLogs, setTerminalLogs] = useState([
    "HANDSHAKE INITIALIZED...",
    "SECURE_TUNNEL_ESTABLISHED: 256-BIT",
    "WAITING_FOR_OPERATOR_INPUT..."
  ]);
  const [isSending, setIsSending] = useState(false);
  const logEndRef = useRef(null);

  // Handshake Logic States
  const [verificationStep, setVerificationStep] = useState('IDENTIFY'); // IDENTIFY | CHALLENGE | UPLINK
  const [handshakeCode, setHandshakeCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_6xea9sf",
    VERIFY_TEMPLATE_ID: "template_uls1fe8",
    MESSAGE_TEMPLATE_ID: "template_4ja7r45",
    PUBLIC_KEY: "uDVlBCVL6kwOWrl5i"
  };

  const addLog = (msg) => {
    setTerminalLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    if (logEndRef.current && terminalLogs.length > 3) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const startHandshake = async () => {
    if (!formData.name || !formData.email) {
      addLog("ERROR: MISSING OPERATOR_ID OR SIGNAL_NODE.");
      return;
    }
    setIsSending(true);
    addLog(`INITIATING HANDSHAKE FOR ${formData.email.toUpperCase()}...`);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setHandshakeCode(code);

    try {
      if (EMAILJS_CONFIG.PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
        // Fallback for simulation if keys aren't set yet
        console.log("SIMULATION MODE: HANDSHAKE CODE IS", code);
        await new Promise(r => setTimeout(r, 1500));
        addLog("CHALLENGE_CODE DISPATCHED (SIMULATED). CHECK CONSOLE.");
      } else {
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.VERIFY_TEMPLATE_ID,
          {
            name: formData.name,
            to_name: formData.name,
            email: formData.email,
            passcode: code,
            challenge_code: code,
            time: new Date().toLocaleTimeString()
          },
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        addLog("CHALLENGE_CODE DISPATCHED. CHECK YOUR INBOX.");
      }
      setVerificationStep('CHALLENGE');
    } catch (error) {
      addLog("HANDSHAKE FAILED. SIGNAL INTERFERENCE DETECTED.");
    } finally {
      setIsSending(false);
    }
  };

  const verifyHandshake = () => {
    if (!userInputCode) return;
    setIsSending(true);
    addLog("VALIDATING CHALLENGE_CODE...");

    setTimeout(() => {
      if (userInputCode === handshakeCode) {
        setIsVerified(true);
        addLog("HANDSHAKE ACCEPTED. ENCRYPTION KEY SYNCED.");
        addLog("SIGNAL VERIFIED. UPLINK UNLOCKED.");
        setVerificationStep('UPLINK');
      } else {
        addLog("ACCESS DENIED. INVALID CHALLENGE_CODE.");
      }
      setIsSending(false);
    }, 1500);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (verificationStep === 'IDENTIFY') startHandshake();
    else if (verificationStep === 'CHALLENGE') verifyHandshake();
    else if (verificationStep === 'UPLINK') finalizeTransmission(e);
  };

  const finalizeTransmission = async (e) => {
    if (!isVerified || isSending) return;

    setIsSending(true);
    addLog("EXECUTING FINAL UPLINK...");

    try {
      if (EMAILJS_CONFIG.PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
        await new Promise(r => setTimeout(r, 2000));
      } else {
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.MESSAGE_TEMPLATE_ID,
          {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message
          },
          EMAILJS_CONFIG.PUBLIC_KEY
        );
      }

      addLog("TRANSMISSION SUCCESSFUL. DATA PACKETS RECEIVED.");
      addLog("TERMINATING SESSION...");

      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setVerificationStep('IDENTIFY');
        setIsVerified(false);
        setHandshakeCode('');
        setUserInputCode('');
        setIsSending(false);
        addLog("SESSION RE-INITIALIZED. STANDBY.");
      }, 3000);
    } catch (error) {
      addLog("UPLINK FAILURE. PERSISTENT TRANSMISSION ERROR.");
      setIsSending(false);
    }
  };

  const { scrollYProgress } = useScroll();
  const lenisRef = useRef(null);

  // Infinite Horizontal Loop Logic
  const marqueeX = useMotionValue(0);
  const marqueeSpeed = useRef(-0.8);
  const isMarqueeHovered = useRef(false);
  const PROJECTS_COUNT = 3;
  const CARD_WIDTH = 400; /* Re-aligned with CSS clamp */
  const CARD_GAP = 60;
  const SET_WIDTH = (CARD_WIDTH + CARD_GAP) * PROJECTS_COUNT;

  useAnimationFrame((t, delta) => {
    // Only move if we are in the Works section
    if (activeScene === 2) {
      const targetSpeed = isMarqueeHovered.current ? 0 : -0.8;
      // Fluid deceleration/acceleration (Lerp)
      marqueeSpeed.current += (targetSpeed - marqueeSpeed.current) * 0.08;

      const currentX = marqueeX.get();
      let newX = currentX + marqueeSpeed.current;

      // Reset for seamless loop
      if (newX <= -SET_WIDTH) {
        newX = 0;
      }
      marqueeX.set(newX);
    }
  });

  // Initialize Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 2.5,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Clean cinematic curve
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll Orchestration: Pause main scroll when detail overlay or resume is active
  useEffect(() => {
    if (selectedSkill || showResume) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [selectedSkill, showResume]);

  // Active Scene tracked via IntersectionObserver later on the sections themselves.

  // Transform values handled per-section via whileInView now.

  // ---------- Scroll Snap Logic ----------
  // After the user stops scrolling for 350ms, snap to the nearest section.
  useEffect(() => {
    const SECTION_IDS = ['scene-0', 'scene-1', 'scene-2', 'scene-3'];
    let snapTimer = null;
    let isSnapping = false;

    const snapToNearest = () => {
      if (!lenisRef.current) return;
      if (selectedSkill || showResume) return; // disable during overlays

      const scrollTop = window.scrollY;
      let closest = null;
      let minDist = Infinity;

      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elTop = window.scrollY + rect.top;
        const dist = Math.abs(elTop - scrollTop);
        if (dist < minDist) { minDist = dist; closest = el; }
      });

      if (closest && !isSnapping) {
        isSnapping = true;
        lenisRef.current.scrollTo(closest, {
          duration: 1.2,
          easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
          onComplete: () => { isSnapping = false; }
        });
      }
    };

    const onScroll = () => {
      if (isSnapping) return;
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToNearest, 350);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(snapTimer);
    };
  }, [selectedSkill, showResume]);
  // ----------------------------------------

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

  const NAV_LINKS = [
    { name: 'ABOUT', id: 'scene-0', scene: 0 },
    { name: 'SKILLS', id: 'scene-1', scene: 1 },
    { name: 'WORKS', id: 'scene-2', scene: 2 },
    { name: 'CONTACT', id: 'scene-3', scene: 3 }
  ];

  const scrollToSection = (id) => {
    if (!lenisRef.current) return;
    const target = document.getElementById(id);
    if (target) {
      lenisRef.current.scrollTo(target, {
        duration: 2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    }
  };

  return (
    <div className="main-content-wrapper">
      {/* Context-Aware Custom Cursor */}
      <div className={`cursor-dot ${cursorText ? 'hidden' : ''}`} ref={cursorDot}></div>
      <div className={`cursor-outline ${cursorText ? 'expanded' : ''}`} ref={cursorOutline}></div>
      <div className="cursor-text" ref={cursorTextRef} style={{ opacity: cursorText ? 1 : 0 }}>
        {cursorText}
      </div>

      {/* Portraits and Handshake Handled below in intro-split-layout */}
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

        {/* Neural Edge Detection Filter Definitions */}
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
          <filter id="neural-edge-detect">
            <feColorMatrix type="saturate" values="0" />
            <feConvolveMatrix
              order="3"
              kernelMatrix="-1 -1 -1 
                            -1  8 -1 
                            -1 -1 -1"
              preserveAlpha="true"
            />
            {/* Map Gray intensity to Neon Green (#39FF14) */}
            <feColorMatrix type="matrix" values="0.22 0 0 0 0 
                                                 1.00 0 0 0 0 
                                                 0.08 0 0 0 0 
                                                 0    0 0 1 0" />
            <feComponentTransfer>
              <feFuncR type="gamma" exponent="0.5" amplitude="0.7" />
              <feFuncG type="gamma" exponent="0.5" amplitude="0.7" />
              <feFuncB type="gamma" exponent="0.5" amplitude="0.7" />
            </feComponentTransfer>
          </filter>
        </svg>

        <nav className="main-nav" style={{ position: 'fixed', mixBlendMode: 'difference', display: selectedSkill ? 'none' : 'block' }}>
          <div className="nav-content">
            <div className="logo magnetic" onClick={() => scrollToSection(0)} onMouseEnter={handleCursorHover('HOME')} onMouseLeave={handleCursorLeave}>ALLEN.</div>
            <div className="nav-links">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.name}
                  className={`nav-link-item ${activeScene === link.scene ? 'active' : ''}`}
                  onClick={() => { playClick(); scrollToSection(link.id); }}
                  onMouseEnter={handleCursorHover(`JUMP TO ${link.name}`)}
                  onMouseLeave={handleCursorLeave}
                >
                  {link.name}
                </button>
              ))}
              <span className="scene-counter" style={{ color: 'var(--color-accent)', marginLeft: '1rem' }}>FRAME {activeScene + 1}/{TOTAL_SCENES}</span>
            </div>
          </div>
        </nav>

        {/* WebGL Background */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <Canvas eventSource={document.body} eventPrefix="client" camera={{ position: [0, 0, 10], fov: 45 }}>
            <React.Suspense fallback={null}>
              <HeroScene activeScene={activeScene} />
            </React.Suspense>
          </Canvas>
        </div>

        <div className="scroll-sections">
          {/* Frame 0: Cinematic Introduction */}
          <motion.div
            id="scene-0"
            onViewportEnter={() => setActiveScene(0)}
            viewport={{ amount: 0.3 }}
            key="scene0"
            initial="initial"
            whileInView="in"
            variants={pageVariants}
            transition={pageTransition}
            className="frame-container padded-left"
            style={{ pointerEvents: 'auto' }}
          >
              <div className="intro-split-layout">
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
                    className="intro-role-wrapper"
                  >
                    <h2 className="intro-role">Full Stack Developer & Digital Architect</h2>
                    <button
                      className="intro-resume-btn"
                      onClick={() => { playClick(); setShowResume(true); }}
                      onMouseEnter={handleCursorHover('VIEW_RESUME')}
                      onMouseLeave={handleCursorLeave}
                    >
                      <span className="btn-tag">[SYSTEM_RECORD]</span>
                      <span className="btn-label">VIEW_RESUME</span>
                    </button>
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

                <motion.div
                  className="hero-image-container"
                  initial={{ opacity: 0, scale: 0.9, x: 400 }}
                  animate={introComplete ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.9, x: 400 }}
                  transition={{ delay: 0.3, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ zIndex: 100, position: 'relative' }}
                >
                  <img
                    src="./assets/hero.png"
                    alt="Allen Biju Portrait"
                    className="hero-portrait-image"
                    onMouseEnter={handleCursorHover('OPERATOR_ID')}
                    onMouseLeave={handleCursorLeave}
                  />
                  <p className="hero-caption" style={{
                    position: 'absolute',
                    bottom: '-40px',
                    right: '10%',
                    color: '#CCD6F6',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '400px',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    zIndex: 10
                  }}>
                    {captionText}
                    <span style={{ opacity: captionText.length > 0 && captionText.length < fullCaption.length ? 1 : 0 }}>_</span>
                  </p>
                </motion.div>
              </div>
            </motion.div>

          {/* Frame 1: Skills HUD — Game-like */}
            <motion.div
              id="scene-1"
              onViewportEnter={() => setActiveScene(1)}
              viewport={{ amount: 0.3 }}
              key="scene1"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(15px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5vw',
                pointerEvents: 'auto',
                transformStyle: 'preserve-3d',
                zIndex: 10,
                minHeight: '100vh'
              }}
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

                Glitch heading
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
                <motion.div
                  onViewportEnter={() => setBentoInView(true)}
                  onViewportLeave={() => setBentoInView(false)}
                  viewport={{ once: false, amount: 0.1 }}
                >
                <div className="bento-grid">
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
                  ].map((skill, i) => {
                    // 3-col × 2-row grid entry directions (moderate px values avoid body overflow-x clip)
                    const entryMap = [
                      { x: -500, y: -400 }, // 0: top-left corner
                      { x: 0,    y: -500 }, // 1: top-center
                      { x: 500,  y: -400 }, // 2: top-right corner
                      { x: -500, y:  400 }, // 3: bottom-left corner
                      { x: 0,    y:  500 }, // 4: bottom-center
                      { x: 500,  y:  400 }, // 5: bottom-right corner
                    ];
                    const entry = entryMap[i] || { x: 0, y: 40 };

                    return (
                    <motion.div
                      key={skill.name}
                      className="bento-card"
                      initial={{ opacity: 0, x: entry.x, y: entry.y, scale: 0.85 }}
                      animate={bentoInView
                        ? { opacity: 1, x: 0, y: 0, scale: 1 }
                        : { opacity: 0, x: entry.x, y: entry.y, scale: 0.85 }
                      }
                      transition={{ 
                        duration: 0.9, 
                        delay: bentoInView ? i * 0.08 : (5 - i) * 0.05, 
                        ease: [0.22, 1, 0.36, 1] 
                      }}
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
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={bentoInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -20 }}
                          transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 400 }}
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
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={bentoInView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: 0.6 + i * 0.08 }}
                            style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', color: skill.color, fontWeight: 700 }}>
                            {skill.xp}/100
                          </motion.span>
                        </div>
                        {/* Track */}
                        <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                          <motion.div
                            style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${skill.color}90, ${skill.color})`, position: 'relative' }}
                            initial={{ width: '0%' }}
                            animate={bentoInView ? { width: `${skill.xp}%` } : { width: '0%' }}
                            transition={{ duration: 1.2, delay: 0.7 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {/* Shimmer */}
                            <motion.div
                              style={{
                                position: 'absolute', top: 0, right: 0, width: 12, height: '100%',
                                background: 'rgba(255,255,255,0.7)', borderRadius: 3
                              }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.5, delay: 2 + i * 0.08, repeat: Infinity, repeatDelay: 3 }}
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {skill.tags.map((tag, ti) => (
                          <motion.span key={tag}
                            initial={{ opacity: 0, x: -8 }}
                            animate={bentoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                            transition={{ delay: 1 + i * 0.08 + ti * 0.06 }}
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
                  );})}
                </div>
                </motion.div>

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

          {/* Frame 2: Stabilized 3D Project Showcase */}
            <motion.div
              id="scene-2"
              onViewportEnter={() => setActiveScene(2)}
              viewport={{ amount: 0.3 }}
              key="scene2"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(15px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
              style={{
                transformStyle: 'preserve-3d',
                pointerEvents: 'auto',
                zIndex: 10,
                minHeight: '100vh'
              }}
              className="frame-container centered"
            >
              <div className="gallery-wrapper">
                <div style={{ textAlign: 'center', marginBottom: '4vh' }}>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="title-font"
                    style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#fff', letterSpacing: '0.1em', marginBottom: '1.2rem' }}
                  >
                    SELECTED WORKS
                  </motion.h2>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ width: '80px', height: '1px', background: 'var(--color-accent)', margin: '0 auto' }}
                  />
                </div>

                <motion.div
                  className="gallery-track"
                  style={{ x: marqueeX }}
                  onMouseEnter={() => { isMarqueeHovered.current = true; }}
                  onMouseLeave={() => { isMarqueeHovered.current = false; }}
                >
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
                  ].concat([ // Repeat list for seamless loop
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
                  ]).map((proj, i) => (
                    <ProjectCard3D
                      key={`${proj.name}-${i}`}
                      proj={proj}
                      i={i % 3} // Use modulo to keep entry animation synced for both sets
                      scrollProgress={scrollYProgress}
                      cursorHandlers={{ hover: handleCursorHover, leave: handleCursorLeave }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>

          {/* Frame 3: Contact Form - Terminal Overhaul */}
            <motion.div 
              id="scene-3"
              onViewportEnter={() => setActiveScene(3)}
              viewport={{ amount: 0.3 }}
              key="scene3" 
              initial="initial" 
              whileInView="in" 
              variants={pageVariants} 
              transition={pageTransition} 
              className="frame-container centered"
              style={{ pointerEvents: 'auto', minHeight: '100vh' }}
            >
              <div className="terminal-wrapper">
                {/* HUD Brackets */}
                <div className="card-hud-brackets">
                  <div className="bracket tl" />
                  <div className="bracket tr" />
                  <div className="bracket bl" />
                  <div className="bracket br" />
                </div>

                <div className="terminal-header">
                  <div className="terminal-status-light pulse" />
                  <span className="terminal-title">RECV_NODE: ALPHA-7 // UPLINK_READY</span>
                </div>

                <div className="terminal-content">
                  <div className="terminal-form-side">
                    <h2 className="title-font section-heading-modern">INITIATE TRANSMISSION</h2>
                    <form className="modern-form-terminal" onSubmit={handleFormSubmit}>
                      {verificationStep === 'IDENTIFY' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="form-step-wrapper">
                          <div className="form-group-glass">
                            <input
                              type="text"
                              required
                              placeholder=" "
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              onMouseEnter={handleCursorHover('IDENTIFY')}
                              onMouseLeave={handleCursorLeave}
                            />
                            <label>OPERATOR_ID (NAME)</label>
                            <div className="input-glow" />
                          </div>

                          <div className="form-group-glass" style={{ marginTop: '1.5rem' }}>
                            <input
                              type="email"
                              required
                              placeholder=" "
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              onMouseEnter={handleCursorHover('SIGNAL')}
                              onMouseLeave={handleCursorLeave}
                            />
                            <label>SIGNAL_NODE (EMAIL)</label>
                            <div className="input-glow" />
                          </div>
                        </motion.div>
                      )}

                      {verificationStep === 'CHALLENGE' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="form-step-wrapper">
                          <div className="form-group-glass">
                            <input
                              type="text"
                              required
                              maxLength="6"
                              placeholder=" "
                              value={userInputCode}
                              onChange={(e) => setUserInputCode(e.target.value.replace(/\D/g, ''))}
                              onMouseEnter={handleCursorHover('INPUT CODE')}
                              onMouseLeave={handleCursorLeave}
                            />
                            <label>ENCRYPTED_CHALLENGE_CODE</label>
                            <div className="input-glow" />
                          </div>
                          <p style={{ fontSize: '0.65rem', color: 'var(--color-accent)', marginTop: '1rem', opacity: 0.8 }}>
                            &gt; A 6-DIGIT VERIFICATION KEY HAS BEEN DISPATCHED TO YOUR SIGNAL_NODE.
                          </p>
                        </motion.div>
                      )}

                      {verificationStep === 'UPLINK' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="form-step-wrapper">
                          <div className="form-group-glass">
                            <textarea
                              required
                              placeholder=" "
                              rows="4"
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              onMouseEnter={handleCursorHover('MESSAGE')}
                              onMouseLeave={handleCursorLeave}
                            ></textarea>
                            <label>ENCRYPTED_PAYLOAD (MESSAGE)</label>
                            <div className="input-glow" />
                          </div>
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        className={`terminal-submit-btn ${isSending ? 'disabled' : ''}`}
                        disabled={isSending}
                        onMouseEnter={() => { !isSending && handleCursorHover(verificationStep === 'IDENTIFY' ? 'INITIATE HANDSHAKE' : verificationStep === 'CHALLENGE' ? 'SUBMIT CODE' : 'EXECUTE UPLINK')(); !isSending && playUILong(); }}
                        onMouseLeave={handleCursorLeave}
                        whileHover={!isSending ? { scale: 1.02 } : {}}
                        whileTap={!isSending ? { scale: 0.98 } : {}}
                        style={{ marginTop: '2rem' }}
                      >
                        <span className="btn-text">
                          {isSending ? 'PROCESSING...' :
                            verificationStep === 'IDENTIFY' ? 'INITIATE_HANDSHAKE' :
                              verificationStep === 'CHALLENGE' ? 'VALIDATE_HANDSHAKE' :
                                'EXECUTE_UPLINK'}
                        </span>
                        <div className="btn-glitch-layer" />
                      </motion.button>

                      {verificationStep !== 'IDENTIFY' && !isSending && (
                        <button
                          type="button"
                          onClick={() => { setVerificationStep('IDENTIFY'); setIsVerified(false); }}
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.6rem', marginTop: '1rem', cursor: 'none', letterSpacing: '0.1em' }}
                          onMouseEnter={handleCursorHover('RESTART')}
                          onMouseLeave={handleCursorLeave}
                        >
                          [ ABORT_AND_RESTART ]
                        </button>
                      )}
                    </form>
                  </div>

                  <div className="terminal-log-side">
                    <div className="log-header">SESSION_LOG</div>
                    <div className="log-entries">
                      {terminalLogs.map((log, i) => (
                        <div key={i} className="log-entry">&gt; {log}</div>
                      ))}
                      <div ref={logEndRef} />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="log-entry cursor"
                      >_</motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
        </div>

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

      <ResumeModal
        isOpen={showResume}
        onClose={() => setShowResume(false)}
        handleCursorHover={handleCursorHover}
        handleCursorLeave={handleCursorLeave}
        playClick={playClick}
      />

        {/* Global Social Footer */}
        <motion.footer
          className="global-footer"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: introComplete ? (activeScene >= 3 ? 1 : 0.4) : 0,
            y: introComplete ? 0 : 50
          }}
          transition={{ duration: 0.8 }}
        >
          <div className="footer-content">
            <div className="footer-left">
              <span className="system-tag">LOC_NODE: EARTH.JS // 2024</span>

              <motion.button
                className="sound-toggle-btn"
                onClick={handleToggleMute}
                onMouseEnter={handleCursorHover(muted ? 'RESTORE_AUDIO' : 'MUTE_SYSTEM')}
                onMouseLeave={handleCursorLeave}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="sound-icon-wrapper">
                  {muted ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2V15H6L11 19V5Z" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2V15H6L11 19V5Z" />
                      <path d="M19.07 4.93C20.9461 6.80654 21.9989 9.3512 21.9989 12C21.9989 14.6488 20.9461 17.1935 19.07 19.07" />
                      <path d="M15.54 8.46C16.4774 9.39764 17.0031 10.6692 17.0031 12C17.0031 13.3308 16.4774 14.6024 15.54 15.54" />
                    </svg>
                  )}
                </div>
                <span className="sound-status-label">{muted ? 'OFF' : 'ON'}</span>
              </motion.button>
            </div>
            <div className="footer-center">
              <div className="social-links-hud">
                {[
                  { name: 'INSTAGRAM', url: 'https://www.instagram.com/a_llen___?igsh=MTdiM2FlNmtsd2Yx', color: '#E1306C' },
                  { name: 'FIVERR', url: 'https://www.fiverr.com/s/42VKoVR', color: '#1DBF73' },
                  { name: 'GITHUB', url: 'https://github.com/allen-biju', color: '#FFF' },
                  { name: 'LINKEDIN', url: 'https://www.linkedin.com/in/allen-biju-2b7458291?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', color: '#0077B5' }
                ].map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    className="social-hover-link"
                    onMouseEnter={handleCursorHover(`ACCESS ${link.name}`)}
                    onMouseLeave={handleCursorLeave}
                    whileHover={{ y: -5, color: 'var(--color-accent)' }}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>
            </div>
            <div className="footer-right">
              <div className="status-readout">
                <span className="latency">LATENCY: 14MS</span>
                <span className="uptime">UPTIME: 99.9%</span>
              </div>
            </div>
          </div>
        </motion.footer>


      </div>{/* end main content wrapper */}
    </div>
  );
}

export default App;
