// table that shows all the cases

import StatusBadge from './StatusBadge'

// helper to make the date look nice
function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function CaseTable({ cases }) {
  // empty state when no cases match
  if (cases.length === 0) {
    return (
      <div className="text-center text-slate-400 py-10 border border-dashed border-slate-700 rounded-lg">
        No cases found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-slate-700 rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Prediction</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-t border-slate-700 hover:bg-slate-800">
              <td className="px-4 py-3 font-medium text-white">
                {c.patient_reference || c.id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-slate-200">
                {c.prediction?.label || 'Pending'}
              </td>
              <td className="px-4 py-3 text-slate-200">
                {c.prediction
                  ? Math.round(c.prediction.confidence * 100) + '%'
                  : '-'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-4 py-3 text-slate-400">
                {formatDate(c.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CaseTable
