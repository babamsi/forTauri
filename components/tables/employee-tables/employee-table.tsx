'use client';
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import React from 'react';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  pageNo: number;
  totalUsers: number;
  pageSizeOptions?: number[];
  pageCount: number;
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export function EmployeeTable<TData, TValue>({
  columns,
  data,
  pageNo,
  searchKey,
  totalUsers,
  pageCount,
  pageSizeOptions = [10, 20, 30, 40, 50]
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Add pagination state
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: pageNo - 1,
      pageSize: 10
    });

  // Add state for search value
  const [globalFilter, setGlobalFilter] = React.useState('');

  // Function to filter data
  const filterData = React.useCallback(
    (data: TData[]) => {
      if (!globalFilter) return data;

      return data.filter((item: any) => {
        return Object.keys(item).some((key) => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(globalFilter.toLowerCase());
          }
          if (typeof value === 'number') {
            return value.toString().includes(globalFilter);
          }
          return false;
        });
      });
    },
    [globalFilter]
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: { pageIndex, pageSize },
      globalFilter
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: (row, columnId, value, addMeta) => {
        const itemValue = row.getValue(columnId);
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        if (typeof itemValue === 'number') {
          return itemValue.toString().includes(value);
        }
        return false;
      }
    },
    // @ts-ignore
    globalFilterFn: 'fuzzy'
  });

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);

    // Reset to first page when searching
    if (table.getState().pagination.pageIndex !== 0) {
      table.setPageIndex(0);
    }
  };

  return (
    <>
      <Suspense>
        <div className="flex items-center py-4">
          <Input
            placeholder={`Search ${searchKey}...`}
            value={globalFilter}
            onChange={handleSearchChange}
            className="w-full md:max-w-sm"
          />
        </div>

        <ScrollArea className="h-[calc(80vh-220px)] rounded-md border">
          <Table className="relative">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
          <div className="flex w-full items-center justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
              <div className="flex items-center space-x-2">
                <p className="whitespace-nowrap text-sm font-medium">
                  Rows per page
                </p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pageSizeOptions.map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-2 sm:justify-end">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                aria-label="Go to first page"
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                aria-label="Go to previous page"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                aria-label="Go to next page"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                aria-label="Go to last page"
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
}
