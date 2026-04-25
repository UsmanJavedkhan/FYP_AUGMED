import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { fetchMe, loginRequest } from './api'

const TOKEN_KEY = 'augmed.admin.token'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    setLoading(true)
    fetchMe(token)
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const response = await loginRequest(email, password)
    localStorage.setItem(TOKEN_KEY, response.access_token)
    setToken(response.access_token)
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}
