'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Calendar, Clock, User, ChevronLeft, ChevronRight, Settings, 
  RotateCcw, Grid3X3, Users, PlusCircle, X, DollarSign, CheckCircle, 
  Scissors, Phone, Mail, MapPin, FileText, CreditCard, Calculator, 
  AlertCircle, Receipt, Trash2, Plus, Minus, Download, Hash, 
  Building, Tag, Package, Smartphone, Wallet, FileCheck, Printer,
  Search, Filter, Banknote, Coins, Smartphone as Mobile, QrCode,
  CheckSquare, Percent, CalendarDays, ClipboardList
} from "lucide-react";
import { format, addDays, startOfDay, addMinutes, isSameDay, parseISO } from "date-fns";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Appointment {
  id: string | number;
  firebaseId?: string;
  customer: string;
  service: string;
  services?: string[];
  barber: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  status: string;
  phone: string;
  email: string;
  notes: string;
  source: string;
  branch: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  staffId?: string;
  staffRole?: string;
  serviceCategory?: string;
  pointsAwarded?: boolean;
  cardLast4Digits?: string;
  trnNumber?: string;
  teamMembers?: Array<{name: string, tip: number}>;
  products?: Array<{name: string, category: string, price: number, quantity: number}>;
  paymentMethods?: Array<'cash' | 'card' | 'check' | 'digital' | 'wallet'>;
  paymentAmounts?: {
    cash: number;
    card: number;
    check: number;
    digital: number;
    wallet: number;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  discount?: number;
  discountType?: 'fixed' | 'percentage';
  serviceTip?: number;
  serviceCharges?: number;
  tax?: number;
  servicePrice?: number;
  subtotal?: number;
  totalAmount?: number;
  taxAmount?: number;
  bookingNumber?: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialization: string[];
  branch: string;
  avatar: string;
  status: string;
  rating: number;
  createdAt: any;
  updatedAt: any;
}

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  duration: number;
  description: string;
  status: string;
  branchNames: string[];
  branches: string[];
  popularity: string;
  imageUrl: string;
  revenue: number;
  totalBookings: number;
  createdAt: any;
  updatedAt: any;
}

interface AdvancedCalendarProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onStatusChange: (appointmentId: string | number, newStatus: string) => void;
  onCreateBooking?: (barber: string, date: string, time: string) => void;
  staff?: StaffMember[];
  showFullDetails?: boolean;
  formatCurrency?: (amount: number) => string;
}

// INVOICE INTERFACES
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface PaymentMethod {
  type: 'cash' | 'card' | 'check' | 'digital' | 'wallet' | 'other';
  label: string;
  amount: number;
  details?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  trnNumber: string;
  service: string;
  services: string[];
  barber: string;
  serviceDate: string;
  serviceTime: string;
  duration: string;
  servicePrice: number;
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  tax: number;
  taxAmount: number;
  serviceTip: number;
  serviceCharges: number;
  totalAmount: number;
  cardLast4Digits: string;
  paymentMethods: PaymentMethod[];
  totalPaid: number;
  balanceDue: number;
  items: InvoiceItem[];
  notes: string;
  branch: string;
}

// PAYMENT METHOD ICONS
const PaymentMethodIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'cash':
      return <Banknote className="w-4 h-4" />;
    case 'card':
      return <CreditCard className="w-4 h-4" />;
    case 'check':
      return <FileCheck className="w-4 h-4" />;
    case 'digital':
      return <Mobile className="w-4 h-4" />;
    case 'wallet':
      return <Wallet className="w-4 h-4" />;
    default:
      return <Coins className="w-4 h-4" />;
  }
};

