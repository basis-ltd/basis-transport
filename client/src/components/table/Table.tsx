import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

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
  columns: ColumnDef<TData, TValue>[];
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

  const table = useReactTable({
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: resolvedManualPagination
      ? undefined
      : getPaginationRowModel(),
  });

  return (
    <>
      <section className={`w-full border rounded-md ${containerClassName}`}>
        <DataTable className={tableClassName}>
          <TableHeader className="px-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className={`text-[12px] text-black font-normal p-4 ${headerCellClassName}`}
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
                    <TableCell key={`skeleton-cell-${cellIdx}`} className="p-4">
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
                  className={`p-2 ${rowClickHandler ? 'cursor-pointer' : ''
                    } hover:bg-background ${typeof rowClassName === 'function'
                      ? rowClassName(row.original)
                      : rowClassName
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
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
                        className={`${preventAction ? '!cursor-auto' : ''
                          } text-[12px] text-black p-4 ${cellClassName}`}
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
                  <span className="text-gray-500 font-light text-[12px]">
                    {noDataMessage}
                  </span>
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
