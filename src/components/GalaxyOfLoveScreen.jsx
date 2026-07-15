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

/** Nhịp tim đều: thu → phóng mượt (sine), không giật lub-dub */
function heartPulseScale(time, period = 2.6) {
  // 0…1 smooth — thu sâu (0.76) rồi phóng đều (1.14)
  const u = (Math.sin((time / period) * Math.PI * 2) + 1) * 0.5
  const eased = u * u * (3 - 2 * u)
  return 0.76 + eased * 0.38
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

/** Box-Muller ≈ Gaussian — làm đốm loan mềm, hết cảm giác góc cạnh */
function gaussian() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v)
}

/** Soft glowing spiral disc — cánh xoắn rõ, loan nhẹ quanh cánh */
function GalaxyDisc({ count = 16000 }) {
  const pointsRef = useRef(null)
  const materialRef = useRef(null)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const arms = 3
    const armCount = Math.floor(count * 0.84)
    const mistCount = Math.floor(count * 0.04)
    const haloCount = Math.floor(count * 0.03)

    let i = 0

    for (let n = 0; n < armCount; n += 1) {
      const arm = n % arms
      const t = Math.random()
      const radius = 0.22 + Math.pow(t, 0.82) * 11.2
      // Twist mạnh hơn → vòng xoáy đọc rõ
      const twist = Math.log(radius + 1.0) * 2.55
      const baseAngle = arm * ((Math.PI * 2) / arms) + twist + t * 0.25
      // Cánh hẹp — ít loang
      const armWidth = 0.07 + t * 0.28
      const along = gaussian() * armWidth
      const radial = gaussian() * armWidth * 0.15
      const angle = baseAngle + along / Math.max(radius, 0.5)
      const r = Math.max(0.08, radius + radial)
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = gaussian() * (0.05 + t * 0.14)
      positions[i * 3 + 2] = Math.sin(angle) * r
      const [cr, cg, cb] = galaxyColor(t)
      const onSpine = Math.exp(-(along * along) / (armWidth * armWidth * 0.4 + 0.02))
      const bright = 0.85 + onSpine * 0.65
      colors[i * 3] = cr * bright
      colors[i * 3 + 1] = cg * bright
      colors[i * 3 + 2] = cb * bright
      i += 1
    }

    for (let n = 0; n < mistCount; n += 1) {
      const t = Math.random()
      const radius = 0.5 + Math.pow(Math.random(), 0.65) * 9.5
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius + gaussian() * 0.35
      positions[i * 3 + 1] = gaussian() * 0.1
      positions[i * 3 + 2] = Math.sin(angle) * radius + gaussian() * 0.35
      const [cr, cg, cb] = galaxyColor(0.25 + t * 0.55)
      const dim = 0.18 + Math.random() * 0.15
      colors[i * 3] = cr * dim
      colors[i * 3 + 1] = cg * dim
      colors[i * 3 + 2] = cb * dim
      i += 1
    }

    for (let n = 0; n < haloCount; n += 1) {
      const t = 0.75 + Math.random() * 0.25
      const radius = 10 + Math.random() * 4
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius + gaussian() * 0.8
      positions[i * 3 + 1] = gaussian() * 0.22
      positions[i * 3 + 2] = Math.sin(angle) * radius + gaussian() * 0.8
      const [cr, cg, cb] = galaxyColor(t)
      const dim = 0.2 + Math.random() * 0.2
      colors[i * 3] = cr * dim
      colors[i * 3 + 1] = cg * dim
      colors[i * 3 + 2] = cb * dim
      i += 1
    }

    while (i < count) {
      const t = Math.random() * 0.2
      const radius = Math.abs(gaussian()) * 0.55 + Math.random() ** 2.2 * 1.7
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = gaussian() * 0.1
      positions[i * 3 + 2] = Math.sin(angle) * radius
      const [cr, cg, cb] = galaxyColor(t * 0.28)
      colors[i * 3] = cr * 1.35
      colors[i * 3 + 1] = cg * 1.35
      colors[i * 3 + 2] = cb * 1.35
      i += 1
    }

    return { positions, colors }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 22 },
    }),
    [],
  )

  useFrame(({ clock }, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.032
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
            float phase = position.x * 7.0 + position.z * 5.5;
            vTwinkle = 0.62 + 0.38 * sin(uTime * 1.6 + phase) * sin(uTime * 0.7 + phase * 0.4);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float sizeJitter = 0.5 + fract(sin(phase) * 43758.5453) * 0.55;
            gl_PointSize = uSize * sizeJitter * (0.55 + vTwinkle * 0.5) * (1.0 / max(0.18, -mvPosition.z));
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
            float glow = exp(-d * d * 10.5);
            glow *= smoothstep(0.5, 0.14, d);
            gl_FragColor = vec4(vColor * (0.85 + vTwinkle * 0.5), glow * (0.48 + vTwinkle * 0.42));
          }
        `}
      />
    </points>
  )
}

/** Soft particle heart — nét vừa phải + hơi loan mềm */
function ParticleHeartOutline({ count = 5600 }) {
  const groupRef = useRef(null)
  const materialRef = useRef(null)
  const lightRef = useRef(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const scale = 0.14
    const rim = Math.floor(count * 0.78)
    const bloom = count - rim

    for (let i = 0; i < rim; i += 1) {
      const t = Math.random() * Math.PI * 2
      const [hx, hy] = heartCurve(t, scale)
      const next = heartCurve(t + 0.015, scale)
      const tx = next[0] - hx
      const ty = next[1] - hy
      const len = Math.hypot(tx, ty) || 1
      const nx = -ty / len
      const ny = tx / len
      const width = 0.025 + Math.random() * 0.045
      const offset = gaussian() * width
      arr[i * 3] = hx + nx * offset
      arr[i * 3 + 1] = hy + ny * offset
      arr[i * 3 + 2] = gaussian() * 0.12
    }

    for (let i = 0; i < bloom; i += 1) {
      const t = Math.random() * Math.PI * 2
      const [hx, hy] = heartCurve(t, scale)
      const falloff = Math.pow(Math.random(), 0.7)
      const spread = 0.03 + falloff * 0.14
      arr[(rim + i) * 3] = hx + gaussian() * spread
      arr[(rim + i) * 3 + 1] = hy + gaussian() * spread
      arr[(rim + i) * 3 + 2] = gaussian() * 0.14
    }

    return arr
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 16 },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const beat = heartPulseScale(clock.elapsedTime, 2.6)
    groupRef.current.scale.setScalar(beat)
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
      materialRef.current.uniforms.uSize.value = 14 + Math.abs(beat - 1) * 55
    }
    if (lightRef.current) lightRef.current.intensity = 1.8 + Math.max(0, beat - 1) * 14
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
            varying float vSoft;
            uniform float uTime;
            uniform float uSize;
            void main() {
              float phase = position.x * 8.0 + position.y * 11.0;
              vTwinkle = 0.68 + 0.32 * sin(uTime * 2.2 + phase);
              vSoft = fract(sin(phase * 12.9898) * 43758.5453);
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              float sizeJitter = 0.5 + vSoft * 0.85;
              gl_PointSize = uSize * sizeJitter * vTwinkle * (1.0 / max(0.2, -mvPosition.z));
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            varying float vTwinkle;
            varying float vSoft;
            void main() {
              vec2 uv = gl_PointCoord - 0.5;
              float d = length(uv);
              if (d > 0.5) discard;
              float glow = exp(-d * d * 7.2);
              glow *= smoothstep(0.5, 0.06, d);
              vec3 col = mix(vec3(1.0, 0.72, 0.88), vec3(1.0), vTwinkle * 0.55);
              float alpha = glow * (0.32 + vTwinkle * 0.35) * (0.55 + vSoft * 0.35);
              gl_FragColor = vec4(col, alpha);
            }
          `}
        />
      </points>
      <pointLight ref={lightRef} color="#ff9ec8" intensity={2.1} distance={12} />
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
