// the 4 KPI boxes at the top of overview

function KpiCards({ summary }) {
  const boxes = [
    { title: 'Total Cases', val: summary?.metrics.total_cases ?? 0, desc: 'Across clinician workspaces' },
    { title: 'Pending Reviews', val: summary?.metrics.pending_reviews ?? 0, desc: 'Awaiting expert sign-off' },
    { title: 'Active Users', val: summary?.metrics.active_users ?? 0, desc: 'Enabled accounts' },
    { title: 'Ready Reports', val: summary?.metrics.ready_reports ?? 0, desc: 'Approved cases' },
  ]

  return (
    <section className="grid grid-cols-4 gap-4 max-[1080px]:grid-cols-2">
      {boxes.map((box) => (
        <article
          key={box.title}
          className="p-[22px] bg-white border border-[#e4e9f0] rounded-[20px] shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]"
        >
          <div className="text-[0.76rem] text-[#64748b] uppercase tracking-widest font-semibold">
            {box.title}
          </div>
          <div className="text-[2.1rem] font-bold mt-2.5 tracking-tight">{box.val}</div>
          <div className="text-[0.8rem] text-[#94a3b8] mt-1">{box.desc}</div>
        </article>
      ))}
    </section>
  )
}

export default KpiCards
