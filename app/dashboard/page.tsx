'use client';

import { AreaGraph } from '@/components/charts/area-graph';
import { BarGraph } from '@/components/charts/bar-graph';
import { PieGraph } from '@/components/charts/pie-graph';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import PageContainer from '@/components/layout/page-container';
import { RecentSales } from '@/components/recent-sales';
import { Button } from '@/components/ui/button';

import { useGetSoldProductsQuery } from '@/store/authApi';
import { useEffect, useState } from 'react';
import { stuffProductStore } from '@/components/hooks/stuffProducts';
import { getAuthCookie } from '@/actions/auth.actions';
import { ShoppingCart } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SoldProducts {
  id: string;
  quantity: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  product: string;
  cashType: 'CASH' | 'EVC';
  price: number;
  revenue: number;
  isQuantityBased: boolean;
}

export default function Page() {
  const [cookies, setcookies] = useState(null);
  const {
    data: products,
    error,
    isLoading,
    isFetching,
    isError
  } = useGetSoldProductsQuery(cookies);
  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k); //setting the token so the server can verify and give us output
    });
  }, []);

  let total = 0;
  let evcAmout = 0;
  let cashAmount = 0;
  // setData(products)
  products?.soldItems.forEach((s: SoldProducts) => (total += s.revenue));
  products?.soldItems.forEach((s: SoldProducts) => {
    if (s.cashType == 'EVC') evcAmout += s.price;
  });
  products?.soldItems.forEach((s: SoldProducts) => {
    if (s.cashType == 'CASH') cashAmount += s.price;
  });
  const calculateAmountEvc = stuffProductStore(
    (state) => state.calculateAmountByEVC
  );
  const getSoldProudcts = stuffProductStore(
    (state) => state.calculateSoldProducts
  );
  const getRevenue = stuffProductStore((state) => state.calculateRevenue);
  const getAmountInCash = stuffProductStore(
    (state) => state.calculateAmountByCash
  );

  const soldProducts = stuffProductStore((state) => state.soldProducts);
  const productsRevenue = stuffProductStore((state) => state.revenue);
  const amountInEvc = stuffProductStore((state) => state.amountInEVC);
  const amountInCash = stuffProductStore((state) => state.amountInCash);

  getSoldProudcts(products);
  getRevenue(total);
  calculateAmountEvc(evcAmout);
  getAmountInCash(cashAmount);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back 👋
          </h2>
          <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker />
            <Button>Download</Button>
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
                    {soldProducts?.soldItems?.length}
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
                  <div className="text-2xl font-bold">$ {amountInEvc}</div>
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
                  <div className="text-2xl font-bold">$ {amountInCash}</div>
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
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
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
