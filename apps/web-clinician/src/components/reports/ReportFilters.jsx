// search + filter for reports page

function ReportFilters({ search, setSearch, onlyReady, setOnlyReady }) {
  return (
    <div className="flex gap-3 flex-wrap mb-4">
      {/* search */}
      <input
        type="text"
        placeholder="Search reports..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[200px] bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
      />

      {/* checkbox to only show ready ones */}
      <label className="flex items-center gap-2 text-sm text-slate-300 px-3">
        <input
          type="checkbox"
          checked={onlyReady}
          onChange={(e) => setOnlyReady(e.target.checked)}
        />
        Only ready reports
      </label>
    </div>
  )
}

export default ReportFilters
