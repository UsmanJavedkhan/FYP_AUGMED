import { useEffect, useMemo, useState } from 'react'

import { fetchCase, fetchCases, fetchHealth, generateReport, submitReview, uploadCase } from './api'
import { useAuth } from './auth'

// our components
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import StatsCards from './components/StatsCards'
import UploadForm from './components/UploadForm'
import CaseList from './components/CaseList'
import CaseViewer from './components/CaseViewer'
import ReviewForm from './components/ReviewForm'
import SyntheticDataPage from './pages/SyntheticDataPage'
import CasesPage from './pages/CasesPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import DatasetsPage from './pages/DatasetsPage'
function App() {
  const { user, logout } = useAuth()

  // main state stuff
  const [activePage, setActivePage] = useState('workspace')
  const [menuOpen, setMenuOpen] = useState(false)
  const [apiHealth, setApiHealth] = useState(null)
  const [allCases, setAllCases] = useState([])
  const [pickedId, setPickedId] = useState(null)
  const [caseDetail, setCaseDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [errMsg, setErrMsg] = useState(null)
  const [downloading, setDownloading] = useState(false)

  // load all data on mount
  async function loadEverything() {
    setErrMsg(null)
    try {
      const [healthRes, casesRes] = await Promise.all([fetchHealth(), fetchCases()])
      setApiHealth(healthRes)
      setAllCases(casesRes)
      if (casesRes.length > 0 && !pickedId) {
        setPickedId(casesRes[0].id)
      }
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Unable to reach the AugMed API.')
    }
  }

  useEffect(() => {
    void loadEverything()
  }, [])

  // load detail when case is picked
  useEffect(() => {
    if (!pickedId) {
      setCaseDetail(null)
      return
    }
    let ignore = false
    setLoadingDetail(true)
    fetchCase(pickedId)
      .then((data) => {
        if (!ignore) setCaseDetail(data)
      })
      .catch((err) => {
        if (!ignore) setErrMsg(err instanceof Error ? err.message : 'Unable to load case detail.')
      })
      .finally(() => {
        if (!ignore) setLoadingDetail(false)
      })
    return () => { ignore = true }
  }, [pickedId])

  // handle new upload
  async function doUpload({ file, patientReference, notes }) {
    const newCase = await uploadCase({ file, patientReference, notes })
    setAllCases((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)])
    setPickedId(newCase.id)
    setCaseDetail(newCase)
    return newCase
  }

  // handle review submit
  async function doReview(caseId, reviewData) {
    setErrMsg(null)
    try {
      const updated = await submitReview(caseId, reviewData)
      setCaseDetail(updated)
      setAllCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Review submission failed.')
    }
  }

  // download pdf report
  async function doDownloadReport() {
    if (!caseDetail) return
    setDownloading(true)
    setErrMsg(null)
    try {
      const blob = await generateReport(caseDetail.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `augmed-report-${caseDetail.id.slice(0, 12)}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      // refresh the case after report gen
      const updated = await fetchCase(caseDetail.id)
      setCaseDetail(updated)
      setAllCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Report generation failed.')
    } finally {
      setDownloading(false)
    }
  }

  // download report by case id (used from Reports page)
  async function doDownloadReportById(caseId) {
    setErrMsg(null)
    try {
      const blob = await generateReport(caseId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `augmed-report-${caseId.slice(0, 12)}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Report generation failed.')
    }
  }

  // calculate stats from cases
  const stats = useMemo(() => {
    const total = allCases.length
    const pending = allCases.filter((c) => c.status === 'review_pending').length
    const reviewed = allCases.filter((c) => c.status === 'reviewed').length
    const avgConfidence = allCases.reduce((sum, c) => sum + (c.prediction?.confidence ?? 0), 0) / Math.max(total, 1)
    return { total, pending, reviewed, avgConfidence }
  }, [allCases])

  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen max-[820px]:grid-cols-1">
      <Sidebar
        activePage={activePage}
        onNavigate={(id) => {
          setActivePage(id)
          setMenuOpen(false)
        }}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={logout}
        user={user}
      />

      <div className="flex flex-col min-w-0">
        <Topbar
          apiStatus={apiHealth?.status}
          userData={user}
          onLogout={logout}
          onMenuToggle={() => setMenuOpen((v) => !v)}
          activePage={activePage}
        />

        <main className="p-7 px-9 pb-15 flex flex-col gap-6 max-[820px]:px-5 max-[480px]:p-4 max-[480px]:pb-10">
          {activePage === 'workspace' ? (
            <>
              {errMsg ? (
                <div className="p-3.5 px-[18px] rounded-[14px] bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.25)] text-[#fca5a5] text-[0.9rem]">
                  {errMsg}
                </div>
              ) : null}

              <StatsCards stats={stats} />

              {/* main workspace area */}
              <section className="grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-5 items-start max-[1160px]:grid-cols-1">
                {/* left side - case viewer */}
                <CaseViewer
                  caseDetail={caseDetail}
                  isLoading={loadingDetail}
                  onDownloadReport={doDownloadReport}
                  downloading={downloading}
                />

                {/* right side - upload, list, review */}
                <div className="flex flex-col gap-5">
                  <UploadForm onUpload={doUpload} setErr={setErrMsg} />

                  <CaseList
                    caseData={allCases}
                    pickedId={pickedId}
                    onPick={setPickedId}
                  />

                  <ReviewForm
                    caseDetail={caseDetail}
                    onSubmitReview={doReview}
                    onRefresh={() => void loadEverything()}
                    reviewerDefault={user?.full_name}
                    canReview={user?.role === 'reviewer'}
                  />
                </div>
              </section>
            </>
          ) : null}

          {activePage === 'synthetic' ? <SyntheticDataPage /> : null}

          {activePage === 'cases' ? <CasesPage cases={allCases} /> : null}

          {activePage === 'reports' ? (
            <ReportsPage cases={allCases} onDownloadReport={doDownloadReportById} />
          ) : null}

          {activePage === 'datasets' ? <DatasetsPage /> : null}

          {activePage === 'settings' ? <SettingsPage user={user} /> : null}
        </main>
      
      </div>
    </div>
    

    
  )
}

export default App
