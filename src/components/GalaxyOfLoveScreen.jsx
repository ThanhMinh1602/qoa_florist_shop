import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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
  const s = Math.sin(t)
  const x = 16 * s * s * s
  // Hệ số mềm hơn — cánh đỡ góc cạnh
  const y =
    13 * Math.cos(t) - 4.4 * Math.cos(2 * t) - 1.35 * Math.cos(3 * t) - 0.5 * Math.cos(4 * t)
  let px = x * scale * 1.1
  let py = y * scale
  if (py < -0.35) {
    py = -0.35 + (py + 0.35) * 0.72
  }
  return [px, py]
}

function buildHeartPolygon(scale, steps = 160) {
  const pts = []
  for (let i = 0; i < steps; i += 1) {
    pts.push(heartCurve((i / steps) * Math.PI * 2, scale))
  }
  return pts
}

function pointInPolygon(x, y, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1) {
    const xi = pts[i][0]
    const yi = pts[i][1]
    const xj = pts[j][0]
    const yj = pts[j][1]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-9) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function wrapCanvasLines(ctx, text, maxWidth) {
  const paragraphs = String(text || '')
    .trim()
    .split(/\n+/)
  const lines = []
  paragraphs.forEach((para) => {
    const words = para.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      return
    }
    let line = words[0]
    for (let i = 1; i < words.length; i += 1) {
      const test = `${line} ${words[i]}`
      if (ctx.measureText(test).width <= maxWidth) line = test
      else {
        lines.push(line)
        line = words[i]
      }
    }
    lines.push(line)
  })
  return lines.slice(0, 6)
}

/**
 * Sample chữ từ canvas → cloud particle 3D nét (nhiều lớp Z như extrude).
 */
