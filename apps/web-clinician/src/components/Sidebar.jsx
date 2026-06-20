// sidebar nav for the app — vertical on desktop, slide-in drawer on small screens
const navItems = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'synthetic', label: 'Synthetic Data' },
  { id: 'cases', label: 'Cases' },
  { id: 'reports', label: 'Reports' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'settings', label: 'Settings' },
]

function Sidebar({ activePage = 'workspace', onNavigate, open = false, onClose, onLogout, user }) {
  return (
    <>
      {/* dimmed backdrop — mobile only, when the drawer is open */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/55 z-40 transition-opacity duration-200 min-[821px]:hidden
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <aside
        className={`app-sidebar border-r border-[rgba(148,163,184,0.14)] bg-gradient-to-b from-[rgba(10,15,30,0.95)] to-[rgba(10,15,30,0.75)] backdrop-blur-sm p-7 px-5 sticky top-0 h-screen flex flex-col gap-7
          max-[820px]:fixed max-[820px]:top-0 max-[820px]:left-0 max-[820px]:z-50 max-[820px]:w-[80%] max-[820px]:max-w-[300px] max-[820px]:transition-transform max-[820px]:duration-200
          ${open ? 'max-[820px]:translate-x-0' : 'max-[820px]:-translate-x-full'}`}
      >
        {/* logo area + close button */}
        <div className="flex items-center justify-between gap-3 px-1.5">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#5eead4] to-[#60a5fa] grid place-items-center text-[#062221] font-extrabold shadow-[0_10px_30px_-12px_rgba(94,234,212,0.6)]">
              A
            </div>
            <div>
              <div className="font-extrabold tracking-wide">AugMed</div>
              <div className="text-[0.72rem] text-[#8a97b1] tracking-widest uppercase">Clinician</div>
            </div>
          </div>

          {/* close (mobile only) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="hidden max-[820px]:grid place-items-center w-8 h-8 rounded-lg border border-[rgba(148,163,184,0.2)] text-[#8a97b1] cursor-pointer hover:text-[#e6edf7] hover:border-[rgba(148,163,184,0.35)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* nav links */}
        <nav className="flex flex-col gap-1">
          <div className="px-2.5 pb-2 text-[0.68rem] text-[#5f6d87] uppercase tracking-[0.14em]">
            Workflow
          </div>
          {navItems.map((item) => {
            const isActive = item.id === activePage
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.92rem] font-medium cursor-pointer border border-transparent text-left transition-all duration-150
                  ${isActive
                    ? 'bg-gradient-to-br from-[rgba(94,234,212,0.14)] to-[rgba(96,165,250,0.08)] text-[#e6edf7] border-[rgba(148,163,184,0.24)]'
                    : 'text-[#8a97b1] bg-transparent hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e6edf7]'
                  }`}
                type="button"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* account + sign out — only inside the drawer on small screens */}
        <div className="mt-auto hidden max-[820px]:block border-t border-[rgba(148,163,184,0.14)] pt-4">
          {user ? (
            <div className="mb-3 px-1">
              <div className="text-[0.9rem] font-semibold text-[#e6edf7]">{user.full_name}</div>
              <div className="text-[0.7rem] text-[#8a97b1] uppercase tracking-wider">{user.role}</div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.14)] text-[#e6edf7] rounded-xl py-2.5 px-3 text-[0.85rem] font-semibold cursor-pointer hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(148,163,184,0.24)]"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
