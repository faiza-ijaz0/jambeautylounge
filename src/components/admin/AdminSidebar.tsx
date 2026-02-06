
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// import {
//   BarChart3,
//   Calendar,
//   Users,
//   DollarSign,
//   Settings,
//   Building,
//   Award,
//   LogOut,
//   Scissors,
//   Package,
//   Tag,
//   MessageCircle,
//   PieChart,
//   Phone,
//   FileText,
//   CreditCard,
//   ShoppingCart,
//   Star,
//   TrendingUp,
//   Activity,
//   Target,
//   Bell,
//   Image,
//   UserPlus,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Menu,
//   ChevronLeft,
//   ChevronRight,
//   MapPin,
//   Mail
// } from 'lucide-react';

// interface SidebarProps {
//   role: 'branch_admin' | 'super_admin';
//   onLogout: () => void;
//   isOpen?: boolean;
//   onToggle?: () => void;
//   className?: string;
//   allowedPages?: string[]; // 👈 NEW: Added allowedPages prop
// }

// const branchAdminNavItems = [
//   {
//     title: 'Dashboard',
//     href: '/admin',
//     icon: BarChart3,
//     pageKey: 'dashboard'
//   },
//   {
//     title: 'Appointments',
//     href: '/admin/appointments',
//     icon: Calendar,
//     pageKey: 'appointments'
//   },
//   {
//     title: 'Booking Calender',
//     href: '/admin/bookingcalender',
//     icon: Calendar,
//     pageKey: 'booking calender'
//   },
//   {
//     title: 'Services',
//     href: '/admin/services',
//     icon: Scissors,
//     pageKey: 'services'
//   },
//   {
//     title: 'Products',
//     href: '/admin/products',
//     icon: Package,
//     pageKey: 'products'
//   },
//   {
//     title: 'Clients',
//     href: '/admin/clients',
//     icon: Users,
//     pageKey: 'clients'
//   },
//   {
//     title: 'Staff',
//     href: '/admin/staff',
//     icon: Users,
//     pageKey: 'staff'
//   },
//   {
//     title: 'Feedbacks',
//     href: '/admin/feedbacks',
//     icon: Star,
//     pageKey: 'feedbacks'
//   },
//   {
//     title: 'Categories',
//     href: '/admin/categories',
//     icon: Tag,
//     pageKey: 'categories'
//   },
//   {
//     title: 'Analytics',
//     href: '/admin/analytics',
//     icon: TrendingUp,
//     pageKey: 'analytics'
//   },
//   {
//     title: 'Expenses',
//     href: '/admin/expenses',
//     icon: DollarSign,
//     pageKey: 'expenses'
//   },
//   {
//     title: 'Orders',
//     href: '/admin/orders',
//     icon: ShoppingCart,
//     pageKey: 'orders'
//   },
//   {
//     title: 'Membership',
//     href: '/admin/membership',
//     icon: Award,
//     pageKey: 'membership'
//   },
 
//   {
//     title: 'Messages',
//     href: '/admin/messages',
//     icon: MessageCircle,
//     pageKey: 'messages'
//   },
//   {
//     title: 'Custom Invoice',
//     href: '/admin/custominvoice',
//     icon: TrendingUp,
//     pageKey: 'custom invoice'
//   },
//   {
//     title: 'Settings',
//     href: '/admin/settings',
//     icon: Settings,
//     pageKey: 'settings'
//   },
// ];

// const superAdminNavItems = [
//   {
//     title: 'Dashboard',
//     href: '/super-admin',
//     icon: BarChart3,
//     pageKey: 'dashboard'
//   },
//   {
//     title: 'All Appointments',
//     href: '/super-admin/appointments',
//     icon: Calendar,
//     pageKey: 'appointments'
//   },
//   {
//     title: 'Booking Calendar',
//     href: '/super-admin/bookingcalender',
//     icon: Calendar,
//     pageKey: 'booking-calendar'
//   },

