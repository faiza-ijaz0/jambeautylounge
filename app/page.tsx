// 'use client';

// import { useState, useEffect } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Scissors, MapPin, Star, Clock, Phone, Mail, Award, Users, 
//   Calendar, ChevronRight, ShoppingBag, Ticket, ArrowRight,
//   Quote, Instagram, CheckCircle2, ShieldCheck, Zap, Building,
//   TrendingUp, Package, DollarSign, RefreshCw,
//   Crown, Gem, Shield, Sparkles, Check, UserCheck,
//   Grid3X3,
//   InstagramIcon,
//   Facebook
// } from "lucide-react";
// import { Header } from "@/components/shared/Header";
// import Link from "next/link";
// import { 
//   Carousel, 
//   CarouselContent, 
//   CarouselItem, 
//   CarouselNext, 
//   CarouselPrevious 
// } from "@/components/ui/carousel";
// import { cn } from "@/lib/utils";
// import { create } from 'zustand';
// import { 
//   collection, 
//   getDocs, 
//   query, 
//   orderBy, 
//   limit,
//   DocumentData,
//   QueryDocumentSnapshot
// } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { Footer } from '@/components/shared/Footer';

// // ==================== STORE DEFINITION ====================
// interface Service {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   duration: number;
//   category: string;
//   categoryId: string;
//   imageUrl: string;
//   branchNames: string[];
//   branches: string[];
//   popularity: string;
//   revenue: number;
//   status: string;
//   totalBookings: number;
// }

// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   cost: number;
//   category: string;
//   categoryId: string;
//   imageUrl: string;
//   sku: string;
//   rating: number;
//   reviews: number;
//   revenue: number;
//   status: string;
//   totalSold: number;
//   totalStock: number;
//   branchNames: string[];
//   branches: string[];
// }

// interface StaffMember {
//   id: string;
//   name: string;
//   image: string;
//   role: string;
//   rating: number;
//   reviews: number;
//   status: string;
//   bio?: string;
// }

// interface Branch {
//   id: string;
//   name: string;
//   address: string;
//   city: string;
//   country: string;
//   openingTime: string;
//   closingTime: string;
//   phone: string;
//   email: string;
//   status: string;
// }

// interface Offer {
//   id: string;
//   title: string;
//   description: string;
//   discountType: 'percentage' | 'fixed';
//   discountValue: number;
//   imageUrl: string;
//   offerType: 'service' | 'product' | 'both';
//   applicableProducts: string[];
//   applicableServices: string[];
//   branchNames: string[];
//   branches: string[];
//   status: 'active' | 'inactive' | 'expired';
//   usageLimit: number | null;
//   usedCount: number;
//   validFrom: Date;
//   validTo: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface Membership {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   duration: number;
//   tier: 'basic' | 'premium' | 'vip' | 'exclusive';
//   benefits: string[];
//   branchNames: string[];
//   branches: string[];
//   status: 'active' | 'inactive';
//   revenue: number;
//   totalSubscriptions: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface Category {
//   id: string;
//   name: string;
//   description: string;
//   image: string;
//   branchId: string;
//   branchName: string;
//   branchCity: string;
//   type: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface HomeStore {
//   services: Service[];
//   products: Product[];
//   staff: StaffMember[];
//   branches: Branch[];
//   offers: Offer[];
//   memberships: Membership[];
//   categories: Category[];
//   stats: {
//     totalStaff: number;
//     totalServices: number;
//     totalProducts: number;
//     totalBranches: number;
//     totalOffers: number;
//     totalMemberships: number;
//     totalCategories: number;
//   };
  
//   fetchHomeData: () => Promise<void>;
//   fetchServices: () => Promise<void>;
//   fetchProducts: () => Promise<void>;
//   fetchStaff: () => Promise<void>;
//   fetchBranches: () => Promise<void>;
//   fetchOffers: () => Promise<void>;
//   fetchMemberships: () => Promise<void>;
//   fetchCategories: () => Promise<void>;
//   calculateStats: () => void;
// }

// const useHomeStore = create<HomeStore>((set, get) => ({
//   services: [],
//   products: [],
//   staff: [],
//   branches: [],
//   offers: [],
//   memberships: [],
//   categories: [],
//   stats: {
//     totalStaff: 0,
//     totalServices: 0,
//     totalProducts: 0,
//     totalBranches: 0,
//     totalOffers: 0,
//     totalMemberships: 0,
//     totalCategories: 0,
//   },

//   fetchHomeData: async () => {
//     try {
//       await Promise.all([
//         get().fetchServices(),
//         get().fetchProducts(),
//         get().fetchStaff(),
//         get().fetchBranches(),
//         get().fetchOffers(),
//         get().fetchMemberships(),
//         get().fetchCategories()
//       ]);
//       get().calculateStats();
//     } catch (error) {
//       console.error('Error fetching home data:', error);
//     }
//   },

//   fetchServices: async () => {
//     try {
//       const servicesRef = collection(db, 'services');
//       const q = query(servicesRef, orderBy('createdAt', 'desc'), limit(6));
//       const querySnapshot = await getDocs(q);
      
//       const servicesData: Service[] = [];
//       querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
//         const data = doc.data();
//         servicesData.push({
//           id: doc.id,
//           name: data.name || 'Unnamed Service',
//           description: data.description || 'No description available',
//           price: Number(data.price) || 0,
//           duration: Number(data.duration) || 30,
//           category: data.category || 'Uncategorized',
//           categoryId: data.categoryId || '',
//           imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop',
//           branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
//           branches: Array.isArray(data.branches) ? data.branches : [],
//           popularity: data.popularity || 'medium',
//           revenue: Number(data.revenue) || 0,
//           status: data.status || 'active',
//           totalBookings: Number(data.totalBookings) || 0,
//         });
//       });
      
//       set({ services: servicesData });
//     } catch (error) {
//       console.error('Error fetching services:', error);
//     }
//   },

//   fetchProducts: async () => {
//     try {
//       const productsRef = collection(db, 'products');
//       const q = query(productsRef, orderBy('createdAt', 'desc'), limit(8));
//       const querySnapshot = await getDocs(q);
      
//       const productsData: Product[] = [];
//       querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
//         const data = doc.data();
//         productsData.push({
//           id: doc.id,
//           name: data.name || 'Unnamed Product',
//           description: data.description || 'No description available',
//           price: Number(data.price) || 0,
//           cost: Number(data.cost) || 0,
//           category: data.category || 'Uncategorized',
//           categoryId: data.categoryId || '',
//           imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1512690196222-7c7d3f993c1b?q=80&w=2070&auto=format&fit=crop',
//           sku: data.sku || 'N/A',
//           rating: Number(data.rating) || 0,
//           reviews: Number(data.reviews) || 0,
//           revenue: Number(data.revenue) || 0,
//           status: data.status || 'active',
//           totalSold: Number(data.totalSold) || 0,
//           totalStock: Number(data.totalStock) || 0,
//           branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
//           branches: Array.isArray(data.branches) ? data.branches : [],
//         });
//       });
      
//       set({ products: productsData });
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     }
//   },

//   fetchStaff: async () => {
//     try {
//       const staffRef = collection(db, 'staff');
//       const q = query(staffRef, orderBy('name', 'asc'), limit(4));
//       const querySnapshot = await getDocs(q);
      
//       const staffData: StaffMember[] = [];
//       querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
//         const data = doc.data();
//         staffData.push({
//           id: doc.id,
//           name: data.name || 'Unknown Staff',
//           image: data.imageUrl || data.avatar || data.photoURL || '/default-avatar.png',
//           role: data.role || data.position || 'Barber',
//           rating: Number(data.rating) || 4.5,
//           reviews: Number(data.reviews) || 0,
//           status: data.status || 'active',
//           bio: data.description || data.experience || 'Professional barber with extensive experience.',
//         });
//       });
      
//       set({ staff: staffData });
//     } catch (error) {
//       console.error('Error fetching staff:', error);
//     }
//   },

//   fetchBranches: async () => {
//     try {
//       const branchesRef = collection(db, 'branches');
//       const q = query(branchesRef, orderBy('name', 'asc'), limit(4));
//       const querySnapshot = await getDocs(q);
      
//       const branchesData: Branch[] = [];
//       querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
//         const data = doc.data();
//         branchesData.push({
//           id: doc.id,
//           name: data.name || 'Unnamed Branch',
//           address: data.address || 'Address not available',
//           city: data.city || 'City not available',
//           country: data.country || 'Country not available',
//           openingTime: data.openingTime || '09:00',
//           closingTime: data.closingTime || '18:00',
//           phone: data.phone || 'N/A',
//           email: data.email || 'N/A',
//           status: data.status || 'active',
//         });
//       });
      
//       set({ branches: branchesData });
//     } catch (error) {
//       console.error('Error fetching branches:', error);
//     }
//   },

//   fetchOffers: async () => {
//     try {
//       const offersRef = collection(db, 'offers');
//       const q = query(offersRef, orderBy('createdAt', 'desc'), limit(12));
//       const querySnapshot = await getDocs(q);
      
//       const offersData: Offer[] = [];
//       const now = new Date();
      
//       querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
//         const data = doc.data();
        
//         const validFrom = data.validFrom?.toDate() || new Date();
//         const validTo = data.validTo?.toDate() || new Date();
//         const createdAt = data.createdAt?.toDate() || new Date();
//         const updatedAt = data.updatedAt?.toDate() || new Date();
        
//         const isActive = data.status === 'active';
//         const isNotExpired = now <= validTo;
        
//         if (isActive && isNotExpired) {
//           offersData.push({
//             id: doc.id,
//             title: data.title || 'Special Offer',
//             description: data.description || 'Limited time offer',
//             discountType: data.discountType || 'percentage',
//             discountValue: Number(data.discountValue) || 0,
//             imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=2070&auto=format&fit=crop',
//             offerType: data.offerType || 'service',
//             applicableProducts: Array.isArray(data.applicableProducts) ? data.applicableProducts : [],
//             applicableServices: Array.isArray(data.applicableServices) ? data.applicableServices : [],
//             branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
//             branches: Array.isArray(data.branches) ? data.branches : [],
//             status: data.status || 'active',
//             usageLimit: data.usageLimit || null,
//             usedCount: Number(data.usedCount) || 0,
//             validFrom,
//             validTo,
//             createdAt,
//             updatedAt
//           });
//         }
//       });
      
//       const finalOffers = offersData.slice(0, 8);
//       set({ offers: finalOffers });
//     } catch (error) {
//       console.error('Error fetching offers:', error);
//       set({ offers: [] });
//     }
//   },

//   fetchMemberships: async () => {
//     try {
//       const membershipsRef = collection(db, 'memberships');
//       const q = query(membershipsRef, orderBy('createdAt', 'desc'), limit(8));
//       const querySnapshot = await getDocs(q);
      
//       const membershipsData: Membership[] = [];
      
//       querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
//         const data = doc.data();
        
//         const createdAt = data.createdAt?.toDate() || new Date();
//         const updatedAt = data.updatedAt?.toDate() || new Date();
        
//         const isActive = data.status === 'active';
        
//         if (isActive) {
//           membershipsData.push({
//             id: doc.id,
//             name: data.name || 'Membership',
//             description: data.description || 'Premium membership plan',
//             price: Number(data.price) || 0,
//             duration: Number(data.duration) || 30,
//             tier: data.tier || 'premium',
//             benefits: Array.isArray(data.benefits) ? data.benefits : [],
//             branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
//             branches: Array.isArray(data.branches) ? data.branches : [],
//             status: data.status || 'active',
//             revenue: Number(data.revenue) || 0,
//             totalSubscriptions: Number(data.totalSubscriptions) || 0,
//             createdAt,
//             updatedAt
//           });
//         }
//       });
      
//       set({ memberships: membershipsData });
//     } catch (error) {
//       console.error('Error fetching memberships:', error);
//       set({ memberships: [] });
//     }
//   },

//   fetchCategories: async () => {
//     try {
//       const categoriesRef = collection(db, 'categories');
//       // ⚠️ FIXED: Removed complex where clause causing index error
//       // Simple query se data fetch karo, phir client side filter karo
//       const q = query(categoriesRef, orderBy('createdAt', 'desc'), limit(8));
//       const querySnapshot = await getDocs(q);
      
//       const categoriesData: Category[] = [];
//       querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
//         const data = doc.data();
//         const createdAt = data.createdAt?.toDate() || new Date();
//         const updatedAt = data.updatedAt?.toDate() || new Date();
        
//         categoriesData.push({
//           id: doc.id,
//           name: data.name || 'Unnamed Category',
//           description: data.description || 'No description available',
//           image: data.image || 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=2070&auto=format&fit=crop',
//           branchId: data.branchId || '',
//           branchName: data.branchName || 'Unknown Branch',
//           branchCity: data.branchCity || 'Unknown City',
//           type: data.type || 'general',
//           isActive: data.isActive || true,
//           createdAt,
//           updatedAt
//         });
//       });
      
//       // ✅ Client side filter for active categories
//       const activeCategories = categoriesData.filter(cat => cat.isActive);
//       set({ categories: activeCategories.slice(0, 4) }); // Limit to 4 active categories
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       // ✅ Fallback: Agar error aaye to empty array set karo
//       set({ categories: [] });
//     }
//   },

