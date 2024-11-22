'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  ArrowUpDown,
  Search,
  MoreHorizontal,
  Loader2,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { format, parseISO, isWithinInterval } from 'date-fns';
import { useGetAllOrdersQuery } from '@/store/authApi';
import {
  getAuthCookie,
  getUserInfo,
  deleteAuthCookie
} from '@/actions/auth.actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import PageContainer from '@/components/layout/page-container';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Utility function for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [cookies, setCookies] = useState(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined
  });
  const [pageIndex, setPageIndex] = useState(0);
  const itemsPerPage = 10;

  // Add this handler function
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
  };

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
          let matchesDateRange = true;
          if (date?.from && date?.to && transaction.updatedAt) {
            const orderDate = parseISO(transaction.updatedAt);
            matchesDateRange = isWithinInterval(orderDate, {
              start: date.from,
              end: date.to
            });
          }
          return matchesSearch && matchesType && matchesDateRange;
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

  // Calculate total pages
  const totalPages = Math.ceil(
    (sortedTransactions?.length || 0) / itemsPerPage
  );

  // Calculate paginated data
  const paginatedTransactions = sortedTransactions.slice(
    pageIndex * itemsPerPage,
    (pageIndex + 1) * itemsPerPage
  );

  // Define columns for the table
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: () => <div className="w-[150px] text-left">Invoice</div>,
      cell: ({ row }) => (
        <div className="w-[150px] text-left">{row.original.invoiceNumber}</div>
      )
    },
    {
      accessorKey: 'updatedAt',
      header: () => <div className="w-[200px] text-left">Date</div>,
      cell: ({ row }) => (
        <div className="w-[200px] text-left">
          {formatDate(row.original.updatedAt)}
        </div>
      )
    },
    {
      accessorKey: 'user',
      header: () => <div className="w-[300px] text-left">Customer</div>,
      cell: ({ row }) => (
        <div className="flex w-[300px] items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {row.original.user?.name?.charAt(0) || 'G'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {row.original.user?.name || 'Guest User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.user?.email || 'No email'}
            </span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: () => <div className="w-[150px] text-left">Status</div>,
      cell: ({ row }) => (
        <div className="w-[150px]">
          <Badge
            variant={
              row.original.status !== 'Refunded' ? 'outline' : 'destructive'
            }
          >
            {row.original.status !== 'Refunded'
              ? 'Completed'
              : row.original.status}
          </Badge>
        </div>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: () => <div className="w-[150px] text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="w-[150px] text-right font-medium">
          {formatCurrency(row.original.totalAmount)}
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="w-[100px]"></div>,
      cell: ({ row }) => (
        <div className="w-[100px]">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              setSelectedTransaction(row.original);
              setIsTransactionDetailsOpen(true);
            }}
          >
            <Eye className="mr-2 h-3 w-3" />
            View
          </Button>
        </div>
      )
    }
  ];

  // Initialize table with proper pagination
  const table = useReactTable({
    data: paginatedTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex,
        pageSize: itemsPerPage
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize: itemsPerPage
        });
        setPageIndex(newState.pageIndex);
      }
    },
    manualPagination: true
  });

  // Pagination handlers
  const handlePreviousPage = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleFirstPage = () => {
    setPageIndex(0);
  };

  const handleLastPage = () => {
    setPageIndex(totalPages - 1);
  };

  return (
    <div className="container flex h-[calc(100vh-2rem)] flex-col">
      {/* Header Section - Fixed */}
      <div className="flex-none space-y-4">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="w-[300px] pl-8"
                value={transactionSearchQuery}
                onChange={(e) => setTransactionSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker
              date={date}
              onDateChange={handleDateChange}
            />
            <Select
              value={transactionTypeFilter}
              onValueChange={setTransactionTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
                {/* <SelectItem value="Completed">Completed</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Section with Fixed Header and Scrollable Body */}
      <Card className="mt-4 flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          {/* Fixed Header */}
          <div className="flex-none">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            </Table>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination - Fixed at bottom */}
      <div className="sticky bottom-0 mt-4 flex-none border-t bg-background px-4 py-2">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {sortedTransactions.length} total rows
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={handleFirstPage}
                disabled={pageIndex === 0}
              >
                <DoubleArrowLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlePreviousPage}
                disabled={pageIndex === 0}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {pageIndex + 1} of {totalPages}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleNextPage}
                disabled={pageIndex === totalPages - 1}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={handleLastPage}
                disabled={pageIndex === totalPages - 1}
              >
                <DoubleArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
