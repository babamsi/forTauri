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
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'email',
    header: 'EMAIL'
  },
  {
    accessorKey: 'phone',
    header: 'PHONE'
  },
  {
    accessorKey: 'createdAt',
    header: 'JOINED',
    cell: ({ row }) =>
      // @ts-ignore
      formatDate(row.original.createdAt)
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