//   calculateStats: () => {
//     const state = get();
//     set({
//       stats: {
//         totalStaff: state.staff.length,
//         totalServices: state.services.length,
//         totalProducts: state.products.length,
//         totalBranches: state.branches.length,
//         totalOffers: state.offers.length,
//         totalMemberships: state.memberships.length,
//         totalCategories: state.categories.length
//       }
//     });
//   },
// }));

// // ==================== MAIN COMPONENT ====================
// export default function Home() {
//   const { 
//     services, 
//     products, 
//     staff, 
//     branches, 
//     offers,
//     memberships,
//     categories,
//     stats,
//     fetchHomeData 
//   } = useHomeStore();

//   useEffect(() => {
//     fetchHomeData();
//   }, [fetchHomeData]);

//   const totalActiveServices = services.filter(s => s.status === 'active').length;
//   const totalActiveProducts = products.filter(p => p.status === 'active').length;
//   const totalActiveStaff = staff.filter(s => s.status === 'active').length;
//   const totalActiveBranches = branches.filter(b => b.status === 'active').length;
//   const totalActiveOffers = offers.length;
//   const totalActiveMemberships = memberships.length;
//   const totalActiveCategories = categories.length;

//   const totalServicesRevenue = services.reduce((sum, service) => sum + service.revenue, 0);
//   const totalProductsRevenue = products.reduce((sum, product) => sum + product.revenue, 0);
//   const totalRevenue = totalServicesRevenue + totalProductsRevenue;

//   const getOfferBadgeColor = (offerType: string) => {
//     switch (offerType) {
//       case 'service': return 'bg-blue-500 text-white';
//       case 'product': return 'bg-green-500 text-white';
//       case 'both': return 'bg-purple-500 text-white';
//       default: return 'bg-secondary text-white';
//     }
//   };

//   const formatDiscount = (offer: Offer) => {
//     if (offer.discountType === 'percentage') {
//       return `${offer.discountValue}% OFF`;
//     } else {
//       return `$${offer.discountValue} OFF`;
//     }
//   };

//   const getOfferBgColor = (offerType: string) => {
//     switch (offerType) {
//       case 'service': return 'bg-blue-600';
//       case 'product': return 'bg-green-600';
//       case 'both': return 'bg-purple-600';
//       default: return 'bg-secondary';
//     }
//   };

//   const getMembershipTierColor = (tier: string) => {
//     switch (tier) {
//       case 'basic': return 'bg-gray-600';
//       case 'premium': return 'bg-secondary';
//       case 'vip': return 'bg-purple-600';
//       case 'exclusive': return 'bg-gradient-to-r from-yellow-600 to-orange-600';
//       default: return 'bg-gray-600';
//     }
//   };

//   const getMembershipTierIcon = (tier: string) => {
//     switch (tier) {
//       case 'basic': return Shield;
//       case 'premium': return Gem;
//       case 'vip': return Crown;
//       case 'exclusive': return Sparkles;
//       default: return Shield;
//     }
//   };

//   const formatDuration = (days: number) => {
//     if (days >= 365) {
//       const years = Math.floor(days / 365);
//       return `${years} year${years > 1 ? 's' : ''}`;
//     } else if (days >= 30) {
//       const months = Math.floor(days / 30);
//       return `${months} month${months > 1 ? 's' : ''}`;
//     } else {
//       return `${days} day${days > 1 ? 's' : ''}`;
//     }
//   };

//   const getFirstBranchName = (membership: Membership) => {
//     if (membership.branchNames && membership.branchNames.length > 0) {
//       return membership.branchNames[0];
//     }
    
//     if (membership.branches && membership.branches.length > 0) {
//       const branchId = membership.branches[0];
//       const branch = branches.find(b => b.id === branchId);
//       return branch?.name || 'Multiple Branches';
//     }
    
//     return 'All Branches';
//   };

//   const getBranchCountText = (membership: Membership) => {
//     if (membership.branches && membership.branches.length > 0) {
//       return `${membership.branches.length} ${membership.branches.length === 1 ? 'Branch' : 'Branches'}`;
//     }
    
//     if (membership.branchNames && membership.branchNames.length > 0) {
//       return `${membership.branchNames.length} ${membership.branchNames.length === 1 ? 'Branch' : 'Branches'}`;
//     }
    
//     return 'All Branches';
//   };

//   return (
//     <div className="min-h-screen bg-[#fcfcfc]">
//       <Header />

//       <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
  
//  {/* Simple Official WhatsApp Icon */}
//   <a 
//     href="https://wa.me/923001234567" 
//     target="_blank" 
//     rel="noopener noreferrer"
//     className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
//     title="WhatsApp"
//   >
//     <svg 
//       className="w-7 h-7" 
//       viewBox="0 0 24 24" 
//       fill="currentColor"
//     >
//       {/* Direct WhatsApp Logo */}
//       <path
//         fill="#25D366"
//         d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.78 2.7 15.57 3.71 17.08L2.09 21.91L7.06 20.33C8.55 21.24 10.27 21.72 12.04 21.72C17.5 21.72 21.95 17.27 21.95 11.81C21.95 6.35 17.5 2 12.04 2ZM12.04 20.09C10.46 20.09 8.92 19.65 7.58 18.83L7.32 18.68L4.43 19.57L5.34 16.77L5.18 16.5C4.3 15.12 3.81 13.53 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C16.58 3.68 20.27 7.37 20.27 11.91C20.27 16.45 16.58 20.09 12.04 20.09ZM16.46 13.95C16.18 13.81 14.95 13.21 14.69 13.12C14.43 13.03 14.24 12.98 14.05 13.26C13.86 13.54 13.33 14.09 13.17 14.27C13.01 14.45 12.85 14.47 12.57 14.33C12.29 14.19 11.46 13.91 10.48 13.05C9.7 12.37 9.16 11.51 9.02 11.23C8.88 10.95 9 10.79 9.13 10.66C9.25 10.53 9.4 10.33 9.53 10.17C9.66 10.01 9.71 9.89 9.79 9.73C9.87 9.57 9.82 9.43 9.74 9.31C9.66 9.19 9.11 7.98 8.9 7.5C8.69 7.02 8.48 7.07 8.32 7.07C8.16 7.07 7.99 7.07 7.83 7.07C7.67 7.07 7.41 7.13 7.19 7.39C6.97 7.65 6.35 8.29 6.35 9.58C6.35 10.87 7.22 12.11 7.37 12.3C7.52 12.49 9.09 14.83 11.5 15.94C12.69 16.52 13.59 16.79 14.28 16.97C15.06 17.16 15.79 17.09 16.36 16.88C16.93 16.67 17.67 16.15 17.88 15.53C18.09 14.91 18.09 14.38 18.04 14.28C17.99 14.18 17.85 14.11 17.68 14.04C17.52 13.99 16.74 14.09 16.46 13.95Z"
//       />
//     </svg>
//   </a>
  
//  {/* Very Simple Phone Icon */}
//   <a 
//     href="tel:+1234567890"
//     className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
//     title="Call Now"
//   >
//     <svg 
//       className="w-6 h-6 text-white" 
//       viewBox="0 0 24 24" 
//       fill="currentColor"
//     >
//       {/* Simple Phone Handset */}
//       <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
//       <path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2z"/>
//       <path d="M16.5 13.5c-.3-.3-.7-.5-1.1-.5-.4 0-.8.1-1.1.4l-1.4 1.4c-1.1-.6-2.1-1.3-3-2.2-.9-.9-1.6-1.9-2.2-3l1.4-1.4c.3-.3.4-.7.4-1.1 0-.4-.1-.8-.4-1.1l-2-2c-.3-.3-.7-.5-1.1-.5-.4 0-.8.1-1.1.4L3.5 6.5c-.3.3-.5.7-.5 1.1 0 3.9 2.1 7.6 5 10.5 2.9 2.9 6.6 5 10.5 5 .4 0 .8-.2 1.1-.5l1.4-1.4c.3-.3.5-.7.5-1.1 0-.4-.2-.8-.5-1.1l-2-2z"/>
//     </svg>
//   </a>
//   {/* Instagram Icon - Original wala */}
 
//  {/* Chatbot Icon - Page Link */}
//   <a 
//     href="/booking" // Yahan apna page ka link dalo (jaise /booking, /chatbot, /contact)
//     className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
//     title="Chat with Bot"
//   >
//     <svg 
//       className="w-6 h-6" 
//       viewBox="0 0 24 24" 
//       fill="none" 
//       stroke="currentColor"
//     >
//       <defs>
//         <linearGradient id="chatbot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#667eea" />   {/* Purple */}
//           <stop offset="50%" stopColor="#764ba2" />  {/* Dark Purple */}
//           <stop offset="100%" stopColor="#6b8cff" /> {/* Blue */}
//         </linearGradient>
//       </defs>
      
//       {/* Background Circle */}
//       <circle 
//         cx="12" 
//         cy="12" 
//         r="10" 
//         stroke="url(#chatbot-gradient)" 
//         strokeWidth="1.5" 
//         fill="transparent"
//       />
      
//       {/* Chatbot Icon - Message Bubble with Dots */}
//       <path 
//         d="M20 12C20 16.4183 16.4183 20 12 20C10.5 20 9.1 19.6 7.9 18.9L4 20L5.1 16.1C4.4 14.9 4 13.5 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" 
//         stroke="url(#chatbot-gradient)" 
//         strokeWidth="1.5" 
//         strokeLinecap="round" 
//         strokeLinejoin="round"
//         fill="white"
//       />
      
//       {/* Three Dots inside bubble */}
//       <circle cx="9" cy="12" r="1" fill="url(#chatbot-gradient)" />
//       <circle cx="12" cy="12" r="1" fill="url(#chatbot-gradient)" />
//       <circle cx="15" cy="12" r="1" fill="url(#chatbot-gradient)" />
//     </svg>
//   </a>
// </div>

//       {/* ==================== HERO SECTION - CODE 1 STYLE ==================== */}
//       <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
//         <div 
//           className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
//           style={{ 
//             backgroundImage: "url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhdXR5JTIwc2Fsb258ZW58MHx8MHx8fDA%3D')",
//           }}
//         >
//           <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60 backdrop-blur-[1px]"></div>
//           <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent"></div>
//         </div>
        
//         <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
//           <div className="text-center text-white px-4 max-w-5xl mx-auto">
//             <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 animate-fade-in shadow-2xl">
//               <Sparkles className="w-4 h-4 text-slate/60 animate-pulse" />
//               <span className="text-[11px] tracking-[0.4em] uppercase font-bold text-white">The Pinnacle of Beauty</span>
//             </div>
           
//            <h1 className="text-7xl md:text-9xl font-serif font-bold mb-8 leading-[0.9] tracking-tighter drop-shadow-2xl">
//               Elegance <br />
//               <span className="text-[#FA9DB7] italic">Redefined.</span>
//             </h1>
//             <p className="text-xl font-bold md:text-2xl mb-12 max-w-2xl mx-auto text-gray-100 leading-relaxed drop-shadow-lg opacity-90">
//               Immerse yourself in a sanctuary of luxury where science meets art to reveal your most radiant self.
//             </p>
            
//             <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pointer-events-auto">
//               <Button size="lg" variant="outline" asChild className="bg-white  text-black border-white/40 hover:bg-white/10 hover:text-white  font-bold px-12 py-8 text-lg rounded-full transition-all duration-700 shadow-2xl hover:scale-105 active:scale-95 group">
//                 <Link href="/services" className="flex items-center gap-2">
//                   BOOK AN EXPERIENCE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </Link>
//               </Button>
//               <Button size="lg" variant="outline" asChild className="border-white/40 text-black hover:bg-white/10 hover:text-white px-12 py-8 text-lg rounded-full transition-all duration-700 backdrop-blur-md hover:scale-105 active:scale-95">
//                 <Link href="/services">OUR MENU</Link>
//               </Button>
//             </div>
//           </div>
//         </div>

//       </section>


//     { /* Categories Slider Section - New */}
//       <section className="py-24 px-4 bg-gray-50/30 overflow-hidden">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
//             <div className="space-y-4">
//               <div className="inline-block bg-gray-200 px-4 py-1.5 rounded-full">
//                 <span className="text-[#FA9DB7] font-black tracking-[0.3em] uppercase text-[10px]">Browse By</span>
//               </div>
//               <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary tracking-tight">Service Categories</h2>
//               <p className="text-gray-400 font-light text-lg">Choose your journey through our specialized beauty realms.</p>
//             </div>
//             <Button asChild variant="link" className="text-primary font-black uppercase tracking-[0.3em] text-xs p-0 group">
//               <Link href="/services">VIEW THE FULL MENU <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" /></Link>
//             </Button>
//           </div>

