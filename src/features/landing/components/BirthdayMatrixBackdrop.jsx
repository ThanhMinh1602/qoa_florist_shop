import { useEffect, useRef } from 'react'
import '../../greeting/BirthdayScreen.css'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomGlyph() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}

function initMatrixGrid(cols, rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => randomGlyph()),
  )
}

/**
 * Chỉ nền matrix mưa ký tự hồng của thiệp sinh nhật — không particle chữ.
 */
function BirthdayMatrixBackdrop() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return undefined

    const ctx = canvas.getContext('2d')
    let dpr = 1
    let width = 0
    let height = 0
    let matrixGrid = []
    let matrixHeads = []
    let matrixSpeeds = []
    let matrixFlashes = []
    let matrixCols = 0
    let matrixRows = 0
    let matrixFontSize = 14
    let matrixCellW = 0
    let matrixCellH = 0
    let rafId = 0
    let running = true

    function getMatrixFontSize(viewW, viewH) {
      const minDim = Math.min(viewW, viewH)
      if (minDim < 480) return Math.max(11, Math.min(14, Math.floor(viewW / 52)))
      if (minDim < 900) return Math.max(12, Math.min(15, Math.floor(viewW / 62)))
      return Math.max(13, Math.min(17, Math.floor(viewW / 78)))
    }

    function initMatrix() {
      matrixFontSize = getMatrixFontSize(width, height)
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
          matrixGrid[newHead][c] = randomGlyph()
          for (let t = 1; t < trailLen; t++) {
            const row = (newHead - t + matrixRows) % matrixRows
            if (Math.random() < 0.45) {
              matrixGrid[row][c] = randomGlyph()
            }
          }
        }

        if (Math.random() < 0.012) {
          const row = Math.floor(Math.random() * matrixRows)
          matrixGrid[row][c] = randomGlyph()
        }

        if (Math.random() < 0.0015) {
          matrixFlashes[c] = 1
        }
        matrixFlashes[c] *= 0.88
      }
    }

    function drawMatrix() {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)

      ctx.font = `${matrixFontSize}px "Courier New", Courier, monospace`
      ctx.textBaseline = 'top'
      ctx.textAlign = 'center'

      const trailLen = 16

      for (let r = 0; r < matrixRows; r++) {
        for (let c = 0; c < matrixCols; c++) {
          const head = matrixHeads[c]
          const dist = r - head
          const x = c * matrixCellW + matrixCellW / 2
          const y = r * matrixCellH

          let alpha = 0.18

          if (Math.abs(dist) < 0.55) {
            alpha = 0.85
          } else if (dist < 0 && dist > -trailLen) {
            alpha = 0.22 + 0.5 * (1 + dist / trailLen)
          } else if (dist > 0 && dist < 8) {
            alpha = 0.16 + 0.22 * (1 - dist / 8)
          }

          if (Math.random() < 0.0004) {
            alpha = 0.55
          }

          if (matrixFlashes[c] > 0.08) {
            alpha = Math.min(0.95, alpha + matrixFlashes[c] * 0.25)
          }

          ctx.fillStyle =
            alpha > 0.4
              ? `rgba(255, 160, 205, ${alpha})`
              : `rgba(255, 210, 225, ${alpha})`
          ctx.fillText(matrixGrid[r][c], x, y)
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.floor(container.clientWidth))
      height = Math.max(1, Math.floor(container.clientHeight))

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initMatrix()
    }

    function tick() {
      if (!running) return
      updateMatrix()
      drawMatrix()
      rafId = window.requestAnimationFrame(tick)
    }

    resize()
    tick()

    const ro = new ResizeObserver(() => resize())
    ro.observe(container)
    window.addEventListener('resize', resize)

    return () => {
      running = false
      window.cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="particle-screen particle-screen--preview pointer-events-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="particle-screen__canvas particle-screen__canvas--bg" />
    </div>
  )
}

export default BirthdayMatrixBackdrop
