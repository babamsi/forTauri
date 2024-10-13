'use client';

import { AreaGraph } from '@/components/charts/area-graph';
import { BarGraph } from '@/components/charts/bar-graph';
import { PieGraph } from '@/components/charts/pie-graph';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import PageContainer from '@/components/layout/page-container';
import { RecentSales } from '@/components/recent-sales';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import {
  useAddExpensesMutation,
  useGetOrdersQuery,
  useGetExpenseQuery,
  useGetAllOrdersQuery
} from '@/store/authApi';
import { useEffect, useState, useMemo } from 'react';
import { getAuthCookie } from '@/actions/auth.actions';
import { ShoppingCart, PlusIcon, Blocks } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast, Toaster } from 'react-hot-toast';

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
  revenue: number;
  createdAt: string;
  status: string;
}
export default function Page() {
  const [cookies, setcookies] = useState(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  const {
    data: orders,
    error,
    isLoading
  } = useGetOrdersQuery(cookies, {
    skip: userRole !== 'stuff'
  });
  const [addExpense, { error: addExpenseError }] = useAddExpensesMutation();
  const { data: allOrders } = useGetAllOrdersQuery(cookies, {
    skip: userRole !== 'admin'
  });

  const { data: expense } = useGetExpenseQuery(cookies, {
    skip: userRole !== 'admin'
  });

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k); //setting the token so the server can verify and give us output
    });
    const role = JSON.parse(localStorage.getItem('userStore') || '{}');
    setUserRole(role?.role);
  }, []);

  let total = 0;
  let evcAmout = 0;
  let cashAmount = 0;

  console.log(expense);
  const calculateMetrics = (orders: Order[]) => {
    if (!orders || !date?.from || !date?.to)
      return { totalSales: 0, totalOrders: 0, averageOrderValue: 0 };
    // console.log(date?.from, date?.to, new Date(order.createdAt));
    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      // console.log(orderDate, date?.from, date?.to);

      return (
        // @ts-ignore
        orderDate >= date?.from &&
        // @ts-ignore
        orderDate <= date?.to &&
        order.status !== 'Refunded'
      );
    });
    // console.log(filteredOrders);
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.revenue,
      0
    );
    const totalOrders = filteredOrders.length;
    // const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return { filteredOrders, totalRevenue, totalOrders };
  };

  const { filteredOrders, totalRevenue, totalOrders } = calculateMetrics(
    orders || allOrders || []
  );

  const sortedRecentOrders = orders
    ? [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
    : [];

  const totalExpenses = (expense: Expense[]) => {
    if (!expense) return 0;
    // console.log(expense);
    const fileteredExpense = expense.filter((expense: Expense) => {
      const expenseDate = new Date(expense.createdAt);
      // console.log(expenseDate, date?.from, date?.to);
      // @ts-ignore
      return expenseDate >= date?.from && expenseDate <= date?.to;
    });
    const totalAllExpense = fileteredExpense.reduce(
      (sum: number, expense: Expense) => sum + expense.amount,
      0
    );
    return { totalAllExpense };
  };
  // @ts-ignore
  const { totalAllExpense } = totalExpenses(expense || []);

  // console.log(totalExpenses);

  filteredOrders?.forEach((s: Order) => (total += s.totalAmount));
  filteredOrders?.forEach((s: Order) => {
    if (s.cashType == 'EVC') evcAmout += s.totalAmount;
    if (s.cashType == 'CASH') cashAmount += s.totalAmount;
  });

  const chartData = useMemo(() => {
    if (!filteredOrders) return { barData: [], areaData: [], pieData: [] };

    const dailyTotals = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      // @ts-ignore
      acc[date] = (acc[date] || 0) + order.totalAmount;
      return acc;
    }, {});

    const barData = Object.entries(dailyTotals).map(([name, total]) => ({
      name,
      total
    }));

    const areaData = [...barData].sort(
      (a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()
    );

    const pieData = [
      { name: 'EVC', value: evcAmout },
      { name: 'CASH', value: cashAmount }
    ];

    return { barData, areaData, pieData };
  }, [filteredOrders, evcAmout, cashAmount]);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    console.log(cookies);
    e.preventDefault();
    setExpenseAmount('');
    setExpenseReason('');
    setIsExpenseDialogOpen(false);

    // const data = {
    //   data: {
    //     amount: expenseAmount,
    //     description: expenseReason
    //   },
    //   cookies: cookies
    // }
    try {
      const res = await addExpense({
        data: {
          amount: expenseAmount,
          description: expenseReason
        },
        cookies: cookies
      });
      if ('error' in res) {
        // @ts-ignore
        throw new Error(res.error);
      }

      toast.success('Expense added successfully');
      setExpenseAmount('');
      setExpenseReason('');
    } catch (error) {
      toast.error(
        // @ts-ignore
        `Error processing expense: ${error.message || 'Unknown error'}`
      );
    }

    // console.log(res);
    // console.log('Expense submitted:', { amount: expenseAmount, reason: expenseReason });
  };

  return (
    <PageContainer scrollable={true}>
      <Toaster />
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back 👋
          </h2>
          <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker date={date} setDate={setDate} />
            <Dialog
              open={isExpenseDialogOpen}
              onOpenChange={setIsExpenseDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleExpenseSubmit}
                  className="grid gap-4 py-4"
                >
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">
                      Reason
                    </Label>
                    <Textarea
                      id="reason"
                      value={expenseReason}
                      onChange={(e) => setExpenseReason(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!expenseAmount || !expenseReason}
                    className="ml-auto"
                  >
                    Submit Expense
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sold Products
                  </CardTitle>
                  <ShoppingCart size={22} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredOrders?.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {/* +20.1% from last month */}
                  </p>
                </CardContent>
              </Card>
              {userRole === 'admin' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <ShoppingCart size={22} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalRevenue}</div>
                    <p className="text-xs text-muted-foreground">
                      {/* +20.1% from last month */}
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    EVC amount
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $ {evcAmout.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {/* +180.1% from last month */}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cash amount
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $ {cashAmount.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {/* +19% from last month */}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Expenses
                  </CardTitle>
                  <Blocks size={22} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $ {totalAllExpense.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {/* You can add a comparison to previous period here */}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                {
                  // @ts-ignore
                  <BarGraph data={chartData.barData} />
                }
              </div>
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    Your last {sortedRecentOrders.length} sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales recentOrders={sortedRecentOrders} />
                </CardContent>
              </Card>
              <div className="col-span-4">
                {
                  // @ts-ignore
                  <AreaGraph data={chartData.areaData} />
                }
              </div>
              <div className="col-span-4 md:col-span-3">
                <PieGraph data={chartData.pieData} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
