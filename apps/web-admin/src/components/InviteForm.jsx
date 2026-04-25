// form to create a new user account

import { useState } from 'react'

const ROLES = ['admin', 'clinician', 'reviewer', 'researcher']

function InviteForm({ onCreate }) {
  // form fields stored in one object
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'clinician',
    password: '',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [errMsg, setErrMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrMsg(null)
    setSubmitting(true)
    try {
      await onCreate({ ...form, email: form.email.toLowerCase().trim() })
      // reset the form once it works
      setForm({ full_name: '', email: '', role: 'clinician', password: '', is_active: true })
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Unable to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  // small helper to update one field
  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#e4e9f0] rounded-[20px] p-6 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]"
    >
      <div className="flex justify-between items-start gap-4 mb-[18px]">
        <div>
          <h2 className="m-0 text-[1.05rem] font-bold">Invite Member</h2>
          <p className="mt-1 mb-0 text-[0.84rem] text-[#64748b]">Create a new AugMed account.</p>
        </div>
      </div>

      <div className="grid gap-3.5">
        {/* full name */}
        <div className="grid gap-1.5">
          <label className="text-[0.72rem] text-[#64748b] uppercase tracking-wider font-bold">
            Full name
          </label>
          <input
            value={form.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            required
            minLength={2}
            className="bg-white border border-[#e4e9f0] rounded-xl px-3.5 py-2.5 text-[#0f172a] outline-none focus:border-[#0d9488] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)]"
          />
        </div>

        {/* email */}
        <div className="grid gap-1.5">
          <label className="text-[0.72rem] text-[#64748b] uppercase tracking-wider font-bold">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
            className="bg-white border border-[#e4e9f0] rounded-xl px-3.5 py-2.5 text-[#0f172a] outline-none focus:border-[#0d9488] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)]"
          />
        </div>

        {/* role */}
        <div className="grid gap-1.5">
          <label className="text-[0.72rem] text-[#64748b] uppercase tracking-wider font-bold">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
            className="bg-white border border-[#e4e9f0] rounded-xl px-3.5 py-2.5 text-[#0f172a] outline-none focus:border-[#0d9488] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)]"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* password */}
        <div className="grid gap-1.5">
          <label className="text-[0.72rem] text-[#64748b] uppercase tracking-wider font-bold">
            Temporary password
          </label>
          <input
            type="text"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            minLength={6}
            required
            className="bg-white border border-[#e4e9f0] rounded-xl px-3.5 py-2.5 text-[#0f172a] outline-none focus:border-[#0d9488] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)]"
          />
        </div>

        {errMsg ? (
          <div className="px-4 py-3.5 rounded-[14px] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.22)] text-[#b91c1c] text-[0.9rem]">
            {errMsg}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-br from-[#0d9488] to-[#2563eb] text-white border border-transparent rounded-xl px-[18px] py-2.5 font-semibold text-[0.9rem] cursor-pointer shadow-[0_10px_24px_-14px_rgba(37,99,235,0.4)] disabled:opacity-60 disabled:cursor-progress"
        >
          {submitting ? 'Creating…' : 'Create user'}
        </button>
      </div>
    </form>
  )
}

export default InviteForm
