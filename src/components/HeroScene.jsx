import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Noise, Bloom } from '@react-three/postprocessing';
import gsap from 'gsap';

export default function HeroScene({ activeScene }) {
  const { camera } = useThree();
  const COLOR_BG_PRIMARY = "#0D1B2A";

  useEffect(() => {
    const cameraZ = [15, 12, 14, 16];
    gsap.to(camera.position, {
      z: cameraZ[activeScene] || 15,
      duration: 3,
      ease: "power3.inOut"
    });
  }, [activeScene, camera]);

  return (
    <>
      <color attach="background" args={[COLOR_BG_PRIMARY]} />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1.2} mipmapBlur intensity={1.5} />
        <Noise opacity={0.015} />
      </EffectComposer>
    </>
  );
}
