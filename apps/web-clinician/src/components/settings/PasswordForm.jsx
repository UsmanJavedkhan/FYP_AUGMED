// change password form (just UI - no backend yet)

import { useState } from 'react'

function PasswordForm() {
  // store the inputs
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [message, setMessage] = useState('')

  // when user clicks save
  function handleSubmit(e) {
    e.preventDefault()

    // simple checks
    if (newPass.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }
    if (newPass !== confirmPass) {
      setMessage('New password and confirm do not match.')
      return
    }

    // pretend it worked (no API call yet)
    setMessage('Password change is not wired up yet.')
    setOldPass('')
    setNewPass('')
    setConfirmPass('')
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
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">New password</label>
        <input
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Confirm new password</label>
        <input
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      {/* message area */}
      {message && (
        <div className="text-xs text-yellow-400 mb-3">{message}</div>
      )}

      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
      >
        Save password
      </button>
    </form>
  )
}

export default PasswordForm
