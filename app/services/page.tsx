
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Scissors, Star, Clock, Search, Filter, Check, ShoppingCart, ChevronRight, Sparkles, Plus, X, Calendar, Users, MapPin, Award, Info, DollarSign, TrendingUp, Package, Shield, MessageCircle, Phone, Mail, Navigation, Share2, Loader2, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
  where,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

// Types Definition
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
  createdAt: any;
  updatedAt: any;
}

interface StaffMember {
  id: string;
  name: string;
  image: string;
  position?: string;
  // Store original fields for debugging
  avatar?: string;
  role?: string;
}

interface CartItem {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  branchNames?: string[];
  reviews: number;
}

// Stores Definition with Real-time Updates
interface ServicesStore {
  services: Service[];
  error: string | null;
  hasFetchedInitialData: boolean;
  fetchServices: () => Promise<void>;
  fetchServiceById: (id: string) => Promise<Service | null>;
  setupRealtimeUpdates: () => () => void;
}

const useServicesStore = create<ServicesStore>((set, get) => ({
  services: [],
  error: null,
  hasFetchedInitialData: false,

  fetchServices: async () => {
    if (get().hasFetchedInitialData) return;
    
    set({ error: null });
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('name', 'asc'));
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
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      
      set({ 
        services: servicesData, 
        hasFetchedInitialData: true 
      });
    } catch (error) {
      console.error('Error fetching services:', error);
      set({ 
        error: 'Failed to fetch services. Please try again later.' 
      });
    }
  },

  fetchServiceById: async (id: string): Promise<Service | null> => {
    try {
      const serviceRef = doc(db, 'services', id);
      const serviceSnap = await getDoc(serviceRef);
      
      if (serviceSnap.exists()) {
        const data = serviceSnap.data();
        return {
          id: serviceSnap.id,
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
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching service:', error);
      return null;
    }
  },

  setupRealtimeUpdates: () => {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('name', 'asc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        
        set({ 
          services: servicesData, 
          hasFetchedInitialData: true 
        });
      }, (error) => {
        console.error('Error in real-time update:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time updates:', error);
      return () => {};
    }
  },
}));

interface StaffStore {
  staff: StaffMember[];
  fetchStaff: () => Promise<void>;
}

const useStaffStore = create<StaffStore>((set) => ({
  staff: [],

  fetchStaff: async () => {
    try {
      const staffRef = collection(db, 'staff');
      const querySnapshot = await getDocs(staffRef);
      
      const staffData: StaffMember[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        
        // 🔥 FIXED: Proper image fetching from Firebase
        // Firebase mein field name "avatar" hai
        let imageUrl = '/default-avatar.png'; // Default fallback
        
        // Check karo ke konsa field available hai
        if (data.avatar) {
          imageUrl = data.avatar;
          console.log(`✅ Staff AED{data.name} using avatar:`, data.avatar);
        } else if (data.imageUrl) {
          imageUrl = data.imageUrl;
        } else if (data.image) {
          imageUrl = data.image;
        } else if (data.photoURL) {
          imageUrl = data.photoURL;
        }
        
        staffData.push({
          id: doc.id,
          name: data.name || data.fullName || 'Unknown Staff',
          image: imageUrl, // ✅ Proper image URL
          position: data.position || data.role || 'Barber',
          // Store original fields for debugging
          avatar: data.avatar,
          role: data.role,
        });
      });
      
      console.log('✅ Staff fetched with images:', staffData.map(s => ({
        name: s.name,
        image: s.image
      })));
      
      set({ staff: staffData });
    } catch (error) {
      console.error('Error fetching staff:', error);
      set({ staff: [] });
    }
  },
}));

// Updated Booking Store with Cart Management
interface BookingStore {
  cartItems: CartItem[];
  addedServices: Set<string>; // Track which services have been added
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  markServiceAdded: (serviceId: string) => void;
  markServiceRemoved: (serviceId: string) => void;
  isServiceInCart: (serviceId: string) => boolean;
}

