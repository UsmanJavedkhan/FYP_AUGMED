// header bar with title, api status and user info

function Topbar({ title, subtitle, apiStatus, userData, onLogout }) {
  return (
    <header className="flex items-center justify-between px-9 py-5 border-b border-[#e4e9f0] backdrop-blur-sm bg-white/65 sticky top-0 z-10">
      <div>
        <h1 className="m-0 text-[1.3rem] font-bold">{title}</h1>
        <p className="mt-1 mb-0 text-[0.85rem] text-[#64748b]">{subtitle}</p>
      </div>

      <div className="flex gap-2.5">
        {/* api status chip */}
        <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#e4e9f0] text-[0.78rem] text-[#64748b] shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]">
          <span
            className="w-[7px] h-[7px] rounded-full"
            style={{
              background: apiStatus ? '#10b981' : '#ef4444',
              boxShadow: apiStatus
                ? '0 0 0 4px rgba(16,185,129,0.15)'
                : '0 0 0 4px rgba(239,68,68,0.15)',
            }}
          />
          API <strong className="text-[#0f172a] font-semibold">{apiStatus ?? 'offline'}</strong>
        </span>

        {/* user info */}
        {userData ? (
          <div className="flex items-center gap-2.5 pl-3.5 pr-2 py-1.5 bg-white border border-[#e4e9f0] rounded-full shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]">
            <div>
              <div className="text-[0.85rem] font-semibold">{userData.full_name}</div>
              <div className="text-[0.7rem] text-[#64748b] uppercase tracking-wider">
                {userData.role}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full grid place-items-center bg-gradient-to-br from-[#0d9488] to-[#2563eb] text-white font-extrabold text-[0.82rem]">
              {userData.full_name.charAt(0).toUpperCase()}
            </div>
            <button
              className="ml-1 bg-transparent border border-[#e4e9f0] text-[#64748b] px-3 py-1.5 rounded-full text-[0.78rem] cursor-pointer hover:text-[#0f172a] hover:border-[#d3dbe6]"
              type="button"
              onClick={onLogout}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Topbar
