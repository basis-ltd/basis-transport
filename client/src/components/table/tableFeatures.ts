import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type ColumnDef,
  type Table,
} from '@tanstack/react-table';

/**
 * The single TanStack Table v9 feature registry for the app.
 *
 * v9 ships tree-shakeable: table APIs only exist when their feature is
 * registered, so this list is the table's whole capability surface. It must
 * cover every instance method used in `Table`/`TablePagination` (sorting,
 * filtering incl. the filtered row models behind the selection counts,
 * pagination, row selection, column visibility) and nothing unused — the
 * faceted row models v8 bundled are gone because no consumer reads them.
 * Declared at module scope: the registry identity must be stable across
 * renders. Import the `App*` helpers below instead of re-declaring generics.
 */
export const appTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

export type AppTableFeatures = typeof appTableFeatures;
export type AppTable<TData> = Table<AppTableFeatures, TData>;
export type AppColumnDef<TData, TValue = unknown> = ColumnDef<
  AppTableFeatures,
  TData,
  TValue
>;
