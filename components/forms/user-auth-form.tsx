'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import GithubSignInButton from '../github-auth-button';
import { createAuthCookie } from '../../actions/auth.actions';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/store/authApi';
import toast, { Toaster } from 'react-hot-toast';

const formSchema = z.object({
  username: z
    .string()
    .min(4, { message: 'username must be at least 4 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [login, { isLoading }] = useLoginMutation();
  const [loading, setLoading] = useState(false);
  const defaultValues = {
    username: 'testwae',
    password: '12345678'
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    // const k = signIn('credentials', {
    //   email: data.email,
    //   callbackUrl: callbackUrl ?? '/dashboard'
    // });

    // console.log(k);
    try {
      const result = await login({ data }).unwrap();
      // console.log(result)
      if (result) {
        // toast.success('Successfully toasted!')
        // notify()
        toast.success('Successfully logged in!');
        console.log(result.refresh_token, result.access_token);
        await createAuthCookie(result.refresh_token, result.access_token);
        const loggedInfo = {
          name: result.name,
          username: result.username,
          id: result._id,
          role: result.role
        };
        localStorage.setItem('userStore', JSON.stringify(loggedInfo));
        // const updateInfo = useStuffInfoStore((state) => state.setUserInfo)
        // updateInfo(loggedInfo)
        router.replace('/');
      }
    } catch (error) {
      console.error('Failed to login:', error);
      toast.error('Failed to login!');
    }
  };
  const router = useRouter();

  return (
    <>
      <Suspense>
        <Form {...form}>
          <Toaster />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-2"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your username..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={loading} className="ml-auto w-full" type="submit">
              Continue With Email
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <GithubSignInButton />
      </Suspense>
    </>
  );
}
