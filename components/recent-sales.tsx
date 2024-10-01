import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DollarSignIcon,
  CheckCircleIcon
} from 'lucide-react';

interface Sale {
  id: string;
  customer: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const sales: Sale[] = [
  {
    id: '1',
    customer: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatarUrl: '/placeholder.svg?height=32&width=32'
    },
    amount: 150,
    date: '2023-09-28',
    status: 'completed'
  },
  {
    id: '2',
    customer: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      avatarUrl: '/placeholder.svg?height=32&width=32'
    },
    amount: 250,
    date: '2023-09-27',
    status: 'pending'
  },
  {
    id: '3',
    customer: {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      avatarUrl: '/placeholder.svg?height=32&width=32'
    },
    amount: 100,
    date: '2023-09-26',
    status: 'completed'
  },
  {
    id: '4',
    customer: {
      name: 'Diana Prince',
      email: 'diana@example.com',
      avatarUrl: '/placeholder.svg?height=32&width=32'
    },
    amount: 300,
    date: '2023-09-25',
    status: 'failed'
  },
  {
    id: '5',
    customer: {
      name: 'Ethan Hunt',
      email: 'ethan@example.com',
      avatarUrl: '/placeholder.svg?height=32&width=32'
    },
    amount: 200,
    date: '2023-09-24',
    status: 'completed'
  }
];

export function RecentSales() {
  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const completedSales = sales.filter(
    (sale) => sale.status === 'completed'
  ).length;

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="border-b bg-muted/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Recent Sales</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            Last 5 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            <div className="flex items-center space-x-2">
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalSales.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">+12.5%</span>
            </div>
          </div> */}
          {/* <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Completed Sales</p>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{completedSales}/{sales.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">{((completedSales / sales.length) * 100).toFixed(0)}% success rate</p>
          </div> */}
        </div>
        <ScrollArea className="mt-6 h-[300px] pr-4">
          <div className="space-y-6">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarImage
                    src={sale.customer.avatarUrl}
                    alt={sale.customer.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {sale.customer.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {sale.customer.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.customer.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{sale.date}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-sm font-medium">
                    ${sale.amount.toFixed(2)}
                  </span>
                  <Badge
                    variant={
                      sale.status === 'completed'
                        ? 'default'
                        : sale.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="px-2 py-0.5 text-[10px]"
                  >
                    {sale.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
