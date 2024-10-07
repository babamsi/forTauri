'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useGetOrderByInvoiceQuery,
  useUpdateOrderMutation
} from '@/store/authApi';
import { getAuthCookie } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toast, Toaster } from 'react-hot-toast';
import { Loader2, RefreshCcw, Minus, Plus } from 'lucide-react';

interface Product {
  _id: string;
  product: string;
  quantity: string;
  price: number;
  subtotal: number;
  productId: string;
  isQuantityBased: boolean;
}

interface Order {
  user: {
    name: string;
    phone: string;
    email: string;
  };
  _id: string;
  products: Product[];
  totalAmount: number;
  cashType: string;
  soldBy: string;
  invoiceNumber: string;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface RefundProduct extends Product {
  keepQuantity: number;
}

const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export default function RefundPage() {
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [cookies, setCookies] = useState(null);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [refundProducts, setRefundProducts] = useState<RefundProduct[]>([]);

  const {
    data: orderData,
    error: orderError,
    isLoading,
    refetch
  } = useGetOrderByInvoiceQuery(
    { invoiceNumber, cookies },
    { skip: !invoiceNumber || !cookies }
  );

  const [updateOrder, { isLoading: isUpdating, isError: updateError }] =
    useUpdateOrderMutation();

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const cookiesData = await getAuthCookie();
        setCookies(cookiesData);
      } catch (error) {
        console.error('Error fetching auth cookie:', error);
        toast.error('Error authenticating. Please try again.');
      }
    };
    fetchCookies();
  }, []);

  useEffect(() => {
    if (orderData) {
      setRefundProducts(
        orderData.products.map((product) => ({
          ...product,
          keepQuantity: parseInt(product.quantity)
        }))
      );
    }
  }, [orderData]);

  const handleRefundClick = () => {
    setIsRefundDialogOpen(true);
    setInvoiceNumber('');
  };

  const handleInvoiceSubmit = async () => {
    if (!invoiceNumber.trim()) {
      toast.error('Please enter an invoice number');
      return;
    }
    try {
      await refetch();
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error fetching order. Please try again.');
    }
  };

  const handleRefund = useCallback(async () => {
    if (!orderData) return;

    if (orderData.status === 'Refunded') {
      toast.error('This order has already been refunded.');
      return;
    }

    if (
      orderData.products.every((product) => parseInt(product.quantity) === 0)
    ) {
      toast.error('All products in this order have already been refunded.');
      return;
    }

    setIsProcessingRefund(true);
    try {
      const updatedProducts = refundProducts.map((product) => ({
        ...product,
        quantity: product.keepQuantity.toString()
      }));

      const updatedTotalAmount = updatedProducts.reduce(
        (total, product) => total + product.keepQuantity * product.price,
        0
      );
      const updatedRevenue =
        orderData.revenue - (orderData.totalAmount - updatedTotalAmount);

      const result = await updateOrder({
        id: orderData._id,
        data: {
          products: updatedProducts,
          totalAmount: updatedTotalAmount,
          revenue: updatedRevenue,
          status: 'Refunded'
        },
        cookies
      }).unwrap();

      if ('error' in result) {
        throw new Error(result.error);
      }

      toast.success('Refund processed successfully');
      setIsRefundDialogOpen(false);
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(
        `Error processing refund: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsProcessingRefund(false);
    }
  }, [refundProducts, updateOrder, cookies, orderData]);

  const handleQuantityChange = useCallback(
    (productId: string, change: number) => {
      setRefundProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? {
                ...product,
                keepQuantity: Math.max(
                  0,
                  Math.min(
                    parseInt(product.quantity),
                    product.keepQuantity + change
                  )
                )
              }
            : product
        )
      );
    },
    []
  );

  const calculateRefundTotal = useCallback(() => {
    return refundProducts.reduce(
      (total, product) =>
        total +
        product.price * (parseInt(product.quantity) - product.keepQuantity),
      0
    );
  }, [refundProducts]);

  const isRefundButtonDisabled = useMemo(() => {
    return (
      refundProducts.length === 0 ||
      refundProducts.every(
        (product) => product.keepQuantity === parseInt(product.quantity)
      )
    );
  }, [refundProducts]);

  if (!cookies) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="mb-6 text-3xl font-bold">Refund System</h1>
      <Button onClick={handleRefundClick}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        Process Refund
      </Button>

      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoiceNumber" className="text-right">
                Invoice Number
              </Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="col-span-3"
                placeholder="Enter invoice number"
              />
            </div>
            <Button onClick={handleInvoiceSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Invoice'
              )}
            </Button>
            {orderError && (
              <p className="text-red-500">
                Error fetching order. Please try again.
              </p>
            )}
            {orderData && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div>
                      <strong>Customer:</strong> {orderData.user.name}
                    </div>
                    <div>
                      <strong>Phone:</strong> {orderData.user.phone}
                    </div>
                    <div>
                      <strong>Email:</strong> {orderData.user.email}
                    </div>
                    <div>
                      <strong>Invoice Number:</strong> {orderData.invoiceNumber}
                    </div>
                    <div>
                      <strong>Date:</strong>{' '}
                      {new Date(orderData.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Payment Method:</strong> {orderData.cashType}
                    </div>
                    <div>
                      <strong>Total Amount:</strong> $
                      {orderData.totalAmount.toFixed(2)}
                    </div>
                    <div>
                      <strong>Status:</strong> {orderData.status}
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refundProducts.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>{product.product}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(product._id, -1)
                                }
                                disabled={product.keepQuantity <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-16 text-center">
                                {product.keepQuantity} / {product.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(product._id, 1)
                                }
                                disabled={
                                  product.keepQuantity >=
                                  parseInt(product.quantity)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            ${(product.price * product.keepQuantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right">
                    <strong>
                      Refund Total: ${calculateRefundTotal().toFixed(2)}
                    </strong>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleRefund}
                    disabled={
                      isProcessingRefund ||
                      isRefundButtonDisabled ||
                      orderData.status === 'Refunded'
                    }
                    className="w-full"
                  >
                    {isProcessingRefund ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Refund...
                      </>
                    ) : (
                      'Confirm Refund'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
