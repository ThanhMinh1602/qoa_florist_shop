import LottieModule from 'lottie-react'

const Lottie = LottieModule.default ?? LottieModule

function LottiePlayer({
  animationData,
  className = '',
  loop = true,
  autoplay = true,
  ariaLabel = 'Animation',
}) {
  return (
    <Lottie
      animationData={animationData}
      className={className}
      loop={loop}
      autoplay={autoplay}
      aria-label={ariaLabel}
    />
  )
}

export default LottiePlayer
