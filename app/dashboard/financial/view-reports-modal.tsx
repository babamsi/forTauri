'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface ViewReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const incomeExpenseData = [
  { month: 'Jan', income: 4000, expense: 2400 },
  { month: 'Feb', income: 3000, expense: 1398 },
  { month: 'Mar', income: 2000, expense: 9800 },
  { month: 'Apr', income: 2780, expense: 3908 },
  { month: 'May', income: 1890, expense: 4800 },
  { month: 'Jun', income: 2390, expense: 3800 }
];

const spendingCategoriesData = [
  { name: 'Housing', value: 35 },
  { name: 'Food', value: 20 },
  { name: 'Transportation', value: 15 },
  { name: 'Utilities', value: 10 },
  { name: 'Entertainment', value: 10 },
  { name: 'Healthcare', value: 5 },
  { name: 'Other', value: 5 }
];

const savingsTrendData = [
  { month: 'Jan', savings: 1000 },
  { month: 'Feb', savings: 1500 },
  { month: 'Mar', savings: 2000 },
  { month: 'Apr', savings: 2200 },
  { month: 'May', savings: 2700 },
  { month: 'Jun', savings: 3000 }
];

const netWorthData = [
  { month: 'Jan', assets: 50000, liabilities: 30000 },
  { month: 'Feb', assets: 52000, liabilities: 29500 },
  { month: 'Mar', assets: 54000, liabilities: 29000 },
  { month: 'Apr', assets: 55000, liabilities: 28500 },
  { month: 'May', assets: 57000, liabilities: 28000 },
  { month: 'Jun', assets: 60000, liabilities: 27500 }
];

const investmentPerformanceData = [
  { month: 'Jan', stocks: 5000, bonds: 3000, realEstate: 2000 },
  { month: 'Feb', stocks: 5500, bonds: 3100, realEstate: 2100 },
  { month: 'Mar', stocks: 6000, bonds: 3200, realEstate: 2200 },
  { month: 'Apr', stocks: 5800, bonds: 3300, realEstate: 2300 },
  { month: 'May', stocks: 6200, bonds: 3400, realEstate: 2400 },
  { month: 'Jun', stocks: 6500, bonds: 3500, realEstate: 2500 }
];

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC0CB'
];

export default function ViewReportsModal({
  isOpen,
  onClose
}: ViewReportsModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('last-month');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Financial Reports
          </DialogTitle>
          <DialogDescription>
            Analyze your financial data with various report types.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="income-expense" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="income-expense">Income vs Expense</TabsTrigger>
            <TabsTrigger value="spending-categories">
              Spending Categories
            </TabsTrigger>
            <TabsTrigger value="savings-trend">Savings Trend</TabsTrigger>
            <TabsTrigger value="net-worth">Net Worth</TabsTrigger>
            <TabsTrigger value="investment-performance">
              Investments
            </TabsTrigger>
          </TabsList>
          <div className="py-4">
            <Label>Time Period</Label>
            <Select onValueChange={setSelectedPeriod} value={selectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TabsContent value="income-expense">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeExpenseData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                >
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#8884d8" />
                  <Bar dataKey="expense" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="spending-categories">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {spendingCategoriesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="savings-trend">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={savingsTrendData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}
                >
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="net-worth">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={netWorthData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}
                >
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="assets"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="liabilities"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="investment-performance">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={investmentPerformanceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                >
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="stocks"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="bonds" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="realEstate" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
