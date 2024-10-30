'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Search,
  Calendar as CalendarIcon,
  CreditCard,
  Banknote,
  Wallet,
  Copy,
  FileText,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  Loader2,
  X,
  UserRound,
  BarChart2
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const InvoiceDetails = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className="flex h-[90vh] w-full max-w-4xl flex-col gap-0 p-0">
        <DialogHeader className="sticky top-0 z-10 flex flex-row items-center justify-between border-b bg-background px-4 py-2">
          <div>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Invoice #{invoice.invoiceNumber}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <ScrollArea className="flex-grow px-4">
          <div className="space-y-6 py-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Name</Label>
                    <div className="font-medium">{invoice.name}</div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="font-medium">{invoice.email}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Products Purchased</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items?.map((item) => (
                      <TableRow key={item._id?.$oid || item.id}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Total Amount</Label>
                    <div className="font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <div className="flex items-center gap-2 font-medium">
                      {invoice.paymentMethod === 'credit_card' && (
                        <CreditCard className="h-4 w-4" />
                      )}
                      {invoice.paymentMethod === 'cash' && (
                        <Banknote className="h-4 w-4" />
                      )}
                      {invoice.paymentMethod === 'wallet' && (
                        <Wallet className="h-4 w-4" />
                      )}
                      <span>{invoice.paymentMethod}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <div className="font-medium">
                      {formatDate(invoice.createdAt?.$date)}
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div>
                      <Badge
                        variant={
                          invoice.status === 'Paid' ? 'success' : 'warning'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetails;
