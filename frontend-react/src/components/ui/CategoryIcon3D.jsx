import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

const SHAPES = {
  dev:      { geo: 'box',       color: '#3b82f6' },  // Development & IT (cube → blocks of code)
  design:   { geo: 'cone',      color: '#ec4899' },  // Design (pen tip)
  ai:       { geo: 'icosa',     color: '#a855f7' },  // AI (neural mesh)
  sales:    { geo: 'pyramid',   color: '#10b981' },  // Sales (growth)
  writing:  { geo: 'cylinder',  color: '#f97316' },  // Writing (pencil)
  finance:  { geo: 'torus',     color: '#14b8a6' },  // Finance (coin)
};

function Shape({ kind = 'ai' }) {
  const ref = useRef();
  const cfg = SHAPES[kind] || SHAPES.ai;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.6;
    ref.current.rotation.x = Math.sin(t * 0.7) * 0.25;
  });

  const geom = {
    box:      <boxGeometry args={[1.1, 1.1, 1.1]} />,
    cone:     <coneGeometry args={[0.8, 1.4, 32]} />,
    icosa:    <icosahedronGeometry args={[1, 1]} />,
    pyramid:  <coneGeometry args={[0.9, 1.3, 4]} />,
    cylinder: <cylinderGeometry args={[0.45, 0.45, 1.4, 32]} />,
    torus:    <torusGeometry args={[0.7, 0.28, 24, 64]} />,
  }[cfg.geo];

  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={ref} castShadow>
        {geom}
        <MeshDistortMaterial
          color={cfg.color}
          emissive={cfg.color}
          emissiveIntensity={0.5}
          distort={kind === 'ai' ? 0.4 : 0.1}
          speed={2}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

export default function CategoryIcon3D({ kind = 'ai', className = '' }) {
  return (
    <div className={`w-16 h-16 ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.4], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 3]} intensity={1.4} color="#fff" />
        <pointLight position={[-3, -2, -2]} intensity={0.8} color="#a855f7" />
        <Suspense fallback={null}>
          <Shape kind={kind} />
        </Suspense>
      </Canvas>
    </div>
  );
}
