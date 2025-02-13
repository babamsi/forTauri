'use client';

import {
  CreditCard,
  Zap,
  Send,
  FileText,
  PieChart,
  Repeat
} from 'lucide-react';
import List01 from './list-01';
import List02 from './list-02';
import { useState, useEffect } from 'react';
import TransferModal from './transfer-modal';
import PayBillsModal from './pay-bills-modal';
import ViewReportsModal from './view-reports-modal';
import RecurringPaymentsModal from './recurring-payments-modal';
import { ACCOUNTS } from './list-01';
import { BudgetTrackingChart } from './budget-tracking-chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageContainer from '@/components/layout/page-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import { io } from 'socket.io-client';

export default function Content() {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPayBillsModalOpen, setIsPayBillsModalOpen] = useState(false);
  const [isViewReportsModalOpen, setIsViewReportsModalOpen] = useState(false);
  const [isRecurringPaymentsModalOpen, setIsRecurringPaymentsModalOpen] =
    useState(false);
  const [balance, setBalance] = useState();
  const [workingAccount, setWorkingAccount] = useState({
    currency: 'KES',
    firstBalance: 0
  });
  const [utilityAccount, setUtilityAccount] = useState({
    currency: 'KES',
    firstBalance: 0
  });

  const quickActions = [
    {
      icon: Send,
      label: 'Transfer Funds',
      onClick: () => setIsTransferModalOpen(true),
      color: 'bg-blue-500'
    },
    {
      icon: CreditCard,
      label: 'Pay Bills',
      onClick: () => setIsPayBillsModalOpen(true),
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      label: 'View Reports',
      onClick: () => setIsViewReportsModalOpen(true),
      color: 'bg-purple-500'
    },
    {
      icon: Repeat,
      label: 'Recurring Payments',
      onClick: () => setIsRecurringPaymentsModalOpen(true),
      color: 'bg-orange-500'
    }
  ];

  useEffect(() => {
    const socket = io('https://webhook-alqurashi.onrender.com');

    socket.on('connect', () => {
      console.log('Connected to M-Pesa WebSocket server');
    });

    socket.on('accountBalance', (data) => {
      console.log('Received payment status:', data);
      if (data) {
        console.log(data.ResultParameter[1]);
        // const { ResultCode, ResultDesc, TransID, FirstName } = data
        setBalance(data.ResultParameter[1].Value);
      }
    });
    // socket.on("GetTransactionDetails", (data) => {
    //   console.log("Transaction Details", data);
    //   if (data) {
    //     setTransactionId(data.TransID)
    //     toast.success(`Got the payment from ${data.FirstName}`)
    //   }
    // })

    return () => {
      socket.disconnect();
    };
  }, []);

  // console.log(balance && balance[1])
  useEffect(() => {
    const accounts = balance && balance.split('&');
    const accountDetails = {};

    // Step 3: Loop through each account and extract the required information
    accounts?.forEach((account) => {
      const [name, currency, firstBalance] = account.split('|'); // Split by '|' and extract the first balance
      accountDetails[name] = {
        currency,
        firstBalance: parseFloat(firstBalance) // Convert the first balance to a number
      };
    });

    // Step 4: Extract specific accounts (e.g., Working Account and Utility Account)
    const workingAccount = accountDetails['Working Account'];
    const utilityAccount = accountDetails['Utility Account'];
    setWorkingAccount(workingAccount);
    setUtilityAccount(utilityAccount);
    console.log('Working Account:', workingAccount);
    console.log('Utility Account:', utilityAccount);
  }, [balance?.length > 0]);

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-10 p-4">
        {/* Accounts Overview */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Accounts Overview
          </h2>
          <List01
            workingAccount={workingAccount}
            utilityAccount={utilityAccount}
          />
        </section>

        {/* Quick Actions */}
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  'flex h-auto flex-col items-center justify-center py-4',
                  'hover:bg-accent hover:text-accent-foreground',
                  'transition-all duration-200'
                )}
                onClick={action.onClick}
              >
                <div className={cn('mb-2 rounded-full p-3', action.color)}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-center text-xs font-medium">
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        </section>

        {/* Recent Activity and Spending */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <CreditCard className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <List02 className="h-[400px] overflow-auto pr-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <PieChart className="h-5 w-5 text-primary" />
                Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetTrackingChart />
            </CardContent>
          </Card>
        </div>

        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          accounts={ACCOUNTS}
        />
        <PayBillsModal
          isOpen={isPayBillsModalOpen}
          onClose={() => setIsPayBillsModalOpen(false)}
        />
        <ViewReportsModal
          isOpen={isViewReportsModalOpen}
          onClose={() => setIsViewReportsModalOpen(false)}
        />
        <RecurringPaymentsModal
          isOpen={isRecurringPaymentsModalOpen}
          onClose={() => setIsRecurringPaymentsModalOpen(false)}
        />
      </div>
    </PageContainer>
  );
}
