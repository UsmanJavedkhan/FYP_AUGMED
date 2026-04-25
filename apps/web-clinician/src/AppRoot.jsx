import App from './App'
import { LoginScreen } from './Login'
import { useAuth } from './auth'

export default function AppRoot() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="login-shell">
        <div className="login-card" style={{ textAlign: 'center' }}>
          Loading…
        </div>
      </div>
    )
  }
  if (!user) return <LoginScreen appName="Clinician" />
  return <App />
}
