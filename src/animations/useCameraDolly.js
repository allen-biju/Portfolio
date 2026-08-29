import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupVortexBurstTimeline } from '../components/GalleryVortex';

gsap.registerPlugin(ScrollTrigger);

/**
 * Calculates the exact scale (both viewport-fit scale and push-through scale),
 * transformOrigin, and translation (x, y) needed to align the 4 sides of the tvAnchor
 * with the desktop screen, and then push further in until the TV frame moves out of view.
 */
function computeDollyTarget(container, anchor, text) {
  if (!container || !anchor) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const wrapper = container.parentElement;

  const prevWrapperTransform = wrapper ? wrapper.style.transform : '';
  const prevContainerTransform = container.style.transform;
  const prevContainerOrigin = container.style.transformOrigin;
  const prevTextTransform = text ? text.style.transform : '';
  const prevTextOrigin = text ? text.style.transformOrigin : '';

  if (wrapper) wrapper.style.transform = 'none';
  container.style.transform = 'none';
  if (text) {
    text.style.transform = 'none';
    text.style.transformOrigin = 'center center';
  }

  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const textRect = text ? text.getBoundingClientRect() : null;

  if (wrapper) wrapper.style.transform = prevWrapperTransform;
  container.style.transform = prevContainerTransform;
  container.style.transformOrigin = prevContainerOrigin;
  if (text) {
    text.style.transform = prevTextTransform;
    text.style.transformOrigin = prevTextOrigin;
  }

  if (containerRect.width === 0 || anchorRect.width === 0) return null;

  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const anchorCenterY = anchorRect.top + anchorRect.height / 2;

  const originXPercent = ((anchorCenterX - containerRect.left) / containerRect.width) * 100;
  const originYPercent = ((anchorCenterY - containerRect.top) / containerRect.height) * 100;

  const scaleX = vw / anchorRect.width;
  const scaleY = vh / anchorRect.height;
  const fitScale = Math.max(scaleX, scaleY);
  const pushThroughScale = fitScale * 2.8;

  const targetX = (vw / 2) - anchorCenterX;
  const targetY = (vh / 2) - anchorCenterY;

  // Shared virtual camera space derivation for About text
  let textScale = 3.0;
  let textX = targetX;
  let textY = targetY;

  if (textRect && textRect.width > 0) {
    const textCenterX = textRect.left + textRect.width / 2;
    const textCenterY = textRect.top + textRect.height / 2;

    textScale = fitScale;
    textX = (textScale - 1) * (textCenterX - anchorCenterX) + targetX;
    textY = (textScale - 1) * (textCenterY - anchorCenterY) + targetY - 100;
  }

  return {
    fitScale,
    pushThroughScale,
    x: targetX,
    y: targetY,
    originX: `${originXPercent}%`,
    originY: `${originYPercent}%`,
    textScale,
    textX,
    textY,
  };
}

/**
 * Modular GSAP ScrollTrigger hook — Cinematic Camera Dolly + Extended 3D Cosmic Space Flight.
 *
 * Drives the TV camera push into the TV screen, plunges into Deep Void,
 * materializes the 450+ star 3D Cosmic Galaxy early & continuously across 900vh scroll.
 */
