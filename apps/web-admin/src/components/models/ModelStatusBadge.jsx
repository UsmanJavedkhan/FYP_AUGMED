// colored pill for model status

function ModelStatusBadge({ status }) {
  // pick the color
  let color = 'bg-slate-100 text-slate-600'
  if (status === 'active') color = 'bg-green-100 text-green-700'
  if (status === 'archived') color = 'bg-slate-200 text-slate-500'
  if (status === 'training') color = 'bg-yellow-100 text-yellow-700'

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>
      {status}
    </span>
  )
}

export default ModelStatusBadge
