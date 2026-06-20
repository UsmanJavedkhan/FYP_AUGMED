// Model Registry page - list of model versions + metrics panel

import { useEffect, useState } from 'react'
import ModelTable from '../components/models/ModelTable'
import MetricsPanel from '../components/models/MetricsPanel'
import { fetchModels } from '../api'

function ModelsPage() {
  const [models, setModels] = useState([])
  const [pickedId, setPickedId] = useState(null)
  const [err, setErr] = useState(null)

  // load models from the api on mount
  useEffect(() => {
    fetchModels()
      .then((rows) => {
        setModels(rows)
        // default to the active model if there is one
        const active = rows.find((m) => m.status === 'active')
        setPickedId(active ? active.id : rows[0]?.id ?? null)
      })
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load models.'))
  }, [])

  // find the picked model object
  const pickedModel = models.find((m) => m.id === pickedId)

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Model Registry</h1>
      <p className="text-sm text-slate-500 mb-5">
        The models that make up the AugMed inference stack — classifier, discriminator, and generator.
      </p>

      {err ? (
        <div className="text-sm text-red-600 mb-4">{err}</div>
      ) : null}

      {/* table on top, metrics below */}
      <div className="flex flex-col gap-5">
        <ModelTable models={models} selectedId={pickedId} onSelect={setPickedId} />
        <MetricsPanel model={pickedModel} />
      </div>
    </section>
  )
}

export default ModelsPage
