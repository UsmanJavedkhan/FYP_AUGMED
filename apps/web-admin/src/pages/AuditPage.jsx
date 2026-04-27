// Audit Logs page - paginated event stream

import { useState } from 'react'
import LogFilters from '../components/audit/LogFilters'
import LogRow from '../components/audit/LogRow'
import Pagination from '../components/audit/Pagination'

// fake audit log data
const ALL_LOGS = [
  { id: 1, timestamp: '2026-04-27 14:22', actor: 'clinician@augmed.local', action: 'upload', target: 'case_a91b2' },
  { id: 2, timestamp: '2026-04-27 14:25', actor: 'reviewer@augmed.local', action: 'review', target: 'case_a91b2' },
  { id: 3, timestamp: '2026-04-27 14:28', actor: 'clinician@augmed.local', action: 'report', target: 'case_a91b2' },
  { id: 4, timestamp: '2026-04-27 13:50', actor: 'admin@augmed.local', action: 'user_change', target: 'researcher@augmed.local' },
  { id: 5, timestamp: '2026-04-27 13:42', actor: 'admin@augmed.local', action: 'login', target: '-' },
  { id: 6, timestamp: '2026-04-27 12:30', actor: 'clinician@augmed.local', action: 'upload', target: 'case_b37c4' },
  { id: 7, timestamp: '2026-04-27 12:35', actor: 'reviewer@augmed.local', action: 'review', target: 'case_b37c4' },
  { id: 8, timestamp: '2026-04-27 11:14', actor: 'clinician@augmed.local', action: 'login', target: '-' },
  { id: 9, timestamp: '2026-04-27 10:55', actor: 'admin@augmed.local', action: 'user_change', target: 'clinician@augmed.local' },
  { id: 10, timestamp: '2026-04-27 09:20', actor: 'clinician@augmed.local', action: 'upload', target: 'case_c12d9' },
  { id: 11, timestamp: '2026-04-27 09:24', actor: 'clinician@augmed.local', action: 'report', target: 'case_c12d9' },
  { id: 12, timestamp: '2026-04-26 17:30', actor: 'reviewer@augmed.local', action: 'review', target: 'case_d44e1' },
]

const PAGE_SIZE = 5

function AuditPage() {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('all')
  const [page, setPage] = useState(1)

  // filter logs
  const filtered = ALL_LOGS.filter((l) => {
    if (action !== 'all' && l.action !== action) return false
    if (search.trim() !== '') {
      const text = (l.actor + ' ' + l.target).toLowerCase()
      if (!text.includes(search.toLowerCase())) return false
    }
    return true
  })

  // figure out which slice to show
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  // fake export - just shows an alert for now
  function exportCsv() {
    alert('CSV export not wired to backend yet.')
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Audit Logs</h1>
      <p className="text-sm text-slate-500 mb-5">
        {filtered.length} events match · showing {visible.length} on this page.
      </p>

      <LogFilters
        search={search}
        setSearch={setSearch}
        action={action}
        setAction={setAction}
        onExport={exportCsv}
      />

      {/* logs table */}
      {visible.length === 0 ? (
        <div className="text-center text-slate-500 py-10 border border-dashed border-slate-300 rounded-lg">
          No events match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </section>
  )
}

export default AuditPage
