import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export default function DataTable<T extends { id?: string; uid?: string }>({
  columns,
  rows,
  emptyMessage = "No records found.",
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-brand-text-secondary text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-border text-left text-brand-text-secondary">
            {columns.map((col) => (
              <th key={col.header} className="py-3 px-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? row.uid ?? i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-brand-border last:border-0 ${
                onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.header} className={`py-3 px-3 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
