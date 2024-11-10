'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  CheckIcon,
  PlusCircledIcon
} from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  List,
  Package,
  Grid,
  LayoutList,
  AlignJustify,
  Loader2,
  Barcode,
  MoreHorizontal,
  X
} from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthCookie, getUserInfo } from '@/actions/auth.actions';
import {
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateProductMutation
} from '@/store/authApi';

import { BarcodeScanner } from '@thewirv/react-barcode-scanner';
import { deleteAuthCookie } from '@/actions/auth.actions';
import dynamic from 'next/dynamic';
import { useMediaQuery } from 'react-responsive';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  sellPrice: number;
  description: string;
  vendor: string;
  addedBy: string;
  quantity: number;
  barcode: string;
  units: string;
  isQuantityBased: boolean;
  logs: any[];
  reorderPoint: number;
}

function BottomSheet({
  // @ts-ignore
  isOpen,
  // @ts-ignore
  onClose,
  // @ts-ignore
  title,
  // @ts-ignore
  children
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t bg-background shadow-lg"
        >
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Component() {
  const [cookies, setCookies] = useState<string | null>(null);
  const {
    data: productsServer,
    error,
    isLoading,
    isFetching,
    refetch,
    isError
  } = useGetProductsQuery(cookies, {
    skip: !cookies,
    pollingInterval: 60000
  });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  useEffect(() => {
    // @ts-ignore
    getAuthCookie().then((cookie: string | null) => {
      setCookies(cookie);
    });
    // const savedValue = window.localStorage.getItem('userStore');
    // setUser(JSON.parse(savedValue || '{}'));
    getUserInfo().then((userInfo) => {
      // console.log(userInfo)
      setUser(userInfo);
    });
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [producttorestoc, setProductsToRestock] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [currentView, setCurrentView] = useState('list');
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isTrashBinDialogOpen, setIsTrashBinDialogOpen] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [isProductLogDialogOpen, setIsProductLogDialogOpen] = useState(false);
  const [selectedProductLog, setSelectedProductLog] = useState<Product | null>(
    null
  );
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(
    null
  );
  const [user, setUser] = useState({});
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [isBarcodeScanning, setIsBarcodeScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [accumulatedKeystrokes, setAccumulatedKeystrokes] = useState('');
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState(0);
  const searchInputRef = useRef(null);
  const [anyInputFocused, setAnyInputFocused] = useState(false);

  useEffect(() => {
    if (productsServer) {
      setProducts(productsServer);
    }
  }, [productsServer]);

  // @ts-ignore
  const categories = useMemo(
    // @ts-ignore
    () => [...new Set(products.map((product) => product.category))],
    [products]
  );

  const newCategories = [
    'Cosmatics',
    'Stationary',
    'Snacks',
    'Breakfast',
    'Sauces',
    'Dry food',
    'Drinks',
    'Cleaning tools',
    'Electronics',
    'Vegetables',
    'Meats',
    'Others'
  ];

  const vendors = useMemo(
    // @ts-ignore
    () => [...new Set(products.map((product) => product.vendor))],
    [products]
  );

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!inputFocused && !anyInputFocused && e.key.length === 1) {
        setSearchQuery((prev) => prev + e.key);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      setAnyInputFocused(
        e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
      );
      if (e.target === searchInputRef.current) {
        setInputFocused(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        setAnyInputFocused(false);
      }
      if (e.target === searchInputRef.current) {
        setInputFocused(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [inputFocused, anyInputFocused]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.addedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode === searchQuery;
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesVendor =
        !selectedVendor || product.vendor === selectedVendor;
      const matchesLowStock = !showLowStock || product.quantity <= 10; // Assuming low stock is 10 or less
      const matchesPriceRange =
        product.sellPrice >= priceRange[0] &&
        product.sellPrice <= priceRange[1];
      return (
        matchesSearch &&
        matchesCategory &&
        matchesVendor &&
        matchesLowStock &&
        matchesPriceRange
      );
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedVendor,
    showLowStock,
    priceRange
  ]);

  const sortedProducts = useMemo(() => {
    let sortableProducts = [...filteredProducts];
    if (sortConfig.key !== '') {
      sortableProducts.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [filteredProducts, sortConfig]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedVendor('');
    setShowLowStock(false);
    setPriceRange([0, 2000]);
    setSortConfig({ key: '', direction: '' });
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(
    (key: string) => {
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    const productWithId = { ...newProduct, id: products.length + 1 };
    setProducts((prevProducts) => [...prevProducts, productWithId]);
    setIsAddProductDialogOpen(false);
    // console.log(newProduct);
    const data = {
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      vendor: newProduct.vendor,
      sellPrice: Number(newProduct.sellPrice),
      quantity: newProduct.quantity,
      price: Number(newProduct.price),
      isQuantityBased: newProduct.isQuantityBased,
      reorderPoint: newProduct.reorderPoint,
      units: newProduct.units,
      barcode: newProduct.barcode,
      // @ts-ignore
      image: newProduct.image
    };
    console.log(data);
    try {
      const res = await createProduct({
        data,
        cookies
      });
      if ('error' in res) {
        // @ts-ignore
        throw new Error(res.error);
      }
      toast.success('Product added successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to add product. Please try again.');
      refetch();
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    const originalProduct = products.find(
      (product) => product._id === updatedProduct._id
    );

    const changedKeys = Object.keys(updatedProduct).filter((key) => {
      //@ts-ignore
      return updatedProduct[key] !== originalProduct[key];
    });

    console.log('Changed keys:', changedKeys);

    const logs = changedKeys.map((key) => {
      return {
        //@ts-ignore
        action: `${key} changed from ${originalProduct[key]} to ${updatedProduct[key]}`,
        // @ts-ignore
        updatedBy: user.username
      };
    });

    console.log(logs);
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setIsEditProductDialogOpen(false);

    const data = {
      name: updatedProduct.name,
      description: updatedProduct.description,
      category: updatedProduct.category,
      vendor: updatedProduct.vendor,
      sellPrice: updatedProduct.sellPrice,
      quantity: updatedProduct.quantity,
      price: updatedProduct.price,
      isQuantityBased: updatedProduct.isQuantityBased,
      barcode: updatedProduct.barcode,
      units: updatedProduct.units,
      reorderPoint: updatedProduct.reorderPoint,
      action: logs
    };
    const all = {
      id: updatedProduct._id,
      cookies: cookies,
      data: data
    };
    try {
      const result = await updateProduct(all);
      if ('error' in result) {
        // @ts-ignore
        throw new Error(error);
      }
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      refetch();
    } catch (error) {
      toast.error(`Error processing: || 'Unknown error'}`);
      refetch();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setConfirmAction(() => async () => {
      const productToDelete = products.find(
        (product) => product._id === productId
      );
      if (productToDelete) {
        try {
          const result = await deleteProduct({ id: productId, cookies });
          if ('error' in result) {
            // @ts-ignore
            throw new Error(error);
          }
          toast.success('Product Deleted');
          refetch();
        } catch {
          toast.error('error to delete a product');
          refetch();
        }
      }
      setConfirmAction(null);
    });
  };

  const handleRestock = async (productId: string, amount: number) => {
    try {
      const s = products.filter((j) => j._id === productId);
      let data;
      if (s[0].isQuantityBased) {
        data = {
          quantity: s[0].quantity + amount,
          isQuantityBased: true,
          action: [
            {
              action: `Restock from ${s[0].quantity} to ${
                s[0].quantity + amount
              }`,
              // @ts-ignore
              updatedBy: user.username
            }
          ]
        };
      } else {
        data = {
          units: amount,
          isQuantityBased: false,
          action: [
            {
              action: `Restock from ${s[0].units} to ${amount}`,
              // @ts-ignore
              updatedBy: user.username
            }
          ]
        };
      }

      const result = await updateProduct({
        id: productId,
        data: data,
        cookies
      });
      if ('error' in result) {
        // @ts-ignore
        throw new Error(error);
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? {
                ...product,
                quantity: product.isQuantityBased
                  ? product.quantity + amount
                  : Number(product.units.split(' ')[0]) + amount
              }
            : product
        )
      );
      toast.success('Product restocked successfully');
      refetch();
    } catch (error) {
      toast.error('Unable to restock');
    }

    setIsRestockDialogOpen(false);
    setRestockingProduct(null);
    toast.success('Product restocked successfully!');
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortConfig.key === field) {
      return sortConfig.direction === 'ascending' ? (
        <ChevronUp className="inline" />
      ) : (
        <ChevronDown className="inline" />
      );
    }
    return null;
  };

  if (isLoading) {
    return <Loader2 className="mx-auto h-12 w-12" />;
  }

  if (isError) {
    // console.log(error)
    // @ts-ignore
    if (error?.data?.message === 'Token expired') {
      deleteAuthCookie();
    }
    return <div>Error: {error.toString()}</div>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <div className="flex w-full flex-col space-y-2 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
            {isMobile ? (
              <Button
                className="w-full sm:w-auto"
                onClick={() => setIsAddProductDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            ) : (
              <Dialog
                open={isAddProductDialogOpen}
                onOpenChange={setIsAddProductDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new product.
                    </DialogDescription>
                  </DialogHeader>
                  <ProductForm
                    onSubmit={handleAddProduct}
                    categories={newCategories}
                    vendors={vendors}
                  />
                </DialogContent>
              </Dialog>
            )}

            <BottomSheet
              isOpen={isMobile && isAddProductDialogOpen}
              onClose={() => setIsAddProductDialogOpen(false)}
              title="Add New Product"
            >
              <ProductForm
                onSubmit={handleAddProduct}
                categories={newCategories}
                vendors={vendors}
              />
            </BottomSheet>

            <BottomSheet
              isOpen={isMobile && isEditProductDialogOpen}
              onClose={() => setIsEditProductDialogOpen(false)}
              title="Add New Product"
            >
              <ProductForm
                onSubmit={handleEditProduct}
                categories={categories}
                vendors={vendors}
              />
            </BottomSheet>
          </div>
        </div>

        <div className="rounded-lg p-4 shadow">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search products, suppliers, buyers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-10"
                />
              </div>
              {isMobile ? (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              ) : (
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Filters</DialogTitle>
                      <DialogDescription>
                        Apply filters to refine your product list.
                      </DialogDescription>
                    </DialogHeader>
                    <FilterOptions
                      categories={categories}
                      vendors={vendors}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedVendor={selectedVendor}
                      setSelectedVendor={setSelectedVendor}
                      showLowStock={showLowStock}
                      setShowLowStock={setShowLowStock}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                    />
                  </DialogContent>
                </Dialog>
              )}

              <BottomSheet
                isOpen={isMobile && isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filters"
              >
                <FilterOptions
                  categories={categories}
                  vendors={vendors}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedVendor={selectedVendor}
                  setSelectedVendor={setSelectedVendor}
                  showLowStock={showLowStock}
                  setShowLowStock={setShowLowStock}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </BottomSheet>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={resetFilters}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
            <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
              <Select value={currentView} onValueChange={setCurrentView}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">
                    <div className="flex items-center">
                      <LayoutList className="mr-2 h-4 w-4" />
                      List View
                    </div>
                  </SelectItem>
                  <SelectItem value="grid">
                    <div className="flex items-center">
                      <Grid className="mr-2 h-4 w-4" />
                      Grid View
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 / page</SelectItem>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden rounded-lg shadow-md"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-medium">Image</TableHead>
                      <TableHead className="font-medium">Product</TableHead>
                      <TableHead className="hidden font-medium sm:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="text-right font-medium">
                        Stock
                      </TableHead>
                      <TableHead className="hidden text-right font-medium sm:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="hidden font-medium md:table-cell">
                        Supplier
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow
                        key={product._id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          {
                            // @ts-ignore
                            product.image ? (
                              <img
                                src={
                                  // @ts-ignore
                                  product.image
                                }
                                alt={product.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                {product.name.charAt(0).toUpperCase()}
                              </div>
                            )
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                          <p className="text-sm text-muted-foreground sm:hidden">
                            {product.category}
                          </p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {product.category}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              product.quantity <= product.reorderPoint
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="w-12 justify-center"
                          >
                            {product.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-right sm:table-cell">
                          ${product.price}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.vendor}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-[160px]">
                                <div className="grid gap-1">
                                  <Button
                                    variant="ghost"
                                    className="justify-start"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setIsEditProductDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    disabled={
                                      // @ts-ignore
                                      user?.role != 'Admin'
                                    }
                                    variant="ghost"
                                    className="justify-start"
                                    onClick={() =>
                                      handleDeleteProduct(product._id)
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="justify-start"
                                    onClick={() => {
                                      setSelectedProductLog(product);
                                      setIsProductLogDialogOpen(true);
                                    }}
                                  >
                                    <List className="mr-2 h-4 w-4" />
                                    View Log
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="justify-start"
                                    onClick={() => {
                                      setRestockingProduct(product);
                                      setIsRestockDialogOpen(true);
                                    }}
                                  >
                                    <Package className="mr-2 h-4 w-4" />
                                    Restock
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
          {currentView === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {paginatedProducts.map((product) => (
                <Card
                  key={product._id}
                  className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="bg-primary/5 p-4">
                    <CardTitle className="truncate text-lg">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="truncate text-sm">
                      {product.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid flex-grow grid-cols-2 gap-2 p-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold">Stock</p>
                      <Badge
                        variant={
                          product.quantity <= product.reorderPoint
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {product.quantity}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Price</p>
                      <p>${product.price.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Supplier</p>
                      <p className="truncate">{product.vendor}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Buyer</p>
                      {/* <p className="truncate">{product.buyer}</p> */}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between bg-secondary/10 p-4">
                    {/* <span className="text-xs text-muted-foreground">SKU: {product.sku}</span> */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            className="justify-start"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            disabled={
                              // @ts-ignore
                              user.role !== 'Admin'
                            }
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start"
                            onClick={() => {
                              setSelectedProductLog(product);
                              setIsProductLogDialogOpen(true);
                            }}
                          >
                            <List className="mr-2 h-4 w-4" />
                            View Log
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start"
                            onClick={() => {
                              setRestockingProduct(product);
                              setIsRestockDialogOpen(true);
                            }}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Restock
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </CardFooter>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {paginatedProducts.length} of {sortedProducts.length}{' '}
            products
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
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
                <DoubleArrowLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <DoubleArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isProductLogDialogOpen}
        onOpenChange={setIsProductLogDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Product Log: {selectedProductLog?.name}</DialogTitle>
            <DialogDescription>
              Activity log for this product.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProductLog?.logs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.date).toLocaleString()}
                    </TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.updatedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditProductDialogOpen}
        onOpenChange={setIsEditProductDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for this product.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              // @ts-ignore
              onSubmit={handleEditProduct}
              initialData={editingProduct}
              categories={categories}
              vendors={vendors}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Re-stock Product</DialogTitle>
            <DialogDescription>
              Enter the amount to re-stock for {restockingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {
            // @ts-ignore
            <RestockForm
              onSubmit={(amount) =>
                // @ts-ignore
                handleRestock(restockingProduct?._id, amount)
              }
            />
          }
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription>
              Apply filters to refine your product list.
            </DialogDescription>
          </DialogHeader>
          <FilterOptions
            categories={categories}
            vendors={vendors}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedVendor={selectedVendor}
            setSelectedVendor={setSelectedVendor}
            showLowStock={showLowStock}
            setShowLowStock={setShowLowStock}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </DialogContent>
      </Dialog>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

function ProductForm({
  onSubmit,
  initialData,
  categories,
  vendors
}: {
  onSubmit: (data: Omit<Product, 'id' | 'log'>) => void;
  initialData?: Product;
  categories: string[];
  vendors: string[];
}) {
  const [formData, setFormData] = useState<Omit<Product, '_id' | 'log'>>(
    // @ts-ignore
    initialData || {
      name: '',
      category: '',
      price: 0,
      sellPrice: 0,
      description: '',
      vendor: '',
      addedBy: '',
      quantity: 0,
      barcode: '',
      units: '',
      reorderPoint: 0,
      isQuantityBased: true,
      // @ts-ignore
      image: ''
    }
  );
  // const [isCameraActive, setIsCameraActive] = useState(false);
  // const [lastScanTime, setLastScanTime] = useState(0);
  const [isBarcodeReaderActive, setIsBarcodeReaderActive] = useState(false);
  // const [newVendor, setNewVendor] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (e.target.name === 'barcode') {
      setIsBarcodeReaderActive(true);
    }
    // if (e.target.name === 'new-vendor') {
    //   console.log("haha")
    //   setFormData((prev) => ({ ...prev, vendor: newVendor }));
    // }

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  //@ts-ignore
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && isBarcodeReaderActive) {
      event.preventDefault();
      setIsBarcodeReaderActive(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Image upload failed');
        }

        const data = await response.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // @ts-ignore
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="image">Product Image</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {isUploading && (
            <p className="text-sm text-muted-foreground">Uploading...</p>
          )}
          {
            // @ts-ignore
            formData.image && (
              <img
                src={
                  // @ts-ignore
                  formData.image
                }
                alt="Product"
                className="mt-2 h-20 w-20 rounded-md object-cover"
              />
            )
          }
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            value={formData.category}
            onValueChange={(value) =>
              handleChange({
                target: { name: 'category', value }
              } as React.ChangeEvent<HTMLSelectElement>)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
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

        <div>
          <label htmlFor="reorderPoint">Reorder Point</label>
          <Input
            id="reorderPoint"
            name="reorderPoint"
            type="number"
            value={formData.reorderPoint}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="sellPrice">Sell Price</Label>
          <Input
            id="sellPrice"
            name="sellPrice"
            type="number"
            step="0.01"
            value={formData.sellPrice}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="vendor">Vendor</Label>

          <Input
            id="vendor"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            placeholder="Enter new vendor name"
          />
        </div>
        {formData.isQuantityBased && (
          <>
            <div>
              {' '}
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </>
        )}
        {!formData.isQuantityBased && (
          <div>
            <Label htmlFor="units">Units (not pieces products)</Label>
            <Input
              id="units"
              name="units"
              value={formData.units}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div>
          <Label htmlFor="isQuantityBased">Is Pieaces</Label>
          <Switch
            id="isQuantityBased"
            name="isQuantityBased"
            checked={formData.isQuantityBased}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isQuantityBased: checked }))
            }
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Submit'}
      </Button>
    </form>
  );
}

function FilterOptions({
  categories,
  vendors,
  selectedCategory,
  setSelectedCategory,
  selectedVendor,
  setSelectedVendor,
  showLowStock,
  setShowLowStock,
  priceRange,
  setPriceRange
}: {
  categories: string[];
  vendors: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedVendor: string;
  setSelectedVendor: (vendor: string) => void;
  showLowStock: boolean;
  setShowLowStock: (show: boolean) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="supplier">Supplier</Label>
        <Select value={selectedVendor} onValueChange={setSelectedVendor}>
          <SelectTrigger id="supplier">
            <SelectValue placeholder="Select supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Suppliers</SelectItem>
            {vendors.map((vendor) => (
              <SelectItem key={vendor} value={vendor}>
                {vendor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-low-stock"
          checked={showLowStock}
          onCheckedChange={setShowLowStock}
        />
        <Label htmlFor="show-low-stock">Show Low Stock</Label>
      </div>
      <div>
        <Label>Price Range</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([Number(e.target.value), priceRange[1]])
            }
            className="w-20"
          />
          <span>-</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-20"
          />
        </div>
        <Slider
          min={0}
          max={2000}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function RestockForm({ onSubmit }: { onSubmit: (amount: number) => void }) {
  const [amount, setAmount] = useState(0);
  const [restockButtonDiabled, setRestockButtonDisalbed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRestockButtonDisalbed(true);
    onSubmit(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Restock Amount</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={1}
          required
        />
      </div>
      <Button disabled={restockButtonDiabled} type="submit">
        Confirm Restock
      </Button>
    </form>
  );
}
