import {
  ChevronLeftIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UnknownAction } from '@reduxjs/toolkit';
import { Table } from '@tanstack/react-table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  setPage?: (page: number) => UnknownAction;
  setSize?: (size: number) => UnknownAction;
}

export function DataTablePagination<TData>({
  table,
  page = 1,
  size = 10,
  totalElements = 0,
  totalPages = 0,
  setPage,
  setSize,
}: DataTablePaginationProps<TData>) {
  return (
    <footer
      className="flex flex-col items-center gap-4 px-2 mt-4 
                     md:flex-row md:justify-between"
    >
      <article
        className="flex flex-col gap-1 w-full text-center 
                        md:w-auto md:text-left"
      >
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </p>
        )}
        {totalElements > 0 && (
          <p className="text-xs">Total records: {totalElements}</p>
        )}
      </article>

      <menu
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 
                       md:justify-end md:gap-x-6"
      >
        <section className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:block">Rows per page</p>
          <Select
            value={`${size}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              if (setSize) {
                setSize(Number(value));
              }
            }}
          >
            <SelectTrigger className="h-4 w-[70px] cursor-pointer">
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50].map((pageSize) => (
                <SelectItem
                  value={`${pageSize}`}
                  key={pageSize}
                  className="cursor-pointer hover:bg-background"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">
            Page {page} of {totalPages || 1}
          </p>
          <input
            type="number"
            min={1}
            max={totalPages || 1}
            defaultValue={page}
            className="w-12 text-center placeholder:text-xs text-xs py-1 px-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => {
              const targetPage = e.target.value ? Number(e.target.value) : 0;
              if (targetPage >= 1 && targetPage <= (totalPages || 1)) {
                table.setPageIndex(targetPage - 1);
                if (setPage) {
                  setPage(targetPage);
                }
              } else {
                e.target.value = String(page);
              }
            }}
            onBlur={(e) => {
              if (
                !e.target.value ||
                Number(e.target.value) < 1 ||
                Number(e.target.value) > (totalPages || 1)
              ) {
                e.target.value = String(page);
              }
            }}
            aria-label="Go to page number"
          />
        </section>

        <section className="flex items-center space-x-1">
          <Button
            variant="outline"
            className="w-8 h-8 p-0"
            onClick={() => {
              table.setPageIndex(0);
              if (setPage) setPage(1);
            }}
            disabled={page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0"
            onClick={() => {
              table.previousPage();
              if (setPage) setPage(page - 1);
            }}
            disabled={page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0"
            onClick={() => {
              table.nextPage();
              if (setPage) setPage(page + 1);
            }}
            disabled={page === (totalPages || 1)}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0"
            onClick={() => {
              table.setPageIndex((totalPages || 1) - 1);
              if (setPage) setPage(totalPages || 1);
            }}
            disabled={page === (totalPages || 1)}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="w-4 h-4" />
          </Button>
        </section>
      </menu>
    </footer>
  );
}
