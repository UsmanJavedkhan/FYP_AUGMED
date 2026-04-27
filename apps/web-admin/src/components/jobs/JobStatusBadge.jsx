// colored pill for job status

function JobStatusBadge({ status }) {
  let color = 'bg-slate-100 text-slate-600'
  if (status === 'running') color = 'bg-blue-100 text-blue-700'
  if (status === 'queued') color = 'bg-yellow-100 text-yellow-700'
  if (status === 'completed') color = 'bg-green-100 text-green-700'
  if (status === 'failed') color = 'bg-red-100 text-red-700'

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>
      {status}
    </span>
  )
}

export default JobStatusBadge
