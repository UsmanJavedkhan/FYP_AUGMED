// table that lists all model versions

import ModelStatusBadge from './ModelStatusBadge'

function ModelTable({ models, selectedId, onSelect }) {
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
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr
              key={m.id}
              onClick={() => onSelect?.(m.id)}
              className={`border-t border-slate-200 cursor-pointer hover:bg-slate-50 ${
                m.id === selectedId ? 'bg-blue-50' : ''
              }`}
            >
              <td className="px-4 py-3 font-semibold text-slate-800">{m.name}</td>
              <td className="px-4 py-3 text-slate-600">{m.version}</td>
              <td className="px-4 py-3 text-slate-600">{m.framework}</td>
              <td className="px-4 py-3">
                <ModelStatusBadge status={m.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ModelTable
