// type filter for the operations history

function JobFilters({ type, setType }) {
  return (
    <div className="flex gap-3 flex-wrap mb-4">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800"
      >
        <option value="all">All types</option>
        <option value="inference">Inference</option>
        <option value="synthetic">Synthetic</option>
        <option value="report">Report</option>
      </select>
    </div>
  )
}

export default JobFilters
