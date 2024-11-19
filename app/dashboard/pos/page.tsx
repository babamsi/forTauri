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
  useUpdateOrderMutation,
  useRegisterCustomerMutation
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
import { format, parseISO } from 'date-fns';
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
  newBatch: boolean;
  newBatchQuantity: number;
  newBatchExpiration: string;
  expirationDate: string;
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

interface CartItem extends Product {
  isNewBatch: boolean;
  quantity: number;
}

// Mock data for products, customers, and transactions

const localBanks = [
  { id: 'B001', name: 'Salaam Bank' },
  { id: 'B002', name: 'Dahabshiil Bank' },
  { id: 'B003', name: 'Amal Bank' },
  { id: 'B004', name: 'Premier Bank' }
];

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export default function EnhancedPOSSystem() {
  const [cart, setCart] = useState<CartItem[]>([]);
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
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [batchAllocationDialog, setBatchAllocationDialog] = useState(false);

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
  const {
    data: customers,
    error: customersError,
    refetch: refetchCustomers
  } = useGetAllCustomerQuery(cookies);
  const { data: orders, refetch } = useGetOrdersQuery(cookies, {
    skip: !cookies
  });
  const [sell, { isLoading, isError: isSellError, isSuccess }] =
    useSelProductMutation();
  const [updateOrder, { isLoading: isUpdating, isError: updateError }] =
    useUpdateOrderMutation();

  const [registerCustomer, { isLoading: isCreatingCustomer }] =
    useRegisterCustomerMutation();

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
        (customer.name
          .toLowerCase()
          .includes(customerSearchQuery.toLowerCase()) &&
          customer.name != 'Guest') ||
        (customer.phone.includes(customerSearchQuery) &&
          customer.name != 'Guest')
    );
    setFilteredCustomers(filtered);
  }, [customerSearchQuery, customers]);

  const paginatedProducts = useMemo(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, page]);

  const addToCart = useCallback((product: Product) => {
    if (product.newBatch && product.newBatchQuantity > 0) {
      // @ts-ignore
      setSelectedProduct(product);
      setIsBatchDialogOpen(true);
    } else {
      // @ts-ignore
      addProductToCart(product);
    }
  }, []);

  // Add this function to handle quantity allocation between batches
  const handleQuantityAllocation = (
    totalQuantity: number,
    productId: string
  ) => {
    const product = cart.find((item) => item._id === productId);
    if (!product) return;

    const availableNewBatch = product.newBatchQuantity || 0;
    const availableCurrentBatch = product.quantity || 0;

    // If requested quantity is less than or equal to new batch quantity
    if (totalQuantity <= availableNewBatch) {
      updateQuantity(productId, true, totalQuantity);
      updateQuantity(productId, false, 0);
    } else {
      // Allocate maximum possible to new batch, rest to current batch
      const newBatchAllocation = Math.min(totalQuantity, availableNewBatch);
      const currentBatchAllocation = Math.min(
        totalQuantity - newBatchAllocation,
        availableCurrentBatch
      );

      updateQuantity(productId, true, newBatchAllocation);
      updateQuantity(productId, false, currentBatchAllocation);
    }

    setBatchAllocationDialog(false);
    setIsQuantityDialogOpen(false);
    setNewQuantity('');
  };

  const addProductToCart = useCallback(
    (product: Product, useNewBatch: boolean) => {
      setCart((prevCart) => {
        const existingCurrentBatchItem = prevCart.find(
          (item) => item._id === product._id && !item.isNewBatch
        );
        const existingNewBatchItem = prevCart.find(
          (item) => item._id === product._id && item.isNewBatch
        );

        const availableQuantity = useNewBatch
          ? product.newBatchQuantity
          : product.quantity;
        const existingItem = useNewBatch
          ? existingNewBatchItem
          : existingCurrentBatchItem;

        if (existingItem) {
          if (existingItem.quantity >= availableQuantity) {
            toast.error(
              `Cannot add more ${product.name} from ${
                useNewBatch ? 'new' : 'current'
              } batch. Stock limit reached.`
            );
            return prevCart;
          }
          return prevCart.map((item) =>
            item._id === product._id && item.isNewBatch === useNewBatch
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, availableQuantity)
                }
              : item
          );
        } else {
          if (availableQuantity === 0) {
            toast.error(
              `${product.name} is out of stock in the ${
                useNewBatch ? 'new' : 'current'
              } batch.`
            );
            return prevCart;
          }
          return [
            ...prevCart,
            { ...product, isNewBatch: useNewBatch, quantity: 1 }
          ];
        }
      });
    },
    []
  );

  const handleBatchSelection = useCallback(
    (useNewBatch: boolean) => {
      if (selectedProduct) {
        addProductToCart(selectedProduct, useNewBatch);
        setIsBatchDialogOpen(false);
        setSelectedProduct(null);
      }
    },
    [selectedProduct, addProductToCart]
  );

  const removeFromCart = useCallback(
    (productId: string, isNewBatch: boolean) => {
      setCart((prevCart) =>
        prevCart.filter(
          (item) => !(item._id === productId && item.isNewBatch === isNewBatch)
        )
      );
    },
    []
  );

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
    (productId: string, isNewBatch: boolean, newQuantity: number) => {
      setCart((prevCart) => {
        // Find the product in server data
        const product = productServer?.find(
          // @ts-ignore
          (p) => p._id === productId
        );
        if (!product) {
          toast.error(`Product not found in inventory.`);
          return prevCart;
        }

        // Get current cart items for this product
        const currentBatchItem = prevCart.find(
          (item) => item._id === productId && !item.isNewBatch
        );
        const newBatchItem = prevCart.find(
          (item) => item._id === productId && item.isNewBatch
        );

        // If trying to update new batch
        if (isNewBatch) {
          if (newQuantity <= product.newBatchQuantity) {
            // Update new batch quantity directly
            return prevCart
              .map((item) =>
                item._id === productId && item.isNewBatch
                  ? { ...item, quantity: newQuantity }
                  : item
              )
              .filter((item) => item.quantity > 0);
          } else {
            toast.error(
              `Cannot exceed new batch quantity (${product.newBatchQuantity})`
            );
            return prevCart;
          }
        } else {
          // Trying to update current batch
          if (newQuantity <= product.quantity) {
            // Update current batch quantity directly
            return prevCart
              .map((item) =>
                item._id === productId && !item.isNewBatch
                  ? { ...item, quantity: newQuantity }
                  : item
              )
              .filter((item) => item.quantity > 0);
          } else {
            toast.error(
              `Cannot exceed current batch quantity (${product.quantity})`
            );
            return prevCart;
          }
        }
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
    return calculateSubtotal() * VAT_RATE;
  }, [calculateSubtotal, calculateDiscount]);

  const calculateTotal = useCallback(() => {
    const total =
      calculateSubtotal() + calculateVAT() - calculateDiscount() || 0;
    return total;
  }, [calculateSubtotal, calculateDiscount, calculateVAT]);

  const calculateChange = useCallback(() => {
    const total = Math.round(calculateTotal() * 2) / 2;
    const received = parseFloat(cashReceived);
    // console.log(received >= total && (received - total).toFixed(2));
    return received >= total && (received - total).toFixed(2);
  }, [calculateTotal, cashReceived]);

  const handleCheckout = useCallback(() => {
    setIsCheckoutDialogOpen(true);
  }, []);

  const processPayment = async () => {
    setIsProcessingPayment(true);
    console.log(cart);
    // Simulate payment processing
    const newTransaction = {
      // id: `T${transactions.length + 1}`.padStart(4, '0'),
      user: currentCustomer ? currentCustomer : null,
      total: calculateTotal(),
      subtotal: calculateSubtotal(),
      products: cart.map((item: Product) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: String(item.quantity),
        // @ts-ignore
        isNewBatch: item.isNewBatch
      })),
      cashType: paymentMethod,
      vat: calculateVAT(),
      discount: calculateDiscount(),
      cookies
    };
    // console.log(newTransaction);

    try {
      console.log(newTransaction);
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
      await refetchCustomers();
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

  const handleQuickRegister = async (customerData: Customer) => {
    const newCustomer = {
      ...customerData,
      loyaltyPoints: 0
    };
    console.log(newCustomer);
    // customers.push(newCustomer)
    if (!newCustomer.phone || !newCustomer.name || !newCustomer.email) {
      toast.error('All fields are required');
      return;
    }
    try {
      console.log('before sending');
      const result = await registerCustomer({ data: newCustomer, cookies });
      if ('error' in result) {
        toast.error('Error creating customer');
        return;
      }
      console.log(result);

      //@ts-ignore
      setCurrentCustomer(newCustomer);
      setIsCustomerDialogOpen(false);
      toast.success('Customer registered successfully');
      setAuthCode('');
      setIsAuthCodeSent(false);
    } catch (error) {
      toast.error('Error creating customer');
    }
  };

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
      (t) => t.invoiceNumber === returnInvoice
    );

    if (transaction) {
      const consolidatedProducts = transaction.products.reduce(
        // @ts-ignore
        (acc, item) => {
          const existingItem = acc.find(
            // @ts-ignore
            (p) => p.productId === item.productId
          );
          if (existingItem) {
            existingItem.quantity += Number(item.quantity);
            existingItem.price =
              (existingItem.price * existingItem.quantity +
                item.price * Number(item.quantity)) /
              (existingItem.quantity + Number(item.quantity));
          } else {
            acc.push({
              ...item,
              quantity: Number(item.quantity),
              returnQuantity: 0,
              status: transaction.status,
              originalPrice: findProduct(item),
              revenue: transaction.revenue
            });
          }
          return acc;
        },
        []
      );

      setReturnItems(consolidatedProducts);
      setReturnUser(transaction.user);
      setReturnDate(transaction.createdAt);
      setReturnDiscount(transaction.discount);
      setReturnPaymentType(transaction.cashType);
      setReturnTotalAmount(transaction.totalAmount);
    } else {
      toast.error('Invoice not found');
    }
  }, [returnInvoice, orders, findProduct]);

  const calculateAfterReturnAmount = useMemo(() => {
    console.log(returnItems);
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
    total += total * 0.05;
    total -= calculateEachDiscount;

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

    total -= returnDiscounts;
    total += total * 0.05;

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
          amount: Math.round(afterReturnAmount * 2) / 2,
          rev: calculateRevenue - returnDiscounts
        },
        cookies
      }).unwrap();

      if ('error' in result) {
        throw new Error(result.error);
      }

      // console.log(total);

      toast.success(
        `Return processed. Refund amount: $${
          Math.round(afterReturnAmount * 2) / 2
        }`
      );
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
    // @ts-ignore
    addProductToCart(product);
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
  const getUniqueProductCount = (cart: any[]) => {
    const uniqueIds = new Set(cart.map((item) => item._id));
    return uniqueIds.size;
  };
  // Render cart items
  const renderCartItems = () => {
    const groupedItems = cart.reduce(
      (acc, item) => {
        if (!acc[item._id]) {
          acc[item._id] = {
            ...item,
            batches: []
          };
        }
        acc[item._id].batches.push({
          isNewBatch: item.isNewBatch,
          quantity: item.quantity
        });
        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(groupedItems).map((groupedItem) => {
      const totalQuantity = groupedItem.batches.reduce(
        (sum: number, batch: { quantity: number }) => sum + batch.quantity,
        0
      );
      const newBatchQuantity =
        groupedItem.batches.find(
          (batch: { isNewBatch: boolean }) => batch.isNewBatch
        )?.quantity || 0;
      const currentBatchQuantity =
        groupedItem.batches.find(
          (batch: { isNewBatch: boolean }) => !batch.isNewBatch
        )?.quantity || 0;

      const handleIncrease = (groupedItem: any) => {
        // Find the product in server data
        const product = productServer?.find(
          // @ts-ignore
          (p) => p._id === groupedItem._id
        );
        if (!product) return;

        // Get current quantities from both batches
        const currentBatchItem = cart.find(
          (item) => item._id === groupedItem._id && !item.isNewBatch
        );
        const newBatchItem = cart.find(
          (item) => item._id === groupedItem._id && item.isNewBatch
        );

        const currentBatchQty = currentBatchItem?.quantity || 0;
        const newBatchQty = newBatchItem?.newBatchQuantity || 0;

        // Try to increase current batch first
        if (
          currentBatchQty <
          Math.abs(product.quantity - product.newBatchQuantity)
        ) {
          updateQuantity(groupedItem._id, false, currentBatchQty + 1);
          return;
        }

        // If current batch is full, automatically switch to new batch
        if (newBatchQty < product.newBatchQuantity) {
          // If new batch doesn't exist yet, create it
          if (!newBatchItem) {
            addProductToCart(product, true);
          } else {
            updateQuantity(groupedItem._id, true, newBatchQty + 1);
          }
          return;
        }

        // If both batches are at maximum
        toast.error('Maximum quantity reached for both batches');
      };

      const handleDecrease = (groupedItem: any) => {
        // Try to decrease current batch first
        const currentBatchItem = cart.find(
          (item) => item._id === groupedItem._id && !item.isNewBatch
        );

        if (currentBatchItem && currentBatchItem.quantity > 0) {
          updateQuantity(groupedItem._id, false, currentBatchItem.quantity - 1);
          return;
        }

        // If no current batch or it's at 0, try new batch
        const newBatchItem = cart.find(
          (item) => item._id === groupedItem._id && item.isNewBatch
        );

        if (newBatchItem && newBatchItem.quantity > 0) {
          updateQuantity(groupedItem._id, true, newBatchItem.quantity - 1);
        }
      };

      return (
        <div
          key={groupedItem._id}
          className="flex items-center justify-between py-2"
        >
          <div>
            <div className="flex items-center gap-2 font-medium">
              {groupedItem.name}
              {newBatchQuantity > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{newBatchQuantity} new
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">
              ${groupedItem.sellPrice.toFixed(2)} each
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() => handleDecrease(groupedItem)}
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              className="h-7 w-8 px-0 text-sm"
              onClick={() => {
                setSelectedCartItem(groupedItem);
                setNewQuantity(totalQuantity.toString());
                setIsQuantityDialogOpen(true);
              }}
            >
              {totalQuantity}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() => handleIncrease(groupedItem)}
            >
              <Plus className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              variant="destructive"
              className="h-7 w-7 p-0"
              onClick={() => {
                groupedItem.batches.forEach(
                  (batch: { isNewBatch: boolean }) => {
                    removeFromCart(groupedItem._id, batch.isNewBatch);
                  }
                );
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    });
  };

  // Update the quantity dialog handler
  const handleQuantityUpdate = (productId: string, newQty: number) => {
    const product = productServer?.find(
      // @ts-ignore
      (p) => p._id === productId
    );
    if (!product) return;

    const currentBatchItem = cart.find(
      (item) => item._id === productId && !item.isNewBatch
    );
    const newBatchItem = cart.find(
      (item) => item._id === productId && item.isNewBatch
    );

    // Validate total quantity against available stock
    const maxAvailableQuantity = product.quantity || 0;
    if (newQty > maxAvailableQuantity) {
      toast.error(`Maximum available quantity is ${maxAvailableQuantity}`);
      return;
    }

    // If only current batch exists
    if (currentBatchItem && !newBatchItem) {
      if (newQty > product.quantity - product.newBatchQuantity) {
        toast.error(
          `Maximum available quantity in current batch is ${
            product.quantity - product.newBatchQuantity
          }`
        );
        return;
      }
      updateQuantity(productId, false, newQty);
    }
    // If only new batch exists
    else if (newBatchItem && !currentBatchItem) {
      if (newQty > product.newBatchQuantity) {
        toast.error(
          `Maximum available quantity in new batch is ${product.newBatchQuantity}`
        );
        return;
      }
      updateQuantity(productId, true, newQty);
    }

    setIsQuantityDialogOpen(false);
    setNewQuantity('');
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
      <main className="flex-1 overflow-y-auto p-4">
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
                      ({getUniqueProductCount(cart)})
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
                      <span>${Math.round(calculateTotal() * 2) / 2}</span>
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

      {/* Batch Selection Dialog */}
      <Dialog
        open={isBatchDialogOpen}
        onOpenChange={(open) => {
          if (open === false) {
            // Prevent dialog from closing if a batch hasn't been selected
            toast.error('Please select a batch before closing.');
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Batch</DialogTitle>
            <DialogDescription>
              This product has multiple batches available. Please select which
              batch you like to add to the cart.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBatchSelection(false)}
              >
                <Card className="cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                  <CardHeader>
                    <CardTitle>Current Batch</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Expires on{' '}
                      {new Date(
                        // @ts-ignore
                        selectedProduct.expirationDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      Quantity:{' '}
                      {
                        // @ts-ignore
                        selectedProduct.quantity -
                          // @ts-ignore
                          selectedProduct.newBatchQuantity
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBatchSelection(true)}
              >
                <Card className="cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                  <CardHeader>
                    <CardTitle>New Batch</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Expires on{' '}
                      {new Date(
                        // @ts-ignore
                        selectedProduct.newBatchExpiration
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      Quantity:{' '}
                      {
                        // @ts-ignore
                        selectedProduct.newBatchQuantity
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      {/* > */}

      <Dialog
        open={isQuantityDialogOpen}
        onOpenChange={setIsQuantityDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Quantity</DialogTitle>
            <DialogDescription>
              Enter the desired quantity for {selectedCartItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  onClick={() =>
                    setNewQuantity((prev) => prev + num.toString())
                  }
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setNewQuantity((prev) => prev + '0')}
              >
                0
              </Button>
              <Button
                variant="outline"
                onClick={() => setNewQuantity('')}
                className="col-span-2"
              >
                Clear
              </Button>
            </div>
            <Input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="text-center text-lg"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedCartItem && newQuantity) {
                  handleQuantityUpdate(
                    selectedCartItem._id,
                    parseInt(newQuantity)
                  );
                }
              }}
            >
              Update Quantity
            </Button>
          </DialogFooter>
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
                  placeholder="Email"
                  value={newCustomer.email}
                  required
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
                  disabled={isCreatingCustomer}
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
                      formatDate(selectedTransaction.updatedAt)
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
                <ScrollArea className="h-[200px]">
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
                            <Badge
                              variant={
                                // @ts-ignore
                                item.isNewBatch ? 'secondary' : 'outline'
                              }
                              className="ml-2"
                            >
                              {
                                // @ts-ignore
                                item.isNewBatch ? 'New Batch' : 'Current Batch'
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.quantity}
                          </TableCell>
                          {selectedTransaction.status === 'Refunded' && (
                            <TableCell className="text-xs">
                              <Badge
                                variant={
                                  // @ts-ignore
                                  item.returnQuantity
                                    ? 'destructive'
                                    : 'outline'
                                }
                                className="ml-2"
                              >
                                {
                                  // @ts-ignore
                                  item.returnQuantity
                                }
                              </Badge>
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
                </ScrollArea>
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
                  <div>
                    Amount to be returned $
                    {Math.round(afterReturnAmount * 2) / 2}
                  </div>
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
          <div className="flex flex-grow flex-col space-y-4 overflow-y-auto">
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
                        {formatDate(transaction.updatedAt)}
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
                        ${Math.abs(transaction.totalAmount).toFixed(2)}
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
