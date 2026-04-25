// top header bar with api status and user info

function Topbar({ apiStatus, userData, onLogout }) {
  return (
    <header className="flex items-center justify-between px-9 py-5 border-b border-[rgba(148,163,184,0.14)] backdrop-blur-sm bg-[rgba(7,11,20,0.55)] sticky top-0 z-10">
      <div>
        <h1 className="m-0 text-[1.3rem] font-bold">Case Workspace</h1>
        <p className="mt-1 mb-0 text-[0.85rem] text-[#8a97b1]">
          Upload, triage, and review chest X-rays end-to-end.
        </p>
      </div>

      <div className="flex gap-2.5">
        {/* api chip */}
        <span className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.14)] text-[0.78rem] text-[#8a97b1]`}>
          <span
            className="w-[7px] h-[7px] rounded-full"
            style={{
              background: apiStatus ? '#34d399' : '#f87171',
              boxShadow: apiStatus
                ? '0 0 0 4px rgba(52,211,153,0.15)'
                : '0 0 0 4px rgba(248,113,113,0.15)',
            }}
          />
          API <strong className="text-[#e6edf7] font-semibold">{apiStatus ?? 'offline'}</strong>
        </span>

        {/* user info */}
        {userData ? (
          <div className="flex items-center gap-2.5 pl-3.5 pr-2 py-1.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.14)] rounded-full">
            <div>
              <div className="text-[0.85rem] font-semibold">{userData.full_name}</div>
              <div className="text-[0.7rem] text-[#8a97b1] uppercase tracking-wider">
                {userData.role}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full grid place-items-center bg-gradient-to-br from-[#5eead4] to-[#60a5fa] text-[#06222a] font-extrabold text-[0.82rem]">
              {userData.full_name.charAt(0).toUpperCase()}
            </div>
            <button
              className="ml-2 bg-transparent border border-[rgba(148,163,184,0.14)] text-[#8a97b1] px-3 py-1.5 rounded-full text-[0.78rem] cursor-pointer hover:text-[#e6edf7] hover:border-[rgba(148,163,184,0.24)]"
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
