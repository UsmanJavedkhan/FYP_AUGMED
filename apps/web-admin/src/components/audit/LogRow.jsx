// one row in the audit log table

function LogRow({ log }) {
  // pick a color tag for the action
  let actionColor = 'bg-slate-100 text-slate-600'
  if (log.action === 'upload') actionColor = 'bg-blue-100 text-blue-700'
  if (log.action === 'review') actionColor = 'bg-yellow-100 text-yellow-700'
  if (log.action === 'report') actionColor = 'bg-green-100 text-green-700'
  if (log.action === 'login') actionColor = 'bg-slate-100 text-slate-600'
  if (log.action === 'user_change') actionColor = 'bg-purple-100 text-purple-700'

  return (
    <tr className="border-t border-slate-200 hover:bg-slate-50">
      <td className="px-4 py-3 text-sm text-slate-600">{log.timestamp}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{log.actor}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${actionColor}`}>
          {log.action}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{log.target}</td>
    </tr>
  )
}

export default LogRow
