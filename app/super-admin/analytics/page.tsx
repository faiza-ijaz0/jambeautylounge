'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Calendar, Users, TrendingUp, Download, RefreshCw, ChevronLeft, ChevronRight, Clock, Filter, BarChart3, PieChart, LineChart } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

// Interfaces for data types
interface Service {
  id: string;
  name: string;
  price: number;
  revenue: number;
  totalBookings: number;
  branchNames: string[];
  status: string;
}

interface Booking {
  id: string;
  branch: string;
  totalAmount: number;
  status: string;
  customerId: string;
  customerName: string;
  serviceName: string;
  servicePrice: number;
  bookingDate: Date;
  createdAt: any;
  paymentStatus: string;
  paymentMethod: string;
  date: string;
}

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  branchNames: string[];
  products: Array<{
    productName: string;
    price: number;
    quantity: number;
  }>;
  createdAt: any;
}

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    totalCustomers: number;
    totalOrders: number;
    avgOrderValue: number;
    revenueChange: number;
    bookingsChange: number;
    ordersChange: number;
  };
  branchPerformance: Array<{
    name: string;
    revenue: number;
    bookings: number;
    customers: number;
    orders: number;
    growth: number;
  }>;
  topServices: Array<{
    name: string;
    revenue: number;
    bookings: number;
    avgPrice: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    bookings: number;
    orders: number;
  }>;
  revenueByBranch: Array<{
    branch: string;
    revenue: number;
    percentage: number;
    bookings: number;
  }>;
  dailyData: Array<{
    date: string;
    revenue: number;
    bookings: number;
    orders: number;
  }>;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  revenue: number;
  bookings: number;
  orders: number;
}

// Custom Loading Component
const LoadingCard = () => (
  <Card>
    <CardHeader>
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
    </CardContent>
  </Card>
);

