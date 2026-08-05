import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CardsProvider } from './context/CardsContext'
import { DialogProvider } from './context/DialogContext'
import { SwrProvider } from './lib/swr'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <SwrProvider>
          <DialogProvider>
            <AuthProvider>
              <CardsProvider>
                <App />
              </CardsProvider>
            </AuthProvider>
          </DialogProvider>
        </SwrProvider>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
)
