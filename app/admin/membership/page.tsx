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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift,
  Tag,
  Star,
  DollarSign,
  Plus,
  Edit,
  MoreVertical,
  Search,
  Filter,
  Upload,
  X,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Percent,
  Users,
  Award,
  CreditCard,
  TrendingUp,
  FileText,
  Building,
  Settings,
  Package
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useServicesStore } from '@/stores/services.store';
import {
  useMembershipStore,
  type Offer,
  type PromoCode,
  type LoyaltyProgram,
  type CashbackProgram
} from "@/stores/membership.store";

const getOfferTypeLabel = (type: string) => {
  switch (type) {
    case 'service': return 'Service';
    case 'product': return 'Product';
    case 'combo': return 'Combo';
    case 'birthday': return 'Birthday Special';
    case 'first_time_registration': return 'First Time Registration';
    case 'promotional_package': return 'Promotional Package';
    default: return type;
  }
};

export default function AdminMembership() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const {
    offers,
    promoCodes,
    loyaltyPrograms,
    cashbackPrograms,
    addOffer,
    updateOffer,
    deleteOffer,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    addLoyaltyProgram,
    updateLoyaltyProgram,
    deleteLoyaltyProgram,
    addCashbackProgram,
    updateCashbackProgram,
    deleteCashbackProgram,
    getOffersByBranch,
    getPromoCodesByBranch,
    getLoyaltyProgramsByBranch,
    getCashbackProgramsByBranch,
    getActiveOffers,
    getActivePromoCodes,
  } = useMembershipStore();

  // Admin sees data for their branch (assuming branchId from user context)
  // For now, using a mock branch ID - in real app this would come from user context
  const adminBranchId = 'branch1'; // This should come from user.branchId

  const branchOffers = getOffersByBranch(adminBranchId);
  const branchPromoCodes = getPromoCodesByBranch(adminBranchId);
  const branchLoyaltyPrograms = getLoyaltyProgramsByBranch(adminBranchId);
  const branchCashbackPrograms = getCashbackProgramsByBranch(adminBranchId);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Dialog states
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [loyaltyDialogOpen, setLoyaltyDialogOpen] = useState(false);
  const [cashbackDialogOpen, setCashbackDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { getServicesByBranch } = useServicesStore();
  const services = getServicesByBranch(adminBranchId);
  const [dialogType, setDialogType] = useState<'offer' | 'promo' | 'loyalty' | 'cashback'>('offer');

  // Form states
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    type: 'service' as 'service' | 'product' | 'combo' | 'birthday' | 'first_time_registration' | 'promotional_package',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    applicableItems: [] as string[],
    applicableServices: [] as string[],
    offerFor: 'single' as 'single' | 'series',
    image: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    isActive: true
  });

  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minimumPurchase: '',
    maximumDiscount: '',
    applicableCategories: [] as string[],
    validFrom: '',
    validTo: '',
    usageLimit: '',
    isActive: true
  });

  const [loyaltyForm, setLoyaltyForm] = useState({
    name: '',
    description: '',
    pointsPerDollar: 1,
    redemptionRate: 0.01,
    minimumPoints: 100,
    maximumPoints: '',
    expiryDays: 365,
    isActive: true
  });

  const [cashbackForm, setCashbackForm] = useState({
    name: '',
    description: '',
    cashbackType: 'percentage' as 'percentage' | 'fixed',
    cashbackValue: 0,
    minimumPurchase: '',
    applicableCategories: [] as string[],
    validFrom: '',
    validTo: '',
    isActive: true
  });

  const resetForms = () => {
    setOfferForm({
      title: '',
      description: '',
      type: 'service',
      discountType: 'percentage',
      discountValue: 0,
      applicableItems: [],
      applicableServices: [],
      offerFor: 'single',
      image: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      isActive: true
    });
    setPromoForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumPurchase: '',
      maximumDiscount: '',
      applicableCategories: [],
      validFrom: '',
      validTo: '',
      usageLimit: '',
      isActive: true
    });
    setLoyaltyForm({
      name: '',
      description: '',
      pointsPerDollar: 1,
      redemptionRate: 0.01,
      minimumPoints: 100,
      maximumPoints: '',
      expiryDays: 365,
      isActive: true
    });
    setCashbackForm({
      name: '',
      description: '',
      cashbackType: 'percentage',
      cashbackValue: 0,
      minimumPurchase: '',
      applicableCategories: [],
      validFrom: '',
      validTo: '',
      isActive: true
    });
  };

  // Filter functions
  const getFilteredOffers = () => {
    return branchOffers.filter(offer => {
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && offer.isActive) ||
                           (statusFilter === 'inactive' && !offer.isActive);
      return matchesStatus;
    });
  };

  const getFilteredPromoCodes = () => {
    return branchPromoCodes.filter(promo => {
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && promo.isActive) ||
                           (statusFilter === 'inactive' && !promo.isActive);
      return matchesStatus;
    });
  };

  const getFilteredLoyaltyPrograms = () => {
    return branchLoyaltyPrograms.filter(program => {
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && program.isActive) ||
                           (statusFilter === 'inactive' && !program.isActive);
      return matchesStatus;
    });
  };

  const getFilteredCashbackPrograms = () => {
    return branchCashbackPrograms.filter(program => {
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && program.isActive) ||
                           (statusFilter === 'inactive' && !program.isActive);
      return matchesStatus;
    });
  };

  // Initialize with sample data
  useEffect(() => {
    if (branchOffers.length === 0 && services.length > 0) {
      const mockOffers: Omit<Offer, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>[] = [
        {
          title: 'Birthday Special Offer',
          description: '25% off any service on your birthday',
          type: 'birthday',
          discountType: 'percentage',
          discountValue: 25,
          applicableItems: [],
          applicableServices: [],
          offerFor: 'single',
          image: '/api/placeholder/700/400',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          branchId: adminBranchId,
          isActive: true
        },
        {
          title: 'Welcome to Our Salon!',
          description: '30% off your first visit',
          type: 'first_time_registration',
          discountType: 'percentage',
          discountValue: 30,
          applicableItems: [],
          applicableServices: [],
          offerFor: 'single',
          image: '/api/placeholder/600/400',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          branchId: adminBranchId,
          isActive: true
        },
        {
          title: 'Complete Spa Package',
          description: 'Massage + Facial + Manicure package',
          type: 'promotional_package',
          discountType: 'percentage',
          discountValue: 15,
          applicableItems: [],
          applicableServices: services.slice(0, 3).map(s => s.id),
          offerFor: 'series',
          image: '/api/placeholder/800/500',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          branchId: adminBranchId,
          isActive: true
        },
      ];

      mockOffers.forEach(offer => addOffer(offer));
    }

    if (branchPromoCodes.length === 0) {
      const mockPromos: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>[] = [
        {
          code: 'WELCOME30',
          description: '30% off first visit',
          discountType: 'percentage',
          discountValue: 30,
          minimumPurchase: 50,
          applicableCategories: [],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          branchId: adminBranchId,
          isActive: true
        },
      ];

      mockPromos.forEach(promo => addPromoCode(promo));
    }

    if (branchLoyaltyPrograms.length === 0) {
      const mockLoyalty: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Downtown Rewards',
          description: 'Earn points on every purchase',
          pointsPerDollar: 1,
          redemptionRate: 0.01,
          minimumPoints: 100,
          expiryDays: 365,
          branchId: adminBranchId,
          isActive: true
        },
      ];

      mockLoyalty.forEach(program => addLoyaltyProgram(program));
    }

    if (branchCashbackPrograms.length === 0) {
      const mockCashback: Omit<CashbackProgram, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Cashback Rewards',
          description: 'Get cashback on purchases over $100',
          cashbackType: 'percentage',
          cashbackValue: 5,
          minimumPurchase: 100,
          applicableCategories: [],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          branchId: adminBranchId,
          isActive: true
        },
      ];

      mockCashback.forEach(program => addCashbackProgram(program));
    }
  }, [branchOffers.length, branchPromoCodes.length, branchLoyaltyPrograms.length, branchCashbackPrograms.length, services.length]);

  const handleAddOffer = () => {
    if (!offerForm.title.trim()) return;

    addOffer({
      ...offerForm,
      validFrom: new Date(offerForm.validFrom),
      validTo: new Date(offerForm.validTo),
      usageLimit: offerForm.usageLimit ? parseInt(offerForm.usageLimit) : undefined,
      branchId: adminBranchId,
    });

    setOfferDialogOpen(false);
    resetForms();
  };

  const handleAddPromoCode = () => {
    if (!promoForm.code.trim()) return;

    addPromoCode({
      ...promoForm,
      minimumPurchase: promoForm.minimumPurchase ? parseFloat(promoForm.minimumPurchase) : undefined,
      maximumDiscount: promoForm.maximumDiscount ? parseFloat(promoForm.maximumDiscount) : undefined,
      validFrom: new Date(promoForm.validFrom),
      validTo: new Date(promoForm.validTo),
      usageLimit: promoForm.usageLimit ? parseInt(promoForm.usageLimit) : undefined,
      branchId: adminBranchId,
    });

    setPromoDialogOpen(false);
    resetForms();
  };

  const handleAddLoyaltyProgram = () => {
    if (!loyaltyForm.name.trim()) return;

    addLoyaltyProgram({
      ...loyaltyForm,
      maximumPoints: loyaltyForm.maximumPoints ? parseInt(loyaltyForm.maximumPoints) : undefined,
      branchId: adminBranchId,
    });

    setLoyaltyDialogOpen(false);
    resetForms();
  };

  const handleAddCashbackProgram = () => {
    if (!cashbackForm.name.trim()) return;

    addCashbackProgram({
      ...cashbackForm,
      minimumPurchase: cashbackForm.minimumPurchase ? parseFloat(cashbackForm.minimumPurchase) : undefined,
      validFrom: new Date(cashbackForm.validFrom),
      validTo: new Date(cashbackForm.validTo),
      branchId: adminBranchId,
    });

    setCashbackDialogOpen(false);
    resetForms();
  };

  const openEditDialog = (item: any, type: typeof dialogType) => {
    setSelectedItem(item);
    setDialogType(type);

    switch (type) {
      case 'offer':
        setOfferForm({
          title: item.title,
          description: item.description,
          type: item.type,
          discountType: item.discountType,
          discountValue: item.discountValue,
          applicableItems: item.applicableItems,
          applicableServices: item.applicableServices || [],
          offerFor: item.offerFor || 'single',
          image: item.image || '',
          validFrom: item.validFrom.toISOString().split('T')[0],
          validTo: item.validTo.toISOString().split('T')[0],
          usageLimit: item.usageLimit?.toString() || '',
          isActive: item.isActive
        });
        setOfferDialogOpen(true);
        break;
      case 'promo':
        setPromoForm({
          code: item.code,
          description: item.description,
          discountType: item.discountType,
          discountValue: item.discountValue,
          minimumPurchase: item.minimumPurchase?.toString() || '',
          maximumDiscount: item.maximumDiscount?.toString() || '',
          applicableCategories: item.applicableCategories,
          validFrom: item.validFrom.toISOString().split('T')[0],
          validTo: item.validTo.toISOString().split('T')[0],
          usageLimit: item.usageLimit?.toString() || '',
          isActive: item.isActive
        });
        setPromoDialogOpen(true);
        break;
    }
  };

  const openDeleteDialog = (item: any, type: typeof dialogType) => {
    setSelectedItem(item);
    setDialogType(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    switch (dialogType) {
      case 'offer':
        deleteOffer(selectedItem.id);
        break;
      case 'promo':
        deletePromoCode(selectedItem.id);
        break;
      case 'loyalty':
        deleteLoyaltyProgram(selectedItem.id);
        break;
      case 'cashback':
        deleteCashbackProgram(selectedItem.id);
        break;
    }

    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  return (
    <ProtectedRoute requiredRole="branch_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <AdminSidebar
          role="branch_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Mobile Sidebar */}
        <AdminMobileSidebar
          role="branch_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <AdminMobileSidebar
                role="branch_admin"
                onLogout={handleLogout}
              />
              <h1 className="text-lg font-semibold text-gray-900">Membership & Offers</h1>
              <div className="w-8" />
            </div>
          </div>

          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Membership Management</h1>
                <p className="text-gray-600">Manage offers, promo codes, loyalty programs, and cashback for your branch</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                  <SelectTrigger className="w-32">
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
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <Tabs defaultValue="offers" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="offers" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Offers
                </TabsTrigger>
                <TabsTrigger value="promo-codes" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Promo Codes
                </TabsTrigger>
                <TabsTrigger value="loyalty" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Loyalty Points
                </TabsTrigger>
                <TabsTrigger value="cashback" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Cashback
                </TabsTrigger>
              </TabsList>

              {/* Offers Tab */}
              <TabsContent value="offers" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Special Offers</h2>
                    <p className="text-gray-600">Create and manage special offers for your customers</p>
                  </div>
                  <Button onClick={() => setOfferDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Offer
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredOffers().map((offer) => (
                    <Card key={offer.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{offer.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={offer.type === 'service' ? 'default' : 'secondary'}>
                                {getOfferTypeLabel(offer.type)}
                              </Badge>
                              {offer.offerFor === 'series' && (
                                <Badge variant="secondary">Series</Badge>
                              )}
                              <Badge variant={offer.isActive ? 'default' : 'outline'}>
                                {offer.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(offer, 'offer')}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateOffer(offer.id, { isActive: !offer.isActive })}
                              >
                                {offer.isActive ? (
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
                                onClick={() => openDeleteDialog(offer, 'offer')}
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
                        <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
                        <div className="space-y-2">
                          {offer.applicableServices && offer.applicableServices.length > 0 && (
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">Services:</span> {offer.applicableServices.map(id => services.find(s => s.id === id)?.name || id).join(', ')}
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium">
                              {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Valid until:</span>
                            <span className="font-medium">
                              {offer.validTo instanceof Date ? offer.validTo.toLocaleDateString() : new Date(offer.validTo).toLocaleDateString()}
                            </span>
                          </div>
                          {offer.usageLimit && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Usage:</span>
                              <span className="font-medium">{offer.usedCount}/{offer.usageLimit}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Promo Codes Tab */}
              <TabsContent value="promo-codes" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Promo Codes</h2>
                    <p className="text-gray-600">Create discount codes for your branch</p>
                  </div>
                  <Button onClick={() => setPromoDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Promo Code
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredPromoCodes().map((promo) => (
                    <Card key={promo.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-mono">{promo.code}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={promo.isActive ? 'default' : 'outline'}>
                                {promo.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(promo, 'promo')}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updatePromoCode(promo.id, { isActive: !promo.isActive })}
                              >
                                {promo.isActive ? (
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
                                onClick={() => openDeleteDialog(promo, 'promo')}
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
                        <p className="text-sm text-gray-600 mb-4">{promo.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium">
                              {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                            </span>
                          </div>
                          {promo.minimumPurchase && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Min. Purchase:</span>
                              <span className="font-medium">${promo.minimumPurchase}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Valid until:</span>
                            <span className="font-medium">{promo.validTo.toLocaleDateString()}</span>
                          </div>
                          {promo.usageLimit && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Usage:</span>
                              <span className="font-medium">{promo.usedCount}/{promo.usageLimit}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Loyalty Tab */}
              <TabsContent value="loyalty" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Loyalty Programs</h2>
                    <p className="text-gray-600">Manage customer loyalty points programs</p>
                  </div>
                  <Button onClick={() => setLoyaltyDialogOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Loyalty Program
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredLoyaltyPrograms().map((program) => (
                    <Card key={program.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{program.name}</CardTitle>
                            <Badge variant={program.isActive ? 'default' : 'outline'} className="mt-2">
                              {program.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(program, 'loyalty')}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateLoyaltyProgram(program.id, { isActive: !program.isActive })}
                              >
                                {program.isActive ? (
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
                                onClick={() => openDeleteDialog(program, 'loyalty')}
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
                        <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Points per $:</span>
                            <span className="font-medium">{program.pointsPerDollar}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Redemption Rate:</span>
                            <span className="font-medium">${program.redemptionRate}/point</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Min. Points:</span>
                            <span className="font-medium">{program.minimumPoints}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Expiry:</span>
                            <span className="font-medium">{program.expiryDays} days</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Cashback Tab */}
              <TabsContent value="cashback" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Cashback Programs</h2>
                    <p className="text-gray-600">Set up cashback rewards for customers</p>
                  </div>
                  <Button onClick={() => setCashbackDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cashback Program
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredCashbackPrograms().map((program) => (
                    <Card key={program.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{program.name}</CardTitle>
                            <Badge variant={program.isActive ? 'default' : 'outline'} className="mt-2">
                              {program.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(program, 'cashback')}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateCashbackProgram(program.id, { isActive: !program.isActive })}
                              >
                                {program.isActive ? (
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
                                onClick={() => openDeleteDialog(program, 'cashback')}
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
                        <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cashback:</span>
                            <span className="font-medium">
                              {program.cashbackType === 'percentage' ? `${program.cashbackValue}%` : `$${program.cashbackValue}`}
                            </span>
                          </div>
                          {program.minimumPurchase && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Min. Purchase:</span>
                              <span className="font-medium">${program.minimumPurchase}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Valid until:</span>
                            <span className="font-medium">{program.validTo.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Offer Dialog */}
        <Sheet open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="border-b border-gray-200 pb-6 mb-6">
              <SheetTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-600" />
                Add Special Offer
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                Create a new special offer for your customers with custom discounts and conditions.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="offer-title" className="text-sm font-medium text-gray-700">Offer Title</Label>
                    <Input
                      id="offer-title"
                      value={offerForm.title}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Birthday Special"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offer-description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="offer-description"
                      value={offerForm.description}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the offer and its benefits"
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Offer Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Offer Configuration</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="offer-type" className="text-sm font-medium text-gray-700">Offer Type</Label>
                    <Select
                      value={offerForm.type}
                      onValueChange={(value: 'service' | 'product' | 'combo' | 'birthday' | 'first_time_registration' | 'promotional_package') =>
                        setOfferForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service Discount</SelectItem>
                        <SelectItem value="product">Product Discount</SelectItem>
                        <SelectItem value="combo">Combo Deal</SelectItem>
                        <SelectItem value="birthday">Birthday Special</SelectItem>
                        <SelectItem value="first_time_registration">First Time Registration</SelectItem>
                        <SelectItem value="promotional_package">Promotional Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="offer-discount-type" className="text-sm font-medium text-gray-700">Discount Type</Label>
                    <Select
                      value={offerForm.discountType}
                      onValueChange={(value: 'percentage' | 'fixed') =>
                        setOfferForm(prev => ({ ...prev, discountType: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Off</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="offer-discount-value" className="text-sm font-medium text-gray-700">
                    Discount Value ({offerForm.discountType === 'percentage' ? '%' : '$'})
                  </Label>
                  <Input
                    id="offer-discount-value"
                    type="number"
                    value={offerForm.discountValue}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                    placeholder={offerForm.discountType === 'percentage' ? "20" : "10.00"}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Service Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Check className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Applicable Services</h3>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Select Services</Label>
                  <div className="border border-gray-200 rounded-lg p-4 mt-1 max-h-48 overflow-y-auto bg-gray-50">
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white transition-colors">
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={offerForm.applicableServices.includes(service.id)}
                            onChange={(e) => {
                              const serviceId = service.id;
                              setOfferForm(prev => ({
                                ...prev,
                                applicableServices: e.target.checked
                                  ? [...prev.applicableServices, serviceId]
                                  : prev.applicableServices.filter(id => id !== serviceId)
                              }));
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                          />
                          <Label htmlFor={`service-${service.id}`} className="text-sm cursor-pointer flex-1">
                            <span className="font-medium text-gray-900">{service.name}</span>
                            {service.price && (
                              <span className="text-gray-500 ml-2">(${service.price})</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {services.length === 0 && (
                      <div className="text-center py-8">
                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No services available</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the services this offer applies to. Leave empty to apply to all services.
                  </p>
                </div>
              </div>

              {/* Validity Period Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Validity Period</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="offer-valid-from" className="text-sm font-medium text-gray-700">Valid From</Label>
                    <Input
                      id="offer-valid-from"
                      type="date"
                      value={offerForm.validFrom}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, validFrom: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offer-valid-to" className="text-sm font-medium text-gray-700">Valid To</Label>
                    <Input
                      id="offer-valid-to"
                      type="date"
                      value={offerForm.validTo}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, validTo: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Status</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="offer-active"
                    checked={offerForm.isActive}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="offer-active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Activate this offer immediately
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
              <Button variant="outline" onClick={() => setOfferDialogOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button onClick={handleAddOffer} className="px-6 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Offer
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Promo Code Dialog */}
        <Sheet open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="border-b border-gray-200 pb-6 mb-6">
              <SheetTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                Add Promo Code
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                Create a new promotional code with custom discounts and usage limits.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="promo-code" className="text-sm font-medium text-gray-700">Promo Code</Label>
                    <Input
                      id="promo-code"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., WELCOME20"
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="promo-description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="promo-description"
                      value={promoForm.description}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this promo code offers"
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Discount Configuration</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="promo-discount-type" className="text-sm font-medium text-gray-700">Discount Type</Label>
                    <Select
                      value={promoForm.discountType}
                      onValueChange={(value: 'percentage' | 'fixed') =>
                        setPromoForm(prev => ({ ...prev, discountType: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Off</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="promo-discount-value" className="text-sm font-medium text-gray-700">
                      Discount Value ({promoForm.discountType === 'percentage' ? '%' : '$'})
                    </Label>
                    <Input
                      id="promo-discount-value"
                      type="number"
                      value={promoForm.discountValue}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                      placeholder={promoForm.discountType === 'percentage' ? "20" : "10.00"}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="promo-minimum-purchase" className="text-sm font-medium text-gray-700">Minimum Purchase ($)</Label>
                  <Input
                    id="promo-minimum-purchase"
                    type="number"
                    value={promoForm.minimumPurchase}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, minimumPurchase: e.target.value }))}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Usage Limits Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Users className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Usage Limits</h3>
                </div>
                <div>
                  <Label htmlFor="promo-max-uses" className="text-sm font-medium text-gray-700">Max Uses (Total)</Label>
                  <Input
                    id="promo-max-uses"
                    type="number"
                    value={promoForm.usageLimit}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum number of times this promo code can be used</p>
                </div>
              </div>

              {/* Validity Period Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Validity Period</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="promo-valid-from" className="text-sm font-medium text-gray-700">Valid From</Label>
                    <Input
                      id="promo-valid-from"
                      type="date"
                      value={promoForm.validFrom}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, validFrom: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="promo-valid-to" className="text-sm font-medium text-gray-700">Valid To</Label>
                    <Input
                      id="promo-valid-to"
                      type="date"
                      value={promoForm.validTo}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, validTo: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Status</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="promo-active"
                    checked={promoForm.isActive}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="promo-active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Activate this promo code immediately
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
              <Button variant="outline" onClick={() => setPromoDialogOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button onClick={handleAddPromoCode} className="px-6 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Promo Code
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Loyalty Dialog */}
        <Sheet open={loyaltyDialogOpen} onOpenChange={setLoyaltyDialogOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="border-b border-gray-200 pb-6 mb-6">
              <SheetTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Add Loyalty Program
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                Create a loyalty points program to reward customer purchases and encourage repeat business.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="loyalty-name" className="text-sm font-medium text-gray-700">Program Name</Label>
                    <Input
                      id="loyalty-name"
                      value={loyaltyForm.name}
                      onChange={(e) => setLoyaltyForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Premium Rewards"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loyalty-description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="loyalty-description"
                      value={loyaltyForm.description}
                      onChange={(e) => setLoyaltyForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe how customers can earn and redeem points"
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Points Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Points Configuration</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loyalty-points-per-dollar" className="text-sm font-medium text-gray-700">Points per Dollar</Label>
                    <Input
                      id="loyalty-points-per-dollar"
                      type="number"
                      value={loyaltyForm.pointsPerDollar}
                      onChange={(e) => setLoyaltyForm(prev => ({ ...prev, pointsPerDollar: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Points earned per $1 spent</p>
                  </div>
                  <div>
                    <Label htmlFor="loyalty-redemption-rate" className="text-sm font-medium text-gray-700">Redemption Rate</Label>
                    <Input
                      id="loyalty-redemption-rate"
                      type="number"
                      step="0.01"
                      value={loyaltyForm.redemptionRate}
                      onChange={(e) => setLoyaltyForm(prev => ({ ...prev, redemptionRate: parseFloat(e.target.value) || 0.01 }))}
                      placeholder="0.01"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">$ value per point redeemed</p>
                  </div>
                </div>
              </div>

              {/* Redemption Rules Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Award className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Redemption Rules</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loyalty-min-points" className="text-sm font-medium text-gray-700">Minimum Points for Redemption</Label>
                    <Input
                      id="loyalty-min-points"
                      type="number"
                      value={loyaltyForm.minimumPoints}
                      onChange={(e) => setLoyaltyForm(prev => ({ ...prev, minimumPoints: parseInt(e.target.value) || 100 }))}
                      placeholder="100"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum points required to redeem</p>
                  </div>
                  <div>
                    <Label htmlFor="loyalty-expiry" className="text-sm font-medium text-gray-700">Points Expiry (days)</Label>
                    <Input
                      id="loyalty-expiry"
                      type="number"
                      value={loyaltyForm.expiryDays}
                      onChange={(e) => setLoyaltyForm(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 365 }))}
                      placeholder="365"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Days until points expire</p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Status</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="loyalty-active"
                    checked={loyaltyForm.isActive}
                    onChange={(e) => setLoyaltyForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <Label htmlFor="loyalty-active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Activate this loyalty program immediately
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
              <Button variant="outline" onClick={() => setLoyaltyDialogOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button onClick={handleAddLoyaltyProgram} className="px-6 bg-yellow-600 hover:bg-yellow-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Program
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Cashback Dialog */}
        <Sheet open={cashbackDialogOpen} onOpenChange={setCashbackDialogOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="border-b border-gray-200 pb-6 mb-6">
              <SheetTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Add Cashback Program
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                Create a cashback rewards program to give customers money back on their purchases.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="cashback-name" className="text-sm font-medium text-gray-700">Program Name</Label>
                    <Input
                      id="cashback-name"
                      value={cashbackForm.name}
                      onChange={(e) => setCashbackForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Premium Cashback"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cashback-description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="cashback-description"
                      value={cashbackForm.description}
                      onChange={(e) => setCashbackForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe how customers can earn cashback rewards"
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Cashback Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Cashback Configuration</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cashback-type" className="text-sm font-medium text-gray-700">Cashback Type</Label>
                    <Select
                      value={cashbackForm.cashbackType}
                      onValueChange={(value: 'percentage' | 'fixed') =>
                        setCashbackForm(prev => ({ ...prev, cashbackType: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage of Purchase</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cashback-value" className="text-sm font-medium text-gray-700">
                      Cashback Value ({cashbackForm.cashbackType === 'percentage' ? '%' : '$'})
                    </Label>
                    <Input
                      id="cashback-value"
                      type="number"
                      value={cashbackForm.cashbackValue}
                      onChange={(e) => setCashbackForm(prev => ({ ...prev, cashbackValue: parseFloat(e.target.value) || 0 }))}
                      placeholder={cashbackForm.cashbackType === 'percentage' ? "5" : "10.00"}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cashback-minimum-purchase" className="text-sm font-medium text-gray-700">Minimum Purchase ($)</Label>
                  <Input
                    id="cashback-minimum-purchase"
                    type="number"
                    value={cashbackForm.minimumPurchase}
                    onChange={(e) => setCashbackForm(prev => ({ ...prev, minimumPurchase: e.target.value }))}
                    placeholder="100.00"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum purchase amount required to earn cashback</p>
                </div>
              </div>

              {/* Validity Period Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Validity Period</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cashback-valid-from" className="text-sm font-medium text-gray-700">Valid From</Label>
                    <Input
                      id="cashback-valid-from"
                      type="date"
                      value={cashbackForm.validFrom}
                      onChange={(e) => setCashbackForm(prev => ({ ...prev, validFrom: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cashback-valid-to" className="text-sm font-medium text-gray-700">Valid To</Label>
                    <Input
                      id="cashback-valid-to"
                      type="date"
                      value={cashbackForm.validTo}
                      onChange={(e) => setCashbackForm(prev => ({ ...prev, validTo: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Status</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cashback-active"
                    checked={cashbackForm.isActive}
                    onChange={(e) => setCashbackForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor="cashback-active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Activate this cashback program immediately
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
              <Button variant="outline" onClick={() => setCashbackDialogOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button onClick={handleAddCashbackProgram} className="px-6 bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Program
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <Sheet open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Confirm Deletion</SheetTitle>
              <SheetDescription>
                Are you sure you want to delete this {dialogType}? This action cannot be undone.
              </SheetDescription>
            </SheetHeader>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </ProtectedRoute>
  );
}