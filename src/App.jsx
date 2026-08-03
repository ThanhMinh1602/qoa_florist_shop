import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './features/admin/layouts/AdminLayout'
import AdminManagePage from './features/admin/pages/AdminManagePage'
import CashbookPage from './features/admin/pages/CashbookPage'
import ChangePasswordPage from './features/admin/pages/ChangePasswordPage'
import CreateOrderPage from './features/admin/pages/CreateOrderPage'
import CreateQrPage from './features/admin/pages/CreateQrPage'
import DashboardPage from './features/admin/pages/DashboardPage'
import LoginPage from './features/admin/pages/LoginPage'
import ProductsPage from './features/admin/pages/ProductsPage'
import QrListPage from './features/admin/pages/QrListPage'
import SiteSettingsPage from './features/admin/pages/SiteSettingsPage'
import GreetingPage from './features/greeting/pages/GreetingPage'
import LandingPage from './features/landing/pages/LandingPage'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Khách: tạm chỉ mở home. QR thiệp vẫn giữ. */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/q/:uuid" element={<GreetingPage />} />

      <Route path="/custom" element={<Navigate to="/" replace />} />
      <Route path="/demo/*" element={<Navigate to="/" replace />} />
      <Route path="/shop/*" element={<Navigate to="/" replace />} />

      <Route path="/admin/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="orders/new" element={<CreateOrderPage />} />
          <Route path="qr/new" element={<CreateQrPage />} />
          <Route path="qr" element={<QrListPage />} />
          <Route path="manage" element={<AdminManagePage />} />
          <Route path="orders" element={<Navigate to="/admin/manage" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="cashbook" element={<CashbookPage />} />
          <Route path="settings" element={<SiteSettingsPage />} />
          <Route path="create" element={<Navigate to="/admin/qr/new" replace />} />
          <Route path="create/:topicId" element={<Navigate to="/admin/qr/new" replace />} />
          <Route path="cards" element={<Navigate to="/admin/qr" replace />} />
          <Route path="requests" element={<Navigate to="/admin/manage" replace />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