//   // 🔽 DROPDOWN START
//   {
//     title: 'Catalog',
//     icon: Package,
//     pageKey: 'catalog',
//     children: [
//       {
//         title: 'Services',
//         href: '/super-admin/services',
//         icon: Scissors,
//         pageKey: 'services'
//       },
//       {
//         title: 'Products',
//         href: '/super-admin/products',
//         icon: Package,
//         pageKey: 'products'
//       },
//       {
//         title: 'Categories',
//         href: '/super-admin/categories',
//         icon: Tag,
//         pageKey: 'categories'
//       }
//     ]
//   },
//   // 🔼 DROPDOWN END

//   {
//     title: 'Clients',
//     href: '/super-admin/clients',
//     icon: Users,
//     pageKey: 'clients'
//   },
//   {
//     title: 'Staff Management',
//     href: '/super-admin/staff',
//     icon: Users,
//     pageKey: 'staff'
//   },
//   {
//     title: 'All Orders',
//     href: '/super-admin/orders',
//     icon: ShoppingCart,
//     pageKey: 'orders'
//   },
//   {
//     title: 'Membership',
//     href: '/super-admin/membership',
//     icon: Award,
//     pageKey: 'membership'
//   },
//   {
//     title: 'Analytics',
//     href: '/super-admin/analytics',
//     icon: PieChart,
//     pageKey: 'analytics'
//   },
//   {
//     title: 'Expenses',
//     href: '/super-admin/expenses',
//     icon: DollarSign,
//     pageKey: 'expenses'
//   },
//   {
//     title: 'Branches',
//     href: '/super-admin/branches',
//     icon: Building,
//     pageKey: 'branches'
//   },
//   {
//     title: 'Users',
//     href: '/super-admin/users',
//     icon: Users,
//     pageKey: 'users'
//   },
//   {
//     title: 'Blogs',
//     href: '/super-admin/blogs',
//     icon: FileText,
//     pageKey: 'blogs'
//   },
//   {
//     title: 'Custom Invoice Generator',
//     href: '/super-admin/custom-invoice',
//     icon: FileText,
//     pageKey: 'custom-invoice'
//   },
//   {
//     title: 'Messages',
//     href: '/super-admin/messages',
//     icon: MessageCircle,
//     pageKey: 'messages'
//   },
//   {
//     title: 'Settings',
//     href: '/super-admin/settings',
//     icon: FileText,
//     pageKey: 'settings'
//   }
// ];


// interface SidebarContentProps extends Omit<SidebarProps, 'isOpen'> {
//   isCollapsed?: boolean;
// }

// function SidebarContent({ 
//   role, 
//   onLogout, 
//   onToggle, 
//   isCollapsed = false,
//   allowedPages = [] // 👈 Receive allowedPages
// }: SidebarContentProps & { isCollapsed?: boolean }) {
//   const pathname = usePathname();
  
//   // Base navigation items based on role
//   let baseNavItems = role === 'super_admin' ? superAdminNavItems : branchAdminNavItems;
  
//   // Filter navigation items based on allowedPages
//   let navItems = baseNavItems;
  
//   if (role === 'branch_admin' && allowedPages && allowedPages.length > 0) {
//     // Convert allowedPages to lowercase for case-insensitive comparison
//     const allowedPagesLower = allowedPages.map(page => page.toLowerCase());
    
//     // Filter items: only show items whose pageKey is in allowedPages
//     navItems = baseNavItems.filter(item => {
//       // Always show dashboard if it exists in allowedPages or if no specific pages are set
//       if (item.pageKey === 'dashboard') {
//         return allowedPagesLower.includes('dashboard') || allowedPages.length === 0;
//       }
      
//       // For other pages, check if pageKey is in allowedPages
//       if (item.pageKey) {
//         return allowedPagesLower.includes(item.pageKey.toLowerCase());
//       }
      
//       // If no pageKey, show it (shouldn't happen)
//       return true;
//     });
    
