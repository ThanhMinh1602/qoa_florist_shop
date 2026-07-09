import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

function AdminLayout() {
  return (
    <div className="flex min-h-dvh bg-rose-50/40">
      <AdminSidebar />
      <main className="flex min-h-dvh flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
