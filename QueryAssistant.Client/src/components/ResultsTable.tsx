import { useState } from "react";

const PAGE_SIZE = 25;

const CURRENCY_KEYWORDS = [
  "sales",
  "amt",
  "amount",
  "price",
  "cost",
  "total",
  "balance",
  "comm",
  "commission",
  "frt",
];

const isCurrencyColumn = (col: string): boolean => {
  const lower = col.toLowerCase();
  return CURRENCY_KEYWORDS.some((k) => lower.includes(k));
};

const formatValue = (col: string, value: unknown): string => {
  if (value == null) return "—";
  if (isCurrencyColumn(col) && !isNaN(Number(value))) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value));
  }
  return String(value);
};

interface Props {
  data: Record<string, unknown>[];
  sql: string | null;
  totalRows: number;
  onExport: () => void;
  exporting: boolean;
}

export function ResultsTable({
  data,
  sql,
  totalRows,
  onExport,
  exporting,
}: Props) {
  const [page, setPage] = useState(1);

  if (!data.length)
    return (
      <div className="alert alert-warning">
        <span>No results found for your query.</span>
      </div>
    );

  const columns = Object.keys(data[0]);
  const totalPages = Math.ceil(totalRows / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(page * PAGE_SIZE, totalRows);
  const pageData = data.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="badge badge-neutral badge-lg">
            {totalRows.toLocaleString()} total row{totalRows !== 1 ? "s" : ""}
          </div>
          <span className="text-sm text-base-content/60">
            Showing {(startIndex + 1).toLocaleString()}–
            {endIndex.toLocaleString()}
          </span>
        </div>
        <button
          className="btn btn-success btn-sm"
          onClick={onExport}
          disabled={exporting}
        >
          {exporting ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"
                />
              </svg>
              Export to Excel
            </>
          )}
        </button>
      </div>

      {/* SQL Preview */}
      {sql && (
        <div className="collapse collapse-arrow bg-base-200 rounded-box">
          <input type="checkbox" />
          <div className="collapse-title text-sm font-medium">
            View Generated SQL
          </div>
          <div className="collapse-content">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word">
              {sql}
            </pre>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-box border border-base-300">
        <table className="table table-zebra table-sm w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`bg-primary text-primary-content whitespace-nowrap ${isCurrencyColumn(col) ? "text-right" : ""}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td
                    key={col}
                    className={`whitespace-nowrap ${isCurrencyColumn(col) ? "text-right" : ""}`}
                  >
                    {formatValue(col, row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            {/* Previous */}
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              «
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((p, i) =>
              p === "ellipsis" ? (
                <button
                  key={`ellipsis-${i}`}
                  className="join-item btn btn-sm btn-disabled"
                >
                  ...
                </button>
              ) : (
                <button
                  key={p}
                  className={`join-item btn btn-sm ${page === p ? "btn-primary" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next */}
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
