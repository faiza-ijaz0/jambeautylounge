// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { ChevronDown, ChevronRight } from 'lucide-react';
// import {
//   BarChart3,
//   Calendar,
//   Users,
//   DollarSign,
//   Settings as SettingsIcon,
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
//   ChevronRight as ChevronRightIcon,
//   MapPin,
//   Mail,
//   Wrench // Added for Admin Tools icon
// } from 'lucide-react';

// interface SidebarProps {
//   role: 'branch_admin' | 'super_admin';
//   onLogout: () => void;
//   isOpen?: boolean;
//   onToggle?: () => void;
//   className?: string;
//   allowedPages?: string[];
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
//     icon: SettingsIcon,
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
//     title: 'Booking Calender',
//     href: '/super-admin/bookingcalender',
//     icon: Calendar,
//     pageKey: 'booking calender'
//   },
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






//  {
//     title: 'Finance Report',
//     icon: Wrench, // Changed to Wrench icon
//     pageKey: 'finance_report',
//     children: [
//       {
//         title: 'Report',
//         href: '/super-admin/report',
//         icon: FileText,
//         pageKey: 'report'
//       },
//       {
//         title: 'Sales page',
//         href: '/super-admin/sales',
//         icon: FileText,
//         pageKey: 'sales'
//       },
     
//     ]
//   },



















//  {
//     title: 'Attendance',
//     href: '/super-admin/attendance',
//     icon: Award,
//     pageKey: 'Attendance'
//   },


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
//     title: 'All Feedback',
//     href: '/super-admin/feedback',
//     icon: Star,
//     pageKey: 'feedbacks'
//   },
//   {
//     title: 'Categories',
//     href: '/super-admin/categories',
//     icon: Tag,
//     pageKey: 'categories'
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
//     title: 'Admin Tools',
//     icon: Wrench, // Changed to Wrench icon
//     pageKey: 'admin_tools',
//     children: [
//       {
//         title: 'Blogs',
//         href: '/super-admin/blogs',
//         icon: FileText,
//         pageKey: 'blogs'
//       },
//       {
//         title: 'Custom Invoice',
//         href: '/super-admin/custom-invoice',
//         icon: FileText,
//         pageKey: 'custom_invoice'
//       },
//       {
//         title: 'Settings',
//         href: '/super-admin/settings',
//         icon: SettingsIcon,
//         pageKey: 'settings'
//       },
      
//     ]
//   },
//   {
//     title: 'Messages',
//     href: '/super-admin/messages',
//     icon: MessageCircle,
//     pageKey: 'messages'
//   },
// ];

// interface SidebarContentProps extends Omit<SidebarProps, 'isOpen'> {
//   isCollapsed?: boolean;
// }

// function SidebarContent({ 
//   role, 
//   onLogout, 
//   onToggle, 
//   isCollapsed = false,
//   allowedPages = []
// }: SidebarContentProps & { isCollapsed?: boolean }) {
//   const pathname = usePathname();
//   const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
//     'catalog': false,
//     'admin_tools': false
//   });
  
//   // Base navigation items based on role
//   let baseNavItems = role === 'super_admin' ? superAdminNavItems : branchAdminNavItems;
  
//   // Filter navigation items based on allowedPages
//   let navItems = baseNavItems;
  
//   if (role === 'branch_admin' && allowedPages && allowedPages.length > 0) {
//     const allowedPagesLower = allowedPages.map(page => page.toLowerCase());
    
//     navItems = baseNavItems.filter(item => {
//       if (item.pageKey === 'dashboard') {
//         return allowedPagesLower.includes('dashboard') || allowedPages.length === 0;
//       }
      
//       if (item.pageKey) {
//         return allowedPagesLower.includes(item.pageKey.toLowerCase());
//       }
      
//       return true;
//     });
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

//   // Function to toggle expansion
//   const toggleExpand = (pageKey: string) => {
//     setExpandedItems(prev => ({
//       ...prev,
//       [pageKey]: !prev[pageKey]
//     }));
//   };

//   return (
//     <div className="flex h-full flex-col bg-primary border-r border-secondary/10 ">
//       {/* Logo */}
//       <div className="flex h-16 items-center px-4 lg:px-6">
//         <div className="flex items-center justify-between w-full">
         