const useBookingStore = create<BookingStore>((set, get) => ({
  cartItems: [],
  addedServices: new Set(),
  
  addToCart: (item: CartItem) => set((state) => ({ 
    cartItems: [...state.cartItems, item],
    addedServices: new Set(state.addedServices).add(item.id)
  })),
  
  removeFromCart: (id: string) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.id !== id),
    addedServices: new Set([...state.addedServices].filter(serviceId => serviceId !== id))
  })),
  
  clearCart: () => set({ cartItems: [], addedServices: new Set() }),
  
  markServiceAdded: (serviceId: string) => set((state) => ({
    addedServices: new Set(state.addedServices).add(serviceId)
  })),
  
  markServiceRemoved: (serviceId: string) => set((state) => ({
    addedServices: new Set([...state.addedServices].filter(id => id !== serviceId))
  })),
  
  isServiceInCart: (serviceId: string) => get().addedServices.has(serviceId)
}));

// WhatsApp contact function
const openWhatsApp = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/?text=AED{encodedMessage}`, '_blank');
};

// Main Component
export default function ServicesPage() {
  const router = useRouter();
  const { 
    addToCart, 
    cartItems, 
    markServiceAdded, 
    markServiceRemoved,
    isServiceInCart,
    clearCart 
  } = useBookingStore();
  const { 
    services, 
    fetchServices, 
    fetchServiceById, 
    hasFetchedInitialData,
    setupRealtimeUpdates 
  } = useServicesStore();
  const { staff, fetchStaff } = useStaffStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedService, setAddedService] = useState<string | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState<boolean>(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [showMultiSelectSheet, setShowMultiSelectSheet] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  
  // New state for service details sidebar
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceSidebarOpen, setIsServiceSidebarOpen] = useState<boolean>(false);
  
  // Use ref to track if we've already set up real-time updates
  const hasSetupRealtimeRef = useRef<boolean>(false);

  // ===== CHAT LOGIC (Copied from Home Page) =====
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
  // =============================================

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!hasFetchedInitialData) {
        await fetchServices();
        await fetchStaff();
      }
    };
    
    loadData();
  }, [fetchServices, fetchStaff, hasFetchedInitialData]);

  // Set up real-time updates
  useEffect(() => {
    if (!hasSetupRealtimeRef.current && hasFetchedInitialData) {
      const cleanup = setupRealtimeUpdates();
      hasSetupRealtimeRef.current = true;
      
      return cleanup;
    }
  }, [hasFetchedInitialData, setupRealtimeUpdates]);

  // Get unique categories from services
  const categories = [
    { id: 'all', name: 'All Services' },
    ...Array.from(new Set(services.map(s => s.category)))
      .filter((category): category is string => Boolean(category && category.trim() !== ''))
      .map(category => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category
      }))
  ];

  // Filter services based on selected filters
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || 
      service.category?.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    
    const matchesSearch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStaff = selectedStaff === 'all';
    
    return matchesCategory && matchesSearch && matchesStaff;
  });

  // Handle add to cart WITHOUT Firebase authentication check
  const handleAddToCart = (service: Service) => {
    // DIRECTLY add to cart without login check
    setIsAddingToCart(service.id);

    // Create cart item with ALL required data + BRANCHNAMES
    const cartItem: CartItem = {
      id: service.id,
      name: service.name,
      category: service.category || 'Service',
      duration: service.duration.toString() || '0',
      price: service.price || 0,
      description: service.description || '',
      image: service.imageUrl || 'https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop',
      rating: 5,
      reviews: 0,
      branchNames: service.branchNames || []  // ✅ YEH ADD KIYA!
    };

    // Update local cart store
    addToCart(cartItem);
    markServiceAdded(service.id);
    
    // ALSO save to localStorage with branchNames
    const currentCart = JSON.parse(localStorage.getItem('bookingCart') || '[]');
    const updatedCart = [...currentCart, cartItem];
    localStorage.setItem('bookingCart', JSON.stringify(updatedCart));
    
    setAddedService(service.id);
    
    setTimeout(() => {
      setAddedService(null);
      setIsAddingToCart(null);
    }, 2000);
  };

  // Handle View Cart button click - NO LOGIN CHECK
  const handleViewCart = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add services first.');
      return;
    }
    // Direct redirect to booking page without login check
    router.push('/booking');
  };

 // Handle add selected services to cart - NO LOGIN CHECK
const handleAddSelectedServices = () => {
  const addPromises = Array.from(selectedServices).map((serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    // Update local cart store - WITH BRANCHNAMES
    const cartItem: CartItem = {
      id: service.id,
      name: service.name,
      category: service.category || 'Service',
      duration: service.duration.toString() || '0',
      price: service.price || 0,
      description: service.description || '',
      image: service.imageUrl || 'https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop',
      rating: 5,
      reviews: 0,
      branchNames: service.branchNames || []  // ✅ YEH ADD KIYA!
    };
    addToCart(cartItem);
    markServiceAdded(service.id);
  });

  setSelectedServices(new Set());
  setShowMultiSelectSheet(false);
  setMultiSelectMode(false);
  
  alert(`AED{selectedServices.size} services added to your booking!`);
};

  // Toggle service selection for multi-select
  const toggleServiceSelection = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  // Handle view service details
  const handleViewServiceDetails = async (serviceId: string) => {
    try {
      const service = await fetchServiceById(serviceId);
      if (service) {
        setSelectedService(service);
        setIsServiceSidebarOpen(true);
      }
    } catch (error) {
      console.error('Error loading service details:', error);
    }
  };

  // Handle share service
  const handleShareService = (service: Service) => {
    const shareText = `Check out AED{service.name} - AED{service.description}. Price: AEDAED{service.price}. Duration: AED{service.duration} minutes.`;
    
    if (navigator.share) {
      navigator.share({
        title: `AED{service.name} - Premium Grooming`,
        text: shareText,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(`AED{service.name}\nAED{shareText}\nAED{window.location.href}`).then(() => {
        alert('Service details copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />

      {/* ==================== 3 BUTTONS - EXACT COPY FROM HOME PAGE ==================== */}
      {/* Fixed bottom right buttons - WhatsApp, Call, Chatbot */}
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

        {/* Chatbot Button with Login Logic */}
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

{/* Premium Hero Section with Video Background */}
<section className="relative py-32 px-4 overflow-hidden h-[500px] md:h-[600px]">
  {/* Video Background */}
  <div className="absolute inset-0 w-full h-full">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src="https://www.pexels.com/download/video/7291771/" type="video/mp4" />
      {/* Fallback for browsers that don't support video */}
      Your browser does not support the video tag.
    </video>
    
    {/* Light Overlay - text readable with visible video */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-primary/70"></div>
  </div>

  {/* Content Overlay - REMOVED the extra black layer */}
  {/* <div className="absolute inset-0 bg-black/30"></div> */} {/* YEH LINE HATAA DI */}

  <div className="max-w-7xl mx-auto text-center relative z-10 h-full flex flex-col justify-center items-center">
    <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full mb-2 mt-8 border border-white/10">
      <span className="text-white font-black tracking-[0.5em] uppercase text-[10px]">The Service Menu</span>
    </div>
    
    {/* Updated Heading with your requested spacing */}
    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-2 leading-[0.85] tracking-tighter">
      <div className="mb-8">Signature</div>
      <span className="text-[#FA9DB7] italic">Rituals</span>
    </h1>
    
    <p className="text-[#FA9DB7] max-w-2xl mx-auto text-lg font-light leading-relaxed italic mb-8">
      "Artistry is not just a service, it's a transformation."
    </p>
    <div className="flex items-center justify-center gap-6 flex-wrap">
      <div className="h-px w-12 bg-white/20 hidden md:block"></div>
      <span className="text-white/50 font-black tracking-[0.3em] text-[10px] uppercase">
        {services.length} MASTER SERVICES
      </span>
    </div>
  </div>
</section>
     
      {/* Filters Section */}
      <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search and Multi-select Row */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
              <Input 
                placeholder="Search services by name or description..." 
                className="pl-11 rounded-2xl border-gray-200 bg-white/80 text-sm h-12 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Cart Button */}
            {cartItems.length > 0 && (
              <Button 
                onClick={handleViewCart}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-primary font-bold px-6 py-2.5 rounded-2xl h-12 shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                VIEW CART ({cartItems.length})
              </Button>
            )}

            {/* Multi-select Button */}
            <div className="flex items-center gap-3">
              <Sheet open={showMultiSelectSheet} onOpenChange={setShowMultiSelectSheet}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline"
                    className={cn(
                      "rounded-2xl border-2 font-black tracking-widest text-[10px] uppercase px-6 py-2.5 transition-all gap-2 h-12",
                      selectedServices.size > 0
                        ? "bg-secondary border-secondary text-primary hover:bg-secondary/90 shadow-lg"
                        : "border-secondary text-secondary hover:bg-secondary/10 hover:shadow-md"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    MULTI-SELECT
                    {selectedServices.size > 0 && (
                      <Badge className="bg-primary text-white border-none ml-1 min-w-6 h-6 flex items-center justify-center">
                        {selectedServices.size}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                
                {/* Multi-select Sheet */}
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
                  <SheetHeader className="border-b p-6">
                    <SheetTitle className="text-2xl font-serif font-bold text-primary">
                      Select Multiple Services
                    </SheetTitle>
                    <SheetDescription className="text-gray-600">
                      Choose multiple services to add to your booking at once
                    </SheetDescription>
                  </SheetHeader>

                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No services found. Try adjusting your filters.</p>
                      </div>
                    ) : (
                      filteredServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => toggleServiceSelection(service.id)}
                          className={cn(
                            "p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md",
                            selectedServices.has(service.id)
                              ? "border-secondary bg-secondary/10 shadow-sm"
                              : "border-gray-100 bg-white hover:border-gray-200"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <div className={cn(
                              "w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all mt-1",
                              selectedServices.has(service.id)
                                ? "bg-secondary border-secondary"
                                : "border-gray-300"
                            )}>
                              {selectedServices.has(service.id) && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                            
                            {/* Service Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <h3 className="font-bold text-primary text-lg">{service.name}</h3>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-secondary" />
                                    <span className="text-xs font-bold text-secondary">{service.duration}m</span>
                                  </div>
                                  <span className="font-bold text-primary text-lg">AED{service.price}</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{service.description}</p>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {service.category}
                                </Badge>
                                <Badge className={cn(
                                  "text-xs",
                                  service.popularity === 'high' ? 'bg-red-100 text-red-800' :
                                  service.popularity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                )}>
                                  {service.popularity}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  service.status === 'active' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                                )}>
                                  {service.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Selected Services Actions */}
                  {selectedServices.size > 0 && (
                    <div className="sticky bottom-0 bg-white border-t p-6 space-y-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-700">Selected Services:</span>
                          <span className="text-lg font-bold text-secondary ml-2">
                            {selectedServices.size} service{selectedServices.size !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <Button 
                          variant="ghost"
                          onClick={() => setSelectedServices(new Set())}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          type="button"
                        >
                          Clear All
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={handleAddSelectedServices}
                        className="w-full bg-secondary hover:bg-secondary/90 text-primary font-bold py-6 rounded-2xl tracking-[0.2em] text-sm shadow-lg"
                        type="button"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        ADD {selectedServices.size} SELECTED SERVICE{selectedServices.size !== 1 ? 'S' : ''} TO BOOKING
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "whitespace-nowrap px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border rounded-2xl min-w-[120px] text-center",
                    selectedCategory === cat.id 
                      ? "bg-primary text-white border-primary shadow-xl scale-[1.02]" 
                      : "bg-white text-black border-gray-200 hover:border-secondary hover:text-secondary hover:shadow-md"
                  )}
                  type="button"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Filter Section */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-3 border-t border-gray-100">
            <div className="flex items-center gap-2 shrink-0">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Available Staff:</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedStaff('all')}
                className={cn(
                  "whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border flex items-center gap-2",
                  selectedStaff === 'all' 
                    ? "bg-secondary/20 text-[#FA9DB7] border-secondary/40 shadow-sm" 
                    : "bg-gray-50 text-[#FA9DB7] border-gray-200 hover:border-gray-300"
                )}
                type="button"
              >
                <div className="w-6 h-6 rounded-full bg-[#FA9DB7] flex items-center justify-center text-white text-xs font-bold">
                  All
                </div>
                All Barbers
              </button>
              
              {staff.map((member) => {
                // Debug log for each staff member
                console.log(`Rendering staff AED{member.name} with image:`, member.image);
                
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedStaff(member.id)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 border min-w-[140px]",
                      selectedStaff === member.id 
                        ? "bg-secondary/10 text-secondary border-secondary/30 shadow-sm" 
                        : "bg-white text-black border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                    type="button"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm shrink-0">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          console.log(`Image failed to load for AED{member.name}:`, member.image);
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                        onLoad={() => {
                          console.log(`Image loaded successfully for AED{member.name}`);
                        }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-[#FA9DB7] truncate">{member.name}</div>
                      <div className="text-[9px] text-[#FA9DB7] truncate">{member.position || 'Barber'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-20 px-4 bg-linear-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Services Count and Stats */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary">
                Premium Services
                <span className="text-[#FA9DB7] ml-2">({filteredServices.length})</span>
              </h2>
             
            </div>
            <div className="flex items-center gap-4">
              {cartItems.length > 0 && (
                <Button 
                  onClick={handleViewCart}
                  className="bg-secondary hover:bg-secondary/90 text-primary font-bold"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Cart ({cartItems.length})
                </Button>
              )}
              <Badge variant="outline" className="text-gray-600">
                Total: {services.length} services
              </Badge>
             
            </div>
          </div>

          {/* Services Grid */}
          {services.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scissors className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-primary mb-3">No Services Available</h3>
              
              <Button 
                onClick={fetchServices}
                className="rounded-full px-8 bg-primary hover:bg-primary/90 font-bold tracking-widest text-[10px]"
                type="button"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                REFRESH SERVICES
              </Button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-primary mb-3">No Matching Services</h3>
              <p className="text-gray-500 font-light mb-8 max-w-md mx-auto">
                No services match your current filters. Try adjusting your search criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {setSelectedCategory('all'); setSearchQuery(''); setSelectedStaff('all');}}
                className="rounded-full px-8 border-secondary text-secondary hover:bg-secondary hover:text-primary font-bold tracking-widest text-[10px]"
                type="button"
              >
                <Filter className="w-4 h-4 mr-2" />
                CLEAR ALL FILTERS
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredServices.map((service) => {
                const isServiceAdded = isServiceInCart(service.id);
                
                return (
                  <Card 
                    key={service.id} 
                    className="group border-2 border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col hover:border-secondary/20"
                  >
                    {/* Service Image with Overlay */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img 
                        src={service.imageUrl} 
                        alt={service.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop';
                        }}
                      />
                      
                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Price Badge */}
                      <div className="absolute top-5 right-5">
                        <div className="bg-white/95 backdrop-blur-sm text-black border-none px-4 py-2.5 rounded-2xl font-black text-sm shadow-2xl">
                          AED{service.price}
                        </div>
                      </div>
                      
                      {/* Popularity Badge */}
                      <div className="absolute bottom-5 left-5 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <Badge className={cn(
                          "border-none px-3 py-1.5 font-black text-[9px] tracking-widest uppercase shadow-lg",
                          service.popularity === 'high' ? 'bg-red-500 text-white' :
                          service.popularity === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-secondary text-white'
                        )}>
                          {service.popularity === 'high' ? '🔥 HOT' :
                          service.popularity === 'medium' ? '⭐ POPULAR' :
                          '✨ STANDARD'}
                        </Badge>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="absolute top-5 left-5">
                        <div className={cn(
                          "w-3 h-3 rounded-full border-2 border-white shadow-lg",
                          service.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        )}></div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <CardHeader className="pt-7 pb-4 px-7">
                      <div className="flex justify-between items-center mb-3">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em] text-secondary border-secondary/30">
                          {service.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">
                            {service.duration} MIN
                          </span>
                        </div>
                      </div>
                      
                      <CardTitle className="text-2xl font-serif font-bold text-primary group-hover:text-secondary transition-colors duration-300 leading-tight">
                        {service.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-7 pb-7 flex-1 flex flex-col">
                      {/* Description */}
                      <p className="text-gray-600 text-sm font-light leading-relaxed line-clamp-3 mb-6 flex-1">
                        {service.description}
                      </p>

                      {/* Service Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold">5.0</span>
                            <span className="text-gray-400">({service.totalBookings})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold">Revenue:</span>
                            <span>AED{service.revenue}</span>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold",
                          service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}>
                          {service.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Branches Info (if available) */}
                      {service.branchNames && service.branchNames.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs text-gray-500 mb-2 font-medium">Available at:</p>
                          <div className="flex flex-wrap gap-2">
                            {service.branchNames.slice(0, 2).map((branch, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-[10px] px-2 py-1 border-gray-200 text-gray-600"
                              >
                                {branch}
                              </Badge>
                            ))}
                            {service.branchNames.length > 2 && (
                              <Badge variant="outline" className="text-[10px] px-2 py-1 border-gray-200 text-gray-600">
                                +{service.branchNames.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-auto flex gap-3">
                        {isServiceAdded ? (
                          <Button 
                            onClick={handleViewCart}
                            className="flex-1 h-14 rounded-2xl font-black tracking-[0.2em] text-[10px] transition-all duration-500 shadow-lg bg-secondary hover:bg-secondary/90 text-primary"
                            type="button"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" /> 
                            VIEW CART
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleAddToCart(service)}
                            disabled={isAddingToCart === service.id}
                            className={cn(
                              "flex-1 h-14 rounded-2xl font-black tracking-[0.2em] text-[10px] transition-all duration-500 shadow-lg group/btn",
                              addedService === service.id 
                                ? "bg-green-600 hover:bg-green-600 text-white scale-95" 
                                : isAddingToCart === service.id
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-primary hover:bg-secondary hover:text-primary text-white"
                            )}
                            type="button"
                          >
                            {addedService === service.id ? (
                              <>
                                <Check className="w-4 h-4 mr-2" /> 
                                ADDED TO BOOKING
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" /> 
                                ADD TO BOOKING
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewServiceDetails(service.id)}
                          className="w-14 h-14 rounded-2xl border-gray-200 text-primary hover:border-secondary hover:text-secondary hover:bg-secondary/10 transition-all duration-500 shadow-sm"
                          type="button"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Footer Stats */}
          {filteredServices.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-[#FA9DB7]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#FA9DB7]">Total Services</p>
                      <p className="text-2xl font-bold text-primary">{services.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Filter className="w-6 h-6 text-[#FA9DB7]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#FA9DB7]">Filtered Services</p>
                      <p className="text-2xl font-bold text-primary">{filteredServices.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Check className="w-6 h-6 text-[#FA9DB7]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#FA9DB7]">Active Services</p>
                      <p className="text-2xl font-bold text-primary">
                        {services.filter(s => s.status === 'active').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="mt-6 bg-secondary/10 border border-secondary/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-bold text-primary">Your Booking Cart</p>
                        <p className="text-sm text-gray-600">
                          {cartItems.length} service{cartItems.length !== 1 ? 's' : ''} selected • 
                          Total: AED{cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={clearCart}
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Clear Cart
                      </Button>
                      <Button 
                        onClick={handleViewCart}
                        className="bg-secondary hover:bg-secondary/90 text-primary font-bold"
                      >
                        Proceed to Booking
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Service Details Sidebar */}
      <Sheet open={isServiceSidebarOpen} onOpenChange={setIsServiceSidebarOpen}>
        <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto p-5 rounded-3xl h-[750px] m-auto">
          {selectedService ? (
            <>
              <SheetHeader className="sr-only">
                <SheetTitle>Service Details - {selectedService.name}</SheetTitle>
                <SheetDescription>
                  Detailed information about {selectedService.name} service
                </SheetDescription>
              </SheetHeader>
              
              <div className="h-full">
                {/* Header with Image */}
                <div className="relative h-64">
                  <img 
                    src={selectedService.imageUrl} 
                    alt={selectedService.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                    onClick={() => setIsServiceSidebarOpen(false)}
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">
                      {selectedService.name}
                    </h2>
                    <div className="flex items-center gap-2 text-white/90">
                      <Scissors className="w-4 h-4" />
                      <span>{selectedService.category}</span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary">AED{selectedService.price}</div>
                      <div className="text-xs text-gray-600">Price</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{selectedService.duration}m</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{selectedService.totalBookings}</div>
                      <div className="text-xs text-gray-600">Bookings</div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="bookings">Quick Action</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg mb-2">About This Service</h3>
                        <p className="text-gray-600">
                          {selectedService.description}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-lg mb-2">Service Information</h3>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-secondary" />
                              <span className="font-medium">Duration</span>
                            </div>
                            <span className="font-bold">{selectedService.duration} minutes</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-secondary" />
                              <span className="font-medium">Popularity</span>
                            </div>
                            <Badge className={cn(
                              "font-bold",
                              selectedService.popularity === 'high' ? 'bg-red-100 text-red-800' :
                              selectedService.popularity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            )}>
                              {selectedService.popularity.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-secondary" />
                              <span className="font-medium">Status</span>
                            </div>
                            <Badge className={cn(
                              "font-bold",
                              selectedService.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            )}>
                              {selectedService.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {selectedService.branchNames && selectedService.branchNames.length > 0 && (
                        <div>
                          <h3 className="font-bold text-lg mb-2">Available Branches</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedService.branchNames.map((branch, i) => (
                              <div key={i} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                <MapPin className="w-4 h-4 text-secondary" />
                                <span className="text-sm">{branch}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-lg mb-2">Financial Information</h3>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-secondary" />
                                <span className="font-medium">Service Price</span>
                              </div>
                              <span className="font-bold text-green-600">AED{selectedService.price}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-secondary" />
                                <span className="font-medium">Total Revenue</span>
                              </div>
                              <span className="font-bold text-blue-600">AED{selectedService.revenue}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-lg mb-2">Service ID & Timestamps</h3>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Service ID:</span>
                              <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                {selectedService.id}
                              </code>
                            </div>
                            {selectedService.categoryId && (
                              <div className="text-sm">
                                <span className="font-medium">Category ID:</span>
                                <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                  {selectedService.categoryId}
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="bookings" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {isServiceInCart(selectedService.id) ? (
                              <Button 
                                variant="outline" 
                                className="flex items-center gap-2"
                                onClick={handleViewCart}
                                type="button"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                View Cart
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                className="flex items-center gap-2"
                                onClick={() => handleAddToCart(selectedService)}
                                type="button"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Booking
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => openWhatsApp(
                                `Hi, I'm interested in AED{selectedService.name} service. Can you tell me more about it?`
                              )}
                              type="button"
                            >
                              <MessageCircle className="w-4 h-4" />
                              WhatsApp
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => router.push('/booking')}
                              type="button"
                            >
                              <Calendar className="w-4 h-4" />
                              Book Now
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => handleShareService(selectedService)}
                              type="button"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Quick Actions */}
                  <div className="pt-6 border-t">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {isServiceInCart(selectedService.id) ? (
                        <Button 
                          className="flex-1 bg-secondary hover:bg-secondary/90 text-primary"
                          onClick={handleViewCart}
                          type="button"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          View Cart
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => {
                            handleAddToCart(selectedService);
                            setIsServiceSidebarOpen(false);
                          }}
                          type="button"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Booking
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/booking?service=AED{selectedService.id}`)}
                        type="button"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-600">No service details available.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Refresh Button - Below the 3 buttons (z-40) */}
      
    </div>
  );
}