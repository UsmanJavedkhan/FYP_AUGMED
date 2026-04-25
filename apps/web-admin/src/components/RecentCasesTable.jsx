// table of the most recent cases across the platform

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

// pill colors based on case status
function getPillStyle(status) {
  if (status === 'reviewed' || status === 'approved' || status === 'ready') {
    return 'bg-[rgba(16,185,129,0.12)] text-[#047857]'
  }
  if (status === 'review_pending' || status === 'planned' || status === 'pending_generation') {
    return 'bg-[rgba(245,158,11,0.15)] text-[#b45309]'
  }
  if (status === 'needs_follow_up' || status === 'rejected') {
    return 'bg-[rgba(239,68,68,0.12)] text-[#b91c1c]'
  }
  return 'bg-[rgba(148,163,184,0.15)] text-[#64748b]'
}

function RecentCasesTable({ cases }) {
  return (
    <section className="bg-white border border-[#e4e9f0] rounded-[20px] p-6 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]">
      <div className="flex justify-between items-start gap-4 mb-[18px]">
        <div>
          <h2 className="m-0 text-[1.05rem] font-bold">Recent Case Activity</h2>
          <p className="mt-1 mb-0 text-[0.84rem] text-[#64748b]">
            Latest audit surface across the platform.
          </p>
        </div>
      </div>

      {/* table header */}
      <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-4 px-4 py-3.5 text-[0.72rem] uppercase tracking-[0.1em] text-[#64748b] font-bold border-b border-[#e4e9f0]">
        <span>Case</span>
        <span>Status</span>
        <span>Prediction</span>
        <span>Updated</span>
      </div>

      {/* table rows */}
      {cases && cases.length > 0 ? (
        cases.map((c) => (
          <div
            className="grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-4 px-4 py-3.5 text-[0.88rem] items-center border-b border-[#e4e9f0] last:border-b-0"
            key={c.id}
          >
            <div>
              <strong className="font-semibold">{c.patient_reference ?? c.id}</strong>
              <p className="m-0 mt-0.5 text-[0.78rem] text-[#64748b]">{c.modality}</p>
            </div>
            <span
              className={`inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold capitalize ${getPillStyle(c.status)}`}
            >
              {c.status.replace(/_/g, ' ')}
            </span>
            <span>
              {c.prediction?.label ?? 'Pending'}
              {c.prediction ? ` · ${Math.round(c.prediction.confidence * 100)}%` : ''}
            </span>
            <span className="text-[#64748b]">{formatDate(c.updated_at)}</span>
          </div>
        ))
      ) : (
        <div className="px-4 py-3.5">
          <span className="text-[#64748b]">No case activity yet.</span>
        </div>
      )}
    </section>
  )
}

export default RecentCasesTable
