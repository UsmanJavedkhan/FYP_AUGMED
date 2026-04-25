// list of cases on the right side

function formatDate(val) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val))
}

// pill colors based on status
function getPillStyle(status) {
  if (status === 'review_pending') {
    return 'bg-[rgba(251,191,36,0.12)] text-[#fcd34d] border-[rgba(251,191,36,0.25)]'
  }
  if (status === 'reviewed' || status === 'approved' || status === 'ready') {
    return 'bg-[rgba(52,211,153,0.12)] text-[#6ee7b7] border-[rgba(52,211,153,0.25)]'
  }
  if (status === 'needs_follow_up' || status === 'rejected') {
    return 'bg-[rgba(248,113,113,0.12)] text-[#fca5a5] border-[rgba(248,113,113,0.25)]'
  }
  return 'bg-[rgba(148,163,184,0.12)] text-[#cbd5e1] border-[rgba(148,163,184,0.14)]'
}

function CaseList({ caseData, pickedId, onPick, onExport }) {
  return (
    <div className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] p-6 shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)]">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h2 className="m-0 text-[1.05rem] font-bold tracking-tight">Recent Cases</h2>
          <p className="mt-1 mb-0 text-[0.83rem] text-[#8a97b1]">
            {caseData.length} case{caseData.length === 1 ? '' : 's'} in workspace
          </p>
        </div>
        {caseData.length > 0 ? (
          <button
            className="bg-[rgba(255,255,255,0.04)] text-[#e6edf7] border border-[rgba(148,163,184,0.14)] rounded-xl py-3 px-[18px] font-semibold text-[0.92rem] cursor-pointer hover:bg-[rgba(255,255,255,0.07)]"
            type="button"
            onClick={onExport}
          >
            Export CSV
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-1">
        {caseData.length === 0 ? (
          <div className="py-11 px-6 text-center text-[#8a97b1] text-[0.9rem] border-[1.5px] border-dashed border-[rgba(148,163,184,0.14)] rounded-[16px]">
            No cases yet. Upload to get started.
          </div>
        ) : (
          caseData.map((c) => (
            <button
              key={c.id}
              className={`grid grid-cols-[1fr_auto] gap-3 p-3.5 px-4 border rounded-[14px] cursor-pointer text-left transition-all duration-150
                ${c.id === pickedId
                  ? 'border-[rgba(94,234,212,0.55)] bg-gradient-to-br from-[rgba(94,234,212,0.08)] to-[rgba(96,165,250,0.05)]'
                  : 'border-[rgba(148,163,184,0.14)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(148,163,184,0.24)] hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              onClick={() => onPick(c.id)}
              type="button"
            >
              <div>
                <div className="text-[0.72rem] text-[#8a97b1] tracking-wider uppercase">
                  {c.patient_reference ?? c.id}
                </div>
                <div className="font-semibold mt-0.5">{c.prediction?.label ?? 'Pending'}</div>
                <div className="text-[0.78rem] text-[#5f6d87] mt-1">
                  {c.prediction
                    ? `${Math.round(c.prediction.confidence * 100)}% · ${formatDate(c.updated_at)}`
                    : formatDate(c.updated_at)}
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold capitalize border ${getPillStyle(c.status)}`}>
                {c.status.replace(/_/g, ' ')}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default CaseList
