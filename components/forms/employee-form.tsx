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
import { useToast } from '../ui/use-toast';
import {
  useUpdateStuffMutation,
  useCreateStuffMutation
} from '@/store/authApi';
import { getAuthCookie } from '@/actions/auth.actions';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .optional(),
  role: z.enum(['admin', 'stuff', 'manager'])
});

type EmployeeFormValues = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  initialData: any | null;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cookies, setCookies] = useState(null);

  const title = initialData ? 'Edit Employee' : 'Create Employee';
  const description = initialData
    ? 'Edit employee details.'
    : 'Add a new employee';
  const toastMessage = initialData ? 'Employee updated.' : 'Employee created.';
  const action = initialData ? 'Save changes' : 'Create';

  const [updateStuff] = useUpdateStuffMutation();
  const [createStuff] = useCreateStuffMutation();

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setCookies(k);
    });
  }, []);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      username: initialData?.username || '',
      role: initialData?.role || 'stuff'
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        username: initialData.username,
        role: initialData.role
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: EmployeeFormValues) => {
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

        const result = await updateStuff({
          id: initialData._id,
          data: cleanData,
          cookies
        });
        console.log(result);
        if ('data' in result) {
          toast({
            variant: 'default',
            title: 'Success',
            description: 'Employee Updated Successfully'
          });
          router.push('/dashboard/employee');
        } else if ('error' in result) {
          const error = result.error as any;
          throw new Error(error.data?.message || 'Failed to update employee');
        }
      } else {
        const result = await createStuff({
          data,
          cookies
        });

        if ('data' in result) {
          toast({
            variant: 'default',
            title: 'Success',
            description: 'Employee Created Successfully'
          });
          router.push('/dashboard/employee');
        } else if ('error' in result) {
          const error = result.error as any;
          throw new Error(error.data?.message || 'Failed to create employee');
        }
      }
    } catch (error: any) {
      console.error('Submission Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Username"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={loading}
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="stuff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