//           {categories.length === 0 ? (
//             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
//               <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-2xl font-serif font-bold text-gray-400 mb-2">Finding Categories...</h3>
//             </div>
//           ) : (
//             <Carousel opts={{ align: "start", loop: true }} className="w-full">
//               <CarouselContent className="-ml-4">
//                 {categories.map((category) => (
//                   <CarouselItem key={category.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6">
//                     <Link href={`/services?category=${category.name}`}>
//                       <div className="group cursor-pointer relative aspect-square overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700">
//                         <img 
//                           src={category.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop"} 
//                           alt={category.name}
//                           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
//                         />
//                         <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent group-hover:from-white/60 transition-all duration-700"></div>
//                         <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
//                           <h4 className="text-white font-serif font-bold text-xl md:text-2xl mb-2 group-hover:scale-110 transition-transform duration-500">{category.name}</h4>
//                           <span className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-black opacity-0 group-hover:opacity-100 transition-opacity duration-500">Explore Rituals</span>
//                         </div>
//                       </div>
//                     </Link>
//                   </CarouselItem>
//                 ))}
//               </CarouselContent>
//               <div className="hidden md:flex justify-end gap-3 mt-8">
//                 <CarouselPrevious className="static translate-y-0" />
//                 <CarouselNext className="static translate-y-0" />
//               </div>
//             </Carousel>
//           )}
//         </div>
//       </section>
      

     
//      {/* Services Slider Section - Premium Enhancement */}
//       <section className="py-32 px-4 bg-white relative">
//         <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
//         <div className="max-w-7xl mx-auto">
//           <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
//             <div className="space-y-4">
//               <div className="inline-block bg-gray-200 px-4 py-1.5 rounded-full">
//                 <span className="text-[#FA9DB7] font-black tracking-[0.3em] uppercase text-[10px]">The Collection</span>
//               </div>
//               <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary tracking-tight">Signature Rituals</h2>
//               <p className="text-gray-400 font-light text-lg">Indulge in our most sought-after treatments, curated for the modern soul.</p>
//             </div>
//             <Button asChild variant="outline" className="border-primary/10 text-primary hover:bg-primary hover:text-white rounded-full px-10 py-7 font-black tracking-[0.2em] text-[10px] group transition-all duration-700">
//               <Link href="/services" className="flex items-center">
//                 EXPLORE ALL RITUALS <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
//               </Link>
//             </Button>
//           </div>

//           {services.length === 0 ? (
//             <div className="text-center py-24 bg-gray-50/50 rounded-[4rem] border border-dashed border-gray-200">
//               <Sparkles className="w-20 h-20 text-gray-200 mx-auto mb-6" />
//               <h3 className="text-3xl font-serif font-bold text-gray-400 mb-2">Awaiting Excellence</h3>
//               <p className="text-gray-400 font-light">Rituals will appear here once they are prepared.</p>
//             </div>
//           ) : (
//             <Carousel opts={{ align: "start" }} className="w-full">
//               <CarouselContent className="-ml-6">
//                 {services.map((service) => (
//                   <CarouselItem key={service.id} className="pl-6 md:basis-1/2 lg:basis-1/4 xl:basis-1/5">
//                     <Card className="group border-none bg-transparent shadow-none overflow-hidden transition-all duration-700">
//                       <div className="relative aspect-4/5 overflow-hidden rounded-4xl shadow-lg group-hover:shadow-2xl transition-all duration-700">
//                         <img 
//                           src={service.imageUrl || "https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop"} 
//                           alt={service.name} 
//                           className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110"
//                         />
//                         <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                        
//                         <div className="absolute top-6 left-6">
//                           <Badge className="bg-white/20 backdrop-blur-md text-white border-0 px-3 py-1 rounded-full font-bold text-[9px] tracking-widest uppercase">
//                             {service.category}
//                           </Badge>
//                         </div>

//                         <div className="absolute bottom-6 left-6 right-6 space-y-4">
//                           <div className="space-y-1">
//                             <div className="flex items-center justify-between gap-2">
//                                 <h4 className="text-xl font-serif font-bold text-white group-hover:text-secondary transition-colors line-clamp-1">{service.name}</h4>
//                                 <span className="text-lg font-bold text-gray-300">${service.price}</span>
//                             </div>
//                             <p className="text-white/70 text-[12px] font-light line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
//                                 {service.description || "A transformative journey for your skin and soul."}
//                             </p>
//                           </div>
                          
//                           <div className="flex items-center gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
//                             <div className="flex items-center gap-1.5 text-white/60">
//                                 <Clock className="w-3.5 h-3.5" />
//                                 <span className="text-[10px] font-black uppercase tracking-widest">{service.duration} MIN</span>
//                             </div>
//                             <div className="w-px h-3 bg-white/20"></div>
//                             <Button asChild className="bg-white text-black hover:bg-secondary hover:text-white font-black rounded-full px-4 py-3 h-auto text-[9px] tracking-widest shadow-2xl transition-all duration-500">
//                                 <Link href={`/booking?service=${service.id}`}>SECURE THE BENCH</Link>
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </Card>
//                   </CarouselItem>
//                 ))}
//               </CarouselContent>
//               <div className="hidden md:flex justify-center gap-4 mt-12">
//                 <CarouselPrevious className="static translate-y-0 w-12 h-12 border-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg rounded-full" />
//                 <CarouselNext className="static translate-y-0 w-12 h-12 border-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg rounded-full" />
//               </div>
//             </Carousel>
//           )}
//         </div>
//       </section>

//      {/* Products Slider Section - Boutique Enhancement */}
//       <section className="py-32 px-4 bg-primary text-white relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-tr from-secondary/10 to-transparent"></div>
        
//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
//             <div className="space-y-4">
//               <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
//                 <span className="text-[#FA9DB7] font-black tracking-[0.4em] uppercase text-[10px]">The Boutique</span>
//               </div>
//               <h2 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight">Couture Skincare</h2>
//               <p className="text-white/50 font-light text-lg max-w-xl">Scientifically formulated. Artistically packaged. Experience the JAM collection.</p>
//             </div>
//             <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white text-black rounded-full px-10 py-7 font-black tracking-[0.2em] text-[10px] group transition-all duration-700 backdrop-blur-sm">
//               <Link href="/products" className="flex items-center">
//                 VISIT THE BOUTIQUE <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
//               </Link>
//             </Button>
//           </div>

//           {products.length === 0 ? (
//             <div className="text-center py-24 bg-white/5 rounded-[4rem] border border-dashed border-white/10 backdrop-blur-md">
//               <ShoppingBag className="w-20 h-20 text-white/20 mx-auto mb-6" />
//               <h3 className="text-3xl font-serif font-bold text-white/60 mb-2">Awaiting Inventory</h3>
//               <p className="text-white/50 font-light">Our exclusive collection is being curated.</p>
//             </div>
//           ) : (
//             <Carousel opts={{ align: "start" }} className="w-full">
//               <CarouselContent className="-ml-6">
//                 {products.map((product) => (
//                   <CarouselItem key={product.id} className="pl-6 md:basis-1/2 lg:basis-1/4 xl:basis-1/5">
//                     <div className="group cursor-pointer bg-white/5 p-6 border border-white/10 rounded-4xl hover:bg-white/10 hover:border-secondary/50 transition-all duration-700 backdrop-blur-md flex flex-col h-full">
//                       <div className="relative aspect-square overflow-hidden mb-6 rounded-3xl bg-black/20 shadow-xl">
//                         <img 
//                           src={product.imageUrl || "https://images.unsplash.com/photo-1512690196222-7c7d3f993c1b?q=80&w=2070&auto=format&fit=crop"} 
//                           alt={product.name} 
//                           className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110"
//                         />
//                         {product.totalStock <= 5 && (
//                           <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-[8px] font-black tracking-[0.2em] uppercase shadow-2xl">
//                             RARE
//                           </div>
//                         )}
//                         <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center backdrop-blur-[2px]">
//                           <Button asChild className="bg-white text-black hover:bg-secondary hover:text-white rounded-full w-12 h-12 p-0 shadow-2xl transition-all duration-500 group-hover:scale-110">
//                             <Link href={`/products#${product.id}`}>
//                               <ShoppingBag className="w-5 h-5" />
//                             </Link>
//                           </Button>
//                         </div>
//                       </div>
//                       <div className="space-y-4 flex-1 flex flex-col">
//                         <div className="flex justify-between items-center">
//                           <span className="text-[9px] uppercase tracking-[0.3em] text-secondary font-black">
//                             {product.category}
//                           </span>
//                           <span className="text-white font-serif italic text-xl">${product.price}</span>
//                         </div>
//                         <h4 className="text-lg font-serif font-bold group-hover:text-secondary transition-colors duration-500 truncate">
//                           {product.name}
//                         </h4>
//                         <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-auto">
//                           <div className="flex gap-0.5">
//                             {[1,2,3,4,5].map(s => (
//                               <Star key={s} className={cn(
//                                 "w-2.5 h-2.5 transition-colors duration-500", 
//                                 s <= Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-white/20"
//                               )} />
//                             ))}
//                           </div>
//                           <span className="text-[8px] font-black tracking-widest text-white/40 ml-auto uppercase">{product.reviews} REVIEWS</span>
//                         </div>
//                         <Button asChild className="w-full mt-4 bg-white/5 hover:bg-secondary hover:text-white text-white rounded-xl py-5 h-auto text-[9px] font-black tracking-[0.2em] transition-all duration-700 border border-white/5 hover:border-secondary shadow-lg">
//                           <Link href={`/products?product=${product.id}`}>ADD TO COLLECTION</Link>
//                         </Button>
//                       </div>
//                     </div>
//                   </CarouselItem>
//                 ))}
//               </CarouselContent>
//               <div className="hidden md:flex justify-end gap-4 mt-12">
//                 <CarouselPrevious className="static translate-y-0 w-10 h-10 border-white/10 text-white bg-white/10 transition-all rounded-full" />
//                 <CarouselNext className="static translate-y-0 w-10 h-10 border-white/10 text-white bg-white/10 transition-all rounded-full" />
//               </div>
//             </Carousel>
//           )}
//         </div>
//       </section>

//          {/* Philosophy Section - New Premium Addition */}
//       <section className="py-32 px-4 bg-white overflow-hidden">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
//             <div className="relative">
//               <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
//               <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
//               <div className="relative aspect-4/5 overflow-hidden rounded-[4rem] shadow-2xl group">
//                 <img 
//                   src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2069&auto=format&fit=crop" 
//                   alt="Philosophy" 
//                   className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
//                 />
//                 <div className="absolute inset-0 bg-linear-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
//               </div>
//               <div className="absolute top-1/2 -right-12 -translate-y-1/2 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 hidden lg:block animate-float">
//                 <div className="space-y-4">
//                   <Quote className="w-10 h-10 text-secondary opacity-30" />
//                   <p className="text-lg font-serif italic text-primary max-w-[200px]">
//                     "Beauty is the illumination of your soul."
//                   </p>
//                   <div className="h-px w-12 bg-secondary"></div>
//                   <p className="text-xs font-black tracking-widest text-gray-400 uppercase">Founder, JAM</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="space-y-10">
//               <div className="space-y-4">
//                 <div className="inline-block bg-secondary/10 px-4 py-1.5 rounded-full">
//                   <span className="text-[#FA9DB7] font-black tracking-[0.3em] uppercase text-[10px]">The JAM Philosophy</span>
//                 </div>
//                 <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary leading-tight">
//                   Where Nature <br /> Meets <span className="text-secondary italic">Luxury</span>
//                 </h2>
//               </div>
              
//               <p className="text-xl text-gray-600 font-light leading-relaxed">
//                 Founded on the principle that true beauty is an experience, not just a result. At JAM Beauty Lounge, we believe in a holistic approach to self-care, combining age-old wisdom with modern innovation.
//               </p>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
//                       <ShieldCheck className="w-5 h-5 text-primary" />
//                     </div>
//                     <h4 className="font-bold text-primary uppercase tracking-widest text-sm">Purity</h4>
//                   </div>
//                   <p className="text-sm text-gray-500 font-light">We use only the finest organic and scientifically-proven ingredients.</p>
//                 </div>
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
//                       <Zap className="w-5 h-5 text-primary" />
//                     </div>
//                     <h4 className="font-bold text-primary uppercase tracking-widest text-sm">Innovation</h4>
//                   </div>
//                   <p className="text-sm text-gray-500 font-light">State-of-the-art treatments tailored to your unique biology.</p>
//                 </div>
//               </div>
              
//               <div className="pt-8">
//                 <Button variant="link" className="text-primary font-black uppercase tracking-[0.3em] text-xs p-0 group">
//                   Learn Our Full Story <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Featured In Section - Enhanced Press Bar */}
//       <section className="py-20 bg-gray-50/30">
//         <div className="max-w-7xl mx-auto px-4">
//           <p className="text-center text-[11px] uppercase tracking-[0.6em] text-gray-400 mb-12 font-black">As Recognised By</p>
//           <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
//             {['GQ', 'VOGUE', 'ESQUIRE', 'FORBES', 'HAPERS BAZAAR'].map((brand) => (
//               <span key={brand} className="text-2xl md:text-4xl font-serif font-bold tracking-tighter text-primary cursor-default">{brand}</span>
//             ))}
//           </div>
//         </div>
//       </section>


//        {/* ==================== MEMBER REWARDS SECTION ==================== */}
//       <section className="py-20 px-4 bg-gray-50/50 relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
//             <div className="space-y-2">
//               <div className="inline-block bg-secondary/10 px-3 py-1 rounded-full">
//                 <span className="text-[#FA9DB7] font-bold tracking-[0.2em] uppercase text-[10px]">Exclusive Privileges</span>
//               </div>
//               <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">Member Rewards</h2>
//               <Badge variant="outline" className="border-secondary/30 text-secondary mt-2">
//                 {totalActiveOffers} Active Offers Available
//               </Badge>
//             </div>
//             <p className="text-muted-foreground max-w-md text-sm font-light">
//               Unlock premium benefits and exclusive savings designed for our most loyal patrons.
//             </p>
//           </div>
          
