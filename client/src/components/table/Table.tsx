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
  import { ReactNode, useState } from 'react';
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
    totalElements?: number;
    totalPages?: number;
    setPage?: (page: number) => UnknownAction;
    setSize?: (size: number) => UnknownAction;
    isLoading?: boolean;
    noDataMessage?: string | ReactNode;
    rowClassName?: string | ((row: TData) => string);
  }
  
  export default function Table<TData, TValue>({
    columns = [],
    data = [],
    rowClickHandler = undefined,
    showPagination = true,
    page = 1,
    size = 10,
    totalElements = 0,
    totalPages = 1,
    setPage,
    setSize,
    isLoading = false,
    noDataMessage = 'No results.',
    rowClassName = '',
  }: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
  
    const table = useReactTable({
      data,
      columns,
      initialState: {
        sorting,
        columnVisibility,
        rowSelection,
        columnFilters,
        pagination: {
          pageIndex: page - 1,
          pageSize: size,
        },
      },
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
        <section className="w-full border rounded-md">
          <DataTable>
            <TableHeader className="px-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className="text-[14px] text-black p-4"
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
                            height: '0.75rem',
                            animationDuration: '1.4s',
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
                    } hover:bg-background ${
                      typeof rowClassName === 'function'
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
                    <section className="text-gray-500 font-light text-[14px]">
                      {noDataMessage}
                    </section>
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
            totalElements={totalElements}
            totalPages={totalPages}
            table={table}
            setPage={setPage}
            setSize={setSize}
          />
        )}
      </>
    );
  }
  