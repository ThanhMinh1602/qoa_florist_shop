import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import './GalaxyOfLoveScreen.css'

const WHITE = new THREE.Color('#ffffff')
const PINK = new THREE.Color('#ff6eb4')
const SOFT = new THREE.Color('#ffd6e7')

const LOVE_LABELS = [
  'I LOVE YOU',
  'MY LOVE',
  'AMOR DE MI VIDA',
  'TE AMO',
  'Me Encantas',
  'Love',
]

/** Soft romantic placeholder photos (floating polaroids) */
const FLOAT_PHOTOS = [
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=240&h=240&fit=crop',
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=240&h=240&fit=crop',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=240&h=240&fit=crop',
  'https://images.unsplash.com/photo-1518197089685-c2b670ca12a6?w=240&h=240&fit=crop',
  'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=240&h=240&fit=crop',
]

function galaxyColor(t) {
  // Core almost white → outer soft pink (like reference)
  const color = WHITE.clone().lerp(PINK, THREE.MathUtils.smoothstep(t, 0.05, 0.85))
  color.lerp(SOFT, t * 0.35)
  color.multiplyScalar(1.55)
  return [color.r, color.g, color.b]
}

function doubleBeatScale(time, bpm = 70) {
  const cycle = (time * (bpm / 60)) % 1
  const lub = Math.exp(-(((cycle - 0.06) / 0.035) ** 2))
  const dub = Math.exp(-(((cycle - 0.22) / 0.03) ** 2)) * 0.7
  return 1 + (lub + dub) * 0.11
}

function heartCurve(t, scale = 0.12) {
  const x = 16 * Math.sin(t) ** 3
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  return [x * scale, y * scale]
}

function MouseParallax({ children, strength = 0.22 }) {
  const group = useRef(null)
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function onPointerMove(event) {
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1
      target.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  useFrame(() => {
    if (!group.current) return
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      target.current.x * strength,
      0.04,
    )
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -target.current.y * strength * 0.4,
      0.04,
    )
  })

  return <group ref={group}>{children}</group>
}

/** Flat glowing spiral disc — matches screenshot galaxy plane */
function GalaxyDisc({ count = 4200 }) {
  const pointsRef = useRef(null)
  const materialRef = useRef(null)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const arms = 3
    const perArm = Math.floor(count * 0.72 / arms)

    let i = 0
    for (let arm = 0; arm < arms; arm += 1) {
      for (let p = 0; p < perArm; p += 1) {
        const t = p / perArm
        const radius = 0.2 + Math.pow(t, 0.85) * 11
        const angle =
          arm * ((Math.PI * 2) / arms) + Math.log(radius + 1.1) * 2.15 + t * 0.55
        const spread = 0.08 + t * 1.35
        positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread
        // Very flat disc
        positions[i * 3 + 1] = (Math.random() - 0.5) * (0.08 + t * 0.22)
        positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread
        const [r, g, b] = galaxyColor(t)
        colors[i * 3] = r
        colors[i * 3 + 1] = g
        colors[i * 3 + 2] = b
        i += 1
      }
    }

    // Dense bright core cloud
    while (i < count) {
      const t = Math.random() * 0.25
      const radius = Math.random() ** 1.6 * 2.2
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.15
      positions[i * 3 + 2] = Math.sin(angle) * radius
      const [r, g, b] = galaxyColor(t * 0.4)
      colors[i * 3] = r * 1.2
      colors[i * 3 + 1] = g * 1.2
      colors[i * 3 + 2] = b * 1.2
      i += 1
    }

    return { positions, colors }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 36 },
    }),
    [],
  )

  useFrame(({ clock }, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.035
    if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={`
          attribute vec3 color;
          varying vec3 vColor;
          varying float vTwinkle;
          uniform float uTime;
          uniform float uSize;
          void main() {
            vColor = color;
            float phase = position.x * 11.0 + position.z * 8.3;
            vTwinkle = 0.55 + 0.45 * sin(uTime * 2.2 + phase) * sin(uTime * 0.9 + phase * 0.5);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * (0.6 + vTwinkle * 0.55) * (1.0 / max(0.15, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          varying float vTwinkle;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if (d > 0.5) discard;
            float glow = smoothstep(0.5, 0.05, d);
            gl_FragColor = vec4(vColor * (0.85 + vTwinkle * 0.6), glow * (0.5 + vTwinkle * 0.5));
          }
        `}
      />
    </points>
  )
}

