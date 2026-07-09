import { Outlet } from 'react-router-dom'
import { NotificationsProvider } from '../../../context/NotificationsContext'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'

function AdminLayout() {
  return (
    <NotificationsProvider>
      <div className="flex h-dvh overflow-hidden bg-rose-50/40">
        <AdminSidebar />
        <div className="flex min-h-0 flex-1 flex-col">
          <AdminHeader />
          <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  )
}

export default AdminLayout