//           {offers.length === 0 ? (
//             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
//               <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-2xl font-serif font-bold text-gray-400 mb-2">No Offers Available</h3>
//               <p className="text-gray-400 font-light">Add active offers to Firebase to see them here</p>
//               <Button 
//                 onClick={fetchHomeData} 
//                 className="mt-4 bg-secondary hover:bg-secondary/90 text-white"
//               >
//                 <RefreshCw className="w-4 h-4 mr-2" />
//                 Refresh
//               </Button>
//             </div>
//           ) : (
//             <Carousel opts={{ align: "start", loop: true }} className="w-full">
//               <CarouselContent className="-ml-6">
//                 {offers.map((offer) => {
//                   const discountText = formatDiscount(offer);
//                   const offerBgColor = getOfferBgColor(offer.offerType);
                  
//                   return (
//                     <CarouselItem key={offer.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
//                       <div className={cn(
//                         "p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2",
//                         offerBgColor
//                       )}>
//                         {/* Usage limit badge */}
//                         {offer.usageLimit && (
//                           <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full z-20">
//                             {offer.usedCount}/{offer.usageLimit} USED
//                           </div>
//                         )}
                        
//                         <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-125 group-hover:rotate-45 transition-all duration-700">
//                           <Ticket className="w-32 h-32 rotate-12" />
//                         </div>
                        
//                         {/* Offer Image Background */}
//                         {offer.imageUrl && (
//                           <div className="absolute inset-0 opacity-20">
//                             <img 
//                               src={offer.imageUrl} 
//                               alt={offer.title}
//                               className="w-full h-full object-cover"
//                               onError={(e) => {
//                                 e.currentTarget.style.display = 'none';
//                               }}
//                             />
//                           </div>
//                         )}
                        
//                         <div className="relative z-10 space-y-6">
//                           <div className="flex items-start justify-between">
//                             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
//                               <Zap className="w-5 h-5 text-white" />
//                             </div>
//                             <Badge className={cn(
//                               "text-[9px] font-black uppercase tracking-wider border-0",
//                               getOfferBadgeColor(offer.offerType)
//                             )}>
//                               {offer.offerType.toUpperCase()}
//                             </Badge>
//                           </div>
                          
//                           <div>
//                             <span className="text-xs font-bold tracking-widest opacity-70 uppercase block mb-1">
//                               {offer.branchNames?.length > 0 
//                                 ? `${offer.branchNames[0]}${offer.branchNames.length > 1 ? ` +${offer.branchNames.length - 1} more` : ''}`
//                                 : 'All Branches'}
//                             </span>
//                             <h4 className="text-4xl font-serif font-bold">{discountText}</h4>
//                             <h5 className="text-xl font-semibold mt-2">{offer.title}</h5>
//                           </div>
                          
//                           <p className="text-sm opacity-90 line-clamp-2">
//                             {offer.description}
//                           </p>
                          
//                           <div className="pt-4 flex items-center justify-between border-t border-white/20">
//                             <div className="space-y-1">
//                               <span className="text-[10px] uppercase tracking-widest opacity-60">Valid Until</span>
//                               <div className="flex items-center gap-1">
//                                 <Calendar className="w-3 h-3" />
//                                 <span className="text-xs font-semibold">
//                                   {offer.validTo.toLocaleDateString('en-US', { 
//                                     month: 'short', 
//                                     day: 'numeric',
//                                     year: 'numeric'
//                                   })}
//                                 </span>
//                               </div>
//                             </div>
                            
//                             <Button 
//                               variant="ghost" 
//                               size="icon" 
//                               className="rounded-full bg-white/10 hover:bg-white/20 text-white"
//                             >
//                               <ArrowRight className="w-5 h-5" />
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </CarouselItem>
//                   );
//                 })}
//               </CarouselContent>
//               <div className="hidden md:flex justify-end gap-3 mt-8">
//                 <CarouselPrevious className="static translate-y-0 border-primary/10 hover:bg-primary hover:text-white transition-all" />
//                 <CarouselNext className="static translate-y-0 border-primary/10 hover:bg-primary hover:text-white transition-all" />
//               </div>
//             </Carousel>
//           )}
//         </div>
//       </section>

//       {/* ==================== EXCLUSIVE MEMBERSHIPS SECTION ==================== */}
//       <section className="py-20 px-4 bg-white relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diamond.png')] opacity-[0.02] pointer-events-none"></div>
//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
//             <div className="space-y-2">
//               <div className="inline-block bg-secondary/10 px-3 py-1 rounded-full">
//                 <span className="text-[#FA9DB7] font-bold tracking-[0.2em] uppercase text-[10px]">Elite Access</span>
//               </div>
//               <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">Exclusive Memberships</h2>
//               <Badge variant="outline" className="border-secondary/30 text-secondary mt-2">
//                 {totalActiveMemberships} Premium Plans Available
//               </Badge>
//             </div>
//             <p className="text-muted-foreground max-w-md text-sm font-light">
//               Join our elite community and unlock unprecedented benefits, priority access, and exclusive privileges.
//             </p>
//           </div>
          
//           {memberships.length === 0 ? (
//             <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
//               <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-2xl font-serif font-bold text-gray-400 mb-2">No Memberships Available</h3>
//               <p className="text-gray-400 font-light">Add membership plans to Firebase to see them here</p>
//               <Button 
//                 onClick={fetchHomeData} 
//                 className="mt-4 bg-secondary hover:bg-secondary/90 text-primary"
//               >
//                 <RefreshCw className="w-4 h-4 mr-2" />
//                 Refresh
//               </Button>
//             </div>
//           ) : (
//             <Carousel opts={{ align: "start", loop: true }} className="w-full">
//               <CarouselContent className="-ml-6">
//                 {memberships.map((membership) => {
//                   const TierIcon = getMembershipTierIcon(membership.tier);
//                   const membershipBgColor = getMembershipTierColor(membership.tier);
//                   const durationText = formatDuration(membership.duration);
//                   const branchName = getFirstBranchName(membership);
//                   const branchCountText = getBranchCountText(membership);
                  
//                   return (
//                     <CarouselItem key={membership.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
//                       <div className={cn(
//                         "p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2",
//                         membershipBgColor
//                       )}>
//                         {/* Popular badge */}
//                         {membership.totalSubscriptions > 10 && (
//                           <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full z-20">
//                             POPULAR
//                           </div>
//                         )}
                        
//                         <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-125 group-hover:rotate-45 transition-all duration-700">
//                           <Crown className="w-32 h-32 rotate-12" />
//                         </div>
                        
//                         <div className="relative z-10 space-y-6">
//                           <div className="flex items-start justify-between">
//                             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
//                               <TierIcon className="w-5 h-5 text-white" />
//                             </div>
//                             <Badge className={cn(
//                               "text-[9px] font-black uppercase tracking-wider border-0",
//                               membership.tier === 'exclusive' 
//                                 ? 'bg-linear-to-r from-yellow-400 to-orange-400 text-black'
//                                 : 'bg-white/20 text-white'
//                             )}>
//                               {membership.tier.toUpperCase()}
//                             </Badge>
//                           </div>
                          
//                           <div>
//                             <span className="text-xs font-bold tracking-widest opacity-70 uppercase block mb-1">
//                               {durationText} • {branchName}
//                             </span>
//                             <h4 className="text-4xl font-serif font-bold">${membership.price}</h4>
//                             <h5 className="text-xl font-semibold mt-2">{membership.name}</h5>
//                           </div>
                          
//                           <p className="text-sm opacity-90 line-clamp-2">
//                             {membership.description}
//                           </p>
                          
//                           {/* Benefits List */}
//                           <div className="space-y-2">
//                             <span className="text-[10px] uppercase tracking-widest opacity-60 block">Key Benefits</span>
//                             <div className="space-y-1.5">
//                               {membership.benefits.slice(0, 3).map((benefit, index) => (
//                                 <div key={index} className="flex items-center gap-2">
//                                   <Check className="w-3 h-3 text-green-300" />
//                                   <span className="text-xs opacity-90">{benefit}</span>
//                                 </div>
//                               ))}
//                               {membership.benefits.length > 3 && (
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-3 h-3 flex items-center justify-center">
//                                     <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
//                                   </div>
//                                   <span className="text-xs opacity-70">
//                                     +{membership.benefits.length - 3} more benefits
//                                   </span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
                          
//                           <div className="pt-4 flex items-center justify-between border-t border-white/20">
//                             <div className="space-y-1">
//                               <span className="text-[10px] uppercase tracking-widest opacity-60">Available At</span>
//                               <div className="flex items-center gap-1">
//                                 <MapPin className="w-3 h-3" />
//                                 <span className="text-xs font-semibold">
//                                   {branchCountText}
//                                 </span>
//                               </div>
//                             </div>
                            
//                             <Button 
//                               variant="ghost" 
//                               size="icon" 
//                               className="rounded-full bg-white/10 hover:bg-white/20 text-white"
//                             >
//                               <ArrowRight className="w-5 h-5" />
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </CarouselItem>
//                   );
//                 })}
//               </CarouselContent>
//               <div className="hidden md:flex justify-end gap-3 mt-8">
//                 <CarouselPrevious className="static translate-y-0 border-primary/10 hover:bg-primary hover:text-white transition-all" />
//                 <CarouselNext className="static translate-y-0 border-primary/10 hover:bg-primary hover:text-white transition-all" />
//               </div>
//             </Carousel>
//           )}
//         </div>
//       </section>

//       {/* Staff Slider Section - Artisans Enhancement */}
//       <section className="py-32 px-4 bg-white overflow-hidden relative">
//         <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 skew-x-12 translate-x-1/2 pointer-events-none"></div>
//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
//             <div className="space-y-4">
//               <div className="inline-block bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
//                 <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">The Collective</span>
//               </div>
//               <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary tracking-tight">Master Artisans</h2>
//               <p className="text-muted-foreground max-w-xl font-light text-lg">Curating beauty through precision, technique, and a touch of JAM magic.</p>
//             </div>
//             <div className="flex flex-col items-end gap-4">
//               <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-full border border-gray-100">
//                  <div className="flex -space-x-4">
//                    {staff.slice(0, 4).map((s, i) => (
//                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden">
//                        <img src={s.image} className="w-full h-full object-cover" alt="" />
//                      </div>
//                    ))}
//                  </div>
//                  <div className="px-4">
//                    <p className="text-[10px] font-black tracking-widest text-primary uppercase">{staff.length} ELITE MASTERS</p>
//                    <div className="flex items-center gap-1">
//                      <Star className="w-3 h-3 fill-secondary text-secondary" />
//                      <span className="text-[10px] font-bold text-primary font-serif italic">4.9/5 Average Rating</span>
//                    </div>
//                  </div>
//               </div>
//               <Button asChild className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-full px-8 py-6 text-[10px] tracking-[0.3em] uppercase shadow-xl hover:scale-105 transition-all duration-500">
//                 <Link href="/customer/portal/staff">
//                   View All Staff
//                   <ChevronRight className="w-4 h-4 ml-2" />
//                 </Link>
//               </Button>
//             </div>
//           </div>

//           {staff.length === 0 ? (
//             <div className="text-center py-24 bg-gray-50 rounded-[4rem] border border-dashed border-gray-200">
//               <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
//               <h3 className="text-3xl font-serif font-bold text-gray-400 mb-2">Artisans Off-Duty</h3>
//               <p className="text-gray-400 font-light">Our masters are currently preparing for the next season.</p>
//             </div>
//           ) : (
//             <Carousel opts={{ align: "start", loop: true }} className="w-full">
//               <CarouselContent className="-ml-6">
//                 {staff.map((member) => (
//                   <CarouselItem key={member.id} className="pl-6 md:basis-1/2 lg:basis-1/4 xl:basis-1/5">
//                     <div className="group relative">
//                       <div className="relative aspect-4/5 overflow-hidden rounded-4xl shadow-xl transition-all duration-1000 group-hover:rounded-2xl">
//                         <img 
//                           src={member.image} 
//                           alt={member.name}
//                           className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110"
//                         />
//                         <div className="absolute inset-0 bg-linear-to-t from-primary/95 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-10">
//                           <div className="space-y-6 translate-y-10 group-hover:translate-y-0 transition-transform duration-700">
//                             <div className="flex gap-3">
//                               <a href="#" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-secondary hover:text-white transition-all">
//                                 <Instagram className="w-5 h-5" />
//                               </a>
//                               <a href="#" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-secondary hover:text-white transition-all">
//                                 <Phone className="w-5 h-5" />
//                               </a>
//                             </div>
//                             <Button asChild className="w-full bg-white text-black hover:bg-secondary hover:text-white rounded-2xl py-7 font-black text-[10px] tracking-[0.3em] shadow-2xl transition-all duration-500">
//                               <Link href={`/staff/${member.id}`}>VIEW PORTFOLIO</Link>
//                             </Button>
//                           </div>
//                         </div>
//                         <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
//                            <span className="text-[10px] text-white font-black tracking-widest">{member.reviews} REVIEWS</span>
//                         </div>
//                       </div>
//                       <div className="mt-8 text-center px-4">
//                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{member.role}</span>
//                         <h3 className="text-3xl font-serif font-bold text-primary mt-3 group-hover:text-secondary transition-colors duration-500">{member.name}</h3>
//                         <div className="flex items-center justify-center gap-2 mt-4">
//                            <div className="flex gap-0.5">
//                              {[1,2,3,4,5].map(s => (
//                                <Star key={s} className={cn(
//                                  "w-2.5 h-2.5",
//                                  s <= Math.floor(member.rating) ? "fill-secondary text-secondary" : "text-gray-300"
//                                )} />
//                              ))}
//                            </div>
//                            <span className="text-[10px] font-black text-primary/40 tracking-widest uppercase">{member.rating.toFixed(1)} RATING</span>
//                         </div>
//                       </div>
//                     </div>
//                   </CarouselItem>
//                 ))}
//               </CarouselContent>
//               <div className="flex justify-center gap-8 mt-20">
//                 <CarouselPrevious className="static translate-y-0 w-16 h-16 border-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-xl rounded-full" />
//                 <CarouselNext className="static translate-y-0 w-16 h-16 border-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-xl rounded-full" />
//               </div>
//             </Carousel>
//           )}
//         </div>
//       </section>

