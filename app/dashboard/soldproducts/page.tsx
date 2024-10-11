'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGetOrdersQuery, useGetExpenseQuery } from '@/store/authApi';
import { getAuthCookie } from '@/actions/auth.actions';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

interface Product {
  product: string;
  quantity: string;
  price: string;
  subtotal: string;
}
interface Expense {
  _id: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface Order {
  _id: string;
  products: Product[];
  totalAmount: number;
  cashType: string;
  soldBy: string;
  invoiceNumber: string;
  user: {
    name: string;
    phone: string;
    email: string;
  };
  revenue: string;
  createdAt: string;
  status: string;
}

export default function SoldProductsPage() {
  const [cookies, setCookies] = useState(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const ordersPerPage = 10;

  const { data: orders, error, isLoading } = useGetOrdersQuery(cookies);
  const { data: expense } = useGetExpenseQuery(cookies);

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setCookies(k);
    });
  }, []);

  const filteredOrders =
    orders?.filter((order: Order) => {
      const orderDate = new Date(order.createdAt);
      const isInDateRange =
        (!date?.from || orderDate >= date.from) &&
        (!date?.to || orderDate <= date.to);
      const matchesSearch =
        order.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      return isInDateRange && matchesSearch;
    }) || [];

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalExpenses = useMemo(() => {
    if (!expense) return 0;
    return expense.reduce(
      (sum: number, expense: Expense) => sum + expense.amount,
      0
    );
  }, [expense]);

  const totalRevenue = filteredOrders.reduce(
    // @ts-ignore
    (sum, order) => sum + parseFloat(order.totalAmount),
    0
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading orders. Please try again.</div>;
  }

  return (
    <div className="container mx-auto space-y-4 p-4">
      <h1 className="text-2xl font-bold">Sold Products</h1>

      <div className="flex flex-col space-y-2 sm:flex-row sm:items-end sm:space-x-2 sm:space-y-0">
        <div className="flex-grow">
          <CalendarDateRangePicker date={date} setDate={setDate} />
        </div>
        <div className="flex w-full space-x-2 sm:w-auto">
          <Input
            placeholder="Search by invoice or customer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button className="shrink-0">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {' '}
              KES {totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.map((order: Order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.invoiceNumber}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'PP')}
                    </TableCell>
                    <TableCell>{order.user.name}</TableCell>
                    <TableCell>
                      <ul className="list-inside list-disc">
                        {order.products.map((product, index) => (
                          <li key={index}>
                            {product.product} (x{product.quantity})
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{order.cashType}</TableCell>
                    <TableCell>
                      <span
                        className={
                          order.status === 'Refunded'
                            ? 'font-semibold text-red-500'
                            : ''
                        }
                      >
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstOrder + 1} to{' '}
          {Math.min(indexOfLastOrder, filteredOrders.length)} of{' '}
          {filteredOrders.length} orders
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                // @ts-ignore
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index} className="hidden sm:inline-block">
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                // @ts-ignore
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
