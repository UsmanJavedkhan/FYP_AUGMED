// Background Jobs page - list of jobs with filters

import { useEffect, useState } from 'react'
import JobFilters from '../components/jobs/JobFilters'
import JobRow from '../components/jobs/JobRow'
import { fetchJobs, retryJob as retryJobApi } from '../api'

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
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [err, setErr] = useState(null)

  // load jobs from the api on mount
  useEffect(() => {
    fetchJobs()
      .then((rows) => setJobs(rows.map(mapJob)))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load jobs.'))
  }, [])

  // filter jobs
  const filtered = jobs.filter((j) => {
    if (status !== 'all' && j.status !== status) return false
    if (type !== 'all' && j.type !== type) return false
    return true
  })

  // retry a failed job through the api
  async function retryJob(id) {
    setErr(null)
    try {
      const updated = await retryJobApi(id)
      setJobs((prev) => prev.map((j) => (j.id === id ? mapJob(updated) : j)))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not retry job.')
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Background Jobs</h1>
      <p className="text-sm text-slate-500 mb-5">
        Showing {filtered.length} of {jobs.length} jobs.
      </p>

      {err ? (
        <div className="text-sm text-red-600 mb-4">{err}</div>
      ) : null}

      <JobFilters
        status={status}
        setStatus={setStatus}
        type={type}
        setType={setType}
      />

      {/* job list */}
      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-10 border border-dashed border-slate-300 rounded-lg">
          No jobs match these filters.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((j) => (
            <JobRow key={j.id} job={j} onRetry={retryJob} />
          ))}
        </div>
      )}
    </section>
  )
}

export default JobsPage
