import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  Environment,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Sparkles,
  Stars,
  ContactShadows,
  Html,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';

/* ───────── Loader ───────── */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-2xs text-primary-400 font-mono tracking-widest">
        {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

/* ───────── Animated AI Core (the "model") ───────── */
function AICore() {
  const coreRef = useRef();
  const innerRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.18;
      coreRef.current.position.y = Math.sin(t * 0.9) * 0.06;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.6;
      innerRef.current.rotation.x = t * 0.3;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.4;
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.55;
      ring2Ref.current.rotation.y = t * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = -t * 0.35;
      ring3Ref.current.rotation.x = t * 0.2;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Outer glass shell */}
      <mesh castShadow>
        <icosahedronGeometry args={[1.15, 1]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.6}
          roughness={0.12}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.04}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.4}
          temporalDistortion={0.2}
          color="#9aa9ff"
          attenuationDistance={1.2}
          attenuationColor="#3b4aff"
        />
      </mesh>

      {/* Inner glowing distorted sphere */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.6, 6]} />
        <MeshDistortMaterial
          color="#4361ff"
          emissive="#4361ff"
          emissiveIntensity={1.4}
          distort={0.5}
          speed={2.4}
          roughness={0.05}
          metalness={0.2}
        />
      </mesh>

      {/* Tiny bright nucleus */}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial color="#dde3ff" />
      </mesh>

      {/* Orbiting rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[1.55, 0.012, 16, 128]} />
        <meshStandardMaterial
          color="#7c8fff"
          emissive="#4361ff"
          emissiveIntensity={1.2}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[1.8, 0.008, 16, 128]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={1.0}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 3]}>
        <torusGeometry args={[2.05, 0.006, 16, 128]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.9}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Orbit nodes */}
      <OrbitNodes count={5} radius={1.55} speed={0.7} color="#7c8fff" />
      <OrbitNodes count={3} radius={1.8} speed={-0.45} color="#a855f7" tilt={Math.PI / 5} />
      <OrbitNodes count={4} radius={2.05} speed={0.32} color="#22d3ee" tilt={Math.PI / 3} />
    </group>
  );
}

function OrbitNodes({ count = 5, radius = 1.5, speed = 0.5, color = '#fff', tilt = 0 }) {
  const group = useRef();
  const nodes = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        phase: (i / count) * Math.PI * 2,
      })),
    [count]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (!group.current) return;
    group.current.children.forEach((m, i) => {
      const a = nodes[i].phase + t;
      m.position.x = Math.cos(a) * radius;
      m.position.z = Math.sin(a) * radius;
      m.position.y = Math.sin(a * 2) * 0.04;
    });
  });

  return (
    <group ref={group} rotation={[tilt, 0, 0]}>
      {nodes.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ───────── Whole scene ───────── */
export default function HeroScene3D({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 5.6], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[0, 0, 0]} transparent />
        <fog attach="fog" args={['#0a0a0a', 6, 14]} />

        {/* Lights */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 6, 4]} intensity={1.6} castShadow color="#a3b1ff" />
        <pointLight position={[-4, -2, -3]} intensity={2} color="#a855f7" />
        <pointLight position={[3, -3, 3]} intensity={1.4} color="#22d3ee" />

        <Suspense fallback={<Loader />}>
          <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.6}>
            <AICore />
          </Float>

          {/* Atmosphere */}
          <Sparkles
            count={70}
            scale={[7, 6, 5]}
            size={2.2}
            speed={0.35}
            color="#7c8fff"
            opacity={0.9}
          />
          <Stars
            radius={20}
            depth={30}
            count={1200}
            factor={2}
            saturation={0}
            fade
            speed={0.4}
          />

          {/* Soft floor reflection */}
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.55}
            scale={8}
            blur={2.6}
            far={3}
            color="#000"
          />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
