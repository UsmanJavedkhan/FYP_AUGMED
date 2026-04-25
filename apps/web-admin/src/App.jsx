import { useEffect, useState } from 'react'

import { fetchAdminSummary, fetchHealth } from './api'
import { useAuth } from './auth'

// our components
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import OverviewPage from './pages/OverviewPage'
import UsersPage from './pages/UsersPage'

function App() {
  const { user, logout } = useAuth()

  // main state
  const [activePage, setActivePage] = useState('overview')
  const [summary, setSummary] = useState(null)
  const [apiHealth, setApiHealth] = useState(null)
  const [errMsg, setErrMsg] = useState(null)

  // load overview data on mount
  useEffect(() => {
    async function loadEverything() {
      setErrMsg(null)
      try {
        const [healthRes, summaryRes] = await Promise.all([fetchHealth(), fetchAdminSummary()])
        setApiHealth(healthRes)
        setSummary(summaryRes)
      } catch (err) {
        setErrMsg(err instanceof Error ? err.message : 'Unable to load admin data.')
      }
    }
    void loadEverything()
  }, [])

  // pick the title shown in the topbar
  const titleData =
    activePage === 'users'
      ? { title: 'Users & Roles', subtitle: 'Manage AugMed accounts, roles, and access.' }
      : { title: 'Operational Overview', subtitle: 'Platform health, queues, and case audit activity.' }

  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen max-[820px]:grid-cols-1">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex flex-col min-w-0">
        <Topbar
          title={titleData.title}
          subtitle={titleData.subtitle}
          apiStatus={apiHealth?.status}
          userData={user}
          onLogout={logout}
        />

        <main className="p-7 px-9 pb-15 flex flex-col gap-6 max-[820px]:px-5">
          {activePage === 'overview' ? (
            <OverviewPage summary={summary} errMsg={errMsg} />
          ) : null}

          {activePage === 'users' && user ? (
            <UsersPage currentUserId={user.id} />
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default App
