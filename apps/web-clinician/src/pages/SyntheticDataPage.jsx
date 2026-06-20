import { useMemo, useState } from 'react'

import { generateSynthetic, resolveStorageUrl } from '../api'

const CLASS_OPTIONS = [
  { value: 'Healthy', label: 'Healthy', enabled: true },
  { value: 'Pneumonia', label: 'Pneumonia (no model)', enabled: false },
  { value: 'Tuberculosis', label: 'Tuberculosis (no model)', enabled: false },
 
]

const CLASS_TONE = {
  Healthy: 'from-[rgba(52,211,153,0.18)] to-[rgba(52,211,153,0.05)] text-[#6ee7b7] border-[rgba(52,211,153,0.3)]',
  Pneumonia: 'from-[rgba(250,204,21,0.18)] to-[rgba(250,204,21,0.05)] text-[#fde047] border-[rgba(250,204,21,0.3)]',
  Tuberculosis: 'from-[rgba(248,113,113,0.18)] to-[rgba(248,113,113,0.05)] text-[#fca5a5] border-[rgba(248,113,113,0.3)]',
  
}

// Resolve whatever the backend returned (URL path, absolute URL, or base64) to a src string.
function resolveImageSrc(item) {
  if (item.image_url) return resolveStorageUrl(item.image_url)
  if (item.image_b64) {
    const prefix = item.image_b64.startsWith('data:') ? '' : 'data:image/png;base64,'
    return `${prefix}${item.image_b64}`
  }
  return null
}

