'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
// import { ProductForm } from '@/components/forms/product-form';
import { SupplierForm } from '@/components/forms/supplier-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useState, useEffect } from 'react';
import { useGetSupplierQuery } from '@/store/authApi';
import { useParams } from 'next/navigation';
import { getAuthCookie } from '@/actions/auth.actions';
import { useRouter } from 'next/navigation';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Employee', link: '/dashboard/employee' },
  { title: 'Create', link: '/dashboard/employee/create' }
];

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.supplierId as string;
  console.log(params);
  const [cookies, setCookies] = useState(null);

  // Get auth cookie
  useEffect(() => {
    getAuthCookie().then((cookie: any) => {
      setCookies(cookie);
    });
  }, []);

  // Fetch specific user data using the id from params
  const {
    data: user,
    isLoading,
    error
  } = useGetSupplierQuery(
    { cookies, id: supplierId },
    { skip: !cookies || !supplierId }
  );

  console.log('Supplier ID:', supplierId);
  console.log(error);

  if (
    // @ts-ignore
    error?.status === 403
  ) {
    return router.push('/');
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-8">
        {/* <Breadcrumbs items={breadcrumbItems} /> */}
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <SupplierForm
            // @ts-ignore
            categories={[
              { _id: 'shirts', name: 'shirts' },
              { _id: 'pants', name: 'pants' }
            ]}
            initialData={user}
            key={supplierId}
          />
        )}
      </div>
    </ScrollArea>
  );
}
