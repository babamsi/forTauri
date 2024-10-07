'use client';

import { AreaGraph } from '@/components/charts/area-graph';
import { BarGraph } from '@/components/charts/bar-graph';
import { PieGraph } from '@/components/charts/pie-graph';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import PageContainer from '@/components/layout/page-container';
import { RecentSales } from '@/components/recent-sales';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { useAddExpensesMutation, useGetOrdersQuery } from '@/store/authApi';
import { useEffect, useState } from 'react';
import { getAuthCookie } from '@/actions/auth.actions';
import { ShoppingCart, PlusIcon } from 'lucide-react';
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
import { toast } from '@/components/ui/use-toast';

interface Product {
  product: string;
  quantity: string;
  price: string;
  subtotal: string;
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

  const { data: orders, error, isLoading } = useGetOrdersQuery(cookies);
  const [addExpense, { error: addExpenseError }] = useAddExpensesMutation();

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k); //setting the token so the server can verify and give us output
    });
  }, []);

  let total = 0;
  let evcAmout = 0;
  let cashAmount = 0;

  const calculateMetrics = (orders: Order[]) => {
    if (!orders || !date?.from || !date?.to)
      return { totalSales: 0, totalOrders: 0, averageOrderValue: 0 };
    // console.log(date?.from, date?.to, new Date(order.createdAt));
    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      // console.log(orderDate, date?.from, date?.to);
      // @ts-ignore
      return orderDate >= date?.from && orderDate <= date?.to;
    });
    // console.log(filteredOrders);
    // const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalAmount);
    const totalOrders = filteredOrders.length;
    // const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return { filteredOrders };
  };

  const { filteredOrders } = calculateMetrics(orders || []);

  const sortedRecentOrders = orders
    ? [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
    : [];

  // console.log(filteredOrders?.length);
  // filteredOrders?.reduce(
  //   (sum, order) => {
  //   console.log(order.totalAmount + sum);
  // })

  // setData(products)
  filteredOrders?.forEach((s: Order) => (total += s.totalAmount));
  filteredOrders?.forEach((s: Order) => {
    if (s.cashType == 'EVC') evcAmout += s.totalAmount;
    if (s.cashType == 'CASH') cashAmount += s.totalAmount;
  });
  // products?.soldItems.forEach((s: SoldProducts) => {
  //   if (s.cashType == 'EVC') evcAmout += s.price;
  // });
  // products?.soldItems.forEach((s: SoldProducts) => {
  //   if (s.cashType == 'CASH') cashAmount += s.price;
  // });
  // const calculateAmountEvc = stuffProductStore(
  //   (state) => state.calculateAmountByEVC
  // );
  // const getSoldProudcts = stuffProductStore(
  //   (state) => state.calculateSoldProducts
  // );
  // const getRevenue = stuffProductStore((state) => state.calculateRevenue);
  // const getAmountInCash = stuffProductStore(
  //   (state) => state.calculateAmountByCash
  // );

  // console.log(total)

  // const soldProducts = stuffProductStore((state) => state.soldProducts);
  // const productsRevenue = stuffProductStore((state) => state.revenue);
  // const amountInEvc = stuffProductStore((state) => state.amountInEVC);
  // const amountInCash = stuffProductStore((state) => state.amountInCash);

  // getSoldProudcts(products);
  // getRevenue(total);
  // calculateAmountEvc(evcAmout);
  // getAmountInCash(cashAmount);

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

    const res = await addExpense({
      data: {
        amount: expenseAmount,
        description: expenseReason
      },
      cookies: cookies
    });

    console.log(res);
    // console.log('Expense submitted:', { amount: expenseAmount, reason: expenseReason });
  };

  return (
    <PageContainer scrollable={true}>
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
                    Active Now
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
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <BarGraph />
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
                <AreaGraph />
              </div>
              <div className="col-span-4 md:col-span-3">
                <PieGraph />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