// PAYMENT METHOD COLORS
const getPaymentMethodColor = (type: string): string => {
  switch (type) {
    case 'cash': return 'bg-green-100 text-green-800 border-green-200';
    case 'card': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'check': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'digital': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'wallet': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// INVOICE GENERATION POPUP COMPONENT
const InvoiceGenerationPopup = ({ 
  appointment, 
  onClose,
  formatCurrency = (amount) => `AED ${amount.toFixed(2)}`
}: { 
  appointment: Appointment | null; 
  onClose: () => void;
  formatCurrency?: (amount: number) => string;
}) => {
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'company' | 'payment' | 'preview'>('details');
  
  // New state for company details
  const [companyDetails, setCompanyDetails] = useState({
    name: "MAN OF CAVE",
    address: "BASEMENT, NEAR TO CARRYFOUR, MARINA MALL",
    contact: "028766460",
    email: "manofcave2020@gmail.com",
    website: "www.manofcave.com",
    vatNo: "104943305300003",
    branch: "second branch"
  });
  
  // New state for services dropdown
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState<string | null>(null);
  const [searchService, setSearchService] = useState("");
  
  const generateInvoiceNumber = () => {
    return `INV-${Date.now().toString().slice(-8)}`;
  };
  
  useEffect(() => {
    if (appointment) {
      initializeInvoiceData();
      fetchServicesFromFirebase();
    }
  }, [appointment]);
  
  // Function to fetch services from Firebase
  const fetchServicesFromFirebase = async () => {
    try {
      const servicesRef = collection(db, "services");
      const q = query(servicesRef, where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
      
      const services: ServiceItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        services.push({
          id: doc.id,
          name: data.name || "",
          category: data.category || "",
          categoryId: data.categoryId || "",
          price: data.price || 0,
          duration: data.duration || 0,
          description: data.description || "",
          status: data.status || "active",
          branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
          branches: Array.isArray(data.branches) ? data.branches : [],
          popularity: data.popularity || "low",
          imageUrl: data.imageUrl || "",
          revenue: data.revenue || 0,
          totalBookings: data.totalBookings || 0,
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date()
        });
      });
      
      setServicesList(services);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };
  
  const initializeInvoiceData = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      let freshData = appointment;
      if (appointment.firebaseId) {
        const bookingRef = doc(db, "bookings", appointment.firebaseId);
        const bookingSnap = await getDoc(bookingRef);
        
        if (bookingSnap.exists()) {
          const firebaseData = bookingSnap.data();
          
          // Extract payment methods and amounts from Firebase
          const paymentAmounts = firebaseData.paymentAmounts || {};
          const paymentMethods: PaymentMethod[] = [];
          
          // Map payment amounts to payment methods
          if (paymentAmounts.cash && paymentAmounts.cash > 0) {
            paymentMethods.push({
              type: 'cash',
              label: 'Cash',
              amount: paymentAmounts.cash || 0
            });
          }
          
          if (paymentAmounts.card && paymentAmounts.card > 0) {
            paymentMethods.push({
              type: 'card',
              label: 'Credit/Debit Card',
              amount: paymentAmounts.card || 0,
              details: firebaseData.cardLast4Digits ? `Card ending in ${firebaseData.cardLast4Digits}` : ''
            });
          }
          
          if (paymentAmounts.check && paymentAmounts.check > 0) {
            paymentMethods.push({
              type: 'check',
              label: 'Bank Check',
              amount: paymentAmounts.check || 0
            });
          }
          
          if (paymentAmounts.digital && paymentAmounts.digital > 0) {
            paymentMethods.push({
              type: 'digital',
              label: 'Digital Payment',
              amount: paymentAmounts.digital || 0
            });
          }
          
          if (paymentAmounts.wallet && paymentAmounts.wallet > 0) {
            paymentMethods.push({
              type: 'wallet',
              label: 'E-Wallet',
              amount: paymentAmounts.wallet || 0
            });
          }
          
          freshData = {
            ...appointment,
            servicePrice: firebaseData.servicePrice || 0,
            subtotal: firebaseData.subtotal || firebaseData.servicePrice || 0,
            totalAmount: firebaseData.totalAmount || firebaseData.servicePrice || 0,
            taxAmount: firebaseData.taxAmount || 0,
            serviceCharges: firebaseData.serviceCharges || 0,
            discount: firebaseData.discount || 0,
            discountType: firebaseData.discountType || 'fixed',
            tax: firebaseData.tax || 5,
            cardLast4Digits: firebaseData.cardLast4Digits || '',
            trnNumber: firebaseData.trnNumber || '',
            teamMembers: firebaseData.teamMembers || [],
            products: firebaseData.products || [],
            paymentMethod: firebaseData.paymentMethod || '',
            paymentStatus: firebaseData.paymentStatus || '',
            paymentMethods: firebaseData.paymentMethods || [],
            paymentAmounts: paymentAmounts
          };
        }
      }
      
      const initialInvoice: InvoiceData = {
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toISOString().split('T')[0],
        customerName: freshData.customer,
        customerEmail: freshData.email || '',
        customerPhone: freshData.phone || '',
        customerAddress: `${freshData.branch || ''}, Dubai, UAE`,
        trnNumber: freshData.trnNumber || '',
        service: freshData.service,
        services: freshData.services || [freshData.service],
        barber: freshData.barber,
        serviceDate: freshData.date,
        serviceTime: freshData.time,
        duration: freshData.duration,
        servicePrice: freshData.servicePrice || freshData.price || 0,
        subtotal: freshData.subtotal || freshData.servicePrice || freshData.price || 0,
        discount: freshData.discount || 0,
        discountType: freshData.discountType || 'fixed',
        tax: freshData.tax || 5,
        taxAmount: freshData.taxAmount || 0,
        serviceTip: freshData.serviceTip || 0,
        serviceCharges: freshData.serviceCharges || 0,
        totalAmount: freshData.totalAmount || freshData.price || freshData.servicePrice || 0,
        cardLast4Digits: freshData.cardLast4Digits || '',
        paymentMethods: [],
        totalPaid: 0,
        balanceDue: freshData.totalAmount || freshData.price || freshData.servicePrice || 0,
        items: [],
        notes: freshData.notes || '',
        branch: freshData.branch || 'Main Branch'
      };
      
      const items: InvoiceItem[] = [];
      
      // Add main service
      items.push({
        id: 'service-1',
        description: freshData.service,
        quantity: 1,
        price: freshData.servicePrice || freshData.price || 0,
        total: freshData.servicePrice || freshData.price || 0
      });
      
      // Add products if any
      if (freshData.products && freshData.products.length > 0) {
        freshData.products.forEach((product, index) => {
          items.push({
            id: `product-${index}`,
            description: product.name,
            quantity: product.quantity,
            price: product.price,
            total: product.price * product.quantity
          });
        });
      }
      
      // Initialize payment methods from Firebase data
      const paymentMethods: PaymentMethod[] = [];
      
      if (freshData.paymentAmounts) {
        const paymentLabels = {
          cash: 'Cash',
          card: 'Credit/Debit Card',
          check: 'Bank Check',
          digital: 'Digital Payment',
          wallet: 'E-Wallet'
        };
        
        Object.entries(freshData.paymentAmounts).forEach(([method, amount]) => {
          if (amount > 0) {
            paymentMethods.push({
              type: method as 'cash' | 'card' | 'check' | 'digital' | 'wallet',
              label: paymentLabels[method as keyof typeof paymentLabels] || method,
              amount: amount,
              details: method === 'card' && freshData.cardLast4Digits 
                ? `Card ending in ${freshData.cardLast4Digits}` 
                : ''
            });
          }
        });
      }
      
      // Calculate totals
      const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = initialInvoice.discountType === 'fixed' 
        ? initialInvoice.discount 
        : (subtotal * initialInvoice.discount / 100);
      const taxableAmount = subtotal - (initialInvoice.discountType === 'fixed' ? initialInvoice.discount : 0);
      const taxAmount = (taxableAmount * initialInvoice.tax) / 100;
      const totalAmount = subtotal - discountAmount + taxAmount + initialInvoice.serviceTip + initialInvoice.serviceCharges;
      
      setInvoiceData({
        ...initialInvoice,
        items,
        paymentMethods,
        subtotal,
        taxAmount,
        totalAmount,
        totalPaid,
        balanceDue: totalAmount - totalPaid
      });
      
    } catch (error) {
      console.error("Error initializing invoice:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to add service from dropdown
  const addServiceFromList = (service: ServiceItem) => {
    if (!invoiceData) return;
    
    const newItem: InvoiceItem = {
      id: `service-${Date.now()}`,
      description: service.name,
      quantity: 1,
      price: service.price || 0,
      total: service.price || 0
    };
    
    handleInputChange('items', [...invoiceData.items, newItem]);
    setShowServicesDropdown(null);
  };
  
  // Function to handle company details change
  const handleCompanyDetailsChange = (field: keyof typeof companyDetails, value: string) => {
    setCompanyDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleInputChange = (field: keyof InvoiceData, value: any) => {
    if (!invoiceData) return;
    
    setInvoiceData(prev => {
      if (!prev) return prev;
      
      const updated = { ...prev, [field]: value };
      
      if (['items', 'discount', 'discountType', 'tax', 'serviceTip', 'serviceCharges'].includes(field)) {
        return recalculateInvoice(updated);
      }
      
      return updated;
    });
  };
  
  const recalculateInvoice = (data: InvoiceData): InvoiceData => {
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = data.discountType === 'fixed' 
      ? data.discount 
      : (subtotal * data.discount / 100);
    const taxableAmount = subtotal - (data.discountType === 'fixed' ? data.discount : 0);
    const taxAmount = (taxableAmount * data.tax) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount + data.serviceTip + data.serviceCharges;
    const totalPaid = data.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    
    return {
      ...data,
      subtotal,
      taxAmount,
      totalAmount,
      totalPaid,
      balanceDue: totalAmount - totalPaid
    };
  };
  
  // Modified addInvoiceItem function to show services dropdown
  const addInvoiceItem = () => {
    setShowServicesDropdown('add');
  };
  
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    if (!invoiceData) return;
    
    const updatedItems = invoiceData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        return updatedItem;
      }
      return item;
    });
    
    handleInputChange('items', updatedItems);
  };
  
  const removeItem = (id: string) => {
    if (!invoiceData) return;
    
    handleInputChange('items', invoiceData.items.filter(item => item.id !== id));
  };
  
  const addPaymentMethod = () => {
    if (!invoiceData) return;
    
    const newPayment: PaymentMethod = {
      type: 'other',
      label: 'Other Payment',
      amount: 0,
      details: ''
    };
    
    handleInputChange('paymentMethods', [...invoiceData.paymentMethods, newPayment]);
  };
  
  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: any) => {
    if (!invoiceData) return;
    
    const updatedPayments = [...invoiceData.paymentMethods];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    
    handleInputChange('paymentMethods', updatedPayments);
  };
  
  const removePaymentMethod = (index: number) => {
    if (!invoiceData) return;
    
    handleInputChange('paymentMethods', invoiceData.paymentMethods.filter((_, i) => i !== index));
  };
  
  const generatePDF = () => {
    if (!invoiceData) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    
    // Use company details from state
    doc.setFontSize(24);
    doc.setTextColor(0, 51, 102);
    doc.setFont("helvetica", "bold");
    doc.text(companyDetails.name, margin, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(companyDetails.address, margin, 28);
    doc.text(`Contact: ${companyDetails.contact} | Email: ${companyDetails.email}`, margin, 33);
    doc.text(`Website: ${companyDetails.website} | VAT No: ${companyDetails.vatNo}`, margin, 38);
    
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text('TAX INVOICE', pageWidth - margin - 60, 20);
    
    doc.setFontSize(10);
    doc.text(`(Branch: ${companyDetails.branch})`, pageWidth - margin - 70, 28);
    
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(margin, 45, pageWidth - margin, 45);
    
    const infoY = 55;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text('Invoice Details:', margin, infoY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, margin, infoY + 7);
    doc.text(`Invoice Date: ${invoiceData.invoiceDate}`, margin, infoY + 13);
    doc.text(`Service Date: ${invoiceData.serviceDate}`, margin, infoY + 19);
    doc.text(`Service Time: ${invoiceData.serviceTime}`, margin, infoY + 25);
    
    doc.setFont("helvetica", "bold");
    doc.text('Customer Information:', pageWidth - margin - 100, infoY);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${invoiceData.customerName}`, pageWidth - margin - 100, infoY + 7);
    doc.text(`Phone: ${invoiceData.customerPhone}`, pageWidth - margin - 100, infoY + 13);
    doc.text(`Email: ${invoiceData.customerEmail}`, pageWidth - margin - 100, infoY + 19);
    doc.text(`Address: ${invoiceData.customerAddress}`, pageWidth - margin - 100, infoY + 25);
    if (invoiceData.trnNumber) {
      doc.text(`TRN: ${invoiceData.trnNumber}`, pageWidth - margin - 100, infoY + 31);
    }
    
    const serviceY = infoY + 40;
    doc.setFont("helvetica", "bold");
    doc.text('Service Details:', margin, serviceY);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Service: ${invoiceData.service}`, margin, serviceY + 7);
    doc.text(`Barber: ${invoiceData.barber}`, margin, serviceY + 13);
    doc.text(`Duration: ${invoiceData.duration}`, margin, serviceY + 19);
    
    const tableY = serviceY + 30;
    
    const headers = [['Description', 'Quantity', 'Unit Price', 'Total']];
    const columnWidths = [100, 30, 30, 30];
    
    const tableData = invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.total)
    ]);
    
    if (invoiceData.serviceCharges > 0) {
      tableData.push(['Service Charges', '1', formatCurrency(invoiceData.serviceCharges), formatCurrency(invoiceData.serviceCharges)]);
    }
    
    if (invoiceData.serviceTip > 0) {
      tableData.push(['Service Tip', '1', formatCurrency(invoiceData.serviceTip), formatCurrency(invoiceData.serviceTip)]);
    }
    
    autoTable(doc, {
      startY: tableY,
      head: headers,
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 102], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1], halign: 'center' },
        2: { cellWidth: columnWidths[2], halign: 'right' },
        3: { cellWidth: columnWidths[3], halign: 'right' }
      }
    });
    
    const summaryY = (doc as any).lastAutoTable.finalY + 10;
    
    // Payment Methods Section
    doc.setFont("helvetica", "bold");
    doc.text('Payment Methods:', margin, summaryY);
    
    let paymentY = summaryY + 7;
    invoiceData.paymentMethods.forEach(payment => {
      doc.setFont("helvetica", "normal");
      doc.text(`${payment.label}: ${formatCurrency(payment.amount)}`, margin + 5, paymentY);
      if (payment.details) {
        doc.text(`  ${payment.details}`, margin + 10, paymentY + 4);
        paymentY += 8;
      } else {
        paymentY += 6;
      }
    });
    
    if (invoiceData.cardLast4Digits) {
      doc.text(`Card Last 4 Digits: ****${invoiceData.cardLast4Digits}`, margin, paymentY);
      paymentY += 6;
    }
    
    const summaryRightX = pageWidth - margin - 80;
    doc.setFillColor(240, 240, 240);
    doc.rect(summaryRightX - 10, summaryY - 5, 90, 90, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text('Price Summary:', summaryRightX, summaryY);
    
    let summaryYPos = summaryY + 8;
    doc.setFont("helvetica", "normal");
    
    doc.text(`Subtotal: ${formatCurrency(invoiceData.subtotal)}`, summaryRightX, summaryYPos);
    summaryYPos += 6;
    
    if (invoiceData.discount > 0) {
      const discountText = invoiceData.discountType === 'fixed' 
        ? `Discount: -${formatCurrency(invoiceData.discount)}`
        : `Discount (${invoiceData.discount}%): -${formatCurrency((invoiceData.subtotal * invoiceData.discount) / 100)}`;
      doc.text(discountText, summaryRightX, summaryYPos);
      summaryYPos += 6;
    }
    
    doc.text(`Tax (${invoiceData.tax}%): ${formatCurrency(invoiceData.taxAmount)}`, summaryRightX, summaryYPos);
    summaryYPos += 6;
    
    if (invoiceData.serviceCharges > 0 && !invoiceData.items.some(item => item.description.includes('Service Charges'))) {
      doc.text(`Service Charges: ${formatCurrency(invoiceData.serviceCharges)}`, summaryRightX, summaryYPos);
      summaryYPos += 6;
    }
    
    if (invoiceData.serviceTip > 0 && !invoiceData.items.some(item => item.description.includes('Service Tip'))) {
      doc.text(`Service Tip: ${formatCurrency(invoiceData.serviceTip)}`, summaryRightX, summaryYPos);
      summaryYPos += 6;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatCurrency(invoiceData.totalAmount)}`, summaryRightX, summaryYPos);
    summaryYPos += 8;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Total Paid: ${formatCurrency(invoiceData.totalPaid)}`, summaryRightX, summaryYPos);
    summaryYPos += 6;
    doc.text(`Balance Due: ${formatCurrency(invoiceData.balanceDue)}`, summaryRightX, summaryYPos);
    
    const notesY = summaryY + 95;
    if (invoiceData.notes) {
      doc.setFont("helvetica", "bold");
      doc.text('Additional Notes:', margin, notesY);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin);
      doc.text(splitNotes, margin, notesY + 6);
    }
    
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('**** THANK YOU FOR YOUR BUSINESS ****', pageWidth / 2, footerY, { align: 'center' });
    
    doc.save(`Invoice-${invoiceData.invoiceNumber}-${invoiceData.customerName}.pdf`);
    
    alert(`Invoice ${invoiceData.invoiceNumber} downloaded successfully!`);
  };
  
  if (!appointment || !invoiceData) return null;
  
  // Filter services based on search
  const filteredServices = servicesList.filter(service =>
    service.name.toLowerCase().includes(searchService.toLowerCase()) ||
    service.category.toLowerCase().includes(searchService.toLowerCase())
  );
  
  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-5xl overflow-y-auto mt-6 p-6 rounded-4xl">
        <SheetHeader className="border-b pb-4 mb-6">
          <SheetTitle className="flex items-center gap-3 text-2xl">
            <Receipt className="w-6 h-6 text-primary" />
            Generate Invoice
            <Badge className="bg-green-600">Advance Calendar</Badge>
          </SheetTitle>
          <SheetDescription>
            Edit invoice details and generate professional PDF
          </SheetDescription>
        </SheetHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invoice data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b">
              <div className="flex space-x-4 overflow-x-auto">
                <Button
                  variant={activeTab === 'details' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('details')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <User className="w-4 h-4" />
                  Customer
                </Button>
                <Button
                  variant={activeTab === 'items' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('items')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Package className="w-4 h-4" />
                  Items
                </Button>
                <Button
                  variant={activeTab === 'company' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('company')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Building className="w-4 h-4" />
                  Company
                </Button>
                <Button
                  variant={activeTab === 'payment' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('payment')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  Payment
                </Button>
                <Button
                  variant={activeTab === 'preview' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('preview')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <FileCheck className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Customer Information
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Customer Name *</Label>
                          <Input
                            value={invoiceData.customerName}
                            onChange={(e) => handleInputChange('customerName', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Phone *</Label>
                            <Input
                              value={invoiceData.customerPhone}
                              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={invoiceData.customerEmail}
                              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Address</Label>
                          <Input
                            value={invoiceData.customerAddress}
                            onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                            placeholder="Enter customer address"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="flex items-center gap-2">
                              <Hash className="w-4 h-4" />
                              TRN Number
                            </Label>
                            <Input
                              value={invoiceData.trnNumber}
                              onChange={(e) => handleInputChange('trnNumber', e.target.value)}
                              placeholder="Enter TRN number"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Card Last 4 Digits
                            </Label>
                            <Input
                              value={invoiceData.cardLast4Digits}
                              onChange={(e) => handleInputChange('cardLast4Digits', e.target.value)}
                              maxLength={4}
                              placeholder="1234"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Service Information
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Service *</Label>
                          <Input
                            value={invoiceData.service}
                            onChange={(e) => handleInputChange('service', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Barber *</Label>
                            <Input
                              value={invoiceData.barber}
                              onChange={(e) => handleInputChange('barber', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Branch</Label>
                            <Input
                              value={invoiceData.branch}
                              onChange={(e) => handleInputChange('branch', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Service Date</Label>
                            <Input
                              type="date"
                              value={invoiceData.serviceDate}
                              onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Service Time</Label>
                            <Input
                              type="time"
                              value={invoiceData.serviceTime}
                              onChange={(e) => handleInputChange('serviceTime', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Duration</Label>
                          <Input
                            value={invoiceData.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Pricing & Charges
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Tax (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={invoiceData.tax}
                          onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Discount</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={invoiceData.discount}
                            onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                          />
                          <Select 
                            value={invoiceData.discountType} 
                            onValueChange={(value) => handleInputChange('discountType', value as any)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">AED</SelectItem>
                              <SelectItem value="percentage">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Service Tip (AED)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={invoiceData.serviceTip}
                          onChange={(e) => handleInputChange('serviceTip', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Service Charges (AED)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={invoiceData.serviceCharges}
                            onChange={(e) => handleInputChange('serviceCharges', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={invoiceData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Enter any additional notes or terms..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'items' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Invoice Items
                      </h3>
                      <div className="relative">
                        <Button onClick={addInvoiceItem} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Item
                        </Button>
                        
                        {/* Services Dropdown */}
                        {showServicesDropdown === 'add' && (
                          <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                            <div className="p-3 border-b">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-lg">Select Service</h4>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setShowServicesDropdown(null)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">Select from Firebase services collection</p>
                              
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                  placeholder="Search services..."
                                  value={searchService}
                                  onChange={(e) => setSearchService(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            
                            {servicesList.length === 0 ? (
                              <div className="p-8 text-center">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No services found</p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={fetchServicesFromFirebase}
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  Refresh Services
                                </Button>
                              </div>
                            ) : (
                              <div className="divide-y max-h-64 overflow-y-auto">
                                {filteredServices.map((service) => (
                                  <div 
                                    key={service.id}
                                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => addServiceFromList(service)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                            <Scissors className="w-5 h-5 text-blue-600" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-900">{service.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Badge variant="outline" className="text-xs">
                                                {service.category}
                                              </Badge>
                                              <span className="text-xs text-gray-500">{service.duration} min</span>
                                              {service.popularity === 'high' && (
                                                <Badge className="bg-orange-100 text-orange-800 text-xs">
                                                  Popular
                                                </Badge>
                                              )}
                                            </div>
                                            {service.description && (
                                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {service.branchNames && service.branchNames.length > 0 && (
                                          <div className="mt-2 ml-13">
                                            <div className="flex items-center gap-1 mb-1">
                                              <Building className="w-3 h-3 text-gray-400" />
                                              <span className="text-xs text-gray-500">Available at:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {service.branchNames.slice(0, 3).map((branch: string, idx: number) => (
                                                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                  {branch}
                                                </span>
                                              ))}
                                              {service.branchNames.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                  +{service.branchNames.length - 3} more
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right ml-4">
                                        <p className="font-bold text-lg text-green-600">{formatCurrency(service.price)}</p>
                                        <Button 
                                          size="sm" 
                                          className="mt-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addServiceFromList(service);
                                          }}
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="p-3 border-t bg-gray-50">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  {filteredServices.length} services found
                                </span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Add custom item option
                                    const newItem: InvoiceItem = {
                                      id: `custom-${Date.now()}`,
                                      description: 'Custom Item',
                                      quantity: 1,
                                      price: 0,
                                      total: 0
                                    };
                                    handleInputChange('items', [...invoiceData.items, newItem]);
                                    setShowServicesDropdown(null);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Custom Item
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {invoiceData.items.map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Item #{index + 1}</h4>
                              {item.id.startsWith('service-') && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  From Services
                                </Badge>
                              )}
                              {item.id.startsWith('custom-') && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {item.id.startsWith('service-') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Show services dropdown for this item to change service
                                    setShowServicesDropdown(item.id);
                                    setSearchService("");
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  Change Service
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Service Selection Dropdown for specific item */}
                          {showServicesDropdown === item.id && (
                            <div className="mb-4 p-4 bg-white border border-blue-300 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-semibold text-lg">Change Service</h5>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setShowServicesDropdown(null)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                  placeholder="Search services..."
                                  value={searchService}
                                  onChange={(e) => setSearchService(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                              
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {filteredServices.map((service) => (
                                  <div 
                                    key={service.id}
                                    className="p-3 hover:bg-gray-100 rounded border cursor-pointer"
                                    onClick={() => {
                                      updateItem(item.id, 'description', service.name);
                                      updateItem(item.id, 'price', service.price || 0);
                                      updateItem(item.id, 'total', service.price || 0);
                                      setShowServicesDropdown(null);
                                      setSearchService("");
                                    }}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <span className="font-medium">{service.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs text-gray-500">{service.category}</span>
                                          <span className="text-xs text-gray-500">•</span>
                                          <span className="text-xs text-gray-500">{service.duration} min</span>
                                        </div>
                                      </div>
                                      <span className="font-semibold text-green-600">{formatCurrency(service.price)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="mt-3 pt-3 border-t">
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => {
                                    setShowServicesDropdown(null);
                                    setSearchService("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label>Description *</Label>
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                placeholder="Item description"
                              />
                            </div>
                            
                            <div>
                              <Label>Quantity *</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            
                            <div>
                              <Label>Unit Price (AED) *</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            
                            <div>
                              <Label>Total (AED)</Label>
                              <div className="p-2 bg-white border rounded text-center font-semibold">
                                {formatCurrency(item.total)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {invoiceData.items.length === 0 && (
                        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h4 className="text-lg font-medium text-gray-700">No items added</h4>
                          <p className="text-gray-500 mb-4">Click "Add Item" to add services or products</p>
                          <Button onClick={addInvoiceItem} className="flex items-center gap-2 mx-auto">
                            <Plus className="w-4 h-4" />
                            Add Your First Item
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Services Available Info */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-blue-800">Available Services ({servicesList.length})</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={fetchServicesFromFirebase}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Refresh
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={addInvoiceItem}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Service
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Services are loaded from Firebase "services" collection. Click "Add Item" to select.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {servicesList.slice(0, 4).map((service) => (
                          <div 
                            key={service.id} 
                            className="text-xs bg-white border border-blue-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors min-w-[180px]"
                            onClick={() => addServiceFromList(service)}
                          >
                            <div className="font-medium">{service.name}</div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-gray-600">{service.category}</span>
                              <span className="font-bold text-green-600">{formatCurrency(service.price)}</span>
                            </div>
                          </div>
                        ))}
                        {servicesList.length > 4 && (
                          <div 
                            className="text-xs bg-white border border-blue-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-center min-w-[180px]"
                            onClick={addInvoiceItem}
                          >
                            <div className="text-center">
                              <Plus className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                              <span className="text-blue-600 font-medium">
                                +{servicesList.length - 4} more services
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Summary Section */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(invoiceData.subtotal)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Tax ({invoiceData.tax}%)</p>
                          <p className="text-xl font-semibold text-red-600">
                            {formatCurrency(invoiceData.taxAmount)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-3xl font-bold text-green-700">
                            {formatCurrency(invoiceData.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Company Details Tab */}
                {activeTab === 'company' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Company Information (Editable)
                      </h3>
                      <p className="text-sm text-gray-600">
                        These details will appear on the generated invoice PDF. Client can edit as needed.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Company Name *</Label>
                            <Input
                              value={companyDetails.name}
                              onChange={(e) => handleCompanyDetailsChange('name', e.target.value)}
                              placeholder="Company name"
                            />
                          </div>
                          
                          <div>
                            <Label>Address *</Label>
                            <Textarea
                              value={companyDetails.address}
                              onChange={(e) => handleCompanyDetailsChange('address', e.target.value)}
                              placeholder="Full address"
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <Label>Contact Number *</Label>
                            <Input
                              value={companyDetails.contact}
                              onChange={(e) => handleCompanyDetailsChange('contact', e.target.value)}
                              placeholder="Contact number"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label>Email Address *</Label>
                            <Input
                              type="email"
                              value={companyDetails.email}
                              onChange={(e) => handleCompanyDetailsChange('email', e.target.value)}
                              placeholder="Email address"
                            />
                          </div>
                          
                          <div>
                            <Label>Website</Label>
                            <Input
                              value={companyDetails.website}
                              onChange={(e) => handleCompanyDetailsChange('website', e.target.value)}
                              placeholder="Website URL"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>VAT Number</Label>
                              <Input
                                value={companyDetails.vatNo}
                                onChange={(e) => handleCompanyDetailsChange('vatNo', e.target.value)}
                                placeholder="VAT number"
                              />
                            </div>
                            <div>
                              <Label>Branch</Label>
                              <Input
                                value={companyDetails.branch}
                                onChange={(e) => handleCompanyDetailsChange('branch', e.target.value)}
                                placeholder="Branch name"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          PDF Preview Header
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-bold text-lg text-blue-900">{companyDetails.name}</p>
                          <p className="text-gray-700">{companyDetails.address}</p>
                          <p className="text-gray-700">Contact: {companyDetails.contact} | Email: {companyDetails.email}</p>
                          <p className="text-gray-700">Website: {companyDetails.website} | VAT No: {companyDetails.vatNo}</p>
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="font-semibold text-blue-900">TAX INVOICE (Branch: {companyDetails.branch})</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800">Note</h4>
                            <p className="text-sm text-yellow-700">
                              These company details are only for this invoice. Changes here won't affect other invoices or system settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Methods
                      </h3>
                      <Button onClick={addPaymentMethod} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Payment
                      </Button>
                    </div>
                    
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <ClipboardList className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Payment Summary</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(invoiceData.totalAmount)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Paid</p>
                          <p className="text-xl font-semibold text-green-600">
                            {formatCurrency(invoiceData.totalPaid)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Balance Due</p>
                          <p className={`text-2xl font-bold ${invoiceData.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(invoiceData.balanceDue)}
                          </p>
                        </div>
                      </div>
                      
                      {invoiceData.balanceDue < 0 && (
                        <div className="mt-3 text-center text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          ⚠️ Overpayment detected
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {invoiceData.paymentMethods.map((payment, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getPaymentMethodColor(payment.type)} px-3 py-1 flex items-center gap-2`}>
                                <PaymentMethodIcon type={payment.type} />
                                {payment.type.toUpperCase()}
                              </Badge>
                              <h4 className="font-medium">Payment #{index + 1}</h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePaymentMethod(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label>Payment Type</Label>
                              <Select
                                value={payment.type}
                                onValueChange={(value) => updatePaymentMethod(index, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">
                                    <div className="flex items-center gap-2">
                                      <Banknote className="w-4 h-4" />
                                      Cash
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="card">
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="w-4 h-4" />
                                      Card
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="check">
                                    <div className="flex items-center gap-2">
                                      <FileCheck className="w-4 h-4" />
                                      Check
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="digital">
                                    <div className="flex items-center gap-2">
                                      <Mobile className="w-4 h-4" />
                                      Digital
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="wallet">
                                    <div className="flex items-center gap-2">
                                      <Wallet className="w-4 h-4" />
                                      E-Wallet
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="other">
                                    <div className="flex items-center gap-2">
                                      <Coins className="w-4 h-4" />
                                      Other
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Label / Description</Label>
                              <Input
                                value={payment.label}
                                onChange={(e) => updatePaymentMethod(index, 'label', e.target.value)}
                                placeholder="e.g., Cash Payment"
                              />
                            </div>
                            
                            <div>
                              <Label>Amount (AED) *</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={payment.amount}
                                onChange={(e) => updatePaymentMethod(index, 'amount', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          
                          {payment.type === 'card' && (
                            <div className="mt-3">
                              <Label>Card Details (Optional)</Label>
                              <Input
                                value={payment.details || ''}
                                onChange={(e) => updatePaymentMethod(index, 'details', e.target.value)}
                                placeholder="e.g., Card ending in 1234"
                              />
                            </div>
                          )}
                          
                          {payment.type === 'other' && (
                            <div className="mt-3">
                              <Label>Payment Details</Label>
                              <Input
                                value={payment.details || ''}
                                onChange={(e) => updatePaymentMethod(index, 'details', e.target.value)}
                                placeholder="Enter payment details"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {invoiceData.paymentMethods.length === 0 && (
                        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h4 className="text-lg font-medium text-gray-700">No payment methods added</h4>
                          <p className="text-gray-500 mb-4">Click "Add Payment" to add payment methods</p>
                          <Button onClick={addPaymentMethod} className="flex items-center gap-2 mx-auto">
                            <Plus className="w-4 h-4" />
                            Add Your First Payment Method
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'preview' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Invoice Preview</h3>
                        <p className="text-gray-600">This is how your invoice will look in PDF</p>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Company Header */}
                        <div className="bg-blue-900 text-white p-4 rounded-t-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-2xl font-bold">{companyDetails.name}</h2>
                              <p className="text-sm opacity-90">TAX INVOICE (Branch: {companyDetails.branch})</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{invoiceData.invoiceNumber}</p>
                              <p className="text-sm">{invoiceData.invoiceDate}</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs opacity-80">
                            <p>{companyDetails.address}</p>
                            <p>Contact: {companyDetails.contact} | Email: {companyDetails.email}</p>
                            <p>Website: {companyDetails.website} | VAT No: {companyDetails.vatNo}</p>
                          </div>
                        </div>
                        
                        {/* Customer and Service Info */}
                        <div className="p-4 border border-t-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-bold mb-2">Bill To:</h4>
                              <p className="font-medium">{invoiceData.customerName}</p>
                              <p className="text-sm">{invoiceData.customerPhone}</p>
                              <p className="text-sm">{invoiceData.customerEmail}</p>
                              <p className="text-sm">{invoiceData.customerAddress}</p>
                              {invoiceData.trnNumber && (
                                <p className="text-sm">TRN: {invoiceData.trnNumber}</p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold mb-2">Service Details:</h4>
                              <p><span className="font-medium">Service:</span> {invoiceData.service}</p>
                              <p><span className="font-medium">Barber:</span> {invoiceData.barber}</p>
                              <p><span className="font-medium">Date:</span> {invoiceData.serviceDate}</p>
                              <p><span className="font-medium">Time:</span> {invoiceData.serviceTime}</p>
                              <p><span className="font-medium">Branch:</span> {invoiceData.branch}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Items Table */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-100 grid grid-cols-12 p-3 font-bold text-sm">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Unit Price</div>
                            <div className="col-span-2 text-right">Total</div>
                          </div>
                          
                          {invoiceData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 p-3 border-t text-sm">
                              <div className="col-span-6">{item.description}</div>
                              <div className="col-span-2 text-center">{item.quantity}</div>
                              <div className="col-span-2 text-right">{formatCurrency(item.price)}</div>
                              <div className="col-span-2 text-right font-medium">{formatCurrency(item.total)}</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Payment Methods */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-bold mb-3 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Methods:
                          </h4>
                          <div className="space-y-2">
                            {invoiceData.paymentMethods.map((payment, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-white border rounded">
                                <div className="flex items-center gap-3">
                                  <PaymentMethodIcon type={payment.type} />
                                  <div>
                                    <p className="font-medium">{payment.label}</p>
                                    {payment.details && (
                                      <p className="text-xs text-gray-600">{payment.details}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold text-green-700">{formatCurrency(payment.amount)}</span>
                              </div>
                            ))}
                          </div>
                          {invoiceData.cardLast4Digits && (
                            <div className="text-sm text-gray-600 mt-2">
                              Card: ****{invoiceData.cardLast4Digits}
                            </div>
                          )}
                        </div>
                        
                        {/* Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>{formatCurrency(invoiceData.subtotal)}</span>
                            </div>
                            
                            {invoiceData.discount > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span>
                                  Discount{invoiceData.discountType === 'percentage' ? ` (${invoiceData.discount}%)` : ''}:
                                </span>
                                <span>-{formatCurrency(
                                  invoiceData.discountType === 'fixed' 
                                    ? invoiceData.discount 
                                    : (invoiceData.subtotal * invoiceData.discount / 100)
                                )}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between">
                              <span>Tax ({invoiceData.tax}%):</span>
                              <span>{formatCurrency(invoiceData.taxAmount)}</span>
                            </div>
                            
                            {invoiceData.serviceCharges > 0 && (
                              <div className="flex justify-between">
                                <span>Service Charges:</span>
                                <span>{formatCurrency(invoiceData.serviceCharges)}</span>
                              </div>
                            )}
                            
                            {invoiceData.serviceTip > 0 && (
                              <div className="flex justify-between">
                                <span>Service Tip:</span>
                                <span>{formatCurrency(invoiceData.serviceTip)}</span>
                              </div>
                            )}
                            
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total Amount:</span>
                                <span>{formatCurrency(invoiceData.totalAmount)}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Total Paid:</span>
                              <span className="text-green-600">{formatCurrency(invoiceData.totalPaid)}</span>
                            </div>
                            
                            <div className="flex justify-between font-medium">
                              <span>Balance Due:</span>
                              <span className={invoiceData.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                                {formatCurrency(invoiceData.balanceDue)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {invoiceData.notes && (
                          <div className="border-t pt-4">
                            <h4 className="font-bold mb-2">Notes:</h4>
                            <p className="text-sm italic">{invoiceData.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <SheetFooter className="border-t pt-6">
                <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Save both invoice data and company details
                        alert('Invoice and company details saved as draft!');
                      }}
                    >
                      Save Draft
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.print()}
                      className="flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print Preview
                    </Button>
                    
                    <Button 
                      onClick={generatePDF}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      Generate PDF Invoice
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  };
  
  // ADVANCE CALENDAR POPUP COMPONENT
  const AdvanceCalendarPopup = ({ 
    appointment, 
    onClose,
    onStatusChange,
    onGenerateInvoice,
    formatCurrency = (amount) => `AED ${amount.toFixed(2)}`
  }: { 
    appointment: Appointment | null; 
    onClose: () => void;
    onStatusChange?: (appointmentId: string | number, newStatus: string) => void;
    onGenerateInvoice?: (appointment: Appointment) => void;
    formatCurrency?: (amount: number) => string;
  }) => {
    const [loading, setLoading] = useState(false);
    const [freshAppointment, setFreshAppointment] = useState<Appointment | null>(null);
    const [paymentDetails, setPaymentDetails] = useState<{
      methods: PaymentMethod[];
      totalPaid: number;
      balanceDue: number;
      paymentStatus: string;
      paymentMethod: string;
    }>({
      methods: [],
      totalPaid: 0,
      balanceDue: 0,
      paymentStatus: '',
      paymentMethod: ''
    });
    
    useEffect(() => {
      if (appointment?.firebaseId) {
        fetchFreshData();
      }
    }, [appointment]);
    
    const fetchFreshData = async () => {
      if (!appointment?.firebaseId) return;
      
      setLoading(true);
      try {
        const bookingRef = doc(db, "bookings", appointment.firebaseId);
        const bookingSnap = await getDoc(bookingRef);
        
        if (bookingSnap.exists()) {
          const firebaseData = bookingSnap.data();
          
          // Extract payment details from Firebase
          const paymentAmounts = firebaseData.paymentAmounts || {};
          const paymentMethods: PaymentMethod[] = [];
          
          // Map payment amounts to payment methods
          if (paymentAmounts.cash && paymentAmounts.cash > 0) {
            paymentMethods.push({
              type: 'cash',
              label: 'Cash',
              amount: paymentAmounts.cash || 0
            });
          }
          
          if (paymentAmounts.card && paymentAmounts.card > 0) {
            paymentMethods.push({
              type: 'card',
              label: 'Credit/Debit Card',
              amount: paymentAmounts.card || 0,
              details: firebaseData.cardLast4Digits ? `Card ending in ${firebaseData.cardLast4Digits}` : ''
            });
          }
          
          if (paymentAmounts.check && paymentAmounts.check > 0) {
            paymentMethods.push({
              type: 'check',
              label: 'Bank Check',
              amount: paymentAmounts.check || 0
            });
          }
          
          if (paymentAmounts.digital && paymentAmounts.digital > 0) {
            paymentMethods.push({
              type: 'digital',
              label: 'Digital Payment',
              amount: paymentAmounts.digital || 0
            });
          }
          
          if (paymentAmounts.wallet && paymentAmounts.wallet > 0) {
            paymentMethods.push({
              type: 'wallet',
              label: 'E-Wallet',
              amount: paymentAmounts.wallet || 0
            });
          }
          
          const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
          const totalAmount = firebaseData.totalAmount || firebaseData.servicePrice || 0;
          
          const updatedAppointment: Appointment = {
            ...appointment,
            servicePrice: firebaseData.servicePrice || 0,
            subtotal: firebaseData.subtotal || firebaseData.servicePrice || 0,
            totalAmount: totalAmount,
            taxAmount: firebaseData.taxAmount || 0,
            serviceCharges: firebaseData.serviceCharges || 0,
            discount: firebaseData.discount || 0,
            discountType: firebaseData.discountType || 'fixed',
            tax: firebaseData.tax || 5,
            cardLast4Digits: firebaseData.cardLast4Digits || '',
            trnNumber: firebaseData.trnNumber || '',
            teamMembers: firebaseData.teamMembers || [],
            products: firebaseData.products || [],
            paymentMethod: firebaseData.paymentMethod || '',
            paymentStatus: firebaseData.paymentStatus || '',
            paymentMethods: firebaseData.paymentMethods || [],
            paymentAmounts: paymentAmounts,
            bookingNumber: firebaseData.bookingNumber || appointment.bookingNumber,
            price: totalAmount,
            date: firebaseData.bookingDate || firebaseData.date || appointment.date,
            time: firebaseData.bookingTime || firebaseData.time || appointment.time
          };
          
          setFreshAppointment(updatedAppointment);
          
          // Set payment details
          setPaymentDetails({
            methods: paymentMethods,
            totalPaid,
            balanceDue: totalAmount - totalPaid,
            paymentStatus: firebaseData.paymentStatus || '',
            paymentMethod: firebaseData.paymentMethod || ''
          });
        }
      } catch (error) {
        console.error("Error fetching fresh data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const displayAppointment = freshAppointment || appointment;
    
    if (!displayAppointment) return null;
    
    const getStatusColor = (status: string): string => {
      switch (status) {
        case "completed": return "bg-green-100 text-green-800";
        case "in-progress": return "bg-blue-100 text-blue-800";
        case "scheduled": return "bg-yellow-100 text-yellow-800";
        case "approved": return "bg-purple-100 text-purple-800";
        case "pending": return "bg-orange-100 text-orange-800";
        case "cancelled": return "bg-red-100 text-red-800";
        case "rejected": return "bg-gray-100 text-gray-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };
    
    const getStatusIcon = (status: string) => {
      switch (status) {
        case "completed": return <CheckCircle className="w-4 h-4" />;
        case "in-progress": return <Clock className="w-4 h-4" />;
        case "scheduled": return <Calendar className="w-4 h-4" />;
        case "approved": return <CheckCircle className="w-4 h-4" />;
        case "pending": return <Clock className="w-4 h-4" />;
        case "cancelled": return <X className="w-4 h-4" />;
        case "rejected": return <X className="w-4 h-4" />;
        default: return <AlertCircle className="w-4 h-4" />;
      }
    };
    
    const getPaymentStatusColor = (status: string): string => {
      switch (status.toLowerCase()) {
        case "paid": return "bg-green-100 text-green-800";
        case "partial": return "bg-yellow-100 text-yellow-800";
        case "pending": return "bg-orange-100 text-orange-800";
        case "overdue": return "bg-red-100 text-red-800";
        case "refunded": return "bg-blue-100 text-blue-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };
    
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto mt-6 p-5 rounded-3xl">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              Advance Calendar - Appointment Details
              {loading && (
                <Badge className="ml-2 bg-blue-500 animate-pulse">
                  Loading...
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Complete booking information with payment details
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Booking Status</h3>
                  <Badge className={`${getStatusColor(displayAppointment.status)} mt-2 px-4 py-2 text-base flex items-center gap-2 w-fit`}>
                    {getStatusIcon(displayAppointment.status)}
                    <span className="capitalize">{displayAppointment.status}</span>
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">Booking Reference</p>
                  <p className="text-xl font-bold text-blue-900">
                    {displayAppointment.bookingNumber || `BK-${displayAppointment.id}`}
                  </p>
                  {displayAppointment.firebaseId && (
                    <p className="text-xs text-blue-600 mt-1">ID: {displayAppointment.firebaseId}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Payment Details Section */}
            <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-green-600" />
                Payment Details from Firebase
              </h3>
              
              <div className="space-y-4">
                {/* Payment Status */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Payment Status</p>
                      <Badge className={`${getPaymentStatusColor(paymentDetails.paymentStatus)} mt-1 px-3 py-1`}>
                        {paymentDetails.paymentStatus || 'Not Set'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">Payment Method</p>
                    <p className="text-lg font-bold text-blue-700">
                      {paymentDetails.paymentMethod || 'Not Specified'}
                    </p>
                  </div>
                </div>
                
                {/* Payment Breakdown */}
                {paymentDetails.methods.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Payment Breakdown
                    </h4>
                    <div className="space-y-2">
                      {paymentDetails.methods.map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPaymentMethodColor(payment.type)}`}>
                              <PaymentMethodIcon type={payment.type} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{payment.label}</p>
                              {payment.details && (
                                <p className="text-xs text-gray-600">{payment.details}</p>
                              )}
                            </div>
                          </div>
                          <p className="font-bold text-green-700">{formatCurrency(payment.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">No Payment Details Found</p>
                        <p className="text-sm text-yellow-700">Payment information not available in Firebase</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Payment Summary */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-3">Payment Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency(displayAppointment.totalAmount || displayAppointment.price || 0)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Paid</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(paymentDetails.totalPaid)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Balance Due</p>
                      <p className={`text-2xl font-bold ${paymentDetails.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(paymentDetails.balanceDue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <Scissors className="w-6 h-6 text-purple-600" />
                Service Information
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Scissors className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Service</p>
                        <p className="text-lg font-medium text-gray-900">
                          {displayAppointment.service || "No service specified"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500 text-white">Service</Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Service Price</p>
                        <p className="text-3xl font-bold text-green-700">
                          {formatCurrency(displayAppointment.servicePrice || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Subtotal</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(displayAppointment.subtotal || displayAppointment.servicePrice || 0)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white">Subtotal</Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Duration</p>
                        <p className="text-lg font-medium text-gray-900">
                          {displayAppointment.duration || "60 min"}
                        </p>
                      </div>
                    </div>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Assigned Staff</p>
                        <p className="text-lg font-medium text-gray-900">{displayAppointment.barber}</p>
                        {displayAppointment.staffRole && (
                          <p className="text-sm text-indigo-600">{displayAppointment.staffRole}</p>
                        )}
                      </div>
                    </div>
                    {displayAppointment.staffId && (
                      <Badge className="bg-indigo-500 text-white">
                        ID: {displayAppointment.staffId}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <User className="w-6 h-6 text-green-600" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-lg font-medium text-gray-900">
                        {displayAppointment.customer}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Email Address</label>
                    <div className="p-3 bg-gray-50 rounded-lg border break-all">
                      <p className="text-lg font-medium text-gray-900">
                        {displayAppointment.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Phone Number</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-lg font-medium text-gray-900">
                        {displayAppointment.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {displayAppointment.cardLast4Digits && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">Card Last 4</label>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-lg font-medium text-gray-900">
                            ****{displayAppointment.cardLast4Digits}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {displayAppointment.trnNumber && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">TRN Number</label>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-lg font-medium text-gray-900">
                            {displayAppointment.trnNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-orange-600" />
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Booking Date</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-lg font-medium text-gray-900">{displayAppointment.date}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Booking Time</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-lg font-medium text-gray-900">{displayAppointment.time}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Branch</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-lg font-medium text-gray-900">
                        {displayAppointment.branch || "Not specified"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Service Category</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-lg font-medium text-gray-900">
                        {displayAppointment.serviceCategory || "General"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {displayAppointment.notes && (
                <div className="mt-6">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Special Notes</label>
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p className="text-gray-800 italic">{displayAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Actions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {displayAppointment.status === 'completed' && onGenerateInvoice && (
                  <Button
                    variant="default"
                    className="h-12 flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700"
                    onClick={() => onGenerateInvoice(displayAppointment)}
                  >
                    <Receipt className="w-5 h-5" />
                    Generate Invoice
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  className="h-12 flex items-center justify-center gap-3"
                  variant="outline"
                >
                  <X className="w-5 h-5" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

const fetchStaffFromFirebase = async (): Promise<StaffMember[]> => {
  try {
    const staffRef = collection(db, "staff");
    const q = query(staffRef, where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    
    const staff: StaffMember[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const staffData: StaffMember = {
        id: doc.id,
        name: data.name || "Unknown Staff",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role || "staff",
        specialization: Array.isArray(data.specialization) ? data.specialization : [],
        branch: data.branch || "Main Branch",
        avatar: data.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        status: data.status || "active",
        rating: data.rating || 0,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date()
      };
      staff.push(staffData);
    });
    
    return staff;
  } catch (error) {
    console.error("Error fetching staff from Firebase:", error);
    return [];
  }
};

export function AdvancedCalendar({ 
  appointments, 
  onAppointmentClick, 
  onStatusChange, 
  onCreateBooking,
  staff: propStaff,
  showFullDetails = true,
  formatCurrency = (amount) => `AED ${amount.toFixed(2)}`
}: AdvancedCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [timeSlotGap, setTimeSlotGap] = useState(30);
  const [layoutMode, setLayoutMode] = useState<'time-top' | 'employee-top'>('time-top');
  const [businessHours, setBusinessHours] = useState({ start: 9, end: 18 });
  const [hiddenHours, setHiddenHours] = useState<number[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(propStaff || []);
  
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [selectedAdvanceAppointment, setSelectedAdvanceAppointment] = useState<Appointment | null>(null);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [selectedInvoiceAppointment, setSelectedInvoiceAppointment] = useState<Appointment | null>(null);
  
  useEffect(() => {
    const loadStaffData = async () => {
      if (propStaff && propStaff.length > 0) {
        setStaffMembers(propStaff);
      } else {
        const staffData = await fetchStaffFromFirebase();
        setStaffMembers(staffData);
      }
    };
    
    loadStaffData();
  }, [propStaff]);

  const barbers = useMemo(() => staffMembers.map(staff => staff.name), [staffMembers]);

  const generateTimeSlots = () => {
    const slots = [];
    const startTime = new Date(selectedDate);
    startTime.setHours(businessHours.start, 0, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(businessHours.end, 0, 0, 0);

    let currentTime = startTime;
    while (currentTime < endTime) {
      const hour = currentTime.getHours();
      if (!hiddenHours.includes(hour)) {
        slots.push(format(currentTime, 'HH:mm'));
      }
      currentTime = addMinutes(currentTime, timeSlotGap);
    }

    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [selectedDate, businessHours, timeSlotGap, hiddenHours]);

  const filteredAppointments = useMemo(() => 
    appointments.filter(apt => {
      const aptDate = typeof apt.date === 'string' ? parseISO(apt.date) : new Date(apt.date);
      const isSameDate = isSameDay(aptDate, selectedDate);
      const isSameBarber = selectedBarber === 'all' || apt.barber === selectedBarber;
      return isSameDate && isSameBarber;
    }),
    [appointments, selectedDate, selectedBarber]
  );

  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return "00:00";
    
    if (time12h.includes(':') && !time12h.includes(' ')) {
      return time12h;
    }
    
    if (!time12h.includes(' ')) return time12h;
    
    const [time, period] = time12h.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  };

  const parseDuration = (duration: string): number => {
    if (!duration) return 30;
    
    if (duration.includes('hour')) {
      const match = duration.match(/(\d+)\s*hour/);
      return match ? parseInt(match[1]) * 60 : 60;
    }
    
    const match = duration.match(/(\d+)\s*min/);
    return match ? parseInt(match[1]) : 30;
  };

  const doesAppointmentCoverSlot = (appointment: Appointment, slot: string): boolean => {
    const appointmentTime24 = convertTo24Hour(appointment.time);
    const appointmentDuration = parseDuration(appointment.duration);
    
    const [slotHours, slotMinutes] = slot.split(':').map(Number);
    const [aptHours, aptMinutes] = appointmentTime24.split(':').map(Number);
    
    const slotStartMinutes = slotHours * 60 + slotMinutes;
    const slotEndMinutes = slotStartMinutes + timeSlotGap;
    const appointmentStartMinutes = aptHours * 60 + aptMinutes;
    const appointmentEndMinutes = appointmentStartMinutes + appointmentDuration;
    
    return (
      (appointmentStartMinutes < slotEndMinutes) && 
      (appointmentEndMinutes > slotStartMinutes)
    );
  };

  const getAppointmentForSlot = (timeSlot: string, barber: string): Appointment | undefined => {
    return filteredAppointments.find(apt =>
      apt.barber === barber && doesAppointmentCoverSlot(apt, timeSlot)
    );
  };

  const isAppointmentStart = (appointment: Appointment, timeSlot: string): boolean => {
    const appointmentTime24 = convertTo24Hour(appointment.time);
    const [aptHours, aptMinutes] = appointmentTime24.split(':').map(Number);
    const appointmentStartMinutes = aptHours * 60 + aptMinutes;
    
    const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);
    const slotStartMinutes = slotHours * 60 + slotMinutes;
    
    for (let i = 0; i < timeSlots.length; i++) {
      const [h, m] = timeSlots[i].split(':').map(Number);
      const currentSlotStart = h * 60 + m;
      const currentSlotEnd = currentSlotStart + timeSlotGap;
      
      if (appointmentStartMinutes >= currentSlotStart && appointmentStartMinutes < currentSlotEnd) {
        return timeSlots[i] === timeSlot;
      }
    }
    
    return false;
  };

  const getAppointmentSpan = (appointment: Appointment, startTimeSlot: string): number => {
    const appointmentTime24 = convertTo24Hour(appointment.time);
    const duration = parseDuration(appointment.duration);
    const [aptHours, aptMinutes] = appointmentTime24.split(':').map(Number);
    const appointmentStartMinutes = aptHours * 60 + aptMinutes;
    const appointmentEndMinutes = appointmentStartMinutes + duration;
    
    let startSlotIndex = -1;
    for (let i = 0; i < timeSlots.length; i++) {
      const [h, m] = timeSlots[i].split(':').map(Number);
      const slotStart = h * 60 + m;
      const slotEnd = slotStart + timeSlotGap;
      
      if (appointmentStartMinutes >= slotStart && appointmentStartMinutes < slotEnd) {
        startSlotIndex = i;
        break;
      }
    }
    
    if (startSlotIndex === -1) return 1;
    
    let span = 0;
    for (let i = startSlotIndex; i < timeSlots.length; i++) {
      const [h, m] = timeSlots[i].split(':').map(Number);
      const slotStart = h * 60 + m;
      
      if (slotStart < appointmentEndMinutes) {
        span++;
      } else {
        break;
      }
    }
    
    return span || 1;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "scheduled": return "bg-yellow-500";
      case "approved": return "bg-purple-500";
      case "pending": return "bg-orange-500";
      case "cancelled": return "bg-red-500";
      case "rejected": return "bg-gray-500";
      default: return "bg-gray-300";
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next'
      ? addDays(selectedDate, 1)
      : addDays(selectedDate, -1);
    setSelectedDate(newDate);
  };

  const toggleHiddenHour = (hour: number) => {
    setHiddenHours(prev =>
      prev.includes(hour)
        ? prev.filter(h => h !== hour)
        : [...prev, hour]
    );
  };

  const resetHiddenHours = () => {
    setHiddenHours([]);
  };

  const getStaffAvatar = (barberName: string): string => {
    const staff = staffMembers.find(s => s.name === barberName);
    return staff?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop";
  };

  const getStaffRole = (barberName: string): string => {
    const staff = staffMembers.find(s => s.name === barberName);
    return staff?.role || "Staff";
  };

  const handleAdvanceAppointmentClick = (appointment: Appointment) => {
    console.log("🎯 ADVANCE CALENDAR Click:", appointment);
    setSelectedAdvanceAppointment(appointment);
    setShowAdvancePopup(true);
  };

  const handleGenerateInvoiceClick = (appointment: Appointment) => {
    console.log("💰 Generate Invoice for:", appointment);
    setSelectedInvoiceAppointment(appointment);
    setShowInvoicePopup(true);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Advanced Booking Calendar
              <Badge variant="outline" className="ml-2">
                {staffMembers.length} Staff
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={layoutMode === 'time-top' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayoutMode('time-top')}
                  className="flex items-center gap-1"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Time Top
                </Button>
                <Button
                  variant={layoutMode === 'employee-top' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayoutMode('employee-top')}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Employee Top
                </Button>
              </div>

              <Select value={timeSlotGap.toString()} onValueChange={(value) => setTimeSlotGap(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>

              {onCreateBooking && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const defaultBarber = barbers.length > 0 ? barbers[0] : 'all';
                    const defaultTime = timeSlots.length > 0 ? timeSlots[0] : '09:00';
                    onCreateBooking(defaultBarber, format(selectedDate, 'yyyy-MM-dd'), defaultTime);
                  }}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  Quick Book
                </Button>
              )}

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center px-2">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {showSettings && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Business Hours</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={businessHours.start.toString()}
                      onValueChange={(value) => setBusinessHours(prev => ({ ...prev, start: parseInt(value) }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 6).map(hour => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>to</span>
                    <Select
                      value={businessHours.end.toString()}
                      onValueChange={(value) => setBusinessHours(prev => ({ ...prev, end: parseInt(value) }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 12).map(hour => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Hidden Hours</Label>
                    <Button variant="ghost" size="sm" onClick={resetHiddenHours}>
                      Reset
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: businessHours.end - businessHours.start }, (_, i) => businessHours.start + i).map(hour => (
                      <Button
                        key={hour}
                        variant={hiddenHours.includes(hour) ? "destructive" : "outline"}
                        size="sm"
                        className="w-12 h-8 text-xs"
                        onClick={() => toggleHiddenHour(hour)}
                      >
                        {hour > 12 ? `${hour - 12}P` : `${hour}A`}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filter Staff</Label>
                  <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff ({staffMembers.length})</SelectItem>
                      {staffMembers.map(staff => (
                        <SelectItem key={staff.id} value={staff.name}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-4 h-4 rounded-full overflow-hidden">
                              <img 
                                src={staff.avatar} 
                                alt={staff.name} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop";
                                }}
                              />
                            </div>
                            <span>{staff.name}</span>
                            <Badge variant="outline" className="text-xs">{staff.role}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto overflow-y-auto max-h-[900px] sm:max-h-[600px] w-full">
            <div className="min-w-full" style={{ width: 'max-content' }}>
              {layoutMode === 'time-top' ? (
                <>
                  <div className="grid gap-1 mb-2 sticky top-0 bg-background z-10 border-b pb-2" style={{ gridTemplateColumns: `clamp(120px, 15vw, 200px) repeat(${timeSlots.length}, minmax(50px, 1fr))` }}>
                    <div className="p-2 font-medium text-sm text-muted-foreground sticky left-0 bg-background">
                      Staff / Time
                    </div>
                    {timeSlots.map(slot => (
                      <div key={slot} className="p-1 text-xs text-center font-medium text-muted-foreground border rounded bg-muted/50 min-w-[50px]">
                        {slot}
                      </div>
                    ))}
                  </div>

                  {(selectedBarber === 'all' ? barbers : [selectedBarber]).map(barber => {
                    let slotIndex = 0;
                    const rowElements: React.ReactElement[] = [];
                    
                    while (slotIndex < timeSlots.length) {
                      const currentSlot = timeSlots[slotIndex];
                      const appointment = getAppointmentForSlot(currentSlot, barber);
                      
                      if (appointment && isAppointmentStart(appointment, currentSlot)) {
                        const span = Math.min(getAppointmentSpan(appointment, currentSlot), timeSlots.length - slotIndex);
                        
                        rowElements.push(
                          <div
                            key={`${barber}-${currentSlot}`}
                            className={`p-1 border rounded cursor-pointer hover:shadow-md transition-all duration-200 min-h-[60px] flex items-center justify-center border-2 border-primary/50 bg-primary/5`}
                            style={{ gridColumn: `span ${span}` }}
                            onClick={() => handleAdvanceAppointmentClick(appointment)}
                          >
                            <div className="w-full h-full flex flex-col items-center justify-center text-xs p-1">
                              <div className={`w-3 h-3 rounded-full mb-1 ${getStatusColor(appointment.status)}`} />
                              <div className="font-medium truncate w-full text-center leading-tight">
                                {appointment.customer.split(' ')[0]}
                              </div>
                              <div className="text-muted-foreground truncate w-full text-center text-[10px] leading-tight">
                                {appointment.service}
                              </div>
                              <div className="text-muted-foreground text-[9px] mt-1">
                                {appointment.duration}
                              </div>
                            </div>
                          </div>
                        );
                        
                        slotIndex += span;
                      } else if (appointment) {
                        slotIndex += 1;
                      } else {
                        rowElements.push(
                          <div
                            key={`${barber}-${currentSlot}`}
                            className="p-1 border rounded cursor-pointer hover:shadow-md transition-all duration-200 min-h-[60px] flex items-center justify-center border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateBooking && onCreateBooking(barber, format(selectedDate, 'yyyy-MM-dd'), currentSlot);
                            }}
                          >
                            <div className="text-muted-foreground/50 text-xs text-center cursor-pointer hover:text-green-600 transition-colors flex flex-col items-center gap-1">
                              <PlusCircle className="w-3 h-3" />
                              Book
                            </div>
                          </div>
                        );
                        slotIndex += 1;
                      }
                    }
                    
                    const staff = staffMembers.find(s => s.name === barber);
                    const staffAvatar = getStaffAvatar(barber);
                    const staffRole = getStaffRole(barber);
                    
                    return (
                      <div key={barber} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `clamp(120px, 15vw, 200px) repeat(${timeSlots.length}, minmax(50px, 1fr))` }}>
                        <div className="p-2 sm:p-3 bg-muted rounded flex items-center gap-2 sticky left-0 border-r" style={{ minWidth: 'clamp(120px, 15vw, 200px)' }}>
                          <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 border border-gray-300">
                            <img 
                              src={staffAvatar} 
                              alt={barber} 
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{barber}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{staffRole}</div>
                          </div>
                        </div>
                        {rowElements}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div 
                  className="grid gap-1" 
                  style={{ 
                    gridTemplateColumns: `clamp(120px, 15vw, 150px) repeat(${(selectedBarber === 'all' ? barbers : [selectedBarber]).length}, minmax(80px, 1fr))`,
                  }}
                >
                  <div className="p-2 font-medium text-sm text-muted-foreground sticky top-0 bg-background z-20 border-b">
                    Time / Staff
                  </div>
                  {(selectedBarber === 'all' ? barbers : [selectedBarber]).map(barber => {
                    const staff = staffMembers.find(s => s.name === barber);
                    const staffAvatar = getStaffAvatar(barber);
                    const staffRole = getStaffRole(barber);
                    
                    return (
                      <div key={barber} className="p-2 text-xs text-center font-medium text-muted-foreground border rounded bg-muted/50 flex flex-col items-center justify-center gap-1 sticky top-0 bg-background z-20 border-b">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-300 mb-1">
                          <img 
                            src={staffAvatar} 
                            alt={barber} 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop";
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <div className="font-medium truncate">{barber.split(' ')[0]}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{staffRole}</div>
                        </div>
                      </div>
                    );
                  })}

                  {timeSlots.map((slot, slotIndex) => (
                    <React.Fragment key={slot}>
                      <div className="p-2 sm:p-3 bg-muted rounded flex items-center gap-2 sticky left-0 z-20 border-r min-h-[80px]">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium text-xs sm:text-sm">{slot}</span>
                      </div>
                      
                      {(selectedBarber === 'all' ? barbers : [selectedBarber]).map(barber => {
                        const appointment = getAppointmentForSlot(slot, barber);
                        
                        if (appointment && isAppointmentStart(appointment, slot)) {
                          const span = Math.min(getAppointmentSpan(appointment, slot), timeSlots.length - slotIndex);
                          return (
                            <div
                              key={`${slot}-${barber}`}
                              className="p-1 border rounded cursor-pointer hover:shadow-md transition-all duration-200 flex items-center justify-center border-2 border-primary/50 bg-primary/5"
                              style={{ gridRow: `span ${span}` }}
                              onClick={() => handleAdvanceAppointmentClick(appointment)}
                            >
                              <div className="w-full h-full flex flex-col items-center justify-center text-xs p-1">
                                <div className={`w-3 h-3 rounded-full mb-1 ${getStatusColor(appointment.status)}`} />
                                <div className="text-muted-foreground text-[9px] mb-0.5 font-medium">
                                  {appointment.time}
                                </div>
                                <div className="font-medium truncate w-full text-center leading-tight">
                                  {appointment.customer.split(' ')[0]}
                                </div>
                                <div className="text-muted-foreground truncate w-full text-center text-[10px] leading-tight">
                                  {appointment.service}
                                </div>
                                <div className="text-muted-foreground text-[9px] mt-1">
                                  {appointment.duration}
                                </div>
                              </div>
                            </div>
                          );
                        } else if (appointment) {
                          return null;
                        } else {
                          return (
                            <div
                              key={`${slot}-${barber}`}
                              className="p-1 border rounded cursor-pointer hover:shadow-md transition-all duration-200 flex items-center justify-center border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-green-50 min-h-[80px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCreateBooking && onCreateBooking(barber, format(selectedDate, 'yyyy-MM-dd'), slot);
                              }}
                            >
                              <div className="text-muted-foreground/50 text-xs text-center cursor-pointer hover:text-green-600 transition-colors flex flex-col items-center gap-1">
                                <PlusCircle className="w-3 h-3" />
                                Book
                              </div>
                            </div>
                          );
                        }
                      })}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Cancelled/Rejected</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Gap: {timeSlotGap}min</span>
                  <span>Hours: {businessHours.start > 12 ? `${businessHours.start - 12}PM` : `${businessHours.start}AM`} - {businessHours.end > 12 ? `${businessHours.end - 12}PM` : `${businessHours.end}AM`}</span>
                  <span>Layout: {layoutMode === 'time-top' ? 'Time → Staff' : 'Staff → Time'}</span>
                </div>
              </div>
            </div>

            {staffMembers.length > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" />
                  <strong>Staff from Firebase:</strong> {staffMembers.length} active staff members loaded
                </div>
                <div className="flex flex-wrap gap-2">
                  {staffMembers.slice(0, 3).map(staff => (
                    <div key={staff.id} className="flex items-center gap-1 text-xs px-2 py-1 bg-background rounded">
                      <div className="relative w-3 h-3 rounded-full overflow-hidden">
                        <img 
                          src={staff.avatar} 
                          alt={staff.name} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop";
                          }}
                        />
                      </div>
                      <span>{staff.name.split(' ')[0]}</span>
                    </div>
                  ))}
                  {staffMembers.length > 3 && (
                    <span className="text-xs">+{staffMembers.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showAdvancePopup && (
        <AdvanceCalendarPopup
          appointment={selectedAdvanceAppointment}
          onClose={() => {
            setShowAdvancePopup(false);
            setSelectedAdvanceAppointment(null);
          }}
          onStatusChange={onStatusChange}
          onGenerateInvoice={handleGenerateInvoiceClick}
          formatCurrency={formatCurrency}
        />
      )}
      
      {showInvoicePopup && (
        <InvoiceGenerationPopup
          appointment={selectedInvoiceAppointment}
          onClose={() => {
            setShowInvoicePopup(false);
            setSelectedInvoiceAppointment(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </>
  );
}