function downloadImage(src, filename) {
  const link = document.createElement('a')
  link.href = src
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function SyntheticDataPage() {
  const [targetClass, setTargetClass] = useState('Healthy')
  const [count, setCount] = useState(4)
  const [seed, setSeed] = useState('')
  const [guidance, setGuidance] = useState(7.5)
  const [items, setItems] = useState([])
  const [running, setRunning] = useState(false)
  const [errMsg, setErrMsg] = useState(null)
  const [lastRunAt, setLastRunAt] = useState(null)

  const stats = useMemo(() => {
    const total = items.length
    const avgQ = items.reduce((s, i) => s + (i.quality_score ?? 0), 0) / Math.max(total, 1)
    const classBreakdown = items.reduce((acc, i) => {
      const key = i.class ?? targetClass
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
    return { total, avgQ, classBreakdown }
  }, [items, targetClass])

  async function runGenerate(e) {
    e?.preventDefault()
    setErrMsg(null)
    setRunning(true)
    try {
      const results = await generateSynthetic({ targetClass, count, seed, guidance })
      // tag each result with a stable local id for keys/downloads
      const stamped = results.map((item, idx) => ({
        ...item,
        id: item.id ?? `${Date.now()}-${idx}`,
        class: item.class ?? targetClass,
      }))
      setItems(stamped)
      setLastRunAt(new Date())
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Generation failed. Is the model endpoint wired up?')
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      {errMsg ? (
        <div className="p-3.5 px-[18] rounded-[14px] bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.25)] text-[#fca5a5] text-[0.9rem]">
          {errMsg}
        </div>
      ) : null}

      {/* Stats row */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <article className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[18px] p-5">
          <div className="text-[0.72rem] uppercase tracking-wider text-[#8a97b1]">Generated</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
          <div className="text-[0.78rem] text-[#8a97b1] mt-1">samples in this run</div>
        </article>
        <article className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[18px] p-5">
          <div className="text-[0.72rem] uppercase tracking-wider text-[#8a97b1]">Avg quality</div>
          <div className="text-2xl font-bold mt-1">{(stats.avgQ * 100).toFixed(0)}%</div>
          <div className="text-[0.78rem] text-[#8a97b1] mt-1">model confidence score</div>
        </article>
        <article className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[18px] p-5">
          <div className="text-[0.72rem] uppercase tracking-wider text-[#8a97b1]">Target class</div>
          <div className="text-2xl font-bold mt-1">{targetClass}</div>
          <div className="text-[0.78rem] text-[#8a97b1] mt-1">next generation target</div>
        </article>
        <article className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[18px] p-5">
          <div className="text-[0.72rem] uppercase tracking-wider text-[#8a97b1]">Last run</div>
          <div className="text-2xl font-bold mt-1">{lastRunAt ? lastRunAt.toLocaleTimeString() : '—'}</div>
          <div className="text-[0.78rem] text-[#8a97b1] mt-1">{lastRunAt ? lastRunAt.toLocaleDateString() : 'not run yet'}</div>
        </article>
      </section>

      {/* Main: generator + results */}
      <section className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-5 items-start max-[1160px]:grid-cols-1">
        {/* Generator form */}
        <form
          onSubmit={runGenerate}
          className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] p-6 shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)] grid gap-4"
        >
          <div>
            <h2 className="m-0 text-[1.05rem] font-bold tracking-tight">Synthetic Generator</h2>
           
          </div>

          <div className="grid gap-1.5">
            <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">
              Target class
            </label>
            <select
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              className="w-full min-w-0 bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.14)] rounded-xl py-[11px] px-3.5 text-[#e6edf7] outline-none transition-all duration-150 focus:border-[rgba(94,234,212,0.55)]"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c.value} value={c.value} disabled={!c.enabled}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5 min-w-0">
              <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">
                Count
              </label>
              <input
                type="number"
                min={1}
                max={32}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full min-w-0 bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.14)] rounded-xl py-[11px] px-3.5 text-[#e6edf7] outline-none transition-all duration-150 focus:border-[rgba(94,234,212,0.55)]"
              />
            </div>
            <div className="grid gap-1.5 min-w-0">
              <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">
                Seed
              </label>
              <input
                type="number"
                placeholder="random"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="w-full min-w-0 bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.14)] rounded-xl py-[11px] px-3.5 text-[#e6edf7] outline-none transition-all duration-150 focus:border-[rgba(94,234,212,0.55)]"
              />
            </div>
          </div>

          {/* <div className="grid gap-1.5">
            <label className="text-[0.78rem] text-[#8a97b1] uppercase tracking-wider font-semibold">
              Guidance scale · {guidance}
            </label>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={guidance}
              onChange={(e) => setGuidance(Number(e.target.value))}
              className="accent-[#5eead4]"
            />
            <div className="text-[0.75rem] text-[#6b7a96]">Lower = diverse · Higher = class-faithful</div>
          </div> */}

          <button
            type="submit"
            disabled={running}
            className="appearance-none border border-transparent rounded-xl py-3 px-[18px] font-semibold cursor-pointer text-[0.92rem] bg-gradient-to-br from-[#5eead4] to-[#60a5fa] text-[#06222a] shadow-[0_12px_30px_-14px_rgba(94,234,212,0.7)] hover:translate-y-[-1px] disabled:opacity-55 disabled:cursor-progress transition-transform duration-100"
          >
            {running ? 'Generating…' : 'Generate samples'}
          </button>

          <div className="text-[0.72rem] text-[#6b7a96] border-t border-[rgba(148,163,184,0.1)] pt-3 leading-relaxed">
            <strong className="text-[#8a97b1]">Note:</strong> First generation in a fresh API process loads
            the checkpoint into memory and may take a few seconds. Subsequent runs are near-instant on CPU.
          </div>
        </form>

        {/* Results grid */}
        <div className="bg-[rgba(18,26,46,0.72)] border border-[rgba(148,163,184,0.14)] rounded-[22px] p-6 shadow-[0_22px_48px_-20px_rgba(0,0,0,0.55)] min-h-[420px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="m-0 text-[1.05rem] font-bold tracking-tight">Generated Samples</h2>
              <p className="mt-1 mb-0 text-[0.83rem] text-[#8a97b1]">
                {items.length > 0
                  ? `${items.length} image${items.length === 1 ? '' : 's'} from last run`
                  : 'Run the generator to see outputs here'}
              </p>
            </div>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={() => setItems([])}
                className="text-[0.82rem] text-[#8a97b1] hover:text-[#e6edf7] cursor-pointer bg-transparent border border-[rgba(148,163,184,0.2)] rounded-lg py-1.5 px-3"
              >
                Clear
              </button>
            ) : null}
          </div>

          {items.length === 0 && !running ? (
            <div className="border border-dashed border-[rgba(148,163,184,0.2)] rounded-[16px] p-10 text-center text-[#8a97b1]">
              <div className="text-[2.5rem] mb-2 opacity-40">∅</div>
              <div className="font-semibold text-[#e6edf7] mb-1">No samples yet</div>
              <div className="text-[0.85rem]">
                Pick a class and hit <span className="text-[#5eead4]">Generate samples</span>.
              </div>
            </div>
          ) : null}

          {running ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              {Array.from({ length: Math.min(Number(count) || 4, 12) }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.1)] animate-pulse"
                />
              ))}
            </div>
          ) : null}

          {!running && items.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {items.map((item) => {
                const src = resolveImageSrc(item)
                const tone = CLASS_TONE[item.class] ?? CLASS_TONE.Healthy
                return (
                  <article
                    key={item.id}
                    className="rounded-[14px] overflow-hidden border border-[rgba(148,163,184,0.14)] bg-[rgba(10,15,30,0.6)] flex flex-col"
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={`synthetic ${item.class}`}
                        className="w-full aspect-square object-cover bg-black"
                      />
                    ) : (
                      <div className="w-full aspect-square grid place-items-center text-[#8a97b1] text-[0.75rem] bg-black/40">
                        no image payload
                      </div>
                    )}
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[0.7rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-gradient-to-br ${tone}`}>
                          {item.class}
                        </span>
                        {item.seed !== undefined && item.seed !== null ? (
                          <span className="text-[0.72rem] text-[#6b7a96]">seed {item.seed}</span>
                        ) : null}
                      </div>
                      {typeof item.quality_score === 'number' ? (
                        <div>
                          <div className="h-1 rounded-full bg-[rgba(148,163,184,0.14)] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#5eead4] to-[#60a5fa]"
                              style={{ width: `${Math.max(0, Math.min(1, item.quality_score)) * 100}%` }}
                            />
                          </div>
                          <div className="text-[0.7rem] text-[#8a97b1] mt-1">
                            Q {(item.quality_score * 100).toFixed(0)}%
                          </div>
                        </div>
                      ) : null}
                      {src ? (
                        <button
                          type="button"
                          onClick={() => downloadImage(src, `synthetic-${item.class}-${item.id}.png`)}
                          className="text-[0.78rem] text-[#5eead4] hover:text-[#a7f3d0] cursor-pointer bg-transparent border border-[rgba(94,234,212,0.3)] rounded-lg py-1.5 px-2 mt-1"
                        >
                          Download
                        </button>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}

export default SyntheticDataPage
