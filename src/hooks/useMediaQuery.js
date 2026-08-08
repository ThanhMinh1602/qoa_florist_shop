import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = (event) => setMatches(event.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

export function useIsMdUp() {
  return useMediaQuery('(min-width: 768px)')
}

export function useIsLgUp() {
  return useMediaQuery('(min-width: 1024px)')
}

/** mobile < 768 | tablet 768–1023 | desktop ≥ 1024 */
export function useDeviceLayout() {
  const isMdUp = useIsMdUp()
  const isLgUp = useIsLgUp()
  if (isLgUp) return 'desktop'
  if (isMdUp) return 'tablet'
  return 'mobile'
}

