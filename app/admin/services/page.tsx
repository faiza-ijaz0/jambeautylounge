'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Scissors, Clock, DollarSign, Plus, Edit, MoreVertical, Search, Filter, Upload, Eye, BarChart3, Trash2, Copy, Settings, Check, Calendar, Star, TrendingUp, User, Lightbulb, History, Save } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCurrencyStore } from "@/stores/currency.store";
import { CurrencySwitcher } from "@/components/ui/currency-switcher";

export default function AdminServices() {
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

  // Service management state
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showPriceHistoryDialog, setShowPriceHistoryDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceImageUploadType, setServiceImageUploadType] = useState<'url' | 'file'>('url');
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);

  // Schedule management state
  const [maxBookingsPerHour, setMaxBookingsPerHour] = useState('4');
  const [bufferTime, setBufferTime] = useState('15');

  // Price history state
  const [newPrice, setNewPrice] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [priceChangeReason, setPriceChangeReason] = useState('');

  // Custom category state
  const [customCategory, setCustomCategory] = useState('');

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    duration: '',
    status: 'active',
    image: '',
    staff: [] as string[]
  });

  // Services data as state
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Classic Haircut",
      category: "Haircuts",
      description: "Traditional men's haircut with clippers and scissors",
      price: 35,
      duration: 30,
      status: "active",
      popularity: "high",
      staff: ["Mike Johnson", "Alex Rodriguez"],
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      name: "Beard Trim & Shape",
      category: "Beard Care",
      description: "Professional beard trimming and shaping service",
      price: 25,
      duration: 20,
      status: "active",
      popularity: "high",
      staff: ["Mike Johnson", "Alex Rodriguez"],
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      name: "Hair Color",
      category: "Color Services",
      description: "Full hair coloring with premium products",
      price: 85,
      duration: 90,
      status: "active",
      popularity: "medium",
      staff: ["Sarah Chen"],
      image: "/api/placeholder/300/200"
    },
    {
      id: 4,
      name: "Hot Towel Shave",
      category: "Shaving",
      description: "Traditional hot towel straight razor shave",
      price: 45,
      duration: 45,
      status: "active",
      popularity: "medium",
      staff: ["Mike Johnson", "Alex Rodriguez"],
      image: "/api/placeholder/300/200"
    },
    {
      id: 5,
      name: "Hair Wash & Style",
      category: "Styling",
      description: "Complete hair wash and professional styling",
      price: 40,
      duration: 45,
      status: "active",
      popularity: "high",
      staff: ["Sarah Chen"],
      image: "/api/placeholder/300/200"
    },
    {
      id: 6,
      name: "Facial Treatment",
      category: "Treatments",
      description: "Deep cleansing facial with premium products",
      price: 65,
      duration: 60,
      status: "inactive",
      popularity: "low",
      staff: ["Sarah Chen"],
      image: "/api/placeholder/300/200"
    }
  ]);

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

  // Service management handlers
  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      category: '',
      description: '',
      price: '',
      duration: '',
      status: 'active',
      image: '',
      staff: []
    });
    setServiceImageFile(null);
    setServiceImageUploadType('url');
    setCustomCategory('');
  };

  const openAddServiceDialog = () => {
    resetServiceForm();
    setShowAddServiceDialog(true);
  };

  const openEditServiceDialog = (service: any) => {
    const predefinedCategories = [
      'Haircuts', 'Beard Care', 'Color Services', 'Shaving', 'Styling', 'Treatments',
      'Hair Washing', 'Facial Treatments', 'Massage', 'Manicure & Pedicure', 'Waxing',
      'Eyebrow & Eyelash', 'Makeup', 'Body Treatments', 'Hair Extensions', 'Bridal Services'
    ];

    const isPredefined = predefinedCategories.includes(service.category);
    const category = isPredefined ? service.category : 'Other';
    const customCat = isPredefined ? '' : service.category;

    setSelectedService(service);
    setServiceForm({
      name: service.name || '',
      category: category,
      description: service.description || '',
      price: service.price?.toString() || '',
      duration: service.duration?.toString() || '',
      status: service.status || 'active',
      image: service.image || '',
      staff: service.staff ? [...service.staff] : []
    });
    setCustomCategory(customCat);
    setShowEditServiceDialog(true);
  };

  const openAnalyticsDialog = (service: any) => {
    setSelectedService(service);
    setShowAnalyticsDialog(true);
  };

  const handleSaveService = () => {
    if (!serviceForm.name || !serviceForm.category || !serviceForm.price || !serviceForm.duration) {
      alert('Please fill in all required fields');
      return;
    }

    // Handle image upload
    const imageUrl = serviceForm.image || '/api/placeholder/300/200';
    if (serviceImageUploadType === 'file' && serviceImageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        saveServiceWithImage(dataUrl);
      };
      reader.readAsDataURL(serviceImageFile);
    } else {
      saveServiceWithImage(imageUrl);
    }
  };

  const saveServiceWithImage = (imageUrl: string) => {
    const finalCategory = serviceForm.category === 'Other' ? customCategory : serviceForm.category;
    const serviceData = {
      ...serviceForm,
      category: finalCategory,
      price: parseFloat(serviceForm.price),
      duration: parseInt(serviceForm.duration),
      image: imageUrl
    };

    if (selectedService) {
      // Update existing service
      setServices(prev => prev.map(service =>
        service.id === selectedService.id
          ? { ...service, ...serviceData }
          : service
      ));
      setShowEditServiceDialog(false);
    } else {
      // Add new service
      const newService = {
        ...serviceData,
        id: services.length + 1,
        popularity: 'low' as const
      };
      setServices(prev => [...prev, newService]);
      setShowAddServiceDialog(false);
    }

    resetServiceForm();
  };

  const handleDeleteService = (serviceId: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
    }
  };

  const handleDuplicateService = (service: any) => {
    const duplicatedService = {
      ...service,
      id: services.length + 1,
      name: `${service.name} (Copy)`,
      status: 'inactive' as const
    };
    setServices(prev => [...prev, duplicatedService]);
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
          "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-0",
          sidebarOpen ? "lg:ml-0" : "lg:ml-1"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar role="branch_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
                  <p className="text-sm text-gray-600">Manage your service offerings</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <CurrencySwitcher />
                <Button onClick={openAddServiceDialog} className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200">
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
          <div className="flex-1 overflow-auto min-h-0">
            <div className="h-full p-4 lg:p-8">
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
                      {services.filter(s => s.status === 'active').length} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(services.reduce((acc, service) => acc + service.price, 0) / services.length)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per service
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(services.reduce((acc, service) => acc + service.duration, 0) / services.length)}m
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per service
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{categories.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Service types
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
                  <Card key={service.id}>
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
                              <DropdownMenuItem onClick={() => openEditServiceDialog(service)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Service
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedService(service);
                                setShowScheduleDialog(true);
                              }}>
                                <Clock className="w-4 h-4 mr-2" />
                                Manage Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedService(service);
                                setShowPriceHistoryDialog(true);
                              }}>
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
                              <span className="font-semibold">{formatCurrency(service.price)}</span>
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

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">Available Staff</h4>
                          <div className="flex flex-wrap gap-1">
                            {service.staff.map((staffMember, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {staffMember}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditServiceDialog(service)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setShowAnalyticsDialog(true)}
                          >
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
          <SheetContent className="w-full sm:max-w-4xl max-h-[100vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Add New Service</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Create a new service offering for your business.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <div className="space-y-8">
                {/* Service Image Section */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">Service Image</CardTitle>
                        <CardDescription className="text-gray-600">Upload an image or provide an image URL for the service</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-24 rounded-lg bg-gray-200 border-2 border-gray-300 overflow-hidden">
                          <img
                            src={serviceImageUploadType === 'file' && serviceImageFile
                              ? URL.createObjectURL(serviceImageFile)
                              : serviceForm.image || '/api/placeholder/300/200'}
                            alt="Service preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            variant={serviceImageUploadType === 'url' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setServiceImageUploadType('url')}
                            className="flex-1 sm:flex-none"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            URL
                          </Button>
                          <Button
                            type="button"
                            variant={serviceImageUploadType === 'file' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setServiceImageUploadType('file')}
                            className="flex-1 sm:flex-none"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                          </Button>
                        </div>

                        {serviceImageUploadType === 'url' ? (
                          <div className="space-y-2">
                            <Label htmlFor="service-image-url" className="text-sm font-medium">Image URL</Label>
                            <Input
                              id="service-image-url"
                              placeholder="https://example.com/service-image.jpg"
                              value={serviceForm.image || ''}
                              onChange={(e) => setServiceForm({...serviceForm, image: e.target.value})}
                              className="border-2 focus:border-primary"
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Label htmlFor="service-image-file" className="text-sm font-medium">Select Image File</Label>
                            <Input
                              id="service-image-file"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setServiceImageFile(file);
                                }
                              }}
                              className="border-2 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                            />
                            {serviceImageFile && (
                              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <Check className="w-4 h-4 text-green-600" />
                                <p className="text-sm text-green-700 font-medium">
                                  Selected: {serviceImageFile.name} ({(serviceImageFile.size / 1024).toFixed(1)} KB)
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                          <Select value={serviceForm.category} onValueChange={(value) => {
                            setServiceForm({...serviceForm, category: value});
                            if (value !== 'Other') {
                              setCustomCategory('');
                            }
                          }}>
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
                              <SelectItem value="Hair Washing">Hair Washing</SelectItem>
                              <SelectItem value="Facial Treatments">Facial Treatments</SelectItem>
                              <SelectItem value="Massage">Massage</SelectItem>
                              <SelectItem value="Manicure & Pedicure">Manicure & Pedicure</SelectItem>
                              <SelectItem value="Waxing">Waxing</SelectItem>
                              <SelectItem value="Eyebrow & Eyelash">Eyebrow & Eyelash</SelectItem>
                              <SelectItem value="Makeup">Makeup</SelectItem>
                              <SelectItem value="Body Treatments">Body Treatments</SelectItem>
                              <SelectItem value="Hair Extensions">Hair Extensions</SelectItem>
                              <SelectItem value="Bridal Services">Bridal Services</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>

                          {serviceForm.category === 'Other' && (
                            <div className="space-y-3 mt-3">
                              <Label htmlFor="custom-category" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Custom Category *
                              </Label>
                              <Input
                                id="custom-category"
                                placeholder="Enter custom category name"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                              />
                            </div>
                          )}
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
                          <Settings className="w-5 h-5 text-purple-600" />
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

        {/* Edit Service Sheet */}
        <Sheet open={showEditServiceDialog} onOpenChange={(open) => {
          if (!open) resetServiceForm();
          setShowEditServiceDialog(open);
        }}>
          <SheetContent className="w-full sm:max-w-4xl max-h-[98vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Edit className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Edit Service</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Update the service information and settings.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <div className="space-y-8">
                {/* Service Image Section */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">Service Image</CardTitle>
                        <CardDescription className="text-gray-600">Update the service image</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-24 rounded-lg bg-gray-200 border-2 border-gray-300 overflow-hidden">
                          <img
                            src={serviceImageUploadType === 'file' && serviceImageFile
                              ? URL.createObjectURL(serviceImageFile)
                              : serviceForm.image || '/api/placeholder/300/200'}
                            alt="Service preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            variant={serviceImageUploadType === 'url' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setServiceImageUploadType('url')}
                            className="flex-1 sm:flex-none"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            URL
                          </Button>
                          <Button
                            type="button"
                            variant={serviceImageUploadType === 'file' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setServiceImageUploadType('file')}
                            className="flex-1 sm:flex-none"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                          </Button>
                        </div>

                        {serviceImageUploadType === 'url' ? (
                          <div className="space-y-2">
                            <Label htmlFor="edit-service-image-url" className="text-sm font-medium">Image URL</Label>
                            <Input
                              id="edit-service-image-url"
                              placeholder="https://example.com/service-image.jpg"
                              value={serviceForm.image || ''}
                              onChange={(e) => setServiceForm({...serviceForm, image: e.target.value})}
                              className="border-2 focus:border-primary"
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Label htmlFor="edit-service-image-file" className="text-sm font-medium">Select Image File</Label>
                            <Input
                              id="edit-service-image-file"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setServiceImageFile(file);
                                }
                              }}
                              className="border-2 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                            />
                            {serviceImageFile && (
                              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <Check className="w-4 h-4 text-green-600" />
                                <p className="text-sm text-green-700 font-medium">
                                  Selected: {serviceImageFile.name} ({(serviceImageFile.size / 1024).toFixed(1)} KB)
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                          <Label htmlFor="edit-service-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            Service Name *
                          </Label>
                          <Input
                            id="edit-service-name"
                            placeholder="e.g., Classic Haircut"
                            value={serviceForm.name || ''}
                            onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                            className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-service-category" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Category *
                          </Label>
                          <Select value={serviceForm.category} onValueChange={(value) => {
                            setServiceForm({...serviceForm, category: value});
                            if (value !== 'Other') {
                              setCustomCategory('');
                            }
                          }}>
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
                              <SelectItem value="Hair Washing">Hair Washing</SelectItem>
                              <SelectItem value="Facial Treatments">Facial Treatments</SelectItem>
                              <SelectItem value="Massage">Massage</SelectItem>
                              <SelectItem value="Manicure & Pedicure">Manicure & Pedicure</SelectItem>
                              <SelectItem value="Waxing">Waxing</SelectItem>
                              <SelectItem value="Eyebrow & Eyelash">Eyebrow & Eyelash</SelectItem>
                              <SelectItem value="Makeup">Makeup</SelectItem>
                              <SelectItem value="Body Treatments">Body Treatments</SelectItem>
                              <SelectItem value="Hair Extensions">Hair Extensions</SelectItem>
                              <SelectItem value="Bridal Services">Bridal Services</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {serviceForm.category === 'Other' && (
                            <Input
                              placeholder="Enter custom category..."
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                              className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                            />
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-service-description" className="text-sm font-semibold text-gray-700">Description</Label>
                          <Textarea
                            id="edit-service-description"
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
                          <Settings className="w-5 h-5 text-purple-600" />
                          Service Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label htmlFor="edit-service-price" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Price *
                            </Label>
                            <Input
                              id="edit-service-price"
                              type="number"
                              placeholder="0.00"
                              value={serviceForm.price || ''}
                              onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                              className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="edit-service-duration" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Duration *
                            </Label>
                            <Input
                              id="edit-service-duration"
                              type="number"
                              placeholder="30"
                              value={serviceForm.duration || ''}
                              onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                              className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-service-status" className="text-sm font-semibold text-gray-700">Status</Label>
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
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-6 border-t-2 border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowEditServiceDialog(false)}
                  className="px-6 py-3 border-2 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveService}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Update Service
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Analytics Sheet */}
        <Sheet open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <SheetContent className="w-full sm:max-w-5xl max-h-[98vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Service Analytics</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Performance metrics and insights for this service.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                        <p className="text-3xl font-bold text-gray-900">247</p>
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                          <TrendingUp className="w-4 h-4" />
                          +12% from last month
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">$3,420</p>
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                          <TrendingUp className="w-4 h-4" />
                          +8% from last month
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                        <p className="text-3xl font-bold text-gray-900">4.8</p>
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4" />
                          98% satisfaction
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                        <p className="text-3xl font-bold text-gray-900">32m</p>
                        <p className="text-sm text-gray-600 font-medium flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          On time: 94%
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Bookings Chart */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Monthly Bookings
                    </CardTitle>
                    <CardDescription>Bookings trend over the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Chart visualization would go here</p>
                        <p className="text-sm text-gray-400 mt-1">Monthly bookings: Jan 45, Feb 52, Mar 48, Apr 61, May 55, Jun 67</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Revenue Trend
                    </CardTitle>
                    <CardDescription>Revenue generated over the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Chart visualization would go here</p>
                        <p className="text-sm text-gray-400 mt-1">Revenue: Jan $520, Feb $580, Mar $550, Apr $680, May $620, Jun $720</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Reviews */}
              <Card className="border-2 border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Recent Reviews
                  </CardTitle>
                  <CardDescription>Latest customer feedback for this service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Sarah Johnson", rating: 5, comment: "Excellent service! Very professional and skilled.", date: "2 days ago" },
                      { name: "Mike Chen", rating: 5, comment: "Great haircut, exactly what I wanted. Will definitely come back.", date: "1 week ago" },
                      { name: "Emma Davis", rating: 4, comment: "Good service overall, but took a bit longer than expected.", date: "2 weeks ago" },
                      { name: "James Wilson", rating: 5, comment: "Outstanding work! The attention to detail is amazing.", date: "3 weeks ago" }
                    ].map((review, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{review.name}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                          <p className="text-gray-500 text-xs">{review.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card className="border-2 border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    Performance Insights
                  </CardTitle>
                  <CardDescription>AI-powered recommendations to improve this service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">Peak Hours Optimization</h4>
                        <p className="text-green-700 text-sm">Consider adding more slots during 10 AM - 12 PM when demand is highest (85% booking rate).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-4 h-4 rounded-lg bg-blue-200 flex items-center justify-center">
                          <DollarSign className="w-3 h-3 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Pricing Strategy</h4>
                        <p className="text-blue-700 text-sm">Current price point is optimal. Consider loyalty discounts for repeat customers to increase retention.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">Service Duration</h4>
                        <p className="text-amber-700 text-sm">Average duration is 32 minutes. Consider standardizing to 30 minutes to improve scheduling efficiency.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex-shrink-0 px-6 py-6 border-t-2 border-gray-100 bg-gray-50">
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowAnalyticsDialog(false)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Close Analytics
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Manage Schedule Sheet */}
        <Sheet open={showScheduleDialog} onOpenChange={(open) => {
          if (!open) {
            setMaxBookingsPerHour('4');
            setBufferTime('15');
          }
          setShowScheduleDialog(open);
        }}>
          <SheetContent className="w-full sm:max-w-4xl max-h-[98vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Manage Schedule</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Configure availability and scheduling for {selectedService?.name}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <div className="space-y-8">
                {/* Service Overview */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-blue-600" />
                      Service Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-xl font-bold text-gray-900">{selectedService?.duration} min</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-xl font-bold text-gray-900">${selectedService?.price}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className={selectedService?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {selectedService?.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Schedule */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Weekly Schedule
                    </CardTitle>
                    <CardDescription>Set availability for each day of the week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { day: 'Monday', short: 'Mon' },
                        { day: 'Tuesday', short: 'Tue' },
                        { day: 'Wednesday', short: 'Wed' },
                        { day: 'Thursday', short: 'Thu' },
                        { day: 'Friday', short: 'Fri' },
                        { day: 'Saturday', short: 'Sat' },
                        { day: 'Sunday', short: 'Sun' }
                      ].map((dayInfo) => (
                        <div key={dayInfo.day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">{dayInfo.short}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{dayInfo.day}</h4>
                              <p className="text-sm text-gray-500">Available 9:00 AM - 6:00 PM</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Available
                            </Badge>
                            <Button variant="outline" size="sm">
                              Edit Hours
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Special Hours */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-600" />
                      Special Hours & Exceptions
                    </CardTitle>
                    <CardDescription>Configure holidays, special events, or temporary schedule changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No special hours configured</p>
                        <p className="text-sm mt-1">Add holidays, events, or temporary schedule changes</p>
                        <Button className="mt-3" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Special Hours
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Capacity Settings */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Capacity Settings
                    </CardTitle>
                    <CardDescription>Configure maximum bookings and staff allocation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Max Bookings per Hour</Label>
                        <Input
                          type="number"
                          placeholder="4"
                          value={maxBookingsPerHour}
                          onChange={(e) => setMaxBookingsPerHour(e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Buffer Time (minutes)</Label>
                        <Input
                          type="number"
                          placeholder="15"
                          value={bufferTime}
                          onChange={(e) => setBufferTime(e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-6 border-t-2 border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleDialog(false)}
                  className="px-6 py-3 border-2 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Save schedule changes
                    alert('Schedule updated successfully!');
                    setShowScheduleDialog(false);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Schedule
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Price History Sheet */}
        <Sheet open={showPriceHistoryDialog} onOpenChange={(open) => {
          if (!open) {
            setNewPrice('');
            setEffectiveDate(new Date().toISOString().split('T')[0]);
            setPriceChangeReason('');
          }
          setShowPriceHistoryDialog(open);
        }}>
          <SheetContent className="w-full sm:max-w-4xl max-h-[98vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <History className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Price History</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Track price changes and trends for {selectedService?.name}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <div className="space-y-8">
                {/* Current Price */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Current Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">${selectedService?.price}</p>
                        <p className="text-sm text-gray-600 mt-1">Effective since January 2025</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 mb-2">Current</Badge>
                        <p className="text-sm text-gray-500">Last updated: Jan 15, 2025</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Price History Timeline */}
                <Card className="border-2 border-gray-100 shadow-sm rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-600" />
                      Price History
                    </CardTitle>
                    <CardDescription>Historical price changes over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Mock price history data */}
                      {[
                        { date: 'Jan 15, 2025', price: 35, change: '+5%', reason: 'Annual price adjustment', type: 'increase' },
                        { date: 'Oct 1, 2024', price: 33.25, change: '+2.5%', reason: 'Inflation adjustment', type: 'increase' },
                        { date: 'Jul 1, 2024', price: 32.50, change: '+2%', reason: 'Seasonal pricing', type: 'increase' },
                        { date: 'Jan 1, 2024', price: 31.90, change: '-1%', reason: 'Promotional discount', type: 'decrease' },
                        { date: 'Oct 1, 2023', price: 32.20, change: '+3%', reason: 'Cost increase', type: 'increase' },
                        { date: 'Jan 1, 2023', price: 31.25, change: '0%', reason: 'Initial pricing', type: 'initial' }
                      ].map((entry, index) => (
                        <div key={index} className="flex items-start gap-4 pb-6 last:pb-0">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              entry.type === 'increase' ? 'bg-red-100' :
                              entry.type === 'decrease' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {entry.type === 'increase' ? (
                                <TrendingUp className="w-5 h-5 text-red-600" />
                              ) : entry.type === 'decrease' ? (
                                <TrendingUp className="w-5 h-5 text-green-600 rotate-180" />
                              ) : (
                                <DollarSign className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">${entry.price}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  entry.type === 'increase' ? 'bg-red-100 text-red-800' :
                                  entry.type === 'decrease' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }>
                                  {entry.change}
                                </Badge>
                                <span className="text-sm text-gray-500">{entry.date}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{entry.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Price Analytics */}
                <Card className="border-2  border-gray-100 shadow-sm rounded-2xl height-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Price Analytics
                    </CardTitle>
                    <CardDescription>Price performance and trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Total Change</p>
                        <p className="text-xl font-bold text-blue-600">+11.8%</p>
                        <p className="text-xs text-gray-500 mt-1">Since Jan 2023</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Avg. Annual Change</p>
                        <p className="text-xl font-bold text-green-600">+3.9%</p>
                        <p className="text-xs text-gray-500 mt-1">Per year</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Last Change</p>
                        <p className="text-xl font-bold text-purple-600">4 months</p>
                        <p className="text-xs text-gray-500 mt-1">Ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Update */}
                <Card className="border-2 border-gray-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Edit className="w-5 h-5 text-amber-600" />
                      Update Price
                    </CardTitle>
                    <CardDescription>Change the current price for this service</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700">New Price</Label>
                          <Input
                            type="number"
                            placeholder="35.00"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="h-12 border-2 border-gray-200 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700">Effective Date</Label>
                          <Input
                            type="date"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="h-12 border-2 border-gray-200 focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Reason for Change</Label>
                        <Textarea
                          placeholder="Explain the reason for this price change..."
                          value={priceChangeReason}
                          onChange={(e) => setPriceChangeReason(e.target.value)}
                          className="min-h-20 border-2 border-gray-200 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-6 border-t-2 border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowPriceHistoryDialog(false)}
                  className="px-6 py-3 border-2 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="px-6 py-3"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Export History
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: Save price change
                      alert('Price updated successfully!');
                      setShowPriceHistoryDialog(false);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Update Price
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </ProtectedRoute>
  );
}