import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Product {
  product: string;
  quantity: string;
  price: string;
  subtotal: string;
}

interface RecentSale {
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
}

export function RecentSales({ recentOrders }: { recentOrders: RecentSale[] }) {
  return (
    <div className="space-y-8">
      {recentOrders.map((order) => (
        <div key={order._id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>{order.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {order.user.name}
            </p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
          </div>
          <div className="ml-auto font-medium">
            ${parseFloat(order.revenue).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
