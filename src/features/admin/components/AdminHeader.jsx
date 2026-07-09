import NotificationBell from './NotificationBell'

function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-end border-b border-rose-100 bg-white/90 px-6 py-3 backdrop-blur">
      <NotificationBell />
    </header>
  )
}

export default AdminHeader
