import { cn } from '@/lib/utils';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ShoppingCart,
  Home,
  DollarSign,
  Coffee
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type React from 'react';

interface Transaction {
  id: string;
  title: string;
  amount: string;
  type: 'incoming' | 'outgoing';
  category: string;
  icon: React.ElementType;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface List02Props {
  transactions?: Transaction[];
  className?: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Salary Deposit',
    amount: '4,500.00',
    type: 'incoming',
    category: 'income',
    icon: Wallet,
    timestamp: new Date('2023-07-01T09:00:00'),
    status: 'completed'
  },
  {
    id: '2',
    title: 'Rent Payment',
    amount: '1,200.00',
    type: 'outgoing',
    category: 'housing',
    icon: Home,
    timestamp: new Date('2023-07-01T10:15:00'),
    status: 'completed'
  },
  {
    id: '3',
    title: 'Grocery Shopping',
    amount: '85.75',
    type: 'outgoing',
    category: 'shopping',
    icon: ShoppingCart,
    timestamp: new Date('2023-06-30T18:30:00'),
    status: 'completed'
  },
  {
    id: '4',
    title: 'Freelance Payment',
    amount: '750.00',
    type: 'incoming',
    category: 'income',
    icon: DollarSign,
    timestamp: new Date('2023-06-30T15:45:00'),
    status: 'completed'
  },
  {
    id: '5',
    title: 'Coffee Shop',
    amount: '4.50',
    type: 'outgoing',
    category: 'food',
    icon: Coffee,
    timestamp: new Date('2023-06-29T08:20:00'),
    status: 'completed'
  }
];

export { TRANSACTIONS };

export default function List02({
  transactions = TRANSACTIONS,
  className
}: List02Props) {
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(
    null
  );

  const toggleTransaction = (id: string) => {
    setExpandedTransaction(expandedTransaction === id ? null : id);
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="space-y-2">
        <AnimatePresence>
          {transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'bg-background',
                'border-b border-border',
                'overflow-hidden',
                'transition-all duration-200',
                expandedTransaction === transaction.id ? 'pb-2' : ''
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-between',
                  'cursor-pointer py-3',
                  'hover:bg-accent/50'
                )}
                onClick={() => toggleTransaction(transaction.id)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      'rounded-full p-2',
                      transaction.type === 'incoming'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    )}
                  >
                    <transaction.icon
                      className={cn(
                        'h-4 w-4',
                        transaction.type === 'incoming'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      {transaction.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {format(transaction.timestamp, 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      transaction.type === 'incoming'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {transaction.type === 'incoming' ? '+' : '-'}$
                    {transaction.amount}
                  </span>
                  {transaction.type === 'incoming' ? (
                    <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
              <AnimatePresence>
                {expandedTransaction === transaction.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-2"
                  >
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        <span className="font-medium">Category:</span>{' '}
                        {transaction.category}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        {transaction.status}
                      </p>
                      <p>
                        <span className="font-medium">Transaction ID:</span>{' '}
                        {transaction.id}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
