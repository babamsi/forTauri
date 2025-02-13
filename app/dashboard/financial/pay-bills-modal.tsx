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
import { CreditCard, Calendar } from 'lucide-react';

interface Bill {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
}

interface PayBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dummyBills: Bill[] = [
  { id: '1', name: 'Electricity', amount: '$75.50', dueDate: '2023-07-15' },
  { id: '2', name: 'Water', amount: '$45.20', dueDate: '2023-07-20' },
  { id: '3', name: 'Internet', amount: '$89.99', dueDate: '2023-07-25' },
  { id: '4', name: 'Phone', amount: '$65.00', dueDate: '2023-07-18' }
];

export default function PayBillsModal({ isOpen, onClose }: PayBillsModalProps) {
  const [selectedBill, setSelectedBill] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const handlePayBill = () => {
    // Implement bill payment logic here
    console.log(
      `Paying bill ${selectedBill} with ${paymentMethod} on ${paymentDate}`
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Pay Bills</DialogTitle>
          <DialogDescription>
            Select a bill to pay and choose your payment method.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bill">Select Bill</Label>
            <Select onValueChange={setSelectedBill} value={selectedBill}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a bill to pay" />
              </SelectTrigger>
              <SelectContent>
                {dummyBills.map((bill) => (
                  <SelectItem key={bill.id} value={bill.id}>
                    {bill.name} - {bill.amount} (Due: {bill.dueDate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select onValueChange={setPaymentMethod} value={paymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Account</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="debit">Debit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="paymentDate"
                type="date"
                className="pl-10"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePayBill} className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
