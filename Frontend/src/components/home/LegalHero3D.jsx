import { Canvas, useFrame } from "@react-three/fiber"
import { Float, OrbitControls, RoundedBox, MeshDistortMaterial } from "@react-three/drei"
import { useRef } from "react"

function FloatingCard({ position, color }) {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.3
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08
  })

  return (
    <Float speed={2} rotationIntensity={0.25} floatIntensity={0.8}>
      <RoundedBox ref={ref} args={[1.8, 1.1, 0.12]} radius={0.08} smoothness={4} position={position}>
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.9}
          roughness={0.15}
          metalness={0.55}
          distort={0.15}
          speed={1.2}
        />
      </RoundedBox>
    </Float>
  )
}

function CoreOrb() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y += 0.01
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.15
  })

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshPhysicalMaterial
        color="#2563eb"
        emissive="#1d4ed8"
        emissiveIntensity={0.45}
        roughness={0.18}
        metalness={0.6}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  )
}

export default function LegalHero3D() {
  return (
    <div className="relative h-[420px] w-full rounded-[28px] overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_30%)]" />
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 3]} intensity={1.5} />
        <pointLight position={[-3, -2, 2]} intensity={1.2} color="#38bdf8" />
        <CoreOrb />
        <FloatingCard position={[-2.2, 1.2, -0.3]} color="#0f172a" />
        <FloatingCard position={[2.2, 1, -0.6]} color="#1e3a8a" />
        <FloatingCard position={[-1.8, -1.4, -0.8]} color="#0f766e" />
        <FloatingCard position={[1.9, -1.3, -0.4]} color="#312e81" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.4} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 to-transparent" />

      <div className="absolute top-4 left-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 backdrop-blur-md">
        AI Legal Workflow
      </div>
    </div>
  )
}
