import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './CosmicGalaxy.css';

export default function CosmicGalaxy({ id = "scene-galaxy", style = {} }) {
  const { scrollYProgress } = useScroll();

  // Subtle parallax depth transforms for star layers
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const fgY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <motion.div
      id={id}
      className="cosmic-galaxy-container"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      viewport={{ amount: 0.2 }}
      style={style}
    >
      {/* Base Space Background */}
      <div className="galaxy-bg-base" />

      {/* Diffuse Atmospheric Nebulae */}
      <div className="galaxy-nebula-wrapper">
        <div className="galaxy-nebula-cloud-1" />
        <div className="galaxy-nebula-cloud-2" />
        <div className="galaxy-nebula-cloud-3" />
      </div>

      {/* 3-Layered Parallax Starfield */}
      <div className="galaxy-starfield-wrapper">
        <motion.div className="galaxy-stars-bg" style={{ y: bgY }} />
        <motion.div className="galaxy-stars-mid" style={{ y: midY }} />
        <motion.div className="galaxy-stars-fg" style={{ y: fgY }} />
      </div>

      {/* Vignette Depth Overlay */}
      <div className="galaxy-vignette" />

      {/* Minimal Atmosphere Readout HUD */}
      <motion.div
        className="galaxy-hud-readout"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <h2 className="galaxy-hud-title">COSMIC SECTOR</h2>
        <p className="galaxy-hud-sub">&gt; SECTOR_01 // DIMENSIONAL TRANSITION</p>
      </motion.div>
    </motion.div>
  );
}
