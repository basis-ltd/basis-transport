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

import { DataTablePagination } from '@/components/table/TablePagination';
import { useState } from 'react';
import { UnknownAction } from '@reduxjs/toolkit';

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
}

export default function Table<TData, TValue>({
  columns = [],
  data = [],
  rowClickHandler = undefined,
  showPagination = true,
  page = 1,
  size = 10,
  totalCount = 0,
  totalPages = 1,
  setPage,
  setSize,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize: size,
      },
    },
    pageCount: totalPages,
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <>
      <section className="rounded-xl border border-primary/10 w-full bg-white/90">
        <DataTable className="min-w-[720px]">
          <TableHeader className="px-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="text-[13px] text-secondary p-4"
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
                      <figure
                        className={`animate-pulse bg-gray-200 rounded-[4px]`}
                        style={{
                          width: `${Math.random() * (70 - 50) + 50}%`,
                          height: '0.85rem',
                          animationDuration: '1.2s',
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`p-2 ${
                    rowClickHandler ? 'cursor-pointer' : ''
                  } hover:bg-background`}
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
                        className={`${
                          preventAction ? '!cursor-auto' : ''
                        } text-[13px] p-4`}
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
                  No results.
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
