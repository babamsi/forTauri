'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { UserClient } from '@/components/tables/user-tables/client';
import { users } from '@/constants/data';
import { useGetProductsQuery } from '@/store/authApi';
import { useState, useEffect } from 'react';
import { getAuthCookie } from '@/actions/auth.actions';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Products', link: '/dashboard/product' }
];
export default function Page() {
  const [cookies, setcookies] = useState(null);
  const {
    data: products,
    error,
    isLoading,
    isFetching,
    isError
  } = useGetProductsQuery(cookies);
  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k); //setting the token so the server can verify and give us output
    });
  }, []);
  if (error) return <div> Error </div>;
  if (isLoading) return <div>Loading...</div>;
  return (
    <PageContainer>
      <div className="space-y-2">
        <Breadcrumbs items={breadcrumbItems} />
        <UserClient data={products} />
      </div>
    </PageContainer>
  );
}
