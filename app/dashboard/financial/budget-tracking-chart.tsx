'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

const spendingData: SpendingCategory[] = [
  { name: 'Equipment', amount: 3500, color: '#3B82F6', percentage: 35 },
  { name: 'Rent', amount: 2400, color: '#10B981', percentage: 24 },
  { name: 'Travel', amount: 2200, color: '#F59E0B', percentage: 22 },
  { name: 'Salary', amount: 2000, color: '#EF4444', percentage: 20 },
  { name: 'Furniture', amount: 1500, color: '#8B5CF6', percentage: 15 },
  { name: 'Software', amount: 400, color: '#EC4899', percentage: 4 },
  { name: 'Transfer', amount: 500, color: '#14B8A6', percentage: 5 },
  { name: 'Meals', amount: 400, color: '#6366F1', percentage: 4 },
  { name: 'Other', amount: 200, color: '#9CA3AF', percentage: 2 }
];

export function BudgetTrackingChart() {
  const [period, setPeriod] = React.useState('this-month');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select defaultValue={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This month</SelectItem>
            <SelectItem value="last-month">Last month</SelectItem>
            <SelectItem value="last-3-months">Last 3 months</SelectItem>
            <SelectItem value="last-6-months">Last 6 months</SelectItem>
            <SelectItem value="this-year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        {spendingData.map((category) => (
          <div key={category.name} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="flex-grow text-sm font-medium">
              {category.name}
            </span>
            <span className="text-sm text-muted-foreground">
              ${category.amount}
            </span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color
                }}
              />
            </div>
            <span className="w-9 text-right text-sm text-muted-foreground">
              {category.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
