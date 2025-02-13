'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeftRight,
  Building2,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

interface AccountItem {
  id: string;
  title: string;
  balance: string;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountItem[];
}

type TransferType = 'B2C' | 'B2B' | 'Swap';

export default function TransferModal({
  isOpen,
  onClose,
  accounts
}: TransferModalProps) {
  const [transferType, setTransferType] = useState<TransferType | null>(null);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessShortCode, setBusinessShortCode] = useState('');
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTransfer = async () => {
    // Simulate transfer process

    // console.log(transferType )
    if (transferType === 'B2C') {
      const response = await fetch('/api/mpesa/b2c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }).then((re) => re.json());

      if (response.success) {
        setIsSuccess(true);
        setStep(4);
      }
    }
  };

  const resetForm = () => {
    setTransferType(null);
    setFromAccount('');
    setToAccount('');
    setAmount('');
    setPhoneNumber('');
    setBusinessShortCode('');
    setStep(1);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const transferTypes = [
    { type: 'B2C', icon: Smartphone, label: 'Customer' },
    { type: 'B2B', icon: Building2, label: 'Business' },
    { type: 'Swap', icon: ArrowLeftRight, label: 'Swap' }
  ];

  const renderReviewDetails = () => {
    return (
      <div className="space-y-4 py-4">
        <h3 className="text-lg font-semibold">Review Transfer Details</h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Transfer Type:</span> {transferType}
          </p>
          {transferType === 'B2C' && (
            <>
              <p>
                <span className="font-medium">From:</span> Utility Account
              </p>
              <p>
                <span className="font-medium">To Phone Number:</span>{' '}
                {phoneNumber}
              </p>
            </>
          )}
          {transferType === 'B2B' && (
            <>
              <p>
                <span className="font-medium">From:</span> Working Account
              </p>
              <p>
                <span className="font-medium">To Business Short Code:</span>{' '}
                {businessShortCode}
              </p>
            </>
          )}
          {transferType === 'Swap' && (
            <>
              <p>
                <span className="font-medium">From:</span>{' '}
                {accounts.find((a) => a.id === fromAccount)?.title}
              </p>
              <p>
                <span className="font-medium">To:</span>{' '}
                {accounts.find((a) => a.id === toAccount)?.title}
              </p>
            </>
          )}
          <p>
            <span className="font-medium">Amount:</span> ${amount}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Transfer Funds
          </DialogTitle>
          <DialogDescription>
            Choose a transfer type to get started.
          </DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="grid grid-cols-3 gap-4 py-4">
            {transferTypes.map((item) => (
              <Button
                key={item.type}
                variant="outline"
                className="flex h-24 flex-col items-center justify-center p-2"
                onClick={() => {
                  setTransferType(item.type as TransferType);
                  setStep(2);
                }}
              >
                <item.icon className="mb-2 h-8 w-8" />
                <span className="text-center text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4 py-4">
            {transferType === 'B2C' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (M-Pesa)</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      className="pl-6"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            )}
            {transferType === 'B2B' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessShortCode">Business Short Code</Label>
                  <Input
                    id="businessShortCode"
                    value={businessShortCode}
                    onChange={(e) => setBusinessShortCode(e.target.value)}
                    placeholder="Enter business short code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      className="pl-6"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            )}
            {transferType === 'Swap' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Select onValueChange={setFromAccount} value={fromAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.title} - {account.balance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Select onValueChange={setToAccount} value={toAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.title} - {account.balance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      className="pl-6"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {step === 3 && renderReviewDetails()}
        {step === 4 && isSuccess && (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="text-lg font-semibold">Transfer Successful</h3>
            <p>Your {transferType} transfer has been completed successfully.</p>
          </div>
        )}
        <DialogFooter>
          {step === 1 && (
            <Button onClick={handleClose} variant="outline" className="w-full">
              Cancel
            </Button>
          )}
          {step === 2 && (
            <>
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="mb-2 w-full"
              >
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="w-full">
                Review Transfer
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="mb-2 w-full"
              >
                Back
              </Button>
              <Button onClick={handleTransfer} className="w-full">
                Confirm Transfer
              </Button>
            </>
          )}
          {step === 4 && isSuccess && (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
