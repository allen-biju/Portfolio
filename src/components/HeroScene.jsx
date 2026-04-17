import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Noise, Glitch, Bloom } from '@react-three/postprocessing';
import { Text, Sparkles } from '@react-three/drei';
import { playParticles, playShard, startWordWoosh } from '../hooks/useSounds';
import * as THREE from 'three';
import gsap from 'gsap';

const ConstellationDust = ({ activeScene }) => {
  const groupRef = useRef();
  const [activeZoneIndex, setActiveZoneIndex] = useState(-1);
  const activeZoneState = useRef(-1);
  const linesGeometryRef = useRef();
  const activeWoosh = useRef(null);
  const formationCompleted = useRef(false);

  const PARTICLE_COUNT = 80;
  const CONNECT_DISTANCE = 2.5;
  const BOUNDS = { x: 18, y: 12, z: 10 };

  // Exact trigger zones requested by user via marked areas
  const ZONES = useMemo(() => [
    { word: "DESIGN", basePos: new THREE.Vector3(-7.7, 3.3, 0) },
    { word: "INNOVATE", basePos: new THREE.Vector3(0.0, 3.9, 0) },
    { word: "ENGINEER", basePos: new THREE.Vector3(5.5, 3.9, 0) },
    { word: "CREATE", basePos: new THREE.Vector3(8.2, 0.6, 0) },
    { word: "WEBGL", basePos: new THREE.Vector3(5.5, -3.9, 0) },
    { word: "REACT", basePos: new THREE.Vector3(1.1, -4.2, 0) },
    { word: "DYNAMIC", basePos: new THREE.Vector3(-7.7, -3.6, 0) }
  ], []);

  const particles = useMemo(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      return {
        initialChar: chars[Math.floor(Math.random() * chars.length)],
        currentPos: new THREE.Vector3(),
        randomPhaseX: Math.random() * Math.PI * 2,
        randomPhaseY: Math.random() * Math.PI * 2,
        randomPhaseZ: Math.random() * Math.PI * 2,
        // Slower floating speed requested by user
        randomSpeedX: 0.03 + Math.random() * 0.04,
        randomSpeedY: 0.03 + Math.random() * 0.04,
        randomSpeedZ: 0.03 + Math.random() * 0.04,
        // Slower rotation
        rotSpeedX: (Math.random() - 0.5) * 0.2,
        rotSpeedY: (Math.random() - 0.5) * 0.2,
        rotSpeedZ: (Math.random() - 0.5) * 0.2,
        ref: React.createRef()
      };
    });
  }, []);

  const maxLinePoints = (PARTICLE_COUNT * (PARTICLE_COUNT - 1)) / 2 * 2;
  const linePositions = useMemo(() => new Float32Array(maxLinePoints * 3), [maxLinePoints]);

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.position, {
        z: activeScene === 0 ? -2 : -6,
        duration: 1.5,
        ease: "power2.inOut"
      });
      // Particles vanish on scroll away from Intro, re-summon on hover (Only in Scenes 0, 1, 2)
      const isHome = activeScene < 3;
      const isVisible = isHome && (activeScene === 0 || activeZoneIndex !== -1);

      gsap.to(groupRef.current.scale, {
        x: isVisible ? 1 : 0,
        y: isVisible ? 1 : 0,
        z: isVisible ? 1 : 0,
        duration: isVisible ? 0.8 : 1.2,
        ease: "power3.out"
      });
    }

    return () => {
      if (activeWoosh.current) {
        activeWoosh.current.stop();
        activeWoosh.current = null;
      }
    };
  }, [activeScene]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { mouse } = state;

    // 1. Frame-perfect Zone Detection via Projection
    let foundIndex = -1;
    // Word assembly only allowed in Home frames (0, 1, 2)
    if (activeScene < 3 && activeScene !== -1 && groupRef.current) {
      const tempVec = new THREE.Vector3();
      groupRef.current.updateMatrixWorld();

      for (let i = 0; i < ZONES.length; i++) {
        // Project world position to screen NDC
        tempVec.copy(ZONES[i].basePos).applyMatrix4(groupRef.current.matrixWorld).project(state.camera);

        const dx = mouse.x - tempVec.x;
        const dy = mouse.y - tempVec.y;

        // Precise distance in screen space (radius 0.38)
        if (Math.sqrt(dx * dx + dy * dy) < 0.38) {
          foundIndex = i;
          break;
        }
      }
    }

    if (activeZoneState.current !== foundIndex) {
      if (activeWoosh.current) {
        activeWoosh.current.stop();
        activeWoosh.current = null;
      }
      if (foundIndex !== -1) {
        activeWoosh.current = startWordWoosh();
        formationCompleted.current = false;
      }
      activeZoneState.current = foundIndex;
      setActiveZoneIndex(foundIndex);
    }

    let aggregateDistance = 0;
    let targetCount = 0;

    particles.forEach((p, i) => {
      const mesh = p.ref.current;
      if (!mesh) return;

      let isTarget = false;
      let targetPos = null;

      if (activeZoneState.current !== -1) {
        const zone = ZONES[activeZoneState.current];
        // Coupled animation trigger (matches sound radius)
        if (i < zone.word.length) {
          isTarget = true;
          const spacing = 0.8; // Increased spacing for bigger font
          const totalWidth = (zone.word.length - 1) * spacing;
          targetPos = new THREE.Vector3(
            zone.basePos.x + (i * spacing) - (totalWidth / 2),
            zone.basePos.y + Math.sin(t * 3 + i * 0.5) * 0.15, // Floating animation
            zone.basePos.z
          );
          aggregateDistance += mesh.position.distanceTo(targetPos);
          targetCount++;
        }
      }

      if (isTarget && targetPos) {
        // Smoother, highly eased-in assembly
        mesh.position.lerp(targetPos, 0.03);
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.05);
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.05);
        mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, 0.05);

        // Bigger font size and pulsating animation
        const pulseScale = 1.4 + Math.sin(t * 4 + i) * 0.1;
        mesh.scale.lerp(new THREE.Vector3(pulseScale, pulseScale, pulseScale), 0.05);
      } else {
        const floatX = Math.sin(t * p.randomSpeedX + p.randomPhaseX) * (BOUNDS.x / 2);
        const floatY = Math.cos(t * p.randomSpeedY + p.randomPhaseY) * (BOUNDS.y / 2);
        const floatZ = Math.sin(t * p.randomSpeedZ + p.randomPhaseZ) * (BOUNDS.z / 2);

        let targetX = floatX;
        let targetY = floatY;
        let targetZ = floatZ;

        // Push dormant particles further outward if a word is being assembled
        if (activeZoneState.current !== -1) {
          targetX *= 1.3;
          targetY *= 1.3;
          targetZ *= 1.3;
        }

        const targetFloat = new THREE.Vector3(targetX, targetY, targetZ);
        // Smoother, slower drifting
        mesh.position.lerp(targetFloat, 0.015);

        mesh.rotation.x += p.rotSpeedX * delta;
        mesh.rotation.y += p.rotSpeedY * delta;
        mesh.rotation.z += p.rotSpeedZ * delta;

        // Reset scale back to normal smoothly
        mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
      }

      p.currentPos.copy(mesh.position);
    });

    // Check if word is formed and sync sound
    if (activeZoneState.current !== -1 && targetCount > 0 && !formationCompleted.current) {
      const avgDist = aggregateDistance / targetCount;
      if (avgDist < 0.35) { // Threshold for "formed enough"
        if (activeWoosh.current) {
          activeWoosh.current.stop();
          activeWoosh.current = null;
        }
        formationCompleted.current = true;
      }
    }

    let vertexIndex = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dist = particles[i].currentPos.distanceTo(particles[j].currentPos);
        if (dist < CONNECT_DISTANCE) {
          linePositions[vertexIndex++] = particles[i].currentPos.x;
          linePositions[vertexIndex++] = particles[i].currentPos.y;
          linePositions[vertexIndex++] = particles[i].currentPos.z;

          linePositions[vertexIndex++] = particles[j].currentPos.x;
          linePositions[vertexIndex++] = particles[j].currentPos.y;
          linePositions[vertexIndex++] = particles[j].currentPos.z;
        }
      }
    }

    if (linesGeometryRef.current) {
      linesGeometryRef.current.setDrawRange(0, vertexIndex / 3);
      linesGeometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {/* Constellation Lines */}
      <lineSegments>
        <bufferGeometry ref={linesGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            count={maxLinePoints}
            array={linePositions}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#E8A020" transparent opacity={0.06} depthWrite={false} />
      </lineSegments>

      {/* Letters as Particles */}
      {particles.map((p, i) => {
        const isTarget = activeZoneIndex !== -1 && i < ZONES[activeZoneIndex].word.length;
        const char = isTarget ? ZONES[activeZoneIndex].word[i] : p.initialChar;
        // Multiply color for HDR effect to exceed Bloom threshold
        const color = isTarget ? new THREE.Color("#E8A020").multiplyScalar(3) : new THREE.Color("#4A6080");
        const opacity = isTarget ? 1.0 : 0.15;
        const toneMapped = !isTarget;

        return (
          <Text
            key={i}
            ref={p.ref}
            fontSize={0.35}
            color={color}
            transparent
            opacity={opacity}
            toneMapped={toneMapped}
            anchorX="center"
            anchorY="middle"
          >
            {char}
          </Text>
        )
      })}
    </group>
  );
};

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
      {/* Ambient background dust particles */}
      <Sparkles count={250} scale={24} size={1.2} speed={0.4} opacity={0.4} color="#4A6080" />
      <ConstellationDust activeScene={activeScene} />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1.2} mipmapBlur intensity={1.5} />
        <Noise opacity={0.015} />
        {activeScene === 2 && (
          <Glitch
            delay={[1.5, 3.5]}
            duration={[0.1, 0.3]}
            strength={[0.01, 0.03]}
            active
          />
        )}
      </EffectComposer>
    </>
  );
}
