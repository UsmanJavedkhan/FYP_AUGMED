// header showing dataset name + sample count + import button

function DatasetHeader({ name, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-white">{name}</h2>
        <p className="text-xs text-slate-400 mt-1">{count} sample images</p>
      </div>

      {/* import button (just UI for now) */}
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
      >
        Import dataset
      </button>
    </div>
  )
}

export default DatasetHeader
