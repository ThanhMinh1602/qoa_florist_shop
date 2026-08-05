import { motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { adminPageTransition, shopPageTransition } from '../../lib/motion'

function AnimatedOutlet({ variant = 'shop' }) {
  const location = useLocation()
  const outlet = useOutlet()
  const motionProps = variant === 'admin' ? adminPageTransition : shopPageTransition

  return (
    <motion.div key={location.pathname} {...motionProps}>
      {outlet}
    </motion.div>
  )
}

export default AnimatedOutlet
