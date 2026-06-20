// one dataset card in the grid

function DatasetCard({ dataset, onDelete }) {
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
          <div className="text-xs text-slate-500" title="Documented size of the dataset at its source — not a live file count.">
            Items (reported)
          </div>
          <div className="font-semibold text-slate-800">{Number(dataset.itemCount).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Updated</div>
          <div className="font-semibold text-slate-800">{dataset.updated}</div>
        </div>
      </div>

      {/* action buttons */}
      <div className="flex gap-2 mt-4">
        {dataset.sourceUrl ? (
          <a
            href={dataset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
          >
            View source ↗
          </a>
        ) : (
          <span
            className="flex-1 text-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs cursor-not-allowed"
            title="No source link recorded for this dataset."
          >
            No source link
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Remove "${dataset.name}" from the registry?`)) {
              onDelete(dataset.id)
            }
          }}
          className="flex-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default DatasetCard
