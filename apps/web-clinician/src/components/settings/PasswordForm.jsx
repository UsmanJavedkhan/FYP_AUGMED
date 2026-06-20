// change password form — wired to POST /auth/change-password

import { useState } from 'react'
import { changePassword } from '../../api'

function PasswordForm() {
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [status, setStatus] = useState(null) // { type: 'error' | 'success', text }
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus(null)

    // client-side checks before hitting the API
    if (newPass.length < 6) {
      setStatus({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    if (newPass !== confirmPass) {
      setStatus({ type: 'error', text: 'New password and confirmation do not match.' })
      return
    }

    setSaving(true)
    try {
      await changePassword({ currentPassword: oldPass, newPassword: newPass })
      setStatus({ type: 'success', text: 'Password updated successfully.' })
      setOldPass('')
      setNewPass('')
      setConfirmPass('')
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Could not change password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 border border-slate-700 rounded-lg p-5"
    >
      <h2 className="text-lg font-bold text-white mb-3">Change Password</h2>

      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Current password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">New password</label>
        <input
          type="password"
          autoComplete="new-password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Confirm new password</label>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      {/* feedback message */}
      {status && (
        <div className={`text-xs mb-3 ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {status.text}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : 'Save password'}
      </button>
    </form>
  )
}

export default PasswordForm
