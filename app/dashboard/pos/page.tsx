'use client';
import { getAuthCookie } from '@/actions/auth.actions';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import toast, { Toaster } from 'react-hot-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BarcodeIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  XIcon
} from 'lucide-react';
// import Scanner from "react-barcode-scanner"
import { BarcodeScanner } from '@thewirv/react-barcode-scanner';
import {
  useSelProductMutation,
  useGetProductsQuery
} from '../../../store/authApi';
// import { AddUser } from '@/components/accounts/add-user'
import { on } from 'events';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  sellPrice: number;
  addedBy: string;
  quantity: number;
  units: string;
  vendor: string;
  category: string;
  isQuantityBased: boolean;
  createdAt: string;
  updatedAt: string;
  barcode: string | null;
}

interface ScannedItem extends Product {
  quantity: number;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

// const mockProducts: Product[] = [
//   { _id: '1', name: 'Product A', price: 10.99, barcode: '123456' },
//   { _id: '2', name: 'Product B', price: 15.99, barcode: '789012' },
//   { _id: '3', name: 'Product C', price: 5.99, barcode: '345678' },
// ]

const fetchProductDetailsByName = async (
  name: string,
  productServer: Product[]
): Promise<Product> => {
  const product = productServer.find((p) => p.name === name);
  if (product) {
    return product;
  } else {
    throw new Error('Product not found');
  }
};

const fetchProductByBarcode = async (
  barcode: string,
  productServer: Product[]
): Promise<Product> => {
  // Simulating API call
  // await new Promise(resolve => setTimeout(resolve, 300))
  const product = productServer.find((p) => p.barcode === barcode);
  if (product) {
    return product;
  } else {
    throw new Error('Product not found');
  }
};

const NumericKeypad = ({
  onInput,
  onClear,
  onSubmit
}: {
  onInput: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}) => {
  const buttons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '00'];

  return (
    <div className="grid grid-cols-3 gap-2">
      {buttons.map((btn) => (
        <Button key={btn} onClick={() => onInput(btn)} className="h-12 text-lg">
          {btn}
        </Button>
      ))}
      <Button onClick={onClear} className="h-12 text-lg">
        Clear
      </Button>
      <Button onClick={onSubmit} className="col-span-2 h-12 text-lg">
        Enter
      </Button>
    </div>
  );
};

