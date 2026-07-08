import { useEffect, useRef, useState } from 'react'
import './ParticleBirthdayScreen.css'

const TEXT_SEQUENCE = [
  '3',
  '2',
  '1',
  'HAPPY BIRTHDAY',
  'NHẬT NY',
  'HAPPY 80+',
  '29-02-2004',
  'I LOVE YOU',
]

const PINK = '#FF69B4'
const PINK_GLOW = '#FFB6C1'

const TIMING = {
  assemble: 1400,
  hold: 1750,
  dissolve: 900,
  countdownHold: 900,
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}

function initMatrixGrid(cols, rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => randomLetter()),
  )
}

class Particle {
  constructor(targetX, targetY, width, height) {
    this.targetX = targetX
    this.targetY = targetY
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.vx = 0
    this.vy = 0
    this.size = Math.random() * 1.8 + 1.4
    this.arrived = false
  }

  updateAssemble(t) {
    const ease = 0.07 + t * 0.04
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    this.x += dx * ease
    this.y += dy * ease
    if (Math.hypot(dx, dy) < 1.2) {
      this.x = this.targetX
      this.y = this.targetY
      this.arrived = true
    }
  }

  updateDissolve() {
    if (this.vx === 0 && this.vy === 0) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 6 + 3
      this.vx = Math.cos(angle) * speed
      this.vy = Math.sin(angle) * speed
    }
    this.x += this.vx
    this.y += this.vy
    this.vx *= 1.02
    this.vy *= 1.02
  }

  draw(ctx) {
    ctx.fillStyle = PINK
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function ParticleBirthdayScreen() {
  const bgCanvasRef = useRef(null)
  const fgCanvasRef = useRef(null)
  const audioRef = useRef(null)
  const startRef = useRef(() => {})
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current
    const fgCanvas = fgCanvasRef.current
    if (!bgCanvas || !fgCanvas) return undefined

    const bgCtx = bgCanvas.getContext('2d')
    const fgCtx = fgCanvas.getContext('2d')
    const offCanvas = document.createElement('canvas')
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })

    let dpr = 1
    let width = 0
    let height = 0
    let isStarted = false
    let sequenceIndex = 0
    let phase = 'idle'
    let phaseStart = 0
    let particles = []
    let matrixGrid = []
    let matrixHeads = []
    let matrixSpeeds = []
    let matrixFlashes = []
    let matrixCols = 0
    let matrixRows = 0
    let matrixFontSize = 14
    let matrixCellW = 0
    let matrixCellH = 0
    let rafId = null

    function getViewportSize() {
      const vv = window.visualViewport
      return {
        width: Math.floor(vv?.width ?? window.innerWidth),
        height: Math.floor(vv?.height ?? window.innerHeight),
      }
    }

    function getMatrixFontSize(viewW) {
      const minDim = Math.min(viewW, getViewportSize().height)
      if (minDim < 480) return Math.max(11, Math.min(14, Math.floor(viewW / 52)))
      if (minDim < 900) return Math.max(12, Math.min(15, Math.floor(viewW / 62)))
      return Math.max(13, Math.min(17, Math.floor(viewW / 78)))
    }

    function getParticleSampleStep(viewW) {
      if (viewW < 480) return 5
      if (viewW < 900) return 4
      return 3
    }

    function getMaxTextSize() {
      const minDim = Math.min(width, height)
      if (minDim < 480) return 44
      if (minDim < 900) return 58
      return 72
    }

    function getTextLines(text) {
      const fontFamily = '"Arial Black", Impact, "Helvetica Neue", sans-serif'
      const testSize = Math.min(width * 0.13, height * 0.11, getMaxTextSize())
      offCtx.font = `900 ${testSize}px ${fontFamily}`

      if (!text.includes(' ')) return [text]
      if (offCtx.measureText(text).width <= width * 0.9) return [text]

      const words = text.split(' ')
      if (words.length === 2) return words

      const mid = Math.ceil(words.length / 2)
      return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
    }

    function getFontSize(lines) {
      let size = Math.min(width * 0.13, height * 0.11, getMaxTextSize())
      const fontFamily = '"Arial Black", Impact, "Helvetica Neue", sans-serif'

      for (let attempt = 0; attempt < 40; attempt++) {
        offCtx.font = `900 ${size}px ${fontFamily}`
        let fits = true
        for (const line of lines) {
          if (offCtx.measureText(line).width > width * 0.88) {
            fits = false
            break
          }
        }
        const totalH = lines.length * size * 1.2
        if (totalH > height * 0.5) fits = false
        if (fits) return size
        size *= 0.92
      }
      return Math.max(20, size)
    }

    function sampleTextPixels(text) {
      const lines = getTextLines(text)
      const fontSize = getFontSize(lines)
      const fontFamily = '"Arial Black", Impact, "Helvetica Neue", sans-serif'
      const lineHeight = fontSize * 1.2
      const totalH = lines.length * lineHeight

      offCanvas.width = width
      offCanvas.height = height
      offCtx.clearRect(0, 0, width, height)
      offCtx.fillStyle = '#ffffff'
      offCtx.font = `900 ${fontSize}px ${fontFamily}`
      offCtx.textAlign = 'center'
      offCtx.textBaseline = 'middle'

      const startY = height / 2 - totalH / 2 + lineHeight / 2
      for (let i = 0; i < lines.length; i++) {
        offCtx.fillText(lines[i], width / 2, startY + i * lineHeight)
      }

      const imageData = offCtx.getImageData(0, 0, width, height)
      const { data } = imageData
      const step = getParticleSampleStep(width)
      const points = []

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4
          if (data[idx + 3] > 128) points.push({ x, y })
        }
      }

      return points
    }

    function createParticles(points, fromRandom) {
      return points.map((p) => {
        const particle = new Particle(p.x, p.y, width, height)
        if (!fromRandom) {
          particle.x = p.x
          particle.y = p.y
          particle.arrived = true
        }
        return particle
      })
    }

    function rebuildParticlesForCurrentText(fromRandom) {
      const text = TEXT_SEQUENCE[sequenceIndex]
      const points = sampleTextPixels(text)
      particles = createParticles(points, fromRandom)
    }

    function startSequence() {
      sequenceIndex = 0
      phase = 'assembling'
      phaseStart = performance.now()
      rebuildParticlesForCurrentText(true)
    }

    function advanceSequence() {
      sequenceIndex = (sequenceIndex + 1) % TEXT_SEQUENCE.length
      phase = 'assembling'
      phaseStart = performance.now()
      rebuildParticlesForCurrentText(true)
    }

    function getHoldDuration() {
      return sequenceIndex <= 2 ? TIMING.countdownHold : TIMING.hold
    }

    function initMatrix() {
      matrixFontSize = getMatrixFontSize(width)
      matrixCellW = matrixFontSize * 1.1
      matrixCellH = matrixFontSize * 1.55
      matrixCols = Math.ceil(width / matrixCellW) + 1
      matrixRows = Math.ceil(height / matrixCellH) + 1

      matrixGrid = initMatrixGrid(matrixCols, matrixRows)
      matrixHeads = Array.from({ length: matrixCols }, () => Math.random() * matrixRows)
      matrixSpeeds = Array.from({ length: matrixCols }, () => Math.random() * 0.22 + 0.1)
      matrixFlashes = Array.from({ length: matrixCols }, () => 0)
    }

    function updateMatrix() {
      const trailLen = 16

      for (let c = 0; c < matrixCols; c++) {
        const prevHead = Math.floor(matrixHeads[c])
        matrixHeads[c] += matrixSpeeds[c]

        if (matrixHeads[c] >= matrixRows) {
          matrixHeads[c] -= matrixRows
        }

        const newHead = Math.floor(matrixHeads[c])
        if (newHead !== prevHead) {
          matrixGrid[newHead][c] = randomLetter()
          for (let t = 1; t < trailLen; t++) {
            const row = (newHead - t + matrixRows) % matrixRows
            if (Math.random() < 0.45) {
              matrixGrid[row][c] = randomLetter()
            }
          }
        }

        if (Math.random() < 0.012) {
          const row = Math.floor(Math.random() * matrixRows)
          matrixGrid[row][c] = randomLetter()
        }

        if (Math.random() < 0.0015) {
          matrixFlashes[c] = 1
        }
        matrixFlashes[c] *= 0.88
      }
    }

    function drawMatrix() {
      bgCtx.fillStyle = '#000000'
      bgCtx.fillRect(0, 0, width, height)

      bgCtx.font = `${matrixFontSize}px "Courier New", Courier, monospace`
      bgCtx.textBaseline = 'top'
      bgCtx.textAlign = 'center'

      const trailLen = 16

      for (let r = 0; r < matrixRows; r++) {
        for (let c = 0; c < matrixCols; c++) {
          const head = matrixHeads[c]
          const dist = r - head
          const x = c * matrixCellW + matrixCellW / 2
          const y = r * matrixCellH

          let alpha = 0.06

          if (Math.abs(dist) < 0.55) {
            alpha = 0.32
          } else if (dist < 0 && dist > -trailLen) {
            alpha = 0.07 + 0.2 * (1 + dist / trailLen)
          } else if (dist > 0 && dist < 8) {
            alpha = 0.06 + 0.08 * (1 - dist / 8)
          }

          if (Math.random() < 0.0004) {
            alpha = 0.22
          }

          if (matrixFlashes[c] > 0.08) {
            alpha = Math.min(0.38, alpha + matrixFlashes[c] * 0.12)
          }

          const pinkAlpha = alpha > 0.2 ? alpha : alpha * 0.9
          bgCtx.fillStyle =
            alpha > 0.2
              ? `rgba(255, 105, 180, ${pinkAlpha})`
              : `rgba(255, 182, 193, ${pinkAlpha})`
          bgCtx.fillText(matrixGrid[r][c], x, y)
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const viewport = getViewportSize()
      width = viewport.width
      height = viewport.height

      for (const canvas of [bgCanvas, fgCanvas]) {
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }

      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      bgCtx.fillStyle = '#000000'
      bgCtx.fillRect(0, 0, width, height)

      initMatrix()
      if (isStarted && phase !== 'idle') {
        rebuildParticlesForCurrentText(phase === 'assembling')
      }
    }

    function updatePhase(now) {
      const elapsed = now - phaseStart

      if (phase === 'assembling') {
        const t = Math.min(1, elapsed / TIMING.assemble)
        let allArrived = true
        for (const p of particles) {
          p.updateAssemble(t)
          if (!p.arrived) allArrived = false
        }
        if (allArrived || elapsed >= TIMING.assemble) {
          phase = 'holding'
          phaseStart = now
          for (const p of particles) {
            p.x = p.targetX
            p.y = p.targetY
            p.arrived = true
          }
        }
      } else if (phase === 'holding') {
        if (elapsed >= getHoldDuration()) {
          phase = 'dissolving'
          phaseStart = now
          for (const p of particles) {
            p.vx = 0
            p.vy = 0
          }
        }
      } else if (phase === 'dissolving') {
        for (const p of particles) {
          p.updateDissolve()
        }
        if (elapsed >= TIMING.dissolve) {
          advanceSequence()
        }
      }
    }

    function drawParticles() {
      fgCtx.clearRect(0, 0, width, height)
      if (!isStarted || phase === 'idle' || particles.length === 0) return

      fgCtx.save()
      fgCtx.shadowColor = PINK_GLOW
      fgCtx.shadowBlur = phase === 'holding' ? 6 : 3
      for (const p of particles) {
        p.draw(fgCtx)
      }
      fgCtx.restore()
    }

    function loop(now) {
      updateMatrix()
      drawMatrix()
      if (isStarted) updatePhase(now)
      drawParticles()
      rafId = requestAnimationFrame(loop)
    }

    function handleStart() {
      if (isStarted) return
      isStarted = true
      setStarted(true)
      audioRef.current?.play().catch(() => {})
      startSequence()
    }

    startRef.current = handleStart

    const onViewportChange = () => resize()
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('orientationchange', onViewportChange)
    window.visualViewport?.addEventListener('resize', onViewportChange)
    window.visualViewport?.addEventListener('scroll', onViewportChange)

    resize()
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('orientationchange', onViewportChange)
      window.visualViewport?.removeEventListener('resize', onViewportChange)
      window.visualViewport?.removeEventListener('scroll', onViewportChange)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  function handleOverlayClick() {
    startRef.current()
  }

  return (
    <div className="particle-screen">
      {!started && (
        <button
          type="button"
          className="particle-screen__overlay"
          onClick={handleOverlayClick}
        >
          Nhấn bất kỳ đâu để bắt đầu
        </button>
      )}

      <canvas
        ref={bgCanvasRef}
        className="particle-screen__canvas particle-screen__canvas--bg"
        aria-hidden="true"
      />
      <canvas
        ref={fgCanvasRef}
        className="particle-screen__canvas particle-screen__canvas--fg"
        aria-hidden="true"
      />

      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/background.mp3" type="audio/mpeg" />
      </audio>
    </div>
  )
}

export default ParticleBirthdayScreen
