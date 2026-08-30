import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../inputs/Button";
import { controlClassName, panelClassName, panelItemClassName } from "../inputs/control";
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
          <span className="type-meta">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>
        )}
        {totalCount > 0 && (
          <span className="type-meta">
            Total records: {formatNumbers(totalCount)}
          </span>
        )}
      </article>

      <menu className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 
                     md:justify-end md:gap-x-6">
        <section className="flex items-center space-x-2">
          <span className="type-meta hidden sm:block">Rows per page</span>
          <Select
            value={`${size}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              if (setSize) {
                setSize(Number(value));
              }
            }}
          >
            <SelectTrigger className={`${controlClassName} h-(--control-sm) w-[76px] cursor-pointer justify-between`}>
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent side="top" className={panelClassName}>
              {pageSizeOptions.map((option) => (
                <SelectItem
                  value={`${option.value}`}
                  key={option.value}
                  className={panelItemClassName}
                >
                  {option?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="flex items-center gap-2">
          <span className="type-meta whitespace-nowrap">
            Page {page + 1} of {formatNumbers(totalPages || 1)}
          </span>
          <input
            type="number"
            min={1}
            max={totalPages || 1}
            defaultValue={page + 1}
            className={`${controlClassName} h-(--control-sm) w-14 px-2 text-center tabular`}
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
            type="button"
            size="icon-sm"
            onClick={() => {
              table.setPageIndex(0);
              if (setPage) setPage(0);
            }}
            disabled={page === 0}
          >
            <span className="sr-only">Go to first page</span>
            <FontAwesomeIcon icon={faAnglesLeft} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            onClick={() => {
              table.previousPage();
              if (setPage) setPage((page - 1) as unknown as number);
            }}
            disabled={page === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <FontAwesomeIcon icon={faAngleLeft} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            onClick={() => {
              table.nextPage();
              if (setPage) setPage((page + 1) as unknown as number);
            }}
            disabled={totalPages === 0 || page >= (totalPages - 1)}
          >
            <span className="sr-only">Go to next page</span>
            <FontAwesomeIcon icon={faAngleRight} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            onClick={() => {
              table.setPageIndex((totalPages - 1) || 0);
              if (setPage) setPage((totalPages - 1) || 0 as unknown as number);
            }}
            disabled={totalPages === 0 || page >= (totalPages - 1)}
          >
            <span className="sr-only">Go to last page</span>
            <FontAwesomeIcon icon={faAnglesRight} aria-hidden="true" />
          </Button>
        </section>
      </menu>
    </footer>
  );
}