const LoadingRow = () => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
      <div className="flex justify-between mt-2">
        <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function SuperAdminAnalytics() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // 🔥 NEW: Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'calendar' | 'monthly' | 'yearly'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedMonthData, setSelectedMonthData] = useState<{
    revenue: number;
    bookings: number;
    orders: number;
  } | null>(null);
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rawData, setRawData] = useState<{
    services: Service[];
    bookings: Booking[];
    orders: Order[];
  } | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // 🔥 NEW: Generate calendar days for current month
  useEffect(() => {
    if (analytics?.dailyData) {
      generateCalendarDays(currentDate, analytics.dailyData);
    }
  }, [currentDate, analytics]);

  // 🔥 NEW: Generate calendar days function
  const generateCalendarDays = (date: Date, dailyData: Array<{ date: string; revenue: number; bookings: number; orders: number }>) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    
    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = start.getDay();
    
    // Create array with empty cells for days before month starts
    const calendarDaysArray: CalendarDay[] = [];
    
    // Add empty cells for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevDate = new Date(start);
      prevDate.setDate(start.getDate() - (firstDayOfMonth - i));
      calendarDaysArray.push({
        date: prevDate,
        dayOfMonth: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: isSameDay(prevDate, new Date()),
        revenue: 0,
        bookings: 0,
        orders: 0
      });
    }
    
    // Add current month days
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayData = dailyData.find(d => d.date === dateStr) || { revenue: 0, bookings: 0, orders: 0 };
      
      calendarDaysArray.push({
        date: day,
        dayOfMonth: day.getDate(),
        isCurrentMonth: true,
        isToday: isSameDay(day, new Date()),
        revenue: dayData.revenue,
        bookings: dayData.bookings,
        orders: dayData.orders
      });
    });
    
    // Calculate total cells needed for 6 rows (42 cells)
    const totalCells = 42;
    const remainingCells = totalCells - calendarDaysArray.length;
    
    // Add next month days
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(end);
      nextDate.setDate(end.getDate() + i);
      calendarDaysArray.push({
        date: nextDate,
        dayOfMonth: nextDate.getDate(),
        isCurrentMonth: false,
        isToday: isSameDay(nextDate, new Date()),
        revenue: 0,
        bookings: 0,
        orders: 0
      });
    }
    
    setCalendarDays(calendarDaysArray);
  };

  // 🔥 NEW: Handle month change
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // 🔥 NEW: Handle date selection
  const handleDateSelect = (day: CalendarDay) => {
    setSelectedDate(day.date);
    // Calculate total for selected date
    const dateStr = format(day.date, 'yyyy-MM-dd');
    const dayData = analytics?.dailyData?.find(d => d.date === dateStr);
    if (dayData) {
      setSelectedMonthData({
        revenue: dayData.revenue,
        bookings: dayData.bookings,
        orders: dayData.orders
      });
    } else {
      setSelectedMonthData(null);
    }
  };

  // Function to fetch data from Firebase
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data without date filtering
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const services: Service[] = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));

      const bookingsSnapshot = await getDocs(collection(db, "bookings"));
      const allBookings: Booking[] = bookingsSnapshot.docs.map(doc => {
        const data = doc.data();
        let bookingDate = new Date();
        if (data.date) {
          bookingDate = new Date(data.date);
        } else if (data.createdAt && data.createdAt.toDate) {
          bookingDate = data.createdAt.toDate();
        } else if (data.bookingDate) {
          bookingDate = new Date(data.bookingDate);
        }
        
        return {
          id: doc.id,
          ...data,
          bookingDate: bookingDate
        } as unknown as Booking;
      });

      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const allOrders: Order[] = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        let orderDate = new Date();
        if (data.orderDate) {
          orderDate = new Date(data.orderDate);
        } else if (data.createdAt && data.createdAt.toDate) {
          orderDate = data.createdAt.toDate();
        }
        
        return {
          id: doc.id,
          ...data,
          orderDate: orderDate
        } as unknown as Order;
      });

      // Store raw data for export
      setRawData({
        services,
        bookings: allBookings,
        orders: allOrders
      });

      // Calculate analytics for all time
      const calculatedAnalytics = calculateAnalytics(services, allBookings, allOrders);
      
      setAnalytics(calculatedAnalytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate analytics from all data
  const calculateAnalytics = (
    services: Service[],
    bookings: Booking[],
    orders: Order[]
  ): AnalyticsData => {
    // Total revenue from bookings and orders
    const totalBookingRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const totalOrderRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalRevenue = totalBookingRevenue + totalOrderRevenue;

    // Total bookings
    const totalBookings = bookings.length;

    // Unique customers from bookings and orders
    const bookingCustomers = new Set(bookings.map(b => b.customerId));
    const orderCustomers = new Set(orders.map(o => o.customerEmail));
    const totalCustomers = new Set([...bookingCustomers, ...orderCustomers]).size;

    // Total orders
    const totalOrders = orders.length;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalOrderRevenue / totalOrders : 0;

    // Branch performance calculation
    const branchMap = new Map<string, {
      revenue: number;
      bookings: number;
      customers: Set<string>;
      orders: number;
    }>();

    // Process bookings by branch
    bookings.forEach(booking => {
      const branch = booking.branch || "Unknown";
      const existing = branchMap.get(branch) || { 
        revenue: 0, 
        bookings: 0, 
        customers: new Set<string>(), 
        orders: 0 
      };
      
      existing.revenue += booking.totalAmount || 0;
      existing.bookings += 1;
      if (booking.customerId) {
        existing.customers.add(booking.customerId);
      }
      
      branchMap.set(branch, existing);
    });

    // Process orders by branch
    orders.forEach(order => {
      const branch = order.branchNames?.[0] || "Unknown";
      const existing = branchMap.get(branch) || { 
        revenue: 0, 
        bookings: 0, 
        customers: new Set<string>(), 
        orders: 0 
      };
      
      existing.revenue += order.totalAmount || 0;
      existing.orders += 1;
      if (order.customerEmail) {
        existing.customers.add(order.customerEmail);
      }
      
      branchMap.set(branch, existing);
    });

    // Convert branch map to array
    const branchPerformance = Array.from(branchMap.entries()).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      bookings: data.bookings,
      customers: data.customers.size,
      orders: data.orders,
      growth: 0 // Will be calculated later
    }));

    // Top services calculation
    const serviceRevenueMap = new Map<string, { revenue: number; bookings: number }>();
    
    bookings.forEach(booking => {
      const serviceName = booking.serviceName || "Unknown Service";
      const existing = serviceRevenueMap.get(serviceName) || { revenue: 0, bookings: 0 };
      existing.revenue += booking.totalAmount || 0;
      existing.bookings += 1;
      serviceRevenueMap.set(serviceName, existing);
    });

    const topServices = Array.from(serviceRevenueMap.entries())
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        bookings: data.bookings,
        avgPrice: data.bookings > 0 ? data.revenue / data.bookings : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Monthly trends calculation - ALL 12 MONTHS
    const monthlyMap = new Map<string, { revenue: number; bookings: number; orders: number }>();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyMap.set(month, { revenue: 0, bookings: 0, orders: 0 });
    });
    
    // Process bookings for monthly trends
    bookings.forEach(booking => {
      const monthKey = getMonthName(booking.bookingDate);
      const existing = monthlyMap.get(monthKey) || { revenue: 0, bookings: 0, orders: 0 };
      existing.revenue += booking.totalAmount || 0;
      existing.bookings += 1;
      monthlyMap.set(monthKey, existing);
    });

    // Process orders for monthly trends
    orders.forEach(order => {
      const monthKey = getMonthName(order.orderDate);
      const existing = monthlyMap.get(monthKey) || { revenue: 0, bookings: 0, orders: 0 };
      existing.revenue += order.totalAmount || 0;
      existing.orders += 1;
      monthlyMap.set(monthKey, existing);
    });

    // Create array for all 12 months
    const monthlyTrends = months.map(monthName => {
      const monthData = monthlyMap.get(monthName) || { revenue: 0, bookings: 0, orders: 0 };
      return {
        month: monthName,
        revenue: monthData.revenue,
        bookings: monthData.bookings,
        orders: monthData.orders
      };
    });

    // Revenue by branch for distribution
    const totalBranchRevenue = branchPerformance.reduce((sum, branch) => sum + branch.revenue, 0);
    const revenueByBranch = branchPerformance.map(branch => ({
      branch: branch.name,
      revenue: branch.revenue,
      percentage: totalBranchRevenue > 0 ? (branch.revenue / totalBranchRevenue) * 100 : 0,
      bookings: branch.bookings
    }));

    // 🔥 NEW: Daily data for calendar
    const dailyDataMap = new Map<string, { revenue: number; bookings: number; orders: number }>();
    
    // Process bookings for daily data
    bookings.forEach(booking => {
      const dateStr = format(booking.bookingDate, 'yyyy-MM-dd');
      const existing = dailyDataMap.get(dateStr) || { revenue: 0, bookings: 0, orders: 0 };
      existing.revenue += booking.totalAmount || 0;
      existing.bookings += 1;
      dailyDataMap.set(dateStr, existing);
    });

    // Process orders for daily data
    orders.forEach(order => {
      const dateStr = format(order.orderDate, 'yyyy-MM-dd');
      const existing = dailyDataMap.get(dateStr) || { revenue: 0, bookings: 0, orders: 0 };
      existing.revenue += order.totalAmount || 0;
      existing.orders += 1;
      dailyDataMap.set(dateStr, existing);
    });

    // Convert to array
    const dailyData = Array.from(dailyDataMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      bookings: data.bookings,
      orders: data.orders
    }));

    return {
      overview: {
        totalRevenue,
        totalBookings,
        totalCustomers,
        totalOrders,
        avgOrderValue,
        revenueChange: 0,
        bookingsChange: 0,
        ordersChange: 0
      },
      branchPerformance: branchPerformance.sort((a, b) => b.revenue - a.revenue),
      topServices,
      monthlyTrends,
      revenueByBranch: revenueByBranch.sort((a, b) => b.revenue - a.revenue),
      dailyData
    };
  };

  // Helper function to get month name from date
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'short' });
  };

  // 🔥 FIXED: Export to Excel function
  const handleExport = () => {
    if (!analytics || !rawData) return;

    try {
      const wb = XLSX.utils.book_new();
      
      // Overview Sheet
      const overviewData = [
        ['Analytics Overview Report'],
        ['Generated on:', new Date().toLocaleString()],
        [],
        ['Metric', 'Value'],
        ['Total Revenue', `${formatCurrency(analytics.overview.totalRevenue)}`],
        ['Total Bookings', analytics.overview.totalBookings.toString()],
        ['Total Customers', analytics.overview.totalCustomers.toString()],
        ['Total Orders', analytics.overview.totalOrders.toString()],
        ['Average Order Value', `${formatCurrency(analytics.overview.avgOrderValue)}`],
      ];
      const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, overviewWs, 'Overview');

      // Branch Performance Sheet
      const branchData = [
        ['Branch Performance Report'],
        [],
        ['Branch Name', 'Revenue (AED)', 'Bookings', 'Customers', 'Orders']
      ];
      
      analytics.branchPerformance.forEach(branch => {
        branchData.push([
          branch.name,
          branch.revenue.toFixed(2),
          branch.bookings.toString(),
          branch.customers.toString(),
          branch.orders.toString()
        ]);
      });
      
      const branchWs = XLSX.utils.aoa_to_sheet(branchData);
      XLSX.utils.book_append_sheet(wb, branchWs, 'Branch Performance');

      // Monthly Trends Sheet - ALL 12 MONTHS
      const monthlyData = [
        ['Monthly Trends Report - Full Year'],
        [],
        ['Month', 'Revenue (AED)', 'Bookings', 'Orders']
      ];
      
      analytics.monthlyTrends.forEach(month => {
        monthlyData.push([
          month.month,
          month.revenue.toFixed(2),
          month.bookings.toString(),
          month.orders.toString()
        ]);
      });
      
      const monthlyWs = XLSX.utils.aoa_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly Trends');

      // Raw Bookings Data
      if (rawData.bookings && rawData.bookings.length > 0) {
        const bookingsData = [
          ['Raw Bookings Data'],
          [],
          ['Booking ID', 'Customer', 'Service', 'Branch', 'Amount (AED)', 'Status', 'Date']
        ];
        
        rawData.bookings.slice(0, 1000).forEach(booking => {
          bookingsData.push([
            booking.id.substring(0, 10) + '...',
            booking.customerName || 'N/A',
            booking.serviceName || 'N/A',
            booking.branch || 'N/A',
            (booking.totalAmount || 0).toFixed(2),
            booking.status || 'N/A',
            booking.bookingDate instanceof Date ? format(booking.bookingDate, 'yyyy-MM-dd') : 'N/A'
          ]);
        });
        
        const bookingsWs = XLSX.utils.aoa_to_sheet(bookingsData);
        XLSX.utils.book_append_sheet(wb, bookingsWs, 'Raw Bookings');
      }

      // Raw Orders Data
      if (rawData.orders && rawData.orders.length > 0) {
        const ordersData = [
          ['Raw Orders Data'],
          [],
          ['Order ID', 'Customer', 'Branch', 'Amount (AED)', 'Status', 'Date']
        ];
        
        rawData.orders.slice(0, 1000).forEach(order => {
          ordersData.push([
            order.id.substring(0, 10) + '...',
            order.customerName || 'N/A',
            order.branchNames?.[0] || 'N/A',
            (order.totalAmount || 0).toFixed(2),
            order.paymentStatus || 'N/A',
            order.orderDate instanceof Date ? format(order.orderDate, 'yyyy-MM-dd') : 'N/A'
          ]);
        });
        
        const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(wb, ordersWs, 'Raw Orders');
      }

      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `analytics_report_${timestamp}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      console.log('Excel file exported successfully:', filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('AED', 'AED ');
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (isLoading || !analytics) {
    return (
      <ProtectedRoute requiredRole="super_admin">
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar 
            role="super_admin" 
            onLogout={handleLogout}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)} 
          />
          <div className={cn(
            "flex-1 flex flex-col transition-all duration-300 ease-in-out",
            sidebarOpen ? "lg:ml-0" : "lg:ml-0"
          )}>
            <header className="bg-white shadow-sm border-b">
              <div className="flex items-center justify-between px-4 py-4 lg:px-8">
                <div className="flex items-center gap-4">
                  <AdminMobileSidebar 
                    role="super_admin" 
                    onLogout={handleLogout}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)} 
                  />
                  <div>
                    <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 mt-1 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-auto p-4 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar 
          role="super_admin" 
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />

        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
          sidebarOpen ? "lg:ml-0" : "lg:ml-0"
        )}>
          <header className="bg-white shadow-sm border-b shrink-0">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar 
                  role="super_admin" 
                  onLogout={handleLogout}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)} 
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
                  <p className="text-sm text-gray-600">
                    Complete business performance overview
                    {lastUpdated && (
                      <span className="ml-2 text-xs text-gray-500">
                        Last updated: {format(lastUpdated, 'hh:mm:ss a')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 lg:p-8">
            {/* View Selector */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedView === 'calendar' ? 'default' : 'outline'}
                onClick={() => setSelectedView('calendar')}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Calendar View
              </Button>
              <Button
                variant={selectedView === 'monthly' ? 'default' : 'outline'}
                onClick={() => setSelectedView('monthly')}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Monthly Trends
              </Button>
              <Button
                variant={selectedView === 'yearly' ? 'default' : 'outline'}
                onClick={() => setSelectedView('yearly')}
                className="gap-2"
              >
                <LineChart className="w-4 h-4" />
                Yearly Overview
              </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalBookings)}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime bookings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalCustomers)}</div>
                  <p className="text-xs text-muted-foreground">
                    Unique customers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalOrders)}</div>
                  <p className="text-xs text-muted-foreground">
                    Product orders
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Calendar View */}
            {selectedView === 'calendar' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Calendar */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Calendar Overview</CardTitle>
                      <CardDescription>Daily performance - click on any date for details</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleToday}>
                        Today
                      </Button>
                      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[120px] text-center">
                        {format(currentDate, 'MMMM yyyy')}
                      </span>
                      <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day)}
                          className={cn(
                            "aspect-square p-2 rounded-lg border transition-all text-sm hover:shadow-md",
                            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400',
                            day.isToday && 'border-secondary ring-2 ring-secondary/20',
                            selectedDate && isSameDay(day.date, selectedDate) && 'bg-secondary text-white',
                            !selectedDate && day.revenue > 0 && 'bg-green-50 border-green-200'
                          )}
                        >
                          <div className="flex flex-col h-full">
                            <span className={cn(
                              "text-xs font-medium",
                              selectedDate && isSameDay(day.date, selectedDate) && 'text-white'
                            )}>
                              {day.dayOfMonth}
                            </span>
                            {day.revenue > 0 && (
                              <div className="mt-auto">
                                <div className={cn(
                                  "text-[8px] font-bold truncate",
                                  selectedDate && isSameDay(day.date, selectedDate) ? 'text-white/90' : 'text-green-600'
                                )}>
                                  AED {day.revenue.toFixed(0)}
                                </div>
                                <div className={cn(
                                  "text-[8px]",
                                  selectedDate && isSameDay(day.date, selectedDate) ? 'text-white/70' : 'text-gray-500'
                                )}>
                                  {day.bookings} book • {day.orders} ord
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                        <span>Has revenue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-secondary rounded"></div>
                        <span>Selected date</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-secondary rounded"></div>
                        <span>Today</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Date Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedDate 
                        ? format(selectedDate, 'MMMM d, yyyy')
                        : 'Select a Date'
                      }
                    </CardTitle>
                    <CardDescription>
                      {selectedDate 
                        ? 'Performance details for this date'
                        : 'Click on any date in the calendar to view details'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedDate && selectedMonthData ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600 mb-1">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(selectedMonthData.revenue)}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 mb-1">Bookings</p>
                            <p className="text-xl font-bold text-blue-700">
                              {selectedMonthData.bookings}
                            </p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 mb-1">Orders</p>
                            <p className="text-xl font-bold text-purple-700">
                              {selectedMonthData.orders}
                            </p>
                          </div>
                        </div>
                        
                        {selectedMonthData.bookings > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Bookings on this day:</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {rawData?.bookings
                                .filter(b => isSameDay(b.bookingDate, selectedDate))
                                .map((booking, i) => (
                                  <div key={i} className="text-xs p-2 bg-gray-50 rounded">
                                    <div className="font-medium">{booking.serviceName}</div>
                                    <div className="text-gray-500">
                                      {booking.customerName} • {formatCurrency(booking.totalAmount || 0)}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : selectedDate ? (
                      <div className="text-center py-8 text-gray-500">
                        No activity on this date
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Click on any date to see details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Monthly Trends View */}
            {selectedView === 'monthly' && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Monthly Trends - Full Year</CardTitle>
                  <CardDescription>Revenue, bookings and orders for all 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analytics.monthlyTrends.map((month, index) => {
                      const maxRevenue = Math.max(...analytics.monthlyTrends.map(m => m.revenue));
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium w-12">{month.month}</span>
                          <div className="flex-1 mx-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-right min-w-[180px]">
                            <div className="text-sm font-medium">{formatCurrency(month.revenue)}</div>
                            <div className="text-xs text-gray-500">
                              {month.bookings} bookings • {month.orders} orders
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Yearly Overview View */}
            {selectedView === 'yearly' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Yearly Summary</CardTitle>
                    <CardDescription>Annual performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <p className="text-sm text-primary mb-1">Total Revenue (Year to Date)</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatCurrency(analytics.overview.totalRevenue)}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-600 mb-1">Total Bookings</p>
                          <p className="text-xl font-bold text-blue-700">
                            {formatNumber(analytics.overview.totalBookings)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-purple-600 mb-1">Total Orders</p>
                          <p className="text-xl font-bold text-purple-700">
                            {formatNumber(analytics.overview.totalOrders)}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-600 mb-1">Average Order Value</p>
                        <p className="text-xl font-bold text-green-700">
                          {formatCurrency(analytics.overview.avgOrderValue)}
                        </p>
                      </div>

                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-600 mb-1">Total Customers</p>
                        <p className="text-xl font-bold text-orange-700">
                          {formatNumber(analytics.overview.totalCustomers)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Months</CardTitle>
                    <CardDescription>Highest revenue months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.monthlyTrends
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                        .map((month, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{month.month}</p>
                                <p className="text-xs text-gray-600">
                                  {month.bookings} bookings • {month.orders} orders
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(month.revenue)}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Branch Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Branch Performance</CardTitle>
                  <CardDescription>Revenue and performance by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.branchPerformance.map((branch, index) => {
                      const maxRevenue = Math.max(...analytics.branchPerformance.map(b => b.revenue));
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{branch.name}</span>
                              <span className="text-sm text-gray-600">{formatCurrency(branch.revenue)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-secondary h-2 rounded-full"
                                style={{ width: `${maxRevenue > 0 ? (branch.revenue / maxRevenue) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{branch.bookings} bookings • {branch.customers} customers</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Revenue breakdown by branch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.revenueByBranch.map((branch, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{branch.branch}</span>
                            <span className="text-sm text-gray-600">{formatCurrency(branch.revenue)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${branch.percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{branch.bookings} bookings</span>
                            <span>{branch.percentage.toFixed(1)}% of total</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Services */}
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
                <CardDescription>Most popular services across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.topServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(service.revenue)}</p>
                        <p className="text-xs text-green-600">
                          Avg: {formatCurrency(service.avgPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}