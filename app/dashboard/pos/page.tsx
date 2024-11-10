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
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

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
  const [accumulatedKeystrokes, setAccumulatedKeystrokes] = useState('');
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState(0);
  const [isReceiptSent, setIsReceiptSent] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [guestGender, setGuestGender] = useState<string>('');
  const [page, setPage] = useState(1);
  const [valuePhoneNumber, setValuePhoneNumber] = useState();
  const ITEMS_PER_PAGE = 20;

  const VAT_RATE = 0.05; // 5% VAT rate

  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const discountInputRef = useRef<HTMLInputElement>(null);

  const {
    data: productServer,
    error: productsError,
    isFetching,
    refetch: refetchProducts,
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
  }, []);

  useEffect(() => {
    //@ts-ignore
    if (productsError?.data?.message === 'Token expired') {
      deleteAuthCookie();
    }
  }, [productsError]);

  const categories = useMemo(
    // @ts-ignore
    () => [...new Set(productServer?.map((product) => product.category))],
    [productServer]
  );

  useEffect(() => {
    if (productServer) {
      const filtered = productServer.filter(
        (product: Product) =>
          (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.barcode?.includes(searchQuery)) &&
          (selectedCategory === 'All' || product.category === selectedCategory)
      );
      setFilteredProducts(filtered);
      setPage(1); // Reset page when filters change
    }
  }, [productServer, searchQuery, selectedCategory]);

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
  }, [customerSearchQuery, customers]);

  const paginatedProducts = useMemo(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, page]);

  const addToCart = useCallback((product: Product) => {
    // @ts-ignore
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          // @ts-ignore
          item._id === product._id
      );

      if (existingItem) {
        // @ts-ignore
        if (existingItem.quantity >= product.quantity) {
          toast.error(`Cannot add more ${product.name}. Stock limit reached.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          // @ts-ignore
          item._id === product._id
            ? {
                // @ts-ignore
                ...item,
                // @ts-ignore
                quantity: Math.min(item.quantity + 1, product.quantity)
              }
            : item
        );
      } else {
        if (product.quantity === 0) {
          toast.error(`${product.name} is out of stock.`);
          return prevCart;
        }
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          // @ts-ignore
          item._id !== productId
      )
    );
  }, []);

  const handleBarcodeSubmit = useCallback(
    //@ts-ignore
    (e) => {
      e.preventDefault();
      const barcodeToSearch = inputFocused
        ? searchQuery
        : accumulatedKeystrokes;
      const scannedProduct = productServer?.find(
        //@ts-ignore
        (product) => product.barcode === barcodeToSearch
      );
      if (scannedProduct) {
        addToCart(scannedProduct);
        setSearchQuery('');
        setAccumulatedKeystrokes('');
      } else {
        toast.error('Product not found');
      }
    },
    [searchQuery, accumulatedKeystrokes, addToCart, inputFocused, productServer]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!inputFocused && e.key.length === 1) {
        setAccumulatedKeystrokes((prev) => prev + e.key);
        setLastKeystrokeTime(Date.now());
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!inputFocused && e.key === 'Enter') {
        handleBarcodeSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [inputFocused, handleBarcodeSubmit]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Date.now() - lastKeystrokeTime > 100 && !inputFocused) {
        setSearchQuery(accumulatedKeystrokes);
        setAccumulatedKeystrokes('');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [accumulatedKeystrokes, lastKeystrokeTime, inputFocused]);

  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      // @ts-ignore
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) => {
          // @ts-ignore
          if (item._id === productId) {
            const product = productServer.find(
              // @ts-ignore
              (p) => p._id === productId
            );
            if (!product) {
              toast.error('Product not found in inventory.');
              return item;
            }
            if (newQuantity > product.quantity) {
              toast.error(
                `Cannot add more ${
                  // @ts-ignore
                  item.name
                }. Stock limit reached.`
              );
              return item;
            }
            return {
              // @ts-ignore
              ...item,
              quantity: newQuantity
            };
          }
          return item;
        });
        return updatedCart.filter((item) => item.quantity > 0);
      });
    },
    [productServer]
  );

  const calculateSubtotal = useCallback(() => {
    return cart.reduce(
      (total, item: Product) => total + item.sellPrice * item.quantity,
      0
    );
  }, [cart]);

  const calculateDiscount = useCallback(() => {
    // const subtotal = calculateSubtotal();

    return parseFloat(discountValue) || 0;
  }, [discountValue]);

  const calculateVAT = useCallback(() => {
    return (calculateSubtotal() - calculateDiscount()) * VAT_RATE;
  }, [calculateSubtotal, calculateDiscount]);

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() - calculateDiscount() + calculateVAT() || 0;
  }, [calculateSubtotal, calculateDiscount, calculateVAT]);

  const calculateChange = useCallback(() => {
    const total = calculateTotal();
    const received = parseFloat(cashReceived);
    // console.log(received >= total && (received - total).toFixed(2));
    return received >= total && (received - total).toFixed(2);
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
    // console.log(newTransaction);

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
      // console.log(result);
      await refetchProducts();
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

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearchQuery(e.target.value);
  };

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
    // console.log(calculateEachDiscount);
    // let total = itemsToReturn.reduce((total, item) => total + Number(item.returnQuantity) *  )
    total -= calculateEachDiscount;
    total += total * 0.05;
    setAfterReturnAmount(total);
  }, [returnItems]);

  const handleReturnSubmit = async () => {
    setIsProcessingRefund(true);
    // console.log(returnItems);
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
    console.log(itemsToReturn);
    // console.log(returnUser)
    try {
      const result = await updateOrder({
        data: {
          products: itemsToReturn,
          invoiceNumber: returnInvoice,
          user: returnUser,
          amount: afterReturnAmount,
          rev: calculateRevenue - returnDiscounts
        },
        cookies
      }).unwrap();

      if ('error' in result) {
        throw new Error(result.error);
      }

      // console.log(total);

      toast.success(`Return processed. Refund amount: $${afterReturnAmount}`);
      await refetch();
      await refetchProducts();
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

    //
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
    if (
      !paymentMethod ||
      (!parseFloat(cashReceived) && paymentMethod === 'Cash')
    ) {
      toast.error('Please select a payment method and cash received');
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
      if (sortConfig.key === null) return -1;
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
    // console.log(returnItems)
    return (
      !returnItems ||
      returnItems.every(
        // @ts-ignore
        (product) => product.status === 'Refunded'
      )
    );
  }, [returnItems, orders]);

  // @ts-ignore
  const handleSearchSuggestionClick = (product) => {
    addToCart(product);
    setSearchQuery('');
  };

  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);
  const hasMoreProducts = paginatedProducts.length < filteredProducts.length;

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

  // Render cart items
  const renderCartItems = () => {
    return cart.map((item) => (
      <div
        key={
          // @ts-ignore
          item._id
        }
        className="flex items-center justify-between py-2"
      >
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
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              // @ts-ignore
              updateQuantity(item._id, item.quantity - 1)
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
            onClick={() =>
              // @ts-ignore
              removeFromCart(item._id)
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex h-screen flex-col text-base">
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
      <main className="flex-1 overflow-y-hidden p-4">
        <div className="mx-auto max-w-7xl">
          {/* Search bar and function buttons */}
          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className="w-full py-2 pl-10 pr-4 text-base"
                />
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 transform"
                    onClick={() => {
                      setSearchQuery('');
                      setAccumulatedKeystrokes('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => setIsReturnDialogOpen(true)}
                >
                  <RefreshCcw className="mr-1 h-4 w-4" />
                  Return
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => setIsTransactionHistoryOpen(true)}
                >
                  <FileText className="mr-1 h-4 w-4" />
                  History
                </Button>
                {currentCustomer ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="text-sm">
                        <User className="mr-1 h-4 w-4" />
                        {
                          // @ts-ignore
                          maskCustomerInfo(currentCustomer.name, 'name')
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-2 text-sm">
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
                          className="w-full text-sm"
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
                    className="text-sm"
                    onClick={() => setIsCustomerDialogOpen(true)}
                  >
                    <UserPlus className="mr-1 h-4 w-4" />
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
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Product Catalog</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm"
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
                        defaultValue="All"
                      >
                        <SelectTrigger className="w-[120px] text-sm">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
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
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {paginatedProducts?.map((product: Product) => (
                          <motion.div
                            key={product._id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Button
                              onClick={() => addToCart(product)}
                              className="relative flex h-24 w-full flex-col items-center justify-center p-1 text-center"
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
                                  className="absolute right-1 top-1 text-xs"
                                >
                                  In Cart
                                </Badge>
                              )}
                            </Button>
                          </motion.div>
                        ))}
                      </div>

                      {hasMoreProducts && (
                        <Button
                          className="mt-4 w-full text-sm"
                          onClick={handleLoadMore}
                          disabled={isFetching}
                        >
                          {isFetching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      )}
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Shopping cart */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-xl">
                    Shopping Cart{' '}
                    <span className="float-right text-base">
                      {' '}
                      {cart.length}{' '}
                    </span>{' '}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[calc(100vh-450px)] overflow-y-auto">
                    <AnimatePresence>{renderCartItems()}</AnimatePresence>
                  </div>
                  <div className="mt-4 space-y-1 text-base">
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
                      <Input
                        type="number"
                        placeholder={'Discount Amount'}
                        value={discountValue}
                        ref={discountInputRef}
                        onChange={(e) => {
                          setDiscountValue(e.target.value);
                          e.stopPropagation();
                        }}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        className="text-base"
                      />
                    </div>
                    <Button
                      className="w-full text-base"
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
        onOpenChange={(open) => {
          if (!open && !isReceiptSent && isSaleComplete) {
            // Prevent closing if receipt is not sent
            return;
          }
          setIsCheckoutDialogOpen(open);
          if (!open) {
            setIsReceiptSent(false);
          }
        }}
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
              <div className="space-y-2 text-sm">
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select receipt method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="print">Print Receipt</SelectItem>
                    <SelectItem value="email">Email Receipt</SelectItem>
                    <SelectItem value="sms">SMS Receipt</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full text-sm"
                  onClick={() => {
                    toast.success(`Receipt sent via ${receiptMethod}`);
                    setIsReceiptSent(true);
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
                <div className="space-y-2 rounded-md p-4 text-sm">
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
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => setIsCustomerDialogOpen(true)}
                  >
                    Add Customer (Optional)
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                <Label className="text-sm">Select Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    className="flex h-20 flex-col items-center justify-center text-xs"
                    variant={paymentMethod === 'Cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Cash')}
                  >
                    <DollarSign className="mb-1 h-6 w-6" />
                    Cash
                  </Button>
                  <Button
                    className="flex h-20 flex-col items-center justify-center text-xs"
                    variant={paymentMethod === 'Bank' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Bank')}
                  >
                    <Building2 className="mb-1 h-6 w-6" />
                    Bank
                  </Button>
                  <Button
                    className="flex h-20 flex-col items-center justify-center text-xs"
                    variant={paymentMethod === 'Mobile' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Mobile')}
                  >
                    <Smartphone className="mb-1 h-6 w-6" />
                    Mobile
                  </Button>
                </div>
                {paymentMethod === 'Cash' && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="cashReceived" className="text-sm">
                      Cash Received:
                    </Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Enter amount"
                      className="text-sm"
                    />
                    <div className="text-base font-semibold">
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
                      <SelectTrigger className="text-sm">
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
                        className="text-sm"
                      />
                    )}
                  </div>
                )}
                {paymentMethod === 'Mobile' && (
                  <div className="mt-4 space-y-2">
                    <Select>
                      <SelectTrigger className="text-sm">
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
                        className="text-sm"
                      />
                    ) : (
                      // @ts-ignore
                      <PhoneInput
                        defaultCountry="SO"
                        placeholder="Enter phone number"
                        value={valuePhoneNumber}
                        // @ts-ignore
                        onChange={setValuePhoneNumber}
                        className="text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCheckoutDialogOpen(false)}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={
                    !paymentMethod ||
                    (paymentMethod === 'Cash' &&
                      parseFloat(cashReceived) < calculateTotal()) ||
                    (paymentMethod === 'Bank' && !selectedBank) ||
                    (paymentMethod === 'Mobile' && !valuePhoneNumber)
                  }
                  className="text-sm"
                >
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
              <TabsTrigger value="search" className="text-xs">
                Search
              </TabsTrigger>
              <TabsTrigger value="register" className="text-xs">
                Quick Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="search">
              <div className="mt-4 space-y-4">
                <Input
                  placeholder="Enter customer ID or phone number"
                  value={customerSearchQuery}
                  onChange={(e) => {
                    // setCustomerSearchQuery(e.target.value);
                    handleCustomerSearch(e);
                    e.stopPropagation();
                  }}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className="text-sm"
                />
                {/* <Button
                onClick={() => handleCustomerSearch(customerSearchQuery)}
                className="w-full text-sm"
              >
                Search
              </Button> */}
                <ScrollArea className="h-[200px]">
                  {filteredCustomers?.map((customer) => (
                    <Button
                      // @ts-ignore
                      key={customer._id}
                      variant="ghost"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        setCurrentCustomer(customer);
                        setIsCustomerDialogOpen(false);
                      }}
                    >
                      <User className="mr-2 h-3 w-3" />
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
                  className="text-sm"
                />
                {
                  // @ts-ignore
                  <PhoneInput
                    defaultCountry="SO"
                    international
                    withCountryCallingCode
                    placeholder="Phone number"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        // @ts-ignore
                        phone: e
                      })
                    }
                    className="input-phone text-sm"
                  />
                }
                <Input
                  placeholder="Email (optional)"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="text-sm"
                />
                <Button
                  onClick={() => {
                    // @ts-ignore
                    handleQuickRegister(newCustomer);
                  }}
                  className="w-full text-sm"
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
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs">Quantity</TableHead>
                      {selectedTransaction.status === 'Refunded' && (
                        <TableHead className="text-xs">
                          Returned Quantity
                        </TableHead>
                      )}
                      <TableHead className="text-xs">Price</TableHead>
                      <TableHead className="text-xs">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransaction.products.map((item) => (
                      // @ts-ignore
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">
                          {
                            // @ts-ignore
                            item.product
                          }
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.quantity}
                        </TableCell>
                        {selectedTransaction.status === 'Refunded' && (
                          <TableCell className="text-xs">
                            {
                              // @ts-ignore
                              item.returnQuantity
                            }
                          </TableCell>
                        )}
                        <TableCell className="text-xs">
                          ${item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    $
                    {
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
            <Button
              onClick={() => setIsTransactionDetailsOpen(false)}
              className="text-sm"
            >
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
                className="text-sm"
              />
              <Button onClick={handleReturnSearch} className="text-sm">
                Search
              </Button>
            </div>

            {returnItems.length > 0 && (
              <>
                <div className="grid gap-2 text-xs sm:text-sm">
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
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs">Price</TableHead>
                      <TableHead className="text-xs">Quantity</TableHead>
                      <TableHead className="text-xs">Return Quantity</TableHead>
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
                        <TableCell className="text-xs">
                          {
                            // @ts-ignore
                            item.product
                          }
                        </TableCell>
                        <TableCell className="text-xs">
                          $
                          {
                            // @ts-ignore
                            item.price.toFixed(2)
                          }
                        </TableCell>
                        <TableCell className="text-xs">
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
                            className="w-16 text-xs"
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
                disabled={
                  isProcessingRefund ||
                  isRefundButtonDisabled ||
                  // @ts-ignore
                  returnUser.name === 'Guest'
                }
                onClick={handleReturnSubmit}
                className="w-full text-sm"
              >
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
                className="w-full text-sm md:w-64"
                value={transactionSearchQuery}
                onChange={(e) => setTransactionSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={transactionTypeFilter}
              onValueChange={setTransactionTypeFilter}
            >
              <SelectTrigger className="w-full text-sm md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="Refunded">Refunds</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-grow overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort('invoiceNumber')}
                        className="text-xs"
                      >
                        Invoice
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort('updatedAt')}
                        className="text-xs"
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort('totalAmount')}
                        className="text-xs"
                      >
                        Total
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {// @ts-ignore
                  sortedTransactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-xs font-medium">
                        {transaction.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs">
                        {transaction.updatedAt.split('T')[0]}
                      </TableCell>
                      <TableCell className="text-xs">
                        {transaction.user.name || 'Guest'}
                      </TableCell>
                      <TableCell
                        className={`text-right text-xs ${
                          transaction.status === 'Refunded'
                            ? 'text-red-500'
                            : ''
                        }`}
                      >
                        {transaction.status === 'Refunded' ? '-' : ''}$
                        {Math.abs(transaction.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            console.log(transaction);
                            setSelectedTransaction(transaction);
                            setIsTransactionDetailsOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-3 w-3" />
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
    </div>
  );
}
