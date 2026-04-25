import App from './App'
import { LoginScreen } from './Login'
import { useAuth } from './auth'

export default function AppRoot() {
  const { user, loading, logout } = useAuth()
  if (loading) {
    return (
      <div className="login-shell">
        <div className="login-card" style={{ textAlign: 'center' }}>
          Loading…
        </div>
      </div>
    )
  }
  if (!user) return <LoginScreen />
  if (user.role !== 'admin') {
    return (
      <div className="login-shell">
        <div className="login-card">
          <h1 className="login-title">Access denied</h1>
          <p className="login-sub">
            Your account (<strong>{user.email}</strong>) has the <strong>{user.role}</strong> role.
            The governance console requires the admin role.
          </p>
          <button className="btn btn-ghost" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    )
  }
  return <App />
}
