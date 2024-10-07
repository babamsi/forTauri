'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Products } from '@/constants/data';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Products>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Products</div>,
    cell: ({ row }) => {
      //   return <div className="text-right font-medium">{row.getValue("quantity")}</div>
      if (row.original.isQuantityBased === true) {
        // console.log(row)
        return (
          <div className="font-medium">
            {row.getValue('name')} {row.getValue('units')}
          </div>
        );
      } else {
        return <div className="font-medium">{row.getValue('name')}</div>;
      }
    }
  },

  {
    accessorKey: 'quantity',
    header: () => <div>In Stock</div>,
    cell: ({ row }) => {
      //   return <div className="text-right font-medium">{row.getValue("quantity")}</div>
      if (row.original.isQuantityBased === true) {
        // console.log(row)
        return (
          <div
            className={`font-medium ${
              (row.getValue('quantity') as number) < 10 && 'text-red-700'
            }`}
          >
            {row.getValue('quantity')}
          </div>
        );
      } else {
        return <div className="font-medium">{row.getValue('units')}</div>;
      }
    }
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'units',
    header: () => <div>Units</div>,
    cell: ({ row }) => {
      //   return <div className="text-right font-medium">{row.getValue("quantity")}</div>
      if (row.original.isQuantityBased === true) {
        // console.log(row)
        return <div className="font-medium">{row.getValue('units')}</div>;
      } else {
        return <div className="font-medium">{row.getValue('units')}</div>;
      }
    }
  },
  {
    accessorKey: 'vendor',
    header: 'Vendor'
  },

  {
    accessorKey: 'sellPrice',
    header: () => <div>Price</div>,
    cell: ({ row }) => {
      //   return <div className="text-right font-medium">{row.getValue("quantity")}</div>
      if (row.original.isQuantityBased === true) {
        // console.log(row)
        return <div className="font-medium">$ {row.getValue('sellPrice')}</div>;
      } else {
        return (
          <div className=" font-medium">$ {row.getValue('sellPrice')}/kg</div>
        );
      }
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
