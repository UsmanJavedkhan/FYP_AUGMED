// top header bar with api status and user info

// title + subtitle shown for each section
const PAGE_META = {
  workspace: { title: 'Case Workspace', subtitle: 'Upload, triage, and review chest X-rays end-to-end.' },
  synthetic: { title: 'Synthetic Data', subtitle: 'Generate synthetic chest X-rays for augmentation.' },
  cases: { title: 'Cases', subtitle: 'Browse and filter all chest X-ray cases.' },
  reports: { title: 'Reports', subtitle: 'Generate and download PDF reports for reviewed cases.' },
  datasets: { title: 'Datasets', subtitle: 'Browse the seeded chest X-ray samples.' },
  settings: { title: 'Settings', subtitle: 'Manage your profile, password, and preferences.' },
}

function Topbar({ apiStatus, userData, onLogout, onMenuToggle, activePage = 'workspace' }) {
  const { title, subtitle } = PAGE_META[activePage] ?? PAGE_META.workspace

  return (
    <header className="app-topbar flex items-center justify-between gap-4 px-9 py-5 border-b border-[rgba(148,163,184,0.14)] backdrop-blur-sm  sticky top-0 z-10 max-[820px]:px-5">
      <div className="flex items-center gap-3 min-w-0">
        {/* hamburger — opens the nav drawer on small screens */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="hidden max-[820px]:grid place-items-center w-9 h-9 rounded-lg border border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.04)] text-[#e6edf7] shrink-0 cursor-pointer hover:bg-[rgba(255,255,255,0.07)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="m-0 text-[1.3rem] font-bold max-[420px]:text-[1.1rem]">{title}</h1>
          <p className="mt-1 mb-0 text-[0.85rem] text-[#8a97b1] max-[420px]:hidden">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex gap-2.5 shrink-0">
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

        {/* user info — hidden on small screens (account + sign out live in the drawer) */}
        {userData ? (
          <div className="flex items-center gap-2.5 pl-3.5 pr-2 py-1.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.14)] rounded-full max-[820px]:hidden">
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
