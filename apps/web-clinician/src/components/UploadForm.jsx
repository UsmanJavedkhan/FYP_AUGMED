import { useState } from 'react'

// helper to show file sizes nicely
function showSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function UploadForm({ onUpload, setErr }) {
  const [pickedFile, setPickedFile] = useState(null)
  const [patientRef, setPatientRef] = useState('')
  const [notesTxt, setNotesTxt] = useState('')
  const [uploading, setUploading] = useState(false)

  async function doSubmit(e) {
    e.preventDefault()
    if (!pickedFile) {
      setErr('Choose a chest X-ray image before uploading.')
      return
    }
    setUploading(true)
    setErr(null)
    try {
      await onUpload({ file: pickedFile, patientReference: patientRef, notes: notesTxt })
      setPatientRef('')
      setNotesTxt('')
      setPickedFile(null)
      e.target.reset()
    } catch (err) {
      setErr(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] p-6 shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)]"
      onSubmit={doSubmit}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h2 className="m-0 text-[1.05rem] font-bold tracking-tight">New Study</h2>
          <p className="mt-1 mb-0 text-[0.83rem] text-[#8a97b1]">PNG or JPEG, up to 25 MB. Processed locally.</p>
        </div>
      </div>

      <div className="grid gap-3.5">
        {/* dropzone */}
        <div
          className={`relative border-[1.5px] border-dashed rounded-[16px] p-7 text-center bg-[rgba(255,255,255,0.02)] cursor-pointer transition-all duration-200 hover:border-[#5eead4] hover:bg-[rgba(94,234,212,0.04)]
            ${pickedFile ? 'border-solid border-[rgba(94,234,212,0.5)] bg-[rgba(94,234,212,0.06)]' : 'border-[rgba(148,163,184,0.24)]'}`}
        >
          <div className="font-semibold mb-1">
            {pickedFile ? pickedFile.name : 'Drop chest X-ray or click to browse'}
          </div>
          <div className="text-[0.82rem] text-[#8a97b1]">
            {pickedFile ? showSize(pickedFile.size) : 'PNG · JPEG · local storage'}
          </div>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => setPickedFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* patient ref */}
        <div className="grid gap-1.5">
          <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">
            Patient reference
          </label>
          <input
            placeholder="XR-2026-0001"
            value={patientRef}
            onChange={(e) => setPatientRef(e.target.value)}
            className="bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.14)] rounded-xl py-[11px] px-3.5 text-[#e6edf7] outline-none transition-all duration-150 focus:border-[rgba(94,234,212,0.55)] focus:bg-[rgba(94,234,212,0.04)]"
          />
        </div>

        {/* notes */}
        <div className="grid gap-1.5">
          <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">
            Clinical notes
          </label>
          <textarea
            placeholder="Portable AP chest X-ray, fever and cough…"
            value={notesTxt}
            onChange={(e) => setNotesTxt(e.target.value)}
            className="bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.14)] rounded-xl py-[11px] px-3.5 text-[#e6edf7] outline-none min-h-[92px] resize-y transition-all duration-150 focus:border-[rgba(94,234,212,0.55)] focus:bg-[rgba(94,234,212,0.04)]"
          />
        </div>

        <button
          className="appearance-none border border-transparent rounded-xl py-3 px-[18px] font-semibold cursor-pointer text-[0.92rem] bg-gradient-to-br from-[#5eead4] to-[#60a5fa] text-[#06222a] shadow-[0_12px_30px_-14px_rgba(94,234,212,0.7)] hover:translate-y-[-1px] disabled:opacity-55 disabled:cursor-progress transition-transform duration-100"
          disabled={uploading}
          type="submit"
        >
          {uploading ? 'Processing…' : 'Upload & classify'}
        </button>
      </div>
    </form>
  )
}

export default UploadForm
