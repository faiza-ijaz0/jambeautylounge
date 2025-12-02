'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Scissors, Clock, DollarSign, Plus, Edit, MoreVertical, Search, Filter, Building, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SuperAdminServices() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add Service Dialog State
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    duration: '',
    status: 'active' as 'active' | 'inactive',
    branches: [] as string[]
  });

  // Available branches
  const availableBranches = [
    "Downtown Premium",
    "Midtown Elite", 
    "Uptown Luxury",
    "Eastside Classic",
    "Suburban Comfort",
    "Westside Modern"
  ];

  // Mock services data across all branches
  const services = [
    {
      id: 1,
      name: "Classic Haircut",
      category: "Haircuts",
      description: "Traditional men's haircut with clippers and scissors",
      price: 35,
      duration: 30,
      branches: ["Downtown Premium", "Midtown Elite", "Uptown Luxury", "Westside Modern"],
      status: "active",
      popularity: "high",
      totalBookings: 1250,
      revenue: 43750
    },
    {
      id: 2,
      name: "Beard Trim & Shape",
      category: "Beard Care",
      description: "Professional beard trimming and shaping service",
      price: 25,
      duration: 20,
      branches: ["Downtown Premium", "Midtown Elite", "Uptown Luxury", "Eastside Classic"],
      status: "active",
      popularity: "high",
      totalBookings: 980,
      revenue: 24500
    },
    {
      id: 3,
      name: "Hair Color",
      category: "Color Services",
      description: "Full hair coloring with premium products",
      price: 85,
      duration: 90,
      branches: ["Midtown Elite", "Uptown Luxury", "Suburban Comfort"],
      status: "active",
      popularity: "medium",
      totalBookings: 320,
      revenue: 27200
    },
    {
      id: 4,
      name: "Hot Towel Shave",
      category: "Shaving",
      description: "Traditional hot towel straight razor shave",
      price: 45,
      duration: 45,
      branches: ["Downtown Premium", "Uptown Luxury", "Eastside Classic"],
      status: "active",
      popularity: "medium",
      totalBookings: 450,
      revenue: 20250
    },
    {
      id: 5,
      name: "Hair Wash & Style",
      category: "Styling",
      description: "Complete hair wash and professional styling",
      price: 40,
      duration: 45,
      branches: ["Midtown Elite", "Uptown Luxury", "Suburban Comfort", "Westside Modern"],
      status: "active",
      popularity: "high",
      totalBookings: 780,
      revenue: 31200
    },
    {
      id: 6,
      name: "Facial Treatment",
      category: "Treatments",
      description: "Deep cleansing facial with premium products",
      price: 65,
      duration: 60,
      branches: ["Uptown Luxury"],
      status: "inactive",
      popularity: "low",
      totalBookings: 45,
      revenue: 2925
    }
  ];

  const categories = [...new Set(services.map(service => service.category))];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case "high": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSaveService = () => {
    if (!serviceForm.name || !serviceForm.category || !serviceForm.price || !serviceForm.duration || serviceForm.branches.length === 0) {
      alert('Please fill in all required fields and select at least one branch');
      return;
    }

    // In a real app, this would save to the database
    console.log('Saving service:', serviceForm);
    alert('Service added successfully!');

    // Reset form and close dialog
    setServiceForm({
      name: '',
      category: '',
      description: '',
      price: '',
      duration: '',
      status: 'active',
      branches: []
    });
    setShowAddServiceDialog(false);
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      category: '',
      description: '',
      price: '',
      duration: '',
      status: 'active',
      branches: []
    });
  };

  const toggleBranchSelection = (branchName: string) => {
    setServiceForm(prev => ({
      ...prev,
      branches: prev.branches.includes(branchName)
        ? prev.branches.filter(b => b !== branchName)
        : [...prev.branches, branchName]
    }));
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar role="super_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar role="super_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
                  <p className="text-sm text-gray-600">Manage services across all branches</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  className="bg-secondary hover:bg-secondary/90"
                  onClick={() => setShowAddServiceDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
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
                    <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{services.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {services.filter(s => s.status === 'active').length} active services
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${services.reduce((acc, service) => acc + service.revenue, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From all services
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {services.reduce((acc, service) => acc + service.totalBookings, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all branches
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(services.reduce((acc, service) => acc + service.price, 0) / services.length).toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per service
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
                          placeholder="Search services..."
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
                  </div>
                </CardContent>
              </Card>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-primary">{service.name}</CardTitle>
                          <CardDescription className="text-secondary font-medium">{service.category}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(service.status)}>
                            {service.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Service
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Building className="w-4 h-4 mr-2" />
                                Manage Branches
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Price History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold">${service.price}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span>{service.duration} min</span>
                            </div>
                          </div>
                          <Badge className={getPopularityColor(service.popularity)}>
                            {service.popularity}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Bookings:</span>
                            <p className="font-semibold">{service.totalBookings.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Revenue:</span>
                            <p className="font-semibold">${service.revenue.toLocaleString()}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">Available at Branches</h4>
                          <div className="flex flex-wrap gap-1">
                            {service.branches.map((branch, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {branch}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <Scissors className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Service Sheet */}
        <Sheet open={showAddServiceDialog} onOpenChange={(open) => {
          if (!open) resetServiceForm();
          setShowAddServiceDialog(open);
        }}>
          <SheetContent className="w-full sm:max-w-4xl max-h-[98vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Add New Service</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Create a new service and assign it to specific branches.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <div className="space-y-8">
                {/* Service Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Card className="border-2 border-gray-100 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Scissors className="w-5 h-5 text-blue-600" />
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <Label htmlFor="service-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            Service Name *
                          </Label>
                          <Input
                            id="service-name"
                            placeholder="e.g., Classic Haircut"
                            value={serviceForm.name || ''}
                            onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                            className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="service-category" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Category *
                          </Label>
                          <Select value={serviceForm.category} onValueChange={(value) => setServiceForm({...serviceForm, category: value})}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                              <SelectItem value="Haircuts">Haircuts</SelectItem>
                              <SelectItem value="Beard Care">Beard Care</SelectItem>
                              <SelectItem value="Color Services">Color Services</SelectItem>
                              <SelectItem value="Shaving">Shaving</SelectItem>
                              <SelectItem value="Styling">Styling</SelectItem>
                              <SelectItem value="Treatments">Treatments</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="service-description" className="text-sm font-semibold text-gray-700">Description</Label>
                          <Textarea
                            id="service-description"
                            placeholder="Describe the service..."
                            value={serviceForm.description || ''}
                            onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
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
                          <Building className="w-5 h-5 text-purple-600" />
                          Service Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label htmlFor="service-price" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Price *
                            </Label>
                            <Input
                              id="service-price"
                              type="number"
                              placeholder="0.00"
                              value={serviceForm.price || ''}
                              onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                              className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="service-duration" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Duration *
                            </Label>
                            <Input
                              id="service-duration"
                              type="number"
                              placeholder="30"
                              value={serviceForm.duration || ''}
                              onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                              className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="service-status" className="text-sm font-semibold text-gray-700">Status</Label>
                          <Select value={serviceForm.status} onValueChange={(value: 'active' | 'inactive') => setServiceForm({...serviceForm, status: value})}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                              <SelectItem value="active">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  Active
                                </div>
                              </SelectItem>
                              <SelectItem value="inactive">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                  Inactive
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Branch Selection */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Building className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">Branch Assignment</CardTitle>
                        <CardDescription className="text-gray-600">Select which branches this service will be available at</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Selected branches:</span>
                        <span className="text-primary font-semibold">{serviceForm.branches.length} of {availableBranches.length}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableBranches.map((branch) => (
                          <div
                            key={branch}
                            className={cn(
                              "flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                              serviceForm.branches.includes(branch)
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() => toggleBranchSelection(branch)}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                              serviceForm.branches.includes(branch)
                                ? "bg-primary border-primary"
                                : "border-gray-300"
                            )}>
                              {serviceForm.branches.includes(branch) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{branch}</p>
                              <p className="text-sm text-gray-500">Branch location</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {serviceForm.branches.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium">No branches selected</p>
                          <p className="text-sm">Please select at least one branch for this service</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-6 border-t-2 border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAddServiceDialog(false)}
                  className="px-6 py-3 border-2 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveService}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </ProtectedRoute>
  );
}