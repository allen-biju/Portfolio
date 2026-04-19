import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeModal = ({ isOpen, onClose, handleCursorHover, handleCursorLeave, playClick }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="resume-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="resume-container glass-hud"
          data-lenis-prevent
          initial={{ scale: 0.9, opacity: 0, rotateX: 15 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* HUD Accents */}
          <div className="hud-corner top-left" />
          <div className="hud-corner top-right" />
          <div className="hud-corner bottom-left" />
          <div className="hud-corner bottom-right" />
          
          <button 
            className="resume-close-btn" 
            onClick={() => { playClick(); onClose(); }}
            onMouseEnter={handleCursorHover('CLOZE RECORD')}
            onMouseLeave={handleCursorLeave}
          >
            [ DISMISS ]
          </button>

          <header className="resume-header">
            <div className="header-glitch-wrapper">
              <h1 className="resume-name" data-text="ALLEN BIJU">ALLEN BIJU</h1>
              <div className="header-line" />
            </div>
            <p className="resume-title">FULL-STACK DEVELOPER & DIGITAL ARCHITECT</p>
            <div className="header-metadata">
              <span>LOC_NODE: EARTH.JS</span>
              <span>UPLINK: ACTIVE</span>
              <span>SECURITY_CLEARANCE: LEVEL_4</span>
            </div>
          </header>

          <div className="resume-content-grid">
            <section className="resume-section about">
              <h2 className="section-title">01_PROFILE</h2>
              <p>
                Expertise in bridging high-performance engineering with creative storytelling. 
                Specializing in seamless digital ecosystems, immersive frontends, and AI-driven solutions 
                that prioritize both technical excellence and user experience.
              </p>
            </section>

            <section className="resume-section arsenal">
              <h2 className="section-title">02_THE_ARSENAL</h2>
              <div className="skill-groups">
                <div className="skill-group">
                  <h4>ENGINEERING</h4>
                  <ul>
                    <li>React / Next.js</li>
                    <li>Node.js / Express</li>
                    <li>MongoDB / PostgreSQL</li>
                    <li>REST & GraphQL</li>
                  </ul>
                </div>
                <div className="skill-group">
                  <h4>IMMERSIVE</h4>
                  <ul>
                    <li>Three.js / R3F</li>
                    <li>GSAP / Framer Motion</li>
                    <li>GLSL Shaders</li>
                    <li>WebGL Core</li>
                  </ul>
                </div>
                <div className="skill-group">
                  <h4>CREATIVE</h4>
                  <ul>
                    <li>Adobe Premiere Pro</li>
                    <li>After Effects (VFX)</li>
                    <li>Adobe Illustrator</li>
                    <li>Figma (UX/UI)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="resume-section experience">
              <h2 className="section-title">03_FIELD_REPORTS</h2>
              <div className="exp-item">
                <div className="exp-header">
                  <h3>CREATIVE TECHNOLOGIST</h3>
                  <span>2022 — PRESENT</span>
                </div>
                <p>Developing bespoke digital solutions ranging from high-fidelity WebGL portfolios to full-stack enterprise dashboards and cinematic video content.</p>
              </div>
              <div className="exp-item">
                <div className="exp-header">
                  <h3>FRONTEND SPECIALIST</h3>
                  <span>PROJECT-BASED</span>
                </div>
                <p>Optimizing user-facing systems with a focus on hardware acceleration, performance, and advanced interaction design.</p>
              </div>
            </section>

            <section className="resume-section education">
              <h2 className="section-title">04_ACQUISITION</h2>
              <div className="edu-item">
                <h3>ADVANCED FULL-STACK ARCHITECTURE</h3>
                <p>Deep specialization in modern JavaScript ecosystems and scalable system design.</p>
              </div>
            </section>
          </div>

          <footer className="resume-footer">
            <div className="footer-scanline" />
            <span className="timestamp">LAST_SYNC: {new Date().toLocaleDateString()}</span>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResumeModal;
