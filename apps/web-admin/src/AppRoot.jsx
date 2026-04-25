import App from './App'
import { LoginScreen } from './Login'
import { useAuth } from './auth'

export default function AppRoot() {
  const { user, loading, logout } = useAuth()

  // still checking session
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center p-10 px-5">
        <div className="w-full max-w-[440px] p-10 bg-white border border-[#e4e9f0] rounded-[20px] text-center shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]">
          Loading…
        </div>
      </div>
    )
  }

  // not signed in
  if (!user) return <LoginScreen />

  // signed in but not admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen grid place-items-center p-10 px-5">
        <div className="w-full max-w-[440px] p-10 bg-white border border-[#e4e9f0] rounded-[20px] shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]">
          <h1 className="m-0 text-[1.8rem] tracking-tight font-bold">Access denied</h1>
          <p className="mt-1.5 mb-6 text-[#64748b] text-[0.9rem]">
            Your account (<strong>{user.email}</strong>) has the <strong>{user.role}</strong> role.
            The governance console requires the admin role.
          </p>
          <button
            type="button"
            onClick={logout}
            className="bg-white text-[#0f172a] border border-[#e4e9f0] rounded-xl py-2.5 px-[18px] font-semibold text-[0.9rem] cursor-pointer hover:bg-[#f3f6fa]"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return <App />
}
