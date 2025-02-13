'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  BanknoteIcon as Bank
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TopUpModal } from './top-up-modal';
import { WithdrawModal } from './withdraw-modal';

interface AccountItem {
  id: string;
  title: string;
  description: string;
  balance: number;
  type: 'operational' | 'utility';
  trend: 'up' | 'down';
  percentage: string;
  change: string;
  lastUpdated: string;
}

interface List01Props {
  accounts?: AccountItem[];
  workingAccount?: {
    currency: string;
    firstBalance: number;
  };
  utilityAccount?: {
    currency: string;
    firstBalance: number;
  };
}

export const ACCOUNTS: AccountItem[] = [
  {
    id: '1',
    title: 'Working Account',
    description: 'Main operational account',
    balance: 15234.56,
    type: 'operational',
    trend: 'up',
    percentage: '2.5',
    change: '+$1,234.56',
    lastUpdated: 'Last updated 2 hours ago'
  },
  {
    id: '2',
    title: 'Utility Account',
    description: 'For utility payments',
    balance: 2500.0,
    type: 'utility',
    trend: 'down',
    percentage: '1.2',
    change: '-$156.78',
    lastUpdated: 'Last updated 5 hours ago'
  }
];

export default function List01({
  accounts = ACCOUNTS,
  workingAccount,
  utilityAccount
}: List01Props) {
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(
    null
  );
  const [localAccounts, setLocalAccounts] = useState(accounts);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const response = await fetch('/api/mpesa/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }).then((re) => re.json());
  };

  const handleTopUp = (account: AccountItem) => {
    setSelectedAccount(account);
    setTopUpModalOpen(true);
  };

  const handleWithdraw = (account: AccountItem) => {
    setSelectedAccount(account);
    setWithdrawModalOpen(true);
  };

  const updateAccountBalance = (accountId: string, newBalance: number) => {
    setLocalAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.id === accountId ? { ...account, balance: newBalance } : account
      )
    );
  };

  const getWorkingAccountBalance = () => {
    const workingAccount = localAccounts.find(
      (account) => account.type === 'operational'
    );
    return workingAccount ? workingAccount.balance : 0;
  };

  const handleTopUpConfirm = (amount: number) => {
    if (selectedAccount) {
      if (selectedAccount.type === 'utility') {
        const workingAccount = localAccounts.find(
          (account) => account.type === 'operational'
        );
        if (workingAccount) {
          updateAccountBalance(
            workingAccount.id,
            workingAccount.balance - amount
          );
        }
      }
      updateAccountBalance(
        selectedAccount.id,
        selectedAccount.balance + amount
      );
    }
    setTopUpModalOpen(false);
  };

  const handleWithdrawConfirm = (amount: number) => {
    if (selectedAccount) {
      if (selectedAccount.type === 'utility') {
        const workingAccount = localAccounts.find(
          (account) => account.type === 'operational'
        );
        if (workingAccount) {
          updateAccountBalance(
            workingAccount.id,
            workingAccount.balance + amount
          );
        }
      }
      updateAccountBalance(
        selectedAccount.id,
        selectedAccount.balance - amount
      );
    }
    setWithdrawModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {localAccounts.map((account) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden bg-card transition-all duration-200 hover:bg-accent/5">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      {account.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {account.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'rounded-xl p-3',
                      account.type === 'operational'
                        ? 'bg-blue-500/10'
                        : 'bg-emerald-500/10'
                    )}
                  >
                    {account.type === 'operational' ? (
                      <Briefcase
                        className={cn(
                          'h-6 w-6',
                          account.type === 'operational'
                            ? 'text-blue-500'
                            : 'text-emerald-500'
                        )}
                      />
                    ) : (
                      <Zap
                        className={cn(
                          'h-6 w-6',
                          account.type === 'operational'
                            ? 'text-blue-500'
                            : 'text-emerald-500'
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-3xl font-bold text-foreground">
                      {account.title === 'Working Account'
                        ? workingAccount?.firstBalance?.toFixed(2) ?? '0.00'
                        : utilityAccount?.firstBalance?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {account.lastUpdated}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'rounded-lg p-1.5',
                        account.trend === 'up'
                          ? 'bg-emerald-500/10'
                          : 'bg-red-500/10'
                      )}
                    >
                      {account.trend === 'up' ? (
                        <TrendingUp
                          className={cn(
                            'h-4 w-4',
                            account.trend === 'up'
                              ? 'text-emerald-500'
                              : 'text-red-500'
                          )}
                        />
                      ) : (
                        <TrendingDown
                          className={cn(
                            'h-4 w-4',
                            account.trend === 'up'
                              ? 'text-emerald-500'
                              : 'text-red-500'
                          )}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          account.trend === 'up'
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        )}
                      >
                        {account.change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {account.percentage}% this month
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleTopUp(account)}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Top Up
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleWithdraw(account)}
                    >
                      <Bank className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {selectedAccount && (
        <>
          <TopUpModal
            isOpen={topUpModalOpen}
            onClose={() => setTopUpModalOpen(false)}
            accountType={
              selectedAccount.type === 'operational' ? 'Working' : 'Utility'
            }
            workingAccountBalance={getWorkingAccountBalance()}
            onTopUp={handleTopUpConfirm}
          />
          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            accountType={
              selectedAccount.type === 'operational' ? 'Working' : 'Utility'
            }
            accountBalance={selectedAccount.balance}
            onWithdraw={handleWithdrawConfirm}
          />
        </>
      )}
    </>
  );
}
