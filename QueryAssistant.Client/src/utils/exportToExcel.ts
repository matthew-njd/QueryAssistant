import * as XLSX from "xlsx";

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

export function exportDataToExcel(
  data: Record<string, unknown>[],
  question: string,
  fileName?: string,
): void {
  if (!data.length) return;

  const workbook = XLSX.utils.book_new();
  const groupingColumn = detectGroupingColumn(question, data[0]);

  if (groupingColumn) {
    addSheet(workbook, "All", data);

    const groups = data.reduce<Record<string, Record<string, unknown>[]>>(
      (acc, row) => {
        const key = String(row[groupingColumn] ?? "Unknown").trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
      },
      {},
    );

    Object.keys(groups)
      .sort()
      .forEach((key) =>
        addSheet(workbook, sanitizeSheetName(key), groups[key]),
      );
  } else {
    addSheet(workbook, "Results", data);
  }

  const output =
    fileName ?? `export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, output);
}

function addSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  data: Record<string, unknown>[],
): void {
  const columns = Object.keys(data[0]);

  const rows = data.map((row) =>
    columns.reduce(
      (acc, col) => {
        const value = row[col];
        if (value == null) {
          acc[col] = "";
        } else if (isCurrencyColumn(col) && !isNaN(Number(value))) {
          acc[col] = Number(value);
        } else {
          acc[col] = String(value);
        }
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  );

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns });

  // Style header row
  columns.forEach((_, i) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!worksheet[cellRef]) return;
    worksheet[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2563EB" } },
    };
  });

  // Set column widths based on content
  worksheet["!cols"] = columns.map((col) => ({
    wch: Math.min(
      Math.max(
        col.length,
        ...data.slice(0, 100).map((row) => String(row[col] ?? "").length),
      ),
      50,
    ),
  }));

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
}

function detectGroupingColumn(
  question: string,
  firstRow: Record<string, unknown>,
): string | null {
  const lower = question.toLowerCase();

  const groupingKeywords: Record<string, string> = {
    "customer type": "cus_type_cd",
    cus_type: "cus_type_cd",
    "sales rep": "slspsn_name",
    salesperson: "slspsn_name",
    territory: "terr",
    product: "prod_cat",
    category: "prod_cat",
    country: "ship_to_country",
    status: "status",
  };

  for (const [keyword, column] of Object.entries(groupingKeywords)) {
    if (lower.includes(keyword) && column in firstRow) return column;
  }

  return null;
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[:\\/?*[\]]/g, "_").slice(0, 31);
}
