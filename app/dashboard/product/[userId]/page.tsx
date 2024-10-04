'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { ProductForm } from '@/components/forms/product-form';
import PageContainer from '@/components/layout/page-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useState } from 'react';
import { SearchParamProps } from '@/types/index';
import { getAuthCookie } from '@/actions/auth.actions';
import { useGetSpecificProductQuery } from '@/store/authApi';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Products', link: '/dashboard/product' },
  { title: 'Create', link: '/dashboard/product/create' }
];
const Page = ({ params: { userId } }: SearchParamProps) => {
  console.log(userId);
  const [cookies, setcookies] = useState(null);
  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k); //setting the token so the server can verify and give us output
    });
  }, []);

  const data = {
    cookies,
    id: userId
  };

  const {
    data: product,
    error,
    isLoading,
    isFetching,
    isError
  } = useGetSpecificProductQuery(data);

  // const product = await getProduct.json();
  console.log(product);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        {userId !== 'new' ? (
          <ProductForm
            categories={[
              { _id: 'market', name: product?.category },
              { _id: 'qudaar', name: product?.category }
            ]}
            initialData={product}
            key={null}
          />
        ) : (
          <ProductForm
            categories={[
              { _id: 'market', name: 'Market' },
              { _id: 'qudaar', name: 'Qudaar' }
            ]}
            initialData={null}
            key={null}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default Page;
