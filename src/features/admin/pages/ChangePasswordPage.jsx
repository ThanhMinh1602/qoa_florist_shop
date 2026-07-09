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
      <header className="border-b border-rose-100 bg-white/80 px-6 py-5 backdrop-blur md:px-8">
        <h2 className="text-2xl font-semibold text-slate-900">Đổi mật khẩu</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Tài khoản hiện tại: <span className="font-medium text-slate-700">{username}</span>
        </p>
      </header>

      <div className="flex flex-1 flex-col p-6 md:p-8">
        <section className="mx-auto w-full max-w-lg rounded-2xl border border-rose-100 bg-white p-6 shadow-sm shadow-rose-50">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Mật khẩu hiện tại
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-xl border border-rose-100 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                autoComplete="current-password"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu mới</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-xl border border-rose-100 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <p className="mt-1.5 text-xs text-slate-500">Tối thiểu 6 ký tự.</p>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Xác nhận mật khẩu mới
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-rose-100 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
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
              className="w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
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
