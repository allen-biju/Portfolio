import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Calculates the exact scale (both viewport-fit scale and push-through scale),
 * transformOrigin, and translation (x, y) needed to align the 4 sides of the tvAnchor
 * with the desktop screen, and then push further in until the TV frame moves out of view.
 */
function computeDollyTarget(container, anchor) {
  if (!container || !anchor) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const wrapper = container.parentElement;

  // Temporarily clear inline transforms on both container AND parent intro wrapper
  // to measure the true, unscaled layout bounding rects in the viewport.
  const prevWrapperTransform = wrapper ? wrapper.style.transform : '';
  const prevContainerTransform = container.style.transform;
  const prevContainerOrigin = container.style.transformOrigin;

  if (wrapper) wrapper.style.transform = 'none';
  container.style.transform = 'none';

  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  // Restore inline transforms
  if (wrapper) wrapper.style.transform = prevWrapperTransform;
  container.style.transform = prevContainerTransform;
  container.style.transformOrigin = prevContainerOrigin;

  if (containerRect.width === 0 || anchorRect.width === 0) return null;

  // True unscaled center of tv-anchor in viewport coordinates
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const anchorCenterY = anchorRect.top + anchorRect.height / 2;

  // Transform-origin percentages relative to container
  const originXPercent = ((anchorCenterX - containerRect.left) / containerRect.width) * 100;
  const originYPercent = ((anchorCenterY - containerRect.top) / containerRect.height) * 100;

  // Phase 1 Scale: exact scale so all 4 sides of tv-anchor align symmetrically with the 4 sides of the desktop screen
  const scaleX = vw / anchorRect.width;
  const scaleY = vh / anchorRect.height;
  const fitScale = Math.max(scaleX, scaleY);

  // Phase 2 Scale: further scale pushing deep into the TV screen so the TV bezel/frame moves out of the viewport
  const pushThroughScale = fitScale * 2.8;

  // Exact translation needed so anchor center lands at desktop screen center (vw/2, vh/2)
  const targetX = (vw / 2) - anchorCenterX;
  const targetY = (vh / 2) - anchorCenterY;

  return {
    fitScale,
    pushThroughScale,
    x: targetX,
    y: targetY,
    originX: `${originXPercent}%`,
    originY: `${originYPercent}%`,
  };
}

/**
 * Modular GSAP ScrollTrigger hook — Phase 1: Cinematic Camera Dolly.
 * Preserves the exact 4-side viewport alignment when reaching full size,
 * then allows further scrolling deep into the TV screen so the frame exits the viewport.
 */
export function useCameraDolly({
  sceneRef,
  textRef,
  imageContainerRef,
  imageRef,
  anchorRef,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled) return;

    const scene = sceneRef?.current;
    const text = textRef?.current;
    const imageContainer = imageContainerRef?.current;
    const image = imageRef?.current;
    const anchor = anchorRef?.current;

    if (!scene || !text || !imageContainer || !anchor) return;

    let dollyTarget = null;
    let refreshTimer = null;

    const ctx = gsap.context(() => {
      const applyTarget = () => {
        dollyTarget = computeDollyTarget(imageContainer, anchor);
        if (dollyTarget) {
          gsap.set(imageContainer, {
            transformOrigin: `${dollyTarget.originX} ${dollyTarget.originY}`,
            transformStyle: 'preserve-3d',
            force3D: true,
          });
        }
      };

      gsap.set(scene, { perspective: 1200, transformStyle: 'preserve-3d' });
      gsap.set(text, { transformOrigin: 'left center', transformStyle: 'preserve-3d', force3D: true });

      // Initial target computation
      applyTarget();

      // Re-compute after intro animation & layout settle completely
      refreshTimer = setTimeout(() => {
        applyTarget();
        ScrollTrigger.refresh();
      }, 1600);

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
            applyTarget();
          },
        },
      });

      // Text animation: punch through
      tl.to(text, {
        scale: 1.48,
        z: 240,
        opacity: 0,
        filter: 'blur(18px)',
        y: -20,
        ease: 'power1.in',
        duration: 0.35,
      }, 0);

      // Phase 1 (0.0 -> 0.70): Dolly camera to center & align 4 sides of tvAnchor symmetrically with desktop viewport
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

      // Phase 2 (0.70 -> 0.95): Continue scrolling DEEPER into the TV screen so the TV bezel/frame exits past the viewport frame
      tl.to(
        imageContainer,
        {
          scale: () => dollyTarget ? dollyTarget.pushThroughScale : 2.8,
          opacity: 1,
          ease: 'power1.in',
          duration: 0.25,
        },
        0.70
      );

      // Final smooth handoff fade at the climax as TV frame completely exits viewport (0.95 -> 1.00)
      tl.to(
        imageContainer,
        {
          opacity: 0,
          ease: 'power1.out',
          duration: 0.05,
        },
        0.95
      );

      if (image) {
        tl.to(image, {
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))',
          ease: 'sine.inOut',
          duration: 0.70,
        }, 0);
      }
    }, scene);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [sceneRef, textRef, imageContainerRef, imageRef, anchorRef, enabled]);
}
