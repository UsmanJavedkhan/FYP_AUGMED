// Datasets page - grid of datasets with search

import { useState } from 'react'
import DatasetFilters from '../components/datasets/DatasetFilters'
import DatasetCard from '../components/datasets/DatasetCard'

// fake dataset list - just placeholders for now
const DATASETS = [
  {
    id: 1,
    name: 'NIH ChestX-ray14',
    source: 'NIH',
    itemCount: 112120,
    updated: '2026-01-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Montgomery TB',
    source: 'Montgomery',
    itemCount: 138,
    updated: '2026-01-10',
    status: 'active',
  },
  {
    id: 3,
    name: 'Shenzhen TB',
    source: 'Shenzhen',
    itemCount: 662,
    updated: '2025-12-20',
    status: 'active',
  },
  {
    id: 4,
    name: 'Local samples',
    source: 'Internal',
    itemCount: 24,
    updated: '2026-04-20',
    status: 'active',
  },
]

function DatasetsPage() {
  const [search, setSearch] = useState('')

  // filter datasets by search
  const filtered = DATASETS.filter((d) => {
    if (search.trim() === '') return true
    return d.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Datasets</h1>
      <p className="text-sm text-slate-500 mb-5">
        Showing {filtered.length} of {DATASETS.length} datasets registered in AugMed.
      </p>

      <DatasetFilters search={search} setSearch={setSearch} />

      {/* empty state */}
      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-10 border border-dashed border-slate-300 rounded-lg">
          No datasets match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DatasetCard key={d.id} dataset={d} />
          ))}
        </div>
      )}
    </section>
  )
}

export default DatasetsPage
