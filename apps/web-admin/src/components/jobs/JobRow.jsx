// one row in the jobs list

import JobStatusBadge from './JobStatusBadge'

function JobRow({ job, onRetry }) {
  // pick a color for the progress bar
  let barColor = 'bg-blue-500'
  if (job.status === 'completed') barColor = 'bg-green-500'
  if (job.status === 'failed') barColor = 'bg-red-500'

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      {/* top row: name + status */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-slate-800">{job.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Type: {job.type} · Started {job.startedAt}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <JobStatusBadge status={job.status} />

          {/* show retry only when failed */}
          {job.status === 'failed' ? (
            <button
              type="button"
              onClick={() => onRetry(job.id)}
              className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>

      {/* progress bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${job.progress}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-1">{job.progress}% complete</div>
    </div>
  )
}

export default JobRow
