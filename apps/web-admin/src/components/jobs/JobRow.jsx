// one row in the operations history

import JobStatusBadge from './JobStatusBadge'

function JobRow({ job }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-semibold text-slate-800 truncate">{job.name}</div>
        <div className="text-xs text-slate-500 mt-0.5">
          Type: {job.type} · {job.startedAt}
        </div>
      </div>

      <JobStatusBadge status={job.status} />
    </div>
  )
}

export default JobRow
