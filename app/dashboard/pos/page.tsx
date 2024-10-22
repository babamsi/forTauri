'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  useGetProductsQuery,
  useGetOrdersQuery,
  useGetAllCustomerQuery,
  useSelProductMutation,
  useUpdateOrderMutation
} from '@/store/authApi';
import { deleteAuthCookie, getAuthCookie } from '@/actions/auth.actions';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Building2,
  Smartphone,
  DollarSign,
  Barcode,
  User,
  UserPlus,
  RefreshCcw,
  Printer,
  Mail,
  Send,
  Check,
  X,
  Loader2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Eye,
  Calendar as CalendarIcon,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash,
  Filter,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Menu,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { BarcodeScanner } from '@thewirv/react-barcode-scanner';

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

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Order {
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
  createdAt: string;
  status: string;
}

// Mock data for products, customers, and transactions

const localBanks = [
  { id: 'B001', name: 'Salaam Bank' },
  { id: 'B002', name: 'Dahabshiil Bank' },
  { id: 'B003', name: 'Amal Bank' },
  { id: 'B004', name: 'Premier Bank' }
];

export default function EnhancedPOSSystem() {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // const [productsServer, setProductsServer] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  // const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSaleComplete, setIsSaleComplete] = useState(false);
  const [receiptMethod, setReceiptMethod] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnInvoice, setReturnInvoice] = useState('');
  const [returnItems, setReturnItems] = useState([]);
  const [returnUser, setReturnUser] = useState({});
  const [returnDate, setReturnDate] = useState('');
  const [returnPaymentType, setReturnPaymentType] = useState('');
  const [returnTotalAmount, setReturnTotalAmount] = useState(0);
  const [returnDiscount, setReturnDiscount] = useState('');
  const [afterReturnAmount, setAfterReturnAmount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('0');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Order | null>(
    null
  );
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] =
    useState(false);
  const [date, setDate] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [authCode, setAuthCode] = useState('');
  const [isAuthCodeSent, setIsAuthCodeSent] = useState(false);
  const [isProductCatalogVisible, setIsProductCatalogVisible] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cookies, setcookies] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const VAT_RATE = 0.05; // 5% VAT rate

  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  const {
    data: productServer,
    error: productsError,
    isFetching,
    isError
  } = useGetProductsQuery(cookies, { skip: !cookies });
  const { data: customers, error: customersError } =
    useGetAllCustomerQuery(cookies);
  const { data: orders, refetch } = useGetOrdersQuery(cookies, {
    skip: !cookies
  });
  const [sell, { isLoading, isError: isSellError, isSuccess }] =
    useSelProductMutation();
  const [updateOrder, { isLoading: isUpdating, isError: updateError }] =
    useUpdateOrderMutation();

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k);
    });
    // if (barcodeInputRef.current) {
    //   barcodeInputRef.current.focus();
    // }
  }, []);

  useEffect(() => {
    //@ts-ignore
    if (productsError?.data?.message === 'Token expired') {
      deleteAuthCookie();
    }
  }, [productsError]);

  // console.log(productServer)

  const categories = useMemo(
    // @ts-ignore
    () => [...new Set(productServer?.map((product) => product.category))],
    [productServer]
  );

  // const { data: orderData, error: orderError, refetch } = useGetOrderByInvoiceQuery({ invoiceNumber, cookies }, { skip: !invoiceNumber });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery) {
        const all = await productServer;
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = await all.filter(
          (product: Product) =>
            (product.name.toLowerCase().includes(lowercasedQuery) ||
              product._id.toLowerCase().includes(lowercasedQuery) ||
              // @ts-ignore
              product?.barcode.includes(lowercasedQuery)) &&
            (selectedCategory === 'All' ||
              product.category === selectedCategory)
        );
        setFilteredProducts(filtered);
        setSearchSuggestions(
          filtered.slice(0, 5).map((product: Product) => product)
        );
      } else {
        setFilteredProducts(
          productServer?.filter(
            (product: Product) =>
              selectedCategory === 'All' ||
              product.category === selectedCategory
          )
        );
        setSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    setTransactions(orders);
    const filtered = customers?.filter(
      // @ts-ignore
      (customer) =>
        customer._id
          .toLowerCase()
          .includes(customerSearchQuery.toLowerCase()) ||
        customer.phone.includes(customerSearchQuery)
    );
    setFilteredCustomers(filtered);
  }, [customerSearchQuery]);

  const addToCart = useCallback((product: Product) => {
    // @ts-ignore
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item: Product) => item._id === product._id
      );
      if (existingItem) {
        return prevCart.map((item: Product) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    // setSelectedProduct(null);
    toast.success(`${product.name} added to cart`);
  }, []);

  const handleScan = async (scannedBarcode: string) => {
    if (!scannedBarcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }
    // setFormData((prev) => ({ ...prev, barcode: scannedBarcode }))
    const product = await fetchProductByBarcode(scannedBarcode, productServer);
    addToCart(product);
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

  const removeFromCart = useCallback((productId: string) => {
    setCart((cart) => cart.filter((item: Product) => item._id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, newQuantity: Number) => {
      if (newQuantity === 0) {
        removeFromCart(productId);
      } else {
        // @ts-ignore
        setCart((cart) =>
          cart.map((item: Product) =>
            item._id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    },
    [removeFromCart]
  );

  const calculateSubtotal = useCallback(() => {
    return cart.reduce(
      (total, item: Product) => total + item.sellPrice * item.quantity,
      0
    );
  }, [cart]);

  const calculateDiscount = useCallback(() => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return subtotal * (parseFloat(discountValue) / 100);
    } else {
      return parseFloat(discountValue) || 0;
    }
  }, [calculateSubtotal, discountType, discountValue]);

  const calculateVAT = useCallback(() => {
    return (calculateSubtotal() - calculateDiscount()) * VAT_RATE;
  }, [calculateSubtotal, calculateDiscount]);

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() - calculateDiscount() + calculateVAT() || 0;
  }, [calculateSubtotal, calculateDiscount, calculateVAT]);

  const calculateChange = useCallback(() => {
    const total = calculateTotal();
    const received = parseFloat(cashReceived);
    return received >= total ? (received - total).toFixed(2) : '0.00';
  }, [calculateTotal, cashReceived]);

  const handleCheckout = useCallback(() => {
    setIsCheckoutDialogOpen(true);
  }, []);

  const processPayment = async () => {
    setIsProcessingPayment(true);

    // Simulate payment processing
    const newTransaction = {
      // id: `T${transactions.length + 1}`.padStart(4, '0'),
      user: currentCustomer ? currentCustomer : null,
      total: calculateTotal(),
      products: cart.map((item: Product) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: String(item.quantity)
      })),
      cashType: paymentMethod,
      vat: calculateVAT(),
      discount: calculateDiscount(),
      cookies
    };

    try {
      // console.log(newTransaction)
      const result = await sell(newTransaction);
      if ('error' in result) {
        toast.error('An error occurred during checkout');
        setIsProcessingPayment(false);
        resetSale();
        return;
      }
      toast.success('Order placed successfully');
      console.log(result);

      await refetch();

      setIsProcessingPayment(false);
      setIsSaleComplete(true);
    } catch (error) {
      toast.error('An unexpected error occurred during checkout');
    }

    // Update inventory

    // Update customer loyalty points
    // if (currentCustomer) {
    // const customerIndex = customers.findIndex(c => c._id === currentCustomer._id)
    // if (customerIndex !== -1) {
    //   customers[customerIndex].loyaltyPoints +=   Math.floor(calculateTotal())
    // }
    // }
  };

  const resetSale = useCallback(() => {
    setCart([]);
    setPaymentMethod('');
    setSelectedBank('');
    setCashReceived('');
    setIsSaleComplete(false);
    setIsCheckoutDialogOpen(false);
    setReceiptMethod('');
    setCurrentCustomer(null);
    setDiscountType('percentage');
    setDiscountValue('0');
    setNewCustomer({ name: '', phone: '', email: '' });
  }, []);

  const handleBarcodeSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      const scannedProduct = productServer?.find(
        (product: Product) => product.barcode === searchQuery
      );
      if (scannedProduct) {
        addToCart(scannedProduct);
        setSearchQuery('');
      } else {
        toast.error('Product not found');
      }
    },
    [searchQuery, addToCart]
  );

  const handleCustomerSearch = useCallback((query: any) => {
    const customer = customers?.find(
      // @ts-ignore
      (c) => c._id === query || c.phone === query
    );
    if (customer) {
      setCurrentCustomer(customer);
      setIsCustomerDialogOpen(false);
      toast.success('Customer found and selected');
    } else {
      toast.error('Customer not found');
    }
  }, []);

  const handleQuickRegister = useCallback(
    (customerData: Customer) => {
      // Demo authentication
      // if (authCode !== '1234') {
      //   toast.error('Invalid authentication code')
      //   return
      // }

      const newCustomer = {
        ...customerData,
        loyaltyPoints: 0
      };
      // customers.push(newCustomer)
      //@ts-ignore
      setCurrentCustomer(newCustomer);
      setIsCustomerDialogOpen(false);
      toast.success('Customer registered successfully');
      setAuthCode('');
      setIsAuthCodeSent(false);
    },
    [authCode]
  );

  const findProduct = (prod: Product) => {
    const orig = productServer?.find(
      // @ts-ignore
      (product) => product._id === prod.productId
    );
    return orig.price;
  };

  const handleReturnSearch = useCallback(() => {
    const transaction = orders?.find(
      // @ts-ignore
      (t: Product) => t.invoiceNumber === returnInvoice
    );

    if (transaction) {
      // console.log(transaction)
      setReturnItems(
        // @ts-ignore
        transaction.products.map((item) => ({
          ...item,
          returnQuantity: 0,
          status: transaction.status,
          eachDiscount: transaction.eachDiscount,
          originalPrice: findProduct(item),
          revenue: transaction.revenue
        }))
      );
      setReturnUser(transaction.user);
      setReturnDate(transaction.createdAt);
      setReturnDiscount(transaction.discount);
      setReturnPaymentType(transaction.cashType);
      setReturnTotalAmount(transaction.totalAmount);
    } else {
      toast.error('Invoice not found');
    }
  }, [returnInvoice, orders]);

  const calculateAfterReturnAmount = useMemo(() => {
    const itemsToReturn = returnItems.filter(
      // @ts-ignore
      (item: Product) => item.returnQuantity > 0
    );

    let total = itemsToReturn.reduce(
      // @ts-ignore
      (total, item) => total + item.price * Number(item.returnQuantity),
      0
    );

    const calculateEachDiscount = itemsToReturn.reduce(
      // @ts-ignore
      (total, item) => total + item.eachDiscount * Number(item.returnQuantity),
      0
    );
    console.log(calculateEachDiscount);
    // let total = itemsToReturn.reduce((total, item) => total + Number(item.returnQuantity) *  )
    total -= calculateEachDiscount;
    total += total * 0.05;
    setAfterReturnAmount(total);
  }, [returnItems]);

  const handleReturnSubmit = async () => {
    setIsProcessingRefund(true);
    const itemsToReturn = returnItems.filter(
      // @ts-ignore
      (item: Product) => item.returnQuantity > 0
    );
    if (itemsToReturn.length === 0) {
      toast.error('No items selected for return');
      return;
    }

    const calculateRevenue = itemsToReturn.reduce(
      (total, item) =>
        total +
        // @ts-ignore
        (item.price * item.returnQuantity -
          // @ts-ignore
          item.originalPrice * item.returnQuantity),
      0
    );
    const returnTotal = itemsToReturn.reduce(
      // @ts-ignore
      (total, item) => total + item.price * Number(item.returnQuantity),
      0
    );

    const returnDiscounts = itemsToReturn.reduce(
      // @ts-ignore
      (total, item) => total + item.eachDiscount,
      0
    );

    let total = Number(returnTotal.toFixed(2));
    total += total * 0.05;
    total -= returnDiscounts;

    // console.log(calculateRevenue - returnDiscounts)

    setAfterReturnAmount(total);
    try {
      const result = await updateOrder({
        data: {
          products: itemsToReturn,
          invoiceNumber: returnInvoice,
          amount: afterReturnAmount,
          rev: calculateRevenue - returnDiscounts
        },
        cookies
      }).unwrap();

      if ('error' in result) {
        throw new Error(result.error);
      }

      console.log(total);

      toast.success(`Return processed. Refund amount: $${afterReturnAmount}`);
      await refetch();
    } catch (error) {
      toast.error(
        // @ts-ignore
        `Error processing refund: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsProcessingRefund(false);
      setReturnItems([]);
      setReturnInvoice('');
      setIsReturnDialogOpen(false);
    }
    // Process return
    // const newTransaction = {
    //   customerId: currentCustomer ? currentCustomer._id : null,
    //   date: new Date().toISOString().split('T')[0],
    //   total: -returnTotal, // Negative value for refunds
    //   items: itemsToReturn.map(item => ({
    //     id: item._id,
    //     name: item.name,
    //     price: item.sellPrice,
    //     quantity: -item.returnQuantity // Negative quantity for refunds
    //   })),
    //   paymentMethod: 'Refund',
    //   vat: -returnTotal * VAT_RATE,
    //   discount: 0,
    //   type: 'refund',
    // }
    // setTransactions(prev => [...prev, newTransaction])

    // Update inventory
    // productServer?.forEach((product: Product) => {
    //   const returnItem = itemsToReturn.find(item => item._id === product._id)
    //   if (returnItem) {
    //     product.quantity += returnItem.returnQuantity
    //   }
    // })
  };

  const handlePayment = () => {
    if (
      paymentMethod === 'Cash' &&
      parseFloat(cashReceived) < calculateTotal()
    ) {
      toast.error('Insufficient cash received');
      return;
    }
    if (paymentMethod === 'Bank' && !selectedBank) {
      toast.error('Please select a bank');
      return;
    }
    processPayment();
  };

  const filteredTransactions = useMemo(() => {
    // @ts-ignore
    return orders?.filter((transaction) => {
      const matchesSearch =
        transaction.invoiceNumber
          .toLowerCase()
          .includes(transactionSearchQuery.toLowerCase()) ||
        (transaction.user.phone &&
          transaction.user.phone
            .toLowerCase()
            .includes(transactionSearchQuery.toLowerCase()));
      const matchesType =
        transactionTypeFilter === 'all' ||
        transaction.status === transactionTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [orders, transactionSearchQuery, transactionTypeFilter]);

  const sortedTransactions =
    filteredTransactions &&
    [...filteredTransactions].sort((a, b) => {
      if (sortConfig.key === null) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

  // @ts-ignore
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const isRefundButtonDisabled = useMemo(() => {
    return (
      !returnItems ||
      returnItems.every(
        // @ts-ignore
        (product) => product.status === 'Refunded'
      )
    );
  }, [returnItems, orders]);

  const handleCameraCapture = () => {
    // Simulating barcode capture
    const randomProduct =
      productServer[Math.floor(Math.random() * productServer.length)];
    addToCart(randomProduct);
    setIsCameraOpen(false);
    toast.success(`${randomProduct.name} added to cart`);
  };

  // @ts-ignore
  const handleSearchSuggestionClick = (product) => {
    addToCart(product);
    setSearchQuery('');
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate loading more products
    setTimeout(() => {
      const moreProducts = productServer;
      // @ts-ignore
      setFilteredProducts((prevProducts) => [...prevProducts, ...moreProducts]);
      setIsLoadingMore(false);
    }, 1000);
  };

  // @ts-ignore
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map(
      (
        // @ts-ignore
        part,
        // @ts-ignore
        index
      ) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index}>{part}</mark>
        ) : (
          part
        )
    );
  };

  const maskCustomerInfo = (
    // @ts-ignore
    info,
    // @ts-ignore
    type
  ) => {
    if (type === 'name') {
      const nameParts = info.split(' ');
      return `*** ${nameParts[nameParts.length - 1]}`;
    } else if (type === 'phone') {
      return `******${info.slice(-4)}`;
    } else if (type === 'email') {
      const [username, domain] = info.split('@');
      return `${username[0]}****@${domain}`;
    }
    return info;
  };

  const handleSendAuthCode = () => {
    // In a real application, this would send an authentication code to the user's phone
    setIsAuthCodeSent(true);
    toast.success('Authentication code sent to your phone');
  };

  const isProductInCart = (
    // @ts-ignore
    productId
  ) => {
    return cart.some(
      (item) =>
        // @ts-ignore
        item._id === productId
    );
  };

  return (
    <div className="flex h-screen flex-col ">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden  p-4">
        <div className="mx-auto max-w-7xl">
          {/* Search bar and function buttons */}
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4"
                />
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 transform"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {!isProductCatalogVisible && searchSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-300 shadow-lg">
                    {searchSuggestions.map((product: Product) => (
                      <div
                        key={product._id}
                        className="flex cursor-pointer items-center justify-between px-4 py-2"
                        onClick={() => handleSearchSuggestionClick(product)}
                      >
                        <div>
                          <div>{highlightMatch(product.name, searchQuery)}</div>
                          <div className="text-sm text-gray-500">
                            ${product.sellPrice.toFixed(2)}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReturnDialogOpen(true)}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTransactionHistoryOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                </Button>

                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setIsCameraActive(true)}
                >
                  {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                </Button>
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
                    />
                  </div>
                )}
                {currentCustomer ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <User className="mr-2 h-4 w-4" />
                        {
                          // @ts-ignore
                          maskCustomerInfo(currentCustomer.name, 'name')
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-2">
                        <p>
                          <strong>ID:</strong>{' '}
                          {
                            // @ts-ignore
                            currentCustomer._id
                          }
                        </p>
                        <p>
                          <strong>Phone:</strong>{' '}
                          {
                            // @ts-ignore
                            maskCustomerInfo(currentCustomer.phone, 'phone')
                          }
                        </p>
                        <p>
                          <strong>Email:</strong>{' '}
                          {
                            // @ts-ignore
                            maskCustomerInfo(currentCustomer.email, 'email')
                          }
                        </p>
                        <p>
                          <strong>Loyalty Points:</strong>{' '}
                          {
                            // @ts-ignore
                            currentCustomer.loyaltyPoints
                          }
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setCurrentCustomer(null)}
                        >
                          Change Customer
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomerDialogOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Product search results and cart */}
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Product search results */}
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Product Catalog</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsProductCatalogVisible(!isProductCatalogVisible)
                      }
                    >
                      {isProductCatalogVisible ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {isProductCatalogVisible && (
                    <div className="flex items-center space-x-2">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardHeader>
                {isProductCatalogVisible && (
                  <CardContent>
                    <ScrollArea
                      className="h-[calc(100vh-300px)]"
                      ref={searchResultsRef}
                    >
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {filteredProducts?.map((product) => (
                          <motion.div
                            key={
                              // @ts-ignore
                              product._id
                            }
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Button
                              onClick={() => addToCart(product)}
                              className="relative flex h-24 w-full flex-col items-center justify-center p-2 text-center"
                              variant="outline"
                            >
                              <div className="text-sm font-medium">
                                {highlightMatch(
                                  // @ts-ignore
                                  product.name,
                                  searchQuery
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                $
                                {
                                  // @ts-ignore
                                  product.sellPrice.toFixed(2)
                                }
                              </div>
                              <div className="text-xs text-gray-400">
                                Stock:{' '}
                                {
                                  // @ts-ignore
                                  product.quantity
                                }
                              </div>
                              {isProductInCart(
                                // @ts-ignore
                                product._id
                              ) && (
                                <Badge
                                  variant="secondary"
                                  className="absolute right-1 top-1"
                                >
                                  In Cart
                                </Badge>
                              )}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                      {isLoadingMore ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <Button
                          className="mt-4 w-full"
                          onClick={handleLoadMore}
                        >
                          Load More
                        </Button>
                      )}
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Shopping cart */}
            <div className="h-screen w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Shopping Cart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <AnimatePresence>
                      {cart.map((item) => (
                        <motion.div
                          key={
                            // @ts-ignore
                            item._id
                          }
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="mb-4 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="font-medium">
                                {
                                  // @ts-ignore
                                  item.name
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                $
                                {
                                  // @ts-ignore
                                  item.sellPrice.toFixed(2)
                                }{' '}
                                each
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(
                                  // @ts-ignore
                                  item._id,
                                  // @ts-ignore
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span>
                              {
                                // @ts-ignore
                                item.quantity
                              }
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                // @ts-ignore
                                updateQuantity(item._id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                // @ts-ignore
                                removeFromCart(item._id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </ScrollArea>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT ({(VAT_RATE * 100).toFixed(0)}%):</span>
                      <span>${calculateVAT().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>${calculateDiscount().toFixed(2) || 0}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex space-x-2">
                      <Select
                        value={discountType}
                        onValueChange={setDiscountType}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Discount Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          {/* <SelectItem value="fixed">Fixed Amount</SelectItem> */}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder={
                          discountType === 'percentage'
                            ? 'Discount %'
                            : 'Discount Amount'
                        }
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog
        open={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          {isProcessingPayment ? (
            <div className="flex h-40 flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="mt-4">Processing payment...</p>
            </div>
          ) : isSaleComplete ? (
            <div className="space-y-4">
              <div className="text-center">
                <Check className="mx-auto h-16 w-16 text-green-500" />
                <p className="mt-2 text-lg font-semibold">
                  Sale Completed Successfully
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Total:</strong> ${calculateTotal().toFixed(2)}
                </p>
                <p>
                  <strong>Payment Method:</strong> {paymentMethod}
                </p>
                {paymentMethod === 'Cash' && (
                  <>
                    <p>
                      <strong>Cash Received:</strong> ${cashReceived}
                    </p>
                    <p>
                      <strong>Change:</strong> ${calculateChange()}
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Receipt Options:</p>
                <Select value={receiptMethod} onValueChange={setReceiptMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select receipt method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="print">Print Receipt</SelectItem>
                    <SelectItem value="email">Email Receipt</SelectItem>
                    <SelectItem value="sms">SMS Receipt</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  onClick={() => {
                    toast.success(`Receipt sent via ${receiptMethod}`);
                    setIsCheckoutDialogOpen(false);
                    resetSale();
                  }}
                >
                  {receiptMethod === 'print' && (
                    <Printer className="mr-2 h-4 w-4" />
                  )}
                  {receiptMethod === 'email' && (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  {receiptMethod === 'sms' && (
                    <Smartphone className="mr-2 h-4 w-4" />
                  )}
                  Send Receipt
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Checkout</DialogTitle>
                <DialogDescription>Complete your purchase</DialogDescription>
              </DialogHeader>
              {currentCustomer ? (
                <div className="space-y-2  rounded-md p-4">
                  <p>
                    <strong>Name:</strong>{' '}
                    {
                      // @ts-ignore
                      maskCustomerInfo(currentCustomer.name, 'name')
                    }
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    {
                      // @ts-ignore
                      maskCustomerInfo(currentCustomer.phone, 'phone')
                    }
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {
                      // @ts-ignore
                      maskCustomerInfo(currentCustomer.email, 'email')
                    }
                  </p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsCustomerDialogOpen(true)}
                >
                  Add Customer (Optional)
                </Button>
              )}
              <div className="space-y-4">
                <Label>Select Payment Method</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    className="flex h-24 flex-col items-center justify-center"
                    variant={paymentMethod === 'Cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Cash')}
                  >
                    <DollarSign className="mb-2 h-8 w-8" />
                    Cash
                  </Button>
                  <Button
                    className="flex h-24 flex-col items-center justify-center"
                    variant={paymentMethod === 'Bank' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Bank')}
                  >
                    <Building2 className="mb-2 h-8 w-8" />
                    Bank
                  </Button>
                  <Button
                    className="flex h-24 flex-col items-center justify-center"
                    variant={paymentMethod === 'Mobile' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Mobile')}
                  >
                    <Smartphone className="mb-2 h-8 w-8" />
                    Mobile
                  </Button>
                </div>
                {paymentMethod === 'Cash' && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="cashReceived">Cash Received:</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Enter amount"
                    />
                    <div className="text-lg font-semibold">
                      Change: ${calculateChange()}
                    </div>
                  </div>
                )}
                {paymentMethod === 'Bank' && (
                  <div className="mt-4 space-y-2">
                    <Select
                      value={selectedBank}
                      onValueChange={setSelectedBank}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {localBanks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentCustomer && (
                      <Input
                        placeholder="Phone Number"
                        value={
                          // @ts-ignore
                          maskCustomerInfo(currentCustomer.phone, 'phone')
                        }
                        disabled
                      />
                    )}
                  </div>
                )}
                {paymentMethod === 'Mobile' && (
                  <div className="mt-4 space-y-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Mobile Payment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="evc">EVC</SelectItem>
                        <SelectItem value="zaad">Zaad</SelectItem>
                        <SelectItem value="sahal">Sahal</SelectItem>
                      </SelectContent>
                    </Select>
                    {currentCustomer ? (
                      <Input
                        placeholder="Phone Number"
                        value={
                          // @ts-ignore
                          maskCustomerInfo(currentCustomer.phone, 'phone')
                        }
                        disabled
                      />
                    ) : (
                      <Input placeholder="Enter mobile number" />
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCheckoutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handlePayment} disabled={!paymentMethod}>
                  Complete Payment
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customer Management</DialogTitle>
            <DialogDescription>
              Search for an existing customer or register a new one.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="register">Quick Register</TabsTrigger>
            </TabsList>
            <TabsContent value="search">
              <div className="mt-4 space-y-4">
                <Input
                  placeholder="Enter customer ID or phone number"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                />
                <Button
                  onClick={() => handleCustomerSearch(customerSearchQuery)}
                >
                  Search
                </Button>
                <ScrollArea className="h-[200px]">
                  {filteredCustomers?.map((customer) => (
                    <Button
                      // @ts-ignore
                      key={customer._id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setCurrentCustomer(customer);
                        setIsCustomerDialogOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {
                        // @ts-ignore
                        customer.name
                      }{' '}
                      -{' '}
                      {
                        // @ts-ignore
                        maskCustomerInfo(customer.phone, 'phone')
                      }
                    </Button>
                  ))}
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent value="register">
              <div className="mt-4 space-y-4">
                <Input
                  placeholder="Name"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Phone Number"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
                <Input
                  placeholder="Email (optional)"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                />
                {/* {!isAuthCodeSent ? (
                  <Button onClick={handleSendAuthCode}>Send Authentication Code</Button>
                ) : (
                  <>
                    <Input
                      placeholder="Enter 4-digit code"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      maxLength={4}
                    />
                   
                  </>
                )} */}
                <Button
                  onClick={() => {
                    // @ts-ignore
                    handleQuickRegister(newCustomer);
                  }}
                >
                  Register
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog
        open={isTransactionDetailsOpen}
        onOpenChange={setIsTransactionDetailsOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View detailed information about the selected transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <p className="font-medium">
                    {
                      // @ts-ignore
                      selectedTransaction.invoiceNumber
                    }
                  </p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">
                    {
                      // @ts-ignore
                      selectedTransaction.updatedAt.split('T')[0]
                    }
                  </p>
                </div>
                <div>
                  <Label>Customer</Label>
                  <p className="font-medium">
                    {
                      // @ts-ignore
                      selectedTransaction.user.name || 'Guest'
                    }
                  </p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium">
                    {
                      // @ts-ignore
                      selectedTransaction.cashType
                    }
                  </p>
                </div>
              </div>
              <div>
                <Label>Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransaction.products.map((item) => (
                      // @ts-ignore
                      <TableRow key={item.id}>
                        <TableCell>
                          {
                            // @ts-ignore
                            item.product
                          }
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    $
                    {
                      // @ts-ignore
                      // @ts-ignore
                      // @ts-ignore
                      (
                        selectedTransaction.totalAmount -
                        // @ts-ignore
                        selectedTransaction.vat +
                        // @ts-ignore
                        selectedTransaction.discount
                      ).toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>
                    $
                    {
                      // @ts-ignore
                      selectedTransaction.vat.toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>
                    $
                    {
                      // @ts-ignore
                      selectedTransaction.discount.toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span
                    className={
                      // @ts-ignore
                      selectedTransaction.status === 'Refunded'
                        ? 'text-red-500'
                        : ''
                    }
                  >
                    {
                      // @ts-ignore
                      selectedTransaction.status === 'Refunded' ? '-' : ''
                    }
                    $
                    {
                      // @ts-ignore
                      Math.abs(selectedTransaction.totalAmount).toFixed(2)
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsTransactionDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Returns Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Process Returns</DialogTitle>
            <DialogDescription>
              Search for a transaction and select items to return.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter Invoice Number"
                value={returnInvoice}
                onChange={(e) => setReturnInvoice(e.target.value)}
              />
              <Button onClick={handleReturnSearch}>Search</Button>
            </div>

            {returnItems.length > 0 && (
              <>
                <div className="grid gap-2 text-sm sm:text-base">
                  <div>
                    <strong>Customer:</strong>{' '}
                    {
                      // @ts-ignore
                      returnUser.name
                    }
                  </div>
                  <div>
                    <strong>Phone:</strong>{' '}
                    {
                      // @ts-ignore
                      returnUser.phone
                    }
                  </div>
                  <div>
                    <strong>Email:</strong>{' '}
                    {
                      //@ts-ignore
                      returnUser.email
                    }
                  </div>
                  <div>
                    <strong>Date:</strong>{' '}
                    {new Date(returnDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>Payment Method:</strong> {returnPaymentType}
                  </div>
                  <div>
                    <strong>Total Amount:</strong> $
                    {returnTotalAmount.toFixed(2)}
                  </div>
                  <div>
                    <strong>Discount:</strong> {returnDiscount}$
                  </div>
                  <div>Amount to be returned {afterReturnAmount}</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Return Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnItems.map((item) => (
                      <TableRow
                        key={
                          // @ts-ignore
                          item._id
                        }
                      >
                        <TableCell>
                          {
                            // @ts-ignore
                            item.product
                          }
                        </TableCell>
                        <TableCell>
                          $
                          {
                            // @ts-ignore
                            item.price.toFixed(2)
                          }
                        </TableCell>
                        <TableCell>
                          {
                            // @ts-ignore
                            item.quantity
                          }
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={
                              // @ts-ignore
                              item.quantity
                            }
                            value={
                              // @ts-ignore
                              item.returnQuantity
                            }
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value);
                              if (
                                // @ts-ignore
                                newValue <= item.quantity
                              ) {
                                const newReturnItems = returnItems.map((i) =>
                                  // @ts-ignore
                                  i.productId === item.productId
                                    ? {
                                        // @ts-ignore
                                        ...i,
                                        returnQuantity: newValue
                                      }
                                    : i
                                );
                                // @ts-ignore
                                setReturnItems(newReturnItems);
                                calculateAfterReturnAmount;
                              }
                            }}
                            onKeyPress={(e) => {
                              if (
                                // @ts-ignore
                                e.key === 'ArrowUp' &&
                                // @ts-ignore
                                item.returnQuantity >= item.quantity
                              ) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
            {returnItems.length > 0 && (
              <Button
                disabled={isProcessingRefund || isRefundButtonDisabled}
                onClick={handleReturnSubmit}
              >
                {' '}
                {isRefundButtonDisabled ? 'Already Refunded' : 'Process Return'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog
        open={isTransactionHistoryOpen}
        onOpenChange={setIsTransactionHistoryOpen}
      >
        <DialogContent className="flex h-[90vh] flex-col sm:max-w-[90vw] md:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>
              View and search past transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-grow flex-col space-y-4 overflow-hidden">
            <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
              <Input
                placeholder="Search transactions..."
                className="w-full md:w-64"
                value={transactionSearchQuery}
                onChange={(e) => setTransactionSearchQuery(e.target.value)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal md:w-[240px]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    // @ts-ignore
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Select
              value={transactionTypeFilter}
              onValueChange={setTransactionTypeFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="Refunded">Refunds</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-grow overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <Button variant="ghost" onClick={() => requestSort('id')}>
                        Invoice
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort('date')}
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort('totalAmount')}
                      >
                        Total
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    {/* <TableHead>Type</TableHead> */}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {// @ts-ignore
                  sortedTransactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {transaction.updatedAt.split('T')[0]}
                      </TableCell>
                      <TableCell>{transaction.user.name || 'Guest'}</TableCell>
                      <TableCell
                        className={`text-right ${
                          transaction.status === 'Refunded'
                            ? 'text-red-500'
                            : ''
                        }`}
                      >
                        {transaction.status === 'Refunded' ? '-' : ''}$
                        {Math.abs(transaction.totalAmount).toFixed(2)}
                      </TableCell>
                      {/* <TableCell>
                        <Badge variant={transaction.type === 'sale' ? 'default' : 'destructive'}>
                          {transaction.type === 'sale' ? 'Sale' : 'Refund'}
                        </Badge>
                      </TableCell> */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log(transaction);
                            setSelectedTransaction(transaction);
                            setIsTransactionDetailsOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>
              Use your device camera to scan a product barcode.
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-64 flex-col items-center justify-center  rounded-lg">
            <Camera className="mb-4 h-16 w-16 text-gray-400" />
            <p className="text-sm text-gray-500">
              Camera preview would appear here
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCameraOpen(false)}>
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => setIsCameraActive(!isCameraActive)}
            >
              {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
