import { clearStoredToken, getStoredToken } from './auth'

const RAW_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api/v1'
const API_BASE_URL = RAW_BASE

async function apiFetch(path, init, explicitToken) {
  const token = explicitToken ?? getStoredToken()
  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (response.status === 401) {
    clearStoredToken()
    if (typeof window !== 'undefined') window.location.reload()
    throw new Error('Session expired.')
  }
  if (!response.ok) {
    let detail = ''
    try {
      detail = (await response.json())?.detail ?? ''
    } catch {
      detail = await response.text().catch(() => '')
    }
    throw new Error(detail || `Request failed with status ${response.status}`)
  }
  if (response.status === 204) return undefined
  return response.json()
}

export async function loginRequest(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    let detail = ''
    try {
      detail = (await response.json())?.detail ?? ''
    } catch {
      /* ignore */
    }
    throw new Error(detail || 'Invalid email or password.')
  }
  return await response.json()
}

export async function fetchMe(token) {
  return apiFetch('/auth/me', undefined, token)
}

export function fetchHealth() {
  return apiFetch('/health')
}

export function fetchAdminSummary() {
  return apiFetch('/admin/summary')
}

export async function fetchUsers() {
  const data = await apiFetch('/users')
  return data.items
}

export function createUser(payload) {
  return apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateUser(userId, payload) {
  return apiFetch(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function deleteUser(userId) {
  return apiFetch(`/users/${userId}`, { method: 'DELETE' })
}

// ---------- Datasets ----------
export async function fetchDatasets() {
  const data = await apiFetch('/admin/datasets')
  return data.items
}

export function createDataset(payload) {
  return apiFetch('/admin/datasets', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteDataset(datasetId) {
  return apiFetch(`/admin/datasets/${datasetId}`, { method: 'DELETE' })
}

// ---------- Model registry ----------
export async function fetchModels() {
  const data = await apiFetch('/admin/models')
  return data.items
}

// ---------- Operations history (jobs) ----------
export async function fetchJobs() {
  const data = await apiFetch('/admin/jobs')
  return data.items
}

// ---------- Audit logs ----------
export async function fetchAuditLogs() {
  const data = await apiFetch('/admin/audit')
  return data.items
}

// the csv route is auth-gated, so fetch it with the token and return a blob
export async function downloadAuditCsv() {
  const token = getStoredToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`${API_BASE_URL}/admin/audit/export/csv`, { headers })
  if (!response.ok) {
    throw new Error('Audit export failed')
  }
  return response.blob()
}
