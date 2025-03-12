'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
  Clock,
  AlertCircle,
  AlertTriangle,
  CalendarIcon,
  Moon,
  Sun,
  UserPlus,
  Truck,
  Package,
  ShoppingBag,
  Clipboard,
  ArrowRight,
  FileText,
  Package2,
  History,
  CreditCard,
  Banknote,
  MapPin,
  Store,
  Info,
  ThumbsUp,
  Send,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

// Types
type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Quoted'
  | 'Approved'
  | 'Rejected'
  | 'Quotation Sent';
type OrderType = 'Regular' | 'Special';
type DeliveryOption = 'Home Delivery' | 'Store Pickup';
type PaymentMethod = 'Credit Card' | 'EVC' | 'Cash on Delivery';
type StaffRole = 'Manager' | 'Supervisor' | 'Seller' | 'Helper' | 'Delivery';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  customerName: string;
  type: OrderType;
  status: OrderStatus;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  assignedTo: string | null;
  items: OrderItem[];
  specialInstructions?: string;
  history: { status: OrderStatus; timestamp: Date; note: string }[];
  deliveryOption: DeliveryOption;
  address?: string;
  storeLocation?: string;
  paymentMethod: PaymentMethod;
  depositPaid?: boolean;
  total: number;
  discount?: number;
  tip?: number;
  specialOrderItems?: OrderItem[];
  specialOrderStatus?: 'Pending' | 'Quoted' | 'Approved' | 'Rejected';
  quotation?: { items: OrderItem[]; total: number };
  stepAssignments: {
    [key in OrderStatus]?: string;
  };
};

type Staff = {
  id: string;
  name: string;
  role: StaffRole;
};

type SortConfig = {
  key: keyof Order;
  direction: 'ascending' | 'descending';
};

