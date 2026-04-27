// Model Registry page - list of model versions + metrics panel

import { useState } from 'react'
import ModelTable from '../components/models/ModelTable'
import MetricsPanel from '../components/models/MetricsPanel'

// fake list of models
const INITIAL_MODELS = [
  {
    id: 1,
    name: 'DenseNet121-CXR',
    version: 'v1.0',
    framework: 'PyTorch',
    accuracy: 87,
    status: 'active',
  },
  {
    id: 2,
    name: 'DenseNet121-CXR',
    version: 'v0.9',
    framework: 'PyTorch',
    accuracy: 84,
    status: 'archived',
  },
  {
    id: 3,
    name: 'ResNet50-CXR',
    version: 'v0.5',
    framework: 'PyTorch',
    accuracy: 81,
    status: 'archived',
  },
  {
    id: 4,
    name: 'EfficientNet-B0',
    version: 'v0.1',
    framework: 'PyTorch',
    accuracy: 0,
    status: 'training',
  },
]

function ModelsPage() {
  const [models, setModels] = useState(INITIAL_MODELS)
  const [pickedId, setPickedId] = useState(1)

  // promote a model to active (set the others to archived)
  function promoteModel(id) {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === id) return { ...m, status: 'active' }
        if (m.status === 'active') return { ...m, status: 'archived' }
        return m
      }),
    )
    setPickedId(id)
  }

  // find the picked model object
  const pickedModel = models.find((m) => m.id === pickedId)

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Model Registry</h1>
      <p className="text-sm text-slate-500 mb-5">
        Track model versions, accuracy, and which one is active in production.
      </p>

      {/* table on top, metrics below */}
      <div className="flex flex-col gap-5">
        <ModelTable models={models} onPromote={promoteModel} />
        <MetricsPanel model={pickedModel} />
      </div>
    </section>
  )
}

export default ModelsPage
