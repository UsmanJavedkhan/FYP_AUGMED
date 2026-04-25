import { clearStoredToken, getStoredToken } from './auth'

const RAW_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api/v1'

export const API_BASE_URL = RAW_BASE
export const API_ORIGIN = RAW_BASE.replace(/\/api\/v\d+$/, '')

export function resolveStorageUrl(path) {
  if (!path) return undefined
  if (/^https?:/i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

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
    throw new Error('Session expired. Please sign in again.')
  }
  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body?.detail ?? ''
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

export async function fetchHealth() {
  return apiFetch('/health')
}

export async function fetchCases() {
  const data = await apiFetch('/cases')
  return data.items
}

export async function fetchCase(caseId) {
  const data = await apiFetch(`/cases/${caseId}`)
  return data.item
}

export async function uploadCase(input) {
  const body = new FormData()
  body.append('file', input.file)
  if (input.patientReference.trim()) body.append('patient_reference', input.patientReference.trim())
  if (input.notes.trim()) body.append('notes', input.notes.trim())

  const data = await apiFetch('/cases/upload', { method: 'POST', body })
  return data.item
}

export async function submitReview(caseId, payload) {
  const data = await apiFetch(`/cases/${caseId}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.item
}

export async function generateReport(caseId) {
  const token = getStoredToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/report`, {
    method: 'POST',
    headers,
  })
  if (!response.ok) {
    let detail = ''
    try { detail = (await response.json())?.detail ?? '' } catch { /* ignore */ }
    throw new Error(detail || 'Report generation failed')
  }
  return response.blob()
}

// Synthetic data generation — integration point for the ML model.
// Expects backend route `POST /synthetic/generate` returning:
//   { items: [{ id, class, seed, quality_score, image_url | image_b64 }] }
// Swap the body fields below to match the model's real input contract.
export async function generateSynthetic({ targetClass, count, seed, guidance }) {
  const payload = {
    target_class: targetClass,
    count: Number(count) || 1,
    seed: seed === '' || seed === null || seed === undefined ? null : Number(seed),
    guidance: guidance === '' || guidance === null || guidance === undefined ? null : Number(guidance),
  }
  const data = await apiFetch('/synthetic/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.items ?? []
}

export function exportCsvUrl(dateFrom, dateTo) {
  const params = new URLSearchParams()
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo) params.set('date_to', dateTo)
  const qs = params.toString()
  return `${API_BASE_URL}/cases/export/csv${qs ? `?${qs}` : ''}`
}
