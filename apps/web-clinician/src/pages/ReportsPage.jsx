// Reports page - shows the cases and lets you download PDF reports

import { useState } from 'react'
import ReportFilters from '../components/reports/ReportFilters'
import ReportRow from '../components/reports/ReportRow'

function ReportsPage({ cases, onDownloadReport }) {
  // local filter state
  const [search, setSearch] = useState('')
  const [onlyReady, setOnlyReady] = useState(false)

  // filter cases
  const filtered = cases.filter((c) => {
    if (onlyReady && c.status !== 'reviewed') {
      return false
    }
    if (search.trim() !== '') {
      const text = (c.patient_reference || c.id || '').toLowerCase()
      if (!text.includes(search.toLowerCase())) {
        return false
      }
    }
    return true
  })

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <h1 className="text-xl font-bold text-white mb-1">Reports</h1>
      <p className="text-sm text-slate-400 mb-4">
        Generate and download PDF reports for reviewed cases.
      </p>

      <ReportFilters
        search={search}
        setSearch={setSearch}
        onlyReady={onlyReady}
        setOnlyReady={setOnlyReady}
      />

      {/* list of reports */}
      {filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-10 border border-dashed border-slate-700 rounded-lg">
          No reports to show.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <ReportRow
              key={c.id}
              caseItem={c}
              onDownload={onDownloadReport}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ReportsPage
