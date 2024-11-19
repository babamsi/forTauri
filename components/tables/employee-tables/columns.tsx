'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Employee } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

import { format, parseISO } from 'date-fns';

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export const columns: ColumnDef<Employee>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'username',
    header: 'USERNAME'
  },
  {
    accessorKey: 'role',
    header: 'ROLE'
  },
  {
    accessorKey: 'createdAt',
    header: 'JOINED',
    cell: ({ row }) =>
      // @ts-ignore
      formatDate(row.original.createdAt)
  },
  {
    accessorKey: 'soldItems.length',
    header: 'SOLD ITEMS',
    cell: ({ row }) =>
      // @ts-ignore
      row.original.soldItems.length
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <CellAction
        data={
          // @ts-ignore
          row.original
        }
      />
    )
  }
];
