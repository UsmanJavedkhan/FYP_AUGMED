// Datasets page - grid of sample chest X-ray images

import DatasetHeader from '../components/datasets/DatasetHeader'
import SampleCard from '../components/datasets/SampleCard'

// fake sample list - just placeholders for now
const SAMPLES = [
  { id: 1, name: 'sample_001.png', label: 'Healthy' },
  { id: 2, name: 'sample_002.png', label: 'Pneumonia' },
  { id: 3, name: 'sample_003.png', label: 'Tuberculosis' },
  { id: 4, name: 'sample_004.png', label: 'Healthy' },
  { id: 5, name: 'sample_005.png', label: 'Pneumonia' },
  { id: 6, name: 'sample_006.png', label: 'Healthy' },
  { id: 7, name: 'sample_007.png', label: 'Tuberculosis' },
  { id: 8, name: 'sample_008.png', label: 'Healthy' },
]

function DatasetsPage() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <h1 className="text-xl font-bold text-white mb-1">Datasets</h1>
      <p className="text-sm text-slate-400 mb-5">
        Browse the seeded chest X-ray samples that come with the project.
      </p>

      <DatasetHeader name="Sample chest X-rays" count={SAMPLES.length} />

      {/* grid of sample cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SAMPLES.map((s) => (
          <SampleCard key={s.id} sample={s} />
        ))}
      </div>
    </div>
  )
}

export default DatasetsPage
