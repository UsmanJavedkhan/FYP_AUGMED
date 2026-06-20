// pick light or dark theme — persisted and applied app-wide

import { useState } from 'react'
import { applyTheme, getStoredTheme } from '../../theme'

function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme)

  function choose(next) {
    setTheme(next)
    applyTheme(next)
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
      <h2 className="text-lg font-bold text-white mb-3">Appearance</h2>
      <p className="text-xs text-slate-400 mb-3">Choose how the app looks.</p>

      {/* two big buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => choose('light')}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold border ${
            theme === 'light'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          Light
        </button>

        <button
          type="button"
          onClick={() => choose('dark')}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold border ${
            theme === 'dark'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          Dark
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Current theme: <span className="text-white capitalize">{theme}</span>. Saved on this device.
      </p>
    </div>
  )
}

export default ThemeToggle
