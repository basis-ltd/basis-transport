import { ChevronLeftIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { UnknownAction } from "@reduxjs/toolkit";
import { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { formatNumbers } from "@/helpers/strings.helper";

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
  size = 10,
  totalCount = 0,
  totalPages = 0,
  setPage,
  setSize,
}: DataTablePaginationProps<TData>) {

  const pageSizeOptions = useMemo(() => {
    const options = [{
      label: '5',
      value: 5,
    }, {
      label: '10',
      value: 10,
    }, {
      label: '20',
      value: 20,
    }, {
      label: '50',
      value: 50,
    }];

    if (totalCount > 50) {
      options.push({
        label: 'All',
        value: totalCount,
      });
    }

    return options;
  }, [totalCount]);

  return (
    <footer className="flex flex-col items-center gap-4 px-2 mt-4 
                   md:flex-row md:justify-between">
      <article className="flex flex-col gap-1 w-full text-center 
                      md:w-auto md:text-left">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>
        )}
        {totalCount > 0 && (
          <span className="text-xs">
            Total records: {formatNumbers(totalCount)}
          </span>
        )}
      </article>

      <menu className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 
                     md:justify-end md:gap-x-6">
        <section className="flex items-center space-x-2">
          <span className="hidden text-[11px] font-normal sm:block">Rows per page</span>
          <Select
            value={`${size}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              if (setSize) {
                setSize(Number(value));
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px] cursor-pointer">
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((option) => (
                <SelectItem
                  value={`${option.value}`}
                  key={option.value}
                  className="cursor-pointer hover:bg-background text-[11px] font-normal"
                >
                  {option?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="flex items-center gap-2">
          <span className="text-[11px] font-normal whitespace-nowrap">
            Page {page + 1} of {formatNumbers(totalPages || 1)}
          </span>
          <input
            type="number"
            min={1}
            max={totalPages || 1}
            defaultValue={page + 1}
            className="w-12 text-center placeholder:text-[11px] text-[11px] py-1 px-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => {
              const targetPage = e.target.value ? Number(e.target.value) : 0;
              if (targetPage >= 1 && targetPage <= (totalPages || 1)) {
                table.setPageIndex(targetPage - 1);
                if (setPage) {
                  setPage(targetPage);
                }
              } else if (targetPage === 0) {
                // Allow clearing or handle as needed
              } else {
                // Optional: Reset to current page if invalid
                e.target.value = String(page + 1);
              }
            }}
            onBlur={(e) => {
              if (!e.target.value || Number(e.target.value) < 1 || Number(e.target.value) > (totalPages || 1)) {
                e.target.value = String(page + 1);
              }
            }}
            aria-label="Go to page number"
          />
        </section>

        <section className="flex items-center space-x-1">
          <Button
            variant="outline"
            className="w-8 h-8 p-0 cursor-pointer"
            onClick={() => {
              table.setPageIndex(0);
              if (setPage) setPage(0);
            }}
            disabled={page === 0}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0 cursor-pointer"
            onClick={() => {
              table.previousPage();
              if (setPage) setPage((page - 1) as unknown as number);
            }}
            disabled={page === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0 cursor-pointer"
            onClick={() => {
              table.nextPage();
              if (setPage) setPage((page + 1) as unknown as number);
            }}
            disabled={totalPages === 0 || page >= (totalPages - 1)}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0 cursor-pointer"
            onClick={() => {
              table.setPageIndex((totalPages - 1) || 0);
              if (setPage) setPage((totalPages - 1) || 0 as unknown as number);
            }}
            disabled={totalPages === 0 || page >= (totalPages - 1)}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="w-4 h-4" />
          </Button>
        </section>
      </menu>
    </footer>
  );
}