//           <Link href="/" className="flex items-center gap-2 group">
           
//             {!isCollapsed && (
//               <span className="text-lg font-serif font-bold text-white tracking-tighter mt-1">
//                 JAM<span className="text-gray-400">Beauty Lounge</span>
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
            
//             // Check if item has children
//             if ((item as any).children) {
//               const isExpanded = expandedItems[item.pageKey] && !isCollapsed;
              
//               // Check if any child is active for parent highlight
//               const isChildActive = (item as any).children?.some((child: any) => pathname === child.href);
              
//               return (
//                 <div key={`parent-${item.pageKey || item.title}`} className="space-y-1">
//                   {/* Parent item (Dropdown) - Clickable to expand/collapse */}
//                   <Button
//                     variant="ghost"
//                     onClick={() => toggleExpand(item.pageKey)}
//                     className={cn(
//                       "w-full justify-start gap-3 h-10 rounded-lg transition-all duration-200",
//                       isCollapsed && "justify-center px-0",
//                       isChildActive
//                         ? "bg-slate-500 text-secondary"
//                         : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
//                     )}
//                   >
//                     <item.icon className={cn(
//                       "h-5 w-5",
//                       isChildActive && "text-secondary"
//                     )} />
//                     {!isCollapsed && (
//                       <>
//                         <span className="text-sm flex-1 text-left">{item.title}</span>
//                         {isExpanded ? (
//                           <ChevronDown className="h-4 w-4" />
//                         ) : (
//                           <ChevronRight className="h-4 w-4" />
//                         )}
//                       </>
//                     )}
//                   </Button>
                  
//                   {/* Children items - Show only when expanded */}
//                   {isExpanded && (
//                     <div className="ml-6 space-y-1">
//                       {((item as any).children || []).map((child: any) => {
//                         const isChildActive = pathname === child.href;
//                         return (
//                           <Link 
//                             key={`child-${child.href || child.pageKey}`} 
//                             href={child.href}
//                           >
//                             <Button
//                               variant="ghost"
//                               className={cn(
//                                 "w-full justify-start gap-3 h-9 rounded-lg transition-all duration-200",
//                                 isChildActive 
//                                   ? "bg-slate-500 text-primary font-semibold shadow-lg shadow-secondary/20" 
//                                   : "text-gray-400 hover:text-slate-300 hover:bg-white/5"
//                               )}
//                             >
//                               <child.icon className={cn(
//                                 "h-4 w-4", 
//                                 isChildActive ? "text-primary" : "text-gray-400 group-hover:text-slate-300"
//                               )} />
//                               <span className="text-sm">
//                                 {child.title}
//                               </span>
//                             </Button>
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             }
            
//             // Normal items (without children)
//             return (
//               <Link 
//                 key={item.href || `item-${item.pageKey}`} 
//                 href={isDisabled ? '#' : (item.href || '/')}
//                 className={isDisabled ? 'pointer-events-none cursor-not-allowed' : ''}
//               >
//                 <Button
//                   variant="ghost"
//                   disabled={isDisabled}
//                   className={cn(
//                     "w-full justify-start gap-3 h-10 rounded-lg transition-all duration-200",
//                     isCollapsed && "justify-center px-0",
//                     isActive 
//                       ? "bg-slate-500  text-primary font-semibold shadow-lg shadow-secondary/20" 
//                       : "text-gray-400 hover:text-slate-300 hover:bg-white/5",
//                     isDisabled && "opacity-50 cursor-not-allowed"
//                   )}
//                 >
//                   <item.icon className={cn(
//                     "h-5 w-5", 
//                     isActive ? "text-primary" : "text-gray-400 group-hover:text-slate-300",
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
//   allowedPages = []
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
//         "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto lg:translate-x-0",
//         isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
//         "lg:static lg:w-16",
//         isOpen && "lg:w-64"
//       )}>
//         <SidebarContent 
//           role={role} 
//           onLogout={onLogout} 
//           onToggle={onToggle} 
//           isCollapsed={!isOpen}
//           allowedPages={allowedPages}
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

// // Helper function to get page key from href
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

