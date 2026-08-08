import { useEffect, useRef, useState } from 'react'

/**
 * Ảnh shop với shimmer khi đang tải + fade-in khi xong.
 * Parent cần `position: relative` (shimmer dùng absolute inset-0).
 */
function ShopImage({
  className = '',
  shimmerClassName = '',
  onLoad,
  onError,
  alt = '',
  ...props
}) {
  const imgRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [props.src])

  return (
    <>
      <span
        aria-hidden="true"
        className={[
          'img-shimmer pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300',
          shimmerClassName,
          loaded ? 'opacity-0' : 'opacity-100',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <img
        ref={imgRef}
        alt={alt}
        {...props}
        className={[
          className,
          'transition-opacity duration-500 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
        ]
          .filter(Boolean)
          .join(' ')}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          setLoaded(true)
          onError?.(event)
        }}
      />
    </>
  )
}

export default ShopImage
