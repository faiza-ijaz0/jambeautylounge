'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Sparkles, Globe, User, LogOut, 
  Menu, X, ShoppingBag, Search, 
  Calendar, MapPin, Heart, ChevronDown,
  ArrowRight, Scissors
} from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingStore } from "@/stores/booking.store";
import { type Customer } from "@/stores/customer.store";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { branches, selectedBranch, setSelectedBranch } = useBranch();
  const { language, setLanguage, t } = useLanguage();
  const { cartItems } = useBookingStore();
  
  // Determine if we're on home page
  const isHomePage = pathname === '/';
  const isInnerPage = !isHomePage;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Monitor scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Get auth from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize auth state after hydration
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role === 'customer') {
          setIsLoggedIn(true);
          setCustomer(parsed);
        }
      } catch {
        setIsLoggedIn(false);
        setCustomer(null);
      }
    }
    setIsHydrated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('customerAuth');
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    router.push('/customer/login');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Products", href: "/products" },
    { name: "Blog", href: "/blog" },
    { name: "Branches", href: "/branches" },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-primary/10 py-1 shadow-md" 
          : "bg-transparent py-4"
      )} 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top bar (for branches contact info) - Only on larger screens and when not scrolled */}
      {!isScrolled && isHomePage && (
        <div className="hidden md:block border-b border-white/10 mb-2">
          <div className="max-w-7xl mx-auto px-6 py-1.5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-medium text-white/60">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-white/60" />
                {selectedBranch?.name || "Global Experience"}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-white/60" />
                Open: 9 AM - 10 PM
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/customer/login" className=" transition-colors">Track Booking</Link>
              {/*<Link href="/gift-cards" className="hover:text-secondary transition-colors">Gift Cards</Link>*/}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-50">
          <div className={cn(
            "relative w-16 h-16 rounded-2xl transition-all duration-500 group-hover:scale-110 overflow-hidden",
            isScrolled ? "drop-shadow-sm" : "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          )}>
            <Image
              src="/logoo.jpeg"
              alt="Jam Beauty"
              fill
              className="object-contain"
              priority
            />
          </div>
         
        </Link>

        {/* Desktop Navigation */}
        <nav className={cn(
          "hidden lg:flex items-center backdrop-blur-sm rounded-full px-8 py-2.5 border gap-10 transition-all",
          isScrolled 
            ? "bg-white/5 border-primary/10" 
            : "bg-white/5 border-white/10"
        )}>
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              className={cn(
                "text-[10px] uppercase tracking-widest font-bold transition-all duration-300 relative group",
                isScrolled ? "text-primary/70 hover:text-secondary" : "text-white/80 hover:text-white"
              )}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Actions Controls */}
        <div className="flex items-center gap-4 relative z-50">
          {/* Branch Selector (Desktop) */}
          

         
<div className={cn(
            "hidden lg:flex items-center border rounded-full pl-3 transition-all",
            isScrolled 
              ? "bg-white/5 border-primary/10 hover:border-primary/30" 
              : "bg-white/5 border-white/10 hover:border-white/30"
          )}>
            <MapPin className={cn("w-3.5 h-3.5 transition-colors", isScrolled ? "text-primary/40" : "text-white/40")} />
            <Select 
              value={selectedBranch?.id || ""} 
              onValueChange={(branchId) => {
                const branch = branches.find((b: { id: string; }) => b.id === branchId);
                if (branch) setSelectedBranch(branch);
              }}
            >
              <SelectTrigger className={cn(
                "w-[150px] h-9 border-none  text-white bg-transparent text-[10px] uppercase tracking-widest font-bold focus:ring-0 transition-colors",
                isScrolled ? "text-black" : "text-white"
              )}>
                <SelectValue placeholder="SELECT BRANCH" className="text-white" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
                  <SelectItem key={branch.id} value={branch.id as string} className="text-xs">
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cart Icon */}
          <Link href="/services" className="relative group">
            <div className={cn(
              "p-2.5 rounded-full transition-all duration-300 border",
              isScrolled 
                ? "bg-primary/5 border-primary/10 text-primary hover:bg-primary hover:text-white" 
                : "bg-white/10 border-white/10 text-white hover:bg-white hover:text-primary"
            )}>
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

        

          {/* Profile Section */}
          <div className="flex items-center gap-2">
            {isHydrated && isLoggedIn && customer ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-slate/60 to-primary flex items-center justify-center text-white shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform",
                    showProfileMenu && "rotate-180",
                    isScrolled ? "text-primary" : "text-white"
                  )} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-2xl border border-primary/5 overflow-hidden min-w-60 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-4 bg-primary/5 border-b border-primary/5">
                      <p className="text-sm font-bold text-primary">{customer.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-primary/40 font-medium">{customer.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/customer/portal"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-primary/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        <User className="w-4 h-4 text-secondary" />
                        Dashboard
                      </Link>
                      <Link
                        href="/customer/portal/bookings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-primary/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        <Calendar className="w-4 h-4 text-secondary" />
                        My Bookings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link 
                  href="/customer/login" 
                  className={cn(
                    "text-[10px] uppercase tracking-widest font-bold hover:text-secondary transition-colors",
                    isScrolled ? "text-primary" : "text-white"
                  )}
                >
                  Sign In
                </Link>
                <Button asChild className="bg-white/20 hover:bg-gray-200 hover:text-primary text-[#FA9DB7] font-bold rounded-full px-7 py-5 text-[10px] tracking-[0.2em] font-black shadow-lg shadow-secondary/20 transition-all duration-300 hover:scale-105 active:scale-95 group">
                  <Link href="/services" className="flex items-center gap-2">
                    BOOK NOW
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={cn(
              "lg:hidden p-2 rounded-full transition-colors",
              isScrolled ? "text-primary bg-primary/5" : "text-white hover:bg-white/10"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-white z-60 flex flex-col p-8 transition-all animate-in slide-in-from-right duration-500">
          <div className="flex justify-between items-center mb-12">
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                <Image
                  src="/manofcave.png"
                  alt="Man of Cave"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-serif font-bold text-primary">Man OF <span className="text-secondary">CAVE</span></span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-primary/5 rounded-full text-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-6 mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/30">Menu</p>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-3xl font-serif font-bold text-primary flex items-center justify-between group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
                <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-6">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/30">Quick Actions</p>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/customer/login" 
                className="flex flex-col gap-3 p-5 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-colors group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-xs font-bold text-primary">Track Booking</span>
              </Link>
              <Link 
                href="/branches" 
                className="flex flex-col gap-3 p-5 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-colors group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-xs font-bold text-primary">Locations</span>
              </Link>
            </div>

            {!isLoggedIn && (
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white py-8 rounded-2xl text-sm font-black tracking-widest shadow-xl shadow-primary/20">
                <Link href="/customer/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In to Book
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}