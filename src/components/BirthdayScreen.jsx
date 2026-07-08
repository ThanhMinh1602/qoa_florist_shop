import { confettiAnim, happyBirthdayAnim } from '../assets'
import LottiePlayer from './LottiePlayer'
import './BirthdayScreen.css'

const RECIPIENT_NAME = 'Bạn Yêu'
const BIRTHDAY_MESSAGE =
  'Chúc bạn một ngày sinh nhật thật rực rỡ, ngập tràn yêu thương và những điều tốt đẹp nhất. Mong mỗi cánh hoa hôm nay đều mang đến cho bạn niềm vui bất tận!'

function BirthdayScreen() {
  return (
    <div className="birthday-screen">
      <div className="birthday-screen__bg" aria-hidden="true">
        <span className="birthday-screen__orb birthday-screen__orb--1" />
        <span className="birthday-screen__orb birthday-screen__orb--2" />
        <span className="birthday-screen__orb birthday-screen__orb--3" />
      </div>

      <div className="birthday-screen__confetti" aria-hidden="true">
        <LottiePlayer
          animationData={confettiAnim}
          className="birthday-screen__confetti-lottie"
          loop
          ariaLabel="Confetti animation"
        />
      </div>

      <main className="birthday-screen__content">
        <header className="birthday-screen__brand">
          <span className="birthday-screen__brand-icon" aria-hidden="true">
            ✿
          </span>
          <p className="birthday-screen__brand-name">QOA Florist</p>
          <span className="birthday-screen__brand-icon" aria-hidden="true">
            ✿
          </span>
        </header>

        <div className="birthday-screen__hero">
          <LottiePlayer
            animationData={happyBirthdayAnim}
            className="birthday-screen__hero-lottie"
            loop
            ariaLabel="Happy birthday animation"
          />
        </div>

        <section className="birthday-screen__message">
          <p className="birthday-screen__subtitle">Gửi gắm yêu thương</p>
          <h1 className="birthday-screen__title">Chúc Mừng Sinh Nhật</h1>
          <p className="birthday-screen__name">{RECIPIENT_NAME}</p>
          <p className="birthday-screen__text">{BIRTHDAY_MESSAGE}</p>
        </section>

        <footer className="birthday-screen__footer">
          <span aria-hidden="true">🎂</span>
          <span aria-hidden="true">🌸</span>
          <span aria-hidden="true">🎁</span>
        </footer>
      </main>
    </div>
  )
}

export default BirthdayScreen
