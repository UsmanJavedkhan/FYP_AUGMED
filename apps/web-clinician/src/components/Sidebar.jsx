// sidebar nav for the app
const navItems = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'synthetic', label: 'Synthetic Data' },
  { id: 'cases', label: 'Cases' },
  { id: 'reports', label: 'Reports' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'settings', label: 'Settings' },
]

function Sidebar({ activePage = 'workspace', onNavigate }) {
  return (
    <aside className="border-r border-[rgba(148,163,184,0.14)] bg-gradient-to-b from-[rgba(10,15,30,0.9)] to-[rgba(10,15,30,0.55)] backdrop-blur-sm p-7 px-5 sticky top-0 h-screen flex flex-col gap-7">
      {/* logo area */}
      <div className="flex items-center gap-3 px-1.5">
        <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#5eead4] to-[#60a5fa] grid place-items-center text-[#062221] font-extrabold shadow-[0_10px_30px_-12px_rgba(94,234,212,0.6)]">
          A
        </div>
        <div>
          <div className="font-extrabold tracking-wide">AugMed</div>
          <div className="text-[0.72rem] text-[#8a97b1] tracking-widest uppercase">Clinician</div>
        </div>
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

   
    </aside>
  )
}

export default Sidebar