// Mock data generator
const generateMockOrders = (count: number): Order[] => {
  const statuses: OrderStatus[] = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Quoted',
    'Approved',
    'Rejected',
    'Quotation Sent'
  ];
  const types: OrderType[] = ['Regular', 'Special'];
  const priorities: Order['priority'][] = ['Low', 'Medium', 'High'];
  const deliveryOptions: DeliveryOption[] = ['Home Delivery', 'Store Pickup'];
  const paymentMethods: PaymentMethod[] = [
    'Credit Card',
    'EVC',
    'Cash on Delivery'
  ];
  //@ts-ignore
  return Array.from({ length: count }, (_, i) => ({
    id: `ORD-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`,
    customerName: `Customer ${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
    assignedTo:
      Math.random() > 0.5
        ? `STAFF-${(Math.floor(Math.random() * 5) + 1)
            .toString()
            .padStart(3, '0')}`
        : null,
    items: [
      {
        name: 'Product A',
        quantity: Math.floor(Math.random() * 5) + 1,
        price: 19.99
      },
      {
        name: 'Product B',
        quantity: Math.floor(Math.random() * 3) + 1,
        price: 29.99
      }
    ],
    specialInstructions: Math.random() > 0.7 ? 'Handle with care' : undefined,
    history: [
      {
        status: 'Pending',
        timestamp: new Date(
          Date.now() - Math.floor(Math.random() * 1000000000)
        ),
        note: 'Order placed'
      }
    ],
    deliveryOption:
      deliveryOptions[Math.floor(Math.random() * deliveryOptions.length)],
    address: Math.random() > 0.5 ? '123 Main St, City, Country' : undefined,
    storeLocation: Math.random() > 0.5 ? 'Store Location A' : undefined,
    paymentMethod:
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    depositPaid: Math.random() > 0.5,
    total: Math.floor(Math.random() * 1000) + 50,
    discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : undefined,
    tip: Math.random() > 0.6 ? Math.floor(Math.random() * 10) + 1 : undefined,
    specialOrderItems:
      Math.random() > 0.5
        ? [
            { name: 'Special Item 1', quantity: 2, price: 0 },
            { name: 'Special Item 2', quantity: 1, price: 0 }
          ]
        : undefined,
    specialOrderStatus:
      Math.random() > 0.8
        ? ['Pending', 'Quoted', 'Approved', 'Rejected'][
            Math.floor(Math.random() * 4)
          ]
        : undefined,
    stepAssignments: {
      Pending: Math.random() > 0.5 ? 'STAFF-001' : 'STAFF-002' // Manager for Special, Supervisor for Regular
    }
  }));
};

const generateMockStaff = (): Staff[] => [
  { id: 'STAFF-001', name: 'Muna', role: 'Manager' },
  { id: 'STAFF-002', name: 'James', role: 'Supervisor' },
  { id: 'STAFF-003', name: 'Ahmed', role: 'Seller' },
  { id: 'STAFF-004', name: 'Hirsi', role: 'Helper' },
  { id: 'STAFF-005', name: 'Adam', role: 'Delivery' }
];

// Utility functions
const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.filter(String).map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const formatDate = (date: Date) => {
  return format(date, 'MMMM d, yyyy HH:mm');
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  Pending: <Clock className="h-4 w-4 text-blue-500" />,
  Processing: <Package className="h-4 w-4 text-yellow-500" />,
  Shipped: <Truck className="h-4 w-4 text-purple-500" />,
  Delivered: <Check className="h-4 w-4 text-green-500" />,
  Cancelled: <X className="h-4 w-4 text-red-500" />,
  Quoted: <Clipboard className="h-4 w-4 text-orange-500" />,
  Approved: <ThumbsUp className="h-4 w-4 text-green-500" />,
  Rejected: <X className="h-4 w-4 text-red-500" />,
  'Quotation Sent': <Send className="h-4 w-4 text-blue-500" />
};

const priorityIcons: Record<Order['priority'], React.ReactNode> = {
  Low: <AlertCircle className="h-4 w-4 text-blue-500" />,
  Medium: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  High: <AlertTriangle className="h-4 w-4 text-red-500" />
};

const getNextStatuses = (
  currentStatus: OrderStatus,
  orderType: OrderType
): OrderStatus[] => {
  switch (currentStatus) {
    case 'Pending':
      return orderType === 'Special'
        ? ['Quotation Sent', 'Cancelled']
        : ['Processing', 'Cancelled'];
    case 'Processing':
      return ['Shipped', 'Cancelled'];
    case 'Shipped':
      return ['Delivered'];
    case 'Quoted':
      return ['Approved', 'Rejected'];
    case 'Quotation Sent':
      return ['Approved', 'Rejected'];
    case 'Approved':
      return ['Processing'];
    default:
      return [];
  }
};

const exportToCSV = (data: Order[]) => {
  const headers = [
    'ID',
    'Customer',
    'Type',
    'Status',
    'Priority',
    'Assigned To',
    'Created At'
  ];
  const csvContent = [
    headers.join(','),
    ...data.map((order) =>
      [
        order.id,
        order.customerName,
        order.type,
        order.status,
        order.priority,
        order.assignedTo || 'Unassigned',
        formatDate(order.createdAt)
      ].join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'Pending':
      return <Clock className="h-4 w-4 text-background" />;
    case 'Processing':
      return <Package className="h-4 w-4 text-background" />;
    case 'Shipped':
      return <Truck className="h-4 w-4 text-background" />;
    case 'Delivered':
      return <Check className="h-4 w-4 text-background" />;
    case 'Cancelled':
      return <X className="h-4 w-4 text-background" />;
    case 'Quoted':
      return <Clipboard className="h-4 w-4 text-background" />;
    case 'Approved':
      return <ThumbsUp className="h-4 w-4 text-background" />;
    case 'Rejected':
      return <X className="h-4 w-4 text-background" />;
    case 'Quotation Sent':
      return <Send className="h-4 w-4 text-background" />;
    default:
      return <Info className="h-4 w-4 text-background" />;
  }
};

const QuotationForm = ({
  order,
  onSubmit,
  onCancel
}: {
  order: Order;
  onSubmit: (quotation: { items: OrderItem[]; total: number }) => void;
  onCancel: () => void;
}) => {
  const VAT_RATE = 0.05; // Fixed 5% VAT

  const [items, setItems] = useState<OrderItem[]>(
    order.specialOrderItems?.map((item) => ({
      ...item,
      price: item.price || 0
    })) || []
  );
  const [discount, setDiscount] = useState(0);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'name' ? value : Number(value)
    };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const vatTotal = subtotal * VAT_RATE;
    const total = subtotal + vatTotal - discount;
    return { subtotal, vatTotal, total };
  };

  const { subtotal, vatTotal, total } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ items, total });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold">Quotation</h2>
          <div className="text-sm text-muted-foreground">
            <div>Order ID: {order.id}</div>
            <div>Date: {format(new Date(), 'dd/MM/yyyy')}</div>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-lg">
          VAT 5%
        </Badge>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={item.name}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              placeholder="Item name"
              className="flex-grow"
            />
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              placeholder="Qty"
              className="w-20"
            />
            <Input
              type="number"
              value={item.price}
              onChange={(e) => updateItem(index, 'price', e.target.value)}
              placeholder="Price"
              className="w-24"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>VAT (5%):</span>
          <span>{formatCurrency(vatTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Discount:</span>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-24 text-right"
          />
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          Send Quotation
        </Button>
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  bgColor,
  icon
}: {
  title: string;
  value: number;
  bgColor: string;
  icon: React.ReactNode;
}) => (
  <motion.div
    className={`${bgColor} rounded-lg p-4 shadow-md`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {icon}
    </div>
    <p className="mt-2 text-3xl font-bold">{value}</p>
  </motion.div>
);

// Enhanced Order Details Sidebar Component
function EnhancedOrderDetailsSidebar({
  isOpen,
  onClose,
  selectedOrder,
  staff,
  onAssignStaff,
  onUpdateStatus,
  onSendQuotation
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: Order | null;
  staff: Staff[];
  onAssignStaff: (
    orderId: string,
    staffId: string,
    status: OrderStatus
  ) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onSendQuotation: (
    orderId: string,
    quotation: { items: OrderItem[]; total: number }
  ) => void;
}) {
  const [activeTab, setActiveTab] = React.useState<
    'details' | 'items' | 'history' | 'assignments'
  >('details');
  const [showQuotationForm, setShowQuotationForm] = useState(false);

  if (!selectedOrder) return null;

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    if (
      window.confirm(
        `Are you sure you want to update the status to ${newStatus}?`
      )
    ) {
      onUpdateStatus(selectedOrder.id, newStatus);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 right-0 z-50 w-full overflow-hidden border-l bg-background shadow-lg sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3"
        >
          <div className="flex h-full flex-col">
            <motion.div
              className="flex items-center justify-between border-b p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold">Order Details</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </motion.div>
            <div className="flex-1 overflow-y-auto">
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-6 flex items-center space-x-4">
                  <Badge
                    variant={
                      selectedOrder.type === 'Regular'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="px-3 py-1 text-lg"
                  >
                    {selectedOrder.type}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-lg">
                    {selectedOrder.status}
                  </Badge>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="order-info">
                    <AccordionTrigger>Order Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Order ID
                          </Label>
                          <div className="text-lg font-semibold">
                            {selectedOrder.id}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Customer Name
                          </Label>
                          <div className="text-lg font-semibold">
                            {selectedOrder.customerName}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Created At
                          </Label>
                          <div className="text-lg font-semibold">
                            {formatDate(selectedOrder.createdAt)}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Separator className="my-6" />
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Status
                    </Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant="outline" className="px-3 py-1 text-lg">
                        {selectedOrder.status}
                      </Badge>
                      {getNextStatuses(
                        selectedOrder.status,
                        selectedOrder.type
                      ).map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          onClick={() => handleUpdateStatus(status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="assigned-to"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Assigned To
                    </Label>
                    <Select
                      value={selectedOrder.assignedTo || ''}
                      onValueChange={(value) =>
                        onAssignStaff(
                          selectedOrder.id,
                          value,
                          selectedOrder.status
                        )
                      }
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Assign staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="bg-muted px-6 py-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Tabs
                  defaultValue="details"
                  className="w-full"
                  onValueChange={(value) =>
                    setActiveTab(
                      value as 'details' | 'items' | 'history' | 'assignments'
                    )
                  }
                >
                  <TabsList className="mb-4 grid w-full grid-cols-4">
                    <TabsTrigger
                      value="details"
                      className="flex items-center justify-center"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="items"
                      className="flex items-center justify-center"
                    >
                      <Package2 className="mr-2 h-4 w-4" />
                      Items
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="flex items-center justify-center"
                    >
                      <History className="mr-2 h-4 w-4" />
                      History
                    </TabsTrigger>
                    <TabsTrigger
                      value="assignments"
                      className="flex items-center justify-center"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assignments
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Delivery Option
                      </Label>
                      <div className="flex items-center text-lg font-semibold">
                        {selectedOrder.deliveryOption === 'Home Delivery' ? (
                          <Truck className="mr-2 h-5 w-5" />
                        ) : (
                          <Store className="mr-2 h-5 w-5" />
                        )}
                        {selectedOrder.deliveryOption}
                      </div>
                    </div>
                    {selectedOrder.deliveryOption === 'Home Delivery' && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Delivery Address
                        </Label>
                        <div className="flex items-center text-lg font-semibold">
                          <MapPin className="mr-2 h-5 w-5" />
                          {selectedOrder.address || 'N/A'}
                        </div>
                      </div>
                    )}
                    {selectedOrder.deliveryOption === 'Store Pickup' && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Store Location
                        </Label>
                        <div className="flex items-center text-lg font-semibold">
                          <Store className="mr-2 h-5 w-5" />
                          {selectedOrder.storeLocation || 'N/A'}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Payment Method
                      </Label>
                      <div className="flex items-center text-lg font-semibold">
                        {selectedOrder.paymentMethod === 'Credit Card' && (
                          <CreditCard className="mr-2 h-5 w-5" />
                        )}
                        {selectedOrder.paymentMethod === 'EVC' && (
                          <Banknote className="mr-2 h-5 w-5" />
                        )}
                        {selectedOrder.paymentMethod === 'Cash on Delivery' && (
                          <Banknote className="mr-2 h-5 w-5" />
                        )}
                        {selectedOrder.paymentMethod}
                      </div>
                    </div>
                    {selectedOrder.type === 'Special' && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Deposit Paid
                        </Label>
                        <div className="flex items-center text-lg font-semibold">
                          {selectedOrder.depositPaid ? (
                            <Check className="mr-2 h-5 w-5 text-green-500" />
                          ) : (
                            <X className="mr-2 h-5 w-5 text-red-500" />
                          )}
                          {selectedOrder.depositPaid ? 'Yes' : 'No'}
                        </div>
                      </div>
                    )}
                    {selectedOrder.specialInstructions && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Special Instructions
                        </Label>
                        <Textarea
                          value={selectedOrder.specialInstructions}
                          className="mt-1"
                          readOnly
                        />
                      </div>
                    )}
                    {selectedOrder.type === 'Special' && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Special Order Status
                        </Label>
                        <div className="text-lg font-semibold">
                          {selectedOrder.specialOrderStatus || 'Not started'}
                        </div>
                        {selectedOrder.status === 'Pending' &&
                          !showQuotationForm && (
                            <Button
                              onClick={() => setShowQuotationForm(true)}
                              className="mt-2"
                            >
                              Prepare Quotation
                            </Button>
                          )}
                        {showQuotationForm && (
                          <QuotationForm
                            order={selectedOrder}
                            onSubmit={(quotation) => {
                              onSendQuotation(selectedOrder.id, quotation);
                              setShowQuotationForm(false);
                            }}
                            onCancel={() => setShowQuotationForm(false)}
                          />
                        )}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="items" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(
                          selectedOrder.quotation?.items || selectedOrder.items
                        ).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              ${(item.quantity * item.price).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>
                          $
                          {(
                            selectedOrder.quotation?.total ||
                            selectedOrder.total
                          ).toFixed(2)}
                        </span>
                      </div>
                      {selectedOrder.discount && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-${selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedOrder.tip && (
                        <div className="flex justify-between">
                          <span>Tip:</span>
                          <span>${selectedOrder.tip.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>
                          $
                          {(
                            (selectedOrder.quotation?.total ||
                              selectedOrder.total) -
                            (selectedOrder.discount || 0) +
                            (selectedOrder.tip || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                      <div className="space-y-4">
                        {selectedOrder.history.map((event, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                              {getStatusIcon(event.status)}
                            </div>
                            <div className="flex-grow">
                              <div className="font-semibold">
                                {event.status}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(event.timestamp)}
                              </div>
                              <div className="mt-1">{event.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="assignments" className="mt-4">
                    <div className="space-y-4">
                      {Object.entries(selectedOrder.stepAssignments).map(
                        ([status, staffId]) => (
                          <div
                            key={status}
                            className="flex items-center justify-between"
                          >
                            <span>{status}</span>
                            <Select
                              value={staffId || ''}
                              onValueChange={(value) =>
                                onAssignStaff(
                                  selectedOrder.id,
                                  value,
                                  status as OrderStatus
                                )
                              }
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Assign staff" />
                              </SelectTrigger>
                              <SelectContent>
                                {staff.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name} ({s.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const QuickActionMenu = ({
  order,
  onUpdateStatus,
  onSendQuotation
}: {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onSendQuotation: (orderId: string) => void;
}) => {
  const nextStatuses = getNextStatuses(order.status, order.type);
  const isFinished =
    order.status === 'Delivered' || order.status === 'Cancelled';
  const isSpecial = order.type === 'Special';
  const assignedStaff = order.stepAssignments[order.status];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed px-2"
          disabled={isFinished || !assignedStaff}
        >
          {statusIcons[order.status]}
          <span className="sr-only">Update status</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="grid gap-2">
          {nextStatuses.map((status) => (
            <Button
              key={status}
              size="sm"
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onUpdateStatus(order.id, status)}
            >
              {statusIcons[status]}
              <span className="ml-2">{status}</span>
            </Button>
          ))}
          {isSpecial && order.status === 'Pending' && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onSendQuotation(order.id)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Prepare Quotation
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const OrderSummary = ({ orders }: { orders: Order[] }) => {
  const [summaryData, setSummaryData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    specialOrders: 0
  });

  useEffect(() => {
    const newSummaryData = {
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status === 'Pending')
        .length,
      processingOrders: orders.filter((order) => order.status === 'Processing')
        .length,
      shippedOrders: orders.filter((order) => order.status === 'Shipped')
        .length,
      specialOrders: orders.filter((order) => order.type === 'Special').length
    };
    setSummaryData(newSummaryData);
  }, [orders]);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryCard
        title="Total Orders"
        value={summaryData.totalOrders}
        bgColor="bg-primary/10"
        icon={<ShoppingBag className="h-6 w-6 text-primary" />}
      />
      <SummaryCard
        title="Pending"
        value={summaryData.pendingOrders}
        bgColor="bg-blue-500/10"
        icon={<Clock className="h-6 w-6 text-blue-500" />}
      />
      <SummaryCard
        title="Processing"
        value={summaryData.processingOrders}
        bgColor="bg-yellow-500/10"
        icon={<Package className="h-6 w-6 text-yellow-500" />}
      />
      <SummaryCard
        title="Shipped"
        value={summaryData.shippedOrders}
        bgColor="bg-purple-500/10"
        icon={<Truck className="h-6 w-6 text-purple-500" />}
      />
      <SummaryCard
        title="Special Orders"
        value={summaryData.specialOrders}
        bgColor="bg-red-500/10"
        icon={<Clipboard className="h-6 w-6 text-red-500" />}
      />
    </div>
  );
};

// Main component
export default function EnhancedOrderManagementDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<OrderType | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<
    Order['priority'] | 'All'
  >('All');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'descending'
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    setIsLoading(true);
    const initialOrders = generateMockOrders(100);
    setOrders(initialOrders);
    setFilteredOrders(initialOrders);
    setStaff(generateMockStaff());
    setTimeout(() => setIsLoading(false), 1000); // Simulate loading delay
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Filter and sort orders
  useEffect(() => {
    let result = orders;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'All') {
      result = result.filter((order) => order.type === typeFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'All') {
      result = result.filter((order) => order.priority === priorityFilter);
    }

    // Apply date filter
    if (selectedDate) {
      result = result.filter(
        (order) =>
          order.createdAt.toDateString() === selectedDate.toDateString()
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (
        // @ts-ignore
        a[sortConfig.key] < b[sortConfig.key]
      ) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (
        //@ts-ignore
        a[sortConfig.key] > b[sortConfig.key]
      ) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [
    orders,
    searchTerm,
    statusFilter,
    typeFilter,
    priorityFilter,
    sortConfig,
    selectedDate
  ]);

  //Pagination
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Event handlers
  const handleSort = (key: keyof Order) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending'
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(paginatedOrders.map((order) => order.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (checked) {
        newSelected.add(orderId);
      } else {
        newSelected.delete(orderId);
      }
      return newSelected;
    });
  };

  const handleAssignStaff = (
    orderId: string,
    staffId: string,
    status: OrderStatus
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              stepAssignments: {
                ...order.stepAssignments,
                [status]: staffId
              },
              history: [
                ...order.history,
                {
                  status: order.status,
                  timestamp: new Date(),
                  note: `${staff.find((s) => s.id === staffId)
                    ?.name} assigned to ${status} step`
                }
              ]
            }
          : order
      )
    );
    setIsSlideOverOpen(false);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              history: [
                ...order.history,
                {
                  status: newStatus,
                  timestamp: new Date(),
                  note: `Status updated to ${newStatus}`
                }
              ]
            }
          : order
      )
    );

    setIsSlideOverOpen(false);
  };

  const handleOpenSlideOver = (order: Order) => {
    setSelectedOrder(order);
    setIsSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setSelectedOrder(null);
    setIsSlideOverOpen(false);
  };

  const handleSendQuotation = (
    orderId: string,
    quotation: { items: OrderItem[]; total: number }
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'Quotation Sent',
              quotation: quotation,
              history: [
                ...order.history,
                {
                  status: 'Quotation Sent',
                  timestamp: new Date(),
                  note: `Quotation sent to customer`
                }
              ]
            }
          : order
      )
    );

    setIsSlideOverOpen(false);
  };

  // Memoized components
  const MemoizedHeader = useMemo(
    () => (
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">
            <Checkbox
              checked={selectedOrders.size === paginatedOrders.length}
              onCheckedChange={handleSelectAll}
              aria-label="Select all orders"
            />
          </TableHead>
          <TableHead className="w-[100px]">Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="w-[100px]">
            <Button variant="ghost" onClick={() => handleSort('type')}>
              Type
              {sortConfig.key === 'type' &&
                (sortConfig.direction === 'ascending' ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                ))}
            </Button>
          </TableHead>
          <TableHead className="w-[120px]">
            <Button variant="ghost" onClick={() => handleSort('status')}>
              Status
              {sortConfig.key === 'status' &&
                (sortConfig.direction === 'ascending' ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                ))}
            </Button>
          </TableHead>
          <TableHead className="w-[120px]">
            <Button variant="ghost" onClick={() => handleSort('priority')}>
              Priority
              {sortConfig.key === 'priority' &&
                (sortConfig.direction === 'ascending' ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                ))}
            </Button>
          </TableHead>
          <TableHead className="w-[150px]">Assigned To</TableHead>
          <TableHead className="w-[180px]">
            <Button variant="ghost" onClick={() => handleSort('createdAt')}>
              Created At
              {sortConfig.key === 'createdAt' &&
                (sortConfig.direction === 'ascending' ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                ))}
            </Button>
          </TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
    ),
    [sortConfig, selectedOrders, paginatedOrders]
  );

  const TableContent = useMemo(
    () => (
      <TableBody>
        {paginatedOrders.map((order) => (
          <TableRow
            key={order.id}
            className="transition-colors hover:bg-muted/50"
          >
            <TableCell>
              <Checkbox
                checked={selectedOrders.has(order.id)}
                onCheckedChange={(checked) =>
                  handleSelectOrder(order.id, checked as boolean)
                }
                aria-label={`Select order ${order.id}`}
              />
            </TableCell>
            <TableCell>{order.id}</TableCell>
            <TableCell>
              <div className="font-medium">{order.customerName}</div>
            </TableCell>
            <TableCell>
              <Badge
                variant={order.type === 'Regular' ? 'secondary' : 'destructive'}
              >
                {order.type}
              </Badge>
            </TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      {statusIcons[order.status]}
                      <span className="ml-2">{order.status}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Status: {order.status}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      {priorityIcons[order.priority]}
                      <span className="ml-2">{order.priority}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Priority: {order.priority}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              {order.stepAssignments[order.status]
                ? staff.find(
                    (s) => s.id === order.stepAssignments[order.status]
                  )?.name || 'Unassigned'
                : 'Unassigned'}
            </TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <QuickActionMenu
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onSendQuotation={() => handleOpenSlideOver(order)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenSlideOver(order)}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">View order details</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    ),
    [paginatedOrders, selectedOrders, staff, handleOpenSlideOver]
  );

  return (
    <div
      className={cn(
        'min-h-screen bg-background text-foreground',
        isDarkMode ? 'dark' : ''
      )}
    >
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col items-center justify-between sm:flex-row">
          <motion.h1
            className="mb-4 text-3xl font-bold sm:mb-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Order Management
          </motion.h1>
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </motion.div>
        </div>

        <OrderSummary orders={orders} />

        <motion.div
          className="mb-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-x-4 sm:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[300px]"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as OrderStatus | 'All')
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Quoted">Quoted</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Quotation Sent">Quotation Sent</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as OrderType | 'All')
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Special">Special</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) =>
                setPriorityFilter(value as Order['priority'] | 'All')
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal sm:w-[240px]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>

        <motion.div
          className="overflow-hidden rounded-lg bg-card text-card-foreground shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ScrollArea className="h-[calc(100vh-20rem)] rounded-md border">
            <Table>
              {MemoizedHeader}
              {TableContent}
            </Table>
          </ScrollArea>
        </motion.div>

        <motion.div
          className="mt-4 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="text-sm text-muted-foreground">
            {selectedOrders.size} of {paginatedOrders.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => setRowsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={rowsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {isSlideOverOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setIsSlideOverOpen(false)}
        />
      )}
      <EnhancedOrderDetailsSidebar
        isOpen={isSlideOverOpen}
        onClose={handleCloseSlideOver}
        selectedOrder={selectedOrder}
        staff={staff}
        onAssignStaff={handleAssignStaff}
        onUpdateStatus={handleUpdateStatus}
        onSendQuotation={handleSendQuotation}
      />
    </div>
  );
}
