// Background Jobs page - list of jobs with filters

import { useState } from 'react'
import JobFilters from '../components/jobs/JobFilters'
import JobRow from '../components/jobs/JobRow'

// fake job data
const INITIAL_JOBS = [
  {
    id: 1,
    name: 'Inference batch #142',
    type: 'inference',
    status: 'running',
    progress: 60,
    startedAt: '2 min ago',
  },
  {
    id: 2,
    name: 'Train DenseNet121 v1.1',
    type: 'training',
    status: 'queued',
    progress: 0,
    startedAt: '5 min ago',
  },
  {
    id: 3,
    name: 'Generate synthetic batch #8',
    type: 'synthetic',
    status: 'completed',
    progress: 100,
    startedAt: '10 min ago',
  },
  {
    id: 4,
    name: 'PDF report generation',
    type: 'report',
    status: 'failed',
    progress: 35,
    startedAt: '15 min ago',
  },
  {
    id: 5,
    name: 'Inference batch #141',
    type: 'inference',
    status: 'completed',
    progress: 100,
    startedAt: '30 min ago',
  },
]

function JobsPage() {
  const [jobs, setJobs] = useState(INITIAL_JOBS)
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')

  // filter jobs
  const filtered = jobs.filter((j) => {
    if (status !== 'all' && j.status !== status) return false
    if (type !== 'all' && j.type !== type) return false
    return true
  })

  // retry a failed job - just reset to queued
  function retryJob(id) {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, status: 'queued', progress: 0 } : j,
      ),
    )
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Background Jobs</h1>
      <p className="text-sm text-slate-500 mb-5">
        Showing {filtered.length} of {jobs.length} jobs.
      </p>

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
