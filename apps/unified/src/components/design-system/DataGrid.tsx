import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Copy,
  Search,
  Filter,
  Download,
  Settings,
  Check,
  X as XIcon
} from 'lucide-react';

export interface DataGridColumn<T = any> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  width?: number | string;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  cell?: (row: T, value: any) => React.ReactNode;
  editCell?: (row: T, value: any, onChange: (value: any) => void) => React.ReactNode;
}

export interface DataGridProps<T = any> {
  columns: DataGridColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T, field: string, value: any) => Promise<void>;
  onDelete?: (row: T) => Promise<void>;
  rowActions?: (row: T) => React.ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  pageSize?: number;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  configurable?: boolean;
}

export function DataGrid<T extends { id?: string | number }>({
  columns: initialColumns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  onEdit,
  onDelete,
  rowActions,
  selectable = false,
  onSelectionChange,
  pageSize = 25,
  searchable = true,
  filterable = true,
  exportable = true,
  configurable = true,
}: DataGridProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{ rowId: string | number; columnId: string } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.map(col => col.id))
  );

  // Filter visible columns
  const columns = useMemo(
    () => initialColumns.filter(col => visibleColumns.has(col.id)),
    [initialColumns, visibleColumns]
  );

  // Get cell value
  const getCellValue = (row: T, column: DataGridColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  // Handle sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.key);
      if (!column) return 0;

      const aValue = getCellValue(a, column);
      const bValue = getCellValue(b, column);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, columns]);

  // Handle search
  const searchedData = useMemo(() => {
    if (!searchQuery) return sortedData;

    return sortedData.filter(row =>
      columns.some(column => {
        const value = getCellValue(row, column);
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [sortedData, searchQuery, columns]);

  // Handle pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return searchedData.slice(start, end);
  }, [searchedData, currentPage, pageSize]);

  const totalPages = Math.ceil(searchedData.length / pageSize);

  // Handle selection
  const toggleRowSelection = (rowId: string | number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(data.filter(row => newSelection.has(row.id!)));
  };

  const toggleAllRows = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelection = new Set(paginatedData.map(row => row.id!));
      setSelectedRows(newSelection);
      onSelectionChange?.(paginatedData);
    }
  };

  // Handle sorting
  const handleSort = (columnId: string) => {
    setSortConfig(current => {
      if (current?.key === columnId) {
        return current.direction === 'asc'
          ? { key: columnId, direction: 'desc' }
          : null;
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Handle inline editing
  const handleCellEdit = async (row: T, columnId: string, value: any) => {
    setEditingCell(null);
    await onEdit?.(row, columnId, value);
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-apple-sm text-sm font-sf-text text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-400"
              />
            </div>
          )}

          {filterable && (
            <button className="px-4 py-2 rounded-apple-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-sf-text text-gray-700 dark:text-gray-300 transition-all duration-400 ease-apple flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {exportable && (
            <button className="p-2 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-400 ease-apple" aria-label="Export data">
              <Download className="w-4 h-4" />
            </button>
          )}

          {configurable && (
            <button className="p-2 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-400 ease-apple" aria-label="Configure columns">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass dark:glass-dark rounded-apple-lg overflow-hidden shadow-glass-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {selectable && (
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={toggleAllRows}
                      aria-label="Select all rows"
                      className="w-4 h-4 rounded border-gray-300 text-apple-blue focus:ring-apple-blue"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    style={{ width: column.width, minWidth: column.minWidth }}
                    className="px-4 py-3 text-left text-xs font-sf-text font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.id)}
                        className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        {column.header}
                        {sortConfig?.key === column.id && (
                          <span>
                            {sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {(rowActions || onDelete) && (
                  <th className="w-16 px-4 py-3"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions || onDelete ? 1 : 0)} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-3 border-apple-blue border-t-transparent rounded-full"
                      />
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions || onDelete ? 1 : 0)} className="px-4 py-12 text-center text-sm font-sf-text text-gray-500 dark:text-gray-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((row, rowIndex) => {
                    const rowId = row.id || rowIndex;
                    const isSelected = selectedRows.has(rowId);

                    return (
                      <motion.tr
                        key={rowId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25, delay: rowIndex * 0.02 }}
                        onClick={() => onRowClick?.(row)}
                        className={`
                          border-b border-gray-100 dark:border-gray-800 
                          ${onRowClick ? 'cursor-pointer' : ''}
                          ${isSelected ? 'bg-apple-blue/5 dark:bg-apple-blue/10' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}
                          transition-colors duration-400
                        `}
                      >
                        {selectable && (
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRowSelection(rowId)}
                              aria-label={`Select row ${rowId}`}
                              className="w-4 h-4 rounded border-gray-300 text-apple-blue focus:ring-apple-blue"
                            />
                          </td>
                        )}
                        {columns.map((column) => {
                          const value = getCellValue(row, column);
                          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === column.id;

                          return (
                            <td key={column.id} className="px-4 py-3">
                              {isEditing ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  {column.editCell ? (
                                    column.editCell(row, value, (newValue) => handleCellEdit(row, column.id, newValue))
                                  ) : (
                                    <>
                                      <input
                                        type="text"
                                        defaultValue={value}
                                        autoFocus
                                        aria-label={`Edit ${column.header}`}
                                        onBlur={(e) => handleCellEdit(row, column.id, e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleCellEdit(row, column.id, e.currentTarget.value);
                                          } else if (e.key === 'Escape') {
                                            setEditingCell(null);
                                          }
                                        }}
                                        className="flex-1 px-2 py-1 border border-apple-blue rounded text-sm font-sf-text focus:outline-none"
                                      />
                                      <button 
                                        onClick={() => setEditingCell(null)} 
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                        aria-label="Cancel editing"
                                      >
                                        <XIcon className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div 
                                  className="flex items-center gap-2 group"
                                  onDoubleClick={() => column.editable && onEdit && setEditingCell({ rowId, columnId: column.id })}
                                >
                                  <div className="text-sm font-sf-text text-gray-900 dark:text-white">
                                    {column.cell ? column.cell(row, value) : String(value || '-')}
                                  </div>
                                  {column.editable && onEdit && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingCell({ rowId, columnId: column.id });
                                      }}
                                      aria-label={`Edit ${column.header}`}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        {(rowActions || onDelete) && (
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {rowActions?.(row)}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(row)}
                                  className="p-1.5 rounded-apple-sm hover:bg-error-100 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400 transition-all duration-400 ease-apple"
                                  aria-label="Delete row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, searchedData.length)} of {searchedData.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-apple-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-sf-text text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-400 ease-apple"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-sf-text text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-apple-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-sf-text text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-400 ease-apple"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
