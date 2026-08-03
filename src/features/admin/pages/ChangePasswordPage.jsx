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
      <header className="border-b border-outline-variant/25 bg-surface-container-lowest/80 px-4 py-4 backdrop-blur md:px-8 md:py-5">
        <h2 className="text-2xl font-semibold text-on-surface">Đổi mật khẩu</h2>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Tài khoản hiện tại: <span className="font-medium text-on-surface">{username}</span>
        </p>
      </header>

      <div className="flex flex-1 flex-col p-4 md:p-8">
        <section className="mx-auto w-full max-w-lg rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm shadow-[0_12px_40px_rgba(74,48,32,0.05)]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-on-surface">
                Mật khẩu hiện tại
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
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
                className="w-full rounded-xl border border-outline-variant/25 px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
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
                className="w-full rounded-xl border border-outline-variant/25 px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
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
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
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
