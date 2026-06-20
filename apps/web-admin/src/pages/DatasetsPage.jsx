// Datasets page - grid of datasets with search

import { useEffect, useState } from 'react'
import DatasetFilters from '../components/datasets/DatasetFilters'
import DatasetCard from '../components/datasets/DatasetCard'
import AddDatasetForm from '../components/datasets/AddDatasetForm'
import { fetchDatasets, createDataset, deleteDataset } from '../api'

function DatasetsPage() {
  const [datasets, setDatasets] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  // load datasets from the api (mapping fields to what DatasetCard expects)
  async function loadDatasets() {
    setErr(null)
    try {
      const rows = await fetchDatasets()
      const mapped = rows.map((d) => ({
        id: d.id,
        name: d.name,
        source: d.source,
        sourceUrl: d.source_url,
        itemCount: d.item_count,
        updated: d.updated_at ? d.updated_at.slice(0, 10) : '-',
        status: d.status,
      }))
      setDatasets(mapped)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load datasets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDatasets()
  }, [])

  // add a new dataset then refresh the list
  async function handleAdd(payload) {
    setErr(null)
    try {
      await createDataset(payload)
      await loadDatasets()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not add dataset.')
    }
  }

  // delete a dataset then refresh the list
  async function handleDelete(id) {
    setErr(null)
    try {
      await deleteDataset(id)
      await loadDatasets()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not delete dataset.')
    }
  }

  // filter datasets by search
  const filtered = datasets.filter((d) => {
    if (search.trim() === '') return true
    return d.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Datasets</h1>
      <p className="text-sm text-slate-500 mb-1">
        A catalog of the external datasets used to train and evaluate AugMed models.
      </p>
      <p className="text-xs text-slate-400 mb-5">
        Showing {filtered.length} of {datasets.length} registered. Item counts are documented metadata, not live file counts.
      </p>

      {err ? (
        <div className="text-sm text-red-600 mb-4">{err}</div>
      ) : null}

      <AddDatasetForm onAdd={handleAdd} />

      <DatasetFilters search={search} setSearch={setSearch} />

      {/* loading / empty state */}
      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading datasets…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-10 border border-dashed border-slate-300 rounded-lg">
          No datasets match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DatasetCard key={d.id} dataset={d} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  )
}

export default DatasetsPage
