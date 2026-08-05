import { motion } from 'framer-motion'
import { easeOut, fadeUp, stagger, viewportOnce } from '../../lib/motion'

export function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: easeOut, delay },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, className, faster = false }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={faster ? { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } } : stagger}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  )
}
