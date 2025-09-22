import { ReactNode } from 'react';
import { cn } from '@utils/index';

interface AppleTableProps {
  columns: Array<{
    key: string;
    title: string;
    width?: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
  }>;
  data: Array<Record<string, any>>;
  onRowClick?: (row: Record<string, any>) => void;
  selectedRows?: string[];
  onRowSelect?: (id: string) => void;
  onSelectAll?: () => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

interface AppleTableRowProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

interface AppleTableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function AppleTable({
  columns,
  data,
  onRowClick,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  isLoading = false,
  emptyState,
  className,
}: AppleTableProps) {
  const hasSelection = onRowSelect || onSelectAll;
  const isAllSelected = selectedRows.length === data.length && data.length > 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-nova-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          {emptyState || (
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden',
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {hasSelection && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    aria-label="Select all rows"
                    className="w-4 h-4 text-nova-600 bg-gray-100 border-gray-300 rounded focus:ring-nova-500 dark:focus:ring-nova-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.width && `w-[${column.width}]`,
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, index) => (
              <AppleTableRow
                key={row.id || index}
                onClick={() => onRowClick?.(row)}
                selected={selectedRows.includes(row.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {hasSelection && (
                  <td className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => onRowSelect?.(row.id)}
                      aria-label={`Select row ${row.id}`}
                      className="w-4 h-4 text-nova-600 bg-gray-100 border-gray-300 rounded focus:ring-nova-500 dark:focus:ring-nova-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <AppleTableCell
                    key={column.key}
                    align={column.align}
                  >
                    {row[column.key]}
                  </AppleTableCell>
                ))}
              </AppleTableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AppleTableRow({
  children,
  onClick,
  selected = false,
  className,
}: AppleTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors duration-150',
        onClick && 'cursor-pointer',
        selected && 'bg-nova-50 dark:bg-nova-900/20',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function AppleTableCell({
  children,
  className,
  align = 'left',
}: AppleTableCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-4 text-sm text-gray-900 dark:text-gray-100',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className,
      )}
    >
      {children}
    </td>
  );
}