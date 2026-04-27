// one card for a sample image in the dataset

function SampleCard({ sample }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* placeholder for image - just a gray box for now */}
      <div className="w-full aspect-square bg-slate-900 flex items-center justify-center text-slate-600 text-xs">
        {sample.thumb ? (
          <img
            src={sample.thumb}
            alt={sample.name}
            className="w-full h-full object-cover"
          />
        ) : (
          'X-RAY'
        )}
      </div>

      {/* info under the image */}
      <div className="p-3">
        <div className="text-sm text-white font-semibold truncate">
          {sample.name}
        </div>
        <div className="text-xs text-slate-400 mt-1">{sample.label}</div>

        {/* use this image button */}
        <button
          type="button"
          className="mt-2 w-full px-2 py-1.5 rounded-lg bg-slate-700 text-white text-xs hover:bg-slate-600"
        >
          Use in upload
        </button>
      </div>
    </div>
  )
}

export default SampleCard
