import { Breadcrumbs } from '@/components/breadcrumbs';
import { ProductForm } from '@/components/forms/product-form';
import PageContainer from '@/components/layout/page-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect } from 'react';
import { SearchParamProps } from '@/types/index';
import { getAuthCookie } from '@/actions/auth.actions';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Products', link: '/dashboard/product' },
  { title: 'Create', link: '/dashboard/product/create' }
];
const Page = async ({ params: { userId } }: SearchParamProps) => {
  console.log(userId);
  const cookie = await getAuthCookie();
  const getProduct = await fetch(
    `http://localhost:5000/api/products/${userId}`,
    {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookie}`
      }
    }
  );
  const product = await getProduct.json();
  console.log(product);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        {userId !== 'new' ? (
          <ProductForm
            categories={[
              { _id: 'market', name: product.category },
              { _id: 'qudaar', name: product.category }
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
