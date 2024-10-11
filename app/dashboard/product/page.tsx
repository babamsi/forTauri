'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Barcode
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthCookie } from '@/actions/auth.actions';
import {
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateProductMutation
} from '@/store/authApi';

import { BarcodeScanner } from '@thewirv/react-barcode-scanner';

interface Product {
  _id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  sellPrice: number;
  description: string;
  vendor: string;
  addedBy: string;
  quantity: number;
  barcode: string;
  units: string;
  isQuantityBased: boolean;
  log: any[];
}

export default function Component() {
  const [cookies, setCookies] = useState<string | null>(null);
  const {
    data: productsServer,
    error,
    isLoading,
    isFetching,
    isError
  } = useGetProductsQuery(cookies, {
    skip: !cookies
  });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  useEffect(() => {
    // @ts-ignore
    getAuthCookie().then((cookie: string | null) => {
      setCookies(cookie);
    });
    const savedValue = window.localStorage.getItem('userStore');
    setUser(JSON.parse(savedValue || '{}'));
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
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

  useEffect(() => {
    if (productsServer) {
      setProducts(productsServer);
    }
  }, [productsServer]);

  const newCategories = ['Elect', 'Cloth', 'Drink'];
  // @ts-ignore
  const categories = useMemo(
    // @ts-ignore
    () => [...new Set(products.map((product) => product.category))],
    [products]
  );

  const subcategories = useMemo(
    // @ts-ignore
    () => [...new Set(products.map((product) => product.subcategory))],
    [products]
  );

  const vendors = useMemo(
    // @ts-ignore
    () => [...new Set(products.map((product) => product.vendor))],
    [products]
  );

  const handleBarcodeScanned = (data: string) => {
    const currentTime = Date.now();
    if (currentTime - lastScanTime < 1000) {
      // If less than 1 second has passed since the last scan, ignore this scan
      return;
    }
    setLastScanTime(currentTime);
    if (data) {
      setSearchQuery(data);
      setIsBarcodeDialogOpen(false);
      setIsBarcodeScanning(false);
      // You might want to trigger the search here
      // For example, by calling a search function or updating a state that triggers a search effect
    }
  };

  const handleBarcodeError = (err: any) => {
    console.error(err);
    toast.error('Error scanning barcode. Please try again.');
    setIsBarcodeScanning(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.addedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode === searchQuery;
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesSubcategory =
        !selectedSubcategory || product.subcategory === selectedSubcategory;
      const matchesVendor =
        !selectedVendor || product.vendor === selectedVendor;
      const matchesLowStock = !showLowStock || product.quantity <= 10; // Assuming low stock is 10 or less
      const matchesPriceRange =
        product.sellPrice >= priceRange[0] &&
        product.sellPrice <= priceRange[1];
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesVendor &&
        matchesLowStock &&
        matchesPriceRange
      );
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
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
    setSelectedSubcategory('');
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
    console.log(newProduct);
    const data = {
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      subcategory: newProduct.subcategory,
      vendor: newProduct.vendor,
      sellPrice: Number(newProduct.sellPrice),
      quantity: newProduct.quantity,
      price: Number(newProduct.price),
      isQuantityBased: newProduct.isQuantityBased,
      units: newProduct.units,
      barcode: newProduct.barcode
    };
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
    } catch (error) {
      toast.error('Failed to add product. Please try again.');
    }
    // console.log(newProduct)
  };

  // console.log(products)

  const handleEditProduct = async (updatedProduct: Product) => {
    console.log(cookies);

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setIsEditProductDialogOpen(false);
    // console.log(updatedProduct)
    const data = {
      name: updatedProduct.name,
      description: updatedProduct.description,
      category: updatedProduct.category,
      subcategory: updatedProduct.subcategory,
      vendor: updatedProduct.vendor,
      sellPrice: updatedProduct.sellPrice,
      quantity: updatedProduct.quantity,
      price: updatedProduct.price,
      isQuantityBased: updatedProduct.isQuantityBased,
      barcode: updatedProduct.barcode,
      units: updatedProduct.units
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
    } catch (error) {
      toast.error(`Error processing: || 'Unknown error'}`);
    }
    // console.log(all.cookies)
    // const result = await updateProduct(all)
    // if ('error' in result) {
    //   // @ts-ignore
    //   console.log(error)
  };

  const handleDeleteProduct = async (productId: string) => {
    setConfirmAction(() => async () => {
      const productToDelete = products.find(
        (product) => product._id === productId
      );
      if (productToDelete) {
        // setDeletedProducts((prevDeleted) => [...prevDeleted, productToDelete])
        // setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId))
        try {
          const result = await deleteProduct({ id: productId, cookies });
          if ('error' in result) {
            // @ts-ignore
            throw new Error(error);
          }
          toast.success('Product Deleted');
        } catch {
          toast.error('error to delete a product');
        }
        // toast.success("Product moved to trash bin.")
      }
      setConfirmAction(null);
    });
  };

  const handleRestoreProduct = useCallback(
    (productId: string) => {
      const productToRestore = deletedProducts.find(
        (product) => product._id === productId
      );
      if (productToRestore) {
        setProducts((prevProducts) => [...prevProducts, productToRestore]);
        setDeletedProducts((prevDeleted) =>
          prevDeleted.filter((product) => product._id !== productId)
        );
        toast.success('Product restored successfully!');
      }
    },
    [deletedProducts]
  );

  const handleRestock = useCallback((productId: string, amount: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === productId
          ? {
              ...product,
              quantity: product.quantity + amount,
              log: [
                ...product.log,
                {
                  id: product.log.length + 1,
                  action: 'Restock',
                  amount: amount,
                  date: new Date().toISOString()
                }
              ]
            }
          : product
      )
    );
    setIsRestockDialogOpen(false);
    setRestockingProduct(null);
    toast.success('Product restocked successfully!');
  }, []);

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
    return <div>Error: {error.toString()}</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <div className="flex space-x-2">
            <Dialog
              open={isAddProductDialogOpen}
              onOpenChange={setIsAddProductDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new product.
                  </DialogDescription>
                </DialogHeader>
                <ProductForm
                  // @ts-ignore
                  onSubmit={handleAddProduct}
                  categories={newCategories}
                  subcategories={[]}
                  vendors={vendors}
                />
              </DialogContent>
            </Dialog>
            {/* <Button variant="outline" onClick={() => setIsTrashBinDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Trash Bin
            </Button> */}
          </div>
        </div>

        <div className="rounded-lg bg-card p-4 text-card-foreground shadow">
          <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex w-full flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0 md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, vendors, added by"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setIsBarcodeDialogOpen(true)}
                >
                  <Barcode className="h-4 w-4" />
                </Button>
              </div>
              <FilterOptions
                categories={categories}
                subcategories={subcategories}
                vendors={vendors}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                selectedVendor={selectedVendor}
                setSelectedVendor={setSelectedVendor}
                showLowStock={showLowStock}
                setShowLowStock={setShowLowStock}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
            <div className="flex w-full items-center space-x-2 md:w-auto">
              <Select value={currentView} onValueChange={setCurrentView}>
                <SelectTrigger className="w-[180px]">
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
                  <SelectItem value="compact">
                    <div className="flex items-center">
                      <AlignJustify className="mr-2 h-4 w-4" />
                      Compact View
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
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
              className="overflow-hidden rounded-lg bg-card text-card-foreground shadow-md"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name <SortIcon field="name" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      Category <SortIcon field="category" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('subcategory')}
                    >
                      Subcategory <SortIcon field="subcategory" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity <SortIcon field="quantity" />
                    </TableHead>
                    {/* <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                      Price <SortIcon field="price" />
                    </TableHead> */}
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('sellPrice')}
                    >
                      Sell Price <SortIcon field="sellPrice" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('vendor')}
                    >
                      Vendor <SortIcon field="vendor" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('addedBy')}
                    >
                      Added By <SortIcon field="addedBy" />
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?text=${product.name}`}
                            alt={product.name}
                          />
                          <AvatarFallback>
                            {product.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.subcategory}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.quantity <= 10 ? 'destructive' : 'secondary'
                          }
                        >
                          {product.isQuantityBased
                            ? product.quantity
                            : product.units}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>${product.price}</TableCell> */}
                      <TableCell>${product.sellPrice}</TableCell>
                      <TableCell>{product.vendor}</TableCell>
                      <TableCell>{product.addedBy}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditProductDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            disabled={
                              // @ts-ignore
                              user?.role === 'stuff'
                            }
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProductLog(product);
                              setIsProductLogDialogOpen(true);
                            }}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
          {currentView === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {paginatedProducts.map((product) => (
                <Card key={product._id} className="flex h-full flex-col">
                  <CardHeader>
                    <div className="relative mb-2 aspect-square w-full">
                      <Avatar className="h-full w-full">
                        <AvatarImage
                          src={`/placeholder.svg?text=${product.name}`}
                          alt={product.name}
                        />
                        <AvatarFallback>
                          {product.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>
                      {product.category} - {product.subcategory}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <Badge
                          variant={
                            product.quantity <= 10 ? 'destructive' : 'secondary'
                          }
                        >
                          {product.isQuantityBased
                            ? product.quantity
                            : `${product.units}`}
                        </Badge>
                      </div>
                      {/* <div className="flex justify-between">
                        <span>Price:</span> */}
                      {/* <span className="font-semibold">${product.price.toFixed(2)}</span> */}
                      {/* </div> */}
                      <div className="flex justify-between">
                        <span>Sell Price:</span>
                        <span className="font-semibold">
                          ${product.sellPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vendor:</span>
                        <span>{product.vendor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Added By:</span>
                        <span>{product.addedBy}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
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
                        user?.role === 'stuff'
                      }
                      variant="outline"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </motion.div>
          )}
          {currentView === 'compact' && (
            <motion.div
              key="compact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {paginatedProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between rounded-lg bg-card p-4 text-card-foreground shadow"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`/placeholder.svg?text=${product.name}`}
                        alt={product.name}
                      />
                      <AvatarFallback>
                        {product.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category} - {product.subcategory}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        product.quantity <= 10 ? 'destructive' : 'secondary'
                      }
                    >
                      Qty:{' '}
                      {product.isQuantityBased
                        ? product.quantity
                        : product.units}
                    </Badge>
                    <span className="font-semibold">
                      ${product.sellPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {product.vendor}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsEditProductDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={
                        // @ts-ignore
                        user?.role === 'stuff'
                      }
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProductLog(product);
                        setIsProductLogDialogOpen(true);
                      }}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      <Dialog
        open={isEditProductDialogOpen}
        onOpenChange={setIsEditProductDialogOpen}
      >
        <DialogContent className="max-w-4xl">
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
              subcategories={subcategories}
              vendors={vendors}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={isProductLogDialogOpen}
        onOpenChange={setIsProductLogDialogOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Product Log: {selectedProductLog?.name}</DialogTitle>
            <DialogDescription>
              Activity log for this product.
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {// @ts-ignore
              selectedProductLog?.logs.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>{new Date(entry.date).toLocaleString()}</TableCell>
                  <TableCell>{entry.action}</TableCell>
                  <TableCell>{entry.updatedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>
              Position the barcode within the camera view to scan.
            </DialogDescription>
          </DialogHeader>
          {isBarcodeScanning ? (
            <div className="aspect-square">
              <BarcodeScanner
                // delay={300}
                onError={handleBarcodeError}
                onSuccess={(result) => {
                  if (result) {
                    handleBarcodeScanned(result);
                  }
                }}
                containerStyle={{ width: '100%' }}
              />
            </div>
          ) : (
            <Button onClick={() => setIsBarcodeScanning(true)}>
              Start Scanning
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to perform this action?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button onClick={() => confirmAction && confirmAction()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

function ProductForm({
  onSubmit,
  initialData,
  categories,
  subcategories,
  vendors
}: {
  onSubmit: (data: Omit<Product, 'id' | 'log'>) => void;
  initialData?: Product;
  categories: string[];
  subcategories: string[];
  vendors: string[];
}) {
  const [formData, setFormData] = useState<Omit<Product, '_id' | 'log'>>(
    initialData || {
      name: '',
      category: '',
      subcategory: '',
      price: 0,
      sellPrice: 0,
      description: '',
      vendor: '',
      addedBy: '',
      quantity: 0,
      barcode: '',
      units: '',
      isQuantityBased: true
    }
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          <Label htmlFor="subcategory">Subcategory</Label>
          <Select
            name="subcategory"
            value={formData.subcategory}
            onValueChange={(value) =>
              handleChange({
                target: { name: 'subcategory', value }
              } as React.ChangeEvent<HTMLSelectElement>)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Select
            name="vendor"
            value={formData.vendor}
            onValueChange={(value) =>
              handleChange({
                target: { name: 'vendor', value }
              } as React.ChangeEvent<HTMLSelectElement>)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor} value={vendor}>
                  {vendor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* <div>
          <Label htmlFor="addedBy">Added By</Label>
          <Input id="addedBy" name="addedBy" value={formData.addedBy} onChange={handleChange} required />
        </div> */}

        {formData.isQuantityBased && (
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
        )}

        <div>
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="units">Units</Label>
          <Input
            id="units"
            name="units"
            value={formData.units}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="isQuantityBased">Is Quantity Based</Label>
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
      <Button type="submit">Submit</Button>
    </form>
  );
}

function FilterOptions({
  categories,
  subcategories,
  vendors,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedVendor,
  setSelectedVendor,
  showLowStock,
  setShowLowStock,
  priceRange,
  setPriceRange
}: {
  categories: string[];
  subcategories: string[];
  vendors: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (subcategory: string) => void;
  selectedVendor: string;
  setSelectedVendor: (vendor: string) => void;
  showLowStock: boolean;
  setShowLowStock: (show: boolean) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Category</h4>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
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
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Subcategory</h4>
            <Select
              value={selectedSubcategory}
              onValueChange={setSelectedSubcategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subcategories</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Vendor</h4>
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Show Low Stock</h4>
            <Switch checked={showLowStock} onCheckedChange={setShowLowStock} />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Price Range</h4>
            <Slider
              min={0}
              max={2000}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RestockForm({ onSubmit }: { onSubmit: (amount: number) => void }) {
  const [amount, setAmount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <Button type="submit">Confirm Restock</Button>
    </form>
  );
}
