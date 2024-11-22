import React from 'react';
import { ExpensesTracker } from '@/components/expenses-tracker';
import PageContainer from '@/components/layout/page-container';

function page() {
  return (
    <div className="container mx-auto p-4">
      <PageContainer scrollable>
        <ExpensesTracker />
      </PageContainer>
    </div>
  );
}

export default page;
