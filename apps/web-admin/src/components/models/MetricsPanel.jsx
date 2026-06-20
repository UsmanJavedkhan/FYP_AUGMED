// shows real metadata for the selected model + an honest evaluation note.
// (No held-out evaluation has been run, so we don't show fabricated metrics.)

function MetricsPanel({ model }) {
  if (!model) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 text-sm text-slate-500">
        Pick a model from the table to see its details.
      </div>
    )
  }

  const rows = [
    { label: 'Version', value: model.version },
    { label: 'Framework', value: model.framework },
    { label: 'Status', value: model.status, capitalize: true },
    { label: 'Accuracy', value: model.accuracy ? `${model.accuracy}%` : 'Not evaluated yet' },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-base font-bold text-slate-800 mb-1">
        {model.name} <span className="text-slate-400">{model.version}</span>
      </h3>
      <p className="text-xs text-slate-500 mb-3">Model details</p>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-slate-500">{r.label}</dt>
            <dd className={`text-slate-800 font-medium m-0 ${r.capitalize ? 'capitalize' : ''}`}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-xs text-slate-400 mt-4 border-t border-slate-200 pt-3">
        Per-class precision/recall will appear here once a held-out evaluation is run.
        No evaluation has been recorded for this model yet.
      </p>
    </div>
  )
}

export default MetricsPanel