function sampleSharpTextParticles(text, options = {}) {
  const {
    fontSize = 110,
    maxWidth = 920,
    lineHeight = 1.18,
    depthLayers = 9,
    depth = 0.32,
    worldWidth = 7.2,
    step = 2,
  } = options

  const display =
    String(text || '').trim() || 'I love you'
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.font = `700 ${fontSize}px "Segoe UI", "Be Vietnam Pro", system-ui, sans-serif`
  const lines = wrapCanvasLines(ctx, display, maxWidth)
  const padX = 48
  const padY = 40
  const textH = lines.length * fontSize * lineHeight
  let textW = 0
  lines.forEach((line) => {
    textW = Math.max(textW, ctx.measureText(line).width)
  })
  canvas.width = Math.ceil(textW + padX * 2)
  canvas.height = Math.ceil(textH + padY * 2)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = `700 ${fontSize}px "Segoe UI", "Be Vietnam Pro", system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.imageSmoothingEnabled = false
  const startY = padY + (fontSize * lineHeight) / 2
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, startY + index * fontSize * lineHeight)
  })

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  // Adaptive step — giữ mật độ cao nhưng không quá nặng
  let sampleStep = step
  let ink = 0
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      if (data[(y * width + x) * 4] > 180) ink += 1
    }
  }
  const estimate = (ink * 16 * depthLayers) / (sampleStep * sampleStep)
  if (estimate > 90000) sampleStep = 3
  if (estimate > 140000) sampleStep = 4

  const scale = worldWidth / width
  const targets = []
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const a = data[(y * width + x) * 4]
      if (a < 180) continue
      const wx = (x - width / 2) * scale
      const wy = -(y - height / 2) * scale
      for (let layer = 0; layer < depthLayers; layer += 1) {
        const t = depthLayers === 1 ? 0.5 : layer / (depthLayers - 1)
        const wz = (t - 0.5) * 2 * depth
        const edge = Math.min(t, 1 - t) * 2
        const brightness = 0.55 + edge * 0.35 + (a / 255) * 0.18
        targets.push(wx, wy, wz, brightness)
      }
    }
  }

  return {
    targets: new Float32Array(targets),
    particleCount: targets.length / 4,
    worldWidth,
    worldHeight: height * scale,
  }
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

/** Soft glowing spiral — tâm dịu hơn, cánh rõ, không rối lõi */
function GalaxyDisc({ count = 52000, spinSpeedRef }) {
  const pointsRef = useRef(null)
  const materialRef = useRef(null)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const arms = 3
    const armCount = Math.floor(count * 0.88)
    const mistCount = Math.floor(count * 0.07)

    let i = 0

    for (let n = 0; n < armCount; n += 1) {
      const arm = n % arms
      const t = Math.random()
      // Ít dồn tâm hơn — cánh đều, lõi thoáng
      const u = Math.pow(t, 1.35)
      const radius = 0.55 + u * 40
      const twist = Math.log(radius + 1.0) * 3.35
      const baseAngle = arm * ((Math.PI * 2) / arms) + twist
      const inner = Math.exp(-radius * 0.1)
      const armWidth = 0.1 + (1 - u) * 0.36 + inner * 0.1
      const along = gaussian() * armWidth
      const radial = gaussian() * armWidth * 0.18
      const angle = baseAngle + along / Math.max(radius, 0.5)
      const r = Math.max(0.4, radius + radial)
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = gaussian() * (0.04 + u * 0.15)
      positions[i * 3 + 2] = Math.sin(angle) * r

      const fadeOuter = Math.exp(-Math.max(0, radius - 8) * 0.065)
      const [cr, cg, cb] = galaxyColor(Math.min(0.9, u * 0.85))
      const onSpine = Math.exp(-(along * along) / (armWidth * armWidth * 0.55 + 0.04))
      // Không tăng sáng quá mạnh ở trong → tâm đỡ rối
      const bright =
        (0.48 + onSpine * 0.5 + inner * 0.35) * (0.35 + fadeOuter * 0.65)
      colors[i * 3] = cr * bright
      colors[i * 3 + 1] = cg * bright
      colors[i * 3 + 2] = cb * bright
      i += 1
    }

    for (let n = 0; n < mistCount; n += 1) {
      const t = Math.random()
      const radius = 1.2 + Math.pow(Math.random(), 1.1) * 9
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius + gaussian() * 0.28
      positions[i * 3 + 1] = gaussian() * 0.08
      positions[i * 3 + 2] = Math.sin(angle) * radius + gaussian() * 0.28
      const [cr, cg, cb] = galaxyColor(0.2 + t * 0.45)
      const dim = 0.1 + Math.random() * 0.1
      colors[i * 3] = cr * dim
      colors[i * 3 + 1] = cg * dim
      colors[i * 3 + 2] = cb * dim
      i += 1
    }

    // Core thưa + dịu — chỉ gợi sáng nhẹ dưới trái tim
    while (i < count) {
      const t = Math.random() * 0.18
      const radius = 0.6 + Math.pow(Math.random(), 0.9) * 3.2
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius + gaussian() * 0.2
      positions[i * 3 + 1] = gaussian() * 0.08
      positions[i * 3 + 2] = Math.sin(angle) * radius + gaussian() * 0.2
      const [cr, cg, cb] = galaxyColor(t * 0.3)
      const glow = 0.35 + Math.random() * 0.25
      colors[i * 3] = cr * glow
      colors[i * 3 + 1] = cg * glow
      colors[i * 3 + 2] = cb * glow
      i += 1
    }

    return { positions, colors }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 13 },
    }),
    [],
  )

  useFrame(({ clock }, delta) => {
    const speed = spinSpeedRef?.current ?? 0.032
    if (pointsRef.current) pointsRef.current.rotation.y += delta * speed
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

/** Trái tim 3D — đốm phủ bề mặt; có thể nổ tung */
function ParticleHeartOutline({ count = 32000, exploding = false, onExploded }) {
  const groupRef = useRef(null)
  const materialRef = useRef(null)
  const lightRef = useRef(null)
  const pointsRef = useRef(null)
  const velocitiesRef = useRef(null)
  const explodeT = useRef(0)
  const doneRef = useRef(false)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const scale = 0.15
    const poly = buildHeartPolygon(scale)
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    poly.forEach(([x, y]) => {
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    })
    const cx = (minX + maxX) * 0.5
    const cy = (minY + maxY) * 0.5 + 0.08
    const rx = (maxX - minX) * 0.5 || 1
    const ry = (maxY - minY) * 0.5 || 1

    const edgeCount = Math.floor(count * 0.18)
    const faceCount = count - edgeCount
    let i = 0

    for (let n = 0; n < edgeCount; n += 1) {
      const t = Math.random() * Math.PI * 2
      const [hx, hy] = heartCurve(t, scale)
      const next = heartCurve(t + 0.015, scale)
      const tx = next[0] - hx
      const ty = next[1] - hy
      const len = Math.hypot(tx, ty) || 1
      const nx = -ty / len
      const ny = tx / len
      const width = 0.02 + Math.random() * 0.04
      const u = (Math.random() - 0.5) * 2
      const halfZ = 0.48 * Math.sqrt(Math.max(0, 1 - u * u * 0.35))
      positions[i * 3] = hx + nx * gaussian() * width
      positions[i * 3 + 1] = hy + ny * gaussian() * width
      positions[i * 3 + 2] = u * halfZ + gaussian() * 0.02
      const bright = 1.4 + Math.random() * 0.35
      colors[i * 3] = bright
      colors[i * 3 + 1] = 0.3 * bright
      colors[i * 3 + 2] = 0.55 * bright
      i += 1
    }

    let placed = 0
    let guard = 0
    while (placed < faceCount && guard < faceCount * 40) {
      guard += 1
      const x = minX + Math.random() * (maxX - minX)
      const y = minY + Math.random() * (maxY - minY)
      if (!pointInPolygon(x, y, poly)) continue
      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      const r2 = Math.min(1, dx * dx * 0.85 + dy * dy * 0.85)
      const halfZ = 0.58 * Math.sqrt(Math.max(0.05, 1 - r2 * 0.92))
      const face = Math.random() < 0.5 ? 1 : -1
      positions[i * 3] = x + gaussian() * 0.012
      positions[i * 3 + 1] = y + gaussian() * 0.012
      positions[i * 3 + 2] = face * halfZ + gaussian() * 0.025
      const bright = (1.15 + Math.random() * 0.35) * (0.75 + (1 - r2) * 0.55)
      colors[i * 3] = bright
      colors[i * 3 + 1] = 0.28 * bright
      colors[i * 3 + 2] = 0.52 * bright
      i += 1
      placed += 1
    }

    while (i < count) {
      const t = Math.random() * Math.PI * 2
      const [hx, hy] = heartCurve(t, scale)
      positions[i * 3] = hx + gaussian() * 0.03
      positions[i * 3 + 1] = hy + gaussian() * 0.03
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.9
      colors[i * 3] = 1.2
      colors[i * 3 + 1] = 0.3
      colors[i * 3 + 2] = 0.55
      i += 1
    }

    const vels = new Float32Array(count * 3)
    for (let n = 0; n < count; n += 1) {
      const px = positions[n * 3]
      const py = positions[n * 3 + 1]
      const pz = positions[n * 3 + 2]
      const len = Math.hypot(px, py, pz) || 1
      const speed = 2.8 + Math.random() * 5.5
      vels[n * 3] = (px / len) * speed + (Math.random() - 0.5) * 1.2
      vels[n * 3 + 1] = (py / len) * speed + (Math.random() - 0.5) * 1.2 + 1.5
      vels[n * 3 + 2] = (pz / len) * speed + (Math.random() - 0.5) * 1.2
    }
    velocitiesRef.current = vels

    return { positions, colors }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 13 },
      uFade: { value: 1 },
    }),
    [],
  )

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    if (!exploding) {
      const beat = heartPulseScale(clock.elapsedTime, 2.6)
      groupRef.current.scale.setScalar(beat)
      groupRef.current.rotation.y = 1.08 + Math.sin(clock.elapsedTime * 0.35) * 0.12
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = clock.elapsedTime
        materialRef.current.uniforms.uSize.value = 12 + Math.abs(beat - 1) * 42
        materialRef.current.uniforms.uFade.value = 1
      }
      if (lightRef.current) lightRef.current.intensity = 3.0 + Math.max(0, beat - 1) * 12
      return
    }

    explodeT.current += delta
    const t = explodeT.current
    const fade = Math.max(0, 1 - t / 1.35)
    if (materialRef.current) {
      materialRef.current.uniforms.uFade.value = fade
      materialRef.current.uniforms.uSize.value = 13 + t * 8
    }
    if (lightRef.current) lightRef.current.intensity = 3 * fade

    const posAttr = pointsRef.current?.geometry?.attributes?.position
    const vels = velocitiesRef.current
    if (posAttr && vels) {
      const arr = posAttr.array
      for (let n = 0; n < count; n += 1) {
        arr[n * 3] += vels[n * 3] * delta
        arr[n * 3 + 1] += vels[n * 3 + 1] * delta
        arr[n * 3 + 2] += vels[n * 3 + 2] * delta
        vels[n * 3 + 1] -= 1.8 * delta
      }
      posAttr.needsUpdate = true
    }

    if (t >= 1.35 && !doneRef.current) {
      doneRef.current = true
      onExploded?.()
    }
  })

  return (
    <group ref={groupRef} position={[0, 3.45, 0]}>
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
            uniform float uFade;
            void main() {
              vColor = color * uFade;
              float phase = position.x * 8.0 + position.y * 11.0 + position.z * 6.0;
              vTwinkle = 0.78 + 0.22 * sin(uTime * 2.0 + phase);
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              float sizeJitter = 0.6 + fract(sin(phase * 12.9898) * 43758.5453) * 0.55;
              gl_PointSize = uSize * sizeJitter * vTwinkle * (1.0 / max(0.2, -mvPosition.z));
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
              float glow = exp(-d * d * 8.2);
              glow *= smoothstep(0.5, 0.08, d);
              vec3 col = vColor * (1.0 + vTwinkle * 0.35);
              float alpha = glow * (0.58 + vTwinkle * 0.35);
              gl_FragColor = vec4(col, alpha);
            }
          `}
        />
      </points>
      <pointLight ref={lightRef} color="#ff4fa0" intensity={3.2} distance={16} />
    </group>
  )
}

