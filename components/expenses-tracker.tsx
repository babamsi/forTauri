'use client';

import {
  CalendarIcon,
  Check,
  ChevronDown,
  Filter,
  HelpCircle,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import * as React from 'react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash/debounce';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  useAddExpensesMutation,
  useGetExpenseQuery,
  useGetMyExpansesQuery
} from '@/store/authApi';
import { getUserInfo } from '@/actions/auth.actions';
import { getAuthCookie } from '@/actions/auth.actions';

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
};

const categories = {
  Purchase:
    'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  Software: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Meals: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  Rent: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Equipment:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  'Facilities Expenses':
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Fees: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  Taxes:
    'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  Travel: 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
  Activity: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  Salary:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  Utilities:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  Insurance:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  Maintenance: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: keyof typeof categories;
  account: string;
  method: string;
  status: 'pending' | 'completed';
};

type ColumnVisibility = {
  [key in keyof Omit<Transaction, 'id'>]: boolean;
};

type FilterState = {
  category: string;
  account: string;
  status: string;
  date: Date | undefined;
};

export function ExpensesTracker() {
  const [date, setDate] = React.useState<Date>();

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibility>({
      date: true,
      description: true,
      amount: true,
      category: true,
      account: true,
      method: true,
      status: true
    });
  const [newTransaction, setNewTransaction] = React.useState<Transaction>({
    id: '',
    date: new Date().toDateString(),
    description: '',
    amount: 0,
    category: 'Purchase',
    account: 'SomBank',
    method: 'Cash',
    status: 'pending'
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false);
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState>({
    category: 'all',
    account: 'all',
    status: 'all',
    date: undefined
  });
  const [cookies, setCookies] = React.useState<string | null>(null);
  const [user, setUser] = React.useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const { toast } = useToast();
  const [addExpense, { isLoading: isAdding }] = useAddExpensesMutation();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: adminExpenses,
    isLoading: isLoadingAdmin,
    isError: isErrorAdmin,
    error: adminError
  } = useGetExpenseQuery(cookies, {
    // @ts-ignore
    skip: user?.role !== 'Admin'
  });

  const {
    data: staffExpenses,
    isLoading: isLoadingStaff,
    isError: isErrorStaff,
    error: staffError
  } = useGetMyExpansesQuery(cookies, {
    // @ts-ignore
    skip: user?.role !== 'stuff'
  });

  useEffect(() => {
    getAuthCookie().then(
      // @ts-ignore
      (cookie: string | null) => {
        setCookies(cookie);
      }
    );
    getUserInfo().then((userInfo) => {
      // @ts-ignore
      setUser(userInfo);
    });
  }, []);

  console.log(staffExpenses, staffError);

  // console.log(cookies);

  const transactions = useMemo(() => {
    // @ts-ignore
    if (user?.role === 'Admin') {
      return adminExpenses || [];
    }
    // @ts-ignore
    if (user?.role === 'stuff') {
      return staffExpenses || [];
    }
    return [];
    // @ts-ignore
  }, [user?.role, adminExpenses, staffExpenses]);

  const addTransaction = async () => {
    if (isUploading) {
      toast({
        title: 'Please wait',
        description: 'Image is still uploading...',
        variant: 'destructive'
      });
      return;
    }
    const newData = {
      ...newTransaction,
      date: date?.toDateString() || new Date().toDateString(),
      receiptUrl: uploadedImageUrl
    };

    try {
      await addExpense({
        data: newData,
        cookies
      }).unwrap();

      setIsAddTransactionOpen(false);
      setNewTransaction({
        id: '',
        date: new Date().toDateString(),
        description: '',
        amount: 0,
        category: 'Purchase',
        account: 'SomBank',
        method: 'Cash',
        status: 'pending'
      });
      setReceiptFile(null);
      setUploadedImageUrl('');

      toast({
        title: 'Success',
        description: 'Transaction added successfully'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive'
      });
    }
  };

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      // @ts-ignore
      (transaction) => {
        const matchesSearch = transaction.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const matchesCategory =
          filters.category === 'all' ||
          transaction.category === filters.category;
        const matchesStatus =
          filters.status === 'all' || transaction.status === filters.status;
        const matchesDate =
          !filters.date || transaction.date === filters.date?.toDateString();

        return matchesSearch && matchesCategory && matchesStatus && matchesDate;
      }
    );
  }, [transactions, searchQuery, filters]);

  const paginatedTransactions = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredTransactions.slice(firstPageIndex, lastPageIndex);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        setUploadedImageUrl(data.url);
        setReceiptFile(file);
        toast({
          title: 'Success',
          description: 'Receipt uploaded successfully'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to upload receipt',
          variant: 'destructive'
        });
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | Date | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );
  // @ts-ignore
  const isLoading = user?.role === 'Admin' ? isLoadingAdmin : isLoadingStaff;
  // @ts-ignore
  const isError = user?.role === 'Admin' ? isErrorAdmin : isErrorStaff;
  // @ts-ignore
  const error = user?.role === 'Admin' ? adminError : staffError;

  // Add loading state JSX
  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading expenses...</p>
        </div>
      </div>
    );
  }

  // Add error state JSX
  if (isError) {
    console.log(isError);
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="space-y-2 text-center">
          <p className="text-red-600">Error loading expenses</p>
          <p className="text-sm text-muted-foreground">
            {/* @ts-ignore */}
            {error?.data?.message || 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  console.log(staffError);
  console.log(staffExpenses);

  return (
    <div className="flex h-full flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between space-y-2 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Manage and track your business expenses
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Sheet
            open={isAddTransactionOpen}
            onOpenChange={setIsAddTransactionOpen}
          >
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {isSmallScreen ? 'Add' : 'Add New'}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-full w-full flex-col overflow-hidden dark:text-white sm:max-w-[400px]  lg:max-w-[540px]"
            >
              <SheetHeader className="flex-shrink-0">
                <SheetTitle className="dark:text-white">
                  Add Transaction
                </SheetTitle>
                <SheetDescription className="dark:text-gray-400">
                  Add a new transaction to your expenses.
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 overflow-y-auto px-6">
                <div className="grid gap-4 py-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="Enter description"
                      value={newTransaction.description}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          description: e.target.value
                        })
                      }
                      className=" dark:text-white"
                    />
                  </div>

                  {/* Amount and Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="amount"
                        className="text-sm font-medium dark:text-gray-300"
                      >
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={newTransaction.amount}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            amount: parseFloat(e.target.value)
                          })
                        }
                        className="dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="currency"
                        className="text-sm font-medium dark:text-gray-300"
                      >
                        Currency
                      </Label>
                      <Select defaultValue="usd">
                        <SelectTrigger
                          id="currency"
                          className=" dark:text-white"
                        >
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="">
                          <SelectItem value="usd">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Account and Date */}
                  {/* <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account" className="text-sm font-medium dark:text-gray-300">
                      Account
                    </Label>
                    <Select 
                      defaultValue={newTransaction.account}
                      onValueChange={(value) => setNewTransaction({...newTransaction, account: value})}
                    >
                      <SelectTrigger id="account" className=" dark:text-white">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem value="SomBank">SomBank (usd)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium dark:text-gray-300">
                      Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal dark:text-white",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 ">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className="dark:bg-gry-800"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div> */}

                  {/* Category */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Category
                    </Label>
                    <Select
                      defaultValue={newTransaction.category}
                      onValueChange={(value) =>
                        setNewTransaction({
                          ...newTransaction,
                          category: value as keyof typeof categories
                        })
                      }
                    >
                      <SelectTrigger id="category" className=" dark:text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="">
                        {Object.keys(categories).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="method"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Payment Method
                    </Label>
                    <Select
                      defaultValue={newTransaction.method}
                      onValueChange={(value) =>
                        setNewTransaction({ ...newTransaction, method: value })
                      }
                    >
                      <SelectTrigger id="method" className=" dark:text-white">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Wire Transfer">
                          Wire Transfer
                        </SelectItem>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="Online Banking">
                          Online Banking
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Status
                    </Label>
                    <Select
                      defaultValue={newTransaction.status}
                      onValueChange={(value) =>
                        setNewTransaction({
                          ...newTransaction,
                          status: value as 'pending' | 'completed'
                        })
                      }
                    >
                      <SelectTrigger id="status" className=" dark:text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Receipt Upload */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="receipt"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Upload Receipt
                    </Label>
                    <div className="flex w-full items-center justify-center">
                      <label
                        htmlFor="receipt-upload"
                        className={cn(
                          'flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed',
                          'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800',
                          'dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600',
                          isUploading && 'cursor-not-allowed opacity-50'
                        )}
                      >
                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                          {isUploading ? (
                            <>
                              <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Uploading...
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{' '}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG or PDF (MAX. 800x400px)
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          id="receipt-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept="image/png, image/jpeg, application/pdf"
                          disabled={isUploading}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                    {receiptFile && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          File: {receiptFile.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReceiptFile(null);
                            setUploadedImageUrl('');
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="note"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Note
                    </Label>
                    <Input
                      id="note"
                      placeholder="Add a note"
                      className=" dark:text-white"
                    />
                  </div>
                </div>
              </ScrollArea>

              <SheetFooter className="mt-4">
                <Button
                  className="w-full"
                  onClick={addTransaction}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="flex flex-col space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-x-4 md:space-y-0">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-8"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    handleFilterChange('category', value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.keys(categories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Range Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Column Visibility */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[150px]">
                    {Object.entries(columnVisibility).map(([key, value]) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setColumnVisibility((prev) => ({
                            ...prev,
                            [key]: checked
                          }))
                        }
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[28px]">
                      <Checkbox id="select-all" />
                    </TableHead>
                    {columnVisibility.date && <TableHead>Date</TableHead>}
                    {columnVisibility.description && (
                      <TableHead>Description</TableHead>
                    )}
                    {columnVisibility.amount && <TableHead>Amount</TableHead>}
                    {columnVisibility.category && (
                      <TableHead>Category</TableHead>
                    )}
                    {columnVisibility.account && (
                      <TableHead>Added By</TableHead>
                    )}
                    {columnVisibility.method && <TableHead>Method</TableHead>}
                    {columnVisibility.status && <TableHead>Status</TableHead>}
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(columnVisibility).filter(Boolean)
                            .length + 2
                        }
                        className="h-24 text-center"
                      >
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map(
                      // @ts-ignore
                      (transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Checkbox id={`select-${transaction.id}`} />
                          </TableCell>
                          {columnVisibility.date && (
                            <TableCell>{transaction.date}</TableCell>
                          )}
                          {columnVisibility.description && (
                            <TableCell
                              className={cn(
                                'font-medium',
                                transaction.description
                                  .toLowerCase()
                                  .includes('batch') &&
                                  'text-green-600 dark:text-green-400'
                              )}
                            >
                              {transaction.description}
                            </TableCell>
                          )}
                          {columnVisibility.amount && (
                            <TableCell>
                              ${transaction.amount.toFixed(2)}
                            </TableCell>
                          )}
                          {columnVisibility.category && (
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'font-normal',
                                  // @ts-ignore
                                  categories[transaction.category]
                                )}
                              >
                                {transaction.category}
                              </Badge>
                            </TableCell>
                          )}
                          {columnVisibility.account && (
                            <TableCell>{transaction.addedBy}</TableCell>
                          )}
                          {columnVisibility.method && (
                            <TableCell>{transaction.paymentMethod}</TableCell>
                          )}
                          {columnVisibility.status && (
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === 'completed'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={cn(
                                  'font-normal',
                                  transaction.status === 'completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                )}
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Showing {paginatedTransactions.length} of{' '}
                  {transactions.length} entries
                </p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
