import NotificationBell from './NotificationBell'

function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-end border-b border-white/55 bg-surface-container-lowest/70 px-6 py-3 backdrop-blur-xl">
      <NotificationBell />
    </header>
  )
}

export default AdminHeader
