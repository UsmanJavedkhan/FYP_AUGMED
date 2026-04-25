import { useState } from 'react'

const choices = [
  { value: 'approved', label: 'Approve' },
  { value: 'corrected', label: 'Correct' },
  { value: 'rejected', label: 'Reject' },
]

function ReviewForm({ caseDetail, onSubmitReview, onRefresh, reviewerDefault }) {
  const [reviewer, setReviewer] = useState(reviewerDefault || 'Clinician')
  const [picked, setPicked] = useState('approved')
  const [fixedLabel, setFixedLabel] = useState('')
  const [commentTxt, setCommentTxt] = useState('')
  const [sending, setSending] = useState(false)

  async function doReview(e) {
    e.preventDefault()
    if (!caseDetail) return
    setSending(true)
    try {
      await onSubmitReview(caseDetail.id, {
        reviewer_name: reviewer.trim() || 'Clinician',
        decision: picked,
        corrected_label: picked === 'corrected' ? (fixedLabel || null) : null,
        comments: commentTxt || null,
      })
      setCommentTxt('')
    } catch (err) {
      // parent handles error
    } finally {
      setSending(false)
    }
  }

  if (!caseDetail) return null

  return (
    <form
      className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] p-6 shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)]"
      onSubmit={doReview}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h2 className="m-0 text-[1.05rem] font-bold tracking-tight">Expert Review</h2>
          <p className="mt-1 mb-0 text-[0.83rem] text-[#8a97b1]">Validate, correct, or reject the AI output.</p>
        </div>
      </div>

      {/* show existing review if there */}
      {caseDetail.review ? (
        <div className="p-3.5 px-4 bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.2)] rounded-xl text-[0.85rem] mb-3.5">
          <strong className="block mb-1">
            {caseDetail.review.reviewer_name} · {caseDetail.review.decision}
          </strong>
          {caseDetail.review.corrected_label ? (
            <div>Corrected label: {caseDetail.review.corrected_label}</div>
          ) : null}
          {caseDetail.review.comments ? (
            <div className="text-[#8a97b1] mt-1.5">{caseDetail.review.comments}</div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3.5">
        {/* reviewer name */}
        <div className="grid gap-1.5">
          <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">Reviewer</label>
          <input
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            className="bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.14)] rounded-xl py-[11px] px-3.5 text-[#e6edf7] outline-none transition-all duration-150 focus:border-[rgba(94,234,212,0.55)] focus:bg-[rgba(94,234,212,0.04)]"
          />
        </div>

        {/* decision radio buttons */}
        <div className="grid gap-1.5">
          <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">Decision</label>
          <div className="grid grid-cols-3 gap-2">
            {choices.map((ch) => (
              <label
                key={ch.value}
                className={`flex items-center justify-center py-[11px] px-2.5 border rounded-xl font-semibold text-[0.85rem] cursor-pointer transition-all duration-150
                  ${picked === ch.value
                    ? 'border-[rgba(94,234,212,0.55)] bg-[rgba(94,234,212,0.1)] text-[#e6edf7]'
                    : 'border-[rgba(148,163,184,0.14)] bg-[rgba(255,255,255,0.04)] hover:border-[rgba(148,163,184,0.24)]'
                  }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value={ch.value}
                  checked={picked === ch.value}
                  onChange={() => setPicked(ch.value)}
                  className="hidden"
                />
                <span>{ch.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* corrected label input */}
        {picked === 'corrected' ? (
          <div className="grid gap-1.5">
            <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">Corrected label</label>
            <input
              placeholder="e.g. Tuberculosis"
              value={fixedLabel}
              onChange={(e) => setFixedLabel(e.target.value)}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.14)] rounded-xl py-[11px] px-3.5 text-[#e6edf7] outline-none transition-all duration-150 focus:border-[rgba(94,234,212,0.55)] focus:bg-[rgba(94,234,212,0.04)]"
            />
          </div>
        ) : null}

        {/* comments */}
        <div className="grid gap-1.5">
          <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">Comments</label>
          <textarea
            placeholder="Findings, reasoning, follow-up notes…"
            value={commentTxt}
            onChange={(e) => setCommentTxt(e.target.value)}
            className="bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.14)] rounded-xl py-[11px] px-3.5 text-[#e6edf7] outline-none min-h-[92px] resize-y transition-all duration-150 focus:border-[rgba(94,234,212,0.55)] focus:bg-[rgba(94,234,212,0.04)]"
          />
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button
            className="appearance-none border border-transparent rounded-xl py-3 px-[18px] font-semibold cursor-pointer text-[0.92rem] bg-gradient-to-br from-[#5eead4] to-[#60a5fa] text-[#06222a] shadow-[0_12px_30px_-14px_rgba(94,234,212,0.7)] hover:translate-y-[-1px] disabled:opacity-55 disabled:cursor-progress transition-transform duration-100"
            type="submit"
            disabled={sending}
          >
            {sending ? 'Submitting…' : 'Submit review'}
          </button>
          <button
            className="bg-[rgba(255,255,255,0.04)] text-[#e6edf7] border border-[rgba(148,163,184,0.14)] rounded-xl py-3 px-[18px] font-semibold text-[0.92rem] cursor-pointer hover:bg-[rgba(255,255,255,0.07)]"
            type="button"
            onClick={onRefresh}
          >
            Refresh
          </button>
        </div>
      </div>
    </form>
  )
}

export default ReviewForm
