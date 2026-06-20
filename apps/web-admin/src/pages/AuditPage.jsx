// Audit Logs page - paginated event stream

import { useEffect, useState } from 'react'
import LogFilters from '../components/audit/LogFilters'
import LogRow from '../components/audit/LogRow'
import Pagination from '../components/audit/Pagination'
import { fetchAuditLogs, downloadAuditCsv } from '../api'

const PAGE_SIZE = 5

// format an ISO timestamp like "2026-04-27 14:22"
function formatTs(iso) {
  if (!iso) return '-'
  return iso.replace('T', ' ').slice(0, 16)
}

function AuditPage() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('all')
  const [page, setPage] = useState(1)
  const [err, setErr] = useState(null)

  // load logs from the api on mount
  useEffect(() => {
    fetchAuditLogs()
      .then((rows) =>
        setLogs(
          rows.map((l) => ({
            id: l.id,
            timestamp: formatTs(l.created_at),
            actor: l.actor,
            action: l.action,
            target: l.target,
          })),
        ),
      )
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load audit logs.'))
  }, [])

  // filter logs
  const filtered = logs.filter((l) => {
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

  // download the audit trail as a csv from the backend
  async function exportCsv() {
    setErr(null)
    try {
      const blob = await downloadAuditCsv()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'augmed-audit-export.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Export failed.')
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Audit Logs</h1>
      <p className="text-sm text-slate-500 mb-5">
        {filtered.length} events match · showing {visible.length} on this page.
      </p>

      {err ? (
        <div className="text-sm text-red-600 mb-4">{err}</div>
      ) : null}

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
