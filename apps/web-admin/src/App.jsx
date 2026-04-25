import { useEffect, useState } from 'react'

import { fetchAdminSummary, fetchHealth } from './api'
import { useAuth } from './auth'
import { UsersPage } from './UsersPage'

const NAV = [
  { id: 'overview', label: 'Overview', view: 'overview' },
  { id: 'users', label: 'Users & Roles', view: 'users' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'models', label: 'Model Registry' },
  { id: 'jobs', label: 'Background Jobs' },
  { id: 'audit', label: 'Audit Logs' },
]

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function App() {
  const { user, logout } = useAuth()
  const [view, setView] = useState('overview')
  const [summary, setSummary] = useState(null)
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setError(null)
      try {
        const [nextHealth, nextSummary] = await Promise.all([fetchHealth(), fetchAdminSummary()])
        setHealth(nextHealth)
        setSummary(nextSummary)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load admin data.')
      }
    }
    void load()
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">AugMed</div>
            <div className="brand-sub">Governance</div>
          </div>
        </div>
        <nav className="nav">
          <div className="nav-label">Administration</div>
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${item.view === view ? 'active' : ''}`}
              type="button"
              onClick={() => item.view && setView(item.view)}
              disabled={!item.view}
            >
              <span className="nav-dot" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <strong>Phase 1 · Foundation</strong>
          Local-first monorepo · FastAPI + React
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{view === 'users' ? 'Users & Roles' : 'Operational Overview'}</h1>
            <p>
              {view === 'users'
                ? 'Manage AugMed accounts, roles, and access.'
                : 'Platform health, queues, and case audit activity.'}
            </p>
          </div>
          <div className="status-cluster">
            <span className="status-chip">
              <span className="dot" />
              API <strong>{health?.status ?? 'offline'}</strong>
            </span>
            {user ? (
              <div className="user-chip">
                <div>
                  <div className="user-name">{user.full_name}</div>
                  <div className="user-role">{user.role}</div>
                </div>
                <div className="user-avatar">{user.full_name.charAt(0).toUpperCase()}</div>
                <button className="btn-logout" type="button" onClick={logout}>
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="content">
          {view === 'users' && user ? (
            <UsersPage currentUserId={user.id} />
          ) : (
            <>
              {error ? <div className="error-banner">{error}</div> : null}
              <section className="kpi-row">
                <article className="kpi">
                  <div className="kpi-label">Total Cases</div>
                  <div className="kpi-value">{summary?.metrics.total_cases ?? 0}</div>
                  <div className="kpi-delta">Across clinician workspaces</div>
                </article>
                <article className="kpi">
                  <div className="kpi-label">Pending Reviews</div>
                  <div className="kpi-value">{summary?.metrics.pending_reviews ?? 0}</div>
                  <div className="kpi-delta">Awaiting expert sign-off</div>
                </article>
                <article className="kpi">
                  <div className="kpi-label">Active Users</div>
                  <div className="kpi-value">{summary?.metrics.active_users ?? 0}</div>
                  <div className="kpi-delta">Enabled accounts</div>
                </article>
                <article className="kpi">
                  <div className="kpi-label">Ready Reports</div>
                  <div className="kpi-value">{summary?.metrics.ready_reports ?? 0}</div>
                  <div className="kpi-delta">Approved cases</div>
                </article>
              </section>

              <section className="grid-two">
                <article className="card">
                  <div className="card-head">
                    <div>
                      <h2>Queue Readiness</h2>
                      <p>Workflow pipelines tracked by the API.</p>
                    </div>
                  </div>
                  <div className="row-list">
                    {summary?.queues.map((queue) => (
                      <div className="row" key={queue.name}>
                        <div>
                          <strong style={{ textTransform: 'capitalize' }}>{queue.name}</strong>
                          <p>Backlog: {queue.backlog}</p>
                        </div>
                        <span className={`pill pill-${queue.status}`}>{queue.status}</span>
                      </div>
                    )) ?? <p style={{ color: 'var(--text-muted)' }}>Loading queue data…</p>}
                  </div>
                </article>

                <article className="card">
                  <div className="card-head">
                    <div>
                      <h2>Storage Footprint</h2>
                      <p>Local filesystem artifacts.</p>
                    </div>
                  </div>
                  <div className="row-list">
                    {summary?.storage.map((bucket) => (
                      <div className="row" key={bucket.name}>
                        <div>
                          <strong style={{ textTransform: 'capitalize' }}>{bucket.name}</strong>
                          <p>{bucket.path}</p>
                        </div>
                        <span className="pill pill-ready">{bucket.file_count} files</span>
                      </div>
                    )) ?? <p style={{ color: 'var(--text-muted)' }}>Loading storage data…</p>}
                  </div>
                </article>
              </section>

              <section className="card">
                <div className="card-head">
                  <div>
                    <h2>Recent Case Activity</h2>
                    <p>Latest audit surface across the platform.</p>
                  </div>
                </div>
                <div>
                  <div className="table-head">
                    <span>Case</span>
                    <span>Status</span>
                    <span>Prediction</span>
                    <span>Updated</span>
                  </div>
                  {summary?.recent_cases.length ? (
                    summary.recent_cases.map((c) => (
                      <div className="table-row" key={c.id}>
                        <div>
                          <strong>{c.patient_reference ?? c.id}</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {c.modality}
                          </p>
                        </div>
                        <span className={`pill pill-${c.status}`}>{c.status.replace(/_/g, ' ')}</span>
                        <span>
                          {c.prediction?.label ?? 'Pending'}
                          {c.prediction ? ` · ${Math.round(c.prediction.confidence * 100)}%` : ''}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{formatDate(c.updated_at)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="table-row">
                      <span style={{ color: 'var(--text-muted)' }}>No case activity yet.</span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
