// list of users with inline name/email edit + role + active toggles + delete

import { useState } from 'react'

const ROLES = ['admin', 'clinician', 'reviewer', 'researcher']

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

// pill colors for active/disabled
function getStatusPill(isActive) {
  if (isActive) return 'bg-[rgba(16,185,129,0.12)] text-[#047857]'
  return 'bg-[rgba(239,68,68,0.12)] text-[#b91c1c]'
}

const inputCls =
  'w-full bg-white border border-[#e4e9f0] rounded-lg px-2.5 py-1.5 text-[0.84rem] text-[#0f172a] outline-none focus:border-[#94a3b8]'

function UserDirectory({
  users,
  loading,
  currentUserId,
  onReload,
  onChangeRole,
  onToggleActive,
  onDelete,
  onSaveProfile,
}) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ full_name: '', email: '' })
  const [saving, setSaving] = useState(false)

  function startEdit(u) {
    setEditingId(u.id)
    setDraft({ full_name: u.full_name, email: u.email })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(u) {
    const full_name = draft.full_name.trim()
    const email = draft.email.trim()
    if (!full_name || !email) return // both required
    setSaving(true)
    try {
      const ok = await onSaveProfile(u, { full_name, email })
      if (ok) setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="bg-white border border-[#e4e9f0] rounded-[20px] p-6 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]">
      <div className="flex justify-between items-start gap-4 mb-[18px]">
        <div>
          <h2 className="m-0 text-[1.05rem] font-bold">Team Directory</h2>
          <p className="mt-1 mb-0 text-[0.84rem] text-[#64748b]">
            {loading ? 'Loading…' : `${users.length} user${users.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          className="bg-white text-[#0f172a] border border-[#e4e9f0] rounded-xl py-2.5 px-[18px] font-semibold text-[0.9rem] cursor-pointer hover:bg-[#f3f6fa]"
          type="button"
          onClick={onReload}
        >
          Refresh
        </button>
      </div>

      <div>
        {users.map((u) => {
          const isEditing = editingId === u.id
          return (
            <div
              className="grid grid-cols-[1.4fr_0.9fr_0.9fr_auto] gap-3.5 items-center px-4 py-3.5 border-b border-[#e4e9f0] last:border-b-0 text-[0.88rem] max-[720px]:grid-cols-1"
              key={u.id}
            >
              {/* user info — editable name/email when in edit mode */}
              {isEditing ? (
                <div className="grid gap-1.5">
                  <input
                    className={inputCls}
                    value={draft.full_name}
                    onChange={(e) => setDraft((d) => ({ ...d, full_name: e.target.value }))}
                    placeholder="Full name"
                    aria-label="Full name"
                  />
                  <input
                    className={inputCls}
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                    placeholder="Email"
                    aria-label="Email"
                  />
                </div>
              ) : (
                <div>
                  <strong className="font-semibold">{u.full_name}</strong>
                  <div className="text-[0.78rem] text-[#64748b]">{u.email}</div>
                  <div className="text-[0.78rem] text-[#64748b]">
                    Last sign-in: {formatDate(u.last_login_at)}
                  </div>
                </div>
              )}

              {/* role select */}
              <select
                value={u.role}
                onChange={(e) => onChangeRole(u, e.target.value)}
                disabled={u.id === currentUserId || isEditing}
                className="appearance-none cursor-pointer inline-flex px-2.5 py-1 rounded-full text-[0.72rem] font-semibold capitalize bg-[#f3f6fa] border border-[#e4e9f0] text-[#0f172a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {/* active pill */}
              <span
                className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold capitalize ${getStatusPill(u.is_active)}`}
              >
                {u.is_active ? 'active' : 'disabled'}
              </span>

              {/* action buttons */}
              {isEditing ? (
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => saveEdit(u)}
                    disabled={saving}
                    className="bg-gradient-to-r from-[#14b8a6] to-[#3b82f6] text-white border border-transparent rounded-xl py-2 px-3.5 font-semibold text-[0.82rem] cursor-pointer disabled:opacity-60 disabled:cursor-progress"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="bg-white text-[#0f172a] border border-[#e4e9f0] rounded-xl py-2 px-3.5 font-semibold text-[0.82rem] cursor-pointer hover:bg-[#f3f6fa] disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => startEdit(u)}
                    className="bg-white text-[#0f172a] border border-[#e4e9f0] rounded-xl py-2 px-3.5 font-semibold text-[0.82rem] cursor-pointer hover:bg-[#f3f6fa]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(u)}
                    disabled={u.id === currentUserId}
                    className="bg-white text-[#0f172a] border border-[#e4e9f0] rounded-xl py-2 px-3.5 font-semibold text-[0.82rem] cursor-pointer hover:bg-[#f3f6fa] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {u.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(u)}
                    disabled={u.id === currentUserId}
                    className="bg-transparent text-[#ef4444] border border-[rgba(239,68,68,0.3)] rounded-xl py-2 px-3.5 font-semibold text-[0.82rem] cursor-pointer hover:bg-[rgba(239,68,68,0.08)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default UserDirectory
