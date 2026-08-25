import React, { useMemo } from 'react';
import './GalleryVortex.css';

// Import all 21 images from src/assets/gallery
import img1 from '../assets/gallery/image1.jpeg';
import img2 from '../assets/gallery/image2.jpeg';
import img3 from '../assets/gallery/image3.jpeg';
import img4 from '../assets/gallery/image4.jpeg';
import img5 from '../assets/gallery/image5.jpeg';
import img6 from '../assets/gallery/image6.jpeg';
import img7 from '../assets/gallery/image7.jpeg';
import img8 from '../assets/gallery/image8.jpeg';
import img9 from '../assets/gallery/image9.jpeg';
import img10 from '../assets/gallery/image10.jpeg';
import img11 from '../assets/gallery/image11.jpeg';
import img12 from '../assets/gallery/image12.jpeg';
import img13 from '../assets/gallery/image13.jpeg';
import img14 from '../assets/gallery/image14.jpeg';
import img15 from '../assets/gallery/image15.jpeg';
import img16 from '../assets/gallery/image16.jpeg';
import img17 from '../assets/gallery/image17.jpeg';
import img18 from '../assets/gallery/image18.jpeg';
import img19 from '../assets/gallery/image19.jpeg';
import img20 from '../assets/gallery/image20.jpeg';
import img21 from '../assets/gallery/image21.jpeg';
import img22 from '../assets/gallery/image22.jpg';
import img23 from '../assets/gallery/image23.jpeg';
import img24 from '../assets/gallery/image24.jpeg';
import img25 from '../assets/gallery/image25.jpeg';
import img26 from '../assets/gallery/image26.jpeg';
import img27 from '../assets/gallery/image27.jpeg';
import img28 from '../assets/gallery/image28.jpeg';
import img29 from '../assets/gallery/image29.jpeg';
import img30 from '../assets/gallery/image30.jpeg';
import img31 from '../assets/gallery/image31.jpeg';

