import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

  // Shared virtual camera space derivation for About text:
  // Scale increase derived in 1:1 sync with camera fitScale depth
  let textScale = 3.0;
  let textX = targetX;
  let textY = targetY;

  if (textRect && textRect.width > 0) {
    const textCenterX = textRect.left + textRect.width / 2;
    const textCenterY = textRect.top + textRect.height / 2;

    textScale = fitScale;

    // Derived translation formula for shared camera space (with upward translation offset):
    // P_screen = Anchor + textScale * (P_initial - Anchor) + (ViewportCenter - Anchor)
    // textX/Y = P_screen - P_initial = (textScale - 1) * (P_initial - Anchor) + targetX/Y
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
 * Modular GSAP ScrollTrigger hook — Phase 1: Cinematic Camera Dolly.
 *
 * Drives the TV camera push while making surrounding UI elements (nav, logo, footer, about text)
 * scale and move out of frame synchronously with the advancing virtual camera.
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

      /* ─── MASTER TIMELINE ────────────────────────────────────── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: '+=280vh',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
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
      // Derives scale and leftward translation from shared camera dolly space
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
          duration: 0.70,
        },
        0
      );

      /* ─── NAVIGATION BAR & LOGO ─────────────────────────────── */
      // Per-element fly-out mirroring footer element directions (up instead of down, left/right swapped)
      if (nav) {
        gsap.set(nav, { force3D: true });

        const navLogo = nav.querySelector('.logo');
        const navLinks = nav.querySelector('.nav-links');

        // Container: fade + blur out (no y — children handle vertical)
        tl.to(nav, {
          opacity: 0,
          filter: 'blur(12px)',
          ease: 'power2.inOut',
          duration: 0.50,
        }, 0);

        // Phase 1 (0 to 0.70): Logo upward + leftward + slight scale — mirrors footer-left downward
        if (navLogo) {
          gsap.set(navLogo, { force3D: true });
          tl.fromTo(
            navLogo,
            { x: 0, y: 0, scale: 1 },
            { x: -900, y: -400, scale: 1.8, ease: 'power2.inOut', duration: 0.40 },
            0
          );

          // Phase 2 (0.70 to 0.95): Fly-off left + upward + scale down
          tl.to(
            navLogo,
            { x: -900, y: -900, scale: 0.6, ease: 'power1.in', duration: 0.25 },
            0.70
          );
        }

        // Phase 1 (0 to 0.70): Nav-links left + upward + scale — mirrors footer-right right + downward
        if (navLinks) {
          gsap.set(navLinks, { force3D: true });
          tl.fromTo(
            navLinks,
            { x: 0, y: 0, scale: 1 },
            { x: 200, y: -1200, scale: 5.5, ease: 'power2.inOut', duration: 0.50 },
            0
          );

          // Phase 2 (0.70 to 0.95): Fly-off left + upward + scale
          tl.to(
            navLinks,
            { x: -1600, y: -900, scale: 2.5, ease: 'power1.in', duration: 0.25 },
            0.70
          );
        }
      }

      /* ─── GLOBAL FOOTER — FLY-BY EFFECT ──────────────────────── */
      // Synchronized 1:1 with TV image dolly (Phase 1: 0 -> 0.70 power2.inOut, Phase 2: 0.70 -> 0.95 power1.in)
      if (footer) {
        gsap.set(footer, { transformOrigin: 'center bottom', force3D: true, background: 'none' });

        const footerLeft = footer.querySelector('.footer-left');
        const footerCenter = footer.querySelector('.footer-center');
        const footerRight = footer.querySelector('.footer-right');

        // Phase 1 (0 to 0.70): Container scale + y + opacity in sync with TV image alignment
        tl.fromTo(
          footer,
          { scale: 1, y: 0, opacity: 0.4 },
          { scale: 20.5, y: 700, opacity: 0.9, ease: 'power2.inOut', duration: 0.7 },
          0
        );

        // Phase 1 (0 to 0.70): Left drift on .footer-content (container drift)
        if (footerContent) {
          gsap.set(footerContent, { force3D: true });
          tl.fromTo(
            footerContent,
            { x: 0 },
            { x: -800, ease: 'power2.inOut', duration: 0.60 },
            0
          );

          // Phase 2 (0.70 to 0.95): Fly-off left drift in sync with TV push-through
          tl.to(
            footerContent,
            { x: -800, ease: 'power1.in', duration: 0.25 },
            0.70
          );
        }

        // Phase 1 (0 to 0.70): Downward translation on .footer-left ('LOC_NODE: EARTH.JS & MUTE')
        if (footerLeft) {
          gsap.set(footerLeft, { force3D: true });
          tl.fromTo(
            footerLeft,
            { y: 0 },
            { y: 400, ease: 'power2.inOut', duration: 0.40 },
            0
          );

          // Phase 2 (0.70 to 0.95): Fly-off exit down in sync with TV push-through
          tl.to(
            footerLeft,
            { y: 900, ease: 'power1.in', duration: 0.25 },
            0.70
          );
        }

        // Phase 1 (0 to 0.70): Left drift & downward translation on .footer-center ('INSTAGRAM, FIVERR, GITHUB, LINKEDIN')
        if (footerCenter) {
          gsap.set(footerCenter, { force3D: true });
          tl.fromTo(
            footerCenter,
            { x: 0, y: 0 },
            { x: -700, y: 500, ease: 'power2.inOut', duration: 0.50 },
            0
          );

          // Phase 2 (0.70 to 0.95): Fly-off left drift & exit down in sync with TV push-through
          tl.to(
            footerCenter,
            { x: -700, y: 900, ease: 'power1.in', duration: 0.25 },
            0.70
          );
        }

        // Phase 1 (0 to 0.70): Right drift & downward translation on .footer-right ('LATENCY UPTIME')
        if (footerRight) {
          gsap.set(footerRight, { force3D: true });
          tl.fromTo(
            footerRight,
            { x: 0, y: 0 },
            { x: 700, y: 1000, ease: 'power2.inOut', duration: 0.50 },
            0
          );

          // Phase 2 (0.70 to 0.95): Fly-off right drift & exit down in sync with TV push-through
          tl.to(
            footerRight,
            { x: 1600, y: 900, ease: 'power1.in', duration: 0.25 },
            0.70
          );
        }

        // Phase 2 (0.70 to 0.95): Fly-off scale & exit in sync with TV push-through
        tl.to(
          footer,
          { scale: 6.0, y: 1800, opacity: 0, ease: 'power1.in', duration: 0.25 },
          0.70
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
          duration: 0.70,
        },
        0
      );

      /* ─── TV IMAGE — PHASE 2: push through into TV screen ────── */
      tl.to(imageContainer, {
        scale: () => dollyTarget ? dollyTarget.pushThroughScale : 2.8,
        opacity: 1,
        ease: 'power1.in',
        duration: 0.25,
      }, 0.70);

      /* ─── TV IMAGE — PHASE 3: final handoff fade ─────────────── */
      tl.to(imageContainer, {
        opacity: 0,
        ease: 'power1.out',
        duration: 0.05,
      }, 0.95);

      /* ─── HERO IMAGE SHADOW ──────────────────────────────────── */
      if (image) {
        tl.to(image, {
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))',
          ease: 'sine.inOut',
          duration: 0.70,
        }, 0);
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
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [sceneRef, textRef, imageContainerRef, imageRef, anchorRef, navRef, scrollHintRef, footerRef, footerContentRef, enabled]);
}
