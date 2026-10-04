import type { ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyMessage?: string;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  getRowId: (row: TData) => string;
  renderMobileCard: (row: TData) => ReactNode;
  testId?: string;
}

export function DataTable<TData>({ data, columns, isLoading = false, error, onRetry, emptyMessage = 'No results.', sorting, onSortingChange, pagination, onPaginationChange, getRowId, renderMobileCard, testId }: DataTableProps<TData>) {
  const table = useReactTable({
    data, columns, state: { sorting, pagination },
    onSortingChange: (updater) => onSortingChange(typeof updater === 'function' ? updater(sorting) : updater),
    onPaginationChange: (updater) => onPaginationChange(typeof updater === 'function' ? updater(pagination) : updater),
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
    getRowId, autoResetPageIndex: false,
  });

  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  const rows = table.getRowModel().rows;
  const total = data.length;
  const start = total ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, total);

  return <section data-testid={testId} aria-label="Movies data table">
    {isLoading ? <div className="space-y-3">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-16 w-full rounded-card" />)}</div> : !rows.length ? <div className="rounded-card border border-text-primary/10 bg-surface p-10 text-center text-text-secondary">{emptyMessage}</div> : <>
      <div className="grid gap-4 md:hidden">{rows.map((row) => <div key={row.id}>{renderMobileCard(row.original)}</div>)}</div>
      <div className="hidden max-w-full overflow-x-auto rounded-card border border-text-primary/10 md:block">
        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
          <thead className="bg-surface-elevated text-text-secondary">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => {
            const sorted = header.column.getIsSorted();
            const canSort = header.column.getCanSort();
            return <th key={header.id} aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : canSort ? 'none' : undefined} className="px-4 py-3 font-semibold">
              {header.isPlaceholder ? null : canSort ? <button type="button" className="inline-flex items-center gap-1 rounded-button focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}{sorted === 'asc' ? <ChevronUp size={14} /> : sorted === 'desc' ? <ChevronDown size={14} /> : <ChevronsUpDown size={14} />}</button> : flexRender(header.column.columnDef.header, header.getContext())}
            </th>;
          })}</tr>)}</thead>
          <tbody>{rows.map((row) => <tr key={row.id} data-testid={`admin-movie-row-${row.id}`} className="border-t border-text-primary/10 bg-surface hover:bg-surface-hover">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3 align-middle">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-text-secondary">
      <label className="flex items-center gap-2">Rows <select data-testid="admin-page-size" value={pagination.pageSize} onChange={(event) => onPaginationChange({ pageIndex: 0, pageSize: Number(event.target.value) })} className="rounded-button border border-text-primary/15 bg-surface px-3 py-2 text-text-primary"><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label>
      <span>{start}-{end} of {total}</span>
      <div className="flex gap-2"><Button data-testid="admin-page-prev" type="button" variant="secondary" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 })}>Previous</Button><Button data-testid="admin-page-next" type="button" variant="secondary" size="sm" disabled={!table.getCanNextPage()} onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })}>Next</Button></div>
    </div>
  </section>;
}
