import { useState } from 'react'
import { resolveStorageUrl } from '../api'

// helper to show bytes in readable format
function showSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(val) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val))
}

// pill color helper
function getPillStyle(status) {
  if (status === 'review_pending') return 'bg-[rgba(251,191,36,0.12)] text-[#fcd34d] border-[rgba(251,191,36,0.25)]'
  if (status === 'reviewed' || status === 'approved' || status === 'ready') return 'bg-[rgba(52,211,153,0.12)] text-[#6ee7b7] border-[rgba(52,211,153,0.25)]'
  if (status === 'needs_follow_up' || status === 'rejected') return 'bg-[rgba(248,113,113,0.12)] text-[#fca5a5] border-[rgba(248,113,113,0.25)]'
  return 'bg-[rgba(148,163,184,0.12)] text-[#cbd5e1] border-[rgba(148,163,184,0.14)]'
}

function CaseViewer({ caseDetail, isLoading, onDownloadReport, downloading }) {
  const [imgMode, setImgMode] = useState('original')
  const [opacityVal, setOpacityVal] = useState(0.6)

  if (isLoading) {
    return (
      <div className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] p-6 shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)]">
        <div className="py-11 px-6 text-center text-[#8a97b1] text-[0.9rem] border-[1.5px] border-dashed border-[rgba(148,163,184,0.14)] rounded-[16px]">
          Loading case…
        </div>
      </div>
    )
  }

  if (!caseDetail) {
    return (
      <div className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] p-6 shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)]">
        <div className="py-11 px-6 text-center text-[#8a97b1] text-[0.9rem] border-[1.5px] border-dashed border-[rgba(148,163,184,0.14)] rounded-[16px]">
          Select a case from the right, or upload a new chest X-ray to begin.
        </div>
      </div>
    )
  }

  // resolve image urls
  const origUrl = resolveStorageUrl(caseDetail.uploaded_image?.url ?? null)
  const enhUrl = resolveStorageUrl(caseDetail.enhanced_image?.url ?? null)
  const heatUrl = resolveStorageUrl(caseDetail.heatmap?.url ?? null)

  const mainImg = imgMode === 'enhanced' ? (enhUrl ?? origUrl) : origUrl
  const showHeatmap = imgMode === 'heatmap' && Boolean(heatUrl)

  return (
    <div className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] p-6 shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)]">
      <div className="grid gap-[22px]">
        {/* header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="text-[0.75rem] text-[#8a97b1] tracking-widest uppercase">
              {caseDetail.patient_reference ?? caseDetail.id}
            </div>
            <h2 className="m-0 text-[1.45rem] tracking-tight">
              {caseDetail.prediction?.label ?? 'Awaiting prediction'}
            </h2>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold capitalize border ${getPillStyle(caseDetail.status)}`}>
            {caseDetail.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* image mode tabs */}
        <div className="flex gap-1.5 p-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.14)] rounded-xl w-fit">
          {[
            { key: 'original', text: 'Original', off: false },
            { key: 'enhanced', text: 'Enhanced', off: !enhUrl },
            { key: 'heatmap', text: 'Grad-CAM', off: !heatUrl },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`appearance-none bg-transparent border-none py-[7px] px-3.5 rounded-[9px] font-semibold text-[0.82rem] cursor-pointer
                ${imgMode === tab.key ? 'bg-[rgba(94,234,212,0.15)] text-[#e6edf7]' : 'text-[#8a97b1]'}`}
              onClick={() => setImgMode(tab.key)}
              type="button"
              disabled={tab.off}
            >
              {tab.text}
            </button>
          ))}
        </div>

        {/* xray viewer */}
        <div className="bg-black rounded-[16px] overflow-hidden relative aspect-square border border-[rgba(148,163,184,0.14)]">
          {mainImg ? (
            <img src={mainImg} alt={caseDetail.patient_reference ?? 'chest x-ray'} className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-[#5f6d87] text-[0.85rem]">
              No image artifact available
            </div>
          )}
          {showHeatmap && heatUrl ? (
            <img
              src={heatUrl}
              style={{ opacity: opacityVal, mixBlendMode: 'screen' }}
              alt="explainability overlay"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          ) : null}
        </div>

        {/* opacity slider for heatmap */}
        {imgMode === 'heatmap' ? (
          <div className="flex items-center gap-3.5 p-3 px-3.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.14)] rounded-xl text-[0.82rem] text-[#8a97b1]">
            <span>Overlay opacity</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacityVal}
              onChange={(e) => setOpacityVal(Number(e.target.value))}
              className="flex-1 accent-[#5eead4]"
            />
            <span>{Math.round(opacityVal * 100)}%</span>
          </div>
        ) : null}

        {/* prediction info */}
        {caseDetail.prediction ? (
          <div>
            <div className="flex justify-between items-baseline gap-2.5 mb-2.5">
              <span className="text-[1.25rem] font-bold">{caseDetail.prediction.label}</span>
              <span className="text-[1.25rem] font-bold text-[#5eead4] font-mono">
                {Math.round(caseDetail.prediction.confidence * 100)}%
              </span>
            </div>

            {/* confidence bar */}
            <div className="h-2.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden border border-[rgba(148,163,184,0.14)]">
              <div
                className="h-full bg-gradient-to-r from-[#5eead4] to-[#60a5fa] rounded-full transition-all duration-400"
                style={{ width: `${caseDetail.prediction.confidence * 100}%` }}
              />
            </div>

            {/* metadata */}
            <dl className="grid grid-cols-2 gap-x-[22px] gap-y-2.5 mt-3.5 text-[0.84rem]">
              <div>
                <dt className="text-[#8a97b1] uppercase tracking-wider text-[0.7rem]">Model</dt>
                <dd className="mt-0.5 text-[#e6edf7] font-medium m-0">
                  {caseDetail.prediction.model_name} · v{caseDetail.prediction.model_version}
                </dd>
              </div>
              <div>
                <dt className="text-[#8a97b1] uppercase tracking-wider text-[0.7rem]">Modality</dt>
                <dd className="mt-0.5 text-[#e6edf7] font-medium m-0">{caseDetail.modality}</dd>
              </div>
              <div>
                <dt className="text-[#8a97b1] uppercase tracking-wider text-[0.7rem]">Dimensions</dt>
                <dd className="mt-0.5 text-[#e6edf7] font-medium m-0">
                  {caseDetail.uploaded_image?.width ?? '—'} × {caseDetail.uploaded_image?.height ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[#8a97b1] uppercase tracking-wider text-[0.7rem]">File size</dt>
                <dd className="mt-0.5 text-[#e6edf7] font-medium m-0">{showSize(caseDetail.uploaded_image?.size_bytes)}</dd>
              </div>
              <div>
                <dt className="text-[#8a97b1] uppercase tracking-wider text-[0.7rem]">Uploaded</dt>
                <dd className="mt-0.5 text-[#e6edf7] font-medium m-0">{formatDate(caseDetail.created_at)}</dd>
              </div>
              <div>
                <dt className="text-[#8a97b1] uppercase tracking-wider text-[0.7rem]">Report</dt>
                <dd className="mt-0.5 text-[#e6edf7] font-medium m-0">{caseDetail.report?.status ?? 'pending'}</dd>
              </div>
            </dl>

            {caseDetail.notes ? (
              <p className="mt-3.5 text-[#8a97b1] text-[0.88rem]">{caseDetail.notes}</p>
            ) : null}

            <div className="flex gap-2.5 flex-wrap mt-4">
              <button
                className="appearance-none border border-transparent rounded-xl py-3 px-[18px] font-semibold cursor-pointer text-[0.92rem] bg-gradient-to-br from-[#5eead4] to-[#60a5fa] text-[#06222a] shadow-[0_12px_30px_-14px_rgba(94,234,212,0.7)] hover:translate-y-[-1px] disabled:opacity-55 disabled:cursor-progress transition-transform duration-100"
                type="button"
                onClick={onDownloadReport}
                disabled={downloading}
              >
                {downloading ? 'Generating…' : 'Download PDF Report'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CaseViewer
