import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  useTable,
} from '@tanstack/react-table';
import { appTableFeatures, type AppColumnDef } from './tableFeatures';

import {
  Table as DataTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { DataTablePagination } from './TablePagination';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { UnknownAction } from '@reduxjs/toolkit';
import { SkeletonLoader } from '../inputs/Loader';

interface DataTableProps<TData, TValue> {
  columns: AppColumnDef<TData, TValue>[];
  data: TData[];
  rowClickHandler?: undefined | ((row: TData) => void);
  showFilter?: boolean;
  showPagination?: boolean;
  showExport?: boolean;
  page?: number;
  size?: number;
  totalCount?: number;
  totalPages?: number;
  setPage?: (page: number) => UnknownAction;
  setSize?: (size: number) => UnknownAction;
  isLoading?: boolean;
  noDataMessage?: string | ReactNode;
  rowClassName?: string | ((row: TData) => string);
  manualPagination?: boolean;
  containerClassName?: string;
  tableClassName?: string;
  headerCellClassName?: string;
  cellClassName?: string;
}

export default function Table<TData, TValue>({
  columns = [],
  data = [],
  rowClickHandler = undefined,
  showPagination = true,
  page = 0,
  size = 10,
  totalCount = 0,
  totalPages = 1,
  setPage,
  setSize,
  isLoading = false,
  noDataMessage = 'No results.',
  rowClassName = '',
  manualPagination,
  containerClassName = '',
  tableClassName = '',
  headerCellClassName = '',
  cellClassName = '',
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: Math.max(0, page),
    pageSize: size,
  });

  const resolvedManualPagination =
    manualPagination ?? Boolean(setPage || setSize);

  useEffect(() => {
    setPagination({
      pageIndex: Math.max(0, page),
      pageSize: size,
    });
  }, [page, size]);

  const paginationState = useMemo(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize]
  );

  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: paginationState,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === 'function' ? updater(paginationState) : updater;
      setPagination(nextPagination);
      if (setPage) {
        setPage(nextPagination.pageIndex);
      }
      if (setSize) {
        setSize(nextPagination.pageSize);
      }
    },
    manualPagination: resolvedManualPagination,
  });

  return (
    <>
      {/* Two nested `overflow-x-auto` boxes were fighting over the same axis:
          this one and the `table-container` shadcn renders inside it. The inner
          one is the scroller, so this one clips instead — otherwise a table
          scrolled to its last column slides out past a rounded corner that is
          no longer clipping anything. */}
      <section
        className={`w-full overflow-hidden rounded-(--radius-card) border border-(--line) ${containerClassName}`}
      >
        <DataTable className={tableClassName}>
          <TableHeader className="px-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className={`h-(--control-md) px-3 text-[0.8125rem] font-medium text-(--muted) ${headerCellClassName}`}
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: size }).map((_, rowIdx) => (
                <TableRow key={`skeleton-row-${rowIdx}`}>
                  {columns.map((_, cellIdx) => (
                    <TableCell key={`skeleton-cell-${cellIdx}`} className="px-3 py-4">
                      <SkeletonLoader type="text" height='0.8rem' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`border-(--line) transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface) data-[state=selected]:bg-(--ink) data-[state=selected]:text-(--paper) ${
                    rowClickHandler ? 'cursor-pointer' : ''
                  } ${
                    typeof rowClassName === 'function'
                      ? rowClassName(row.original)
                      : rowClassName
                  }`}
                  onClick={() => rowClickHandler?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const preventAction = [
                      'no',
                      'action',
                      'checkbox',
                      'actions',
                    ].includes(
                      cell.column.id ||
                      (cell as unknown as { column: { accessorKey: string } })
                        ?.column?.accessorKey
                    );
                    return (
                      <TableCell
                        className={`h-12 px-3 text-sm ${
                          preventAction ? 'cursor-auto' : ''
                        } ${cellClassName}`}
                        key={cell.id}
                        onClick={(e) => {
                          if (preventAction) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <span className="type-meta">{noDataMessage}</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </DataTable>
      </section>
      {showPagination && (
        <DataTablePagination
          page={page}
          size={size}
          totalCount={totalCount}
          totalPages={totalPages}
          table={table}
          setPage={setPage}
          setSize={setSize}
        />
      )}
    </>
  );
}
