// one row in the reports list

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function ReportRow({ caseItem, onDownload }) {
  // a case has a report if status is reviewed
  const hasReport = caseItem.status === 'reviewed'

  return (
    <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg p-4">
      {/* left side - info */}
      <div>
        <div className="text-white font-semibold">
          {caseItem.patient_reference || caseItem.id.slice(0, 8)}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {caseItem.prediction?.label || 'Pending'} ·{' '}
          {formatDate(caseItem.updated_at)}
        </div>
      </div>

      {/* right side - status + download button */}
      <div className="flex items-center gap-3">
        {hasReport ? (
          <span className="text-xs text-green-400">Ready</span>
        ) : (
          <span className="text-xs text-yellow-400">Not generated</span>
        )}

        <button
          type="button"
          onClick={() => onDownload(caseItem.id)}
          disabled={!hasReport}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download PDF
        </button>
      </div>
    </div>
  )
}

export default ReportRow
