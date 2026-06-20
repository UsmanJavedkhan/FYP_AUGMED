import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import AppRoot from './AppRoot'
import { AuthProvider } from './auth'
import { initTheme } from './theme'

// apply the saved light/dark theme before the app renders
initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  </StrictMode>,
)
