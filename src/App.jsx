import { Navigate, Route, Routes } from 'react-router-dom'
import BirthdayScreen from './components/BirthdayScreen'
import AdminLayout from './features/admin/layouts/AdminLayout'
import AdminManagePage from './features/admin/pages/AdminManagePage'
import ChangePasswordPage from './features/admin/pages/ChangePasswordPage'
import CreateOrderPage from './features/admin/pages/CreateOrderPage'
import LoginPage from './features/admin/pages/LoginPage'
import CustomCardPage from './pages/CustomCardPage'
import GreetingPage from './pages/GreetingPage'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/q/:uuid" element={<GreetingPage />} />
      <Route path="/custom" element={<CustomCardPage />} />
      <Route path="/demo" element={<BirthdayScreen />} />

      <Route path="/admin/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="orders/new" replace />} />
          <Route path="orders/new" element={<CreateOrderPage />} />
          <Route path="manage" element={<AdminManagePage />} />
          <Route path="create" element={<Navigate to="/admin/orders/new" replace />} />
          <Route path="create/:topicId" element={<Navigate to="/admin/orders/new" replace />} />
          <Route path="cards" element={<Navigate to="/admin/manage" replace />} />
          <Route path="requests" element={<Navigate to="/admin/manage" replace />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  )
}

export default App
