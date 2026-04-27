// shows the user's profile info (read only)

function ProfileForm({ user }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
      <h2 className="text-lg font-bold text-white mb-3">My Profile</h2>

      {/* full name */}
      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Full name</label>
        <input
          type="text"
          value={user?.full_name || ''}
          readOnly
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      {/* email */}
      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Email</label>
        <input
          type="email"
          value={user?.email || ''}
          readOnly
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      {/* role */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Role</label>
        <input
          type="text"
          value={user?.role || ''}
          readOnly
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white capitalize"
        />
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Contact an admin to change your role or email.
      </p>
    </div>
  )
}

export default ProfileForm
