'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, DollarSign, Briefcase, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: 'Working' | 'Utility';
  workingAccountBalance: number;
  onTopUp: (amount: number) => void;
}

export function TopUpModal({
  isOpen,
  onClose,
  accountType,
  workingAccountBalance,
  onTopUp
}: TopUpModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1);

  const handleTopUp = () => {
    const topUpAmount = Number.parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive number.',
        variant: 'destructive'
      });
      return;
    }

    if (accountType === 'Utility' && topUpAmount > workingAccountBalance) {
      toast({
        title: 'Insufficient Funds',
        description:
          "The Working Account doesn't have enough balance for this transfer.",
        variant: 'destructive'
      });
      return;
    }

    setStep(2);
  };

  const handleConfirm = () => {
    const topUpAmount = Number.parseFloat(amount);
    onTopUp(topUpAmount);
    toast({
      title: 'Top Up Successful',
      description: `$${topUpAmount.toFixed(2)} has been ${
        accountType === 'Utility'
          ? 'transferred from Working Account to Utility Account'
          : 'added to Working Account'
      }.`
    });
    setAmount('');
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Top Up {accountType} Account
          </DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="relative col-span-3">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            {accountType === 'Utility' && (
              <p className="text-sm text-muted-foreground">
                Funds will be transferred from your Working Account (Balance: $
                {workingAccountBalance.toFixed(2)})
              </p>
            )}
            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                {accountType === 'Working' ? (
                  <Briefcase className="h-8 w-8 text-blue-600" />
                ) : (
                  <Zap className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ArrowRight className="h-8 w-8 text-gray-400" />
              </motion.div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4 py-4"
          >
            <h3 className="text-center text-lg font-semibold">
              Confirm Top Up
            </h3>
            <div className="space-y-3 rounded-lg bg-gray-100 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${Number.parseFloat(amount).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">To:</span>
                <span className="text-sm font-medium">
                  {accountType} Account
                </span>
              </div>
              {accountType === 'Utility' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">From:</span>
                  <span className="text-sm font-medium">Working Account</span>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Please review the details above and confirm to proceed with the
              top up.
            </p>
          </motion.div>
        )}
        <DialogFooter>
          {step === 1 ? (
            <Button onClick={handleTopUp} className="w-full">
              <motion.span
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1,
                  ease: 'easeInOut'
                }}
              >
                Continue
              </motion.span>
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleConfirm}>Confirm Top Up</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
