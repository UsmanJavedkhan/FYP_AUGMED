import { useState } from 'react'

import { useAuth } from './auth'

export function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@augmed.local')
  const [password, setPassword] = useState('augmed123')
  const [submitting, setSubmitting] = useState(false)
  const [errMsg, setErrMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrMsg(null)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-10 px-5">
      <div className="w-full max-w-[440px] p-10 bg-white border border-[#e4e9f0] rounded-[20px] shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]">
        {/* logo + brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#0d9488] to-[#2563eb] grid place-items-center text-white font-extrabold shadow-[0_10px_24px_-12px_rgba(37,99,235,0.4)]">
            A
          </div>
          <div>
            <div className="font-extrabold">AugMed</div>
            <div className="text-[0.72rem] text-[#64748b] tracking-widest uppercase">Governance</div>
          </div>
        </div>

        <h1 className="m-0 text-[1.8rem] tracking-tight font-bold">Admin sign in</h1>
        <p className="mt-1.5 mb-6 text-[#64748b] text-[0.9rem]">
          Administrator access to the AugMed control panel.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-5">
          {/* email */}
          <div className="grid gap-1.5">
            <label className="text-[0.72rem] text-[#64748b] uppercase tracking-wider font-bold">
              Email
            </label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border border-[#e4e9f0] rounded-xl px-3.5 py-2.5 text-[#0f172a] outline-none focus:border-[#0d9488] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)]"
            />
          </div>

          {/* password */}
          <div className="grid gap-1.5">
            <label className="text-[0.72rem] text-[#64748b] uppercase tracking-wider font-bold">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* demo creds */}
        {/* <div className="px-4 py-3.5 bg-[#f3f6fa] border border-[#e4e9f0] rounded-xl text-[0.82rem] text-[#64748b] leading-7">
          <strong className="text-[#0f172a] block mb-1.5 text-[0.78rem] uppercase tracking-wider">
            Demo admin
          </strong>
          <div>admin@augmed.local</div>
          <div className="text-[#94a3b8] mt-1.5">password: augmed123</div>
        </div> */}
      </div>
    </div>
  )
}
