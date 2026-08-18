// Cases page - shows all cases in a big table with filters

import { useState } from 'react'
import CaseFilters from '../components/cases/CaseFilters'
import CaseTable from '../components/cases/CaseTable'

 export function CasesPage({ cases }) {
  // filter state
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  // filter the cases based on search + status
  const filtered = cases.filter((c) => {
    // status filter
    if (status !== 'all' && c.status !== status) {
      return false
    }
    // search filter
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
      <h1 className="text-xl font-bold text-white mb-1">All Cases</h1>
      <p className="text-sm text-slate-400 mb-4">
        Showing {filtered.length} of {cases.length} cases.
      </p>

      {/* filters */}
      <CaseFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      {/* table */}
      <CaseTable cases={filtered} />
    </div>
  )
}

export default CasesPage