/** Thời gian giữ chữ trước khi nổ — tối thiểu 2s, thêm theo độ dài cụm từ */
function phraseHoldSeconds(text) {
  const len = String(text || '').replace(/\s+/g, '').length
  return THREE.MathUtils.clamp(2 + len * 0.08, 2, 5.5)
}

/** Chữ lời nhắn 3D — tuần tự: gom → giữ (theo độ dài) → nổ → gom cụm tiếp; cụm cuối gom rồi biến mất */
function ParticleMessageText({ phrases, active, onBounds }) {
  const groupRef = useRef(null)
  const pointsRef = useRef(null)
  const materialRef = useRef(null)
  const phaseRef = useRef('gather') // gather | hold | explode | gone
  const phraseIndexRef = useRef(0)
  const progressRef = useRef(0)
  const holdRef = useRef(0)
  const holdDurationRef = useRef(2)
  const startsRef = useRef(null)
  const velocitiesRef = useRef(null)
  const targetsRef = useRef(null)
  const initializedRef = useRef(false)

  const phraseList = useMemo(() => {
    const list = (Array.isArray(phrases) ? phrases : [])
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .slice(0, 10)
    return list.length ? list : ['I love you']
  }, [phrases])

  const clouds = useMemo(() => {
    if (typeof document === 'undefined') {
      return phraseList.map(() => ({
        targets: new Float32Array(0),
        particleCount: 0,
        worldWidth: 7.4,
        worldHeight: 2,
      }))
    }
    return phraseList.map((text) =>
      sampleSharpTextParticles(text, {
        fontSize: 108,
        maxWidth: 980,
        depthLayers: 6,
        depth: 0.22,
        worldWidth: 7.4,
        step: 2,
      }),
    )
  }, [phraseList])

  const maxCount = useMemo(
    () => Math.max(1, ...clouds.map((cloud) => cloud.particleCount || 0)),
    [clouds],
  )

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(maxCount * 3)
    const colors = new Float32Array(maxCount * 3)
    const starts = new Float32Array(maxCount * 3)
    for (let i = 0; i < maxCount; i += 1) {
      starts[i * 3] = (Math.random() - 0.5) * 10
      starts[i * 3 + 1] = (Math.random() - 0.5) * 6
      starts[i * 3 + 2] = (Math.random() - 0.5) * 8
      positions[i * 3] = starts[i * 3]
      positions[i * 3 + 1] = starts[i * 3 + 1]
      positions[i * 3 + 2] = starts[i * 3 + 2]
      colors[i * 3] = 0.72
      colors[i * 3 + 1] = 0.38
      colors[i * 3 + 2] = 0.55
    }
    startsRef.current = starts
    initializedRef.current = false
    phraseIndexRef.current = 0
    phaseRef.current = 'gather'
    progressRef.current = 0
    holdRef.current = 0
    return { positions, colors }
  }, [maxCount, clouds])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 8.5 },
      uOpacity: { value: 0 },
    }),
    [],
  )

  function loadTargets(index) {
    const cloud = clouds[index]
    if (!cloud?.particleCount) return
    const targets = new Float32Array(maxCount * 4)
    const src = cloud.targets
    const n = cloud.particleCount
    for (let i = 0; i < maxCount; i += 1) {
      const j = i % n
      targets[i * 4] = src[j * 4]
      targets[i * 4 + 1] = src[j * 4 + 1]
      targets[i * 4 + 2] = src[j * 4 + 2]
      targets[i * 4 + 3] = src[j * 4 + 3]
    }
    targetsRef.current = targets

    const colorAttr = pointsRef.current?.geometry?.attributes?.color
    if (colorAttr) {
      const arr = colorAttr.array
      for (let i = 0; i < maxCount; i += 1) {
        const bright = targets[i * 4 + 3]
        arr[i * 3] = 0.72 * bright
        arr[i * 3 + 1] = 0.38 * bright
        arr[i * 3 + 2] = 0.55 * bright
      }
      colorAttr.needsUpdate = true
    }

    onBounds?.({ worldWidth: cloud.worldWidth, worldHeight: cloud.worldHeight })
  }

  function beginExplode(arr) {
    const vels = new Float32Array(maxCount * 3)
    for (let i = 0; i < maxCount; i += 1) {
      const px = arr[i * 3]
      const py = arr[i * 3 + 1]
      const pz = arr[i * 3 + 2]
      const len = Math.hypot(px, py, pz) || 1
      const speed = 2.2 + Math.random() * 4.2
      vels[i * 3] = (px / len) * speed + (Math.random() - 0.5) * 1.4
      vels[i * 3 + 1] = (py / len) * speed + (Math.random() - 0.5) * 1.4 + 0.8
      vels[i * 3 + 2] = (pz / len) * speed + (Math.random() - 0.5) * 1.4
    }
    velocitiesRef.current = vels
    phaseRef.current = 'explode'
    progressRef.current = 0
  }

  useEffect(() => {
    if (!active) {
      initializedRef.current = false
      phraseIndexRef.current = 0
      phaseRef.current = 'gather'
      progressRef.current = 0
      holdRef.current = 0
    }
  }, [active, clouds])

  useFrame(({ camera, clock }, delta) => {
    if (!active || !pointsRef.current || phaseRef.current === 'gone') return

    if (!initializedRef.current) {
      loadTargets(0)
      initializedRef.current = true
      phaseRef.current = 'gather'
      progressRef.current = 0
      holdRef.current = 0
    }

    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array
    const starts = startsRef.current
    const targets = targetsRef.current
    if (!starts || !targets) return

    const phase = phaseRef.current
    const isLast = phraseIndexRef.current >= phraseList.length - 1

    if (phase === 'gather') {
      progressRef.current = Math.min(1, progressRef.current + delta * 0.95)
      const e = 1 - Math.pow(1 - progressRef.current, 3)
      for (let i = 0; i < maxCount; i += 1) {
        arr[i * 3] = starts[i * 3] + (targets[i * 4] - starts[i * 3]) * e
        arr[i * 3 + 1] = starts[i * 3 + 1] + (targets[i * 4 + 1] - starts[i * 3 + 1]) * e
        arr[i * 3 + 2] = starts[i * 3 + 2] + (targets[i * 4 + 2] - starts[i * 3 + 2]) * e
      }
      posAttr.needsUpdate = true
      if (materialRef.current) {
        materialRef.current.uniforms.uOpacity.value = Math.min(0.72, progressRef.current * 0.95)
      }
      if (progressRef.current >= 1) {
        if (isLast) {
          // Cụm cuối: giữ nguyên, không nổ
          phaseRef.current = 'hold'
          holdRef.current = 0
          if (materialRef.current) materialRef.current.uniforms.uOpacity.value = 0.72
        } else {
          phaseRef.current = 'hold'
          holdRef.current = 0
          holdDurationRef.current = phraseHoldSeconds(phraseList[phraseIndexRef.current])
        }
      }
    } else if (phase === 'hold') {
      if (materialRef.current) materialRef.current.uniforms.uOpacity.value = 0.72
      // Cụm cuối đứng yên — không nổ
      if (!isLast) {
        holdRef.current += delta
        if (holdRef.current >= holdDurationRef.current) {
          beginExplode(arr)
        }
      }
    } else if (phase === 'explode') {
      progressRef.current = Math.min(1, progressRef.current + delta / 0.85)
      const fade = Math.max(0, 1 - progressRef.current)
      const vels = velocitiesRef.current
      if (vels) {
        for (let i = 0; i < maxCount; i += 1) {
          arr[i * 3] += vels[i * 3] * delta
          arr[i * 3 + 1] += vels[i * 3 + 1] * delta
          arr[i * 3 + 2] += vels[i * 3 + 2] * delta
          vels[i * 3 + 1] -= 1.6 * delta
        }
        posAttr.needsUpdate = true
      }
      if (materialRef.current) {
        materialRef.current.uniforms.uOpacity.value = 0.72 * fade
        materialRef.current.uniforms.uSize.value = 8.5 + progressRef.current * 10
      }

      if (progressRef.current >= 1) {
        if (isLast) {
          phaseRef.current = 'gone'
          if (materialRef.current) materialRef.current.uniforms.uOpacity.value = 0
          return
        }
        // Gom thành cụm tiếp theo từ vị trí đang nổ
        for (let i = 0; i < maxCount; i += 1) {
          starts[i * 3] = arr[i * 3]
          starts[i * 3 + 1] = arr[i * 3 + 1]
          starts[i * 3 + 2] = arr[i * 3 + 2]
        }
        phraseIndexRef.current += 1
        loadTargets(phraseIndexRef.current)
        phaseRef.current = 'gather'
        progressRef.current = 0
        holdRef.current = 0
        if (materialRef.current) materialRef.current.uniforms.uSize.value = 8.5
      }
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
    }

    if (groupRef.current) {
      const { x, y, z } = groupRef.current.position
      const dx = camera.position.x - x
      const dz = camera.position.z - z
      if (dx * dx + dz * dz > 0.0001) {
        groupRef.current.rotation.set(0, Math.atan2(dx, dz), 0)
      }
    }
  })

  if (!active || maxCount === 0) return null

  return (
    <group ref={groupRef} position={[0, 3.35, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={maxCount} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} count={maxCount} />
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
            varying float vAlpha;
            uniform float uTime;
            uniform float uSize;
            uniform float uOpacity;
            void main() {
              vColor = color;
              vAlpha = uOpacity;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = uSize * (1.0 / max(0.25, -mvPosition.z));
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
              vec2 uv = gl_PointCoord - 0.5;
              float d = length(uv);
              if (d > 0.5) discard;
              float core = smoothstep(0.5, 0.12, d);
              float glow = exp(-d * d * 14.0);
              float alpha = mix(glow * 0.28, core, 0.72) * vAlpha * 0.85;
              gl_FragColor = vec4(vColor * 0.92, alpha);
            }
          `}
        />
      </points>
      <pointLight color="#ff8ec8" intensity={2.2} distance={18} />
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

function FloatingDecor({ labels, onSelect }) {
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

  return (
    <group ref={orbitRef}>
      {textItems.map((item, index) => (
        <FloatingLoveText
          key={`${item.text}-${index}`}
          text={item.text}
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

const INTRO_SPIN_START = 2.6
const INTRO_SPIN_END = 0.032
const INTRO_DURATION = 3.6

/**
 * Intro quỹ đạo cầu — góc / bán kính đổi ĐỀU theo thời gian.
 * Không CatmullRom (dễ khựng ở control point), không scale galaxy.
 * Cảm giác: trên xuống → quét ngang liền → áp sát vừa phải.
 */
function GalaxyIntro({ spinSpeedRef, onComplete }) {
  const { camera } = useThree()
  const startedAt = useRef(null)
  const finished = useRef(false)

  useFrame((state) => {
    if (finished.current) return

    if (startedAt.current == null) {
      startedAt.current = state.clock.elapsedTime
      spinSpeedRef.current = INTRO_SPIN_START
    }

    const t = Math.min(1, Math.max(0, (state.clock.elapsedTime - startedAt.current) / INTRO_DURATION))

    // Linear thuần = liền mạnh, không tăng/giảm tốc gây khựng
    const polar = THREE.MathUtils.lerp(0.1, 0.98, t)
    const azimuth = THREE.MathUtils.lerp(-0.2, 1.08, t)
    // Giữ khoảng cách như trước — không zoom sâu thêm
    const radius = THREE.MathUtils.lerp(48, 16.5, t)
    // Hướng nhìn vào trái tim để thấy trọn hình
    const lookY = THREE.MathUtils.lerp(0.05, 3.45, t)

    camera.position.set(
      Math.sin(polar) * Math.sin(azimuth) * radius,
      Math.cos(polar) * radius,
      Math.sin(polar) * Math.cos(azimuth) * radius,
    )
    camera.lookAt(0, lookY, 0)

    spinSpeedRef.current = THREE.MathUtils.lerp(INTRO_SPIN_START, INTRO_SPIN_END, t)

    if (t >= 1 && !finished.current) {
      finished.current = true
      spinSpeedRef.current = INTRO_SPIN_END
      onComplete?.()
    }
  })

  return null
}

/** Zoom out rõ + góc nhìn chữ nằm trọn màn hình */
function TextViewCamera({ active, controlsRef, textBounds, onSettled }) {
  const { camera } = useThree()
  const started = useRef(false)
  const finished = useRef(false)
  const startPos = useRef(new THREE.Vector3())
  const startLook = useRef(new THREE.Vector3())
  const endPos = useRef(new THREE.Vector3(0, 3.5, 20))
  const endLook = useRef(new THREE.Vector3(0, 3.35, 0))
  const endDist = useRef(20)
  const progress = useRef(0)

  useEffect(() => {
    if (!active) {
      started.current = false
      finished.current = false
      progress.current = 0
    }
  }, [active])

  useFrame((_, delta) => {
    if (!active || finished.current) return

    endLook.current.set(0, 3.35, 0)

    if (!started.current) {
      started.current = true
      startPos.current.copy(camera.position)
      if (controlsRef.current) startLook.current.copy(controlsRef.current.target)
      else startLook.current.set(0, 3.45, 0)
      progress.current = 0

      const w = textBounds?.worldWidth || 7.4
      const h = textBounds?.worldHeight || 2.4
      const halfFov = THREE.MathUtils.degToRad(42 / 2)
      const fitDist = Math.max(
        (w * 0.62) / Math.tan(halfFov),
        (h * 0.78) / Math.tan(halfFov),
      )
      const startDist = startPos.current.distanceTo(endLook.current)
      // Luôn kéo xa hơn góc focus trước đó — zoom out rõ ràng
      const dist = Math.max(fitDist * 1.28, startDist * 1.45, startDist + 5.5, 18)
      endDist.current = THREE.MathUtils.clamp(dist, 18, 28)
      // Trước mặt chữ (+Z), hơi cao nhẹ
      endPos.current.set(0, 3.55, endDist.current)
    } else if (textBounds?.worldWidth && progress.current < 0.35) {
      // Cập nhật nhẹ khi bounds chữ sẵn sàng (vẫn trong nửa đầu anim)
      const w = textBounds.worldWidth
      const h = textBounds.worldHeight || 2.4
      const halfFov = THREE.MathUtils.degToRad(42 / 2)
      const fitDist = Math.max(
        (w * 0.62) / Math.tan(halfFov),
        (h * 0.78) / Math.tan(halfFov),
      )
      const startDist = startPos.current.distanceTo(endLook.current)
      const dist = Math.max(fitDist * 1.28, startDist * 1.45, startDist + 5.5, 18)
      endDist.current = THREE.MathUtils.clamp(dist, 18, 28)
      endPos.current.set(0, 3.55, endDist.current)
    }

    progress.current = Math.min(1, progress.current + delta / 1.5)
    const e = 1 - Math.pow(1 - progress.current, 3)
    camera.position.lerpVectors(startPos.current, endPos.current, e)
    const look = startLook.current.clone().lerp(endLook.current, e)
    camera.lookAt(look)
    if (controlsRef.current) {
      controlsRef.current.target.copy(look)
      controlsRef.current.update()
    }

    if (progress.current >= 1 && !finished.current) {
      finished.current = true
      camera.position.copy(endPos.current)
      camera.lookAt(endLook.current)
      if (controlsRef.current) {
        controlsRef.current.target.copy(endLook.current)
        controlsRef.current.minDistance = Math.max(10, endDist.current * 0.65)
        controlsRef.current.maxDistance = Math.max(32, endDist.current * 1.7)
        controlsRef.current.update()
      }
      onSettled?.()
    }
  })

  return null
}

function Scene({ labels, messages, onSelectLabel }) {
  const [introDone, setIntroDone] = useState(false)
  const [heartExploding, setHeartExploding] = useState(false)
  const [heartGone, setHeartGone] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [viewSettled, setViewSettled] = useState(false)
  const [textBounds, setTextBounds] = useState(null)
  const spinSpeedRef = useRef(INTRO_SPIN_START)
  const controlsRef = useRef(null)

  const handleTextBounds = useCallback((bounds) => {
    setTextBounds(bounds)
  }, [])

  useEffect(() => {
    if (!introDone) return undefined
    setHeartExploding(true)
    setShowMessage(true)
    setViewSettled(false)
    return undefined
  }, [introDone])

  const handleIntroComplete = () => {
    const controls = controlsRef.current
    if (controls) {
      controls.target.set(0, 3.45, 0)
      controls.update()
    }
    setIntroDone(true)
  }

  const handleHeartExploded = () => {
    setHeartGone(true)
  }

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 32, 110]} />
      <ambientLight intensity={0.15} />
      <Stars radius={140} depth={80} count={14000} factor={2.4} saturation={0} fade speed={0.32} />

      <GalaxyIntro spinSpeedRef={spinSpeedRef} onComplete={handleIntroComplete} />
      <TextViewCamera
        active={showMessage}
        controlsRef={controlsRef}
        textBounds={textBounds}
        onSettled={() => setViewSettled(true)}
      />

      <MouseParallax strength={introDone && viewSettled ? 0.12 : 0}>
        <group>
          <GalaxyDisc spinSpeedRef={spinSpeedRef} />
          {!heartGone ? (
            <ParticleHeartOutline exploding={heartExploding} onExploded={handleHeartExploded} />
          ) : null}
          {!showMessage ? (
            <FloatingDecor labels={labels} onSelect={onSelectLabel} />
          ) : null}
          <pointLight position={[0, 0.2, 0]} color="#ffffff" intensity={1.8} distance={6} />
          <pointLight position={[0, 3.2, 0]} color="#ff7eb9" intensity={1.2} distance={8} />
        </group>
      </MouseParallax>

      {/* Ngoài parallax — chữ billboard theo camera, đọc rõ mọi góc */}
      <ParticleMessageText
        phrases={messages}
        active={showMessage}
        onBounds={handleTextBounds}
      />

      <OrbitControls
        ref={controlsRef}
        enabled={introDone && viewSettled}
        enablePan={false}
        minDistance={8}
        maxDistance={40}
        target={[0, 3.35, 0]}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI * 0.58}
        minPolarAngle={Math.PI * 0.12}
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
  keywords = [],
  messages = [],
  message = '',
}) {
  const [selected, setSelected] = useState(null)

  const labels = useMemo(() => {
    const fromKeywords = (Array.isArray(keywords) ? keywords : [])
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .slice(0, 6)
    if (fromKeywords.length) return fromKeywords
    return LOVE_LABELS
  }, [keywords])

  const phraseMessages = useMemo(() => {
    const fromList = (Array.isArray(messages) ? messages : [])
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .slice(0, 10)
    if (fromList.length) return fromList
    if (typeof message === 'string' && message.trim()) {
      return message
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10)
    }
    return ['I love you']
  }, [messages, message])

  const popupMessage = selected
    ? `“${selected}” — một góc ngân hà dành riêng cho bạn.`
    : 'Chạm chữ đang bay quanh ngân hà.'

  return (
    <div className={preview ? 'galaxy-screen galaxy-screen--preview' : 'galaxy-screen'}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 48, 4.8], fov: 42, near: 0.1, far: 160 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.05, 0)
        }}
      >
        <Suspense fallback={null}>
          <Scene labels={labels} messages={phraseMessages} onSelectLabel={setSelected} />
        </Suspense>
      </Canvas>

      <PopupCard
        open={Boolean(selected)}
        title={selected || ''}
        message={popupMessage}
        onClose={() => setSelected(null)}
      />

      {!preview ? (
        <p className="galaxy-hint">Kéo để xoay · chờ trái tim nổ ra lời nhắn</p>
      ) : null}
    </div>
  )
}

export default GalaxyOfLoveScreen
