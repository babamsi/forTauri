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
  Plus,
  MoreHorizontal,
  ChevronDown,
  Loader2,
  X,
  User,
  Mail,
  Phone
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
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
import { useGetAllOrdersQuery } from '@/store/authApi';
import { deleteAuthCookie, getAuthCookie } from '@/actions/auth.actions';
import { CalendarDateRangePicker } from '@/components/date-range-picker';

// Utility functions
const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    amount
  );
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const formatPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) return 'N/A';
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    const intlCode = match[1] ? '+1 ' : '';
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
  }
  return phoneNumber;
};

interface Invoice {
  _id: { $oid: string };
  invoiceNumber: string;
  items: Array<{
    _id: { $oid: string } | undefined;
    id: string | undefined;
    product: string;
    quantity: string;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  createdAt: { $date: string };
  status: string;
  name: string;
  email: string;
  paymentMethod: string;
}

interface Customer {
  _id: string;
  user: {
    name: string;
    phone: string;
    email: string;
  };
  invoiceNumber: string;
  products: Invoice['items'];
  totalAmount: number;
  soldBy: string;
  visited: number;
  cashType: string;
  createdAt: string;
  updatedAt: string;
}

const InvoiceDetails: React.FC<{
  invoice: Invoice | null;
  onClose: () => void;
}> = ({ invoice, onClose }) => {
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
                    <div className="font-medium">
                      {
                        // @ts-ignore
                        invoice.user.name
                      }
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="font-medium">
                      {
                        //@ts-ignore
                        invoice.user.email
                      }
                    </div>
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
                      {invoice.status === 'Refunded' && (
                        <TableHead className="text-right">Returned</TableHead>
                      )}
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {//@ts-ignore
                    invoice.products?.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        {invoice.status === 'Refunded' && (
                          <TableCell className="text-right">
                            {item.returnQuantity}
                          </TableCell>
                        )}
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
                      {
                        // @ts-ignore
                        invoice.cashType === 'Bank' && (
                          <CreditCard className="h-4 w-4" />
                        )
                      }
                      {
                        // @ts-ignore
                        invoice.cashType === 'Cash' && (
                          <Banknote className="h-4 w-4" />
                        )
                      }
                      {
                        // @ts-ignore
                        invoice.cashType === 'Mobile' && (
                          <Wallet className="h-4 w-4" />
                        )
                      }
                      <span>
                        {
                          // @ts-ignore
                          invoice.cashType
                        }
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <div className="font-medium">
                      {
                        // @ts-ignore
                        formatDate(invoice.updatedAt)
                      }
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div>
                      <Badge
                        variant={
                          // @ts-ignore
                          invoice.status !== 'Refunded'
                            ? 'outline'
                            : 'destructive'
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

const TransactionsTable: React.FC<{
  transactions: Customer[];
  onViewInvoice: (invoice: Invoice) => void;
  onViewCustomer: (customer: Customer) => void;
}> = ({ transactions, onViewInvoice, onViewCustomer }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest customer purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="hidden sm:block">
                        <AvatarFallback>
                          {transaction.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">
                          {transaction.user.name}
                        </div>
                        <div className="hidden text-sm text-muted-foreground sm:block">
                          {
                            // @ts-ignore
                            transaction.email
                          }
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.totalAmount)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(transaction.createdAt)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={
                        // @ts-ignore
                        transaction.status != 'Refunded'
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {
                        // @ts-ignore
                        transaction.status != 'Refunded'
                          ? 'Paid'
                          : // @ts-ignore
                            transaction.status
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(
                              transaction.invoiceNumber
                            );
                            toast.success('Invoice ID copied to clipboard');
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Copy invoice ID</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onViewCustomer(transaction)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Visit profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={
                            // @ts-ignore
                            () => onViewInvoice(transaction)
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>View payment details</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomerDetails: React.FC<{
  customer: Customer | null;
  onClose: () => void;
}> = ({ customer, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  if (!customer) return null;

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>
                {customer.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              {customer.user.name}
              <DialogDescription>{customer.user.email}</DialogDescription>
            </div>
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
            aria-label="Close details"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-grow flex-col overflow-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview & Contact</TabsTrigger>
            <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-grow">
            <TabsContent
              value="overview"
              className="min-h-[400px] overflow-auto p-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Customer Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Overview</h3>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            Total Purchases:
                          </span>
                          <span>{formatCurrency(customer.totalAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Join Date:</span>
                          <span>{formatDate(customer.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Last Purchase:</span>
                          <span>{formatDate(customer.updatedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Total Visits:</span>
                          <span>{customer.visited}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Contact Information</h3>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 opacity-70" />
                          <span>{customer.user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 opacity-70" />
                          <span>{formatPhoneNumber(customer.user.phone)}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 opacity-70" />
                          <span>Sold by: {customer.soldBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="purchases" className="min-h-[400px] p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{customer.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(customer.createdAt)}</TableCell>
                        <TableCell>
                          {formatCurrency(customer.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={'outline'}>Paid</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedInvoice(customer as unknown as Invoice)
                            }
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </Dialog>
  );
};

const ContactBook: React.FC<{
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}> = ({ customers, onSelectCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.user.phone && customer.user.phone.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <Card className="w-full sm:w-[400px]">
      <CardHeader>
        <CardTitle>Contact Book</CardTitle>
        <CardDescription>Manage your customer contacts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        <ScrollArea className="h-[300px] sm:h-[400px]">
          {paginatedCustomers.map((customer) => (
            <div
              key={customer._id}
              className="flex cursor-pointer items-center space-x-4 p-2 hover:bg-accent"
              onClick={() => onSelectCustomer(customer)}
            >
              <Avatar>
                <AvatarFallback>
                  {customer.user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{customer.user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.user.email}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isContactBookOpen, setIsContactBookOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [date, setDate] = useState({
    from: null,
    to: null
  });
  const [cookies, setCookies] = useState(null);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const itemsPerPage = 10;
  const transactionsPerPage = 10;

  const {
    data: allOrders,
    isLoading: isLoadingOrders,
    error: errorOrders,
    refetch
  } = useGetAllOrdersQuery(cookies, {
    skip: !cookies
  });

  // console.log(allOrders)

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setCookies(k);
    });
  }, []);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     // setIsLoading(true)
  //     try {
  //       const { data: allOrders, isLoading: isLoadingOrders, error: errorOrders, refetch } = useGetAllOrdersQuery(cookies, {
  //         skip: !cookies
  //       });
  //       // if(isLoadingOrders) {
  //       //   setIsLoading(isLoadingOrders)
  //       // }
  //       if (errorOrders) {
  //         setError(errorOrders)
  //       }

  //       setCustomers(allOrders)
  //       // setIsLoading(false)
  //       console.log(allOrders)
  //     } catch (err) {
  //       // setError('Failed to load data. Please try again.')
  //       console.error('Error fetching data:', err)
  //     }
  //   }

  //   fetchData()
  // }, [])
  useEffect(() => {
    if (allOrders) {
      setCustomers(allOrders);
    }
  }, [allOrders]);

  const filteredData = useMemo(() => {
    console.log(customers);
    return customers
      .filter(
        (customer) =>
          (customer.user.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            customer.user.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            customer.invoiceNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) &&
          (!date?.from || new Date(customer.updatedAt) >= date.from) &&
          (!date?.to || new Date(customer.updatedAt) <= date.to)
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [customers, searchTerm, date]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedTransactions = useMemo(() => {
    const startIndex = (transactionsPage - 1) * transactionsPerPage;
    return filteredData.slice(startIndex, startIndex + transactionsPerPage);
  }, [filteredData, transactionsPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalTransactionPages = Math.ceil(
    filteredData.length / transactionsPerPage
  );

  const handleViewDetails = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsContactBookOpen(false);
    toast.success(
      `Viewing details for ${
        // @ts-ignore
        customer.name
      }`
    );
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedCustomer(null);
  }, []);

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    toast.success(`Viewing invoice #${invoice.invoiceNumber}`);
  }, []);

  const handleCloseInvoice = useCallback(() => {
    setSelectedInvoice(null);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleTransactionsPageChange = useCallback((page: number) => {
    setTransactionsPage(page);
  }, []);

  if (isLoadingOrders) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (errorOrders) {
    // @ts-ignore
    if (errorOrders?.data?.message === 'Token expired') {
      return deleteAuthCookie();
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <Button size="sm" onClick={() => setIsContactBookOpen(true)}>
          <User className="mr-2 h-4 w-4" /> Contact Book
        </Button>
      </div>
      <div className="mb-6 flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            className="w-[300px]"
            placeholder="Search customers..."
            onChange={(e) => debouncedSearch(e.target.value)}
            aria-label="Search customers"
          />
        </div>
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-[300px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} -{' '}
                      {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Last 7 days</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Command>
                <CommandInput placeholder="Select date range..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() =>
                        setDate({
                          // @ts-ignore
                          from: new Date(),
                          // @ts-ignore
                          to: new Date()
                        })
                      }
                    >
                      Today
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setDate({
                          // @ts-ignore
                          from: yesterday,
                          // @ts-ignore
                          to: new Date()
                        });
                      }}
                    >
                      Yesterday
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        setDate({
                          // @ts-ignore
                          from: sevenDaysAgo,
                          // @ts-ignore
                          to: new Date()
                        });
                      }}
                    >
                      Last 7 days
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        setDate({
                          // @ts-ignore
                          from: thirtyDaysAgo,
                          // @ts-ignore
                          to: new Date()
                        });
                      }}
                    >
                      Last 30 days
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        const firstDayOfMonth = new Date();
                        firstDayOfMonth.setDate(1);
                        setDate({
                          // @ts-ignore
                          from: firstDayOfMonth,
                          // @ts-ignore
                          to: new Date()
                        });
                      }}
                    >
                      This month
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        const firstDayOfQuarter = new Date();
                        firstDayOfQuarter.setMonth(
                          Math.floor(firstDayOfQuarter.getMonth() / 3) * 3
                        );
                        firstDayOfQuarter.setDate(1);
                        setDate({
                          // @ts-ignore
                          from: firstDayOfQuarter,
                          // @ts-ignore
                          to: new Date()
                        });
                      }}
                    >
                      This quarter
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        const firstDayOfYear = new Date(
                          new Date().getFullYear(),
                          0,
                          1
                        );
                        setDate({
                          // @ts-ignore
                          from: firstDayOfYear,
                          // @ts-ignore
                          to: new Date()
                        });
                      }}
                    >
                      This year
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <TransactionsTable
        transactions={paginatedTransactions}
        onViewInvoice={handleViewInvoice}
        onViewCustomer={handleViewDetails}
      />
      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTransactionsPageChange(transactionsPage - 1)}
          disabled={transactionsPage === 1}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {transactionsPage} of {totalTransactionPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTransactionsPageChange(transactionsPage + 1)}
          disabled={transactionsPage === totalTransactionPages}
        >
          Next
        </Button>
      </div>

      <Dialog open={isContactBookOpen} onOpenChange={setIsContactBookOpen}>
        <DialogContent>
          <ContactBook
            customers={customers}
            onSelectCustomer={handleViewDetails}
          />
        </DialogContent>
      </Dialog>
      {selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          onClose={handleCloseDetails}
        />
      )}
      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={handleCloseInvoice}
        />
      )}
    </div>
  );
}
