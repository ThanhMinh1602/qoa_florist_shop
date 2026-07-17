import { Navigate, Route, Routes } from 'react-router-dom'
import BirthdayScreen from './components/BirthdayScreen'
import GalaxyOfLoveScreen from './components/GalaxyOfLoveScreen'
import AdminLayout from './features/admin/layouts/AdminLayout'
import AdminManagePage from './features/admin/pages/AdminManagePage'
import CashbookPage from './features/admin/pages/CashbookPage'
import ChangePasswordPage from './features/admin/pages/ChangePasswordPage'
import CreateOrderPage from './features/admin/pages/CreateOrderPage'
import CreateQrPage from './features/admin/pages/CreateQrPage'
import LoginPage from './features/admin/pages/LoginPage'
import ProductsPage from './features/admin/pages/ProductsPage'
import QrListPage from './features/admin/pages/QrListPage'
import ShopLayout from './features/shop/layouts/ShopLayout'
import ShopCartPage from './features/shop/pages/ShopCartPage'
import ShopCatalogPage from './features/shop/pages/ShopCatalogPage'
import ShopCheckoutPage from './features/shop/pages/ShopCheckoutPage'
import ShopOrderSuccessPage from './features/shop/pages/ShopOrderSuccessPage'
import ShopProductPage from './features/shop/pages/ShopProductPage'
import ShopZaloBridgePage from './features/shop/pages/ShopZaloBridgePage'
import CustomCardPage from './pages/CustomCardPage'
import GreetingPage from './pages/GreetingPage'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/q/:uuid" element={<GreetingPage />} />
      <Route path="/custom" element={<CustomCardPage />} />
      <Route path="/demo" element={<BirthdayScreen />} />
      <Route path="/demo/galaxy" element={<GalaxyOfLoveScreen />} />
      <Route path="/demo/galaxy-of-love" element={<GalaxyOfLoveScreen />} />

      <Route path="/shop" element={<ShopLayout />}>
        <Route index element={<ShopCatalogPage />} />
        <Route path="product/:id" element={<ShopProductPage />} />
        <Route path="cart" element={<ShopCartPage />} />
        <Route path="checkout" element={<ShopCheckoutPage />} />
        <Route path="success" element={<ShopOrderSuccessPage />} />
        <Route path="zalo" element={<ShopZaloBridgePage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/qr" replace />} />
          <Route path="orders/new" element={<CreateOrderPage />} />
          <Route path="qr/new" element={<CreateQrPage />} />
          <Route path="qr" element={<QrListPage />} />
          <Route path="manage" element={<AdminManagePage />} />
          <Route path="orders" element={<Navigate to="/admin/manage" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="cashbook" element={<CashbookPage />} />
          <Route path="create" element={<Navigate to="/admin/qr/new" replace />} />
          <Route path="create/:topicId" element={<Navigate to="/admin/qr/new" replace />} />
          <Route path="cards" element={<Navigate to="/admin/qr" replace />} />
          <Route path="requests" element={<Navigate to="/admin/manage" replace />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/shop" replace />} />
      <Route path="*" element={<Navigate to="/shop" replace />} />
    </Routes>
  )
}

export default App