/* ─────────────────────────────────────────────────────────────────────────────
   MODULAR IMAGE DATA (31 Images)
───────────────────────────────────────────────────────────────────────────── */
export const GALLERY_IMAGES = [
  { id: 'g01', title: 'NEURAL NEXUS', img: img1, accent: '#38BDF8' },
  { id: 'g02', title: 'CEV CONNECT', img: img2, accent: '#E8A020' },
  { id: 'g03', title: 'CINEMATIC REELS', img: img3, accent: '#A855F7' },
  { id: 'g04', title: 'DIGITAL ARCHIVE', img: img4, accent: '#38BDF8' },
  { id: 'g05', title: 'QUANTUM CORE', img: img5, accent: '#E8A020' },
  { id: 'g06', title: 'VOID INTERFACE', img: img6, accent: '#7dd3fc' },
  { id: 'g07', title: 'ECHO SIGNAL', img: img7, accent: '#34D399' },
  { id: 'g08', title: 'PRISM ENGINE', img: img8, accent: '#F472B6' },
  { id: 'g09', title: 'ORBITAL GRID', img: img9, accent: '#FB923C' },
  { id: 'g10', title: 'NEURAL IDENTITY', img: img10, accent: '#C084FC' },
  { id: 'g11', title: 'KINETIC TYPE', img: img11, accent: '#38BDF8' },
  { id: 'g12', title: 'DEEP FIELD', img: img12, accent: '#E8A020' },
  { id: 'g13', title: 'HELIX PROTOCOL', img: img13, accent: '#34D399' },
  { id: 'g14', title: 'VECTOR BLOOM', img: img14, accent: '#F472B6' },
  { id: 'g15', title: 'CARBON LAYER', img: img15, accent: '#94A3B8' },
  { id: 'g16', title: 'FLUX TERMINAL', img: img16, accent: '#38BDF8' },
  { id: 'g17', title: 'SHARD ATLAS', img: img17, accent: '#E8A020' },
  { id: 'g18', title: 'SIGNAL DRIFT', img: img18, accent: '#A855F7' },
  { id: 'g19', title: 'CORE MANIFEST', img: img19, accent: '#34D399' },
  { id: 'g20', title: 'PHANTOM MOTION', img: img20, accent: '#FB923C' },
  { id: 'g21', title: 'SYNAPSE NODE',  img: img21, accent: '#38BDF8' },
  { id: 'g22', title: 'HELIX WAVE',    img: img22, accent: '#E8A020' },
  { id: 'g23', title: 'STELLAR DRIFT', img: img23, accent: '#A855F7' },
  { id: 'g24', title: 'ECHO CHAMBER',  img: img24, accent: '#34D399' },
  { id: 'g25', title: 'VOID RUNNER',   img: img25, accent: '#F472B6' },
  { id: 'g26', title: 'DARK MATTER',   img: img26, accent: '#38BDF8' },
  { id: 'g27', title: 'NOVA CORE',     img: img27, accent: '#FB923C' },
  { id: 'g28', title: 'GRID FLUX',     img: img28, accent: '#C084FC' },
  { id: 'g29', title: 'WARP SIGNAL',   img: img29, accent: '#34D399' },
  { id: 'g30', title: 'RIFT ENGINE',   img: img30, accent: '#E8A020' },
  { id: 'g31', title: 'PULSE ARRAY',   img: img31, accent: '#38BDF8' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SEEDED RANDOM (Deterministic per index)
───────────────────────────────────────────────────────────────────────────── */
function sr(seed, offset = 0) {
  let s = ((seed * 1103515245 + offset * 6364136223846793005) | 0) >>> 0;
  s = ((s ^ (s >>> 16)) * 0x45d9f3b) >>> 0;
  s = ((s ^ (s >>> 16)) * 0x45d9f3b) >>> 0;
  s = (s ^ (s >>> 16)) >>> 0;
  return s / 0xffffffff;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TRAJECTORY COMPUTATION
   - Spatial 3D burst (X, Y, Z) with Leonardo.ai-style camera-zoom & perspective
   - Broad 360° emission disc
   - Extended scroll lifespans for graceful, unhurried motion
───────────────────────────────────────────────────────────────────────────── */
export function computeTrajectory(index, total) {
  const R = (o) => sr(index, o);

  /* ── Emission origin: broad central zone, full 360° disc ── */
  const emitDist = Math.sqrt(R(0)) * 150;            // 0..150px from center
  const emitTheta = R(1) * Math.PI * 2;               // 0..2PI
  const emitX = Math.cos(emitTheta) * emitDist;   // -150..+150px
  const emitY = Math.sin(emitTheta) * emitDist;   // -150..+150px

  /* ── Travel direction: outward from emission point with organic jitter ── */
  const baseAngle = emitDist > 10 ? Math.atan2(emitY, emitX) : emitTheta;
  const jitter = (R(2) - 0.5) * (Math.PI * 0.38); // ±34° organic deviation
  const travelAngle = baseAngle + jitter;

  /* ── Travel distance: 750–1350px for smooth, gradual expansion ── */
  const dist = 750 + R(3) * 600;
  const destX = emitX + Math.cos(travelAngle) * dist;
  const destY = emitY + Math.sin(travelAngle) * dist * 0.85;

  /* ── 3D Z-Depth & Spatial Perspective (Leonardo.ai forward zoom) ── */
  const startZ = -450 - R(11) * 250;                  // -450px to -700px in depth
  const endZ = 80 + R(12) * 160;                    // +80px to +240px toward camera
  const rotX = -Math.sin(travelAngle) * (5 + R(13) * 8);
  const rotY = Math.cos(travelAngle) * (5 + R(14) * 8);
  const rotZ = (R(6) - 0.5) * 16;                   // ±8 deg subtle roll

  /* ── Scale: starts at good thumbnail size, grows to full showcase size ── */
  const startScale = 0.28 + R(4) * 0.12;              // 0.28 – 0.40
  const endScale = 1.05 + R(5) * 0.45;              // 1.05 – 1.50

  /* ── Aspect ratio variety ── */
  const aspects = ['img-landscape', 'img-portrait', 'img-square', 'img-wide'];
  const aspect = aspects[Math.floor(R(7) * aspects.length)];

  /* ── Peak opacity ── */
  const peakOpacity = 0.92 + R(8) * 0.08;             // 0.92 – 1.0

  /* ── Scroll window: progressive continuous flow across scroll range ── */
  // All 31 pictures spawn smoothly between 0.38 and 0.68 so that EVERY card finishes
  // its full flight and completely fades out to 0 opacity by 0.88–0.90 (well before the end).
  const baseT = 0.38 + (index / total) * (0.68 - 0.38);
  const jitterT = (R(9) - 0.5) * 0.04;
  const scrollStart = Math.max(0.38, Math.min(0.68, baseT + jitterT));
  const dur = 0.18 + R(10) * 0.04;                  // 0.18 – 0.22 of scroll lifespan
  const scrollEnd = scrollStart + dur;

  return {
    emitX, emitY,
    destX, destY,
    startZ, endZ,
    rotX, rotY, rotZ,
    startScale, endScale,
    aspect,
    peakOpacity,
    scrollStart,
    dur,
    scrollEnd,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   BURST IMAGE ELEMENT
───────────────────────────────────────────────────────────────────────────── */
export function BurstImage({ image, trajectory, dataIndex }) {
  const { emitX, emitY, startZ, startScale, aspect } = trajectory;
  return (
    <div
      className={`vortex-img ${aspect}`}
      data-burst-index={dataIndex}
      style={{
        transform: `translate3d(calc(-50% + ${emitX}px), calc(-50% + ${emitY}px), ${startZ}px) scale(${startScale})`,
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      {image.img ? (
        <img
          src={image.img}
          alt={image.title}
          className="vortex-img__media"
          loading="eager"
        />
      ) : (
        <div className="vortex-img__media placeholder" style={{ background: image.bg }} />
      )}

      {/* Subtle corner accents */}
      <div className="vortex-img__corner-tl" style={{ borderColor: image.accent }} />
      <div className="vortex-img__corner-br" style={{ borderColor: image.accent }} />

      {/* Surface Sheen */}
      <div className="vortex-img__sheen" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GALLERY VORTEX COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function GalleryVortex({ images = GALLERY_IMAGES }) {
  const trajectories = useMemo(
    () => images.map((_, i) => computeTrajectory(i, images.length)),
    [images]
  );

  return (
    <div className="galaxy-vortex-volume" id="galaxy-vortex-root">
      {images.map((image, i) => (
        <BurstImage
          key={image.id}
          image={image}
          trajectory={trajectories[i]}
          dataIndex={i}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SETUP VORTEX BURST TIMELINE
───────────────────────────────────────────────────────────────────────────── */
export function setupVortexBurstTimeline(tl, vortexContainer) {
  if (!vortexContainer) return;

  const imgs = vortexContainer.querySelectorAll('.vortex-img');
  if (!imgs.length) return;

  const total = GALLERY_IMAGES.length;

  imgs.forEach((img, i) => {
    const t = computeTrajectory(i, total);
    const {
      emitX, emitY,
      destX, destY,
      startZ, endZ,
      rotX, rotY, rotZ,
      startScale, endScale,
      peakOpacity,
      scrollStart,
      dur,
    } = t;

    const fadeInDur = dur * 0.22;
    const fadeOutDur = dur * 0.45;
    const fadeOutStart = scrollStart + dur - fadeOutDur;

    // 1. Continuous 3D spatial flight (X, Y, Z + scale + 3D tilt) across the entire card lifespan
    tl.fromTo(
      img,
      {
        x: emitX,
        y: emitY,
        z: startZ,
        scale: startScale,
        rotateX: rotX * 0.3,
        rotateY: rotY * 0.3,
        rotateZ: 0,
      },
      {
        x: destX,
        y: destY,
        z: endZ,
        scale: endScale,
        rotateX: rotX,
        rotateY: rotY,
        rotateZ: rotZ,
        ease: 'power1.out',
        duration: dur,
      },
      scrollStart
    );

    // 2. Smooth opacity rise as card emerges from center
    tl.fromTo(
      img,
      { opacity: 0 },
      {
        opacity: peakOpacity,
        ease: 'power2.out',
        duration: fadeInDur,
      },
      scrollStart
    );

    // 3. Complete and clean fade out to 0 opacity as card expands and drifts into void
    tl.to(
      img,
      {
        opacity: 0,
        ease: 'power2.inOut',
        duration: fadeOutDur,
      },
      fadeOutStart
    );
  });
}
