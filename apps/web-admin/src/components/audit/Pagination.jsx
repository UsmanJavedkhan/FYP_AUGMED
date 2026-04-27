// simple page next/previous buttons

function Pagination({ page, setPage, totalPages }) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-xs text-slate-500">
        Page {page} of {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
