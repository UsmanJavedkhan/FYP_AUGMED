// Tiny theme helper: persists the choice and toggles a `light` class on <html>.
// Dark is the default/base styling; the `.light` class in index.css overrides it.

const STORAGE_KEY = 'augmed-theme'

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme) {
  const isLight = theme === 'light'
  document.documentElement.classList.toggle('light', isLight)
  try {
    localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark')
  } catch {
    /* ignore storage failures (private mode etc.) */
  }
}

// Call once at startup so the saved theme is applied before first paint.
export function initTheme() {
  applyTheme(getStoredTheme())
}
