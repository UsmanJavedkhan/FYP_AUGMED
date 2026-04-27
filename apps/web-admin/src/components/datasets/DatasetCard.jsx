// one dataset card in the grid

function DatasetCard({ dataset }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md">
      {/* name + source */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">{dataset.name}</h3>
          <p className="text-xs text-slate-500 mt-1">Source: {dataset.source}</p>
        </div>

        {/* status pill */}
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          {dataset.status}
        </span>
      </div>

      {/* stats row */}
      <div className="grid grid-cols-2 gap-3 text-sm border-t border-slate-200 pt-3">
        <div>
          <div className="text-xs text-slate-500">Items</div>
          <div className="font-semibold text-slate-800">{dataset.itemCount}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Updated</div>
          <div className="font-semibold text-slate-800">{dataset.updated}</div>
        </div>
      </div>

      {/* action buttons */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
        >
          View items
        </button>
        <button
          type="button"
          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

export default DatasetCard