//     console.log('🔍 Filtered sidebar items:', navItems.map(item => item.title));
//     console.log('📋 Allowed pages:', allowedPages);
//   }
  
//   // If no items to show (edge case), show a message
//   if (navItems.length === 0) {
//     navItems = [{
//       title: 'No Access',
//       href: '#',
//       icon: XCircle,
//       pageKey: 'noaccess'
//     }];
//   }

//   return (
//     <div className="flex h-full flex-col bg-primary border-r border-secondary/10">
//       {/* Logo */}
//       <div className="flex h-16 items-center px-4 lg:px-6">
//         <div className="flex items-center justify-between w-full">
//           <Link href="/" className="flex items-center gap-2 group">
//             <div className="w-8 h-8 mt-1 bg-secondary flex items-center justify-center rounded-lg transition-all duration-300 group-hover:rotate-12 shadow-lg shadow-secondary/20">
//               <Scissors className="h-4 w-4 text-primary" />
//             </div>
//             {!isCollapsed && (
//               <span className="text-lg font-serif font-bold text-white tracking-tighter mt-1">
//                 MAN OF <span className="text-secondary">CAVE</span>
//               </span>
//             )}
//           </Link>
//         </div>
//       </div>

//       {/* Navigation */}
//       <ScrollArea className="flex-1 px-3 h-full -mt-2">
//         <div className="space-y-1 py-4">
//           {navItems.map((item) => {
//             const isActive = pathname === item.href;
//             const isDisabled = item.title === 'No Access';
            
//             return (
//               <Link 
//                 key={item.href} 
//                 href={isDisabled ? '#' : item.href}
//                 className={isDisabled ? 'pointer-events-none cursor-not-allowed' : ''}
//               >
//                 <Button
//                   variant="ghost"
//                   disabled={isDisabled}
//                   className={cn(
//                     "w-full justify-start gap-3 h-10 rounded-lg transition-all duration-200",
//                     isCollapsed && "justify-center px-0",
//                     isActive 
//                       ? "bg-secondary text-primary font-semibold shadow-lg shadow-secondary/20" 
//                       : "text-gray-400 hover:text-secondary hover:bg-white/5",
//                     isDisabled && "opacity-50 cursor-not-allowed"
//                   )}
//                 >
//                   <item.icon className={cn(
//                     "h-5 w-5", 
//                     isActive ? "text-primary" : "text-gray-400 group-hover:text-secondary",
//                     isDisabled && "text-gray-500"
//                   )} />
//                   {!isCollapsed && (
//                     <span className={cn(
//                       "text-sm",
//                       isDisabled && "text-gray-500"
//                     )}>
//                       {item.title}
//                     </span>
//                   )}
//                 </Button>
//               </Link>
//             );
//           })}
//         </div>
//       </ScrollArea>

//       {/* Logout */}
//       <div className="p-4 -mt-7 ml-7">
//         <Button
//           variant="ghost"
//           className={cn(
//             "w-full justify-start gap-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10",
//             isCollapsed && "justify-center px-0"
//           )}
//           onClick={onLogout}
//         >
//           <LogOut className="h-5 w-5" />
//           {!isCollapsed && "Logout"}
//         </Button>
//       </div>
//     </div>
//   );
// }

// export function AdminSidebar({ 
//   role, 
//   onLogout, 
//   isOpen = true, 
//   onToggle,
//   allowedPages = [] // 👈 Accept allowedPages
// }: SidebarProps) {
//   return (
//     <>
//       {/* Mobile/Tablet Overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/50 lg:hidden"
//           onClick={onToggle}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={cn(
//         "h-full shrink-0 bg-white border-r transition-all duration-300 ease-in-out",
//         // Mobile: slide in/out completely (fixed positioning for mobile overlay)
//         "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto lg:translate-x-0",
//         isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
//         // Desktop: normal flex item with appropriate width
//         "lg:static lg:w-16",
//         isOpen && "lg:w-64"
//       )}>
//         <SidebarContent 
//           role={role} 
//           onLogout={onLogout} 
//           onToggle={onToggle} 
//           isCollapsed={!isOpen}
//           allowedPages={allowedPages} // 👈 Pass allowedPages
//         />
//       </div>
//     </>
//   );
// }

