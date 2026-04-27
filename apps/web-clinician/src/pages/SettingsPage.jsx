// Settings page - profile, password, theme, notifications

import ProfileForm from '../components/settings/ProfileForm'
import PasswordForm from '../components/settings/PasswordForm'
import ThemeToggle from '../components/settings/ThemeToggle'
import NotificationPrefs from '../components/settings/NotificationPrefs'

function SettingsPage({ user }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
      <p className="text-sm text-slate-400 mb-5">
        Manage your profile, password, and preferences.
      </p>

      {/* two columns of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileForm user={user} />
        <PasswordForm />
        <ThemeToggle />
        <NotificationPrefs />
      </div>
    </div>
  )
}

export default SettingsPage
