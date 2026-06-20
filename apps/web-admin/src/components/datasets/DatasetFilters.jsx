// search box for datasets

function DatasetFilters({ search, setSearch }) {
  return (
    <div className="flex gap-3 mb-4">
      <input
        type="text"
        placeholder="Search datasets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800"
      />
    </div>
  )
}

export default DatasetFilters