/** Hollow particle heart OUTLINE floating above galaxy core */
function ParticleHeartOutline({ count = 2800 }) {
  const groupRef = useRef(null)
  const materialRef = useRef(null)
  const lightRef = useRef(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const t = (i / count) * Math.PI * 2
      const [hx, hy] = heartCurve(t, 0.135)
      // Outline thickness only — not filled volume
      const nx = -Math.sin(t)
      const ny = Math.cos(t)
      const thickness = (Math.random() - 0.5) * 0.14
      arr[i * 3] = hx + nx * thickness * 0.08 + (Math.random() - 0.5) * 0.04
      arr[i * 3 + 1] = hy + ny * thickness * 0.08 + (Math.random() - 0.5) * 0.04
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.18
    }
    return arr
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 28 },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const beat = doubleBeatScale(clock.elapsedTime, 72)
    groupRef.current.scale.setScalar(beat)
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
      materialRef.current.uniforms.uSize.value = 26 + (beat - 1) * 40
    }
    if (lightRef.current) lightRef.current.intensity = 2 + (beat - 1) * 14
  })

  return (
    <group ref={groupRef} position={[0, 3.35, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          uniforms={uniforms}
          vertexShader={`
            varying float vTwinkle;
            uniform float uTime;
            uniform float uSize;
            void main() {
              float phase = position.x * 9.0 + position.y * 14.0;
              vTwinkle = 0.65 + 0.35 * sin(uTime * 3.0 + phase);
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = uSize * vTwinkle * (1.0 / max(0.2, -mvPosition.z));
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            varying float vTwinkle;
            void main() {
              vec2 uv = gl_PointCoord - 0.5;
              float d = length(uv);
              if (d > 0.5) discard;
              float glow = smoothstep(0.5, 0.0, d);
              vec3 col = mix(vec3(1.0, 0.75, 0.88), vec3(1.0), vTwinkle);
              gl_FragColor = vec4(col, glow * 0.95);
            }
          `}
        />
      </points>
      <pointLight ref={lightRef} color="#ff9ec8" intensity={2.4} distance={12} />
    </group>
  )
}

function FloatingLoveText({ text, position, onSelect }) {
  const groupRef = useRef(null)
  const base = useMemo(() => [...position], [position])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.position.y = base[1] + Math.sin(t * 1.05 + base[0]) * 0.28
    groupRef.current.position.x = base[0] + Math.sin(t * 0.4 + base[2]) * 0.12
  })

  return (
    <group ref={groupRef} position={position}>
      <Html center transform distanceFactor={9} zIndexRange={[80, 0]} sprite>
        <button
          type="button"
          className="galaxy-love-text"
          onClick={(event) => {
            event.stopPropagation()
            onSelect?.(text)
          }}
        >
          {text === 'Me Encantas' ? (
            <>
              <span className="galaxy-love-text__heart" aria-hidden>
                ♥
              </span>
              {text}
            </>
          ) : (
            text
          )}
        </button>
      </Html>
    </group>
  )
}

function FloatingPhoto({ url, position, onSelect }) {
  const groupRef = useRef(null)
  const base = useMemo(() => [...position], [position])
  const tilt = useMemo(() => (Math.random() - 0.5) * 18, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.position.y = base[1] + Math.sin(t * 0.85 + base[2]) * 0.22
    groupRef.current.rotation.z = THREE.MathUtils.degToRad(tilt + Math.sin(t * 0.5) * 4)
  })

  return (
    <group ref={groupRef} position={position}>
      <Html center transform distanceFactor={10} zIndexRange={[70, 0]}>
        <button
          type="button"
          className="galaxy-photo-card"
          style={{ ['--tilt']: `${tilt}deg` }}
          onClick={(event) => {
            event.stopPropagation()
            onSelect?.('Kỷ niệm')
          }}
        >
          <img src={url} alt="" loading="lazy" />
        </button>
      </Html>
    </group>
  )
}

