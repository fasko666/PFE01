import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, geometry = 'icosa', scale = 1, distort = 0.3, speed = 1 }) {
  const mesh = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!mesh.current) return;
    mesh.current.rotation.x = t * 0.15 * speed;
    mesh.current.rotation.y = t * 0.22 * speed;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.6}>
      <mesh ref={mesh} position={position} scale={scale}>
        {geometry === 'icosa' && <icosahedronGeometry args={[1, 1]} />}
        {geometry === 'torus' && <torusGeometry args={[0.8, 0.28, 16, 64]} />}
        {geometry === 'octa' && <octahedronGeometry args={[1, 0]} />}
        {geometry === 'sphere' && <sphereGeometry args={[1, 48, 48]} />}
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          distort={distort}
          speed={1.8}
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 80, color = '#7c8fff', spread = 8 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={color} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

/* preset = 'features' | 'cta' | 'how' | 'testimonials' */
export default function Scene3DBackdrop({ preset = 'features', className = '' }) {
  const config = {
    features: {
      shapes: [
        { position: [-3.2, 1.2, -1], color: '#4361ff', geometry: 'icosa', scale: 0.9 },
        { position: [3.4, -1.4, -2], color: '#a855f7', geometry: 'torus', scale: 0.85 },
        { position: [0, 2, -3], color: '#22d3ee', geometry: 'octa', scale: 0.7 },
      ],
      particleColor: '#7c8fff',
    },
    how: {
      shapes: [
        { position: [-2.8, -1.2, -1.5], color: '#22d3ee', geometry: 'sphere', scale: 0.8, distort: 0.45 },
        { position: [3.6, 1.6, -2], color: '#4361ff', geometry: 'icosa', scale: 0.95 },
      ],
      particleColor: '#22d3ee',
    },
    testimonials: {
      shapes: [
        { position: [-3.5, 1.5, -2], color: '#f59e0b', geometry: 'torus', scale: 0.7 },
        { position: [3.2, -1.3, -1.5], color: '#a855f7', geometry: 'octa', scale: 0.85 },
      ],
      particleColor: '#a855f7',
    },
    cta: {
      shapes: [
        { position: [-3.8, 0.8, -1], color: '#4361ff', geometry: 'icosa', scale: 1.1, distort: 0.5 },
        { position: [3.5, -0.6, -2], color: '#a855f7', geometry: 'torus', scale: 1 },
        { position: [0, 2.4, -3], color: '#22d3ee', geometry: 'sphere', scale: 0.6 },
      ],
      particleColor: '#7c8fff',
    },
  }[preset];

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#a3b1ff" />
        <pointLight position={[-5, -5, -2]} intensity={0.8} color="#a855f7" />
        <Suspense fallback={null}>
          {config.shapes.map((s, i) => (
            <FloatingShape key={i} {...s} />
          ))}
          <Particles color={config.particleColor} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
