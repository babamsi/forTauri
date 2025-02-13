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
import { Calendar, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface RecurringPayment {
  id: string;
  name: string;
  amount: string;
  frequency: string;
  nextPayment: string;
}

interface RecurringPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dummyRecurringPayments: RecurringPayment[] = [
  {
    id: '1',
    name: 'Netflix Subscription',
    amount: '$14.99',
    frequency: 'Monthly',
    nextPayment: '2023-07-15'
  },
  {
    id: '2',
    name: 'Gym Membership',
    amount: '$50.00',
    frequency: 'Monthly',
    nextPayment: '2023-07-20'
  },
  {
    id: '3',
    name: 'Car Insurance',
    amount: '$120.00',
    frequency: 'Quarterly',
    nextPayment: '2023-09-01'
  }
];

export default function RecurringPaymentsModal({
  isOpen,
  onClose
}: RecurringPaymentsModalProps) {
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentFrequency, setNewPaymentFrequency] = useState('');
  const [newPaymentStartDate, setNewPaymentStartDate] = useState('');

  const handleAddPayment = () => {
    // Implement add payment logic here
    console.log(`Adding new recurring payment: ${newPaymentName}`);
    // Reset form fields
    setNewPaymentName('');
    setNewPaymentAmount('');
    setNewPaymentFrequency('');
    setNewPaymentStartDate('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Recurring Payments
          </DialogTitle>
          <DialogDescription>
            Manage your recurring payments and set up new ones.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyRecurringPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.name}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.frequency}</TableCell>
                  <TableCell>{payment.nextPayment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Add New Recurring Payment</h3>
            <div className="space-y-2">
              <Label htmlFor="newPaymentName">Payment Name</Label>
              <Input
                id="newPaymentName"
                value={newPaymentName}
                onChange={(e) => setNewPaymentName(e.target.value)}
                placeholder="Enter payment name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPaymentAmount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="newPaymentAmount"
                  type="number"
                  className="pl-6"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPaymentFrequency">Frequency</Label>
              <Select
                onValueChange={setNewPaymentFrequency}
                value={newPaymentFrequency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPaymentStartDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="newPaymentStartDate"
                  type="date"
                  className="pl-10"
                  value={newPaymentStartDate}
                  onChange={(e) => setNewPaymentStartDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddPayment} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Recurring Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
