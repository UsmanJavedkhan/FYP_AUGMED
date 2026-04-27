// filters for audit logs page

function LogFilters({ search, setSearch, action, setAction, onExport }) {
  return (
    <div className="flex gap-3 flex-wrap mb-4">
      {/* search box */}
      <input
        type="text"
        placeholder="Search by user or target..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800"
      />

      {/* action filter */}
      <select
        value={action}
        onChange={(e) => setAction(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800"
      >
        <option value="all">All actions</option>
        <option value="upload">Upload</option>
        <option value="review">Review</option>
        <option value="report">Report</option>
        <option value="login">Login</option>
        <option value="user_change">User change</option>
      </select>

      {/* export button */}
      <button
        type="button"
        onClick={onExport}
        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
      >
        Export CSV
      </button>
    </div>
  )
}

export default LogFilters
