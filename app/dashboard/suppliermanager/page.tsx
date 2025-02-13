'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { columns } from '@/components/tables/supplier-tables/columns';
import { SupplierTable } from '@/components/tables/supplier-tables/supplier-table';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
// import { Employee } from '@/constants/data';
import { cn } from '@/lib/utils';
import { Plus, Router } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  deleteAuthCookie,
  getAuthCookie,
  getUserInfo
} from '@/actions/auth.actions';
import { useGetAllSuppliersQuery } from '@/store/authApi';
import { useRouter } from 'next/navigation';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Employee', link: '/dashboard/employee' }
];

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default function Page({ searchParams }: paramsProps) {
  const router = useRouter();

  const [cookies, setCookies] = useState('');
  const [user, setUser] = useState(null);
  const [allStuffs, setAllStuffs] = useState([]);

  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const country = searchParams.search || null;
  const offset = (page - 1) * pageLimit;

  const { data, isLoading, isError, error } = useGetAllSuppliersQuery(cookies, {
    skip: !cookies
  });

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setCookies(k);
    });
    getUserInfo().then((userInfo) => {
      // @ts-ignore
      setUser(userInfo);
    });
  }, []);

  // const res = await fetch(
  //   `http://localhost:5000/api/auth/getStuffs` +
  //     (country ? `&search=${country}` : '')
  // );
  // const employeeRes = await res.json();
  // const totalUsers = employeeRes.total_users; //1000
  //   console.log(data);

  if (
    // @ts-ignore
    error?.status === 401
  ) {
    deleteAuthCookie();
    return;
  }

  const pageCount = Math.ceil(data?.length / pageLimit);
  // const employee: Employee[] = employeeRes.users;
  //   const table =
  return (
    <PageContainer>
      <div className="space-y-4">
        {
          // @ts-ignore
          <Breadcrumbs items={breadcrumbItems} />
        }

        <div className="flex items-start justify-between">
          <Heading
            title={`Suppliers (${data?.length || 0})`}
            description="Manage Suppliers (Server side table functionalities.)"
          />

          <Link
            href={'/dashboard/suppliermanager/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <SupplierTable
          searchKey="name"
          pageNo={page}
          columns={columns}
          totalUsers={data?.length}
          data={data ? data : []}
          pageCount={pageCount}
          isLoading={isLoading}
        />
      </div>
    </PageContainer>
  );
}