//     {/* Flagships Section - Enhanced */}
//       <section className="py-40 px-4 bg-gray-50 relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none"></div>
//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
//             <div className="space-y-6">
//               <div className="inline-block bg-secondary/10 px-4 py-1.5 rounded-full">
//                 <span className="text-secondary font-black tracking-[0.4em] uppercase text-[10px]">Global Flagships</span>
//               </div>
//               <h2 className="text-5xl md:text-8xl font-serif font-bold text-primary leading-tight tracking-tighter">
//                 The Lounge <br /><span className="text-secondary italic">Experience.</span>
//               </h2>
//             </div>
//             <div className="lg:max-w-md space-y-8">
//               <p className="text-muted-foreground text-xl font-light leading-relaxed">
//                 With {branches.length} curated destinations globally, we redefine the sanctuary of beauty. Find your local JAM haven.
//               </p>
//               <Button size="lg" asChild className="bg-primary hover:bg-secondary text-white rounded-full px-12 py-8 font-black tracking-[0.3em] text-[10px] shadow-2xl transition-all duration-700 hover:scale-105">
//                 <Link href="/branches" className="flex items-center gap-3">
//                   EXPLORE ALL {branches.length} LOCATIONS <ArrowRight className="w-5 h-5" />
//                 </Link>
//               </Button>
//             </div>
//           </div>

//           {branches.length === 0 ? (
//             <div className="text-center py-24 bg-white rounded-[4rem] border border-dashed border-gray-200 shadow-sm">
//               <Building className="w-20 h-20 text-gray-300 mx-auto mb-6" />
//               <h3 className="text-3xl font-serif font-bold text-gray-400 mb-2">Opening Soon</h3>
//               <p className="text-gray-400 font-light">New flagships are currently being designed.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
//               {branches.map((branch) => (
//                 <div key={branch.id} className="group cursor-pointer bg-white p-10 rounded-[3rem] border border-transparent hover:border-secondary/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden">
//                   <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-[4rem] group-hover:w-full group-hover:h-full group-hover:rounded-none transition-all duration-700"></div>
//                   <div className="relative z-10 space-y-8">
//                     <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-secondary group-hover:bg-white group-hover:scale-110 transition-all duration-700 shadow-sm">
//                       <MapPin className="w-8 h-8" />
//                     </div>
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <h4 className="font-serif font-bold text-2xl text-primary group-hover:text-primary transition-colors">
//                           {branch.name}
//                         </h4>
//                         <div className={cn(
//                           "w-2 h-2 rounded-full animate-pulse",
//                           branch.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'
//                         )}></div>
//                       </div>
//                       <p className="text-sm text-muted-foreground font-light leading-relaxed">
//                         {branch.address}, {branch.city}
//                       </p>
//                     </div>
//                     <div className="pt-8 border-t border-gray-100 space-y-3">
//                       <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-primary/60 uppercase">
//                         <Clock className="w-3.5 h-3.5" />
//                         {branch.openingTime} - {branch.closingTime}
//                       </div>
//                       <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-primary/60 uppercase">
//                         <Phone className="w-3.5 h-3.5" />
//                         {branch.phone}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//        {/* Newsletter Section - Premium */}
//       <section className="py-40 px-4 bg-primary relative overflow-hidden">
//         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm scale-110"></div>
//         <div className="absolute inset-0 bg-primary/90"></div>
        
//         <div className="max-w-5xl mx-auto text-center relative z-10">
//           <div className="inline-block bg-white/5 backdrop-blur-md px-6 py-2 rounded-full mb-10 border border-white/10">
//             <span className="text-white font-black tracking-[0.5em] uppercase text-[10px]">Lifestyle Newsletter</span>
//           </div>
//           <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-10 leading-[0.9] tracking-tighter">
//             The <span className="text-gray-400 italic">Inner</span> Circle
//           </h2>
//           <p className="text-xl text-white/70 mb-20 font-light max-w-2xl mx-auto leading-relaxed italic">
//             "Beauty is an experience, not just a service." Join 5,000+ members receiving curated aesthetics weekly.
//           </p>
          
//           <div className="flex flex-col sm:flex-row gap-6 max-w-3xl mx-auto bg-white/5 p-4 rounded-[3.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10">
//             <input 
//               placeholder="Your email for the invitation" 
//               className="h-20 bg-transparent text-white rounded-full px-10 focus:outline-none transition-all w-full font-light text-xl placeholder:text-white/40"
//             />
//             <Button size="lg" className="h-20 bg-white/60 text-white hover:bg-white hover:text-black hover:scale-105 transition-all duration-500 font-black px-16 rounded-[2.5rem] shrink-0 tracking-[0.3em] text-[10px]">
//               SUBSCRIBE
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Final CTA Section */}
//       <section className="relative py-48 px-4 overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           <img 
//             src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop" 
//             className="w-full h-full object-cover scale-110 opacity-30 blur-[2px]"
//             alt="Background"
//           />
//           <div className="absolute inset-0 bg-linear-to-b from-white via-white/80 to-white"></div>
//         </div>
        
//         <div className="relative z-10 max-w-6xl mx-auto text-center space-y-16">
//           <div className="space-y-6">
//             <h2 className="text-6xl md:text-9xl font-serif font-bold text-primary leading-[0.85] tracking-tighter">
//               Redefine <br />
//               <span className="text-gray-400 italic">Your Style.</span>
//             </h2>
//             <p className="text-xl md:text-3xl text-primary/60 max-w-4xl mx-auto font-light leading-relaxed">
//               Step into the world of JAM. Where every visit is a transformation.
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
//             <Button size="lg" asChild className="bg-primary hover:bg-secondary text-white font-black px-16 py-12 text-xs rounded-4xl shadow-[0_30px_60px_-15px_rgba(168,21,86,0.5)] transition-all duration-700 hover:scale-110 tracking-[0.4em] ring-offset-2 ring-primary/20 hover:ring-8">
//               <Link href="/services">BOOK NOW</Link>
//             </Button>
//             <Button size="lg" variant="outline" asChild className="border-primary/20 text-primary hover:bg-primary hover:text-white px-16 py-12 text-xs rounded-4xl backdrop-blur-md transition-all duration-700 hover:scale-110 tracking-[0.4em] bg-white/50">
//               <Link href="/login">BECOME A MEMBER</Link>
//             </Button>
//           </div>
//         </div>
//       </section>

//     <Footer/>
//     </div>

//   );
// }
// new code

'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scissors, MapPin, Star, Clock, Phone, Mail, Award, Users, 
  Calendar, ChevronRight, ShoppingBag, Ticket, ArrowRight,
  Quote, Instagram, CheckCircle2, ShieldCheck, Zap, Building,
  TrendingUp, Package, DollarSign, RefreshCw,
  Crown, Gem, Shield, Sparkles, Check, UserCheck,
  Grid3X3,
  InstagramIcon,
  Facebook
} from "lucide-react";
import { Header } from "@/components/shared/Header";
import Link from "next/link";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Footer } from '@/components/shared/Footer';

// ==================== STORE DEFINITION ====================
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  categoryId: string;
  imageUrl: string;
  branchNames: string[];
  branches: string[];
  popularity: string;
  revenue: number;
  status: string;
  totalBookings: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  categoryId: string;
  imageUrl: string;
  sku: string;
  rating: number;
  reviews: number;
  revenue: number;
  status: string;
  totalSold: number;
  totalStock: number;
  branchNames: string[];
  branches: string[];
}

interface StaffMember {
  id: string;
  name: string;
  image: string;
  role: string;
  rating: number;
  reviews: number;
  status: string;
  bio?: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  openingTime: string;
  closingTime: string;
  phone: string;
  email: string;
  status: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  imageUrl: string;
  offerType: 'service' | 'product' | 'both';
  applicableProducts: string[];
  applicableServices: string[];
  branchNames: string[];
  branches: string[];
  status: 'active' | 'inactive' | 'expired';
  usageLimit: number | null;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Membership {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  tier: 'basic' | 'premium' | 'vip' | 'exclusive';
  benefits: string[];
  branchNames: string[];
  branches: string[];
  status: 'active' | 'inactive';
  revenue: number;
  totalSubscriptions: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  branchId: string;
  branchName: string;
  branchCity: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface HomeStore {
  services: Service[];
  products: Product[];
  staff: StaffMember[];
  branches: Branch[];
  offers: Offer[];
  memberships: Membership[];
  categories: Category[];
  stats: {
    totalStaff: number;
    totalServices: number;
    totalProducts: number;
    totalBranches: number;
    totalOffers: number;
    totalMemberships: number;
    totalCategories: number;
  };
  
  fetchHomeData: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  fetchBranches: () => Promise<void>;
  fetchOffers: () => Promise<void>;
  fetchMemberships: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  calculateStats: () => void;
}

const useHomeStore = create<HomeStore>((set, get) => ({
  services: [],
  products: [],
  staff: [],
  branches: [],
  offers: [],
  memberships: [],
  categories: [],
  stats: {
    totalStaff: 0,
    totalServices: 0,
    totalProducts: 0,
    totalBranches: 0,
    totalOffers: 0,
    totalMemberships: 0,
    totalCategories: 0,
  },

  fetchHomeData: async () => {
    try {
      await Promise.all([
        get().fetchServices(),
        get().fetchProducts(),
        get().fetchStaff(),
        get().fetchBranches(),
        get().fetchOffers(),
        get().fetchMemberships(),
        get().fetchCategories()
      ]);
      get().calculateStats();
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  },

  fetchServices: async () => {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('createdAt', 'desc'), limit(6));
      const querySnapshot = await getDocs(q);
      
      const servicesData: Service[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        servicesData.push({
          id: doc.id,
          name: data.name || 'Unnamed Service',
          description: data.description || 'No description available',
          price: Number(data.price) || 0,
          duration: Number(data.duration) || 30,
          category: data.category || 'Uncategorized',
          categoryId: data.categoryId || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop',
          branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
          branches: Array.isArray(data.branches) ? data.branches : [],
          popularity: data.popularity || 'medium',
          revenue: Number(data.revenue) || 0,
          status: data.status || 'active',
          totalBookings: Number(data.totalBookings) || 0,
        });
      });
      
      set({ services: servicesData });
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  },

  fetchProducts: async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'), limit(8));
      const querySnapshot = await getDocs(q);
      
      const productsData: Product[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        productsData.push({
          id: doc.id,
          name: data.name || 'Unnamed Product',
          description: data.description || 'No description available',
          price: Number(data.price) || 0,
          cost: Number(data.cost) || 0,
          category: data.category || 'Uncategorized',
          categoryId: data.categoryId || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1512690196222-7c7d3f993c1b?q=80&w=2070&auto=format&fit=crop',
          sku: data.sku || 'N/A',
          rating: Number(data.rating) || 0,
          reviews: Number(data.reviews) || 0,
          revenue: Number(data.revenue) || 0,
          status: data.status || 'active',
          totalSold: Number(data.totalSold) || 0,
          totalStock: Number(data.totalStock) || 0,
          branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
          branches: Array.isArray(data.branches) ? data.branches : [],
        });
      });
      
      set({ products: productsData });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  },

  fetchStaff: async () => {
    try {
      const staffRef = collection(db, 'staff');
      const q = query(staffRef, orderBy('name', 'asc'), limit(4));
      const querySnapshot = await getDocs(q);
      
      const staffData: StaffMember[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        staffData.push({
          id: doc.id,
          name: data.name || 'Unknown Staff',
          image: data.imageUrl || data.avatar || data.photoURL || '/default-avatar.png',
          role: data.role || data.position || 'Barber',
          rating: Number(data.rating) || 4.5,
          reviews: Number(data.reviews) || 0,
          status: data.status || 'active',
          bio: data.description || data.experience || 'Professional barber with extensive experience.',
        });
      });
      
      set({ staff: staffData });
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  },

  fetchBranches: async () => {
    try {
      const branchesRef = collection(db, 'branches');
      const q = query(branchesRef, orderBy('name', 'asc'), limit(4));
      const querySnapshot = await getDocs(q);
      
      const branchesData: Branch[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        branchesData.push({
          id: doc.id,
          name: data.name || 'Unnamed Branch',
          address: data.address || 'Address not available',
          city: data.city || 'City not available',
          country: data.country || 'Country not available',
          openingTime: data.openingTime || '09:00',
          closingTime: data.closingTime || '18:00',
          phone: data.phone || 'N/A',
          email: data.email || 'N/A',
          status: data.status || 'active',
        });
      });
      
      set({ branches: branchesData });
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  },

  fetchOffers: async () => {
    try {
      const offersRef = collection(db, 'offers');
      const q = query(offersRef, orderBy('createdAt', 'desc'), limit(12));
      const querySnapshot = await getDocs(q);
      
      const offersData: Offer[] = [];
      const now = new Date();
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        
        const validFrom = data.validFrom?.toDate() || new Date();
        const validTo = data.validTo?.toDate() || new Date();
        const createdAt = data.createdAt?.toDate() || new Date();
        const updatedAt = data.updatedAt?.toDate() || new Date();
        
        const isActive = data.status === 'active';
        const isNotExpired = now <= validTo;
        
        if (isActive && isNotExpired) {
          offersData.push({
            id: doc.id,
            title: data.title || 'Special Offer',
            description: data.description || 'Limited time offer',
            discountType: data.discountType || 'percentage',
            discountValue: Number(data.discountValue) || 0,
            imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=2070&auto=format&fit=crop',
            offerType: data.offerType || 'service',
            applicableProducts: Array.isArray(data.applicableProducts) ? data.applicableProducts : [],
            applicableServices: Array.isArray(data.applicableServices) ? data.applicableServices : [],
            branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
            branches: Array.isArray(data.branches) ? data.branches : [],
            status: data.status || 'active',
            usageLimit: data.usageLimit || null,
            usedCount: Number(data.usedCount) || 0,
            validFrom,
            validTo,
            createdAt,
            updatedAt
          });
        }
      });
      
      const finalOffers = offersData.slice(0, 8);
      set({ offers: finalOffers });
    } catch (error) {
      console.error('Error fetching offers:', error);
      set({ offers: [] });
    }
  },

  fetchMemberships: async () => {
    try {
      const membershipsRef = collection(db, 'memberships');
      const q = query(membershipsRef, orderBy('createdAt', 'desc'), limit(8));
      const querySnapshot = await getDocs(q);
      
      const membershipsData: Membership[] = [];
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        
        const createdAt = data.createdAt?.toDate() || new Date();
        const updatedAt = data.updatedAt?.toDate() || new Date();
        
        const isActive = data.status === 'active';
        
        if (isActive) {
          membershipsData.push({
            id: doc.id,
            name: data.name || 'Membership',
            description: data.description || 'Premium membership plan',
            price: Number(data.price) || 0,
            duration: Number(data.duration) || 30,
            tier: data.tier || 'premium',
            benefits: Array.isArray(data.benefits) ? data.benefits : [],
            branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
            branches: Array.isArray(data.branches) ? data.branches : [],
            status: data.status || 'active',
            revenue: Number(data.revenue) || 0,
            totalSubscriptions: Number(data.totalSubscriptions) || 0,
            createdAt,
            updatedAt
          });
        }
      });
      
      set({ memberships: membershipsData });
    } catch (error) {
      console.error('Error fetching memberships:', error);
      set({ memberships: [] });
    }
  },

  fetchCategories: async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      // ⚠️ FIXED: Removed complex where clause causing index error
      // Simple query se data fetch karo, phir client side filter karo
      const q = query(categoriesRef, orderBy('createdAt', 'desc'), limit(8));
      const querySnapshot = await getDocs(q);
      
      const categoriesData: Category[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate() || new Date();
        const updatedAt = data.updatedAt?.toDate() || new Date();
        
        categoriesData.push({
          id: doc.id,
          name: data.name || 'Unnamed Category',
          description: data.description || 'No description available',
          image: data.image || 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=2070&auto=format&fit=crop',
          branchId: data.branchId || '',
          branchName: data.branchName || 'Unknown Branch',
          branchCity: data.branchCity || 'Unknown City',
          type: data.type || 'general',
          isActive: data.isActive || true,
          createdAt,
          updatedAt
        });
      });
      
      // ✅ Client side filter for active categories
      const activeCategories = categoriesData.filter(cat => cat.isActive);
      set({ categories: activeCategories.slice(0, 4) }); // Limit to 4 active categories
    } catch (error) {
      console.error('Error fetching categories:', error);
      // ✅ Fallback: Agar error aaye to empty array set karo
      set({ categories: [] });
    }
  },

  calculateStats: () => {
    const state = get();
    set({
      stats: {
        totalStaff: state.staff.length,
        totalServices: state.services.length,
        totalProducts: state.products.length,
        totalBranches: state.branches.length,
        totalOffers: state.offers.length,
        totalMemberships: state.memberships.length,
        totalCategories: state.categories.length
      }
    });
  },
}));

