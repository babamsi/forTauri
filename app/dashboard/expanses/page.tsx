'use client';

import React, { useEffect, useState } from 'react';
import { ExpensesTracker } from '@/components/expenses-tracker';
import PageContainer from '@/components/layout/page-container';
import { getAuthCookie, getUserInfo } from '@/actions/auth.actions';
import { useParams, useRouter } from 'next/navigation';

function Page() {
  const router = useRouter();
  const [user, setUser] = useState('');
  useEffect(() => {
    getAuthCookie().then((k: any) => {
      if (!k) {
        router.push('/');
      }
    });
  }, []);

  // console.log(user)

  return (
    <div className="container mx-auto p-4">
      <PageContainer scrollable>
        <ExpensesTracker />
      </PageContainer>
    </div>
  );
}

export default page;
