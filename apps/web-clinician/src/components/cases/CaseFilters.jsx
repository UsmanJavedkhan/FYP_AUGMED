// filters bar for cases page (search + status dropdown)

function CaseFilters({ search, setSearch, status, setStatus }) {
  return (
    <div className="flex gap-3 flex-wrap mb-4">
      {/* search box */}
      <input
        type="text"
        placeholder="Search by patient or ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[200px] bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
      />

      {/* status dropdown */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
      >
        <option value="all">All statuses</option>
        <option value="review_pending">Review pending</option>
        <option value="reviewed">Reviewed</option>
        <option value="needs_follow_up">Needs follow up</option>
      </select>
    </div>
  )
}

export default CaseFilters
