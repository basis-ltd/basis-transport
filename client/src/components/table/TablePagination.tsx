import {
  ChevronLeftIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { UnknownAction } from '@reduxjs/toolkit';
import { Table } from '@tanstack/react-table';
import { useMemo } from 'react';
interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  page?: number;
  size?: number;
  totalCount?: number;
  totalPages?: number;
  setPage?: (page: number) => UnknownAction;
  setSize?: (size: number) => UnknownAction;
}

export function DataTablePagination<TData>({
  table,
  page = 0,
  size = 5,
  totalCount = 0,
  totalPages = 0,
  setPage,
  setSize,
}: DataTablePaginationProps<TData>) {
  // STATE VARIABLES

  const pageSizes = useMemo(() => {
    const pageSizes = [
      {
        label: '5',
        value: 5,
      },
      {
        label: '10',
        value: 10,
      },
      {
        label: '20',
        value: 20,
      },
      {
        label: '50',
        value: 50,
      },
    ];

    if (pageSizes?.find((size) => size.value === totalCount)) {
      pageSizes.splice(pageSizes.findIndex(size => size.value === totalCount), 1);
    }
      
    if (totalCount > 0) {
      pageSizes.push({
        label: 'All',
        value: totalCount,
      });
    }

    return pageSizes;
  }, [totalCount]);

  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 px-2 my-4">
      <article className="flex flex-col gap-1">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <p className="text-[12px] text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </p>
        )}
        {totalCount > 0 && (
          <p className="text-[12px] text-muted-foreground">
            Total records: {totalCount}
          </p>
        )}
      </article>

      <menu className="flex flex-wrap items-center gap-2 sm:gap-6 lg:space-x-8">
        <section className="flex items-center space-x-2">
          <p className="hidden text-[13px] font-medium sm:block">Rows per page</p>
          <Select
            value={`${size}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              if (setSize) {
                setSize(Number(value));
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizes.map((pageSize) => (
                <SelectItem
                  value={`${pageSize.value}`}
                  key={pageSize.value}
                  className="cursor-pointer hover:bg-background"
                >
                  {pageSize?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="flex items-center text-sm font-medium">
          <p className="text-[13px]">
            Page {page + 1} of {totalPages || 1}
          </p>
        </section>

        <section className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalPages}
            className="w-12 text-center placeholder:text-[13px] text-[13px] py-1 px-2 border border-[#E5E5E5] rounded-md"
            onChange={(e) => {
              e.preventDefault();
              const value = Number(e.target.value);
              if (value > 0 && value <= totalPages) {
                table.setPageIndex(value - 1);
                if (setPage) {
                  setPage(value);
                }
              }
            }}
            placeholder={`${page}`}
          />
        </section>

        <section className="flex items-center space-x-1 lg:space-x-2">
          <Button
            variant="outline"
            className="w-8 h-8 p-0"
            onClick={() => {
              table.setPageIndex(0);
              if (setPage && page > 0) setPage(1);
            }}
            disabled={page === 0}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0"
            onClick={() => {
              table.previousPage();
              if (setPage && page > 0) setPage(page - 1);
            }}
            disabled={page === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0"
            onClick={() => {
              table.nextPage();
              if (setPage && page + 1 < totalPages) setPage(page + 1);
            }}
            disabled={page + 1 === (totalPages || 1)}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0"
            onClick={() => {
              table.setPageIndex(totalPages - 1);
              if (setPage && page + 1 < totalPages) setPage(totalPages);
            }}
            disabled={page + 1 === (totalPages || 1)}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="w-4 h-4" />
          </Button>
        </section>
      </menu>
    </footer>
  );
}
