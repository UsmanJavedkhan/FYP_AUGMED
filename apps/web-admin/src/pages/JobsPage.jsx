// Operations history - log of completed ML operations

import { useEffect, useState } from 'react'
import JobFilters from '../components/jobs/JobFilters'
import JobRow from '../components/jobs/JobRow'
import { fetchJobs } from '../api'

// turn an ISO timestamp into a rough "x min ago" string
function timeAgo(iso) {
  if (!iso) return '-'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.round(hours / 24)} d ago`
}

function mapJob(j) {
  return {
    id: j.id,
    name: j.name,
    type: j.type,
    status: j.status,
    progress: j.progress,
    startedAt: timeAgo(j.created_at),
  }
}

function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [type, setType] = useState('all')
  const [err, setErr] = useState(null)

  // load jobs from the api on mount
  useEffect(() => {
    fetchJobs()
      .then((rows) => setJobs(rows.map(mapJob)))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load operations.'))
  }, [])

  // filter by type
  const filtered = jobs.filter((j) => type === 'all' || j.type === type)

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Operations History</h1>
      <p className="text-sm text-slate-500 mb-5">
        A log of completed ML operations — inference, synthetic generation, and reports.
        Showing {filtered.length} of {jobs.length}.
      </p>

      {err ? (
        <div className="text-sm text-red-600 mb-4">{err}</div>
      ) : null}

      <JobFilters type={type} setType={setType} />

      {/* operations list */}
      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-10 border border-dashed border-slate-300 rounded-lg">
          No operations match this filter.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((j) => (
            <JobRow key={j.id} job={j} />
          ))}
        </div>
      )}
    </section>
  )
}

export default JobsPage
