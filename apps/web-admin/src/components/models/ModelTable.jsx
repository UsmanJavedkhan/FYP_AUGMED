// table that lists all model versions

import ModelStatusBadge from './ModelStatusBadge'

function ModelTable({ models, onPromote }) {
  if (models.length === 0) {
    return (
      <div className="text-center text-slate-500 py-10 border border-dashed border-slate-300 rounded-lg">
        No models registered yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Version</th>
            <th className="px-4 py-3">Framework</th>
            <th className="px-4 py-3">Accuracy</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.id} className="border-t border-slate-200 hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-800">{m.name}</td>
              <td className="px-4 py-3 text-slate-600">{m.version}</td>
              <td className="px-4 py-3 text-slate-600">{m.framework}</td>
              <td className="px-4 py-3 text-slate-600">{m.accuracy}%</td>
              <td className="px-4 py-3">
                <ModelStatusBadge status={m.status} />
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onPromote(m.id)}
                  disabled={m.status === 'active'}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {m.status === 'active' ? 'Active' : 'Promote'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ModelTable