// export function AdminMobileSidebar({ role, onLogout, isOpen, onToggle, allowedPages = [] }: SidebarProps) {
//   return (
//     <Button
//       variant="outline"
//       size="icon"
//       onClick={onToggle}
//       className="lg:hidden"
//     >
//       <Menu className="h-5 w-5" />
//     </Button>
//   );
// }

// // Helper function to get page key from href (optional, for backward compatibility)
// export function getPageKeyFromHref(href: string): string {
//   const pageMap: Record<string, string> = {
//     '/admin': 'dashboard',
//     '/admin/appointments': 'appointments',
//     '/admin/bookingcalender': 'booking calender',
//     '/admin/services': 'services',
//     '/admin/products': 'products',
//     '/admin/clients': 'clients',
//     '/admin/staff': 'staff',
//     '/admin/feedbacks': 'feedbacks',
//     '/admin/categories': 'categories',
//     '/admin/analytics': 'analytics',
//     '/admin/expenses': 'expenses',
//     '/admin/orders': 'orders',
//     '/admin/membership': 'membership',
//     '/admin/branches': 'branches',
//     '/admin/messages': 'messages',
//     '/admin/custominvoice': 'custom invoice',
//     '/admin/settings': 'settings',
//   };
  
//   return pageMap[href] || '';
// }

// new 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Building,
  Award,
  LogOut,
  Scissors,
  Package,
  Tag,
  MessageCircle,
  PieChart,
  FileText,
  ShoppingCart,
  Star,
  TrendingUp,
  Menu,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  role: 'branch_admin' | 'super_admin';
  onLogout: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  allowedPages?: string[];
}

/* ===================== BRANCH ADMIN ===================== */

const branchAdminNavItems = [
  { title: 'Dashboard', href: '/admin', icon: BarChart3, pageKey: 'dashboard' },
  { title: 'Appointments', href: '/admin/appointments', icon: Calendar, pageKey: 'appointments' },
  { title: 'Booking Calendar', href: '/admin/bookingcalender', icon: Calendar, pageKey: 'booking-calender' },
  { title: 'Services', href: '/admin/services', icon: Scissors, pageKey: 'services' },
  { title: 'Products', href: '/admin/products', icon: Package, pageKey: 'products' },
  { title: 'Clients', href: '/admin/clients', icon: Users, pageKey: 'clients' },
  { title: 'Staff', href: '/admin/staff', icon: Users, pageKey: 'staff' },
  { title: 'Feedbacks', href: '/admin/feedbacks', icon: Star, pageKey: 'feedbacks' },
  { title: 'Categories', href: '/admin/categories', icon: Tag, pageKey: 'categories' },
  { title: 'Analytics', href: '/admin/analytics', icon: TrendingUp, pageKey: 'analytics' },
  { title: 'Expenses', href: '/admin/expenses', icon: DollarSign, pageKey: 'expenses' },
  { title: 'Orders', href: '/admin/orders', icon: ShoppingCart, pageKey: 'orders' },
  { title: 'Membership', href: '/admin/membership', icon: Award, pageKey: 'membership' },
  { title: 'Messages', href: '/admin/messages', icon: MessageCircle, pageKey: 'messages' },
  { title: 'Settings', href: '/admin/settings', icon: Settings, pageKey: 'settings' }
];

/* ===================== SUPER ADMIN ===================== */

