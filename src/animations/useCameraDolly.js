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
  const pushThroughScale = fitScale * 2.4;

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

      /* ─── CRT ACTIVATION / POWER-ON SEQUENCE (Automatic Real-Time Timeline) ─── */
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
      }

      let checkCrtActivation = null;
      if (crtActivation) {
        checkCrtActivation = (progress) => {
          // Automatic power-on: fires once in real-time when scroll reaches ~0.08
          if (progress >= 0.08 && progress <= 0.32) {
            if (!hasCrtActivated) {
              hasCrtActivated = true;
              crtPowerOnTl.play(0);
            }
          } else if (progress < 0.04) {
            // Scrolled back out: reset cleanly without any inline CSS filter injection
            if (hasCrtActivated) {
              hasCrtActivated = false;
              crtPowerOnTl.pause(0);
              crtActivation.style.opacity = '0';
              if (crtFlash) crtFlash.style.opacity = '0';
              if (crtHLine) {
                crtHLine.style.opacity = '0';
                crtHLine.style.transform = 'scaleX(0)';
              }
              if (crtRaster) {
                crtRaster.style.opacity = '0';
                crtRaster.style.transform = 'scaleY(0)';
              }
            }
          }
        };
      }

      /* ─── CSS ANIMATION PAUSE HELPER ──────────────────────────────
         The CRT test signal has several CSS keyframe animations running
         continuously (chroma shift, vhold slip, glitch flicker, etc.).
         When autoAlpha sets visibility:hidden the animations keep running
         in the background. On reverse scroll, restoring visibility forces
         the GPU to re-composite all animated layers at once → lag spike.
         Fix: add a class that sets animation-play-state:paused on every
         child whenever the signal is hidden, and remove it to resume.
      ──────────────────────────────────────────────────────────────── */
      const testSignalRef = imageContainer.querySelector('.crt-test-signal');
      let signalAnimsPaused = false;

      const pauseSignalAnims = () => {
        if (!signalAnimsPaused && testSignalRef) {
          testSignalRef.classList.add('crt-animations-paused');
          signalAnimsPaused = true;
        }
      };
      const resumeSignalAnims = () => {
        if (signalAnimsPaused && testSignalRef) {
          testSignalRef.classList.remove('crt-animations-paused');
          signalAnimsPaused = false;
        }
      };

      /* ─── MASTER TIMELINE — EXTENDED SCROLL DISTANCE (1400vh) ───── */
      let _lastProgress = 0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: '+=1400vh',
          pin: true,
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            _lastProgress = p;

            if (checkCrtActivation) checkCrtActivation(p);

            // Pause CRT CSS animations while signal is invisible (progress >= 0.22)
            // to save GPU compositor cycles on both forward and reverse scroll.
            if (p >= 0.22) {
              pauseSignalAnims();
            } else {
              resumeSignalAnims();
            }
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
          autoAlpha: 1,
        },
        {
          scale: () => dollyTarget ? dollyTarget.textScale : 3.0,
          x: () => dollyTarget ? dollyTarget.textX : -300,
          y: () => dollyTarget ? dollyTarget.textY : -100,
          autoAlpha: 0,
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
          autoAlpha: 1,
          transformOrigin: () => dollyTarget ? `${dollyTarget.originX} ${dollyTarget.originY}` : '50% 50%',
        },
        {
          scale: () => dollyTarget ? dollyTarget.fitScale : 1,
          x: () => dollyTarget ? dollyTarget.x : 0,
          y: () => dollyTarget ? dollyTarget.y : 0,
          rotateX: 0,
          rotateY: 0,
          autoAlpha: 1,
          transformOrigin: () => dollyTarget ? `${dollyTarget.originX} ${dollyTarget.originY}` : '50% 50%',
          ease: 'power2.inOut',
          duration: 0.28,
        },
        0
      );

      /* ─── TV IMAGE — PHASE 2: push through into TV screen ────── */
      tl.to(imageContainer, {
        scale: () => dollyTarget ? dollyTarget.pushThroughScale : 2.4,
        autoAlpha: 1,
        ease: 'power1.in',
        duration: 0.09,
      }, 0.28);

      /* ─── TV IMAGE — PHASE 3: handoff fade to Deep Void ───────── */
      tl.to(imageContainer, {
        autoAlpha: 0,
        ease: 'power1.out',
        duration: 0.03,
      }, 0.37);

      /* ─── HERO IMAGE SHADOW ──────────────────────────────────────── */
      // NOTE: Removed dynamic drop-shadow filter tween.
      // Animating filter on a 2440x3160px image scaled up to 22x triggers
      // a full CPU Gaussian blur recalculation every scroll frame.
      // Shadow is applied statically via CSS class instead.

      /* ─── CRT TEST SIGNAL: BLANK SCREEN BEFORE PUSH-THROUGH ─── */
      const testSignal = imageContainer.querySelector('.crt-test-signal');
      if (testSignal) {
        // Color palette & distortion smoothly fade to blank before transition into TV
        // autoAlpha sets visibility: hidden to completely suspend GPU rendering of the palette
        tl.fromTo(
          testSignal,
          { autoAlpha: 1 },
          { autoAlpha: 0, ease: 'power2.inOut', duration: 0.05 },
          0.20
        );
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

      /* ─── CRT ACTIVATION — BLANK OUT BEFORE PUSH-THROUGH (0.24 -> 0.27) ─── */
      // Fades out and hides CRT before 0.28 so zero CRT internal layers are composited
      // during the 17x push-through scaling into tvScreenAnchor.
      if (crtActivation) {
        tl.to(crtActivation, { autoAlpha: 0, ease: 'power1.inOut', duration: 0.03 }, 0.25);
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
        const vortexVolume = galaxyViewport.querySelector('.galaxy-vortex-volume');

        /* ── Initial state: completely hidden from layout & compositor ── */
        gsap.set(galaxyViewport, { autoAlpha: 0 });
        if (vortexVolume) gsap.set(vortexVolume, { autoAlpha: 0 });

        /* ── 1. Viewport appears as deep void the moment camera enters TV ── */
        tl.fromTo(galaxyViewport,
          { autoAlpha: 0 },
          { autoAlpha: 1, ease: 'none', duration: 0.02 },
          0.36
        );

        /* ── 2. Radial Burst Gallery ────────────────────────────────
           Reveal the vortex container, then let setupVortexBurstTimeline
           register each card's independent radial-burst tween directly
           onto the master scrub timeline.
           Cards spawn organically 1–3 at a time from scroll 0.38 → 0.97.
           Forward and backward scroll is fully reversible (scrub: 0.6).
           ───────────────────────────────────────────────────────────── */
        if (vortexVolume) {
          // Make the container visible so cards inside can animate
          tl.fromTo(vortexVolume,
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: 'power1.inOut', duration: 0.04 },
            0.37
          );

          // Register all per-card radial burst tweens onto the master timeline
          setupVortexBurstTimeline(tl, vortexVolume);

          // Master failsafe: ensure vortex container fades out completely to 0 autoAlpha
          tl.to(vortexVolume, {
            autoAlpha: 0,
            ease: 'power2.inOut',
            duration: 0.05,
          }, 0.89);
        }
      }

    }, scene);

    return () => {
      // Resume CSS animations before reverting
      const signalEl = imageContainer?.querySelector('.crt-test-signal');
      if (signalEl) signalEl.classList.remove('crt-animations-paused');

      if (text) gsap.set(text, { clearProps: 'transform,opacity,visibility,filter' });
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
      if (galaxyViewport) gsap.set(galaxyViewport, { clearProps: 'transform,opacity,visibility' });
      if (imageContainer) gsap.set(imageContainer, { clearProps: 'transform,opacity,visibility' });
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [sceneRef, textRef, imageContainerRef, imageRef, anchorRef, navRef, scrollHintRef, footerRef, footerContentRef, galaxyViewportRef, enabled]);
}
