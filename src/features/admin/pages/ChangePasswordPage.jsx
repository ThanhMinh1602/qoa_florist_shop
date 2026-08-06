import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'

function ChangePasswordPage() {
  const { username, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const result = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    })

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.message)
      return
    }

    setSuccess(result.message || 'Đổi mật khẩu thành công.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-outline-variant/25 bg-surface-container-lowest/80 px-4 py-3 backdrop-blur lg:px-8 lg:py-5">
        <h2 className="font-display text-xl text-primary lg:text-2xl">Đổi mật khẩu</h2>
        <p className="mt-1 text-xs text-on-surface-variant lg:mt-2 lg:max-w-2xl lg:text-sm">
          Tài khoản hiện tại: <span className="font-medium text-on-surface">{username}</span>
        </p>
      </header>

      <div className="flex flex-1 flex-col p-4 lg:p-8">
        <section className="glass-card mx-auto w-full max-w-lg rounded-2xl p-4 sm:p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-on-surface">
                Mật khẩu hiện tại
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="input-glass w-full !py-3 text-base sm:text-sm"
                autoComplete="current-password"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-on-surface">Mật khẩu mới</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="input-glass w-full !py-3 text-base sm:text-sm"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <p className="mt-1.5 text-xs text-on-surface-variant">Tối thiểu 6 ký tự.</p>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-on-surface">
                Xác nhận mật khẩu mới
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="input-glass w-full !py-3 text-base sm:text-sm"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            {error ? (
              <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container" role="alert">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full !py-3.5 text-[11px] disabled:opacity-60 sm:text-xs"
            >
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default ChangePasswordPage
