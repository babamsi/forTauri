'use client';

import * as z from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
// import { useToast } from '../ui/use-toast';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  useUpdateSupplierMutation,
  useCreateSupplierMutation
} from '@/store/authApi';
import { getAuthCookie } from '@/actions/auth.actions';
// import validator from "validator";

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  phone: z.string().min(8, { message: 'Phone must be at least 8 characters' }),
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.')
  //   .refine((e) => e === "abcd@fg.com", "This email is not in our database")
});

type EmployeeFormValues = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  initialData: any | null;
}

export const SupplierForm: React.FC<EmployeeFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  // const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cookies, setCookies] = useState(null);

  const title = initialData ? 'Edit Supplier' : 'Create Supplier';
  const description = initialData
    ? 'Edit supplier details.'
    : 'Add a new supplier';
  const toastMessage = initialData ? 'Supplier updated.' : 'Supplier created.';
  const action = initialData ? 'Save changes' : 'Create';

  const [updateSupplier] = useUpdateSupplierMutation();
  const [createSupplier] = useCreateSupplierMutation();

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setCookies(k);
    });
  }, []);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || ''
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        phone: initialData.phone,
        email: initialData.email
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: EmployeeFormValues) => {
    console.log(data);
    try {
      setLoading(true);
      if (initialData) {
        const { ...restData } = data;

        const cleanData = Object.fromEntries(
          Object.entries(restData).filter(
            ([_, v]) => v !== undefined && v !== ''
          )
        );

        console.log('Update Data being sent:', {
          id: initialData._id,
          data: cleanData,
          cookies
        });

        const result = await updateSupplier({
          id: initialData._id,
          data: cleanData,
          cookies
        });
        console.log(result);
        if ('data' in result) {
          // toast({
          //   variant: 'default',
          //   title: 'Success',
          //   description: 'Employee Updated Successfully'
          // });
          toast.success('Supplier Update ');
          router.push('/dashboard/suppliermanager');
        } else if ('error' in result) {
          const error = result.error as any;
          throw new Error(error.data?.message || 'Failed to update supplier');
        }
      } else {
        const result = await createSupplier({
          data,
          cookies
        });

        if ('data' in result) {
          toast.success('Supplier Created Succesfully');
          router.push('/dashboard/suppliermanager');
        } else if ('error' in result) {
          const error = result.error as any;
          throw new Error(error.data?.message || 'Failed to create supplier');
        }
      }
    } catch (error: any) {
      console.error('Submission Error:', error);
      toast.error(error?.message || 'Something Went Wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => {
              // Implement delete functionality
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Employee name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Phone"
                      type="phone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!initialData && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        disabled={loading}
                        placeholder="Enter email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {initialData && (
            <div className="rounded-md bg-slate-100 p-4">
              <div className="text-sm text-slate-500">
                <p>
                  Created:{' '}
                  {new Date(initialData.createdAt).toLocaleDateString()}
                </p>
                <p>
                  Last Updated:{' '}
                  {new Date(initialData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
