// shows the storage buckets and file counts

function StorageCard({ storage }) {
  return (
    <article className="bg-white border border-[#e4e9f0] rounded-[20px] p-6 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)]">
      <div className="flex justify-between items-start gap-4 mb-[18px]">
        <div>
          <h2 className="m-0 text-[1.05rem] font-bold">Storage Footprint</h2>
          <p className="mt-1 mb-0 text-[0.84rem] text-[#64748b]">Local filesystem artifacts.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {storage ? (
          storage.map((bucket) => (
            <div
              className="grid grid-cols-[1fr_auto] gap-3.5 items-center p-3.5 px-4 bg-[#f3f6fa] border border-[#e4e9f0] rounded-xl"
              key={bucket.name}
            >
              <div>
                <strong className="block text-[0.94rem] capitalize">{bucket.name}</strong>
                <p className="mt-0.5 mb-0 text-[0.8rem] text-[#64748b] break-all">
                  {bucket.path}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold bg-[rgba(16,185,129,0.12)] text-[#047857]">
                {bucket.file_count} files
              </span>
            </div>
          ))
        ) : (
          <p className="text-[#64748b] text-[0.9rem]">Loading storage data…</p>
        )}
      </div>
    </article>
  )
}

export default StorageCard
