'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Package, DollarSign, TrendingUp, Plus, Edit, MoreVertical, Search, Filter, Star, Upload, Link, X, Check, Settings, BarChart3, Minus, Plus as PlusIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCurrencyStore } from "@/stores/currency.store";
import { CurrencySwitcher } from "@/components/ui/currency-switcher";

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  status: string;
  rating: number;
  reviews: number;
  image: string;
  brand: string;
}

export default function AdminProducts() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { formatCurrency } = useCurrencyStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  // Dialog states
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [showUpdateStockDialog, setShowUpdateStockDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    brand: '',
    status: 'active',
    image: ''
  });

  // Image upload state
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImageUploadType, setProductImageUploadType] = useState<'url' | 'file'>('url');

  // Selected product for editing/updating
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Stock update state
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [stockAdjustmentType, setStockAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [stockAdjustmentReason, setStockAdjustmentReason] = useState('');

  // Product categories
  const productCategories = [
    'Hair Care',
    'Beard Care',
    'Skincare',
    'Styling',
    'Tools',
    'Accessories',
    'Fragrance',
    'Wellness',
    'Other'
  ];

  // Products state
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Premium Shampoo",
      category: "Hair Care",
      description: "Professional-grade shampoo for all hair types",
      price: 24.99,
      cost: 12.50,
      stock: 45,
      status: "active",
      rating: 4.8,
      reviews: 127,
      image: "/api/placeholder/300/200",
      brand: "Premium Cuts"
    },
    {
      id: 2,
      name: "Beard Oil",
      category: "Beard Care",
      description: "Nourishing beard oil with natural ingredients",
      price: 18.99,
      cost: 8.75,
      stock: 32,
      status: "active",
      rating: 4.6,
      reviews: 89,
      image: "/api/placeholder/300/200",
      brand: "Premium Cuts"
    },
    {
      id: 3,
      name: "Hair Wax",
      category: "Styling",
      description: "Strong hold styling wax for modern looks",
      price: 16.99,
      cost: 7.25,
      stock: 28,
      status: "active",
      rating: 4.7,
      reviews: 156,
      image: "/api/placeholder/300/200",
      brand: "Premium Cuts"
    },
    {
      id: 4,
      name: "Aftershave Balm",
      category: "Skincare",
      description: "Soothing balm for post-shave care",
      price: 22.99,
      cost: 10.50,
      stock: 15,
      status: "low-stock",
      rating: 4.9,
      reviews: 203,
      image: "/api/placeholder/300/200",
      brand: "Premium Cuts"
    },
    {
      id: 5,
      name: "Hair Clippers",
      category: "Tools",
      description: "Professional-grade electric clippers",
      price: 89.99,
      cost: 45.00,
      stock: 8,
      status: "active",
      rating: 4.5,
      reviews: 67,
      image: "/api/placeholder/300/200",
      brand: "Wahl"
    },
    {
      id: 6,
      name: "Face Wash",
      category: "Skincare",
      description: "Gentle face wash for sensitive skin",
      price: 14.99,
      cost: 6.25,
      stock: 0,
      status: "out-of-stock",
      rating: 4.4,
      reviews: 45,
      image: "/api/placeholder/300/200",
      brand: "Premium Cuts"
    }
  ]);

  const categories = [...new Set(products.map(product => product.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesPrice = priceFilter === 'all' ||
                        (priceFilter === 'under-20' && product.price < 20) ||
                        (priceFilter === '20-50' && product.price >= 20 && product.price <= 50) ||
                        (priceFilter === 'over-50' && product.price > 50);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "low-stock": return "bg-yellow-100 text-yellow-800";
      case "out-of-stock": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateMargin = (price: number, cost: number) => {
    return (((price - cost) / price) * 100).toFixed(1);
  };

  // Form handlers
  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      description: '',
      price: '',
      cost: '',
      stock: '',
      brand: '',
      status: 'active',
      image: ''
    });
    setProductImageFile(null);
    setProductImageUploadType('url');
  };

  const openAddProductDialog = () => {
    resetProductForm();
    setShowAddProductDialog(true);
  };

  const openEditProductDialog = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      cost: product.cost?.toString() || '',
      stock: product.stock?.toString() || '',
      brand: product.brand || '',
      status: product.status || 'active',
      image: product.image || ''
    });
    setShowEditProductDialog(true);
  };

  const openUpdateStockDialog = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustment('');
    setStockAdjustmentType('add');
    setStockAdjustmentReason('');
    setShowUpdateStockDialog(true);
  };

  const openAnalyticsDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowAnalyticsDialog(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.category || !productForm.price || !productForm.cost || !productForm.stock) {
      alert('Please fill in all required fields');
      return;
    }

    // Handle image upload
    const imageUrl = productForm.image || '/api/placeholder/300/200';
    if (productImageUploadType === 'file' && productImageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        saveProductWithImage(dataUrl);
      };
      reader.readAsDataURL(productImageFile);
    } else {
      saveProductWithImage(imageUrl);
    }
  };

  const saveProductWithImage = (imageUrl: string) => {
    const productData = {
      ...productForm,
      price: parseFloat(productForm.price),
      cost: parseFloat(productForm.cost),
      stock: parseInt(productForm.stock),
      image: imageUrl
    };

    if (selectedProduct) {
      // Update existing product
      setProducts(prev => prev.map(product =>
        product.id === selectedProduct.id
          ? { ...product, ...productData }
          : product
      ));
      setShowEditProductDialog(false);
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        id: Math.max(...products.map(p => p.id)) + 1,
        rating: 0,
        reviews: 0
      };
      setProducts(prev => [...prev, newProduct]);
      setShowAddProductDialog(false);
    }
  };

  const handleUpdateStock = () => {
    if (!stockAdjustment || !stockAdjustmentReason || !selectedProduct) {
      alert('Please fill in all fields');
      return;
    }

    const adjustment = parseInt(stockAdjustment);
    if (isNaN(adjustment) || adjustment <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    setProducts(prev => prev.map(product => {
      if (product.id === selectedProduct!.id) {
        const currentStock = product.stock;
        const newStock = stockAdjustmentType === 'add'
          ? currentStock + adjustment
          : Math.max(0, currentStock - adjustment);

        let newStatus = product.status;
        if (newStock === 0) {
          newStatus = 'out-of-stock';
        } else if (newStock <= 15) {
          newStatus = 'low-stock';
        } else {
          newStatus = 'active';
        }

        return { ...product, stock: newStock, status: newStatus };
      }
      return product;
    }));

    setShowUpdateStockDialog(false);
  };

  return (
    <ProtectedRoute requiredRole="branch_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar role="branch_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-0" : "lg:ml-1"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar role="branch_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
                  <p className="text-sm text-gray-600">Manage your retail inventory</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <CurrencySwitcher />
                <Button onClick={openAddProductDialog} className="bg-secondary hover:bg-secondary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{products.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {products.filter(p => p.status === 'active').length} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(products.reduce((acc, product) => acc + (product.price * product.stock), 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Inventory value
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(products.reduce((acc, product) => acc + product.rating, 0) / products.length).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Customer satisfaction
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {products.filter(p => p.status === 'low-stock' || p.status === 'out-of-stock').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Need restocking
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-20">Under $20</SelectItem>
                        <SelectItem value="20-50">$20 - $50</SelectItem>
                        <SelectItem value="over-50">Over $50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={getStatusColor(product.status)}>
                          {product.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-primary">{product.name}</CardTitle>
                          <CardDescription className="text-secondary font-medium">{product.brand}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditProductDialog(product)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openUpdateStockDialog(product)}>
                              <Package className="w-4 h-4 mr-2" />
                              Update Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAnalyticsDialog(product)}>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold">{formatCurrency(product.price)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Package className="w-4 h-4 text-blue-600" />
                              <span>{product.stock} in stock</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Cost:</span>
                            <span className="font-medium ml-1">{formatCurrency(product.cost)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Margin:</span>
                            <span className="font-medium ml-1 text-green-600">
                              {calculateMargin(product.price, product.cost)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-secondary text-secondary" />
                            <span>{product.rating}</span>
                            <span className="text-gray-500">({product.reviews} reviews)</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditProductDialog(product)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openUpdateStockDialog(product)}>
                            Restock
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Sheet */}
      <Sheet open={showAddProductDialog} onOpenChange={(open) => {
        if (!open) resetProductForm();
        setShowAddProductDialog(open);
      }}>
        <SheetContent className="w-full sm:max-w-4xl max-h-[100vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
          <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold text-gray-900">Add New Product</SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Add a new product to your inventory with detailed information and pricing.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-8">
              {/* Product Image */}
              <Card className="border-2 border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    Product Image
                  </CardTitle>
                  <CardDescription>Upload a product image or provide an image URL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={productImageUploadType === 'url' ? 'default' : 'outline'}
                      onClick={() => setProductImageUploadType('url')}
                      className="flex-1"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Image URL
                    </Button>
                    <Button
                      type="button"
                      variant={productImageUploadType === 'file' ? 'default' : 'outline'}
                      onClick={() => setProductImageUploadType('file')}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </div>

                  {productImageUploadType === 'url' ? (
                    <div className="space-y-3">
                      <Label htmlFor="product-image-url" className="text-sm font-semibold text-gray-700">Image URL</Label>
                      <Input
                        id="product-image-url"
                        placeholder="https://example.com/image.jpg"
                        value={productForm.image || ''}
                        onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                        className="border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="product-image-file" className="text-sm font-semibold text-gray-700">Upload Image</Label>
                      <Input
                        id="product-image-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                        className="border-2 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                      />
                      {productImageFile && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <Check className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-700 font-medium">
                            Selected: {productImageFile.name} ({(productImageFile.size / 1024).toFixed(1)} KB)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card className="border-2 border-gray-100 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="product-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Product Name *
                        </Label>
                        <Input
                          id="product-name"
                          placeholder="Enter product name"
                          value={productForm.name || ''}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="product-brand" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Brand
                        </Label>
                        <Input
                          id="product-brand"
                          placeholder="Enter brand name"
                          value={productForm.brand || ''}
                          onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                          className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="product-category" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          Category *
                        </Label>
                        <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="border-2">
                            {productCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="product-description" className="text-sm font-semibold text-gray-700">Description</Label>
                        <Textarea
                          id="product-description"
                          placeholder="Describe the product..."
                          value={productForm.description || ''}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          className="min-h-24 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-2 border-gray-100 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Pricing & Inventory
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="product-price" className="text-sm font-semibold text-gray-700">Selling Price *</Label>
                          <Input
                            id="product-price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={productForm.price || ''}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="product-cost" className="text-sm font-semibold text-gray-700">Cost Price *</Label>
                          <Input
                            id="product-cost"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={productForm.cost || ''}
                            onChange={(e) => setProductForm({...productForm, cost: e.target.value})}
                            className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="product-stock" className="text-sm font-semibold text-gray-700">Initial Stock *</Label>
                        <Input
                          id="product-stock"
                          type="number"
                          placeholder="0"
                          value={productForm.stock || ''}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                          className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="product-status" className="text-sm font-semibold text-gray-700">Status</Label>
                        <Select value={productForm.status} onValueChange={(value) => setProductForm({...productForm, status: value})}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="border-2">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="low-stock">Low Stock</SelectItem>
                            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddProductDialog(false)}
                className="px-8 py-3 border-2 hover:bg-gray-50"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Product Sheet */}
      <Sheet open={showEditProductDialog} onOpenChange={(open) => {
        if (!open) resetProductForm();
        setShowEditProductDialog(open);
      }}>
        <SheetContent className="w-full sm:max-w-4xl max-h-[98vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
          <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Edit className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold text-gray-900">Edit Product</SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Update the product information and settings.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-8">
              {/* Product Image */}
              <Card className="border-2 border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    Product Image
                  </CardTitle>
                  <CardDescription>Upload a product image or provide an image URL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={productImageUploadType === 'url' ? 'default' : 'outline'}
                      onClick={() => setProductImageUploadType('url')}
                      className="flex-1"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Image URL
                    </Button>
                    <Button
                      type="button"
                      variant={productImageUploadType === 'file' ? 'default' : 'outline'}
                      onClick={() => setProductImageUploadType('file')}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </div>

                  {productImageUploadType === 'url' ? (
                    <div className="space-y-3">
                      <Label htmlFor="edit-product-image-url" className="text-sm font-semibold text-gray-700">Image URL</Label>
                      <Input
                        id="edit-product-image-url"
                        placeholder="https://example.com/image.jpg"
                        value={productForm.image || ''}
                        onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                        className="border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="edit-product-image-file" className="text-sm font-semibold text-gray-700">Upload Image</Label>
                      <Input
                        id="edit-product-image-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                        className="border-2 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                      />
                      {productImageFile && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <Check className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-700 font-medium">
                            Selected: {productImageFile.name} ({(productImageFile.size / 1024).toFixed(1)} KB)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card className="border-2 border-gray-100 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="edit-product-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Product Name *
                        </Label>
                        <Input
                          id="edit-product-name"
                          placeholder="Enter product name"
                          value={productForm.name || ''}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-product-brand" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Brand
                        </Label>
                        <Input
                          id="edit-product-brand"
                          placeholder="Enter brand name"
                          value={productForm.brand || ''}
                          onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                          className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-product-category" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          Category *
                        </Label>
                        <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="border-2">
                            {productCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-product-description" className="text-sm font-semibold text-gray-700">Description</Label>
                        <Textarea
                          id="edit-product-description"
                          placeholder="Describe the product..."
                          value={productForm.description || ''}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          className="min-h-24 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-2 border-gray-100 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Pricing & Inventory
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="edit-product-price" className="text-sm font-semibold text-gray-700">Selling Price *</Label>
                          <Input
                            id="edit-product-price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={productForm.price || ''}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="edit-product-cost" className="text-sm font-semibold text-gray-700">Cost Price *</Label>
                          <Input
                            id="edit-product-cost"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={productForm.cost || ''}
                            onChange={(e) => setProductForm({...productForm, cost: e.target.value})}
                            className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-product-stock" className="text-sm font-semibold text-gray-700">Current Stock *</Label>
                        <Input
                          id="edit-product-stock"
                          type="number"
                          placeholder="0"
                          value={productForm.stock || ''}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                          className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-product-status" className="text-sm font-semibold text-gray-700">Status</Label>
                        <Select value={productForm.status} onValueChange={(value) => setProductForm({...productForm, status: value})}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="border-2">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="low-stock">Low Stock</SelectItem>
                            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditProductDialog(false)}
                className="px-8 py-3 border-2 hover:bg-gray-50"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                <Edit className="w-5 h-5 mr-2" />
                Update Product
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Update Stock Sheet */}
      <Sheet open={showUpdateStockDialog} onOpenChange={setShowUpdateStockDialog}>
        <SheetContent className="w-full sm:max-w-2xl max-h-[98vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
          <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold text-gray-900">Update Stock</SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Adjust the stock level for {selectedProduct?.name}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Current Stock Info */}
              <Card className="border-2 border-gray-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct?.stock}</div>
                      <div className="text-sm text-gray-600">Current Stock</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency((selectedProduct?.price || 0) * (selectedProduct?.stock || 0))}</div>
                      <div className="text-sm text-gray-600">Current Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Adjustment */}
              <Card className="border-2 border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Stock Adjustment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={stockAdjustmentType === 'add' ? 'default' : 'outline'}
                      onClick={() => setStockAdjustmentType('add')}
                      className="flex-1"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Stock
                    </Button>
                    <Button
                      type="button"
                      variant={stockAdjustmentType === 'subtract' ? 'default' : 'outline'}
                      onClick={() => setStockAdjustmentType('subtract')}
                      className="flex-1"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Remove Stock
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="stock-adjustment" className="text-sm font-semibold text-gray-700">
                      Quantity to {stockAdjustmentType === 'add' ? 'Add' : 'Remove'} *
                    </Label>
                    <Input
                      id="stock-adjustment"
                      type="number"
                      placeholder="Enter quantity"
                      value={stockAdjustment}
                      onChange={(e) => setStockAdjustment(e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="stock-reason" className="text-sm font-semibold text-gray-700">Reason *</Label>
                    <Select value={stockAdjustmentReason} onValueChange={setStockAdjustmentReason}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent className="border-2">
                        <SelectItem value="restock">Restock</SelectItem>
                        <SelectItem value="return">Customer Return</SelectItem>
                        <SelectItem value="damaged">Damaged/Lost</SelectItem>
                        <SelectItem value="correction">Inventory Correction</SelectItem>
                        <SelectItem value="sale">Bulk Sale</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview */}
                  {stockAdjustment && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">Stock Preview:</div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Current: {selectedProduct?.stock} → New: {
                            stockAdjustmentType === 'add'
                              ? (selectedProduct?.stock || 0) + parseInt(stockAdjustment || '0')
                              : Math.max(0, (selectedProduct?.stock || 0) - parseInt(stockAdjustment || '0'))
                          }
                        </span>
                        <Badge className={
                          stockAdjustmentType === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }>
                          {stockAdjustmentType === 'add' ? '+' : '-'}{stockAdjustment}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUpdateStockDialog(false)}
                className="px-8 py-3 border-2 hover:bg-gray-50"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStock}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                <Package className="w-5 h-5 mr-2" />
                Update Stock
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Analytics Sheet */}
      <Sheet open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <SheetContent className="w-full sm:max-w-4xl max-h-[98vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
          <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold text-gray-900">Product Analytics</SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Performance metrics for {selectedProduct?.name}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$2,847</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">
                      +8% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedProduct?.rating}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedProduct?.reviews} reviews
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Chart Placeholder */}
              <Card className="border-2 border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Sales Trend
                  </CardTitle>
                  <CardDescription>Monthly sales performance over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Sales Chart</p>
                      <p className="text-sm text-gray-500">Chart visualization would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-2 border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest stock movements and sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <PlusIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Stock Restocked</p>
                          <p className="text-sm text-green-600">Added 25 units • 2 days ago</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">Sale Completed</p>
                          <p className="text-sm text-blue-600">Sold 3 units • 3 days ago</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Minus className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-yellow-800">Low Stock Alert</p>
                          <p className="text-sm text-yellow-600">Stock below 20 units • 5 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowAnalyticsDialog(false)}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                <X className="w-5 h-5 mr-2" />
                Close Analytics
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </ProtectedRoute>
  );
}