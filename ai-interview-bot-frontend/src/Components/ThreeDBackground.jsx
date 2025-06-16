"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"

function Model() {
  const mesh = useRef(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, (state.mouse.y * Math.PI) / 20, 0.05)
      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, (state.mouse.x * Math.PI) / 20, 0.05)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={mesh} scale={1.5}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial
          color="#e0e0e0"
          roughness={0.3}
          metalness={0.7}
          emissive="#404040"
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  )
}

function Particles() {
  const particlesCount = 500
  const positionArray = new Float32Array(particlesCount * 3)

  for (let i = 0; i < particlesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 15
    positionArray[i * 3 + 1] = (Math.random() - 0.5) * 15
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 15
  }

  const particles = useRef(null)

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.x = state.clock.getElapsedTime() * 0.03
      particles.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }
  })

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesCount} array={positionArray} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#808080" sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

export default function ThreeDBackground() {
  return (
    <Canvas className="bg-gradient-to-b from-gray-50 to-gray-200">
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Model />
      <Particles />
      <Environment preset="studio" />
    </Canvas>
  )
}
