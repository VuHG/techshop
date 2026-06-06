import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  /** Render ô. Nhận record + chỉ số hàng. */
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  dangTai?: boolean;
  thongBaoRong?: string;
  onRowClick?: (row: T) => void;
}

/** Bảng dữ liệu dùng chung cho các trang admin. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  dangTai,
  thongBaoRong = 'Không có dữ liệu',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            {columns.map((c, i) => (
              <th key={i} className={cn('px-4 py-3', c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {dangTai ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                Đang tải...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                {thongBaoRong}
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('transition', onRowClick && 'cursor-pointer hover:bg-gray-50')}
              >
                {columns.map((c, ci) => (
                  <td key={ci} className={cn('px-4 py-3 align-middle', c.className)}>
                    {c.cell(row, ri)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
