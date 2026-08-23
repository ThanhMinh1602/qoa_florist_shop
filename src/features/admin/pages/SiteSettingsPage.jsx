import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { SETTINGS_MENU_ITEMS } from '../components/settings/settingsHelpers'

function SiteSettingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // OAuth callback API vẫn redirect về /admin/settings — chuyển sang trang Google Calendar.
  useEffect(() => {
    const google = searchParams.get('google')
    if (!google) return
    const next = new URLSearchParams()
    next.set('google', google)
    const message = searchParams.get('message')
    if (message) next.set('message', message)
    navigate(`/admin/settings/google-calendar?${next.toString()}`, { replace: true })
  }, [navigate, searchParams])

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-outline-variant/25 bg-surface-container-lowest/80 px-4 py-3 backdrop-blur lg:px-8 lg:py-5">
        <h2 className="font-display text-lg text-primary lg:text-3xl">Cài đặt web</h2>
        <p className="mt-0.5 text-xs text-on-surface-variant lg:mt-1 lg:text-sm">
          Chọn mục để chỉnh — mỗi phần mở trên màn hình riêng.
        </p>
      </header>

      <div className="flex flex-1 flex-col p-4 lg:p-8">
        <nav className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3 sm:gap-4">
          {SETTINGS_MENU_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={`/admin/settings/${item.to}`}
              className="glass-card group flex min-w-0 flex-col gap-3 rounded-2xl bg-white/90 p-4 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                <MaterialIcon name={item.icon} className="text-2xl" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface sm:text-base">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
                  {item.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary/80">
                Mở
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default SiteSettingsPage
