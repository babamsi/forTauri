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
import { Employee } from '@/constants/data';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDeleteStuffMutation } from '@/store/authApi';
import { getAuthCookie } from '@/actions/auth.actions';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CellActionProps {
  data: Employee;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [stuffId, setStuffId] = useState('');
  const router = useRouter();

  const [cookies, setcookies] = useState(null);

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k); //setting the token so the server can verify and give us output
    });
  }, []);

  const [deleteStuff, { isLoading }] = useDeleteStuffMutation();

  const handleDelete = (id: string) => {
    setOpen(true);
    setStuffId(id);
  };

  const onConfirm = async () => {
    try {
      setLoading(true);
      deleteStuff({ id: stuffId, cookies });

      // setStuffId(id);
      if ('error' in deleteStuff) {
        // @ts-ignore
        throw new Error(deleteStuff.error);
      }
      setLoading(false);
      setOpen(false);
      toast.success('Employee Deleted Successfully');
    } catch (error: any) {
      toast.error(error?.message);
      console.log(error);
    }
  };

  return (
    <>
      <ToastContainer />
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

          <DropdownMenuItem
            onClick={() =>
              // @ts-ignore
              router.push(`/dashboard/employee/${data._id}`)
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              // @ts-ignore
              handleDelete(data._id)
            }
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
