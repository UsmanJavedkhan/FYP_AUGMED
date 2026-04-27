// shows simple per-class metrics for a model (placeholder data)

function MetricsPanel({ model }) {
  if (!model) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 text-sm text-slate-500">
        Pick a model from the table to see its metrics.
      </div>
    )
  }

  // fake per-class metrics for now
  const classes = [
    { name: 'Healthy', precision: 0.92, recall: 0.88 },
    { name: 'Pneumonia', precision: 0.85, recall: 0.81 },
    { name: 'Tuberculosis', precision: 0.78, recall: 0.74 },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-base font-bold text-slate-800 mb-1">
        {model.name} <span className="text-slate-400">{model.version}</span>
      </h3>
      <p className="text-xs text-slate-500 mb-3">Per-class metrics (placeholder).</p>

      {/* metrics table */}
      <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-slate-500 border-b border-slate-200 pb-2">
        <span>Class</span>
        <span>Precision</span>
        <span>Recall</span>
      </div>

      {classes.map((c) => (
        <div
          key={c.name}
          className="grid grid-cols-3 gap-3 text-sm py-2 border-b border-slate-200 last:border-b-0"
        >
          <span className="text-slate-800">{c.name}</span>
          <span className="text-slate-600">{(c.precision * 100).toFixed(1)}%</span>
          <span className="text-slate-600">{(c.recall * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export default MetricsPanel
