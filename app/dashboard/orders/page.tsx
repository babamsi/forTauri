'use client';

import { useState, useEffect } from 'react';
import { Eye, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { useGetAllOrdersQuery } from '@/store/authApi';
import {
  getAuthCookie,
  getUserInfo,
  deleteAuthCookie
} from '@/actions/auth.actions';

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export default function TransactionHistory() {
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [user, setUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'updatedAt',
    direction: 'descending'
  });
  const [cookies, setCookies] = useState(null);

  // Fetch orders data
  const {
    data: orders,
    isLoading,
    error
  } = useGetAllOrdersQuery(cookies, {
    skip: !cookies || !user
  });

  // Fetch auth cookie
  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setCookies(k);
    });
    getUserInfo().then((userInfo) => {
      // @ts-ignore
      setUser(userInfo);
    });
  }, []);

  useEffect(() => {
    //@ts-ignore
    if (error?.data?.message === 'Token expired') {
      deleteAuthCookie();
    }
    // if(user?.role !== 'Admin') {
    //     deleteAuthCookie();
    // }
  }, [error]);

  // Sorting function
  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort transactions
  const sortedTransactions = orders
    ? [...orders]
        .filter((transaction) => {
          const matchesSearch =
            transaction.invoiceNumber
              ?.toLowerCase()
              .includes(transactionSearchQuery.toLowerCase()) ||
            transaction.user?.name
              ?.toLowerCase()
              .includes(transactionSearchQuery.toLowerCase());
          const matchesType =
            transactionTypeFilter === 'all' ||
            transaction.status === transactionTypeFilter;
          return matchesSearch && matchesType;
        })
        .sort((a, b) => {
          if (!sortConfig.key) return 0;

          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];

          if (sortConfig.key === 'totalAmount') {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
          }

          if (aValue < bValue)
            return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue)
            return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        })
    : [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">
          View and manage all transactions
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search transactions..."
            className="w-full md:w-64"
            value={transactionSearchQuery}
            onChange={(e) => setTransactionSearchQuery(e.target.value)}
          />
          <Select
            value={transactionTypeFilter}
            onValueChange={setTransactionTypeFilter}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="Refunded">Refunds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('invoiceNumber')}
                    className="text-xs"
                  >
                    Invoice
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('updatedAt')}
                    className="text-xs"
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('totalAmount')}
                    className="text-xs"
                  >
                    Total
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-4 text-center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-4 text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="text-xs font-medium">
                      {transaction.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(transaction.updatedAt)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {transaction.user?.name || 'Guest'}
                    </TableCell>
                    <TableCell
                      className={`text-right text-xs ${
                        transaction.status === 'Refunded' ? 'text-red-500' : ''
                      }`}
                    >
                      ${Math.abs(transaction.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          console.log(transaction);
                          setSelectedTransaction(transaction);
                          setIsTransactionDetailsOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog
        open={isTransactionDetailsOpen}
        onOpenChange={setIsTransactionDetailsOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View detailed information about the selected transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Invoice Number</Label>
                  <p className="font-medium">
                    {
                      // @ts-ignore
                      selectedTransaction.invoiceNumber
                    }
                  </p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">
                    {
                      // @ts-ignore
                      formatDate(selectedTransaction.updatedAt)
                    }
                  </p>
                </div>
                <div>
                  <Label>Customer</Label>
                  <p className="font-medium">
                    {
                      // @ts-ignore
                      selectedTransaction.user.name || 'Guest'
                    }
                  </p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium">
                    {
                      // @ts-ignore
                      selectedTransaction.cashType
                    }
                  </p>
                </div>
              </div>
              <div>
                <Label>Items</Label>
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Product</TableHead>
                        <TableHead className="text-xs">Quantity</TableHead>
                        {
                          // @ts-ignore
                          selectedTransaction.status === 'Refunded' && (
                            <TableHead className="text-xs">
                              Returned Quantity
                            </TableHead>
                          )
                        }
                        <TableHead className="text-xs">Price</TableHead>
                        <TableHead className="text-xs">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        // @ts-ignore
                        selectedTransaction.products.map((item) => (
                          // @ts-ignore
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">
                              {
                                // @ts-ignore
                                item.product
                              }
                              <Badge
                                variant={
                                  // @ts-ignore
                                  item.isNewBatch ? 'secondary' : 'outline'
                                }
                                className="ml-2"
                              >
                                {
                                  // @ts-ignore
                                  item.isNewBatch
                                    ? 'New Batch'
                                    : 'Current Batch'
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {item.quantity}
                            </TableCell>
                            {
                              // @ts-ignore
                              selectedTransaction.status === 'Refunded' && (
                                <TableCell className="text-xs">
                                  <Badge
                                    variant={
                                      // @ts-ignore
                                      item.returnQuantity
                                        ? 'destructive'
                                        : 'outline'
                                    }
                                    className="ml-2"
                                  >
                                    {
                                      // @ts-ignore
                                      item.returnQuantity
                                    }
                                  </Badge>
                                </TableCell>
                              )
                            }
                            <TableCell className="text-xs">
                              ${item.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-xs">
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    $
                    {// @ts-ignore
                    (
                      selectedTransaction.totalAmount -
                      // @ts-ignore
                      selectedTransaction.vat +
                      // @ts-ignore
                      selectedTransaction.discount
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>
                    $
                    {
                      // @ts-ignore
                      selectedTransaction.vat.toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>
                    $
                    {
                      // @ts-ignore
                      selectedTransaction.discount.toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span
                    className={
                      // @ts-ignore
                      selectedTransaction.status === 'Refunded'
                        ? 'text-red-500'
                        : ''
                    }
                  >
                    {
                      // @ts-ignore
                      selectedTransaction.status === 'Refunded' ? '-' : ''
                    }
                    $
                    {
                      // @ts-ignore
                      Math.abs(selectedTransaction.totalAmount).toFixed(2)
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setIsTransactionDetailsOpen(false)}
              className="text-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
