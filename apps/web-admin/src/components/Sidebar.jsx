// sidebar with the admin nav links
const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users & Roles' },
  { id: 'datasets', label: 'Datasets'},
  { id: 'models', label: 'Model Registry' },
  { id: 'jobs', label: 'Operations History'},
  { id: 'audit', label: 'Audit Logs'},
]

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="border-r border-[#e4e9f0] bg-white/75 backdrop-blur-sm p-7 px-5 sticky top-0 h-screen flex flex-col gap-7">
      {/* logo area */}
      <div className="flex items-center gap-3 px-1.5">
        <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#0d9488] to-[#2563eb] grid place-items-center text-white font-extrabold shadow-[0_10px_24px_-12px_rgba(37,99,235,0.4)]">
          A
        </div>
        <div>
          <div className="font-extrabold">AugMed</div>
          <div className="text-[0.72rem] text-[#64748b] tracking-widest uppercase">Governance</div>
        </div>
      </div>

      {/* nav links */}
      <nav className="flex flex-col gap-1">
        <div className="px-2.5 pb-2 text-[0.68rem] text-[#94a3b8] uppercase tracking-[0.14em]">
          Administration
        </div>
        {navItems.map((item) => {
          const isActive = item.id === activePage
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && onNavigate(item.id)}
              disabled={item.disabled}
              type="button"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.92rem] font-medium text-left border border-transparent transition-all duration-150
                ${isActive
                  ? 'bg-gradient-to-br from-[rgba(13,148,136,0.10)] to-[rgba(37,99,235,0.06)] text-[#0f172a] border-[#d3dbe6]'
                  : 'text-[#64748b] bg-transparent hover:bg-[#f3f6fa] hover:text-[#0f172a]'
                }
                ${item.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
              {item.label}
            </button>
          )
        })}
      </nav>

    
    </aside>
  )
}

export default Sidebar
