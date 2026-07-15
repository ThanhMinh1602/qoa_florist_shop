import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CardsProvider } from './context/CardsContext'
import { DialogProvider } from './context/DialogContext'
import { CartProvider } from './features/shop/context/CartContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DialogProvider>
        <AuthProvider>
          <CardsProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </CardsProvider>
        </AuthProvider>
      </DialogProvider>
    </BrowserRouter>
  </StrictMode>,
)
