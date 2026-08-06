import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import BrandLogo from '../../../components/common/BrandLogo'
import { useAuth } from '../../../context/AuthContext'
import { easeOut } from '../../../lib/motion'

function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectPath = location.state?.from?.pathname || '/admin'

  if (isLoading) {
    return (
      <div className="mist-bg relative flex min-h-dvh items-center justify-center overflow-hidden px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <p className="relative text-sm text-on-surface-variant">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = await login(username.trim(), password)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.message)
      return
    }

    navigate(redirectPath, { replace: true })
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] font-body sm:px-5">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface-bright via-background to-surface-dim opacity-80" />
      <div className="pointer-events-none absolute top-[-20%] left-[-30%] z-0 h-72 w-72 rounded-full bg-primary-fixed-dim/25 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      <div className="pointer-events-none absolute right-[-25%] bottom-[-15%] z-0 h-64 w-64 rounded-full bg-surface-variant/40 blur-3xl sm:h-96 sm:w-96" />

      <motion.main
        className="relative z-10 w-full max-w-[400px]"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        <div className="glass-card flex flex-col items-center rounded-2xl p-5 sm:rounded-[1.75rem] sm:p-8 md:p-10">
          <div className="mb-6 flex w-full flex-col items-center text-center sm:mb-8">
            <BrandLogo size="sm" center className="mb-3 sm:mb-4" />
            <h1 className="font-display text-2xl leading-tight tracking-[-0.02em] text-primary sm:text-[2.5rem]">
              QOA Florist
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant sm:mt-2 sm:text-base">
              Đăng nhập quản trị
            </p>
          </div>

          <form className="flex w-full flex-col space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <div className="relative flex flex-col gap-1.5">
              <label className="label-caps pl-1 text-[10px] text-on-surface-variant sm:text-xs" htmlFor="username">
                Tên đăng nhập
              </label>
              <div className="group relative">
                <MaterialIcon
                  name="person"
                  className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-[1.2rem] text-primary/50 transition-colors group-focus-within:text-primary"
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="input-glass with-leading-icon !py-3 text-base sm:text-sm"
                  placeholder="Nhập tên tài khoản"
                  autoComplete="username"
                  required
                  enterKeyHint="next"
                />
              </div>
            </div>

            <div className="relative flex flex-col gap-1.5">
              <label className="label-caps pl-1 text-[10px] text-on-surface-variant sm:text-xs" htmlFor="password">
                Mật khẩu
              </label>
              <div className="group relative">
                <MaterialIcon
                  name="lock"
                  className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-[1.2rem] text-primary/50 transition-colors group-focus-within:text-primary"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-glass with-leading-icon with-trailing-icon !py-3 text-base sm:text-sm"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                  enterKeyHint="go"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-2.5 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-primary/50 transition-colors hover:bg-primary/5 hover:text-primary"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  tabIndex={-1}
                >
                  <MaterialIcon
                    name={showPassword ? 'visibility_off' : 'visibility'}
                    className="text-[1.25rem]"
                  />
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-xl bg-error-container px-3.5 py-2.5 text-sm text-on-error-container" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary mt-1 w-full !py-3.5 text-[11px] sm:text-xs"
            >
              <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
              {!isSubmitting ? <MaterialIcon name="arrow_forward" className="text-[18px]" /> : null}
            </button>
          </form>
        </div>
      </motion.main>
    </div>
  )
}

export default LoginPage
