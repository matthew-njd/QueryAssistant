interface Props {
  data: Record<string, unknown>[];
  rowCount: number;
  sql: string | null;
  onExport: () => void;
  exporting: boolean;
}

export function ResultsTable({
  data,
  rowCount,
  sql,
  onExport,
  exporting,
}: Props) {
  if (!data.length)
    return (
      <div className="alert alert-warning">
        <span>No results found for your query.</span>
      </div>
    );

  const columns = Object.keys(data[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="badge badge-neutral badge-lg">
          {rowCount} row{rowCount !== 1 ? "s" : ""} returned
        </div>
        <button
          className="btn btn-success btn-sm"
          onClick={onExport}
          disabled={exporting}
        >
          {exporting ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "⬇ Export to Excel"
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
                  className="bg-primary text-primary-content whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap">
                    {row[col] == null ? "—" : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
