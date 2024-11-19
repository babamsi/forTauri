'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
// import { ProductForm } from '@/components/forms/product-form';
import { EmployeeForm } from '@/components/forms/employee-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useState, useEffect } from 'react';
import { useGetStuffQuery } from '@/store/authApi';
import { useParams } from 'next/navigation';
import { getAuthCookie } from '@/actions/auth.actions';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Employee', link: '/dashboard/employee' },
  { title: 'Create', link: '/dashboard/employee/create' }
];

export default function Page() {
  const params = useParams();
  const employeeId = params.employeeId as string;
  const [cookies, setCookies] = useState(null);

  // Get auth cookie
  useEffect(() => {
    getAuthCookie().then((cookie: any) => {
      setCookies(cookie);
    });
  }, []);

  // Fetch specific user data using the id from params
  const { data: user, isLoading } = useGetStuffQuery(
    { cookies, id: employeeId },
    { skip: !cookies || !employeeId }
  );

  console.log('Employee ID:', employeeId);
  console.log('User Data:', user);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-8">
        <Breadcrumbs items={breadcrumbItems} />
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <EmployeeForm
            // @ts-ignore
            categories={[
              { _id: 'shirts', name: 'shirts' },
              { _id: 'pants', name: 'pants' }
            ]}
            initialData={user}
            key={employeeId}
          />
        )}
      </div>
    </ScrollArea>
  );
}