// new code
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Settings as SettingsIcon,
  Building,
  Award,
  LogOut,
  Scissors,
  Package,
  Tag,
  MessageCircle,
  PieChart,
  Phone,
  FileText,
  CreditCard,
  ShoppingCart,
  Star,
  TrendingUp,
  Activity,
  Target,
  Bell,
  Image,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Menu,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MapPin,
  Mail,
  Wrench,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  role: 'branch_admin' | 'super_admin';
  onLogout: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  allowedPages?: string[];
}

const branchAdminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    pageKey: 'dashboard'
  },
  {
    title: 'Appointments',
    href: '/admin/appointments',
    icon: Calendar,
    pageKey: 'appointments'
  },
  {
    title: 'Booking Calender',
    href: '/admin/bookingcalender',
    icon: Calendar,
    pageKey: 'booking calender'
  },
  {
    title: 'Services',
    href: '/admin/services',
    icon: Scissors,
    pageKey: 'services'
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    pageKey: 'products'
  },
  {
    title: 'Clients',
    href: '/admin/clients',
    icon: Users,
    pageKey: 'clients'
  },
  {
    title: 'Staff',
    href: '/admin/staff',
    icon: Users,
    pageKey: 'staff'
  },
  {
    title: 'Feedbacks',
    href: '/admin/feedbacks',
    icon: Star,
    pageKey: 'feedbacks'
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Tag,
    pageKey: 'categories'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    pageKey: 'analytics'
  },
  {
    title: 'Expenses',
    href: '/admin/expenses',
    icon: DollarSign,
    pageKey: 'expenses'
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    pageKey: 'orders'
  },
  {
    title: 'Membership',
    href: '/admin/membership',
    icon: Award,
    pageKey: 'membership'
  },
  {
    title: 'Messages',
    href: '/admin/messages',
    icon: MessageCircle,
    pageKey: 'messages'
  },
  {
    title: 'Custom Invoice',
    href: '/admin/custominvoice',
    icon: TrendingUp,
    pageKey: 'custom invoice'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: SettingsIcon,
    pageKey: 'settings'
  },
];

const superAdminNavItems = [
  {
    title: 'Dashboard',
    href: '/super-admin',
    icon: BarChart3,
    pageKey: 'dashboard'
  },
  {
    title: 'All Appointments',
    href: '/super-admin/appointments',
    icon: Calendar,
    pageKey: 'appointments'
  },
  {
    title: 'Booking Calender',
    href: '/super-admin/bookingcalender',
    icon: Calendar,
    pageKey: 'booking calender'
  },
  {
    title: 'Catalog',
    icon: Package,
    pageKey: 'catalog',
    children: [
      {
        title: 'Services',
        href: '/super-admin/services',
        icon: Scissors,
        pageKey: 'services'
      },
      {
        title: 'Products',
        href: '/super-admin/products',
        icon: Package,
        pageKey: 'products'
      },
      {
        title: 'Categories',
        href: '/super-admin/categories',
        icon: Tag,
        pageKey: 'categories'
      }
    ]
  },
  {
    title: 'Finance Report',
    icon: Wrench,
    pageKey: 'finance_report',
    children: [
      {
        title: 'Report',
        href: '/super-admin/report',
        icon: FileText,
        pageKey: 'report'
      },
      {
        title: 'Sales page',
        href: '/super-admin/sales',
        icon: FileText,
        pageKey: 'sales'
      },
    ]
  },
  {
    title: 'Attendance',
    href: '/super-admin/attendance',
    icon: Award,
    pageKey: 'Attendance'
  },
  {
    title: 'Clients',
    href: '/super-admin/clients',
    icon: Users,
    pageKey: 'clients'
  },
  {
    title: 'Staff Management',
    href: '/super-admin/staff',
    icon: Users,
    pageKey: 'staff'
  },
  {
    title: 'All Feedback',
    href: '/super-admin/feedback',
    icon: Star,
    pageKey: 'feedbacks'
  },
  {
    title: 'Categories',
    href: '/super-admin/categories',
    icon: Tag,
    pageKey: 'categories'
  },
  {
    title: 'Analytics',
    href: '/super-admin/analytics',
    icon: PieChart,
    pageKey: 'analytics'
  },
  {
    title: 'Expenses',
    href: '/super-admin/expenses',
    icon: DollarSign,
    pageKey: 'expenses'
  },
  {
    title: 'All Orders',
    href: '/super-admin/orders',
    icon: ShoppingCart,
    pageKey: 'orders'
  },
  {
    title: 'Membership',
    href: '/super-admin/membership',
    icon: Award,
    pageKey: 'membership'
  },
  {
    title: 'Branches',
    href: '/super-admin/branches',
    icon: Building,
    pageKey: 'branches'
  },
  {
    title: 'Users',
    href: '/super-admin/users',
    icon: Users,
    pageKey: 'users'
  },
  {
    title: 'Admin Tools',
    icon: Wrench,
    pageKey: 'admin_tools',
    children: [
      {
        title: 'Blogs',
        href: '/super-admin/blogs',
        icon: FileText,
        pageKey: 'blogs'
      },
      {
        title: 'Custom Invoice',
        href: '/super-admin/custom-invoice',
        icon: FileText,
        pageKey: 'custom_invoice'
      },
      {
        title: 'Settings',
        href: '/super-admin/settings',
        icon: SettingsIcon,
        pageKey: 'settings'
      },
    ]
  },
  {
    title: 'Messages',
    href: '/super-admin/messages',
    icon: MessageCircle,
    pageKey: 'messages'
  },
];

