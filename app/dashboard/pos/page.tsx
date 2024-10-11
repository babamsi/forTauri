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
  XIcon,
  SearchIcon,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import { BarcodeScanner } from '@thewirv/react-barcode-scanner';
import {
  useSelProductMutation,
  useGetProductsQuery
} from '../../../store/authApi';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
  scannedQuantity: number;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    'percentage'
  );

  const {
    data: productServer,
    error,
    isFetching,
    isError
  } = useGetProductsQuery(cookies);
  // const { data: orderData, error: orderError, refetch } = useGetOrderByInvoiceQuery({ invoiceNumber, cookies }, { skip: !invoiceNumber });
  const [sell, { isLoading, isError: isSellError, isSuccess }] =
    useSelProductMutation();

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k);
    });
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const handleScan = async (scannedBarcode: string) => {
    if (!scannedBarcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }
    const product = await fetchProductByBarcode(scannedBarcode, productServer);
    if (product && product.quantity > 0) {
      addProductToCart(product);
      setBarcode('');
    } else {
      toast.error(
        `No product found with barcode: ${scannedBarcode} or Product is out of stock`
      );
    }
  };

  const addProductToCart = (product: Product) => {
    setScannedItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        if (existingItem.scannedQuantity < product.quantity) {
          return prevItems.map((item) =>
            item._id === product._id
              ? { ...item, scannedQuantity: item.scannedQuantity + 1 }
              : item
          );
        } else {
          toast.error(`Cannot add more ${product.name}. Stock limit reached.`);
          return prevItems;
        }
      } else {
        return [...prevItems, { ...product, scannedQuantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setScannedItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item._id === id) {
            if (item.isQuantityBased) {
              if (newQuantity > item.quantity) {
                toast.error(
                  `Cannot add more ${item.name}. Stock limit reached.`
                );
                return item;
              }
              return { ...item, scannedQuantity: Math.max(0, newQuantity) };
            } else {
              if (newQuantity > Number(item.units.split(' ')[0])) {
                toast.error(
                  `Cannot add more ${item.name}. Stock limit reached.`
                );
                return item;
              }
              return { ...item, scannedQuantity: Math.max(0, newQuantity) };
            }
          }
          return item;
        })
        .filter((item) => item.scannedQuantity > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setScannedItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };

  const totalAmount = scannedItems.reduce(
    (sum, item) => sum + item.sellPrice * item.scannedQuantity,
    0
  );

  const calculateTotalWithDiscount = () => {
    if (discountType === 'percentage') {
      return totalAmount * (1 - discount / 100);
    } else {
      return Math.max(0, totalAmount - discount);
    }
  };

  const handleDiscountChange = (value: string) => {
    const discountValue = parseFloat(value);
    if (!isNaN(discountValue)) {
      if (discountType === 'percentage' && discountValue > 100) {
        setDiscount(100);
      } else {
        setDiscount(discountValue);
      }
    } else {
      setDiscount(0);
    }
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    setAmountPaid('');
    setChange(0);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!customerDetails.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!customerDetails.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerDetails.email)) {
      errors.email = 'Email is invalid';
    }
    if (!customerDetails.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (
      isCashPayment &&
      (!amountPaid || parseFloat(amountPaid) < totalAmount)
    ) {
      errors.amountPaid = 'Amount paid must be at least the total amount';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteCheckout = async () => {
    if (!validateForm()) {
      return;
    }
    setIsProcessingOrder(true);
    const products = scannedItems.map((item) => ({
      productId: item._id,
      quantity: String(item.scannedQuantity)
    }));
    const datas = {
      data: {
        products,
        cashType: isCashPayment ? 'CASH' : 'EVC',
        customer: customerDetails,
        discount: {
          type: discountType,
          value: discount,
          amount: totalAmount - calculateTotalWithDiscount()
        }
      },
      cookies
    };
    if (products.length > 0) {
      try {
        const result = await sell(datas);
        // console.log(datas);
        if ('error' in result) {
          toast.error('An error occurred during checkout');
          setScannedItems([]);
        } else {
          const totalWithDiscount = calculateTotalWithDiscount();
          toast.success('Order placed successfully');
          toast.success(
            `Total: $${totalAmount.toFixed(2)}, Discount: $${(
              totalAmount - totalWithDiscount
            ).toFixed(2)}, Final Total: $${totalWithDiscount.toFixed(
              2
            )}, Paid: $${amountPaid}, Change: $${change.toFixed(2)}`
          );
          setScannedItems([]);
          setCustomerDetails({ name: '', email: '', phone: '' });
          setIsCheckoutOpen(false);
          setAmountPaid('');
          setChange(0);
        }
      } catch (error) {
        toast.error('An unexpected error occurred during checkout');
      } finally {
        setIsProcessingOrder(false);
      }
    } else {
      setIsProcessingOrder(false);
      toast.error('No products in the cart');
    }
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
      const item = scannedItems.find((item) => item._id === currentItemId);
      if (item) {
        const newQuantity = parseFloat(keypadValue) || 0;
        if (item.isQuantityBased) {
          if (newQuantity > item.quantity) {
            toast.error(`Cannot add more ${item.name}. Stock limit reached.`);
          } else {
            handleQuantityChange(currentItemId, newQuantity);
          }
        } else {
          if (newQuantity > Number(item.units.split(' ')[0])) {
            toast.error(`Cannot add more ${item.name}. Stock limit reached.`);
          } else {
            handleQuantityChange(currentItemId, newQuantity);
          }
        }
      }
    } else {
      setAmountPaid(keypadValue);
      const paid = parseFloat(keypadValue);
      if (!isNaN(paid)) {
        setChange(Math.max(0, paid - totalAmount));
      }
    }
    setIsKeypadOpen(false);
  };

  const handleSearch = (productName: string) => {
    const product = productServer.find((p: Product) => p.name === productName);
    if (product) {
      addProductToCart(product);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <Toaster />
      {/* Left side - Product list */}
      <div className="flex-1 overflow-auto p-4">
        <h1 className="mb-4 text-xl font-bold md:text-2xl">POS System</h1>
        <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          {/* <Input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan or enter barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleScan(barcode)}
            className="flex-grow"
          /> */}
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button className="w-full flex-grow sm:w-auto" variant="outline">
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search products..."
                  value={searchQuery}
                  className="flex-grow rounded-none"
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    {productServer &&
                      productServer
                        .filter((product: Product) =>
                          product.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((product: Product) => (
                          <CommandItem
                            key={product._id}
                            onSelect={() => handleSearch(product.name)}
                          >
                            {product.name}
                          </CommandItem>
                        ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {/* <Button
            onClick={() => handleScan(barcode)}
            disabled={!barcode.trim()}
            className="w-full sm:w-auto"
          >
            <BarcodeIcon className="mr-2 h-4 w-4" />
            Scan
          </Button> */}

          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsCameraActive(!isCameraActive)}
          >
            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
          </Button>
        </div>
        {isCameraActive && (
          <div className="mb-4">
            <BarcodeScanner
              onSuccess={(result) => {
                if (result) {
                  // console.log(result);
                  const currentTime = Date.now();
                  if (currentTime - lastScanTime < 2000) {
                    // If less than 1 second has passed since the last scan, ignore this scan
                    return;
                  }
                  setLastScanTime(currentTime);
                  handleScan(result);
                  setIsCameraActive(false);
                  // setBarcode(result);
                }
              }}
              onError={(error) => {
                if (error) {
                  console.error(error.message);
                }
              }}
              containerStyle={{ width: '100%', height: '300px' }}
            />
          </div>
        )}
        <div className="overflow-x-auto">
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
                  <TableCell>${item.sellPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            item.scannedQuantity -
                              (item.isQuantityBased ? 1 : 0.1)
                          )
                        }
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openKeypad(item._id)}
                        className="w-16 text-center"
                      >
                        {item.isQuantityBased
                          ? item.scannedQuantity
                          : item.scannedQuantity.toFixed(2)}
                        {item.isQuantityBased ? '' : ' kg'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            item.scannedQuantity +
                              (item.isQuantityBased ? 1 : 0.1)
                          )
                        }
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    ${(item.sellPrice * item.scannedQuantity).toFixed(2)}
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
      </div>

      {/* Right side - Total and Checkout */}
      <Card className="p-4 lg:h-full lg:w-80">
        <CardContent className="flex h-full flex-col justify-between">
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
        <DialogContent className="sm:max-w-[425px]">
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
              {formErrors.name && (
                <p className="col-span-3 col-start-2 text-red-500">
                  {formErrors.name}
                </p>
              )}
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
              {formErrors.email && (
                <p className="col-span-3 col-start-2 text-red-500">
                  {formErrors.email}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              {
                // @ts-ignore
                <PhoneInput
                  international
                  defaultCountry="KE"
                  value={customerDetails.phone}
                  onChange={(value) =>
                    setCustomerDetails({
                      ...customerDetails,
                      phone: value || ''
                    })
                  }
                  className="col-span-3"
                />
              }

              {formErrors.phone && (
                <p className="col-span-3 col-start-2 text-red-500">
                  {formErrors.phone}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount" className="text-right">
                Discount
              </Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="col-span-2"
              />
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as 'percentage' | 'fixed')
                }
                className="col-span-1"
              >
                <option value="percentage">%</option>
                {/* <option value="fixed">$</option> */}
              </select>
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
                    {amountPaid ? `${amountPaid}` : 'Enter amount'}
                  </Button>
                </div>
                {formErrors.amountPaid && (
                  <p className="col-span-3 col-start-2 text-red-500">
                    {formErrors.amountPaid}
                  </p>
                )}
                {change > 0 && (
                  <Alert>
                    <AlertTitle>Change Due</AlertTitle>
                    <AlertDescription>{change.toFixed(2)}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-green-600">
              <span>Discount:</span>
              <span>
                ${(totalAmount - calculateTotalWithDiscount()).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>Final Total:</span>
              <span>${calculateTotalWithDiscount().toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCompleteCheckout}
              disabled={
                isProcessingOrder ||
                (isCashPayment &&
                  (!amountPaid || parseFloat(amountPaid) < totalAmount))
              }
            >
              {isProcessingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Order'
              )}
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
              // @ts-ignore
              allowDecimal={
                !currentItemId ||
                (currentItemId &&
                  !scannedItems.find((item) => item._id === currentItemId)
                    ?.isQuantityBased)
              }
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
