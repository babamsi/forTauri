'use client';

import { useState, useEffect } from 'react';
import {
  CalendarDays,
  Users,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Package2
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useGetSoldProductsQuery,
  useGetMyExpansesQuery
} from '@/store/authApi';
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
  }
};

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState('Sold Products');
  const [selectedPeriod, setSelectedPeriod] = useState('Last month');
  const [chartData, setChartData] = useState([]);
  const [cookies, setCookies] = useState(null);

  const {
    data: soldProducts,
    isLoading,
    error,
    refetch
  } = useGetSoldProductsQuery(cookies, {
    skip: !cookies,
    pollingInterval: 30000
  });

  const { data: expenses } = useGetMyExpansesQuery(cookies, { skip: !cookies });

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setCookies(k);
    });
  }, []);

  useEffect(() => {
    if (soldProducts?.soldItems) {
      const processedData = processUserData(soldProducts.soldItems);
      // @ts-ignore
      setChartData(processedData);
    }
  }, [soldProducts]);
  // @ts-ignore
  const processUserData = (soldItems) => {
    if (!soldItems) return [];
    const dailyData = {};
    // @ts-ignore
    soldItems.forEach((item) => {
      const date = new Date(item.soldAt).toISOString().split('T')[0];
      // @ts-ignore
      if (!dailyData[date]) {
        // @ts-ignore
        dailyData[date] = { date, total: 0, cash: 0, mobile: 0 };
      }
      // @ts-ignore
      dailyData[date].total += item.price;
      if (item.cashType === 'Cash') {
        // @ts-ignore
        dailyData[date].cash += item.price;
      } else if (item.cashType === 'Mobile') {
        // @ts-ignore
        dailyData[date].mobile += item.price;
      }
    });
    return Object.values(dailyData).sort(
      (a, b) =>
        // @ts-ignore
        new Date(a.date) - new Date(b.date)
    );
  };

  const getCardData = (metric: string) => {
    const totalSold =
      soldProducts?.soldItems?.reduce(
        // @ts-ignore
        (acc, item) => acc + item.quantity,
        0
      ) || 0;
    const totalSales =
      soldProducts?.soldItems?.reduce(
        // @ts-ignore
        (acc, item) => acc + item.price,
        0
      ) || 0;
    const totalExpenses =
      expenses?.reduce(
        // @ts-ignore
        (acc, item) => acc + item.amount,
        0
      ) || 0;

    switch (metric) {
      case 'Sold Products':
        return {
          icon: Package,
          value: totalSold.toString(),
          trend: '+15%',
          color: 'text-blue-400'
        };
      case 'Visitors':
        return {
          icon: Users,
          value: 'N/A',
          trend: 'N/A',
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
                  // @ts-ignore
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
                ${entry.value?.toFixed(2) || '0.00'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
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
              selectedMetric === 'Sold Products' ||
              selectedMetric === 'Expenses' ? (
                <ResponsiveContainer width="100%" height={400}>
                  {
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
                          dataKey="total"
                          stroke={
                            selectedMetric === 'Sold Products'
                              ? '#3b82f6'
                              : '#ef4444'
                          }
                          strokeWidth={2}
                        />
                      }
                    </LineChart>
                  }
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  {
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
                      }{' '}
                      {
                        // @ts-ignore
                        <Bar
                          dataKey="cash"
                          stackId="a"
                          fill={chartConfig.cash.color}
                          radius={[4, 4, 0, 0]}
                        />
                      }{' '}
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
                  }
                </ResponsiveContainer>
              )
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

        {/* Customers Widget */}
        <Card className="group relative overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle>Customers</CardTitle>
              <UserCheck className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Overview of customer metrics
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Customers</p>
                  <h3 className="text-2xl font-bold">
                    {soldProducts?.soldItems?.length || 0}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    100% from last month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">New vs Returning</p>
                  <div className="flex justify-end gap-2 text-xs">
                    <span className="rounded bg-green-500/20 px-2 py-1 text-green-500">
                      100% New
                    </span>
                    <span className="rounded bg-blue-500/20 px-2 py-1 text-blue-500">
                      0% Return
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Top Locations</p>
                <div className="space-y-2">
                  {[
                    { city: 'Somalia', percentage: 60 },
                    { city: 'Kenya', percentage: 30 },
                    { city: 'Other', percentage: 10 }
                  ].map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{location.city}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#2A2B2F]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{location.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">
                  Customer Satisfaction
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">4.8</span>
                  <div className="flex text-yellow-400">{'★'.repeat(5)}</div>
                  <span className="text-sm text-muted-foreground">
                    (10 reviews)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Expenses Widget */}
        <Card className="group relative overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle>Expenses</CardTitle>
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Monthly expense breakdown
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Total Expenses</p>
                  <span className="text-2xl font-bold">
                    $
                    {expenses
                      ?.reduce(
                        // @ts-ignore
                        (acc, item) => acc + item.amount,
                        0
                      )
                      .toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-red-500">+71% from last month</p>
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Top Categories</p>
                <div className="space-y-3">
                  {[
                    {
                      category: 'Food',
                      percentage: 58,
                      color: 'from-blue-500 to-indigo-500'
                    },
                    {
                      category: 'Transportation',
                      percentage: 18,
                      color: 'from-green-500 to-emerald-500'
                    },
                    {
                      category: 'Miscellaneous',
                      percentage: 24,
                      color: 'from-yellow-500 to-orange-500'
                    }
                  ].map((expense, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{expense.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#2A2B2F]">
                          <div
                            className={`h-full bg-gradient-to-r ${expense.color} rounded-full transition-all duration-500`}
                            style={{ width: `${expense.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{expense.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-[#2A2B2F] p-3">
                <p className="mb-3 text-sm font-medium">Cash Flow</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Incoming</p>
                    <p className="text-sm font-medium text-green-500">
                      +$
                      {soldProducts?.soldItems
                        ?.reduce(
                          // @ts-ignore
                          (acc, item) => acc + item.price,
                          0
                        )
                        .toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outgoing</p>
                    <p className="text-sm font-medium text-red-500">
                      -$
                      {expenses
                        ?.reduce(
                          // @ts-ignore
                          (acc, item) => acc + item.amount,
                          0
                        )
                        .toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net</p>
                    <p className="text-sm font-medium text-blue-500">
                      +$
                      {(
                        (soldProducts?.soldItems?.reduce(
                          // @ts-ignore
                          (acc, item) => acc + item.price,
                          0
                        ) || 0) -
                        (expenses?.reduce(
                          // @ts-ignore
                          (acc, item) => acc + item.amount,
                          0
                        ) || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Widget */}
        <Card className="group relative overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Package className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Product performance metrics
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-[#2A2B2F] to-[#1F2023] p-4">
                  <p className="text-xs text-muted-foreground">
                    Active Products
                  </p>
                  <p className="text-xl font-bold">1</p>
                  <p className="flex items-center gap-1 text-xs text-green-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                    100% in stock
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-[#2A2B2F] to-[#1F2023] p-4">
                  <p className="text-xs text-muted-foreground">Return Rate</p>
                  <p className="text-xl font-bold">0%</p>
                  <p className="flex items-center gap-1 text-xs text-green-500">
                    <TrendingDown className="h-3 w-3" />
                    0% vs last month
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Top Selling Products</p>
                <div className="space-y-3">
                  {soldProducts?.soldItems?.slice(0, 3).map(
                    // @ts-ignore
                    (product, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#2A2B2F]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2A2B2F] to-[#1F2023]">
                          <span className="text-xs font-medium">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity} units sold
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Widget */}
        <Card className="group relative overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle>Users</CardTitle>
              <Users className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Staff and admin activity
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Users</p>
                  <h3 className="text-2xl font-bold">1</h3>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                    <p className="text-xs text-green-500">1 online now</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">New Users</p>
                  <h3 className="text-2xl font-bold">+0</h3>
                  <p className="text-xs text-muted-foreground">this week</p>
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Recent Activity</p>
                <div className="space-y-3">
                  {[
                    {
                      name: 'testwae',
                      action: 'Added new product',
                      time: '2h ago'
                    },
                    {
                      name: 'testwae',
                      action: 'Processed order',
                      time: '4h ago'
                    },
                    {
                      name: 'testwae',
                      action: 'Updated inventory',
                      time: '1d ago'
                    }
                  ].map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#2A2B2F]"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-[#2A2B2F] ring-offset-2 ring-offset-[#1C1D21]">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.action}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