function FloatingDecor({ labels, photos, onSelect }) {
  const orbitRef = useRef(null)

  useFrame((_, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += delta * 0.06
  })

  const textItems = useMemo(() => {
    const radius = 5.2
    return labels.map((text, index) => {
      const angle = (index / labels.length) * Math.PI * 2 + 0.2
      return {
        text,
        position: [
          Math.cos(angle) * radius,
          1.2 + Math.sin(angle * 2) * 0.9 + (index % 2) * 0.5,
          Math.sin(angle) * radius * 0.85,
        ],
      }
    })
  }, [labels])

  const photoItems = useMemo(() => {
    const radius = 3.6
    return photos.map((url, index) => {
      const angle = (index / photos.length) * Math.PI * 2 + 0.55
      return {
        url,
        position: [
          Math.cos(angle) * radius,
          0.35 + (index % 3) * 0.35,
          Math.sin(angle) * radius,
        ],
      }
    })
  }, [photos])

  return (
    <group ref={orbitRef}>
      {textItems.map((item) => (
        <FloatingLoveText
          key={item.text}
          text={item.text}
          position={item.position}
          onSelect={onSelect}
        />
      ))}
      {photoItems.map((item) => (
        <FloatingPhoto
          key={item.url}
          url={item.url}
          position={item.position}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}

function SceneFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.7} intensity={1.85} mipmapBlur radius={0.72} />
    </EffectComposer>
  )
}

function Scene({ labels, photos, onSelectLabel }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 18, 40]} />
      <ambientLight intensity={0.15} />
      <Stars radius={80} depth={50} count={3500} factor={2.8} saturation={0} fade speed={0.35} />

      <MouseParallax>
        <GalaxyDisc />
        <ParticleHeartOutline />
        <FloatingDecor labels={labels} photos={photos} onSelect={onSelectLabel} />
        <pointLight position={[0, 0.2, 0]} color="#ffffff" intensity={1.8} distance={6} />
        <pointLight position={[0, 3.2, 0]} color="#ff7eb9" intensity={1.2} distance={8} />
      </MouseParallax>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={22}
        target={[0, 1.6, 0]}
        autoRotate
        autoRotateSpeed={0.2}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.48}
        minPolarAngle={Math.PI * 0.18}
      />
      <SceneFX />
    </>
  )
}

function PopupCard({ open, title, message, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="galaxy-popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="galaxy-popup-card"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.78, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18, mass: 0.8 }}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="galaxy-popup-eyebrow">Galaxy of Love</p>
            <h2 className="galaxy-popup-title">{title}</h2>
            <p className="galaxy-popup-body">{message}</p>
            <button type="button" className="galaxy-popup-close" onClick={onClose}>
              Đóng
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function GalaxyOfLoveScreen({
  preview = false,
  senderName = '',
  recipientName = '',
  message = '',
}) {
  const [selected, setSelected] = useState(null)

  const labels = useMemo(() => {
    const list = [...LOVE_LABELS]
    if (recipientName?.trim()) list.unshift(recipientName.trim().toUpperCase())
    if (senderName?.trim()) list.push(`♥ ${senderName.trim()}`)
    return [...new Set(list)].slice(0, 7)
  }, [recipientName, senderName])

  const popupMessage =
    message?.trim() ||
    (selected
      ? `Một góc ngân hà này dành riêng cho “${selected}”.`
      : 'Chạm chữ hoặc ảnh đang bay quanh ngân hà.')

  return (
    <div className={preview ? 'galaxy-screen galaxy-screen--preview' : 'galaxy-screen'}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 7.5, 14], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 1.8, 0)
        }}
      >
        <Suspense fallback={null}>
          <Scene labels={labels} photos={FLOAT_PHOTOS} onSelectLabel={setSelected} />
        </Suspense>
      </Canvas>

      <PopupCard
        open={Boolean(selected)}
        title={selected || ''}
        message={popupMessage}
        onClose={() => setSelected(null)}
      />

      {!preview ? (
        <p className="galaxy-hint">Kéo để xoay · di chuột parallax · chạm chữ / ảnh</p>
      ) : null}
    </div>
  )
}

export default GalaxyOfLoveScreen
