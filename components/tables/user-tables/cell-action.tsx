'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Products } from '@/constants/data';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAuthCookie } from '@/actions/auth.actions';
import { useDeleteProductMutation } from '@/store/authApi';
import { useToast } from '../../ui/use-toast';
// import { editProductStore } from '../../hooks/stuffProducts';

interface CellActionProps {
  data: Products;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [cookies, setcookies] = useState(null);
  const [all, setAll] = useState<Products>();
  const [deleteProduct, { isLoading }] = useDeleteProductMutation();

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k); //setting the token so the server can verify and give us output
    });
  }, []);

  const onConfirm = async () => {
    setOpen(false);
    // console.log(all);
    const result = await deleteProduct({
      id: all?._id,
      cookies
    });
    if (result) {
      console.log(result);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Deleted Successfully'
      });
      router.push(`/dashboard/products`);
      router.refresh();
    }
  };
  // const edit = editProductStore((state) => state.setEditProductName);
  const handleClick = (data: Products) => {
    // edit(data);
    router.push(`/dashboard/product/${data._id}`);
  };
  const deleteHandler = async (data: Products) => {
    setOpen(true);
    setAll(data);
  };
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => handleClick(data)}>
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteHandler(data)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