export default function POSSystem() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: ''
  });
  const [isCashPayment, setIsCashPayment] = useState(true);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [keypadValue, setKeypadValue] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  const [cookies, setcookies] = useState(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const {
    data: productServer,
    error,
    isFetching,
    isError
  } = useGetProductsQuery(cookies);
  const [sell, { isLoading, isError: isSellError, isSuccess }] =
    useSelProductMutation();

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k); //setting the token so the server can verify and give us output
    });
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const handleScan = async (scannedBarcode: string) => {
    const product = await fetchProductByBarcode(scannedBarcode, productServer);
    if (product) {
      addProductToCart(product);
      setBarcode('');
    } else {
      toast.error(`No product found with barcode: ${scannedBarcode}`);
    }
  };

  const addProductToCart = (product: Product) => {
    setScannedItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setScannedItems((prevItems) =>
      prevItems
        .map((item) =>
          item._id === id
            ? { ...item, quantity: Math.max(0, newQuantity) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setScannedItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };

  const totalAmount = scannedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    setAmountPaid('');
    setChange(0);
  };

  const handleCompleteCheckout = async () => {
    // Here you would typically send the order to your backend
    console.log('Order:', {
      items: scannedItems,
      customer: customerDetails,
      isCashPayment,
      amountPaid,
      change
    });
    const products = scannedItems.map((item) => ({
      productId: item._id,
      quantity: String(item.quantity)
    }));
    const datas = {
      data: {
        products,
        cashType: isCashPayment ? 'CASH' : 'EVC',
        customer: customerDetails
      },
      cookies
    };
    if (products.length > 0) {
      const result = await sell(datas);
      console.log(result);
      if (isSellError) {
        toast.error(result?.error?.data?.message);
        setScannedItems([]);
      }
      if (result) {
        toast.success('Order placed successfully');
        toast.success(
          `Total: $${totalAmount.toFixed(
            2
          )}, Paid: $${amountPaid}, Change: $${change.toFixed(2)}`
        );
      }
    }
    setScannedItems([]);
    setCustomerDetails({ name: '', email: '', phone: '' });
    setIsCheckoutOpen(false);
    setAmountPaid('');
    setChange(0);
  };

  const openKeypad = (id: string | null) => {
    setCurrentItemId(id);
    setKeypadValue('');
    setIsKeypadOpen(true);
  };

  const handleKeypadInput = (value: string) => {
    setKeypadValue((prev) => {
      if (value === '.' && prev.includes('.')) return prev;
      return prev + value;
    });
  };

  const handleKeypadClear = () => {
    setKeypadValue('');
  };

  const handleKeypadSubmit = () => {
    if (currentItemId) {
      handleQuantityChange(currentItemId, parseInt(keypadValue) || 0);
    } else {
      setAmountPaid(keypadValue);
      const paid = parseFloat(keypadValue);
      if (!isNaN(paid)) {
        setChange(Math.max(0, paid - totalAmount));
      }
    }
    setIsKeypadOpen(false);
  };
  const handleOnSearch = (string: string, results: string) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    // console.log("enter pressed", string)
    // if (!string) return
    // console.log(string, results)
  };

  const handleOnHover = (result: string) => {
    // the item hovered
    console.log(result);
  };

  const handleOnSelect = async (item: any) => {
    // the item selected
    console.log('item selected', item);
    if (!item) return;

    // setIsScanning(true)
    try {
      const kk = item.name;
      const product = await fetchProductDetailsByName(kk, productServer!);
      if (product) {
        addProductToCart(product);
        setBarcode('');
      }
    } catch (error) {
      toast('Product not found. Please try again.');
    }
  };

  const handleOnFocus = () => {
    console.log('Focused');
  };
  const orderPlacingHandler = async () => {
    // console.log(scannedItems)
    // const products = scannedItems.map(item => ({
    //   productId: item._id,
    //   quantity: String(item.scannedQuantity)
    // }))
    // const datas = {
    //   data: {...products},
    //   cookies
    // }
    // console.log(datas)
    // if (products.length > 0) {
    //   const result = await sell(data)
    //   console.log(result)
    //   if (result) {
    //     toast.success('Order placed successfully')
    //     setScannedItems([])
    //   }
    // }
  };

  return (
    <div className="h-scree flex">
      <Toaster />
      {/* Left side - Product list */}
      <div className="flex-1 overflow-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">POS System</h1>
        <div className="mb-4 flex space-x-2">
          <Input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan or enter barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleScan(barcode)}
            className="flex-grow"
          />
          <Button onClick={() => handleScan(barcode)}>
            <BarcodeIcon className="mr-2 h-4 w-4" />
            Scan
          </Button>
          <Button onClick={() => setIsCameraActive(!isCameraActive)}>
            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
          </Button>
        </div>
        {isCameraActive && (
          <div className="mb-4">
            <BarcodeScanner
              onSuccess={(result) => {
                if (result) {
                  //   handleScan(result)
                  console.log(result);
                  setBarcode(result);
                }
              }}
              onError={(error) => {
                if (error) {
                  console.error(error.message);
                }
              }}
              //   constraints={{ facingMode: 'environment' }}
              containerStyle={{ width: '100%', height: '300px' }}
            />
          </div>
        )}
        {/* <AddUser
            items={productServer ? productServer : []}
            onSearch={() => handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
            /> */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scannedItems.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity - 1)
                      }
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openKeypad(item._id)}
                      className="w-16 text-center"
                    >
                      {item.quantity}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity + 1)
                      }
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  ${(item.price * item.quantity).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item._id)}
                  >
                    <XIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Right side - Total and Checkout */}
      <Card className="flex h-full w-80 flex-col justify-between p-4">
        <CardContent>
          <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <Button onClick={handleCheckout} disabled={scannedItems.length === 0}>
          <ShoppingCartIcon className="mr-2 h-4 w-4" />
          Checkout
        </Button>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={customerDetails.name}
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    name: e.target.value
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={customerDetails.email}
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    email: e.target.value
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={customerDetails.phone}
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    phone: e.target.value
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cash"
                checked={isCashPayment}
                onCheckedChange={(checked) =>
                  setIsCashPayment(checked as boolean)
                }
              />
              <Label htmlFor="cash">Cash</Label>
            </div>
            {isCashPayment && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amountPaid" className="text-right">
                    Amount Paid
                  </Label>
                  <Button
                    onClick={() => openKeypad(null)}
                    className="col-span-3 justify-start"
                    variant="outline"
                  >
                    {amountPaid ? `$${amountPaid}` : 'Enter amount'}
                  </Button>
                </div>
                {change > 0 && (
                  <Alert>
                    <AlertTitle>Change Due</AlertTitle>
                    <AlertDescription>${change.toFixed(2)}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleCompleteCheckout}
              disabled={
                isCashPayment &&
                (!amountPaid || parseFloat(amountPaid) < totalAmount)
              }
            >
              Complete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Numeric Keypad Dialog */}
      <Dialog open={isKeypadOpen} onOpenChange={setIsKeypadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentItemId ? 'Enter Quantity' : 'Enter Amount Paid'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              value={keypadValue}
              readOnly
              className="mb-4 text-right text-2xl"
            />
            <NumericKeypad
              onInput={handleKeypadInput}
              onClear={handleKeypadClear}
              onSubmit={handleKeypadSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
