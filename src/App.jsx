import { Navigate, Route, Routes } from 'react-router-dom'
import BirthdayScreen from './components/BirthdayScreen'
import AdminLayout from './features/admin/layouts/AdminLayout'
import ChangePasswordPage from './features/admin/pages/ChangePasswordPage'
import CreateCardPage from './features/admin/pages/CreateCardPage'
import LoginPage from './features/admin/pages/LoginPage'
import ManageCardsPage from './features/admin/pages/ManageCardsPage'
import SelectTopicPage from './features/admin/pages/SelectTopicPage'
import GreetingPage from './pages/GreetingPage'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public: trang lời chúc quét từ QR */}
      <Route path="/q/:uuid" element={<GreetingPage />} />

      {/* Demo fullscreen: hiệu ứng particle 3D gốc */}
      <Route path="/demo" element={<BirthdayScreen />} />

      {/* Admin */}
      <Route path="/admin/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="create" replace />} />
          <Route path="create" element={<SelectTopicPage />} />
          <Route path="create/:topicId" element={<CreateCardPage />} />
          <Route path="manage" element={<ManageCardsPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  )
}

export default App
