'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Users,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip
} from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useGetMyExpansesQuery, useGetOrdersQuery } from '@/store/authApi';
import { getAuthCookie, deleteAuthCookie } from '@/actions/auth.actions';

const chartConfig = {
  cash: {
    label: 'Cash',
    color: 'hsl(var(--chart-1))'
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))'
  },
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-3))'
  },
  guests: {
    label: 'Guests',
    color: 'hsl(var(--chart-4))'
  },
  customers: {
    label: 'Customers',
    color: 'hsl(var(--chart-5))'
  }
};

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState('Sold Products');
  const [selectedPeriod, setSelectedPeriod] = useState('Last month');
  const [cookies, setCookies] = useState(null);

  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useGetOrdersQuery(cookies, {
    skip: !cookies,
    pollingInterval: 30000
  });

  const { data: expenses } = useGetMyExpansesQuery(cookies, { skip: !cookies });

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setCookies(k);
    });
  }, []);

  const processUserData =
    // @ts-ignore
    (orders, period) => {
      if (!orders) return [];
      const now = new Date();
      const dailyData = {};

      orders.forEach(
        // @ts-ignore
        (order) => {
          const orderDate = new Date(order.updatedAt);

          if (
            (period === 'Today' &&
              orderDate.toDateString() === now.toDateString()) ||
            (period === 'Yesterday' &&
              orderDate.toDateString() ===
                new Date(now.setDate(now.getDate() - 1)).toDateString()) ||
            (period === 'Last 7 days' &&
              orderDate >= new Date(now.setDate(now.getDate() - 7))) ||
            (period === 'Last 14 days' &&
              orderDate >= new Date(now.setDate(now.getDate() - 14))) ||
            (period === 'Last month' &&
              orderDate >= new Date(now.setMonth(now.getMonth() - 1)))
          ) {
            const date = orderDate.toISOString().split('T')[0];
            // @ts-ignore
            if (!dailyData[date]) {
              // @ts-ignore
              dailyData[date] = {
                date,
                total: 0,
                cash: 0,
                mobile: 0,
                soldProducts: 0,
                guests: 0,
                customers: 0
              };
            }
            // @ts-ignore
            dailyData[date].total += order.totalAmount;
            // @ts-ignore
            dailyData[date].soldProducts += order.products.length;

            // Count guests and customers separately
            if (order.user.name === 'Guest') {
              // @ts-ignore
              dailyData[date].guests += 1;
            } else {
              // @ts-ignore
              dailyData[date].customers += 1;
            }

            if (order.cashType === 'Cash') {
              // @ts-ignore
              dailyData[date].cash += order.totalAmount;
            } else if (order.cashType === 'Mobile') {
              // @ts-ignore
              dailyData[date].mobile += order.totalAmount;
            }
          }
        }
      );

      return Object.values(dailyData).sort(
        (a, b) =>
          // @ts-ignore
          new Date(a.date) - new Date(b.date)
      );
    };

  const chartData = useMemo(() => {
    return processUserData(orders, selectedPeriod);
  }, [orders, selectedPeriod]);

  const getCardData = (metric: string) => {
    const filteredOrders = orders?.filter(
      // @ts-ignore
      (order) => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        switch (selectedPeriod) {
          case 'Today':
            return orderDate.toDateString() === now.toDateString();
          case 'Yesterday':
            return (
              orderDate.toDateString() ===
              new Date(now.setDate(now.getDate() - 1)).toDateString()
            );
          case 'Last 7 days':
            return orderDate >= new Date(now.setDate(now.getDate() - 7));
          case 'Last 14 days':
            return orderDate >= new Date(now.setDate(now.getDate() - 14));
          case 'Last month':
            return orderDate >= new Date(now.setMonth(now.getMonth() - 1));
          default:
            return true;
        }
      }
    );

    const filteredExpenses = expenses?.filter(
      // @ts-ignore
      (item) => {
        const itemDate = new Date(item.date);
        const now = new Date();
        switch (selectedPeriod) {
          case 'Today':
            return itemDate.toDateString() === now.toDateString();
          case 'Yesterday':
            return (
              itemDate.toDateString() ===
              new Date(now.setDate(now.getDate() - 1)).toDateString()
            );
          case 'Last 7 days':
            return itemDate >= new Date(now.setDate(now.getDate() - 7));
          case 'Last 14 days':
            return itemDate >= new Date(now.setDate(now.getDate() - 14));
          case 'Last month':
            return itemDate >= new Date(now.setMonth(now.getMonth() - 1));
          default:
            return true;
        }
      }
    );

    const totalSoldProducts =
      filteredOrders?.reduce(
        // @ts-ignore
        (acc, order) => acc + order.products.length,
        0
      ) || 0;
    const totalSales =
      filteredOrders?.reduce(
        // @ts-ignore
        (acc, order) => acc + order.totalAmount,
        0
      ) || 0;
    const totalExpenses =
      filteredExpenses?.reduce(
        // @ts-ignore
        (acc, item) => acc + item.amount,
        0
      ) || 0;
    const totalVisitors = filteredOrders?.length || 0;

    const guestVisitors =
      filteredOrders?.filter(
        // @ts-ignore
        (order) => order.user.name === 'Guest'
      ).length || 0;
    const customerVisitors = totalVisitors - guestVisitors;

    switch (metric) {
      case 'Sold Products':
        return {
          icon: Package,
          value: totalSoldProducts.toString(),
          trend: '+15%',
          color: 'text-blue-400'
        };
      case 'Visitors':
        return {
          icon: Users,
          value: `${Number(customerVisitors) + Number(guestVisitors)}`,
          trend: '11%',
          color: 'text-green-400'
        };
      case 'Sales':
        return {
          icon: CreditCard,
          value: `$${totalSales.toFixed(2)}`,
          trend: '+12%',
          color: 'text-purple-400'
        };
      case 'Expenses':
        return {
          icon: DollarSign,
          value: `$${totalExpenses.toFixed(2)}`,
          trend: '+8%',
          color: 'text-orange-400'
        };
      default:
        return {
          icon: Package,
          value: '0',
          trend: '0%',
          color: 'text-gray-400'
        };
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-[#2A2B2F] bg-[#1C1D21] p-2 shadow-lg">
          <p className="mb-1 text-sm font-semibold text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center">
                <div
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      // @ts-ignore
                      chartConfig[entry.dataKey]?.color || entry.color
                  }}
                />
                <span className="text-gray-300">
                  {
                    // @ts-ignore
                    chartConfig[entry.dataKey]?.label || entry.name
                  }
                  :
                </span>
              </div>
              <span className="ml-2 font-medium text-white">
                {['guests', 'customers'].includes(entry.dataKey)
                  ? entry.value
                  : `$${entry.value?.toFixed(2) || '0.00'}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  // @ts-ignore
  if (error?.data?.message === 'Token expired') {
    deleteAuthCookie();
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6 bg-[#0A0B0F] p-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px] border-[#2A2B2F] bg-[#1C1D21] text-white">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="border-[#2A2B2F] bg-[#1C1D21] text-white">
            <SelectItem value="Today">Today</SelectItem>
            <SelectItem value="Yesterday">Yesterday</SelectItem>
            <SelectItem value="Last 7 days">Last 7 days</SelectItem>
            <SelectItem value="Last 14 days">Last 14 days</SelectItem>
            <SelectItem value="Last month">Last month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {['Sold Products', 'Visitors', 'Sales', 'Expenses'].map((metric) => {
          const { icon: Icon, value, trend, color } = getCardData(metric);
          return (
            <Card
              key={metric}
              className="group relative overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-green-500">
                    {trend} from last period
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Overview</CardTitle>
            <CardDescription>Sales Data</CardDescription>
          </div>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[180px] border-[#3A3B3F] bg-[#2A2B2F] text-white">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent className="border-[#3A3B3F] bg-[#2A2B2F] text-white">
              <SelectItem value="Sold Products">Sold Products</SelectItem>
              <SelectItem value="Visitors">Visitors</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Expenses">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div>Loading chart data...</div>
          ) : error ? (
            <div>
              Error loading chart data:{' '}
              {
                // @ts-ignore
                error.message
              }
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              {selectedMetric === 'Visitors' ? (
                // @ts-ignore
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2F" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  {
                    // @ts-ignore
                    <Tooltip content={<CustomTooltip />} />
                  }
                  {
                    // @ts-ignore
                    <Line
                      type="monotone"
                      dataKey="guests"
                      stroke={chartConfig.guests.color}
                      strokeWidth={2}
                    />
                  }
                  {
                    // @ts-ignore
                    <Line
                      type="monotone"
                      dataKey="customers"
                      stroke={chartConfig.customers.color}
                      strokeWidth={2}
                    />
                  }
                </LineChart>
              ) : selectedMetric === 'Sold Products' ||
                selectedMetric === 'Expenses' ? (
                // @ts-ignore
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2F" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  {
                    // @ts-ignore
                    <Tooltip content={<CustomTooltip />} />
                  }
                  {
                    // @ts-ignore
                    <Line
                      type="monotone"
                      dataKey={
                        selectedMetric === 'Sold Products'
                          ? 'soldProducts'
                          : 'total'
                      }
                      stroke={
                        selectedMetric === 'Sold Products'
                          ? '#3b82f6'
                          : '#ef4444'
                      }
                      strokeWidth={2}
                    />
                  }
                </LineChart>
              ) : (
                // @ts-ignore
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2F" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  {
                    // @ts-ignore
                    <Tooltip content={<CustomTooltip />} />
                  }
                  {
                    // @ts-ignore
                    <Bar
                      dataKey="cash"
                      stackId="a"
                      fill={chartConfig.cash.color}
                      radius={[4, 4, 0, 0]}
                    />
                  }
                  {
                    // @ts-ignore
                    <Bar
                      dataKey="mobile"
                      stackId="a"
                      fill={chartConfig.mobile.color}
                      radius={[4, 4, 0, 0]}
                    />
                  }
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div>No data available for the selected period</div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Trending {selectedMetric === 'Expenses' ? 'down' : 'up'} by 5.2%
            this month
            {selectedMetric === 'Expenses' ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total {selectedMetric.toLowerCase()} over time
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