interface SidebarContentProps extends Omit<SidebarProps, 'isOpen'> {
  isCollapsed?: boolean;
}

function SidebarContent({ 
  role, 
  onLogout, 
  onToggle, 
  isCollapsed = false,
  allowedPages = []
}: SidebarContentProps & { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'catalog': false,
    'admin_tools': false,
    'finance_report': false
  });
  
  // Base navigation items based on role
  let baseNavItems = role === 'super_admin' ? superAdminNavItems : branchAdminNavItems;
  
  // Filter navigation items based on allowedPages
  let navItems = baseNavItems;
  
  if (role === 'branch_admin' && allowedPages && allowedPages.length > 0) {
    const allowedPagesLower = allowedPages.map(page => page.toLowerCase());
    
    navItems = baseNavItems.filter(item => {
      if (item.pageKey === 'dashboard') {
        return allowedPagesLower.includes('dashboard') || allowedPages.length === 0;
      }
      
      if (item.pageKey) {
        return allowedPagesLower.includes(item.pageKey.toLowerCase());
      }
      
      return true;
    });
  }
  
  // If no items to show (edge case), show a message
  if (navItems.length === 0) {
    navItems = [{
      title: 'No Access',
      href: '#',
      icon: XCircle,
      pageKey: 'noaccess'
    }];
  }

  // Function to toggle expansion
  const toggleExpand = (pageKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [pageKey]: !prev[pageKey]
    }));
  };

  return (
    <div className="flex  flex-col bg-white border-r border-gray-200 ">
      {/* Pink Top Border */}
      <div className=" w-full bg-[#FA9DB7]">
        
      </div>
      
      {/* Logo - Pink & Gray */}
      <div className="flex h-20 items-center px-4 lg:px-6 border-b border-gray-100">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#FA9DB7]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#FA9DB7]" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-serif font-bold tracking-tighter">
                <span className="text-[#FA9DB7]">Jam</span>
                <span className="text-gray-800">Beauty</span>
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Navigation - Pink, Gray, Black */}
      {/* Navigation - Pink, Gray, Black */}
      <ScrollArea className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.title === 'No Access';
            
            // Check if item has children
            if ((item as any).children) {
              const isExpanded = expandedItems[item.pageKey] && !isCollapsed;
              
              // Check if any child is active for parent highlight
              const isChildActive = (item as any).children?.some((child: any) => pathname === child.href);
              
              return (
                <div key={`parent-${item.pageKey || item.title}`} className="space-y-1">
                  {/* Parent item (Dropdown) - Pink Hover */}
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpand(item.pageKey)}
                    className={cn(
                      "w-full justify-start gap-3 h-11 rounded-xl transition-all duration-200",
                      isCollapsed && "justify-center px-0",
                      isChildActive
                        ? "bg-[#FA9DB7]/10 text-[#B84A68] font-medium"
                        : "text-gray-600 hover:text-[#FA9DB7] hover:bg-[#FA9DB7]/5"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5",
                      isChildActive ? "text-[#FA9DB7]" : "text-gray-400"
                    )} />
                    {!isCollapsed && (
                      <>
                        <span className="text-sm flex-1 text-left">{item.title}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </>
                    )}
                  </Button>
                  
                  {/* Children items - Light Pink Background */}
                  {isExpanded && (
                    <div className="ml-6 space-y-1 pl-3 border-l-2 border-[#FA9DB7]/20">
                      {((item as any).children || []).map((child: any) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link 
                            key={`child-${child.href || child.pageKey}`} 
                            href={child.href}
                          >
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start gap-3 h-10 rounded-xl transition-all duration-200",
                                isChildActive 
                                  ? "bg-[#FA9DB7]/10 text-[#B84A68] font-medium" 
                                  : "text-gray-500 hover:text-[#FA9DB7] hover:bg-[#FA9DB7]/5"
                              )}
                            >
                              <child.icon className={cn(
                                "h-4 w-4", 
                                isChildActive ? "text-[#FA9DB7]" : "text-gray-400"
                              )} />
                              <span className="text-sm">
                                {child.title}
                              </span>
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            // Normal items (without children)
            return (
              <Link 
                key={item.href || `item-${item.pageKey}`} 
                href={isDisabled ? '#' : (item.href || '/')}
                className={isDisabled ? 'pointer-events-none cursor-not-allowed' : ''}
              >
                <Button
                  variant="ghost"
                  disabled={isDisabled}
                  className={cn(
                    "w-full justify-start gap-3 h-11 rounded-xl transition-all duration-200",
                    isCollapsed && "justify-center px-0",
                    isActive 
                      ? "bg-[#FA9DB7]/10 text-[#B84A68] font-medium shadow-sm" 
                      : "text-gray-600 hover:text-[#FA9DB7] hover:bg-[#FA9DB7]/5",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5", 
                    isActive ? "text-[#FA9DB7]" : "text-gray-400",
                    isDisabled && "text-gray-300"
                  )} />
                  {!isCollapsed && (
                    <span className={cn(
                      "text-sm",
                      isDisabled && "text-gray-400"
                    )}>
                      {item.title}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Logout - Gray/Black */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-pink rounded-xl p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-11 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200",
              isCollapsed && "justify-center px-0"
            )}
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </Button>
        </div>
        
        
      </div>
    </div>
  );
}

export function AdminSidebar({ 
  role, 
  onLogout, 
  isOpen = true, 
  onToggle,
  allowedPages = []
}: SidebarProps) {
  return (
    <>
      {/* Mobile/Tablet Overlay - Pink Tint */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "h-full shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto lg:translate-x-0",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
        "lg:static lg:w-16",
        isOpen && "lg:w-64"
      )}>
        <SidebarContent 
          role={role} 
          onLogout={onLogout} 
          onToggle={onToggle} 
          isCollapsed={!isOpen}
          allowedPages={allowedPages}
        />
      </div>
    </>
  );
}

export function AdminMobileSidebar({ role, onLogout, isOpen, onToggle, allowedPages = [] }: SidebarProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="lg:hidden border-gray-200 hover:border-[#FA9DB7] hover:bg-[#FA9DB7]/5 transition-all duration-200"
    >
      <Menu className="h-5 w-5 text-gray-600" />
    </Button>
  );
}

// Helper function to get page key from href
export function getPageKeyFromHref(href: string): string {
  const pageMap: Record<string, string> = {
    '/admin': 'dashboard',
    '/admin/appointments': 'appointments',
    '/admin/bookingcalender': 'booking calender',
    '/admin/services': 'services',
    '/admin/products': 'products',
    '/admin/clients': 'clients',
    '/admin/staff': 'staff',
    '/admin/feedbacks': 'feedbacks',
    '/admin/categories': 'categories',
    '/admin/analytics': 'analytics',
    '/admin/expenses': 'expenses',
    '/admin/orders': 'orders',
    '/admin/membership': 'membership',
    '/admin/branches': 'branches',
    '/admin/messages': 'messages',
    '/admin/custominvoice': 'custom invoice',
    '/admin/settings': 'settings',
  };
  
  return pageMap[href] || '';
}