export function useCameraDolly({
  sceneRef,
  textRef,
  imageContainerRef,
  imageRef,
  anchorRef,
  navRef,
  scrollHintRef,
  footerRef,
  footerContentRef,
  galaxyViewportRef,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled) return;

    const scene = sceneRef?.current;
    const text = textRef?.current;
    const imageContainer = imageContainerRef?.current;
    const image = imageRef?.current;
    const anchor = anchorRef?.current;
    const nav = navRef?.current;
    const scrollHint = scrollHintRef?.current;
    const footer = footerRef?.current;
    const footerContent = footerContentRef?.current;
    const galaxyViewport = galaxyViewportRef?.current;

    if (!scene || !text || !imageContainer || !anchor) return;

    let dollyTarget = null;
    let refreshTimer = null;

    const ctx = gsap.context(() => {

      /* ─── SETUP ─────────────────────────────────────────────── */
      const applyTarget = () => {
        dollyTarget = computeDollyTarget(imageContainer, anchor, text);
        if (dollyTarget) {
          gsap.set(imageContainer, {
            transformOrigin: `${dollyTarget.originX} ${dollyTarget.originY}`,
            transformStyle: 'preserve-3d',
            force3D: true,
          });
        }
      };

      gsap.set(scene, { perspective: 1200, transformStyle: 'preserve-3d' });
      gsap.set(text, { transformOrigin: 'center center', transformStyle: 'preserve-3d', force3D: true });
      if (scrollHint) gsap.set(scrollHint, { transformOrigin: 'left bottom', force3D: true });

      applyTarget();

      refreshTimer = setTimeout(() => {
        applyTarget();
        ScrollTrigger.refresh();
      }, 1600);

      /* ─── MASTER TIMELINE — EXTENDED SCROLL DISTANCE (1400vh) ───── */
      let checkCrtActivation = null;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: '+=1400vh',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (checkCrtActivation) checkCrtActivation(self.progress);
          },
          onRefreshInit: () => {
            if (imageContainer.parentElement) {
              gsap.set(imageContainer.parentElement, { clearProps: 'transform' });
            }
            gsap.set(imageContainer, { clearProps: 'transform' });
            gsap.set(text, { clearProps: 'transform' });
            if (scrollHint) gsap.set(scrollHint, { clearProps: 'transform' });
            applyTarget();
          },
        },
      });

      /* ─── ABOUT TEXT ─────────────────────────────────────────── */
      tl.fromTo(
        text,
        {
          scale: 1,
          x: 0,
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
        },
        {
          scale: () => dollyTarget ? dollyTarget.textScale : 3.0,
          x: () => dollyTarget ? dollyTarget.textX : -300,
          y: () => dollyTarget ? dollyTarget.textY : -100,
          opacity: 0,
          filter: 'blur(20px)',
          ease: 'power2.inOut',
          duration: 0.28,
        },
        0
      );

      /* ─── NAVIGATION BAR & LOGO ─────────────────────────────── */
      if (nav) {
        gsap.set(nav, { force3D: true });

        const navLogo = nav.querySelector('.logo');
        const navLinks = nav.querySelector('.nav-links');

        tl.to(nav, {
          opacity: 0,
          filter: 'blur(12px)',
          ease: 'power2.inOut',
          duration: 0.20,
        }, 0);

        if (navLogo) {
          gsap.set(navLogo, { force3D: true });
          tl.fromTo(
            navLogo,
            { x: 0, y: 0, scale: 1 },
            { x: -900, y: -400, scale: 1.8, ease: 'power2.inOut', duration: 0.18 },
            0
          );

          tl.to(
            navLogo,
            { x: -900, y: -900, scale: 0.6, ease: 'power1.in', duration: 0.10 },
            0.28
          );
        }

        if (navLinks) {
          gsap.set(navLinks, { force3D: true });
          tl.fromTo(
            navLinks,
            { x: 0, y: 0, scale: 1 },
            { x: 200, y: -1200, scale: 5.5, ease: 'power2.inOut', duration: 0.20 },
            0
          );

          tl.to(
            navLinks,
            { x: -1600, y: -900, scale: 2.5, ease: 'power1.in', duration: 0.10 },
            0.28
          );
        }
      }

      /* ─── GLOBAL FOOTER ──────────────────────────────────────── */
      if (footer) {
        gsap.set(footer, { transformOrigin: 'center bottom', force3D: true, background: 'none' });

        const footerLeft = footer.querySelector('.footer-left');
        const footerCenter = footer.querySelector('.footer-center');
        const footerRight = footer.querySelector('.footer-right');

        tl.fromTo(
          footer,
          { scale: 1, y: 0, opacity: 0.4 },
          { scale: 20.5, y: 700, opacity: 0.9, ease: 'power2.inOut', duration: 0.28 },
          0
        );

        if (footerContent) {
          gsap.set(footerContent, { force3D: true });
          tl.fromTo(
            footerContent,
            { x: 0 },
            { x: -800, ease: 'power2.inOut', duration: 0.24 },
            0
          );
          tl.to(
            footerContent,
            { x: -800, ease: 'power1.in', duration: 0.10 },
            0.28
          );
        }

        if (footerLeft) {
          gsap.set(footerLeft, { force3D: true });
          tl.fromTo(
            footerLeft,
            { y: 0 },
            { y: 400, ease: 'power2.inOut', duration: 0.18 },
            0
          );
          tl.to(
            footerLeft,
            { y: 900, ease: 'power1.in', duration: 0.10 },
            0.28
          );
        }

        if (footerCenter) {
          gsap.set(footerCenter, { force3D: true });
          tl.fromTo(
            footerCenter,
            { x: 0, y: 0 },
            { x: -700, y: 500, ease: 'power2.inOut', duration: 0.20 },
            0
          );
          tl.to(
            footerCenter,
            { x: -700, y: 900, ease: 'power1.in', duration: 0.10 },
            0.28
          );
        }

        if (footerRight) {
          gsap.set(footerRight, { force3D: true });
          tl.fromTo(
            footerRight,
            { x: 0, y: 0 },
            { x: 700, y: 1000, ease: 'power2.inOut', duration: 0.20 },
            0
          );
          tl.to(
            footerRight,
            { x: 1600, y: 900, ease: 'power1.in', duration: 0.10 },
            0.28
          );
        }

        tl.to(
          footer,
          { scale: 6.0, y: 1800, opacity: 0, ease: 'power1.in', duration: 0.10 },
          0.28
        );
      }

      /* ─── TV IMAGE — PHASE 1: align 4 sides with desktop ────── */
      tl.fromTo(
        imageContainer,
        {
          scale: 1,
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          opacity: 1,
          transformOrigin: () => dollyTarget ? `${dollyTarget.originX} ${dollyTarget.originY}` : '50% 50%',
        },
        {
          scale: () => dollyTarget ? dollyTarget.fitScale : 1,
          x: () => dollyTarget ? dollyTarget.x : 0,
          y: () => dollyTarget ? dollyTarget.y : 0,
          rotateX: 0,
          rotateY: 0,
          opacity: 1,
          transformOrigin: () => dollyTarget ? `${dollyTarget.originX} ${dollyTarget.originY}` : '50% 50%',
          ease: 'power2.inOut',
          duration: 0.28,
        },
        0
      );

      /* ─── TV IMAGE — PHASE 2: push through into TV screen ────── */
      tl.to(imageContainer, {
        scale: () => dollyTarget ? dollyTarget.pushThroughScale : 2.8,
        opacity: 1,
        ease: 'power1.in',
        duration: 0.08,
      }, 0.28);

      /* ─── TV IMAGE — PHASE 3: handoff fade to Deep Void ───────── */
      tl.to(imageContainer, {
        opacity: 0,
        ease: 'power1.out',
        duration: 0.03,
      }, 0.36);

      /* ─── HERO IMAGE SHADOW ──────────────────────────────────── */
      if (image) {
        tl.to(image, {
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))',
          ease: 'sine.inOut',
          duration: 0.28,
        }, 0);
      }

      /* ─── CRT ACTIVATION / POWER-ON SEQUENCE ────────────────── */
      const crtActivation = imageContainer.querySelector('.crt-activation');
      const crtFlash = imageContainer.querySelector('.crt-flash');
      const crtHLine = imageContainer.querySelector('.crt-h-line');
      const crtRaster = imageContainer.querySelector('.crt-raster-container');

      let hasCrtActivated = false;
      const crtPowerOnTl = gsap.timeline({ paused: true });

      if (crtActivation && crtFlash && crtHLine && crtRaster) {
        gsap.set(crtActivation, { opacity: 0 });
        gsap.set(crtFlash, { opacity: 0 });
        gsap.set(crtHLine, { opacity: 0, scaleX: 0 });
        gsap.set(crtRaster, { scaleY: 0, opacity: 0 });

        crtPowerOnTl
          .to(crtActivation, { opacity: 1, duration: 0.01 })
          .to(crtFlash, { opacity: 0.95, ease: 'power2.in', duration: 0.12 })
          .to(crtFlash, { opacity: 0.25, ease: 'power2.out', duration: 0.18 })
          .fromTo(
            crtHLine,
            { opacity: 0, scaleX: 0 },
            { opacity: 1, scaleX: 1, ease: 'power3.out', duration: 0.18 },
            0.12
          )
          .fromTo(
            crtRaster,
            { scaleY: 0.005, opacity: 0 },
            { scaleY: 0.005, opacity: 1, duration: 0.01 },
            0.30
          )
          .to(crtRaster, { scaleY: 1.0, ease: 'power2.inOut', duration: 0.30 }, 0.31)
          .to(crtHLine, { opacity: 0, duration: 0.12 }, 0.35)
          .to(crtFlash, { opacity: 0, duration: 0.15 }, 0.31);



        checkCrtActivation = (progress) => {
          // Strictly contain CRT glitch activation between progress 0.08 and 0.28
          // (while TV is aligning and fitting to screen before 3D push-through)
          if (progress >= 0.08 && progress <= 0.28) {
            if (!hasCrtActivated) {
              hasCrtActivated = true;
              crtPowerOnTl.play(0);
            }
            gsap.set(crtActivation, { opacity: 1 });
          } else if (progress > 0.28) {
            // When TV scales up to push through or when scrolling back up from 3D space:
            // FORCE-HIDE crtActivation so it can NEVER bleed full-screen!
            gsap.set(crtActivation, { opacity: 0 });
          } else if (progress < 0.04) {
            if (hasCrtActivated) {
              hasCrtActivated = false;
              crtPowerOnTl.pause(0);
              gsap.set(crtActivation, { opacity: 0 });
              gsap.set(crtFlash, { opacity: 0 });
              gsap.set(crtHLine, { opacity: 0, scaleX: 0 });
              gsap.set(crtRaster, { scaleY: 0, opacity: 0 });
              const testSignalReset = imageContainer.querySelector('.crt-test-signal');
              const slicesWrapReset = imageContainer.querySelector('.crt-test-slices-wrapper');
              const slicesReset = imageContainer.querySelectorAll('.crt-test-slice');
              const chromaReset = imageContainer.querySelectorAll('.crt-test-chroma');
              const vHoldReset = imageContainer.querySelector('.crt-test-vhold-bar');
              const smearReset = imageContainer.querySelector('.crt-test-phosphor-smear');
              const interfReset = imageContainer.querySelector('.crt-test-glitch-interference');
              const beamReset = imageContainer.querySelector('.crt-test-collapse-beam');
              const osdReset = imageContainer.querySelector('.crt-test-osd');

              if (testSignalReset) gsap.set(testSignalReset, { opacity: 1, filter: 'contrast(1.08) saturate(1.15)' });
              if (slicesWrapReset) gsap.set(slicesWrapReset, { opacity: 1, scaleX: 1, scaleY: 1, filter: 'none' });
              if (slicesReset.length) gsap.set(slicesReset, { x: 0, skewX: 0, scaleX: 1 });
              if (chromaReset.length) gsap.set(chromaReset, { opacity: 0, x: 0 });
              if (vHoldReset) gsap.set(vHoldReset, { opacity: 0, y: '-30%' });
              if (smearReset) gsap.set(smearReset, { opacity: 0 });
              if (interfReset) gsap.set(interfReset, { opacity: 0 });
              if (beamReset) gsap.set(beamReset, { opacity: 0, scaleX: 0 });
              if (osdReset) gsap.set(osdReset, { opacity: 0.92, skewX: 0, filter: 'none' });
            }
          }
        };
      }

      /* ─── CRT GLASS GLARE ────────────────────────────────────── */
      const glareEl = imageContainer.querySelector('.crt-glass__glare');
      const reflectionEl = imageContainer.querySelector('.crt-glass__reflection');

      if (glareEl) {
        tl.fromTo(
          glareEl,
          { x: 0, y: 0, opacity: 1 },
          { x: '16%', y: '-4.5%', opacity: 1, ease: 'power2.inOut', duration: 0.28 },
          0
        );
        tl.to(glareEl, { opacity: 0, ease: 'power1.in', duration: 0.08 }, 0.30);
      }

      if (reflectionEl) {
        tl.fromTo(
          reflectionEl,
          { x: 0, y: 0, opacity: 1 },
          { x: '12%', y: '-4%', opacity: 1, ease: 'power2.inOut', duration: 0.28 },
          0
        );
        tl.to(reflectionEl, { opacity: 0, ease: 'power1.in', duration: 0.08 }, 0.30);
      }

      /* ─── ADVANCED CRT TEST SIGNAL DISTORTION & BREAKDOWN ENGINE ─── */
      const testSignal = imageContainer.querySelector('.crt-test-signal');
      const slicesWrapper = imageContainer.querySelector('.crt-test-slices-wrapper');
      const slice1 = imageContainer.querySelector('.crt-test-slice--1');
      const slice2 = imageContainer.querySelector('.crt-test-slice--2');
      const slice3 = imageContainer.querySelector('.crt-test-slice--3');
      const slice4 = imageContainer.querySelector('.crt-test-slice--4');
      const slice5 = imageContainer.querySelector('.crt-test-slice--5');
      const slice6 = imageContainer.querySelector('.crt-test-slice--6');
      const slice7 = imageContainer.querySelector('.crt-test-slice--7');
      const chromaRed = imageContainer.querySelector('.crt-test-chroma--red');
      const chromaCyan = imageContainer.querySelector('.crt-test-chroma--cyan');
      const vHoldBar = imageContainer.querySelector('.crt-test-vhold-bar');
      const phosphorSmear = imageContainer.querySelector('.crt-test-phosphor-smear');
      const glitchInterf = imageContainer.querySelector('.crt-test-glitch-interference');
      const collapseBeam = imageContainer.querySelector('.crt-test-collapse-beam');
      const osdEl = imageContainer.querySelector('.crt-test-osd');

      // State 1 & 2: 0.115 → 0.145 (Signal acquired → electromagnetic disturbance)
      if (vHoldBar) {
        tl.fromTo(
          vHoldBar,
          { y: '-30%', opacity: 0 },
          { y: '160%', opacity: 0.85, ease: 'power1.in', duration: 0.025 },
          0.115
        );
        tl.to(
          vHoldBar,
          { y: '260%', opacity: 1, ease: 'power2.inOut', duration: 0.02 },
          0.142
        );
      }

      if (osdEl) {
        tl.fromTo(osdEl, { opacity: 0.92, skewX: 0 }, { opacity: 1, skewX: -10, filter: 'hue-rotate(90deg)', duration: 0.015 }, 0.200);
        tl.to(osdEl, { opacity: 0.4, skewX: 15, filter: 'hue-rotate(180deg) brightness(2)', duration: 0.015 }, 0.218);
        tl.to(osdEl, { opacity: 0, duration: 0.01 }, 0.235);
      }

      // Chromatic Aberration RGB Misconvergence Ghost Channels
      if (chromaRed && chromaCyan) {
        tl.fromTo(chromaRed, { opacity: 0, x: 0, skewX: 0 }, { opacity: 0.85, x: -18, skewX: 6, duration: 0.02 }, 0.118);
        tl.to(chromaRed, { opacity: 1, x: -44, skewX: -12, scaleY: 1.15, filter: 'saturate(5) hue-rotate(-40deg) brightness(1.6)', duration: 0.018 }, 0.138);
        tl.to(chromaRed, { opacity: 0, x: 0, duration: 0.015 }, 0.158);

        tl.fromTo(chromaCyan, { opacity: 0, x: 0, skewX: 0 }, { opacity: 0.85, x: 20, skewX: -6, duration: 0.02 }, 0.118);
        tl.to(chromaCyan, { opacity: 1, x: 48, skewX: 14, scaleY: 0.90, filter: 'saturate(5) hue-rotate(180deg) brightness(1.6)', duration: 0.018 }, 0.138);
        tl.to(chromaCyan, { opacity: 0, x: 0, duration: 0.015 }, 0.158);
      }

      // Phosphor Smear & Glitch Interference
      if (phosphorSmear) {
        tl.fromTo(phosphorSmear, { opacity: 0, scaleX: 0.8, x: -30 }, { opacity: 0.9, scaleX: 1.5, x: 40, duration: 0.02 }, 0.132);
        tl.to(phosphorSmear, { opacity: 0, duration: 0.015 }, 0.155);
      }

      if (glitchInterf) {
        tl.fromTo(glitchInterf, { opacity: 0 }, { opacity: 0.85, duration: 0.01 }, 0.125);
        tl.to(glitchInterf, { opacity: 1, duration: 0.015 }, 0.138);
        tl.to(glitchInterf, { opacity: 0, duration: 0.01 }, 0.155);
      }

      // State 3: Multi-Band Slice Tearing & Raster Shredding (0.128 → 0.156)
      if (slice1) {
        tl.fromTo(slice1, { x: 0, skewX: 0, scaleX: 1 }, { x: 38, skewX: -14, scaleX: 1.12, duration: 0.014 }, 0.128);
        tl.to(slice1, { x: -42, skewX: 12, scaleX: 0.92, duration: 0.012 }, 0.142);
        tl.to(slice1, { x: 0, skewX: 0, scaleX: 1, duration: 0.01 }, 0.154);
      }
      if (slice2) {
        tl.fromTo(slice2, { x: 0, skewX: 0, scaleX: 1 }, { x: -62, skewX: 18, scaleX: 0.88, duration: 0.013 }, 0.129);
        tl.to(slice2, { x: 55, skewX: -16, scaleX: 1.18, duration: 0.013 }, 0.141);
        tl.to(slice2, { x: 0, skewX: 0, scaleX: 1, duration: 0.01 }, 0.154);
      }
      if (slice3) {
        tl.fromTo(slice3, { x: 0, skewX: 0, scaleX: 1 }, { x: 78, skewX: -22, scaleX: 1.25, duration: 0.015 }, 0.130);
        tl.to(slice3, { x: -60, skewX: 20, scaleX: 0.86, duration: 0.012 }, 0.143);
        tl.to(slice3, { x: 0, skewX: 0, scaleX: 1, duration: 0.01 }, 0.154);
      }
      if (slice4) {
        tl.fromTo(slice4, { x: 0, skewX: 0, scaleX: 1 }, { x: -46, skewX: 15, scaleX: 1.06, duration: 0.012 }, 0.128);
        tl.to(slice4, { x: 68, skewX: -18, scaleX: 1.20, duration: 0.014 }, 0.140);
        tl.to(slice4, { x: 0, skewX: 0, scaleX: 1, duration: 0.01 }, 0.154);
      }
      if (slice5) {
        tl.fromTo(slice5, { x: 0, skewX: 0, scaleX: 1 }, { x: 54, skewX: -12, scaleX: 0.92, duration: 0.014 }, 0.131);
        tl.to(slice5, { x: -48, skewX: 14, scaleX: 1.12, duration: 0.012 }, 0.143);
        tl.to(slice5, { x: 0, skewX: 0, scaleX: 1, duration: 0.01 }, 0.154);
      }
      if (slice6) {
        tl.fromTo(slice6, { x: 0, skewX: 0, scaleX: 1 }, { x: -36, skewX: 14, scaleX: 1.10, duration: 0.013 }, 0.130);
        tl.to(slice6, { x: 44, skewX: -10, scaleX: 0.95, duration: 0.013 }, 0.142);
        tl.to(slice6, { x: 0, skewX: 0, scaleX: 1, duration: 0.01 }, 0.154);
      }
      if (slice7) {
        tl.fromTo(slice7, { x: 0, skewX: 0, scaleX: 1 }, { x: 30, skewX: -8, scaleX: 0.94, duration: 0.012 }, 0.129);
        tl.to(slice7, { x: -28, skewX: 10, scaleX: 1.08, duration: 0.013 }, 0.142);
        tl.to(slice7, { x: 0, skewX: 0, scaleX: 1, duration: 0.01 }, 0.154);
      }

      // State 4: Cathode Ray Implosion & Laser Beam Collapse (0.154 → 0.172)
      if (slicesWrapper) {
        tl.fromTo(
          slicesWrapper,
          { scaleY: 1, scaleX: 1, opacity: 1 },
          { scaleY: 0.018, scaleX: 1.4, filter: 'brightness(3.5) contrast(2.5)', ease: 'power3.in', duration: 0.012 },
          0.154
        );
        tl.to(
          slicesWrapper,
          { opacity: 0, duration: 0.006 },
          0.166
        );
      }

      if (collapseBeam) {
        tl.fromTo(
          collapseBeam,
          { scaleX: 0, scaleY: 1, opacity: 0 },
          { scaleX: 1.2, scaleY: 1, opacity: 1, ease: 'power2.out', duration: 0.008 },
          0.158
        );
        tl.to(
          collapseBeam,
          { scaleX: 2.2, scaleY: 6, opacity: 0, ease: 'power2.in', duration: 0.012 },
          0.166
        );
      }

      if (testSignal) {
        tl.fromTo(
          testSignal,
          { opacity: 1.0, filter: 'contrast(1.08) saturate(1.15)' },
          { filter: 'contrast(2.4) saturate(2.8) brightness(1.4)', duration: 0.025 },
          0.125
        );
        tl.to(
          testSignal,
          { opacity: 0, duration: 0.01 },
          0.168
        );
      }



      if (crtActivation) {
        tl.to(crtActivation, { opacity: 0, ease: 'power1.inOut', duration: 0.06 }, 0.35);
      }

      /* ─── 3D COSMIC GALAXY FLIGHT — PURE PERSPECTIVE PHYSICS ──────────
         Stars are distributed Z=-6000 to Z=-400 in the DOM.
         We drive the SINGLE .galaxy-stars-volume container forward +6500px.
         Each star's effective Z = initialZ + containerDeltaZ.
         Far stars (Z=-6000) travel from invisible pinpoints → blazing near stars.
         Near stars (Z=-400) zoom past the camera early → stream off screen edges.
         No per-group opacity needed — CSS perspective handles all emergence.
         ─────────────────────────────────────────────────────────────────── */
      if (galaxyViewport) {
        const galaxyNebula = galaxyViewport.querySelector('.galaxy-nebula-3d');
        const starsVolume = galaxyViewport.querySelector('.galaxy-stars-volume');
        const vortexVolume = galaxyViewport.querySelector('.galaxy-vortex-volume');

        /* ── Initial state ──────────────────────────────────────────── */
        gsap.set(galaxyViewport, { opacity: 0 });
        if (starsVolume) gsap.set(starsVolume, { z: 0 });
        if (galaxyNebula) gsap.set(galaxyNebula, { opacity: 0 });
        if (vortexVolume) gsap.set(vortexVolume, { opacity: 0 });

        /* ── 1. Viewport appears as deep void the moment camera enters TV ── */
        tl.to(galaxyViewport, {
          opacity: 1,
          ease: 'none',
          duration: 0.02,
        }, 0.35);

        /* ── 2. Subtle nebula glow fades in (0.36 → 0.60) ──────────── */
        if (galaxyNebula) {
          tl.to(galaxyNebula, {
            opacity: 0.80,
            ease: 'sine.inOut',
            duration: 0.24,
          }, 0.36);
        }

        /* ── 3. Star volume flies forward in Z (space-flight feel) ─── */
        if (starsVolume) {
          tl.fromTo(starsVolume,
            { z: 0 },
            { z: 6500, ease: 'none', duration: 0.65 },
            0.35
          );
        }

        /* ── 4. Radial Burst Gallery ────────────────────────────────
           Reveal the vortex container, then let setupVortexBurstTimeline
           register each card's independent radial-burst tween directly
           onto the master scrub timeline.
           Cards spawn organically 1–3 at a time from scroll 0.38 → 0.97.
           Forward and backward scroll is fully reversible (scrub: 0.6).
           ───────────────────────────────────────────────────────────── */
        if (vortexVolume) {
          // Make the container visible so cards inside can animate
          tl.fromTo(vortexVolume,
            { opacity: 0 },
            { opacity: 1, ease: 'power1.inOut', duration: 0.04 },
            0.37
          );

          // Register all per-card radial burst tweens onto the master timeline
          setupVortexBurstTimeline(tl, vortexVolume);

          // Master failsafe: ensure vortex container fades out completely to 0 opacity
          tl.to(vortexVolume, {
            opacity: 0,
            ease: 'power2.inOut',
            duration: 0.05,
          }, 0.89);
        }
      }

    }, scene);

    return () => {
      if (text) gsap.set(text, { clearProps: 'transform,opacity,filter' });
      if (nav) gsap.set(nav, { clearProps: 'transform,opacity,filter' });
      const navLogo = nav?.querySelector('.logo');
      if (navLogo) gsap.set(navLogo, { clearProps: 'transform' });
      const navLinks = nav?.querySelector('.nav-links');
      if (navLinks) gsap.set(navLinks, { clearProps: 'transform' });
      if (scrollHint) gsap.set(scrollHint, { clearProps: 'transform,opacity,filter' });
      if (footer) gsap.set(footer, { clearProps: 'transform,opacity,filter,background' });
      if (footerContent) gsap.set(footerContent, { clearProps: 'transform' });
      const footerLeft = footer?.querySelector('.footer-left');
      if (footerLeft) gsap.set(footerLeft, { clearProps: 'transform' });
      const footerCenter = footer?.querySelector('.footer-center');
      if (footerCenter) gsap.set(footerCenter, { clearProps: 'transform' });
      const footerRight = footer?.querySelector('.footer-right');
      if (footerRight) gsap.set(footerRight, { clearProps: 'transform' });
      if (galaxyViewport) gsap.set(galaxyViewport, { clearProps: 'transform,opacity' });
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [sceneRef, textRef, imageContainerRef, imageRef, anchorRef, navRef, scrollHintRef, footerRef, footerContentRef, galaxyViewportRef, enabled]);
}
