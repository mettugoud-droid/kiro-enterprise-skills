interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  maxRows?: number;
}

export function DataTable<T extends Record<string, unknown>>({ data, columns, maxRows }: DataTableProps<T>) {
  const displayData = maxRows ? data.slice(0, maxRows) : data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`py-3 px-4 font-medium text-gray-600 ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {columns.map((col) => {
                const value = (row as Record<string, unknown>)[col.key as string];
                return (
                  <td
                    key={String(col.key)}
                    className={`py-3 px-4 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(value, row) : String(value ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {maxRows && data.length > maxRows && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Showing {maxRows} of {data.length} records
        </p>
      )}
    </div>
  );
}
