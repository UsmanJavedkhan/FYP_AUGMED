// small colored pill for case status

function StatusBadge({ status }) {
  // pick a color for each status
  let color = 'bg-slate-700 text-slate-200'
  if (status === 'review_pending') color = 'bg-yellow-700 text-yellow-100'
  if (status === 'reviewed') color = 'bg-green-700 text-green-100'
  if (status === 'needs_follow_up') color = 'bg-red-700 text-red-100'

  // turn review_pending -> review pending
  const text = status ? status.replace(/_/g, ' ') : 'unknown'

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>
      {text}
    </span>
  )
}

export default StatusBadge
