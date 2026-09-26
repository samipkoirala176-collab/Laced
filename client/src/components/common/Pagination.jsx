export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
        Previous
      </button>
      <span className="text-slate-500">Page {page} of {totalPages}</span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
        Next
      </button>
    </div>
  );
}
