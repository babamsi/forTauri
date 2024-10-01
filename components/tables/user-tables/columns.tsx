'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Products } from '@/constants/data';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Products>[] = [
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
    header: () => <div className="text-right">Products</div>,
    cell: ({ row }) => {
      //   return <div className="text-right font-medium">{row.getValue("quantity")}</div>
      if (row.original.isQuantityBased === true) {
        // console.log(row)
        return (
          <div className="text-right font-medium">
            {row.getValue('name')} {row.getValue('units')}
          </div>
        );
      } else {
        return (
          <div className="text-right font-medium">{row.getValue('name')}</div>
        );
      }
    }
  },

  {
    accessorKey: 'quantity',
    header: () => <div className="text-right">In Stock</div>,
    cell: ({ row }) => {
      //   return <div className="text-right font-medium">{row.getValue("quantity")}</div>
      if (row.original.isQuantityBased === true) {
        // console.log(row)
        return (
          <div className="text-right font-medium">
            {row.getValue('quantity')}
          </div>
        );
      } else {
        return (
          <div className="text-right font-medium">{row.getValue('units')}</div>
        );
      }
    }
  },
  {
    accessorKey: 'vendor',
    header: 'Vendor'
  },

  {
    accessorKey: 'sellPrice',
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      //   return <div className="text-right font-medium">{row.getValue("quantity")}</div>
      if (row.original.isQuantityBased === true) {
        // console.log(row)
        return (
          <div className="text-right font-medium">
            {row.getValue('sellPrice')}
          </div>
        );
      } else {
        return (
          <div className="text-right font-medium">
            {row.getValue('sellPrice')}/kg
          </div>
        );
      }
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
