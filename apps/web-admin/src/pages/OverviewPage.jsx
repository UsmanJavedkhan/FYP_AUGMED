// the main overview dashboard page

import KpiCards from '../components/KpiCards'
import QueuesCard from '../components/QueuesCard'
import StorageCard from '../components/StorageCard'
import RecentCasesTable from '../components/RecentCasesTable'

function OverviewPage({ summary, errMsg }) {
  return (
    <>
      {errMsg ? (
        <div className="px-4 py-3.5 rounded-[14px] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.22)] text-[#b91c1c] text-[0.9rem]">
          {errMsg}
        </div>
      ) : null}

      <KpiCards summary={summary} />

      {/* two column row for queues + storage */}
      <section className="grid grid-cols-2 gap-5 max-[1080px]:grid-cols-1">
        <QueuesCard queues={summary?.queues} />
        <StorageCard storage={summary?.storage} />
      </section>

      <RecentCasesTable cases={summary?.recent_cases} />
    </>
  )
}

export default OverviewPage
