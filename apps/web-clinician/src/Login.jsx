import { useState } from 'react'

import { useAuth } from './auth'

export function LoginScreen({ appName = 'Clinician' }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('clinician@augmed.local')
  const [password, setPassword] = useState('augmed123')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand" style={{ marginBottom: 24 }}>
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">AugMed</div>
            <div className="brand-sub">{appName}</div>
          </div>
        </div>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-sub">Sign in to your AugMed workspace.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <div className="error-banner">{error}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="login-hint">
          <strong>Demo accounts</strong>
          <div>admin@augmed.local</div>
          <div>clinician@augmed.local</div>
          <div>reviewer@augmed.local</div>
          <div className="muted">password: augmed123</div>
        </div>
      </div>
    </div>
  )
}
