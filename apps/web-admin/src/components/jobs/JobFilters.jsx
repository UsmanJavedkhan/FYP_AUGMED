// filter dropdown for jobs page

function JobFilters({ status, setStatus, type, setType }) {
  return (
    <div className="flex gap-3 flex-wrap mb-4">
      {/* status filter */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800"
      >
        <option value="all">All statuses</option>
        <option value="running">Running</option>
        <option value="queued">Queued</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>

      {/* type filter */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800"
      >
        <option value="all">All types</option>
        <option value="inference">Inference</option>
        <option value="training">Training</option>
        <option value="report">Report</option>
        <option value="synthetic">Synthetic</option>
      </select>
    </div>
  )
}

export default JobFilters
