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
  Crown,
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
  type Membership,
  type Offer,
  type PromoCode,
  type LoyaltyProgram,
  type CashbackProgram,
  type MembershipTier
} from "@/stores/membership.store";

// Mock branches data - in real app this would come from a branches store
const mockBranches = [
  { id: 'branch1', name: 'Downtown Salon' },
  { id: 'branch2', name: 'Uptown Spa' },
  { id: 'branch3', name: 'Mall Location' },
];

const membershipTiers: { value: MembershipTier; label: string; color: string }[] = [
  { value: 'bronze', label: 'Bronze', color: 'bg-amber-100 text-amber-800' },
  { value: 'silver', label: 'Silver', color: 'bg-gray-100 text-gray-800' },
  { value: 'gold', label: 'Gold', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'platinum', label: 'Platinum', color: 'bg-blue-100 text-blue-800' },
  { value: 'diamond', label: 'Diamond', color: 'bg-purple-100 text-purple-800' },
];

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

// Services are driven from a central service store

export default function SuperAdminMembership() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const {
    memberships,
    offers,
    promoCodes,
    loyaltyPrograms,
    cashbackPrograms,
    addMembership,
    updateMembership,
    deleteMembership,
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
    getMembershipsByBranch,
    getOffersByBranch,
    getPromoCodesByBranch,
    getLoyaltyProgramsByBranch,
    getCashbackProgramsByBranch,
    getActiveOffers,
    getActivePromoCodes,
  } = useMembershipStore();

  // Super admin sees all data
  const allMemberships = getMembershipsByBranch(); // No branchId = super admin view
  const allOffers = getOffersByBranch();
  const allPromoCodes = getPromoCodesByBranch();
  const allLoyaltyPrograms = getLoyaltyProgramsByBranch();
  const allCashbackPrograms = getCashbackProgramsByBranch();

  // Filters
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Dialog states
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [loyaltyDialogOpen, setLoyaltyDialogOpen] = useState(false);
  const [cashbackDialogOpen, setCashbackDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
    const { getServicesByBranch } = useServicesStore();
    const services = branchFilter === 'all' ? getServicesByBranch() : getServicesByBranch(branchFilter);
  const [dialogType, setDialogType] = useState<'membership' | 'offer' | 'promo' | 'loyalty' | 'cashback'>('membership');

  // Form states
  const [membershipForm, setMembershipForm] = useState({
    name: '',
    tier: 'bronze' as MembershipTier,
    description: '',
    price: 0,
    duration: 1,
    benefits: [] as string[],
    branchId: '', // Empty string = global membership
    isActive: true
  });

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
    membershipRequired: [] as MembershipTier[],
    branchId: '', // Empty string = global offer
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
    membershipRequired: [] as MembershipTier[],
    branchId: '', // Empty string = global promo
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
    branchId: '', // Empty string = global program
    isActive: true
  });

  const [cashbackForm, setCashbackForm] = useState({
    name: '',
    description: '',
    cashbackType: 'percentage' as 'percentage' | 'fixed',
    cashbackValue: 0,
    minimumPurchase: '',
    applicableCategories: [] as string[],
    membershipRequired: [] as MembershipTier[],
    branchId: '', // Empty string = global program
    validFrom: '',
    validTo: '',
    isActive: true
  });

  const resetForms = () => {
    setMembershipForm({
      name: '',
      tier: 'bronze',
      description: '',
      price: 0,
      duration: 1,
      benefits: [],
      branchId: '',
      isActive: true
    });
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
      membershipRequired: [],
      branchId: '',
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
      membershipRequired: [],
      branchId: '',
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
      branchId: '',
      isActive: true
    });
    setCashbackForm({
      name: '',
      description: '',
      cashbackType: 'percentage',
      cashbackValue: 0,
      minimumPurchase: '',
      applicableCategories: [],
      membershipRequired: [],
      branchId: '',
      validFrom: '',
      validTo: '',
      isActive: true
    });
  };

  // Filter functions
  const getFilteredMemberships = () => {
    return allMemberships.filter(membership => {
      const matchesBranch = branchFilter === 'all' ||
                           (branchFilter === 'global' && !membership.branchId) ||
                           membership.branchId === branchFilter;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && membership.isActive) ||
                           (statusFilter === 'inactive' && !membership.isActive);
      return matchesBranch && matchesStatus;
    });
  };

  const getFilteredOffers = () => {
    return allOffers.filter(offer => {
      const matchesBranch = branchFilter === 'all' ||
                           (branchFilter === 'global' && !offer.branchId) ||
                           offer.branchId === branchFilter;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && offer.isActive) ||
                           (statusFilter === 'inactive' && !offer.isActive);
      return matchesBranch && matchesStatus;
    });
  };

  const getFilteredPromoCodes = () => {
    return allPromoCodes.filter(promo => {
      const matchesBranch = branchFilter === 'all' ||
                           (branchFilter === 'global' && !promo.branchId) ||
                           promo.branchId === branchFilter;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && promo.isActive) ||
                           (statusFilter === 'inactive' && !promo.isActive);
      return matchesBranch && matchesStatus;
    });
  };

  const getFilteredLoyaltyPrograms = () => {
    return allLoyaltyPrograms.filter(program => {
      const matchesBranch = branchFilter === 'all' ||
                           (branchFilter === 'global' && !program.branchId) ||
                           program.branchId === branchFilter;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && program.isActive) ||
                           (statusFilter === 'inactive' && !program.isActive);
      return matchesBranch && matchesStatus;
    });
  };

  const getFilteredCashbackPrograms = () => {
    return allCashbackPrograms.filter(program => {
      const matchesBranch = branchFilter === 'all' ||
                           (branchFilter === 'global' && !program.branchId) ||
                           program.branchId === branchFilter;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && program.isActive) ||
                           (statusFilter === 'inactive' && !program.isActive);
      return matchesBranch && matchesStatus;
    });
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'Global';
    const branch = mockBranches.find(b => b.id === branchId);
    return branch ? branch.name : `Branch ${branchId}`;
  };

  const handleAddMembership = () => {
    if (!membershipForm.name.trim()) return;

    addMembership({
      ...membershipForm,
      branchId: membershipForm.branchId || undefined, // Convert empty string to undefined for global
    });

    setMembershipDialogOpen(false);
    resetForms();
  };

  const handleEditMembership = () => {
    if (!selectedItem || !membershipForm.name.trim()) return;

    updateMembership(selectedItem.id, {
      ...membershipForm,
      branchId: membershipForm.branchId || undefined
    });
    setMembershipDialogOpen(false);
    setSelectedItem(null);
    resetForms();
  };

  const handleAddOffer = () => {
    if (!offerForm.title.trim()) return;

    addOffer({
      ...offerForm,
      validFrom: new Date(offerForm.validFrom),
      validTo: new Date(offerForm.validTo),
      usageLimit: offerForm.usageLimit ? parseInt(offerForm.usageLimit) : undefined,
      branchId: offerForm.branchId || undefined,
    });

    setOfferDialogOpen(false);
    resetForms();
  };

  const handleEditOffer = () => {
    if (!selectedItem || !offerForm.title.trim()) return;

    updateOffer(selectedItem.id, {
      ...offerForm,
      validFrom: new Date(offerForm.validFrom),
      validTo: new Date(offerForm.validTo),
      usageLimit: offerForm.usageLimit ? parseInt(offerForm.usageLimit) : undefined,
      branchId: offerForm.branchId || undefined,
    });

    setOfferDialogOpen(false);
    setSelectedItem(null);
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
      branchId: promoForm.branchId || undefined,
    });

    setPromoDialogOpen(false);
    resetForms();
  };

  const handleAddLoyaltyProgram = () => {
    if (!loyaltyForm.name.trim()) return;

    addLoyaltyProgram({
      ...loyaltyForm,
      maximumPoints: loyaltyForm.maximumPoints ? parseInt(loyaltyForm.maximumPoints) : undefined,
      branchId: loyaltyForm.branchId || undefined,
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
      branchId: cashbackForm.branchId || undefined,
    });

    setCashbackDialogOpen(false);
    resetForms();
  };

  const openEditDialog = (item: any, type: typeof dialogType) => {
    setSelectedItem(item);
    setDialogType(type);

    switch (type) {
      case 'membership':
        setMembershipForm({
          name: item.name,
          tier: item.tier,
          description: item.description,
          price: item.price,
          duration: item.duration,
          benefits: item.benefits,
          branchId: item.branchId || '',
          isActive: item.isActive
        });
        setMembershipDialogOpen(true);
        break;
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
          membershipRequired: item.membershipRequired || [],
          branchId: item.branchId || '',
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
          membershipRequired: item.membershipRequired || [],
          branchId: item.branchId || '',
          validFrom: item.validFrom.toISOString().split('T')[0],
          validTo: item.validTo.toISOString().split('T')[0],
          usageLimit: item.usageLimit?.toString() || '',
          isActive: item.isActive
        });
        setPromoDialogOpen(true);
        break;
      case 'loyalty':
        setLoyaltyForm({
          name: item.name,
          description: item.description,
          pointsPerDollar: item.pointsPerDollar,
          redemptionRate: item.redemptionRate,
          minimumPoints: item.minimumPoints,
          maximumPoints: item.maximumPoints?.toString() || '',
          expiryDays: item.expiryDays,
          branchId: item.branchId || '',
          isActive: item.isActive
        });
        setLoyaltyDialogOpen(true);
        break;
      case 'cashback':
        setCashbackForm({
          name: item.name,
          description: item.description,
          cashbackType: item.cashbackType,
          cashbackValue: item.cashbackValue,
          minimumPurchase: item.minimumPurchase?.toString() || '',
          applicableCategories: item.applicableCategories,
          membershipRequired: item.membershipRequired || [],
          branchId: item.branchId || '',
          validFrom: item.validFrom.toISOString().split('T')[0],
          validTo: item.validTo.toISOString().split('T')[0],
          isActive: item.isActive
        });
        setCashbackDialogOpen(true);
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
      case 'membership':
        deleteMembership(selectedItem.id);
        break;
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

  // Mock data for demonstration
  useEffect(() => {
    if (allMemberships.length === 0) {
      const mockMemberships: Omit<Membership, 'id' | 'createdAt' | 'updatedAt'>[] = [
        // Global memberships
        {
          name: 'Global Gold Membership',
          tier: 'gold',
          description: 'Premium global membership available at all branches',
          price: 99.99,
          duration: 12,
          benefits: ['25% off all services globally', 'Free monthly treatment', 'VIP priority at any branch', 'Exclusive global events'],
          branchId: undefined, // Global
          isActive: true
        },
        // Branch-specific memberships
        {
          name: 'Downtown Premium',
          tier: 'platinum',
          description: 'Exclusive membership for downtown location',
          price: 149.99,
          duration: 6,
          benefits: ['30% off services', 'Free premium treatments', 'Dedicated stylist', 'Private lounge access'],
          branchId: 'branch1',
          isActive: true
        },
      ];

      mockMemberships.forEach(membership => addMembership(membership));
    }

    if (allOffers.length === 0 && services.length > 0) {
      const mockOffers: Omit<Offer, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>[] = [
        // Global offers
        {
          title: 'Global Weekend Special',
          description: '20% off all services on weekends across all branches',
          type: 'service',
          discountType: 'percentage',
          discountValue: 20,
          applicableItems: [],
          applicableServices: services.slice(0, 3).map(s => s.id),
          offerFor: 'series',
          image: '/api/placeholder/800/400',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          branchId: undefined, // Global
          isActive: true
        },
        // Birthday special offers
        {
          title: 'Happy Birthday Special!',
          description: 'Celebrate your birthday with 25% off any service',
          type: 'birthday',
          discountType: 'percentage',
          discountValue: 25,
          applicableItems: [],
          applicableServices: [],
          offerFor: 'single',
          image: '/api/placeholder/700/400',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          branchId: undefined, // Global
          isActive: true
        },
        // First time registration offers
        {
          title: 'Welcome to Our Family!',
          description: '30% off your first service as a new customer',
          type: 'first_time_registration',
          discountType: 'percentage',
          discountValue: 30,
          applicableItems: [],
          applicableServices: [],
          offerFor: 'single',
          image: '/api/placeholder/600/400',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          branchId: undefined, // Global
          isActive: true
        },
        // Promotional package offers
        {
          title: 'Complete Spa Package',
          description: 'Full body massage + facial + manicure/pedicure package',
          type: 'promotional_package',
          discountType: 'percentage',
          discountValue: 15,
          applicableItems: [],
          applicableServices: services.slice(0, 4).map(s => s.id),
          offerFor: 'series',
          image: '/api/placeholder/800/500',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          branchId: undefined, // Global
          isActive: true
        },
        // Branch-specific offers
        {
          title: 'Downtown Summer Sale',
          description: 'Buy 2 services, get 1 free at downtown location',
          type: 'combo',
          discountType: 'fixed',
          discountValue: 50,
          applicableItems: [],
          applicableServices: [services[0].id, services[1].id],
          offerFor: 'single',
          image: '/api/placeholder/600/400',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          branchId: 'branch1',
          isActive: true
        },
      ];

      mockOffers.forEach(offer => addOffer(offer));
    }

    if (allPromoCodes.length === 0) {
      const mockPromos: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>[] = [
        // Global promo codes
        {
          code: 'GLOBAL20',
          description: '20% off first visit at any branch',
          discountType: 'percentage',
          discountValue: 20,
          minimumPurchase: 50,
          applicableCategories: [],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          branchId: undefined, // Global
          isActive: true
        },
        // Branch-specific promo codes
        {
          code: 'DOWNTOWN15',
          description: '15% off all services at downtown location',
          discountType: 'percentage',
          discountValue: 15,
          applicableCategories: [],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          branchId: 'branch1',
          isActive: true
        },
      ];

      mockPromos.forEach(promo => addPromoCode(promo));
    }

    if (allLoyaltyPrograms.length === 0) {
      const mockLoyalty: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>[] = [
        // Global loyalty programs
        {
          name: 'Global Points Plus',
          description: 'Earn points on every purchase across all branches',
          pointsPerDollar: 1,
          redemptionRate: 0.01,
          minimumPoints: 100,
          expiryDays: 365,
          branchId: undefined, // Global
          isActive: true
        },
        // Branch-specific loyalty programs
        {
          name: 'Downtown Rewards',
          description: 'Special loyalty program for downtown branch customers',
          pointsPerDollar: 2,
          redemptionRate: 0.015,
          minimumPoints: 50,
          expiryDays: 180,
          branchId: 'branch1',
          isActive: true
        },
      ];

      mockLoyalty.forEach(program => addLoyaltyProgram(program));
    }

    if (allCashbackPrograms.length === 0) {
      const mockCashback: Omit<CashbackProgram, 'id' | 'createdAt' | 'updatedAt'>[] = [
        // Global cashback programs
        {
          name: 'Global Cashback Rewards',
          description: 'Get cashback on purchases over $100 at any branch',
          cashbackType: 'percentage',
          cashbackValue: 5,
          minimumPurchase: 100,
          applicableCategories: [],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          branchId: undefined, // Global
          isActive: true
        },
        // Branch-specific cashback programs
        {
          name: 'Downtown Cashback Plus',
          description: 'Extra cashback for downtown branch customers',
          cashbackType: 'percentage',
          cashbackValue: 7,
          minimumPurchase: 75,
          applicableCategories: [],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          branchId: 'branch1',
          isActive: true
        },
      ];

      mockCashback.forEach(program => addCashbackProgram(program));
    }
  }, [allMemberships.length, allOffers.length, allPromoCodes.length, allLoyaltyPrograms.length, allCashbackPrograms.length]);

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar
          role="super_admin"
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
                role="super_admin"
                onLogout={handleLogout}
              />
              <h1 className="text-lg font-semibold text-gray-900">Membership Management</h1>
              <div className="w-8" />
            </div>
          </div>

          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Membership Management</h1>
                <p className="text-gray-600 mt-1">Manage memberships, offers, promo codes, and loyalty programs across all branches</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="global">Global Only</SelectItem>
                    {mockBranches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <Tabs defaultValue="memberships" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-auto">
                <TabsTrigger value="memberships" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Memberships
                </TabsTrigger>
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

              {/* Memberships Tab */}
              <TabsContent value="memberships" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Membership Plans</h2>
                    <p className="text-gray-600">Create and manage membership tiers across all branches</p>
                  </div>
                  <Button onClick={() => setMembershipDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Membership
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredMemberships().map((membership) => (
                    <Card key={membership.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{membership.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={membershipTiers.find(t => t.value === membership.tier)?.color}>
                                {membershipTiers.find(t => t.value === membership.tier)?.label}
                              </Badge>
                              <Badge variant={membership.isActive ? 'default' : 'outline'}>
                                {membership.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getBranchName(membership.branchId)}
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
                              <DropdownMenuItem onClick={() => openEditDialog(membership, 'membership')}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateMembership(membership.id, { isActive: !membership.isActive })}
                              >
                                {membership.isActive ? (
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
                                onClick={() => openDeleteDialog(membership, 'membership')}
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
                        <p className="text-sm text-gray-600 mb-4">{membership.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">${membership.price}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{membership.duration} month{membership.duration > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {membership.benefits.slice(0, 3).map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-green-500" />
                                {benefit}
                              </li>
                            ))}
                            {membership.benefits.length > 3 && (
                              <li className="text-gray-500">+{membership.benefits.length - 3} more...</li>
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Offers Tab */}
              <TabsContent value="offers" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Special Offers</h2>
                    <p className="text-gray-600">Create limited-time offers across branches</p>
                  </div>
                  <Button onClick={() => setOfferDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Offer
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredOffers().map((offer) => (
                    <Card key={offer.id} className="hover:shadow-md transition-shadow">
                      {offer.image && (
                        <img src={offer.image} alt={offer.title} className="w-full h-36 object-cover rounded-t-md" />
                      )}
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
                              <Badge variant="outline" className="text-xs">
                                {getBranchName(offer.branchId)}
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
                    <p className="text-gray-600">Create discount codes across branches</p>
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
                              <Badge variant="outline" className="text-xs">
                                {getBranchName(promo.branchId)}
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
                            <span className="font-medium">
                              {promo.validTo instanceof Date ? promo.validTo.toLocaleDateString() : new Date(promo.validTo).toLocaleDateString()}
                            </span>
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

              {/* Loyalty Points Tab */}
              <TabsContent value="loyalty" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Loyalty Programs</h2>
                    <p className="text-gray-600">Set up points-based loyalty programs across branches</p>
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
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={program.isActive ? 'default' : 'outline'}>
                                {program.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getBranchName(program.branchId)}
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
                            <span className="text-gray-600">Redemption rate:</span>
                            <span className="font-medium">${program.redemptionRate}/point</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Min. points:</span>
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
                    <p className="text-gray-600">Set up cashback rewards across branches</p>
                  </div>
                  <Button onClick={() => setCashbackDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
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
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={program.isActive ? 'default' : 'outline'}>
                                {program.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getBranchName(program.branchId)}
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
                            <span className="font-medium">
                              {program.validTo instanceof Date ? program.validTo.toLocaleDateString() : new Date(program.validTo).toLocaleDateString()}
                            </span>
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
      </div>

      {/* Membership Dialog */}
      <Sheet open={membershipDialogOpen} onOpenChange={setMembershipDialogOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedItem ? 'Edit Membership' : 'Add New Membership'}</SheetTitle>
            <SheetDescription>
              {selectedItem ? 'Update membership details.' : 'Create a new membership plan.'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="membership-name">Membership Name</Label>
              <Input
                id="membership-name"
                value={membershipForm.name}
                onChange={(e) => setMembershipForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter membership name"
              />
            </div>
            <div>
              <Label htmlFor="membership-tier">Tier</Label>
              <Select
                value={membershipForm.tier}
                onValueChange={(value: MembershipTier) =>
                  setMembershipForm(prev => ({ ...prev, tier: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {membershipTiers.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="membership-branch">Branch (Optional - leave empty for global)</Label>
              <Select
                value={membershipForm.branchId}
                onValueChange={(value) => setMembershipForm(prev => ({ ...prev, branchId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches (Global)</SelectItem>
                  {mockBranches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="membership-description">Description</Label>
              <Textarea
                id="membership-description"
                value={membershipForm.description}
                onChange={(e) => setMembershipForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter membership description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="membership-price">Price ($)</Label>
                <Input
                  id="membership-price"
                  type="number"
                  value={membershipForm.price}
                  onChange={(e) => setMembershipForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="membership-duration">Duration (months)</Label>
                <Input
                  id="membership-duration"
                  type="number"
                  value={membershipForm.duration}
                  onChange={(e) => setMembershipForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="membership-active"
                checked={membershipForm.isActive}
                onChange={(e) => setMembershipForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="membership-active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setMembershipDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedItem ? handleEditMembership : handleAddMembership} disabled={!membershipForm.name.trim()}>
              {selectedItem ? 'Update' : 'Add'} Membership
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Offer Dialog */}
      <Sheet open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="border-b border-gray-200 pb-6 mb-6">
            <SheetTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-blue-600" />
              {selectedItem ? 'Edit Special Offer' : 'Add Special Offer'}
            </SheetTitle>
            <SheetDescription className="text-gray-600">
              {selectedItem ? 'Update offer details and configuration.' : 'Create a new special offer for your customers with custom discounts and conditions.'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="offer-title">Offer Title</Label>
              <Input
                id="offer-title"
                value={offerForm.title}
                onChange={(e) => setOfferForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter offer title"
              />
            </div>
            <div>
              <Label htmlFor="offer-description">Description</Label>
              <Textarea
                id="offer-description"
                value={offerForm.description}
                onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter offer description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="offer-type">Type</Label>
                <Select
                  value={offerForm.type}
                  onValueChange={(value: 'service' | 'product' | 'combo' | 'birthday' | 'first_time_registration' | 'promotional_package') =>
                    setOfferForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                    <SelectItem value="birthday">Birthday Special</SelectItem>
                    <SelectItem value="first_time_registration">First Time Registration</SelectItem>
                    <SelectItem value="promotional_package">Promotional Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="offer-discount-type">Discount Type</Label>
                <Select
                  value={offerForm.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    setOfferForm(prev => ({ ...prev, discountType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="offer-for">Offer For</Label>
                <Select
                  value={offerForm.offerFor}
                  onValueChange={(value: 'single' | 'series') => setOfferForm(prev => ({ ...prev, offerFor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Service</SelectItem>
                    <SelectItem value="series">Series (Multiple Services)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="offer-branch">Branch (Optional - leave empty for global)</Label>
                <Select
                  value={offerForm.branchId}
                  onValueChange={(value) => setOfferForm(prev => ({ ...prev, branchId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Branches (Global)</SelectItem>
                    {mockBranches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="offer-discount-value">Discount Value</Label>
              <Input
                id="offer-discount-value"
                type="number"
                value={offerForm.discountValue}
                onChange={(e) => setOfferForm(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                placeholder={offerForm.discountType === 'percentage' ? "20" : "10.00"}
              />
            </div>
            <div>
              <Label htmlFor="offer-branch">Branch (Optional - leave empty for global)</Label>
              <Select
                value={offerForm.branchId}
                onValueChange={(value) => setOfferForm(prev => ({ ...prev, branchId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches (Global)</SelectItem>
                  {mockBranches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="offer-valid-from">Valid From</Label>
                <Input
                  id="offer-valid-from"
                  type="date"
                  value={offerForm.validFrom}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="offer-valid-to">Valid To</Label>
                <Input
                  id="offer-valid-to"
                  type="date"
                  value={offerForm.validTo}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, validTo: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="offer-usage-limit">Usage Limit (optional)</Label>
              <Input
                id="offer-usage-limit"
                type="number"
                value={offerForm.usageLimit}
                onChange={(e) => setOfferForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="offer-active"
                checked={offerForm.isActive}
                onChange={(e) => setOfferForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="offer-active">Active</Label>
            </div>
            <div>
              <Label>Applicable Services</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {(services || []).map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor={`service-${service.id}`} className="text-sm cursor-pointer">
                        {service.name} {service.price && `($${service.price})`}
                      </Label>
                    </div>
                  ))}
                </div>
                {(services || []).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No services available</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select the services this offer applies to. Leave empty for all services.
              </p>
            </div>
            <div>
              <Label>Offer Image (optional)</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setOfferForm(prev => ({ ...prev, image: ev.target?.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {offerForm.image && (
                  <img src={offerForm.image} alt="Offer" className="w-16 h-10 object-cover rounded" />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
            <Button variant="outline" onClick={() => setOfferDialogOpen(false)} className="px-6">
              Cancel
            </Button>
            <Button onClick={selectedItem ? handleEditOffer : handleAddOffer} disabled={!offerForm.title.trim()} className="px-6 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {selectedItem ? 'Update Offer' : 'Create Offer'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Promo Code Dialog */}
      <Sheet open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedItem ? 'Edit Promo Code' : 'Add New Promo Code'}</SheetTitle>
            <SheetDescription>
              {selectedItem ? 'Update promo code details.' : 'Create a discount code.'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="promo-code">Promo Code</Label>
              <Input
                id="promo-code"
                value={promoForm.code}
                onChange={(e) => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="WELCOME20"
              />
            </div>
            <div>
              <Label htmlFor="promo-description">Description</Label>
              <Textarea
                id="promo-description"
                value={promoForm.description}
                onChange={(e) => setPromoForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter promo code description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-discount-type">Discount Type</Label>
                <Select
                  value={promoForm.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    setPromoForm(prev => ({ ...prev, discountType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="promo-discount-value">Discount Value</Label>
                <Input
                  id="promo-discount-value"
                  type="number"
                  value={promoForm.discountValue}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  placeholder={promoForm.discountType === 'percentage' ? "20" : "10.00"}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="promo-minimum-purchase">Minimum Purchase (optional)</Label>
              <Input
                id="promo-minimum-purchase"
                type="number"
                value={promoForm.minimumPurchase}
                onChange={(e) => setPromoForm(prev => ({ ...prev, minimumPurchase: e.target.value }))}
                placeholder="50.00"
              />
            </div>
            <div>
              <Label htmlFor="promo-branch">Branch (Optional - leave empty for global)</Label>
              <Select
                value={promoForm.branchId}
                onValueChange={(value) => setPromoForm(prev => ({ ...prev, branchId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches (Global)</SelectItem>
                  {mockBranches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-valid-from">Valid From</Label>
                <Input
                  id="promo-valid-from"
                  type="date"
                  value={promoForm.validFrom}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="promo-valid-to">Valid To</Label>
                <Input
                  id="promo-valid-to"
                  type="date"
                  value={promoForm.validTo}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, validTo: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="promo-usage-limit">Usage Limit (optional)</Label>
              <Input
                id="promo-usage-limit"
                type="number"
                value={promoForm.usageLimit}
                onChange={(e) => setPromoForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="promo-active"
                checked={promoForm.isActive}
                onChange={(e) => setPromoForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="promo-active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedItem ? () => {} : handleAddPromoCode} disabled={!promoForm.code.trim()}>
              {selectedItem ? 'Update' : 'Add'} Promo Code
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Loyalty Program Dialog */}
      <Sheet open={loyaltyDialogOpen} onOpenChange={setLoyaltyDialogOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedItem ? 'Edit Loyalty Program' : 'Add New Loyalty Program'}</SheetTitle>
            <SheetDescription>
              {selectedItem ? 'Update loyalty program details.' : 'Create a points-based loyalty program.'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="loyalty-name">Program Name</Label>
              <Input
                id="loyalty-name"
                value={loyaltyForm.name}
                onChange={(e) => setLoyaltyForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter program name"
              />
            </div>
            <div>
              <Label htmlFor="loyalty-description">Description</Label>
              <Textarea
                id="loyalty-description"
                value={loyaltyForm.description}
                onChange={(e) => setLoyaltyForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter program description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loyalty-points-per-dollar">Points per Dollar</Label>
                <Input
                  id="loyalty-points-per-dollar"
                  type="number"
                  value={loyaltyForm.pointsPerDollar}
                  onChange={(e) => setLoyaltyForm(prev => ({ ...prev, pointsPerDollar: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="loyalty-redemption-rate">Redemption Rate ($ per point)</Label>
                <Input
                  id="loyalty-redemption-rate"
                  type="number"
                  step="0.01"
                  value={loyaltyForm.redemptionRate}
                  onChange={(e) => setLoyaltyForm(prev => ({ ...prev, redemptionRate: parseFloat(e.target.value) || 0.01 }))}
                  placeholder="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loyalty-minimum-points">Minimum Points</Label>
                <Input
                  id="loyalty-minimum-points"
                  type="number"
                  value={loyaltyForm.minimumPoints}
                  onChange={(e) => setLoyaltyForm(prev => ({ ...prev, minimumPoints: parseInt(e.target.value) || 100 }))}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="loyalty-expiry-days">Expiry Days</Label>
                <Input
                  id="loyalty-expiry-days"
                  type="number"
                  value={loyaltyForm.expiryDays}
                  onChange={(e) => setLoyaltyForm(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 365 }))}
                  placeholder="365"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="loyalty-branch">Branch (Optional - leave empty for global)</Label>
              <Select
                value={loyaltyForm.branchId}
                onValueChange={(value) => setLoyaltyForm(prev => ({ ...prev, branchId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches (Global)</SelectItem>
                  {mockBranches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="loyalty-maximum-points">Maximum Points (optional)</Label>
              <Input
                id="loyalty-maximum-points"
                type="number"
                value={loyaltyForm.maximumPoints}
                onChange={(e) => setLoyaltyForm(prev => ({ ...prev, maximumPoints: e.target.value }))}
                placeholder="No limit"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="loyalty-active"
                checked={loyaltyForm.isActive}
                onChange={(e) => setLoyaltyForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="loyalty-active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setLoyaltyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedItem ? () => {} : handleAddLoyaltyProgram} disabled={!loyaltyForm.name.trim()}>
              {selectedItem ? 'Update' : 'Add'} Program
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cashback Program Dialog */}
      <Sheet open={cashbackDialogOpen} onOpenChange={setCashbackDialogOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedItem ? 'Edit Cashback Program' : 'Add New Cashback Program'}</SheetTitle>
            <SheetDescription>
              {selectedItem ? 'Update cashback program details.' : 'Create a cashback rewards program.'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cashback-name">Program Name</Label>
              <Input
                id="cashback-name"
                value={cashbackForm.name}
                onChange={(e) => setCashbackForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter program name"
              />
            </div>
            <div>
              <Label htmlFor="cashback-description">Description</Label>
              <Textarea
                id="cashback-description"
                value={cashbackForm.description}
                onChange={(e) => setCashbackForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter program description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cashback-type">Cashback Type</Label>
                <Select
                  value={cashbackForm.cashbackType}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    setCashbackForm(prev => ({ ...prev, cashbackType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cashback-value">Cashback Value</Label>
                <Input
                  id="cashback-value"
                  type="number"
                  value={cashbackForm.cashbackValue}
                  onChange={(e) => setCashbackForm(prev => ({ ...prev, cashbackValue: parseFloat(e.target.value) || 0 }))}
                  placeholder={cashbackForm.cashbackType === 'percentage' ? "5" : "10.00"}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cashback-minimum-purchase">Minimum Purchase (optional)</Label>
              <Input
                id="cashback-minimum-purchase"
                type="number"
                value={cashbackForm.minimumPurchase}
                onChange={(e) => setCashbackForm(prev => ({ ...prev, minimumPurchase: e.target.value }))}
                placeholder="100.00"
              />
            </div>
            <div>
              <Label htmlFor="cashback-branch">Branch (Optional - leave empty for global)</Label>
              <Select
                value={cashbackForm.branchId}
                onValueChange={(value) => setCashbackForm(prev => ({ ...prev, branchId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches (Global)</SelectItem>
                  {mockBranches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cashback-valid-from">Valid From</Label>
                <Input
                  id="cashback-valid-from"
                  type="date"
                  value={cashbackForm.validFrom}
                  onChange={(e) => setCashbackForm(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cashback-valid-to">Valid To</Label>
                <Input
                  id="cashback-valid-to"
                  type="date"
                  value={cashbackForm.validTo}
                  onChange={(e) => setCashbackForm(prev => ({ ...prev, validTo: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cashback-active"
                checked={cashbackForm.isActive}
                onChange={(e) => setCashbackForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="cashback-active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setCashbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedItem ? () => {} : handleAddCashbackProgram} disabled={!cashbackForm.name.trim()}>
              {selectedItem ? 'Update' : 'Add'} Program
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Sheet */}
      <Sheet open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Delete {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}</SheetTitle>
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
    </ProtectedRoute>
  );
}