const superAdminNavItems = [
  { title: 'Dashboard', href: '/super-admin', icon: BarChart3, pageKey: 'dashboard' },
  { title: 'All Appointments', href: '/super-admin/appointments', icon: Calendar, pageKey: 'appointments' },
  { title: 'Booking Calendar', href: '/super-admin/bookingcalender', icon: Calendar, pageKey: 'booking-calendar' },

  {
    title: 'Catalog',
    icon: Package,
    pageKey: 'catalog',
    children: [
      { title: 'Services', href: '/super-admin/services', icon: Scissors, pageKey: 'services' },
      { title: 'Products', href: '/super-admin/products', icon: Package, pageKey: 'products' },
      { title: 'Categories', href: '/super-admin/categories', icon: Tag, pageKey: 'categories' }
    ]
  },

  { title: 'Clients', href: '/super-admin/clients', icon: Users, pageKey: 'clients' },
  { title: 'Staff Management', href: '/super-admin/staff', icon: Users, pageKey: 'staff' },
  { title: 'Orders', href: '/super-admin/orders', icon: ShoppingCart, pageKey: 'orders' },
  { title: 'Membership', href: '/super-admin/membership', icon: Award, pageKey: 'membership' },
  { title: 'Analytics', href: '/super-admin/analytics', icon: PieChart, pageKey: 'analytics' },
  { title: 'Expenses', href: '/super-admin/expenses', icon: DollarSign, pageKey: 'expenses' },
  { title: 'Branches', href: '/super-admin/branches', icon: Building, pageKey: 'branches' },
  { title: 'Users', href: '/super-admin/users', icon: Users, pageKey: 'users' },
  { title: 'Blogs', href: '/super-admin/blogs', icon: FileText, pageKey: 'blogs' },
  { title: 'Messages', href: '/super-admin/messages', icon: MessageCircle, pageKey: 'messages' },
  { title: 'Settings', href: '/super-admin/settings', icon: Settings, pageKey: 'settings' }
];

/* ===================== SIDEBAR CONTENT ===================== */

function SidebarContent({
  role,
  onLogout,
  isCollapsed = false,
  allowedPages = []
}: {
  role: SidebarProps['role'];
  onLogout: () => void;
  isCollapsed?: boolean;
  allowedPages?: string[];
}) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>('catalog');

  const navItems = role === 'super_admin' ? superAdminNavItems : branchAdminNavItems;

  return (
    <div className="flex h-full flex-col bg-primary border-r border-secondary/10">
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <span className="text-lg font-bold text-white">MAN OF <span className="text-secondary">CAVE</span></span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {navItems.map((item) => {
            const isActive = item.href ? pathname === item.href : false;

            /* ===== DROPDOWN ITEM ===== */
            if (item.children) {
              const isOpen = openDropdown === item.pageKey;

              return (
                <div key={item.pageKey}>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setOpenDropdown(isOpen ? null : item.pageKey)
                    }
                    className="w-full justify-between text-gray-400 hover:text-secondary"
                  >
                    <div className="flex gap-3 items-center">
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && item.title}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180"
                      )} />
                    )}
                  </Button>

                  {isOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;

                        return (
                          <Link key={child.pageKey} href={child.href}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start gap-3 h-9",
                                childActive
                                  ? "bg-secondary text-primary"
                                  : "text-gray-400 hover:text-secondary"
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              {!isCollapsed && child.title}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            /* ===== NORMAL ITEM ===== */
            return (
              <Link key={item.pageKey} href={item.href!}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-gray-400 hover:text-secondary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && item.title}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Logout */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start gap-3 text-gray-400 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
}

/* ===================== MAIN SIDEBAR ===================== */

export function AdminSidebar({
  role,
  onLogout,
  isOpen = true,
  onToggle,
  allowedPages = []
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={onToggle} />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white transition-all',
          isOpen ? 'w-64' : '-translate-x-full w-64',
          'lg:static lg:translate-x-0'
        )}
      >
        <SidebarContent
          role={role}
          onLogout={onLogout}
          isCollapsed={!isOpen}
          allowedPages={allowedPages}
        />
      </div>
    </>
  );
}

export function AdminMobileSidebar({ onToggle }: { onToggle?: () => void }) {
  return (
    <Button variant="outline" size="icon" onClick={onToggle} className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  );
}
