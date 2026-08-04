import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useAuth } from '../../../context/AuthContext'

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
      <div className="mist-bg relative flex min-h-screen items-center justify-center overflow-hidden">
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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] font-body">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface-bright via-background to-surface-dim opacity-80" />
      <div className="animate-blob absolute top-[-10%] left-[-10%] z-0 h-[614px] w-[614px] rounded-full bg-primary-fixed-dim/30 mix-blend-multiply blur-[80px] filter" />
      <div className="animate-blob-slow absolute top-[20%] right-[-20%] z-0 h-[716px] w-[716px] rounded-full bg-surface-variant/50 mix-blend-multiply blur-[100px] filter" />
      <div
        className="animate-blob absolute bottom-[-15%] left-[10%] z-0 h-[512px] w-[512px] rounded-full bg-inverse-primary/20 mix-blend-multiply blur-[60px] filter"
        style={{ animationDelay: '2s' }}
      />

      <main className="relative z-10 w-full max-w-[440px]">
        <div className="glass-card flex flex-col items-center p-8 md:p-12">
          <div className="mb-10 w-full text-center">
            <h1 className="font-display mb-2 text-[2.5rem] leading-tight tracking-[-0.02em] text-primary md:text-[3rem]">
              QOA Florist
            </h1>
            <h2 className="font-display text-[1.75rem] leading-snug text-on-surface md:text-[2rem]">
              Đăng nhập Admin
            </h2>
          </div>

          <form className="flex w-full flex-col space-y-6" onSubmit={handleSubmit}>
            <div className="relative flex flex-col gap-2">
              <label className="label-caps pl-1 text-on-surface-variant" htmlFor="username">
                Tên đăng nhập
              </label>
              <div className="group relative">
                <MaterialIcon
                  name="person"
                  className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-[1.25rem] text-primary/50 transition-colors group-focus-within:text-primary"
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="input-glass with-leading-icon"
                  placeholder="Nhập tên tài khoản"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="relative flex flex-col gap-2">
              <label className="label-caps pl-1 text-on-surface-variant" htmlFor="password">
                Mật khẩu
              </label>
              <div className="group relative">
                <MaterialIcon
                  name="lock"
                  className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-[1.25rem] text-primary/50 transition-colors group-focus-within:text-primary"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-glass with-leading-icon with-trailing-icon"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-primary/50 transition-colors hover:bg-primary/5 hover:text-primary"
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
              <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container" role="alert">
                {error}
              </p>
            ) : null}

            <div className="w-full pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4">
                <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                {!isSubmitting ? <MaterialIcon name="arrow_forward" className="text-[18px]" /> : null}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
