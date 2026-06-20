// shows the 4 kpi stat boxes at top

function StatsCards({ stats }) {
  const boxes = [
    { title: 'Total Cases', val: stats.total, desc: 'Seeded + uploaded' },
    { title: 'Pending Review', val: stats.pending, desc: 'Awaiting clinician sign-off' },
    { title: 'Reviewed', val: stats.reviewed, desc: 'Approved or corrected' },
    {
      title: 'Avg. Confidence',
      val: stats.total ? `${Math.round(stats.avgConfidence * 100)}%` : '—',
      desc: 'Baseline demo classifier',
    },
  ]

  return (
    <section className="grid grid-cols-4 gap-4 max-[1160px]:grid-cols-2 max-[460px]:grid-cols-1">
      {boxes.map((box) => (
        <article
          key={box.title}
          className="relative overflow-hidden p-5 px-[22px] bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(400px_120px_at_100%_0%,rgba(94,234,212,0.08),transparent_60%)] pointer-events-none" />
          <div className="text-[0.78rem] text-[#8a97b1] uppercase tracking-widest">{box.title}</div>
          <div className="text-[2rem] font-bold mt-2 tracking-tight">{box.val}</div>
          <div className="text-[0.8rem] text-[#5f6d87] mt-1.5">{box.desc}</div>
        </article>
      ))}
    </section>
  )
}

export default StatsCards
