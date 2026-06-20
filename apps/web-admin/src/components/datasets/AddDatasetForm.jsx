// small form to register a new dataset

import { useState } from 'react'

function AddDatasetForm({ onAdd }) {
  const [name, setName] = useState('')
  const [source, setSource] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [itemCount, setItemCount] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (name.trim() === '' || source.trim() === '') return
    setSaving(true)
    try {
      await onAdd({
        name: name.trim(),
        source: source.trim(),
        source_url: sourceUrl.trim() || null,
        item_count: Number(itemCount) || 0,
      })
      // clear the form after a successful add
      setName('')
      setSource('')
      setSourceUrl('')
      setItemCount('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-5 flex flex-wrap items-end gap-3"
    >
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs text-slate-500 mb-1">Dataset name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Wikimedia Commons CXR"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs text-slate-500 mb-1">Source</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Wikimedia Commons"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
      </div>

      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs text-slate-500 mb-1">Source URL (optional)</label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://…"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
      </div>

      <div className="w-28">
        <label className="block text-xs text-slate-500 mb-1">Items (reported)</label>
        <input
          type="number"
          min="0"
          value={itemCount}
          onChange={(e) => setItemCount(e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Adding…' : 'Add dataset'}
      </button>
    </form>
  )
}

export default AddDatasetForm
