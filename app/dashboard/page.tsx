'use client';

import {
  CalendarDays,
  Download,
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  UserCheck,
  Home,
  Frame,
  GitBranch,
  Github,
  LayoutPanelLeft,
  MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Simulated data based on the provided JSON
const totalRevenue = 3334.4125; // Sum of all order totals
const totalSubscriptions = 10; // Count of unique customers
const totalSales = 15; // Count of orders
const activeNow = 573; // Placeholder, as we don't have real-time data

// Calculate monthly revenue from orders
const monthlyRevenue = {
  Oct: 0,
  Nov: 0
};

const orders = [
  {
    _id: { $oid: '6721324e3f4e14fe8d2119ee' },
    totalAmount: 210,
    createdAt: { $date: '2024-10-29T19:06:54.570Z' }
  },
  {
    _id: { $oid: '6721348b3f4e14fe8d2121c2' },
    totalAmount: 42,
    createdAt: { $date: '2024-10-29T19:16:27.937Z' }
  },
  {
    _id: { $oid: '67213a7a3f4e14fe8d212879' },
    totalAmount: 42,
    createdAt: { $date: '2024-10-29T19:41:46.783Z' }
  },
  {
    _id: { $oid: '67213e3f3f4e14fe8d212bdb' },
    totalAmount: 21,
    createdAt: { $date: '2024-10-29T19:57:51.728Z' }
  },
  {
    _id: { $oid: '672235f43847876d9811066f' },
    totalAmount: 42,
    createdAt: { $date: '2024-10-30T13:34:44.085Z' }
  },
  {
    _id: { $oid: '6723534e95c93a4c7419aec3' },
    totalAmount: 0,
    createdAt: { $date: '2024-10-31T09:52:14.750Z' }
  },
  {
    _id: { $oid: '672353dc95c93a4c7419c7db' },
    totalAmount: 0,
    createdAt: { $date: '2024-10-31T09:54:36.150Z' }
  },
  {
    _id: { $oid: '6723544695c93a4c7419d35b' },
    totalAmount: 100.002,
    createdAt: { $date: '2024-10-31T09:56:22.653Z' }
  },
  {
    _id: { $oid: '67235c0d95c93a4c741a0cbc' },
    totalAmount: 21,
    createdAt: { $date: '2024-10-31T10:29:33.197Z' }
  },
  {
    _id: { $oid: '67235cb595c93a4c741a103c' },
    totalAmount: 21,
    createdAt: { $date: '2024-10-31T10:32:21.937Z' }
  },
  {
    _id: { $oid: '67235ed595c93a4c741a1bd4' },
    totalAmount: 21,
    createdAt: { $date: '2024-10-31T10:41:25.036Z' }
  },
  {
    _id: { $oid: '67235f4a95c93a4c741a23fe' },
    totalAmount: 42,
    createdAt: { $date: '2024-10-31T10:43:22.906Z' }
  },
  {
    _id: { $oid: '672360c495c93a4c741a2d58' },
    totalAmount: 21,
    createdAt: { $date: '2024-10-31T10:49:40.171Z' }
  },
  {
    _id: { $oid: '672361d095c93a4c741a3466' },
    totalAmount: 10.5,
    createdAt: { $date: '2024-10-31T10:54:08.603Z' }
  },
  {
    _id: { $oid: '672362a995c93a4c741a531a' },
    totalAmount: 7.350000000000001,
    createdAt: { $date: '2024-10-31T10:57:45.300Z' }
  },
  {
    _id: { $oid: '672377d095c93a4c741c0061' },
    totalAmount: 100.002,
    createdAt: { $date: '2024-10-31T12:28:00.892Z' }
  }
];

orders.forEach((order) => {
  const date = new Date(order.createdAt.$date);
  const month = date.toLocaleString('default', { month: 'short' });
  monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount;
});

const chartData = Object.entries(monthlyRevenue).map(([month, value]) => ({
  month,
  value: Math.round(value)
}));

// Recent sales data from customers
const recentSales = [
  {
    name: 'ABDIRAHMAN ALI WARSAME',
    email: 'upeaple@gmail.com',
    amount: '+$334.41'
  },
  {
    name: 'ABDIJABAR',
    email: 'oniwnor@gmail.com',
    amount: '+$620.00'
  },
  {
    name: 'iBi',
    email: 'iamibi@gmail.com',
    amount: '+$39.74'
  },
  {
    name: 'abdale',
    email: 'wiilhoog24@gmail.com',
    amount: '+$34.91'
  },
  {
    name: 'suheyb',
    email: 'sabkacade40@gmail.com',
    amount: '+$2877.00'
  }
];

export default function Component() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#0A0B0F] text-white">
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="border-[#2A2B2F] bg-[#1C1D21] text-white"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Oct 17, 2024 - Nov 6, 2024
          </Button>
          <Button
            variant="outline"
            className="bg-white text-black hover:bg-gray-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
        <TabsList className="bg-[#1C1D21]">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#2A2B2F]"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-[#2A2B2F]"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-[#2A2B2F]"
          >
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-[#2A2B2F]"
          >
            Notifications
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex h-full flex-col gap-4 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group relative overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $ {totalRevenue.toFixed(2)}
              </div>
              {/* <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-xs text-green-500">+20.1% from last month</p>
              </div> */}
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalSubscriptions}</div>
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-xs text-green-500">
                  +180.1% from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalSales}</div>
              <div className="mt-1 flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <p className="text-xs text-red-500">-5% from last month</p>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] border-[#2A2B2F] hover:border-[#3A3B3F] transition-all duration-300 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{activeNow}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-xs text-green-500">+201 from last month</p>
              </div>
            </CardContent>
          </Card> */}
        </div>

        <Card className="border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F]">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis
                  dataKey="month"
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
                <Bar
                  dataKey="value"
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgb(99, 102, 241)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor="rgb(99, 102, 241)"
                      stopOpacity={0.2}
                    />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="relative">
          <ScrollArea className="w-full whitespace-nowrap rounded-lg border-[#2A2B2F] md:pb-4">
            <div className="flex w-max space-x-4 p-4 md:w-full md:flex-nowrap">
              {/* Customers Widget */}
              <Card
                className="group relative 
              w-[300px] shrink-0 overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F] md:w-[400px]"
              >
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
                          {totalSubscriptions}
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
                              <span className="text-sm">
                                {location.percentage}%
                              </span>
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
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          (10 reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expenses Widget */}
              <Card className="group relative w-[300px] shrink-0 overflow-hidden border-[#2A2B2F] bg-gradient-to-br  from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F] md:w-[400px]">
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
                        <span className="text-2xl font-bold">$171.00</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-red-500" />
                        <p className="text-xs text-red-500">
                          +71% from last month
                        </p>
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
                              <span className="text-sm">
                                {expense.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#2A2B2F] p-3">
                      <p className="mb-3 text-sm font-medium">Cash Flow</p>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Incoming
                          </p>
                          <p className="text-sm font-medium text-green-500">
                            +$3,334.41
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Outgoing
                          </p>
                          <p className="text-sm font-medium text-red-500">
                            -$171.00
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Net</p>
                          <p className="text-sm font-medium text-blue-500">
                            +$3,163.41
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Widget */}
              <Card className="group relative w-[300px] shrink-0 overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F] md:w-[400px]">
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
                        <p className="text-xs text-muted-foreground">
                          Return Rate
                        </p>
                        <p className="text-xl font-bold">0%</p>
                        <p className="flex items-center gap-1 text-xs text-green-500">
                          <TrendingDown className="h-3 w-3" />
                          0% vs last month
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-medium">
                        Top Selling Products
                      </p>
                      <div className="space-y-3">
                        {[
                          {
                            rank: '01',
                            name: 'Monster Drink 100ml',
                            units: '25',
                            revenue: '$500'
                          }
                        ].map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#2A2B2F]"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2A2B2F] to-[#1F2023]">
                              <span className="text-xs font-medium">
                                {product.rank}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.units} units sold
                              </p>
                            </div>
                            <p className="text-sm font-medium">
                              {product.revenue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Widget */}
              <Card className="group relative w-[300px] shrink-0 overflow-hidden border-[#2A2B2F] bg-gradient-to-br from-[#1C1D21] to-[#1A1B1F] text-white transition-all duration-300 hover:border-[#3A3B3F] md:w-[400px]">
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
                        <p className="text-xs text-muted-foreground">
                          this week
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-medium">
                        Recent Activity
                      </p>
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
            <ScrollBar orientation="horizontal" className="hidden md:block" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
