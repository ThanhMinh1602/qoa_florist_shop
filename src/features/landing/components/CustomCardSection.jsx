import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { Reveal } from '../../../components/motion/Reveal'
import { LANDING_COPY_DEFAULTS, splitLines } from '../../../constants/landingCopy'
import { viewportOnce } from '../../../lib/motion'
import BirthdayMatrixBackdrop from './BirthdayMatrixBackdrop'

function CustomCardSection({ copy = LANDING_COPY_DEFAULTS }) {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(false)
  const reduceMotion = useReducedMotion()
  const headingLines = splitLines(copy.customCardHeading)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setActive(true)
      },
      { root: null, rootMargin: '120px 0px', threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      id="custom-card"
      ref={sectionRef}
      className="scroll-mt-14 bg-transparent py-10 md:scroll-mt-32 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-5 sm:mb-8">
          <h2 className="font-display text-xl text-primary sm:text-3xl md:text-[2rem]">
            {copy.customCardTitle}
          </h2>
        </Reveal>

        <Reveal className="galaxy-feature relative isolate overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
            <div className="absolute inset-0 bg-black">
              {active ? <BirthdayMatrixBackdrop /> : null}
            </div>

            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_40%,transparent_25%,rgba(0,0,0,0.45)_100%)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 to-transparent sm:h-1/3"
              aria-hidden="true"
            />

            <motion.div
              className="galaxy-feature-panel absolute inset-x-4 bottom-4 z-10 sm:inset-x-auto sm:bottom-8 sm:left-8 sm:max-w-[22rem] md:bottom-10 md:left-10 md:max-w-[24rem]"
              initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={viewportOnce}
              transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.8 }}
            >
              <p className="label-caps mb-3 text-[10px] tracking-[0.18em] text-white/65">
                {copy.customCardEyebrow}
              </p>
              <p className="font-display text-[1.35rem] leading-snug text-white sm:text-[1.6rem]">
                {headingLines.map((line, i) => (
                  <span key={`${line}-${i}`}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/72 sm:text-sm">
                {copy.customCardBody}
              </p>

              <motion.div
                className="mt-5"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{
                  type: 'spring',
                  stiffness: 460,
                  damping: 16,
                  delay: 0.12,
                }}
              >
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          delay: 0.7,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: 'mirror',
                          ease: [0.45, 0, 0.55, 1],
                        }
                  }
                >
                  <Link to="/shop/card" className="btn-galaxy-cta pointer-events-auto">
                    {copy.customCardCta}
                    <MaterialIcon name="arrow_forward" className="btn-galaxy-cta__icon text-[1.05em]" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default CustomCardSection
