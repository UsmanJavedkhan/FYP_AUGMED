import { useEffect, useState } from 'react'

import { createUser, deleteUser, fetchUsers, updateUser } from './api'

const ROLES = ['admin', 'clinician', 'reviewer', 'researcher']

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function UsersPage({ currentUserId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'clinician',
    password: '',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  async function reload() {
    try {
      setLoading(true)
      setUsers(await fetchUsers())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createUser({ ...form, email: form.email.toLowerCase().trim() })
      setForm({ full_name: '', email: '', role: 'clinician', password: '', is_active: true })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(user) {
    try {
      await updateUser(user.id, { is_active: !user.is_active })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user.')
    }
  }

  async function changeRole(user, role) {
    try {
      await updateUser(user.id, { role })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role.')
    }
  }

  async function remove(user) {
    if (user.id === currentUserId) return
    if (!confirm(`Delete ${user.email}?`)) return
    try {
      await deleteUser(user.id)
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user.')
    }
  }

  return (
    <>
      {error ? <div className="error-banner">{error}</div> : null}
      <section className="users-grid">
        <article className="card">
          <div className="card-head">
            <div>
              <h2>Team Directory</h2>
              <p>{loading ? 'Loading…' : `${users.length} user${users.length === 1 ? '' : 's'}`}</p>
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => void reload()}>
              Refresh
            </button>
          </div>
          <div>
            {users.map((u) => (
              <div className="users-table-row" key={u.id}>
                <div>
                  <strong>{u.full_name}</strong>
                  <div className="meta">{u.email}</div>
                  <div className="meta">Last sign-in: {formatDate(u.last_login_at)}</div>
                </div>
                <select
                  className="role-badge"
                  value={u.role}
                  onChange={(e) => void changeRole(u, e.target.value)}
                  disabled={u.id === currentUserId}
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <span className={`pill ${u.is_active ? 'pill-ready' : 'pill-rejected'}`}>
                  {u.is_active ? 'active' : 'disabled'}
                </span>
                <div className="btn-row">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => void toggleActive(u)}
                    disabled={u.id === currentUserId}
                  >
                    {u.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => void remove(u)}
                    disabled={u.id === currentUserId}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <form className="card" onSubmit={handleCreate}>
          <div className="card-head">
            <div>
              <h2>Invite Member</h2>
              <p>Create a new AugMed account.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="field">
              <label>Full name</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                minLength={2}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Temporary password</label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}
