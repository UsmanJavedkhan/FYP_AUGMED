import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import AppRoot from './AppRoot'
import { AuthProvider } from './auth'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  </StrictMode>,
)