// ==================== MAIN COMPONENT ====================
export default function Home() {
  const { 
    services, 
    products, 
    staff, 
    branches, 
    offers,
    memberships,
    categories,
    stats,
    fetchHomeData 
  } = useHomeStore();

  // ===== CHAT LOGIC =====
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    const checkLogin = () => {
      // Check if user is logged in (update this based on your auth system)
      const user = localStorage.getItem('user'); // or cookies, or context
      setIsLoggedIn(!!user);
    };
    
    checkLogin();
    
    // Optional: Listen for storage changes
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const handleChatClick = () => {
    if (isLoggedIn) {
      // Agar login hai to chat page par jao
      window.location.href = '/customer/chat';
    } else {
      // Agar login nahi hai to popup dikhao
      setShowChatPopup(true);
    }
  };
  // ====================

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const totalActiveServices = services.filter(s => s.status === 'active').length;
  const totalActiveProducts = products.filter(p => p.status === 'active').length;
  const totalActiveStaff = staff.filter(s => s.status === 'active').length;
  const totalActiveBranches = branches.filter(b => b.status === 'active').length;
  const totalActiveOffers = offers.length;
  const totalActiveMemberships = memberships.length;
  const totalActiveCategories = categories.length;

  const totalServicesRevenue = services.reduce((sum, service) => sum + service.revenue, 0);
  const totalProductsRevenue = products.reduce((sum, product) => sum + product.revenue, 0);
  const totalRevenue = totalServicesRevenue + totalProductsRevenue;

  const getOfferBadgeColor = (offerType: string) => {
    switch (offerType) {
      case 'service': return 'bg-blue-500 text-white';
      case 'product': return 'bg-green-500 text-white';
      case 'both': return 'bg-purple-500 text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const formatDiscount = (offer: Offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else {
      return `$${offer.discountValue} OFF`;
    }
  };

  const getOfferBgColor = (offerType: string) => {
    switch (offerType) {
      case 'service': return 'bg-blue-600';
      case 'product': return 'bg-green-600';
      case 'both': return 'bg-purple-600';
      default: return 'bg-secondary';
    }
  };

  const getMembershipTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-600';
      case 'premium': return 'bg-secondary';
      case 'vip': return 'bg-purple-600';
      case 'exclusive': return 'bg-gradient-to-r from-yellow-600 to-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getMembershipTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return Shield;
      case 'premium': return Gem;
      case 'vip': return Crown;
      case 'exclusive': return Sparkles;
      default: return Shield;
    }
  };

  const formatDuration = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  const getFirstBranchName = (membership: Membership) => {
    if (membership.branchNames && membership.branchNames.length > 0) {
      return membership.branchNames[0];
    }
    
    if (membership.branches && membership.branches.length > 0) {
      const branchId = membership.branches[0];
      const branch = branches.find(b => b.id === branchId);
      return branch?.name || 'Multiple Branches';
    }
    
    return 'All Branches';
  };

  const getBranchCountText = (membership: Membership) => {
    if (membership.branches && membership.branches.length > 0) {
      return `${membership.branches.length} ${membership.branches.length === 1 ? 'Branch' : 'Branches'}`;
    }
    
    if (membership.branchNames && membership.branchNames.length > 0) {
      return `${membership.branchNames.length} ${membership.branchNames.length === 1 ? 'Branch' : 'Branches'}`;
    }
    
    return 'All Branches';
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
  
        {/* Simple Official WhatsApp Icon */}
        <a 
          href="https://wa.me/923001234567" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          title="WhatsApp"
        >
          <svg 
            className="w-7 h-7" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            {/* Direct WhatsApp Logo */}
            <path
              fill="#25D366"
              d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.78 2.7 15.57 3.71 17.08L2.09 21.91L7.06 20.33C8.55 21.24 10.27 21.72 12.04 21.72C17.5 21.72 21.95 17.27 21.95 11.81C21.95 6.35 17.5 2 12.04 2ZM12.04 20.09C10.46 20.09 8.92 19.65 7.58 18.83L7.32 18.68L4.43 19.57L5.34 16.77L5.18 16.5C4.3 15.12 3.81 13.53 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C16.58 3.68 20.27 7.37 20.27 11.91C20.27 16.45 16.58 20.09 12.04 20.09ZM16.46 13.95C16.18 13.81 14.95 13.21 14.69 13.12C14.43 13.03 14.24 12.98 14.05 13.26C13.86 13.54 13.33 14.09 13.17 14.27C13.01 14.45 12.85 14.47 12.57 14.33C12.29 14.19 11.46 13.91 10.48 13.05C9.7 12.37 9.16 11.51 9.02 11.23C8.88 10.95 9 10.79 9.13 10.66C9.25 10.53 9.4 10.33 9.53 10.17C9.66 10.01 9.71 9.89 9.79 9.73C9.87 9.57 9.82 9.43 9.74 9.31C9.66 9.19 9.11 7.98 8.9 7.5C8.69 7.02 8.48 7.07 8.32 7.07C8.16 7.07 7.99 7.07 7.83 7.07C7.67 7.07 7.41 7.13 7.19 7.39C6.97 7.65 6.35 8.29 6.35 9.58C6.35 10.87 7.22 12.11 7.37 12.3C7.52 12.49 9.09 14.83 11.5 15.94C12.69 16.52 13.59 16.79 14.28 16.97C15.06 17.16 15.79 17.09 16.36 16.88C16.93 16.67 17.67 16.15 17.88 15.53C18.09 14.91 18.09 14.38 18.04 14.28C17.99 14.18 17.85 14.11 17.68 14.04C17.52 13.99 16.74 14.09 16.46 13.95Z"
            />
          </svg>
        </a>
  
        {/* Very Simple Phone Icon */}
        <a 
          href="tel:+1234567890"
          className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          title="Call Now"
        >
          <svg 
            className="w-6 h-6 text-white" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            {/* Simple Phone Handset */}
            <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
            <path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2z"/>
            <path d="M16.5 13.5c-.3-.3-.7-.5-1.1-.5-.4 0-.8.1-1.1.4l-1.4 1.4c-1.1-.6-2.1-1.3-3-2.2-.9-.9-1.6-1.9-2.2-3l1.4-1.4c.3-.3.4-.7.4-1.1 0-.4-.1-.8-.4-1.1l-2-2c-.3-.3-.7-.5-1.1-.5-.4 0-.8.1-1.1.4L3.5 6.5c-.3.3-.5.7-.5 1.1 0 3.9 2.1 7.6 5 10.5 2.9 2.9 6.6 5 10.5 5 .4 0 .8-.2 1.1-.5l1.4-1.4c.3-.3.5-.7.5-1.1 0-.4-.2-.8-.5-1.1l-2-2z"/>
          </svg>
        </a>

        {/* MODIFIED: Chatbot Button with Login Logic */}
        <button
          onClick={handleChatClick}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          title="Chat with Bot"
        >
          <svg 
            className="w-6 h-6" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <defs>
              <linearGradient id="chatbot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />   {/* Purple */}
                <stop offset="50%" stopColor="#764ba2" />  {/* Dark Purple */}
                <stop offset="100%" stopColor="#6b8cff" /> {/* Blue */}
              </linearGradient>
            </defs>
            
            {/* Background Circle */}
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="url(#chatbot-gradient)" 
              strokeWidth="1.5" 
              fill="transparent"
            />
            
            {/* Chatbot Icon - Message Bubble with Dots */}
            <path 
              d="M20 12C20 16.4183 16.4183 20 12 20C10.5 20 9.1 19.6 7.9 18.9L4 20L5.1 16.1C4.4 14.9 4 13.5 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" 
              stroke="url(#chatbot-gradient)" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="white"
            />
            
            {/* Three Dots inside bubble */}
            <circle cx="9" cy="12" r="1" fill="url(#chatbot-gradient)" />
            <circle cx="12" cy="12" r="1" fill="url(#chatbot-gradient)" />
            <circle cx="15" cy="12" r="1" fill="url(#chatbot-gradient)" />
          </svg>
        </button>
      </div>

      {/* Chat Login Popup */}
      {showChatPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowChatPopup(false)}
          />
          
          {/* Popup Box */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 w-full animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setShowChatPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-serif font-bold text-center text-gray-900 mb-2">
              Create Account First! ✋
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-8">
              Aapko chat karne ke liye pehle account create karna hoga.
            </p>

            {/* Login/Signup Button */}
            <Link 
              href="/customer/login"
              className="block w-full text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              onClick={() => setShowChatPopup(false)}
            >
              Login / Sign Up
            </Link>

            {/* Continue as Guest (Optional) */}
            <button 
              onClick={() => setShowChatPopup(false)}
              className="block w-full text-center text-gray-500 text-sm mt-4 hover:text-gray-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* ==================== HERO SECTION - CODE 1 STYLE ==================== */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhdXR5JTIwc2Fsb258ZW58MHx8MHx8fDA%3D')",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white px-4 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 animate-fade-in shadow-2xl">
              <Sparkles className="w-4 h-4 text-slate/60 animate-pulse" />
              <span className="text-[11px] tracking-[0.4em] uppercase font-bold text-white">The Pinnacle of Beauty</span>
            </div>
           
           <h1 className="text-7xl md:text-9xl font-serif font-bold mb-8 leading-[0.9] tracking-tighter drop-shadow-2xl">
              Elegance <br />
              <span className="text-[#FA9DB7] italic">Redefined.</span>
            </h1>
            <p className="text-xl font-bold md:text-2xl mb-12 max-w-2xl mx-auto text-gray-100 leading-relaxed drop-shadow-lg opacity-90">
              Immerse yourself in a sanctuary of luxury where science meets art to reveal your most radiant self.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pointer-events-auto">
              <Button size="lg" variant="outline" asChild className="bg-white  text-black border-white/40 hover:bg-white/10 hover:text-white  font-bold px-12 py-8 text-lg rounded-full transition-all duration-700 shadow-2xl hover:scale-105 active:scale-95 group">
                <Link href="/services" className="flex items-center gap-2">
                  BOOK AN EXPERIENCE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/40 text-black hover:bg-white/10 hover:text-white px-12 py-8 text-lg rounded-full transition-all duration-700 backdrop-blur-md hover:scale-105 active:scale-95">
                <Link href="/services">OUR MENU</Link>
              </Button>
            </div>
          </div>
        </div>

      </section>


    { /* Categories Slider Section - New */}
      <section className="py-24 px-4 bg-gray-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <div className="inline-block bg-gray-200 px-4 py-1.5 rounded-full">
                <span className="text-[#FA9DB7] font-black tracking-[0.3em] uppercase text-[10px]">Browse By</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary tracking-tight">Service Categories</h2>
              <p className="text-gray-400 font-light text-lg">Choose your journey through our specialized beauty realms.</p>
            </div>
            <Button asChild variant="link" className="text-primary font-black uppercase tracking-[0.3em] text-xs p-0 group">
              <Link href="/services">VIEW THE FULL MENU <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" /></Link>
            </Button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-gray-400 mb-2">Finding Categories...</h3>
            </div>
          ) : (
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {categories.map((category) => (
                  <CarouselItem key={category.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6">
                    <Link href={`/services?category=${category.name}`}>
                      <div className="group cursor-pointer relative aspect-square overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700">
                        <img 
                          src={category.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop"} 
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent group-hover:from-white/60 transition-all duration-700"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <h4 className="text-white font-serif font-bold text-xl md:text-2xl mb-2 group-hover:scale-110 transition-transform duration-500">{category.name}</h4>
                          <span className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-black opacity-0 group-hover:opacity-100 transition-opacity duration-500">Explore Rituals</span>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:flex justify-end gap-3 mt-8">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          )}
        </div>
      </section>
      

     
     {/* Services Slider Section - Premium Enhancement */}
      <section className="py-32 px-4 bg-white relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <div className="inline-block bg-gray-200 px-4 py-1.5 rounded-full">
                <span className="text-[#FA9DB7] font-black tracking-[0.3em] uppercase text-[10px]">The Collection</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary tracking-tight">Signature Rituals</h2>
              <p className="text-gray-400 font-light text-lg">Indulge in our most sought-after treatments, curated for the modern soul.</p>
            </div>
            <Button asChild variant="outline" className="border-primary/10 text-primary hover:bg-primary hover:text-white rounded-full px-10 py-7 font-black tracking-[0.2em] text-[10px] group transition-all duration-700">
              <Link href="/services" className="flex items-center">
                EXPLORE ALL RITUALS <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-24 bg-gray-50/50 rounded-[4rem] border border-dashed border-gray-200">
              <Sparkles className="w-20 h-20 text-gray-200 mx-auto mb-6" />
              <h3 className="text-3xl font-serif font-bold text-gray-400 mb-2">Awaiting Excellence</h3>
              <p className="text-gray-400 font-light">Rituals will appear here once they are prepared.</p>
            </div>
          ) : (
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-6">
                {services.map((service) => (
                  <CarouselItem key={service.id} className="pl-6 md:basis-1/2 lg:basis-1/4 xl:basis-1/5">
                    <Card className="group border-none bg-transparent shadow-none overflow-hidden transition-all duration-700">
                      <div className="relative aspect-4/5 overflow-hidden rounded-4xl shadow-lg group-hover:shadow-2xl transition-all duration-700">
                        <img 
                          src={service.imageUrl || "https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop"} 
                          alt={service.name} 
                          className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                        
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-white/20 backdrop-blur-md text-white border-0 px-3 py-1 rounded-full font-bold text-[9px] tracking-widest uppercase">
                            {service.category}
                          </Badge>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 space-y-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xl font-serif font-bold text-white group-hover:text-secondary transition-colors line-clamp-1">{service.name}</h4>
                                <span className="text-lg font-bold text-gray-300">${service.price}</span>
                            </div>
                            <p className="text-white/70 text-[12px] font-light line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                                {service.description || "A transformative journey for your skin and soul."}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                            <div className="flex items-center gap-1.5 text-white/60">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{service.duration} MIN</span>
                            </div>
                            <div className="w-px h-3 bg-white/20"></div>
                            <Button asChild className="bg-white text-black hover:bg-secondary hover:text-white font-black rounded-full px-4 py-3 h-auto text-[9px] tracking-widest shadow-2xl transition-all duration-500">
                                <Link href={`/booking?service=${service.id}`}>SECURE THE BENCH</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:flex justify-center gap-4 mt-12">
                <CarouselPrevious className="static translate-y-0 w-12 h-12 border-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg rounded-full" />
                <CarouselNext className="static translate-y-0 w-12 h-12 border-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg rounded-full" />
              </div>
            </Carousel>
          )}
        </div>
      </section>

     {/* Products Slider Section - Boutique Enhancement */}
      <section className="py-32 px-4 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-tr from-secondary/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="space-y-4">
              <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                <span className="text-[#FA9DB7] font-black tracking-[0.4em] uppercase text-[10px]">The Boutique</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight">Couture Skincare</h2>
              <p className="text-white/50 font-light text-lg max-w-xl">Scientifically formulated. Artistically packaged. Experience the JAM collection.</p>
            </div>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white text-black rounded-full px-10 py-7 font-black tracking-[0.2em] text-[10px] group transition-all duration-700 backdrop-blur-sm">
              <Link href="/products" className="flex items-center">
                VISIT THE BOUTIQUE <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 bg-white/5 rounded-[4rem] border border-dashed border-white/10 backdrop-blur-md">
              <ShoppingBag className="w-20 h-20 text-white/20 mx-auto mb-6" />
              <h3 className="text-3xl font-serif font-bold text-white/60 mb-2">Awaiting Inventory</h3>
              <p className="text-white/50 font-light">Our exclusive collection is being curated.</p>
            </div>
          ) : (
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-6">
                {products.map((product) => (
                  <CarouselItem key={product.id} className="pl-6 md:basis-1/2 lg:basis-1/4 xl:basis-1/5">
                    <div className="group cursor-pointer bg-white/5 p-6 border border-white/10 rounded-4xl hover:bg-white/10 hover:border-secondary/50 transition-all duration-700 backdrop-blur-md flex flex-col h-full">
                      <div className="relative aspect-square overflow-hidden mb-6 rounded-3xl bg-black/20 shadow-xl">
                        <img 
                          src={product.imageUrl || "https://images.unsplash.com/photo-1512690196222-7c7d3f993c1b?q=80&w=2070&auto=format&fit=crop"} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110"
                        />
                        {product.totalStock <= 5 && (
                          <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-[8px] font-black tracking-[0.2em] uppercase shadow-2xl">
                            RARE
                          </div>
                        )}
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center backdrop-blur-[2px]">
                          <Button asChild className="bg-white text-black hover:bg-secondary hover:text-white rounded-full w-12 h-12 p-0 shadow-2xl transition-all duration-500 group-hover:scale-110">
                            <Link href={`/products#${product.id}`}>
                              <ShoppingBag className="w-5 h-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase tracking-[0.3em] text-secondary font-black">
                            {product.category}
                          </span>
                          <span className="text-white font-serif italic text-xl">${product.price}</span>
                        </div>
                        <h4 className="text-lg font-serif font-bold group-hover:text-secondary transition-colors duration-500 truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-auto">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={cn(
                                "w-2.5 h-2.5 transition-colors duration-500", 
                                s <= Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-white/20"
                              )} />
                            ))}
                          </div>
                          <span className="text-[8px] font-black tracking-widest text-white/40 ml-auto uppercase">{product.reviews} REVIEWS</span>
                        </div>
                        <Button asChild className="w-full mt-4 bg-white/5 hover:bg-secondary hover:text-white text-white rounded-xl py-5 h-auto text-[9px] font-black tracking-[0.2em] transition-all duration-700 border border-white/5 hover:border-secondary shadow-lg">
                          <Link href={`/products?product=${product.id}`}>ADD TO COLLECTION</Link>
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:flex justify-end gap-4 mt-12">
                <CarouselPrevious className="static translate-y-0 w-10 h-10 border-white/10 text-white bg-white/10 transition-all rounded-full" />
                <CarouselNext className="static translate-y-0 w-10 h-10 border-white/10 text-white bg-white/10 transition-all rounded-full" />
              </div>
            </Carousel>
          )}
        </div>
      </section>

         {/* Philosophy Section - New Premium Addition */}
      <section className="py-32 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
              <div className="relative aspect-4/5 overflow-hidden rounded-[4rem] shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2069&auto=format&fit=crop" 
                  alt="Philosophy" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
              <div className="absolute top-1/2 -right-12 -translate-y-1/2 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 hidden lg:block animate-float">
                <div className="space-y-4">
                  <Quote className="w-10 h-10 text-secondary opacity-30" />
                  <p className="text-lg font-serif italic text-primary max-w-[200px]">
                    "Beauty is the illumination of your soul."
                  </p>
                  <div className="h-px w-12 bg-secondary"></div>
                  <p className="text-xs font-black tracking-widest text-gray-400 uppercase">Founder, JAM</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="inline-block bg-secondary/10 px-4 py-1.5 rounded-full">
                  <span className="text-[#FA9DB7] font-black tracking-[0.3em] uppercase text-[10px]">The JAM Philosophy</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary leading-tight">
                  Where Nature <br /> Meets <span className="text-secondary italic">Luxury</span>
                </h2>
              </div>
              
              <p className="text-xl text-gray-600 font-light leading-relaxed">
                Founded on the principle that true beauty is an experience, not just a result. At JAM Beauty Lounge, we believe in a holistic approach to self-care, combining age-old wisdom with modern innovation.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-primary uppercase tracking-widest text-sm">Purity</h4>
                  </div>
                  <p className="text-sm text-gray-500 font-light">We use only the finest organic and scientifically-proven ingredients.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-primary uppercase tracking-widest text-sm">Innovation</h4>
                  </div>
                  <p className="text-sm text-gray-500 font-light">State-of-the-art treatments tailored to your unique biology.</p>
                </div>
              </div>
              
              <div className="pt-8">
                <Button variant="link" className="text-primary font-black uppercase tracking-[0.3em] text-xs p-0 group">
                  Learn Our Full Story <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured In Section - Enhanced Press Bar */}
      <section className="py-20 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-[11px] uppercase tracking-[0.6em] text-gray-400 mb-12 font-black">As Recognised By</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
            {['GQ', 'VOGUE', 'ESQUIRE', 'FORBES', 'HAPERS BAZAAR'].map((brand) => (
              <span key={brand} className="text-2xl md:text-4xl font-serif font-bold tracking-tighter text-primary cursor-default">{brand}</span>
            ))}
          </div>
        </div>
      </section>


       {/* ==================== MEMBER REWARDS SECTION ==================== */}
      <section className="py-20 px-4 bg-gray-50/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="inline-block bg-secondary/10 px-3 py-1 rounded-full">
                <span className="text-[#FA9DB7] font-bold tracking-[0.2em] uppercase text-[10px]">Exclusive Privileges</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">Member Rewards</h2>
              <Badge variant="outline" className="border-secondary/30 text-secondary mt-2">
                {totalActiveOffers} Active Offers Available
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-md text-sm font-light">
              Unlock premium benefits and exclusive savings designed for our most loyal patrons.
            </p>
          </div>
          
          {offers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-gray-400 mb-2">No Offers Available</h3>
              <p className="text-gray-400 font-light">Add active offers to Firebase to see them here</p>
              <Button 
                onClick={fetchHomeData} 
                className="mt-4 bg-secondary hover:bg-secondary/90 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-6">
                {offers.map((offer) => {
                  const discountText = formatDiscount(offer);
                  const offerBgColor = getOfferBgColor(offer.offerType);
                  
                  return (
                    <CarouselItem key={offer.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
                      <div className={cn(
                        "p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2",
                        offerBgColor
                      )}>
                        {/* Usage limit badge */}
                        {offer.usageLimit && (
                          <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full z-20">
                            {offer.usedCount}/{offer.usageLimit} USED
                          </div>
                        )}
                        
                        <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-125 group-hover:rotate-45 transition-all duration-700">
                          <Ticket className="w-32 h-32 rotate-12" />
                        </div>
                        
                        {/* Offer Image Background */}
                        {offer.imageUrl && (
                          <div className="absolute inset-0 opacity-20">
                            <img 
                              src={offer.imageUrl} 
                              alt={offer.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="relative z-10 space-y-6">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <Badge className={cn(
                              "text-[9px] font-black uppercase tracking-wider border-0",
                              getOfferBadgeColor(offer.offerType)
                            )}>
                              {offer.offerType.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div>
                            <span className="text-xs font-bold tracking-widest opacity-70 uppercase block mb-1">
                              {offer.branchNames?.length > 0 
                                ? `${offer.branchNames[0]}${offer.branchNames.length > 1 ? ` +${offer.branchNames.length - 1} more` : ''}`
                                : 'All Branches'}
                            </span>
                            <h4 className="text-4xl font-serif font-bold">{discountText}</h4>
                            <h5 className="text-xl font-semibold mt-2">{offer.title}</h5>
                          </div>
                          
                          <p className="text-sm opacity-90 line-clamp-2">
                            {offer.description}
                          </p>
                          
                          <div className="pt-4 flex items-center justify-between border-t border-white/20">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-widest opacity-60">Valid Until</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className="text-xs font-semibold">
                                  {offer.validTo.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="hidden md:flex justify-end gap-3 mt-8">
                <CarouselPrevious className="static translate-y-0 border-primary/10 hover:bg-primary hover:text-white transition-all" />
                <CarouselNext className="static translate-y-0 border-primary/10 hover:bg-primary hover:text-white transition-all" />
              </div>
            </Carousel>
          )}
        </div>
      </section>

      {/* ==================== EXCLUSIVE MEMBERSHIPS SECTION ==================== */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diamond.png')] opacity-[0.02] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="inline-block bg-secondary/10 px-3 py-1 rounded-full">
                <span className="text-[#FA9DB7] font-bold tracking-[0.2em] uppercase text-[10px]">Elite Access</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">Exclusive Memberships</h2>
              <Badge variant="outline" className="border-secondary/30 text-secondary mt-2">
                {totalActiveMemberships} Premium Plans Available
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-md text-sm font-light">
              Join our elite community and unlock unprecedented benefits, priority access, and exclusive privileges.
            </p>
          </div>
          
          {memberships.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-gray-400 mb-2">No Memberships Available</h3>
              <p className="text-gray-400 font-light">Add membership plans to Firebase to see them here</p>
              <Button 
                onClick={fetchHomeData} 
                className="mt-4 bg-secondary hover:bg-secondary/90 text-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-6">
                {memberships.map((membership) => {
                  const TierIcon = getMembershipTierIcon(membership.tier);
                  const membershipBgColor = getMembershipTierColor(membership.tier);
                  const durationText = formatDuration(membership.duration);
                  const branchName = getFirstBranchName(membership);
                  const branchCountText = getBranchCountText(membership);
                  
                  return (
                    <CarouselItem key={membership.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
                      <div className={cn(
                        "p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2",
                        membershipBgColor
                      )}>
                        {/* Popular badge */}
                        {membership.totalSubscriptions > 10 && (
                          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full z-20">
                            POPULAR
                          </div>
                        )}
                        
                        <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-125 group-hover:rotate-45 transition-all duration-700">
                          <Crown className="w-32 h-32 rotate-12" />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                              <TierIcon className="w-5 h-5 text-white" />
                            </div>
                            <Badge className={cn(
                              "text-[9px] font-black uppercase tracking-wider border-0",
                              membership.tier === 'exclusive' 
                                ? 'bg-linear-to-r from-yellow-400 to-orange-400 text-black'
                                : 'bg-white/20 text-white'
                            )}>
                              {membership.tier.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div>
                            <span className="text-xs font-bold tracking-widest opacity-70 uppercase block mb-1">
                              {durationText} • {branchName}
                            </span>
                            <h4 className="text-4xl font-serif font-bold">${membership.price}</h4>
                            <h5 className="text-xl font-semibold mt-2">{membership.name}</h5>
                          </div>
                          
                          <p className="text-sm opacity-90 line-clamp-2">
                            {membership.description}
                          </p>
                          
                          {/* Benefits List */}
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase tracking-widest opacity-60 block">Key Benefits</span>
                            <div className="space-y-1.5">
                              {membership.benefits.slice(0, 3).map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Check className="w-3 h-3 text-green-300" />
                                  <span className="text-xs opacity-90">{benefit}</span>
                                </div>
                              ))}
                              {membership.benefits.length > 3 && (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                                  </div>
                                  <span className="text-xs opacity-70">
                                    +{membership.benefits.length - 3} more benefits
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="pt-4 flex items-center justify-between border-t border-white/20">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-widest opacity-60">Available At</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs font-semibold">
                                  {branchCountText}
                                </span>
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="hidden md:flex justify-end gap-3 mt-8">
                <CarouselPrevious className="static translate-y-0 border-primary/10 hover:bg-primary hover:text-white transition-all" />
                <CarouselNext className="static translate-y-0 border-primary/10 hover:bg-primary hover:text-white transition-all" />
              </div>
            </Carousel>
          )}
        </div>
      </section>

      {/* Staff Slider Section - Artisans Enhancement */}
      <section className="py-32 px-4 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 skew-x-12 translate-x-1/2 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="space-y-4">
              <div className="inline-block bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">The Collective</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary tracking-tight">Master Artisans</h2>
              <p className="text-muted-foreground max-w-xl font-light text-lg">Curating beauty through precision, technique, and a touch of JAM magic.</p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-full border border-gray-100">
                 <div className="flex -space-x-4">
                   {staff.slice(0, 4).map((s, i) => (
                     <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden">
                       <img src={s.image} className="w-full h-full object-cover" alt="" />
                     </div>
                   ))}
                 </div>
                 <div className="px-4">
                   <p className="text-[10px] font-black tracking-widest text-primary uppercase">{staff.length} ELITE MASTERS</p>
                   <div className="flex items-center gap-1">
                     <Star className="w-3 h-3 fill-secondary text-secondary" />
                     <span className="text-[10px] font-bold text-primary font-serif italic">4.9/5 Average Rating</span>
                   </div>
                 </div>
              </div>
              <Button asChild className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-full px-8 py-6 text-[10px] tracking-[0.3em] uppercase shadow-xl hover:scale-105 transition-all duration-500">
                <Link href="/customer/portal/staff">
                  View All Staff
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-[4rem] border border-dashed border-gray-200">
              <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-3xl font-serif font-bold text-gray-400 mb-2">Artisans Off-Duty</h3>
              <p className="text-gray-400 font-light">Our masters are currently preparing for the next season.</p>
            </div>
          ) : (
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-6">
                {staff.map((member) => (
                  <CarouselItem key={member.id} className="pl-6 md:basis-1/2 lg:basis-1/4 xl:basis-1/5">
                    <div className="group relative">
                      <div className="relative aspect-4/5 overflow-hidden rounded-4xl shadow-xl transition-all duration-1000 group-hover:rounded-2xl">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-primary/95 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-10">
                          <div className="space-y-6 translate-y-10 group-hover:translate-y-0 transition-transform duration-700">
                            <div className="flex gap-3">
                              <a href="#" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-secondary hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                              </a>
                              <a href="#" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-secondary hover:text-white transition-all">
                                <Phone className="w-5 h-5" />
                              </a>
                            </div>
                            <Button asChild className="w-full bg-white text-black hover:bg-secondary hover:text-white rounded-2xl py-7 font-black text-[10px] tracking-[0.3em] shadow-2xl transition-all duration-500">
                              <Link href={`/staff/${member.id}`}>VIEW PORTFOLIO</Link>
                            </Button>
                          </div>
                        </div>
                        <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                           <span className="text-[10px] text-white font-black tracking-widest">{member.reviews} REVIEWS</span>
                        </div>
                      </div>
                      <div className="mt-8 text-center px-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{member.role}</span>
                        <h3 className="text-3xl font-serif font-bold text-primary mt-3 group-hover:text-secondary transition-colors duration-500">{member.name}</h3>
                        <div className="flex items-center justify-center gap-2 mt-4">
                           <div className="flex gap-0.5">
                             {[1,2,3,4,5].map(s => (
                               <Star key={s} className={cn(
                                 "w-2.5 h-2.5",
                                 s <= Math.floor(member.rating) ? "fill-secondary text-secondary" : "text-gray-300"
                               )} />
                             ))}
                           </div>
                           <span className="text-[10px] font-black text-primary/40 tracking-widest uppercase">{member.rating.toFixed(1)} RATING</span>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-8 mt-20">
                <CarouselPrevious className="static translate-y-0 w-16 h-16 border-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-xl rounded-full" />
                <CarouselNext className="static translate-y-0 w-16 h-16 border-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-xl rounded-full" />
              </div>
            </Carousel>
          )}
        </div>
      </section>

    {/* Flagships Section - Enhanced */}
      <section className="py-40 px-4 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
            <div className="space-y-6">
              <div className="inline-block bg-secondary/10 px-4 py-1.5 rounded-full">
                <span className="text-secondary font-black tracking-[0.4em] uppercase text-[10px]">Global Flagships</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-serif font-bold text-primary leading-tight tracking-tighter">
                The Lounge <br /><span className="text-secondary italic">Experience.</span>
              </h2>
            </div>
            <div className="lg:max-w-md space-y-8">
              <p className="text-muted-foreground text-xl font-light leading-relaxed">
                With {branches.length} curated destinations globally, we redefine the sanctuary of beauty. Find your local JAM haven.
              </p>
              <Button size="lg" asChild className="bg-primary hover:bg-secondary text-white rounded-full px-12 py-8 font-black tracking-[0.3em] text-[10px] shadow-2xl transition-all duration-700 hover:scale-105">
                <Link href="/branches" className="flex items-center gap-3">
                  EXPLORE ALL {branches.length} LOCATIONS <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {branches.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[4rem] border border-dashed border-gray-200 shadow-sm">
              <Building className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-3xl font-serif font-bold text-gray-400 mb-2">Opening Soon</h3>
              <p className="text-gray-400 font-light">New flagships are currently being designed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
              {branches.map((branch) => (
                <div key={branch.id} className="group cursor-pointer bg-white p-10 rounded-[3rem] border border-transparent hover:border-secondary/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-[4rem] group-hover:w-full group-hover:h-full group-hover:rounded-none transition-all duration-700"></div>
                  <div className="relative z-10 space-y-8">
                    <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-secondary group-hover:bg-white group-hover:scale-110 transition-all duration-700 shadow-sm">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-2xl text-primary group-hover:text-primary transition-colors">
                          {branch.name}
                        </h4>
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          branch.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'
                        )}></div>
                      </div>
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">
                        {branch.address}, {branch.city}
                      </p>
                    </div>
                    <div className="pt-8 border-t border-gray-100 space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-primary/60 uppercase">
                        <Clock className="w-3.5 h-3.5" />
                        {branch.openingTime} - {branch.closingTime}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-primary/60 uppercase">
                        <Phone className="w-3.5 h-3.5" />
                        {branch.phone}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

       {/* Newsletter Section - Premium */}
      <section className="py-40 px-4 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm scale-110"></div>
        <div className="absolute inset-0 bg-primary/90"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block bg-white/5 backdrop-blur-md px-6 py-2 rounded-full mb-10 border border-white/10">
            <span className="text-white font-black tracking-[0.5em] uppercase text-[10px]">Lifestyle Newsletter</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-10 leading-[0.9] tracking-tighter">
            The <span className="text-gray-400 italic">Inner</span> Circle
          </h2>
          <p className="text-xl text-white/70 mb-20 font-light max-w-2xl mx-auto leading-relaxed italic">
            "Beauty is an experience, not just a service." Join 5,000+ members receiving curated aesthetics weekly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 max-w-3xl mx-auto bg-white/5 p-4 rounded-[3.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10">
            <input 
              placeholder="Your email for the invitation" 
              className="h-20 bg-transparent text-white rounded-full px-10 focus:outline-none transition-all w-full font-light text-xl placeholder:text-white/40"
            />
            <Button size="lg" className="h-20 bg-white/60 text-white hover:bg-white hover:text-black hover:scale-105 transition-all duration-500 font-black px-16 rounded-[2.5rem] shrink-0 tracking-[0.3em] text-[10px]">
              SUBSCRIBE
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-48 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop" 
            className="w-full h-full object-cover scale-110 opacity-30 blur-[2px]"
            alt="Background"
          />
          <div className="absolute inset-0 bg-linear-to-b from-white via-white/80 to-white"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-16">
          <div className="space-y-6">
            <h2 className="text-6xl md:text-9xl font-serif font-bold text-primary leading-[0.85] tracking-tighter">
              Redefine <br />
              <span className="text-gray-400 italic">Your Style.</span>
            </h2>
            <p className="text-xl md:text-3xl text-primary/60 max-w-4xl mx-auto font-light leading-relaxed">
              Step into the world of JAM. Where every visit is a transformation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
            <Button size="lg" asChild className="bg-primary hover:bg-secondary text-white font-black px-16 py-12 text-xs rounded-4xl shadow-[0_30px_60px_-15px_rgba(168,21,86,0.5)] transition-all duration-700 hover:scale-110 tracking-[0.4em] ring-offset-2 ring-primary/20 hover:ring-8">
              <Link href="/services">BOOK NOW</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary/20 text-primary hover:bg-primary hover:text-white px-16 py-12 text-xs rounded-4xl backdrop-blur-md transition-all duration-700 hover:scale-110 tracking-[0.4em] bg-white/50">
              <Link href="/login">BECOME A MEMBER</Link>
            </Button>
          </div>
        </div>
      </section>

    <Footer/>
    </div>

  );
}