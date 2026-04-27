// turn notifications on or off (just UI)

import { useState } from 'react'

function NotificationPrefs() {
  // each notification on/off
  const [emailOnReview, setEmailOnReview] = useState(true)
  const [emailOnReport, setEmailOnReport] = useState(false)
  const [browserAlerts, setBrowserAlerts] = useState(false)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
      <h2 className="text-lg font-bold text-white mb-3">Notifications</h2>

      {/* email when a case is reviewed */}
      <label className="flex items-center justify-between py-2 border-b border-slate-700">
        <span className="text-sm text-slate-200">Email when my case is reviewed</span>
        <input
          type="checkbox"
          checked={emailOnReview}
          onChange={(e) => setEmailOnReview(e.target.checked)}
        />
      </label>

      {/* email when a report is ready */}
      <label className="flex items-center justify-between py-2 border-b border-slate-700">
        <span className="text-sm text-slate-200">Email when a report is ready</span>
        <input
          type="checkbox"
          checked={emailOnReport}
          onChange={(e) => setEmailOnReport(e.target.checked)}
        />
      </label>

      {/* browser alerts */}
      <label className="flex items-center justify-between py-2">
        <span className="text-sm text-slate-200">Browser pop-up alerts</span>
        <input
          type="checkbox"
          checked={browserAlerts}
          onChange={(e) => setBrowserAlerts(e.target.checked)}
        />
      </label>

      <p className="text-xs text-slate-500 mt-3">
        These settings are saved only in this browser tab for now.
      </p>
    </div>
  )
}

export default NotificationPrefs
