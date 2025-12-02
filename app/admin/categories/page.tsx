'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tag, Plus, Edit, MoreVertical, Search, Filter, Upload, Link, X, Check, Trash2, Eye, EyeOff, Package, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCategoryStore, type Category } from "@/stores/category.store";

export default function AdminCategories() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByBranch,
    getCategoriesByType
  } = useCategoryStore();

  // Get current branch categories
  const branchCategories = getCategoriesByBranch(user?.branchId);
  const productCategories = getCategoriesByType('product', user?.branchId);
  const serviceCategories = getCategoriesByType('service', user?.branchId);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'product' as 'product' | 'service',
    image: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'product',
      image: '',
      isActive: true
    });
  };

  const handleAddCategory = () => {
    if (!formData.name.trim()) return;

    addCategory({
      ...formData,
      branchId: user?.branchId
    });

    setAddDialogOpen(false);
    resetForm();
  };

  const handleEditCategory = () => {
    if (!selectedCategory || !formData.name.trim()) return;

    updateCategory(selectedCategory.id, formData);
    setEditDialogOpen(false);
    setSelectedCategory(null);
    resetForm();
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;

    deleteCategory(selectedCategory.id);
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      type: category.type,
      image: category.image || '',
      isActive: category.isActive
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  // Filter categories
  const filteredCategories = branchCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || category.type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && category.isActive) ||
                         (statusFilter === 'inactive' && !category.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Mock data for demonstration
  useEffect(() => {
    if (branchCategories.length === 0) {
      const mockCategories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Hair Care',
          description: 'Professional hair care products and treatments',
          type: 'product',
          branchId: user?.branchId,
          image: '',
          isActive: true
        },
        {
          name: 'Skin Care',
          description: 'Premium skincare products for all skin types',
          type: 'product',
          branchId: user?.branchId,
          image: '',
          isActive: true
        },
        {
          name: 'Hair Styling',
          description: 'Professional hair styling services',
          type: 'service',
          branchId: user?.branchId,
          image: '',
          isActive: true
        },
        {
          name: 'Facial Treatments',
          description: 'Advanced facial care and treatment services',
          type: 'service',
          branchId: user?.branchId,
          image: '',
          isActive: true
        }
      ];

      mockCategories.forEach(cat => addCategory(cat));
    }
  }, [branchCategories.length, addCategory, user?.branchId]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar role="branch_admin" onLogout={handleLogout} />
        <AdminMobileSidebar
          role="branch_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                <p className="text-sm text-gray-600">Manage product and service categories for your branch</p>
              </div>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </header>

          {/* Filters */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Tag className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{branchCategories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Product Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{productCategories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Tag className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Service Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{serviceCategories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Check className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Categories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {branchCategories.filter(c => c.isActive).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="flex-1 overflow-auto px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Tag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={category.type === 'product' ? 'default' : 'secondary'}>
                              {category.type}
                            </Badge>
                            <Badge variant={category.isActive ? 'default' : 'outline'}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateCategory(category.id, { isActive: !category.isActive })}
                          >
                            {category.isActive ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(category)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-4">
                      {category.description}
                    </CardDescription>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first category'
                  }
                </p>
                {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Category Sheet */}
      <Sheet open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <SheetContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Add New Category</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Create a new category for products or services in your branch.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Enter the essential details for your category</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        Category Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter category name (e.g., Hair Care, Facial Treatments)"
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Package className="w-4 h-4 text-green-600" />
                        Category Type *
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'product' | 'service') =>
                          setFormData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                        <SelectContent className="border-2">
                          <SelectItem value="product" className="py-3">
                            <div className="flex items-center gap-3">
                              <Package className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium">Product Category</div>
                                <div className="text-xs text-gray-500">For physical items and merchandise</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="service" className="py-3">
                            <div className="flex items-center gap-3">
                              <Tag className="w-4 h-4 text-purple-600" />
                              <div>
                                <div className="font-medium">Service Category</div>
                                <div className="text-xs text-gray-500">For treatments and services offered</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this category includes (e.g., Professional hair care products and treatments for all hair types)"
                        rows={4}
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                      />
                      <p className="text-xs text-gray-500">Provide a clear description to help customers understand this category</p>
                    </div>
                  </div>
                </div>

                {/* Media & Settings */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-purple-600" />
                      Media & Settings
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Optional settings to enhance your category</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="image" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-purple-600" />
                        Category Image URL
                      </Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      <p className="text-xs text-gray-500">Add an image URL to visually represent this category</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <Label htmlFor="isActive" className="text-sm font-semibold text-gray-900 cursor-pointer">
                            Active Category
                          </Label>
                          <p className="text-xs text-gray-600">Make this category visible to customers</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                            formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              formData.isActive ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCategory}
                  disabled={!formData.name.trim()}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Category Sheet */}
      <Sheet open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <SheetContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shadow-sm">
                    <Edit className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Edit Category</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Update category information and settings.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-amber-600" />
                      Basic Information
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Modify the essential details for your category</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-600" />
                        Category Name *
                      </Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter category name (e.g., Hair Care, Facial Treatments)"
                        className="h-12 border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 transition-colors"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="edit-type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Package className="w-4 h-4 text-green-600" />
                        Category Type *
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'product' | 'service') =>
                          setFormData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500/20">
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                        <SelectContent className="border-2">
                          <SelectItem value="product" className="py-3">
                            <div className="flex items-center gap-3">
                              <Package className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium">Product Category</div>
                                <div className="text-xs text-gray-500">For physical items and merchandise</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="service" className="py-3">
                            <div className="flex items-center gap-3">
                              <Tag className="w-4 h-4 text-purple-600" />
                              <div>
                                <div className="font-medium">Service Category</div>
                                <div className="text-xs text-gray-500">For treatments and services offered</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                        Description
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this category includes"
                        rows={4}
                        className="border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 resize-none"
                      />
                      <p className="text-xs text-gray-500">Provide a clear description to help customers understand this category</p>
                    </div>
                  </div>
                </div>

                {/* Media & Settings */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-purple-600" />
                      Media & Settings
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Optional settings to enhance your category</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="edit-image" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-purple-600" />
                        Category Image URL
                      </Label>
                      <Input
                        id="edit-image"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        className="h-12 border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500/20"
                      />
                      <p className="text-xs text-gray-500">Add an image URL to visually represent this category</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <Label htmlFor="edit-isActive" className="text-sm font-semibold text-gray-900 cursor-pointer">
                            Active Category
                          </Label>
                          <p className="text-xs text-gray-600">Make this category visible to customers</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="edit-isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                            formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              formData.isActive ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleEditCategory}
                  disabled={!formData.name.trim()}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Update Category
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Sheet */}
      <Sheet open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shadow-sm">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Delete Category</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      This action cannot be undone.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Are you sure you want to delete this category?
                    </h3>
                    <p className="text-red-700 mb-4">
                      This will permanently delete <strong>"{selectedCategory?.name}"</strong> and remove it from your branch.
                      Any products or services in this category will need to be reassigned.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-red-300">
                      <div className="flex items-center gap-3">
                        {selectedCategory?.image ? (
                          <img
                            src={selectedCategory.image}
                            alt={selectedCategory.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Tag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{selectedCategory?.name}</p>
                          <p className="text-sm text-gray-600">{selectedCategory?.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={selectedCategory?.type === 'product' ? 'default' : 'secondary'} className="text-xs">
                              {selectedCategory?.type}
                            </Badge>
                            <Badge variant={selectedCategory?.isActive ? 'default' : 'outline'} className="text-xs">
                              {selectedCategory?.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCategory}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Category
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </ProtectedRoute>
  );
}