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
  CheckSquare, Percent, CalendarDays, ClipboardList,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import { format, addDays, startOfDay, addMinutes, isSameDay, parseISO } from "date-fns";
import { collection, getDocs, query, where, doc, getDoc ,updateDoc ,deleteDoc} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Appointment {
  staffName: any;
  staff: any;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  serviceName: string;
  serviceDetails: any;
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
    Cash: number;
    Digital: number;
    Card: number;
    Check: number;
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

// NEW: Branch interface
interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  status?: string;
  openingTime?: string;
  closingTime?: string;
  weeklyTimings?: any;
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
  tip: number;
  staff: string;
  duration: string;
  branch: string;
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
// ✅ INVOICE POPUP - SLIP ON LEFT, BUTTONS ON RIGHT
const InvoicePopup = ({ 
  appointment, 
  services,
  tips,
  discount,
  tax,
  serviceCharges,
  subtotal,
  totalAmount,
  paymentMethods,
  totalPaid,
  balanceDue,
  onClose,
  onVoid,
  formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'AED 0.00';
    return `AED ${amount.toFixed(2)}`;
  }
}: { 
  appointment: Appointment | null; 
  services: any[];
  tips: {[key: string]: number};
  discount: number;
  tax: number;
  serviceCharges: number;
  subtotal: number;
  totalAmount: number;
  paymentMethods: Array<{type: string, label: string, amount: number}>;
  totalPaid: number;
  balanceDue: number;
  onClose: () => void;
  onVoid: () => void;
  formatCurrency?: (amount: number) => string;
}) => {
  const [invoiceData, setInvoiceData] = useState({
    companyName: 'Lavanya Beauty Salon',
    address: '3, Ground Floor, Widad Building, 10th Street, Al Nahda, Dubai',
    email: 'lavanyabeautysalon2023@gmail.com',
    mobile: '+971 501168700',
    trn: '10430991800003',
    date: new Date().toLocaleDateString('en-GB'),
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    clientName: appointment?.customerName || appointment?.customer || 'Customer',
    paymentReceivedBy: 'Sruthi',
    paymentDate: new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  });

  // Calculate discount amount
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const totalWithTax = subtotal - discountAmount + taxAmount + serviceCharges + Object.values(tips).reduce((a, b) => a + b, 0);

 // Handle PDF Download - EXACTLY like generatePDF with proper table
const handleDownloadPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // ===== COMPANY HEADER =====
  doc.setFontSize(22);
  doc.setTextColor(0, 51, 102); // Dark blue color
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.companyName, margin, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(invoiceData.address, margin, 28);
  doc.text(invoiceData.email, margin, 34);
  doc.text(`Mobile: ${invoiceData.mobile}`, margin, 40);
  doc.text(`TRN: ${invoiceData.trn}`, margin, 46);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102);
  doc.text('TAX INVOICE', pageWidth - margin - 40, 20);

  doc.setDrawColor(0, 51, 102);
  doc.line(margin, 55, pageWidth - margin, 55);

  // ===== CUSTOMER INFORMATION =====
  let yPos = 65;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text('Customer Information:', margin, yPos);

  yPos += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${invoiceData.clientName}`, margin, yPos);
  yPos += 6;
  doc.text(`Phone: ${appointment?.customerPhone || appointment?.phone || ''}`, margin, yPos);
  yPos += 6;
  doc.text(`Email: ${appointment?.customerEmail || appointment?.email || ''}`, margin, yPos);
  yPos += 6;
  
  // Booking Date and Time
  const bookingDate = appointment?.bookingDate || appointment?.date || '';
  const bookingTime = appointment?.bookingTime || appointment?.time || '';
  doc.text(`Date: ${bookingDate}  Time: ${bookingTime}`, margin, yPos);

  // TRN Number (if available)
  if (invoiceData.trn) {
    yPos += 6;
    doc.text(`TRN: ${invoiceData.trn}`, margin, yPos);
  }

  // Invoice Details on Right
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice: ${invoiceData.invoiceNo}`, pageWidth - margin - 60, 65);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${invoiceData.date}`, pageWidth - margin - 60, 72);

  // ===== SERVICES TABLE - WITH ALL DETAILS =====
  yPos = 110;
  
  // Create detailed table data with all service information
  const tableHeaders = [['SL NO', 'Service', 'Staff', 'Duration', 'Price', 'Tip', 'Total']];
  const tableData = services.map((service, index) => [
    (index + 1).toString(),
    service.name,
    service.staff || 'Not Assigned',
    service.duration ? `${service.duration} min` : '60 min',
    formatCurrency(service.price),
    formatCurrency(tips[service.staff] || 0),
    formatCurrency(service.price + (tips[service.staff] || 0))
  ]);

  autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' }
    }
  });

  const tableEndY = (doc as any).lastAutoTable.finalY + 15;

  


  // ===== SUMMARY SECTION (RIGHT SIDE) =====
  const summaryX = pageWidth - margin - 85;
  let summaryY = tableEndY;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text('Summary:', summaryX, summaryY);

  summaryY += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Subtotal
  doc.text(`Subtotal:`, summaryX, summaryY);
  doc.text(formatCurrency(subtotal), summaryX + 55, summaryY, { align: 'right' });
  summaryY += 6;

  // Tips
  const totalTips = Object.values(tips).reduce((a, b) => a + b, 0);
  if (totalTips > 0) {
    doc.text(`Tips:`, summaryX, summaryY);
    doc.text(formatCurrency(totalTips), summaryX + 55, summaryY, { align: 'right' });
    summaryY += 6;
  }

  // Discount
  if (discount > 0) {
    const discountAmount = (subtotal * discount) / 100;
    doc.text(`Discount (${discount}%):`, summaryX, summaryY);
    doc.text(`-${formatCurrency(discountAmount)}`, summaryX + 55, summaryY, { align: 'right' });
    summaryY += 6;
  }

  // VAT
  const taxableAmount = subtotal - ((subtotal * discount) / 100);
  const taxAmount = (taxableAmount * tax) / 100;
  doc.text(`VAT (${tax}%):`, summaryX, summaryY);
  doc.text(formatCurrency(taxAmount), summaryX + 55, summaryY, { align: 'right' });
  summaryY += 6;

  // Service Charges
  if (serviceCharges > 0) {
    doc.text(`Service Charges:`, summaryX, summaryY);
    doc.text(formatCurrency(serviceCharges), summaryX + 55, summaryY, { align: 'right' });
    summaryY += 6;
  }

  // Total Tips Summary Line (if needed)
  if (totalTips > 0) {
    // Already added above
  }

  // Separator line
  summaryY += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX, summaryY - 2, summaryX + 65, summaryY - 2);

  // Grand Total
  const totalWithTax = subtotal - ((subtotal * discount) / 100) + taxAmount + serviceCharges + totalTips;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Total:`, summaryX, summaryY + 4);
  doc.text(formatCurrency(totalWithTax), summaryX + 55, summaryY + 4, { align: 'right' });

  // ===== FOOTER =====
  const footerY = doc.internal.pageSize.height - 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(150, 150, 150);
  doc.text('THANK YOU FOR YOUR BUSINESS', pageWidth / 2, footerY, { align: 'center' });

  doc.save(`Invoice-${invoiceData.invoiceNo}.pdf`);
};

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-full p-0 bg-gradient-to-br from-pink-50 to-white overflow-y-auto">
        <SheetTitle className="sr-only">View Invoice</SheetTitle>
        
        {/* Pink Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white z-10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">View Invoice</h2>
                <p className="text-pink-100 text-sm">{invoiceData.invoiceNo}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content - 2 Columns */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - SLIP ONLY WITH COMPLETE DETAILS */}
<div className="lg:col-span-2">
  <div className="bg-white border border-pink-100 rounded-xl p-6 shadow-sm">
    {/* Company Header */}
    <div className="text-center mb-4">
      <h1 className="text-xl font-bold text-pink-600">{invoiceData.companyName}</h1>
      <p className="text-xs text-gray-600">{invoiceData.address}</p>
      <p className="text-xs text-gray-500">{invoiceData.email}</p>
      <p className="text-xs text-gray-500">Mobile: {invoiceData.mobile}</p>
      <p className="text-xs text-gray-500">TRN: {invoiceData.trn}</p>
    </div>

    {/* Invoice Details - Two Lines */}
    <div className="mb-4 text-sm">
      <div className="flex justify-between">
        <p><span className="text-pink-600">Date:</span> {invoiceData.date}</p>
        <p><span className="text-pink-600">Invoice No:</span> {invoiceData.invoiceNo}</p>
      </div>
      <p className="mt-1"><span className="text-pink-600">Client Name:</span> {invoiceData.clientName}</p>
      <p className="mt-1"><span className="text-pink-600">Client Phone:</span> {appointment?.customerPhone || appointment?.phone || 'N/A'}</p>
      <p className="mt-1"><span className="text-pink-600">Booking Date:</span> {appointment?.bookingDate || appointment?.date || 'N/A'} at {appointment?.bookingTime || appointment?.time || 'N/A'}</p>
    </div>

    {/* Services Table - WITH COMPLETE DETAILS */}
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Services</h3>
      <table className="w-full text-xs">
        <thead className="bg-pink-100">
          <tr>
            <th className="px-2 py-2 text-left">SL NO</th>
            <th className="px-2 py-2 text-left">Service</th>
            <th className="px-2 py-2 text-left">Staff</th>
            <th className="px-2 py-2 text-center">Duration</th>
            <th className="px-2 py-2 text-right">Price</th>
            <th className="px-2 py-2 text-right">Tip</th>
            <th className="px-2 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pink-100">
          {services.map((service, idx) => {
            const tipAmount = tips[service.staff] || 0;
            const totalAmount = (service.price || 0) + tipAmount;
            
            return (
              <tr key={idx} className="hover:bg-pink-50">
                <td className="px-2 py-2">{idx + 1}</td>
                <td className="px-2 py-2 font-medium">{service.name}</td>
                <td className="px-2 py-2">{service.staff || '—'}</td>
                <td className="px-2 py-2 text-center">{service.duration ? `${service.duration} min` : '60 min'}</td>
                <td className="px-2 py-2 text-right">{formatCurrency(service.price)}</td>
                <td className="px-2 py-2 text-right">{formatCurrency(tipAmount)}</td>
                <td className="px-2 py-2 text-right font-medium">{formatCurrency(totalAmount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Payment Status */}
    <div className="mb-3">
      <div className="flex items-center gap-2 text-green-600 font-semibold">
        <CheckCircle className="w-4 h-4" />
        <span>Payment Completed</span>
      </div>
    
    </div>

    {/* Payment Methods */}
    {paymentMethods.length > 0 && (
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Payment Methods</h3>
        <div className="bg-pink-50 p-2 rounded-lg">
          {paymentMethods.map((pm, idx) => (
            <div key={idx} className="flex justify-between text-xs py-1">
              <span className="font-medium">{pm.label}</span>
              <span>{formatCurrency(pm.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Summary */}
    <div className="border-t border-pink-200 pt-3">
      <div className="flex justify-end">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Discount ({discount}%):</span>
              <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">VAT ({tax}%):</span>
            <span className="font-medium">{formatCurrency(taxAmount)}</span>
          </div>
          {serviceCharges > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Service Charges:</span>
              <span className="font-medium">{formatCurrency(serviceCharges)}</span>
            </div>
          )}
          {Object.values(tips).reduce((a, b) => a + b, 0) > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Total Tips:</span>
              <span className="font-medium text-green-600">{formatCurrency(Object.values(tips).reduce((a, b) => a + b, 0))}</span>
            </div>
          )}
          <div className="border-t border-pink-200 pt-1 mt-1">
            <div className="flex justify-between font-bold text-sm">
              <span>Grand Total:</span>
              <span className="text-pink-600">{formatCurrency(totalWithTax)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="text-center text-gray-500 text-xs mt-4">
      THANK YOU FOR YOUR BUSINESS
    </div>
  </div>
</div>

        {/* RIGHT COLUMN - BUTTONS ONLY */}
<div className="lg:col-span-1 space-y-4">
  {/* Action Buttons - IN ROW */}
  <div className="bg-pink-100 border border-pink-100 rounded-xl p-4 shadow-sm">
    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1">
      <Settings className="w-4 h-4 text-pink-500" />
      Actions
    </h3>
    
    <div className="flex flex-row gap-2">
      <Button 
        size="sm"
        className="flex-1 bg-pink-500 hover:bg-pink-100 text-white text-xs h-8 px-2 gap-1"
        onClick={onVoid}
      >
        <RotateCcw className="w-3 h-3" />
        Void
      </Button>
      
      <Button 
        size="sm"
        className="flex-1 bg-pink-500 hover:bg-pink-700 text-white text-xs h-8 px-2 gap-1"
        onClick={handlePrint}
      >
        <Printer className="w-3 h-3" />
        Print
      </Button>
      
      <Button 
        size="sm"
        className="flex-1 bg-pink-500 hover:bg-pink-700 text-white text-xs h-8 px-2 gap-1"
        onClick={handleDownloadPDF}
      >
        <Download className="w-3 h-3" />
        PDF
      </Button>
    </div>
  </div>

  {/* Send Invoice Section */}
  <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1">
      <Mail className="w-4 h-4 text-pink-500" />
      Send Invoice
    </h3>
    
    <div className="space-y-2">
      <Input
        placeholder="Email Address"
        className="w-full h-8 text-sm border-pink-200"
      />
      <Button className="w-full bg-pink-500 hover:bg-pink-700 text-white h-8 text-sm">
        Send
      </Button>
    </div>
  </div>
</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};



// INVOICE GENERATION POPUP COMPONENT - FINAL VERSION
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
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [searchService, setSearchService] = useState("");
  const [showNewPaymentMethod, setShowNewPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'cash' as 'cash' | 'card' | 'check' | 'digital' | 'wallet' | 'other',
    label: '',
    amount: 0
  });
  
  const generateInvoiceNumber = () => {
    return `INV-${Date.now().toString().slice(-8)}`;
  };
  
  useEffect(() => {
    if (appointment) {
      initializeInvoiceData();
      fetchServicesFromFirebase();
    }
  }, [appointment]);
  
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
          freshData = {
            ...appointment,
            servicePrice: firebaseData.servicePrice || 0,
            subtotal: firebaseData.subtotal || firebaseData.servicePrice || 0,
            totalAmount: firebaseData.totalAmount || firebaseData.servicePrice || 0,
            taxAmount: firebaseData.taxAmount || 0,
            serviceCharges: firebaseData.serviceCharges || 0,
            discount: firebaseData.discount || 0,
            discountType: 'percentage',
            tax: firebaseData.tax || 5,
            cardLast4Digits: firebaseData.cardLast4Digits || '',
            trnNumber: firebaseData.trnNumber || '',
            paymentAmounts: firebaseData.paymentAmounts || {}
          };
        }
      }
      
      // Create items array from serviceDetails with all fields
      const items: InvoiceItem[] = [];
      
      if (freshData.serviceDetails && freshData.serviceDetails.length > 0) {
        freshData.serviceDetails.forEach((service: any, index: number) => {
          items.push({
            id: `service-${index}-${Date.now()}`,
            description: service.name,
            branch: service.branch || freshData.branch || 'Main Branch',
            staff: service.staff || freshData.staffName || freshData.staff || freshData.barber || 'Not Assigned',
            duration: service.duration ? `${service.duration} min` : freshData.duration || '60 min',
            quantity: 1,
            price: service.price || 0,
            total: service.price || 0,
            tip: 0
          });
        });
      } else {
        items.push({
          id: `service-1-${Date.now()}`,
          description: freshData.service || 'Service',
          branch: freshData.branch || 'Main Branch',
          staff: freshData.staffName || freshData.staff || freshData.barber || 'Not Assigned',
          duration: freshData.duration || '60 min',
          quantity: 1,
          price: freshData.servicePrice || freshData.price || 0,
          total: freshData.servicePrice || freshData.price || 0,
          tip: 0
        });
      }
      
      
      // Create payment methods from paymentAmounts
const paymentMethods: PaymentMethod[] = [];
const paymentAmounts = freshData.paymentAmounts || {};

// Safe way to access properties with type assertion
const amounts = paymentAmounts as any;

if (amounts.Cash > 0 || amounts.cash > 0) {
  paymentMethods.push({
    type: 'cash',
    label: 'Cash',
    amount: amounts.Cash || amounts.cash || 0
  });
}

if (amounts.Digital > 0 || amounts.digital > 0) {
  paymentMethods.push({
    type: 'digital',
    label: 'Digital Payment',
    amount: amounts.Digital || amounts.digital || 0
  });
}

if (amounts.Card > 0 || amounts.card > 0) {
  paymentMethods.push({
    type: 'card',
    label: 'Card Payment',
    amount: amounts.Card || amounts.card || 0,
    details: freshData.cardLast4Digits ? `****${freshData.cardLast4Digits}` : ''
  });
}

if (amounts.Check > 0 || amounts.check > 0) {
  paymentMethods.push({
    type: 'check',
    label: 'Check',
    amount: amounts.Check || amounts.check || 0
  });
}
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const totalTips = items.reduce((sum, item) => sum + (item.tip || 0), 0);
      
      const discountPercentage = freshData.discount || 0;
      const discountAmount = (subtotal * discountPercentage) / 100;
      
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * (freshData.tax || 5)) / 100;
      const totalAmount = subtotal - discountAmount + taxAmount + (freshData.serviceCharges || 0) + totalTips;
      const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
      
      setInvoiceData({
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toISOString().split('T')[0],
        customerName: freshData.customerName || freshData.customer,
        customerEmail: freshData.customerEmail || freshData.email || '',
        customerPhone: freshData.customerPhone || freshData.phone || '',
        customerAddress: `${freshData.branch || ''}, Dubai, UAE`,
        trnNumber: freshData.trnNumber || '',
        service: freshData.service || '',
        services: freshData.services || [freshData.service],
        barber: freshData.staffName || freshData.staff || freshData.barber,
        serviceDate: freshData.bookingDate || freshData.date,
        serviceTime: freshData.bookingTime || freshData.time,
        duration: freshData.duration || '60 min',
        servicePrice: freshData.servicePrice || freshData.price || 0,
        subtotal,
        discount: discountPercentage,
        discountType: 'percentage',
        tax: freshData.tax || 5,
        taxAmount,
        serviceTip: totalTips,
        serviceCharges: freshData.serviceCharges || 0,
        totalAmount,
        cardLast4Digits: freshData.cardLast4Digits || '',
        paymentMethods,
        totalPaid,
        balanceDue: totalAmount - totalPaid,
        items,
        notes: freshData.notes || '',
        branch: freshData.branch || 'Main Branch'
      });
      
    } catch (error) {
      console.error("Error initializing invoice:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const addServiceFromList = (service: ServiceItem) => {
    if (!invoiceData) return;
    
    const newItem: InvoiceItem = {
      id: `service-${Date.now()}`,
      description: service.name,
      branch: service.branchNames?.[0] || invoiceData.branch || 'Main Branch',
      staff: invoiceData.barber || 'Not Assigned',
      duration: `${service.duration} min`,
      quantity: 1,
      price: service.price || 0,
      total: service.price || 0,
      tip: 0
    };
    
    const updatedItems = [...invoiceData.items, newItem];
    updateInvoiceWithItems(updatedItems);
    setShowServicesDropdown(false);
    setSearchService("");
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
    
    updateInvoiceWithItems(updatedItems);
  };
  
  const updateItemTip = (id: string, tipValue: number) => {
    if (!invoiceData) return;
    
    const updatedItems = invoiceData.items.map(item => {
      if (item.id === id) {
        return { ...item, tip: tipValue };
      }
      return item;
    });
    
    updateInvoiceWithItems(updatedItems);
  };
  
  const removeItem = (id: string) => {
    if (!invoiceData) return;
    const updatedItems = invoiceData.items.filter(item => item.id !== id);
    updateInvoiceWithItems(updatedItems);
  };
  
  const updateInvoiceWithItems = (items: InvoiceItem[]) => {
    if (!invoiceData) return;
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalTips = items.reduce((sum, item) => sum + (item.tip || 0), 0);
    
    const discountPercentage = invoiceData.discount;
    const discountAmount = (subtotal * discountPercentage) / 100;
    
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * invoiceData.tax) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount + invoiceData.serviceCharges + totalTips;
    const totalPaid = invoiceData.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    
    setInvoiceData({
      ...invoiceData,
      items,
      subtotal,
      taxAmount,
      serviceTip: totalTips,
      totalAmount,
      totalPaid,
      balanceDue: totalAmount - totalPaid
    });
  };
  
  const addPaymentMethod = () => {
    if (!invoiceData) return;
    
    if (!newPaymentMethod.label) {
      alert("Please enter payment method name");
      return;
    }
    
    const newPayment: PaymentMethod = {
      type: newPaymentMethod.type,
      label: newPaymentMethod.label,
      amount: newPaymentMethod.amount || 0
    };
    
    const updatedPayments = [...invoiceData.paymentMethods, newPayment];
    const totalPaid = updatedPayments.reduce((sum, pm) => sum + pm.amount, 0);
    
    setInvoiceData({
      ...invoiceData,
      paymentMethods: updatedPayments,
      totalPaid,
      balanceDue: invoiceData.totalAmount - totalPaid
    });
    
    setNewPaymentMethod({
      type: 'cash',
      label: '',
      amount: 0
    });
    setShowNewPaymentMethod(false);
  };
  
  const updatePaymentMethod = (index: number, amount: number) => {
    if (!invoiceData) return;
    
    const updatedPayments = [...invoiceData.paymentMethods];
    updatedPayments[index] = { ...updatedPayments[index], amount };
    
    const totalPaid = updatedPayments.reduce((sum, pm) => sum + pm.amount, 0);
    
    setInvoiceData({
      ...invoiceData,
      paymentMethods: updatedPayments,
      totalPaid,
      balanceDue: invoiceData.totalAmount - totalPaid
    });
  };
  
  const removePaymentMethod = (index: number) => {
    if (!invoiceData) return;
    
    const updatedPayments = invoiceData.paymentMethods.filter((_, i) => i !== index);
    const totalPaid = updatedPayments.reduce((sum, pm) => sum + pm.amount, 0);
    
    setInvoiceData({
      ...invoiceData,
      paymentMethods: updatedPayments,
      totalPaid,
      balanceDue: invoiceData.totalAmount - totalPaid
    });
  };
  
  const updateDiscount = (value: number) => {
    if (!invoiceData) return;
    
    const discountPercentage = value;
    const discountAmount = (invoiceData.subtotal * discountPercentage) / 100;
    const taxableAmount = invoiceData.subtotal - discountAmount;
    const taxAmount = (taxableAmount * invoiceData.tax) / 100;
    const totalAmount = invoiceData.subtotal - discountAmount + taxAmount + invoiceData.serviceCharges + invoiceData.serviceTip;
    
    setInvoiceData({
      ...invoiceData,
      discount: discountPercentage,
      taxAmount,
      totalAmount,
      balanceDue: totalAmount - invoiceData.totalPaid
    });
  };
  
  const updateTax = (value: number) => {
    if (!invoiceData) return;
    
    const discountAmount = (invoiceData.subtotal * invoiceData.discount) / 100;
    const taxableAmount = invoiceData.subtotal - discountAmount;
    const taxAmount = (taxableAmount * value) / 100;
    const totalAmount = invoiceData.subtotal - discountAmount + taxAmount + invoiceData.serviceCharges + invoiceData.serviceTip;
    
    setInvoiceData({
      ...invoiceData,
      tax: value,
      taxAmount,
      totalAmount,
      balanceDue: totalAmount - invoiceData.totalPaid
    });
  };
  
  const updateServiceCharges = (value: number) => {
    if (!invoiceData) return;
    
    const discountAmount = (invoiceData.subtotal * invoiceData.discount) / 100;
    const taxableAmount = invoiceData.subtotal - discountAmount;
    const taxAmount = (taxableAmount * invoiceData.tax) / 100;
    const totalAmount = invoiceData.subtotal - discountAmount + taxAmount + value + invoiceData.serviceTip;
    
    setInvoiceData({
      ...invoiceData,
      serviceCharges: value,
      totalAmount,
      balanceDue: totalAmount - invoiceData.totalPaid
    });
  };
  
 const generatePDF = () => {
  if (!invoiceData) return;
  
  const doc = new jsPDF(); // Portrait mode for better layout
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // ===== COMPANY HEADER =====
  doc.setFontSize(22);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("Jam Beauty Lounge", margin, 20);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("BASEMENT, NEAR TO CARRYFOUR, MARINA MALL", margin, 28);
  doc.text(`Contact: 028766460 | Email: jambeauty@gmail.com`, margin, 34);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text('TAX INVOICE', pageWidth - margin - 40, 20);
  
  doc.setDrawColor(0, 51, 102);
  doc.line(margin, 40, pageWidth - margin, 40);
  
  // ===== CUSTOMER INFORMATION =====
  let yPos = 50;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text('Customer Information:', margin, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${invoiceData.customerName}`, margin, yPos);
  yPos += 6;
  doc.text(`Phone: ${invoiceData.customerPhone}`, margin, yPos);
  yPos += 6;
  doc.text(`Email: ${invoiceData.customerEmail}`, margin, yPos);
  yPos += 6;
  doc.text(`Date: ${invoiceData.serviceDate}  Time: ${invoiceData.serviceTime}`, margin, yPos);
  
  // TRN Number (if available)
  if (invoiceData.trnNumber) {
    yPos += 6;
    doc.text(`TRN: ${invoiceData.trnNumber}`, margin, yPos);
  }
  
  // Invoice Details on Right
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice: ${invoiceData.invoiceNumber}`, pageWidth - margin - 60, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${invoiceData.invoiceDate}`, pageWidth - margin - 60, 57);
  
  // ===== SERVICES TABLE =====
  yPos = 90;
  if (invoiceData.trnNumber) {
    yPos = 100; // Adjust if TRN was added
  }
  
  const tableHeaders = [['Service', 'Branch', 'Staff', 'Duration', 'Qty', 'Price', 'Tip', 'Total']];
  const tableData = invoiceData.items.map(item => [
    item.description,
    item.branch || 'Main Branch',
    item.staff || 'Not Assigned',
    item.duration || '60 min',
    item.quantity.toString(),
    formatCurrency(item.price),
    formatCurrency(item.tip || 0),
    formatCurrency(item.total + (item.tip || 0))
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 25, halign: 'right' }
    }
  });
  
  const tableEndY = (doc as any).lastAutoTable.finalY + 15;
  
  // ===== PAYMENT METHODS =====
  yPos = tableEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text('Payment Methods:', margin, yPos);
  
  yPos += 7;
  invoiceData.paymentMethods.forEach((payment, index) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${payment.label}: ${formatCurrency(payment.amount)}`, margin + 5, yPos);
    if (payment.details) {
      doc.text(`  ${payment.details}`, margin + 15, yPos + 5);
      yPos += 10;
    } else {
      yPos += 6;
    }
  });
  
  if (invoiceData.cardLast4Digits) {
    doc.text(`Card: ****${invoiceData.cardLast4Digits}`, margin + 5, yPos);
    yPos += 6;
  }
  
  // ===== SUMMARY SECTION (RIGHT SIDE) =====
  const summaryX = pageWidth - margin - 85;
  let summaryY = tableEndY;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text('Summary:', summaryX, summaryY);
  
  summaryY += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Subtotal
  doc.text(`Subtotal:`, summaryX, summaryY);
  doc.text(formatCurrency(invoiceData.subtotal), summaryX + 55, summaryY, { align: 'right' });
  summaryY += 6;
  
  // Tips
  if (invoiceData.serviceTip > 0) {
    doc.text(`Tips:`, summaryX, summaryY);
    doc.text(formatCurrency(invoiceData.serviceTip), summaryX + 55, summaryY, { align: 'right' });
    summaryY += 6;
  }
  
  // Discount
  if (invoiceData.discount > 0) {
    const discountAmount = (invoiceData.subtotal * invoiceData.discount) / 100;
    doc.text(`Discount (${invoiceData.discount}%):`, summaryX, summaryY);
    doc.text(`-${formatCurrency(discountAmount)}`, summaryX + 55, summaryY, { align: 'right' });
    summaryY += 6;
  }
  
  // Tax
  doc.text(`Tax (${invoiceData.tax}%):`, summaryX, summaryY);
  doc.text(formatCurrency(invoiceData.taxAmount), summaryX + 55, summaryY, { align: 'right' });
  summaryY += 6;
  
  // Service Charges
  if (invoiceData.serviceCharges > 0) {
    doc.text(`Service Charges:`, summaryX, summaryY);
    doc.text(formatCurrency(invoiceData.serviceCharges), summaryX + 55, summaryY, { align: 'right' });
    summaryY += 6;
  }
  
  // Total (Bold) - with separator line
  summaryY += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX, summaryY - 2, summaryX + 65, summaryY - 2);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Total:`, summaryX, summaryY + 4);
  doc.text(formatCurrency(invoiceData.totalAmount), summaryX + 55, summaryY + 4, { align: 'right' });
  
  // ===== FOOTER =====
  const footerY = doc.internal.pageSize.height - 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text('THANK YOU FOR YOUR BUSINESS', pageWidth / 2, footerY, { align: 'center' });
  
  doc.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
};
  
  const filteredServices = servicesList.filter(service =>
    service.name.toLowerCase().includes(searchService.toLowerCase())
  );
  
  if (!appointment || !invoiceData) return null;
  
  return (
    <Sheet open={true} onOpenChange={onClose}>
      {/* Sheet full width - whole page */}
      <SheetContent className="w-full sm:max-w-full p-0 overflow-y-auto">
        <SheetTitle className="sr-only">Generate Invoice</SheetTitle>
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Receipt className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Generate Invoice</h2>
                <p className="text-base text-gray-500">
                  {invoiceData.invoiceNumber}
                </p>
              </div>
            </div>
            {loading && (
              <Badge className="bg-blue-500 animate-pulse text-base px-4 py-2">Loading...</Badge>
            )}
          </div>
        </div>

        <div className="p-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
                <p className="text-xl text-gray-600">Loading invoice data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Customer Details Section - Branch and Barber REMOVED */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-700 mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <Input
                      value={invoiceData.customerName}
                      onChange={(e) => setInvoiceData({...invoiceData, customerName: e.target.value})}
                      className="h-10 text-base"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <Input
                      type="email"
                      value={invoiceData.customerEmail}
                      onChange={(e) => setInvoiceData({...invoiceData, customerEmail: e.target.value})}
                      className="h-10 text-base"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <Input
                      value={invoiceData.customerPhone}
                      onChange={(e) => setInvoiceData({...invoiceData, customerPhone: e.target.value})}
                      className="h-10 text-base"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <Input
                      type="date"
                      value={invoiceData.serviceDate}
                      onChange={(e) => setInvoiceData({...invoiceData, serviceDate: e.target.value})}
                      className="h-10 text-base"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Time</p>
                    <Input
                      type="time"
                      value={invoiceData.serviceTime}
                      onChange={(e) => setInvoiceData({...invoiceData, serviceTime: e.target.value})}
                      className="h-10 text-base"
                    />
                  </div>
                </div>
              </div>
              
              {/* Services Table - WITH ALL COLUMNS */}
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-blue-600" />
                    Services
                  </h3>
                  <Button 
                    size="default"
                    variant="outline"
                    onClick={() => setShowServicesDropdown(true)}
                    className="flex items-center gap-2 text-base h-10"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service
                  </Button>
                </div>
                
                {/* Services Dropdown */}
                {showServicesDropdown && (
                  <div className="mb-5 p-5 bg-gray-50 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-base">Select Service to Add</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowServicesDropdown(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search services..."
                        value={searchService}
                        onChange={(e) => setSearchService(e.target.value)}
                        className="pl-10 h-10 text-base"
                      />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {filteredServices.map((service) => (
                        <div 
                          key={service.id}
                          className="p-4 bg-white border rounded-lg hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                          onClick={() => addServiceFromList(service)}
                        >
                          <div>
                            <p className="font-medium text-base">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.category} • {service.duration} min</p>
                          </div>
                          <p className="font-bold text-green-600 text-lg">{formatCurrency(service.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="w-full text-base">
                    <thead className="bg-gray-50 border-y">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Service</th>
                        <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Branch</th>
                        <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Staff</th>
                        <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 w-24">Duration</th>
                        <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 w-20">Qty</th>
                        <th className="px-4 py-4 text-right text-sm font-medium text-gray-500 w-28">Price</th>
                        <th className="px-4 py-4 text-right text-sm font-medium text-gray-500 w-28">Tip (AED)</th>
                        <th className="px-4 py-4 text-right text-sm font-medium text-gray-500 w-28">Total</th>
                        <th className="px-4 py-4 text-center w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoiceData.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="h-9 text-base"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              value={item.branch || invoiceData.branch}
                              onChange={(e) => updateItem(item.id, 'branch', e.target.value)}
                              className="h-9 text-base"
                              placeholder="Branch"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              value={item.staff || invoiceData.barber}
                              onChange={(e) => updateItem(item.id, 'staff', e.target.value)}
                              className="h-9 text-base"
                              placeholder="Staff"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              value={item.duration || '60 min'}
                              onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                              className="h-9 text-base text-center"
                              placeholder="Duration"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="h-9 text-base text-center"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="h-9 text-base text-right"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.tip || 0}
                              onChange={(e) => updateItemTip(item.id, parseFloat(e.target.value) || 0)}
                              className="h-9 text-base text-right border-blue-200 focus:border-blue-500"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-base">
                            {formatCurrency(item.total + (item.tip || 0))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="h-9 w-9 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Tips Summary */}
                {invoiceData.serviceTip > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                    <span className="text-base font-medium text-blue-700">Total Tips:</span>
                    <span className="text-xl font-bold text-blue-700">{formatCurrency(invoiceData.serviceTip)}</span>
                  </div>
                )}
              </div>
              
              {/* Payment Methods */}
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Payment Methods
                  </h3>
                  <Button 
                    size="default"
                    variant="outline"
                    onClick={() => setShowNewPaymentMethod(true)}
                    className="flex items-center gap-2 text-base h-10"
                  >
                    <Plus className="w-4 h-4" />
                    Add Method
                  </Button>
                </div>
                
                {/* New Payment Method Form */}
                {showNewPaymentMethod && (
                  <div className="mb-5 p-5 bg-gray-50 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-base">Add Payment Method</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowNewPaymentMethod(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Type</p>
                        <Select
                          value={newPaymentMethod.type}
                          onValueChange={(value: any) => setNewPaymentMethod({...newPaymentMethod, type: value})}
                        >
                          <SelectTrigger className="h-10 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="digital">Digital</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="wallet">Wallet</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Name</p>
                        <Input
                          value={newPaymentMethod.label}
                          onChange={(e) => setNewPaymentMethod({...newPaymentMethod, label: e.target.value})}
                          placeholder="e.g., Credit Card"
                          className="h-10 text-base"
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Amount</p>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPaymentMethod.amount}
                          onChange={(e) => setNewPaymentMethod({...newPaymentMethod, amount: parseFloat(e.target.value) || 0})}
                          className="h-10 text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={addPaymentMethod} size="default" className="bg-green-600 text-base h-10 px-6">
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {invoiceData.paymentMethods.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.type === 'cash' ? 'bg-green-100' :
                          payment.type === 'digital' ? 'bg-purple-100' :
                          payment.type === 'card' ? 'bg-blue-100' : 
                          payment.type === 'check' ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          {payment.type === 'cash' && <DollarSign className="w-5 h-5 text-green-600" />}
                          {payment.type === 'digital' && <Smartphone className="w-5 h-5 text-purple-600" />}
                          {payment.type === 'card' && <CreditCard className="w-5 h-5 text-blue-600" />}
                          {payment.type === 'check' && <FileText className="w-5 h-5 text-orange-600" />}
                          {payment.type === 'wallet' && <Wallet className="w-5 h-5 text-indigo-600" />}
                          {payment.type === 'other' && <Coins className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-base">{payment.label}</p>
                          {payment.details && (
                            <p className="text-sm text-gray-500">{payment.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payment.amount}
                          onChange={(e) => updatePaymentMethod(index, parseFloat(e.target.value) || 0)}
                          className="w-28 h-9 text-base text-right"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaymentMethod(index)}
                          className="h-9 w-9 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {invoiceData.paymentMethods.length === 0 && !showNewPaymentMethod && (
                    <div className="text-center p-5 bg-gray-50 rounded-lg">
                      <p className="text-base text-gray-500">No payment methods added</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Discount, Tax, Service Charges */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-700 mb-5 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Charges & Discounts
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Discount (%)</p>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoiceData.discount}
                      onChange={(e) => updateDiscount(parseFloat(e.target.value) || 0)}
                      className="h-10 text-base"
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tax (%)</p>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoiceData.tax}
                      onChange={(e) => updateTax(parseFloat(e.target.value) || 0)}
                      className="h-10 text-base"
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service Charges</p>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceData.serviceCharges}
                      onChange={(e) => updateServiceCharges(parseFloat(e.target.value) || 0)}
                      className="h-10 text-base"
                    />
                  </div>
                </div>
              </div>
              
              {/* TRN Number & Card Last 4 */}
              <div className="bg-white border rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">TRN Number</p>
                    <Input
                      value={invoiceData.trnNumber}
                      onChange={(e) => setInvoiceData({...invoiceData, trnNumber: e.target.value})}
                      placeholder="Enter TRN number"
                      className="h-10 text-base"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Card Last 4 Digits</p>
                    <Input
                      value={invoiceData.cardLast4Digits}
                      onChange={(e) => setInvoiceData({...invoiceData, cardLast4Digits: e.target.value})}
                      maxLength={4}
                      placeholder="1234"
                      className="h-10 text-base"
                    />
                  </div>
                </div>
              </div>
              
              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(invoiceData.subtotal)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tips</p>
                    <p className="text-xl font-semibold text-green-600">{formatCurrency(invoiceData.serviceTip)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-xl font-semibold text-green-600">{formatCurrency(invoiceData.totalPaid)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(invoiceData.totalAmount)}</p>
                  </div>
                </div>
                
                {invoiceData.balanceDue > 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg text-center">
                    <p className="text-base text-yellow-800">
                      Balance Due: {formatCurrency(invoiceData.balanceDue)}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Notes */}
              <div className="bg-white border rounded-xl p-6">
                <p className="text-sm text-gray-500 mb-2">Notes</p>
                <Textarea
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                  placeholder="Add any notes..."
                  rows={3}
                  className="text-base"
                />
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6">
                <Button variant="outline" onClick={onClose} size="lg" className="text-base h-12 px-8">
                  Cancel
                </Button>
                <Button 
                  onClick={generatePDF}
                  className="bg-green-600 hover:bg-green-700 text-white gap-3 text-base h-12 px-8"
                  size="lg"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};


// ✅ COMPLETE CHECKOUT POPUP - with CONFIRMATION POPUP (FIXED)
const CheckoutPopup = ({ 
  appointment, 
  onClose,
  onProcessPayment,
  formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'AED 0.00';
    }
    return `AED ${amount.toFixed(2)}`;
  }
}: { 
  appointment: Appointment | null; 
  onClose: () => void;
  onProcessPayment?: (data: any) => void;
  formatCurrency?: (amount: number) => string;
}) => {
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  
  // Editable fields state
  const [services, setServices] = useState<any[]>(appointment?.serviceDetails || []);
  const [tips, setTips] = useState<{[key: string]: number}>({});
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(5);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [manualPaymentDetails, setManualPaymentDetails] = useState({
    methodName: '',
    amount: 0
  });
  const [paymentMethods, setPaymentMethods] = useState<Array<{type: string, label: string, amount: number}>>([]);

  // Safe format function
  const safeFormat = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'AED 0.00';
    }
    return `AED ${amount.toFixed(2)}`;
  };

  // Calculate totals with safe defaults
  const subtotal = services?.reduce((sum, s) => sum + (s?.price || 0), 0) || 0;
  const totalTips = Object.values(tips).reduce((sum, t) => sum + (t || 0), 0) || 0;
  const discountAmount = (subtotal * (discount || 0)) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (tax || 0)) / 100;
  const totalAmount = subtotal - discountAmount + taxAmount + (serviceCharges || 0) + totalTips;
  const totalPaid = paymentMethods.reduce((sum, pm) => sum + (pm?.amount || 0), 0) || 0;
  const balanceDue = totalAmount - totalPaid;

  // Update service price
  const updateServicePrice = (index: number, newPrice: number) => {
    const updated = [...services];
    updated[index] = { ...updated[index], price: newPrice || 0 };
    setServices(updated);
  };

  // Update service staff
  const updateServiceStaff = (index: number, newStaff: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], staff: newStaff || '' };
    setServices(updated);
  };

  // Update tip manually
  const updateTip = (staffName: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setTips(prev => ({ ...prev, [staffName]: amount }));
  };

  // Add payment method
  const addPaymentMethod = () => {
    if (!selectedPaymentMethod) return;
    
    let methodLabel = '';
    switch(selectedPaymentMethod) {
      case 'cash': methodLabel = 'Cash'; break;
      case 'visa': methodLabel = 'Visa Card'; break;
      case 'mastercard': methodLabel = 'MasterCard'; break;
      case 'unpaid': methodLabel = 'Unpaid'; break;
    }
    
    setPaymentMethods([
      ...paymentMethods,
      {
        type: selectedPaymentMethod,
        label: methodLabel,
        amount: totalAmount - totalPaid
      }
    ]);
  };

  // Handle manual payment
  const addManualPayment = () => {
    if (!manualPaymentDetails.methodName || manualPaymentDetails.amount <= 0) {
      alert('Please enter method name and amount');
      return;
    }
    
    setPaymentMethods([
      ...paymentMethods,
      {
        type: 'manual',
        label: manualPaymentDetails.methodName,
        amount: manualPaymentDetails.amount
      }
    ]);
    
    setShowManualPayment(false);
    setManualPaymentDetails({ methodName: '', amount: 0 });
  };

  // Handle Pay button click - Show confirmation popup
  const handlePayClick = () => {
    if (paymentMethods.length === 0) {
      alert('Please select a payment method');
      return;
    }
    setShowConfirmationPopup(true);
  };

 // Handle confirmation - Close confirmation and show invoice
const handleConfirmPayment = () => {
  setShowConfirmationPopup(false);
  
  const paymentData = {
    appointment,
    services,
    tips,
    discount,
    tax,
    serviceCharges,
    subtotal,
    totalAmount,
    paymentMethods,
    totalPaid,
    balanceDue
  };
  
  // Show invoice popup - YAHAN InvoicePopup CALL HO RAHA HAI
  setShowInvoicePopup(true);
  
  if (onProcessPayment) {
    onProcessPayment(paymentData);
  }
};

  // Void function - reset to start
  const handleVoid = () => {
    if (confirm('Void this transaction and start over?')) {
      setServices(appointment?.serviceDetails || []);
      setTips({});
      setDiscount(0);
      setTax(5);
      setServiceCharges(0);
      setPaymentMethods([]);
      setSelectedPaymentMethod(null);
    }
  };

  if (!appointment) return null;

  return (
    <>
      {/* ✅ MAIN CHECKOUT POPUP */}
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-full p-0 bg-white overflow-y-auto">
          <SheetTitle className="sr-only">Checkout</SheetTitle>
          
          {/* Pink Header */}
          <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white z-10 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Checkout</h2>
                  <p className="text-pink-100 text-xs">Booking #{appointment.bookingNumber || appointment.id}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-full">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Main Content - 2 COLUMNS */}
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* LEFT COLUMN - Services */}
              <div className="space-y-3">
                {/* Services List */}
                <div className="bg-white border border-pink-100 rounded-lg p-3 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-pink-500" />
                    Services
                  </h3>
                  
                  <div className="space-y-2">
                    {services.map((service, index) => (
                      <div key={index} className="border border-pink-100 rounded-lg p-2 bg-pink-50/30">
                        {/* Service Header with Price */}
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-gray-800 text-xs">{service.name}</p>
                          <Input
                            type="number"
                            value={service.price || 0}
                            onChange={(e) => updateServicePrice(index, parseFloat(e.target.value) || 0)}
                            className="w-16 h-6 text-right text-xs border-pink-200"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        {/* Staff and Tip in one row */}
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {/* Staff */}
                          <div>
                            <p className="text-[10px] text-pink-600 mb-0.5">Staff</p>
                            <Input
                              value={service.staff || ''}
                              onChange={(e) => updateServiceStaff(index, e.target.value)}
                              className="h-5 text-[10px] border-pink-200 w-full px-1"
                              placeholder="Staff name"
                            />
                          </div>
                          
                          {/* Tip - Manual Field */}
                          <div>
                            <p className="text-[10px] text-pink-600 mb-0.5">Tip (AED)</p>
                            <Input
                              type="number"
                              value={tips[service.staff] || 0}
                              onChange={(e) => updateTip(service.staff, e.target.value)}
                              className="h-5 text-[10px] border-pink-200 w-full px-1 text-right"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white border border-pink-100 rounded-lg p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-800 mb-1">
                    {appointment.customerName || appointment.customer || 'Customer'}
                  </h3>
                  <p className="text-[10px] text-gray-600">
                    {appointment.customerPhone || appointment.phone || 'No phone'}
                  </p>
                  {appointment.customerEmail && (
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                      {appointment.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Summary & Payment */}
              <div className="space-y-3">
                {/* Summary */}
                <div className="bg-white border border-pink-100 rounded-lg p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-pink-500" />
                    Summary
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs border-b border-pink-100 pb-1">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{safeFormat(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">Discount</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-12 h-5 text-right text-[10px] border-pink-200"
                            min="0"
                            max="100"
                            step="1"
                          />
                          <span className="text-[10px] text-pink-600 ml-1">%</span>
                        </div>
                        <span className="text-[10px] text-red-600 min-w-[50px] text-right">
                          -{safeFormat(discountAmount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">VAT</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Input
                            type="number"
                            value={tax}
                            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                            className="w-12 h-5 text-right text-[10px] border-pink-200"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="text-[10px] text-pink-600 ml-1">%</span>
                        </div>
                        <span className="text-[10px] text-gray-600 min-w-[50px] text-right">
                          {safeFormat(taxAmount)}
                        </span>
                      </div>
                    </div>
                    
                    {totalTips > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Tips Total</span>
                        <span className="font-medium text-green-600">{safeFormat(totalTips)}</span>
                      </div>
                    )}
                    
                    <div className="border-t-2 border-pink-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">Total</span>
                        <span className="text-lg font-bold text-pink-600">{safeFormat(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white border border-pink-100 rounded-lg p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-pink-500" />
                    Payment
                  </h3>
                  
                  {/* Payment Method Buttons */}
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`text-[10px] h-6 ${selectedPaymentMethod === 'cash' ? 'bg-pink-100 border-pink-500' : ''}`}
                      onClick={() => {
                        setSelectedPaymentMethod('cash');
                        addPaymentMethod();
                      }}
                    >
                      Cash
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`text-[10px] h-6 ${selectedPaymentMethod === 'mastercard' ? 'bg-pink-100 border-pink-500' : ''}`}
                      onClick={() => {
                        setSelectedPaymentMethod('mastercard');
                        addPaymentMethod();
                      }}
                    >
                      MasterCard
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`text-[10px] h-6 ${selectedPaymentMethod === 'visa' ? 'bg-pink-100 border-pink-500' : ''}`}
                      onClick={() => {
                        setSelectedPaymentMethod('visa');
                        addPaymentMethod();
                      }}
                    >
                      Visa
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`text-[10px] h-6 text-gray-500 ${selectedPaymentMethod === 'unpaid' ? 'bg-pink-100 border-pink-500' : ''}`}
                      onClick={() => {
                        setSelectedPaymentMethod('unpaid');
                        addPaymentMethod();
                      }}
                    >
                      Unpaid
                    </Button>
                  </div>

                  {/* Added Payment Methods Display */}
                  {paymentMethods.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {paymentMethods.map((pm, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-pink-50 p-1 rounded">
                          <span className="text-[10px] font-medium">{pm.label}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-pink-600">{safeFormat(pm.amount)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPaymentMethods(paymentMethods.filter((_, i) => i !== idx))}
                              className="h-4 w-4 p-0 text-red-500"
                            >
                              <X className="w-2.5 h-2.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manual Payment */}
                  {!showManualPayment ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full text-pink-600 hover:bg-pink-50 text-[10px] h-5 border border-dashed border-pink-200"
                      onClick={() => setShowManualPayment(true)}
                    >
                      <Plus className="w-2.5 h-2.5 mr-0.5" /> Add Manual Payment
                    </Button>
                  ) : (
                    <div className="mt-1 p-2 bg-pink-50 rounded space-y-1">
                      <Input
                        placeholder="Method name"
                        value={manualPaymentDetails.methodName}
                        onChange={(e) => setManualPaymentDetails({...manualPaymentDetails, methodName: e.target.value})}
                        className="h-5 text-[10px] border-pink-200"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={manualPaymentDetails.amount || ''}
                        onChange={(e) => setManualPaymentDetails({...manualPaymentDetails, amount: parseFloat(e.target.value) || 0})}
                        className="h-5 text-[10px] border-pink-200"
                      />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={addManualPayment} className="flex-1 bg-pink-600 text-[10px] h-5">Add</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowManualPayment(false)} className="flex-1 text-[10px] h-5">Cancel</Button>
                      </div>
                    </div>
                  )}

                  {/* Pay Button */}
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-sm font-semibold mt-2"
                    onClick={handlePayClick}
                    disabled={paymentMethods.length === 0}
                  >
                    Pay {safeFormat(balanceDue)}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ✅ CONFIRMATION POPUP - Small and Clean */}
      <Sheet open={showConfirmationPopup} onOpenChange={setShowConfirmationPopup}>
        <SheetContent className="w-full sm:max-w-md p-0 bg-white rounded-2xl shadow-xl mx-auto my-auto h-fit max-h-[90vh] overflow-y-auto">
          <SheetTitle className="sr-only">Confirm Payment</SheetTitle>
          
          {/* Pink Header */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Confirm Payment</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowConfirmationPopup(false)} className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Summary Content */}
          <div className="p-6 space-y-4">
            <div className="bg-pink-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{safeFormat(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount ({discount}%)</span>
                  <span className="font-medium text-red-600">-{safeFormat(discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT ({tax}%)</span>
                <span className="font-medium">{safeFormat(taxAmount)}</span>
              </div>
              
              {serviceCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Charges</span>
                  <span className="font-medium">{safeFormat(serviceCharges)}</span>
                </div>
              )}
              
              {totalTips > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tips</span>
                  <span className="font-medium text-green-600">{safeFormat(totalTips)}</span>
                </div>
              )}
              
              <div className="border-t border-pink-200 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span className="text-pink-600">{safeFormat(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-pink-50 p-3 rounded-lg">
              <p className="text-xs text-pink-600 mb-1">Payment Method</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center">
                  {paymentMethods[0]?.type === 'cash' && <DollarSign className="w-3 h-3 text-pink-700" />}
                  {paymentMethods[0]?.type === 'visa' && <CreditCard className="w-3 h-3 text-pink-700" />}
                  {paymentMethods[0]?.type === 'mastercard' && <CreditCard className="w-3 h-3 text-pink-700" />}
                </div>
                <span className="font-medium text-sm">{paymentMethods[0]?.label}</span>
                <span className="ml-auto font-bold text-pink-600">{safeFormat(paymentMethods[0]?.amount)}</span>
              </div>
              {paymentMethods.length > 1 && (
                <p className="text-xs text-gray-500 mt-1">+{paymentMethods.length - 1} more method(s)</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmationPopup(false)}
                className="flex-1 border-pink-200 text-gray-700"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirmPayment}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white"
              >
                Proceed
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ✅ INVOICE POPUP - SIRF YEH EK RAHE (DUPLICATE WALA HATA DO) */}
      {showInvoicePopup && (
        <InvoicePopup
          appointment={appointment}
          services={services}
          tips={tips}
          discount={discount}
          tax={tax}
          serviceCharges={serviceCharges}
          subtotal={subtotal}
          totalAmount={totalAmount}
          paymentMethods={paymentMethods}
          totalPaid={totalPaid}
          balanceDue={balanceDue}
          onClose={() => {
            setShowInvoicePopup(false);
            onClose();
          }}
          onVoid={handleVoid}
          formatCurrency={safeFormat}
        />
      )}
    </>
  );
};


// ✅ MAIN POPUP - PINKISH THEME with COMPRESSED HEIGHT and DROPDOWN AT BOTTOM
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
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [freshAppointment, setFreshAppointment] = useState<Appointment | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState<Partial<Appointment>>({});
  const [editedServices, setEditedServices] = useState<any[]>([]);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  
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
        
        const updatedAppointment: Appointment = {
          ...appointment,
          ...firebaseData,
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
          paymentAmounts: firebaseData.paymentAmounts || {},
          bookingNumber: firebaseData.bookingNumber || appointment.bookingNumber,
          price: firebaseData.totalAmount || firebaseData.servicePrice || 0,
          date: firebaseData.bookingDate || firebaseData.date || appointment.date,
          time: firebaseData.bookingTime || firebaseData.time || appointment.time,
          status: firebaseData.status || appointment.status
        };
        
        setFreshAppointment(updatedAppointment);
        setEditedAppointment(updatedAppointment);
        setEditedServices(updatedAppointment.serviceDetails || []);
      }
    } catch (error) {
      console.error("Error fetching fresh data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMoreOptionClick = async (action: string) => {
    if (!displayAppointment?.firebaseId) {
      alert("No Firebase ID found");
      return;
    }
    
    setShowMoreOptions(false);
    
    switch (action) {
      case 'edit':
        setIsEditMode(true);
        break;
      case 'reschedule':
        setRescheduleDate(displayAppointment.bookingDate || displayAppointment.date || '');
        setRescheduleTime(displayAppointment.bookingTime || displayAppointment.time || '');
        setShowRescheduleDialog(true);
        break;
      case 'cancel':
        setCancelReason('');
        setShowCancelDialog(true);
        break;
      case 'noshow':
        setShowDeleteConfirm(true);
        break;
    }
  };
  
  const updateStatusOnly = async (newStatus: string) => {
    if (!displayAppointment?.firebaseId) return;
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, "bookings", displayAppointment.firebaseId), {
        status: newStatus,
        updatedAt: new Date()
      });
      if (freshAppointment) setFreshAppointment({...freshAppointment, status: newStatus});
      if (onStatusChange) onStatusChange(displayAppointment.firebaseId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const handleCancelWithReason = async () => {
    if (!displayAppointment?.firebaseId || !cancelReason.trim()) return;
    setUpdatingStatus(true);
    try {
      await deleteDoc(doc(db, "bookings", displayAppointment.firebaseId));
      if (onStatusChange) onStatusChange(displayAppointment.firebaseId, 'cancelled');
      setShowCancelDialog(false);
      onClose();
    } catch (error) {
      console.error("Error cancelling:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const handleDeleteAppointment = async () => {
    if (!displayAppointment?.firebaseId) return;
    setUpdatingStatus(true);
    try {
      await deleteDoc(doc(db, "bookings", displayAppointment.firebaseId));
      if (onStatusChange) onStatusChange(displayAppointment.firebaseId, 'deleted');
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const handleRescheduleSave = async () => {
    if (!displayAppointment?.firebaseId || !rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    try {
      await updateDoc(doc(db, "bookings", displayAppointment.firebaseId), {
        status: 'rescheduled',
        bookingDate: rescheduleDate,
        bookingTime: rescheduleTime,
        date: rescheduleDate,
        time: rescheduleTime,
        updatedAt: new Date()
      });
      if (freshAppointment) {
        setFreshAppointment({
          ...displayAppointment,
          status: 'rescheduled',
          bookingDate: rescheduleDate,
          bookingTime: rescheduleTime
        } as Appointment);
      }
      if (onStatusChange) onStatusChange(displayAppointment.firebaseId, 'rescheduled');
      setShowRescheduleDialog(false);
    } catch (error) {
      console.error("Error rescheduling:", error);
    } finally {
      setRescheduling(false);
    }
  };
  
  const displayAppointment = freshAppointment || appointment;
  if (!displayAppointment) return null;
  
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-emerald-100 text-emerald-800";
      case "accepted": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rescheduled": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <>
      {/* ✅ PINKISH THEME - FULL WIDTH MAIN POPUP */}
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-full p-0 bg-white overflow-y-auto">
          <SheetTitle className="sr-only">Appointment Details</SheetTitle>
          
          {/* Pink Header - WITHOUT 3 DOTS */}
          <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white z-10 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Appointment Details</h2>
                  <p className="text-pink-100 text-sm">Booking #{displayAppointment.bookingNumber || displayAppointment.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Status Dropdown - ONLY */}
                <Select
                  value={displayAppointment.status || 'pending'}
                  onValueChange={(value) => {
                    if (value === 'cancelled') {
                      setCancelReason('');
                      setShowCancelDialog(true);
                    } else {
                      updateStatusOnly(value);
                    }
                  }}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-32 h-8 bg-white/20 border-white/30 text-white text-sm">
                    <SelectValue>
                      <div className="flex items-center gap-1">
                        <span className="capitalize text-sm">{displayAppointment.status || 'pending'}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content - COMPRESSED HEIGHT */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT COLUMN - COMPRESSED */}
                <div className="space-y-4">
                  {/* Customer Information - COMPRESSED */}
                  <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <User className="w-4 h-4 text-pink-500" />
                      Customer Information
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between py-1 text-sm border-b border-pink-100">
                        <span className="text-pink-600">Name</span>
                        <span className="font-medium text-gray-800">{displayAppointment.customerName || displayAppointment.customer}</span>
                      </div>
                      <div className="flex justify-between py-1 text-sm border-b border-pink-100">
                        <span className="text-pink-600">Email</span>
                        <span className="font-medium text-gray-800 truncate max-w-[200px]">{displayAppointment.customerEmail || displayAppointment.email}</span>
                      </div>
                      <div className="flex justify-between py-1 text-sm border-b border-pink-100">
                        <span className="text-pink-600">Phone</span>
                        <span className="font-medium text-gray-800">{displayAppointment.customerPhone || displayAppointment.phone}</span>
                      </div>
                      <div className="flex justify-between py-1 text-sm">
                        <span className="text-pink-600">Branch</span>
                        <span className="font-medium text-gray-800">{displayAppointment.branch}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Schedule - COMPRESSED (EK COLUMN) */}
                  <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-pink-500" />
                      Schedule
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between py-1 text-sm border-b border-pink-100">
                        <span className="text-pink-600">Date</span>
                        <span className="font-medium text-gray-800">{displayAppointment.bookingDate || displayAppointment.date}</span>
                      </div>
                      <div className="flex justify-between py-1 text-sm border-b border-pink-100">
                        <span className="text-pink-600">Time</span>
                        <span className="font-medium text-gray-800">{displayAppointment.bookingTime || displayAppointment.time}</span>
                      </div>
                      <div className="flex justify-between py-1 text-sm">
                        <span className="text-pink-600">Duration</span>
                        <span className="font-medium text-gray-800">{displayAppointment.duration || '60 min'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* RIGHT COLUMN - COMPRESSED */}
                <div className="space-y-4">
                  {/* Services - WITH CATEGORY AND DURATION */}
                  <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <Scissors className="w-4 h-4 text-pink-500" />
                      Services
                    </h3>
                    
                    <div className="space-y-3">
                      {displayAppointment.serviceDetails?.map((service: any, idx: number) => (
                        <div key={idx} className="bg-pink-50 p-3 rounded-lg">
                          {/* Service Name and Price */}
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-800 text-sm">{service.name}</span>
                              {service.category && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-pink-200 text-pink-800">
                                  {service.category}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-pink-600">{formatCurrency(service.price)}</span>
                          </div>
                          
                          {/* Service Details - 3 Columns */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-pink-600 block text-[10px]">Staff</span>
                              <span className="font-medium text-gray-700 text-xs truncate">{service.staff || '—'}</span>
                            </div>
                            <div>
                              <span className="text-pink-600 block text-[10px]">Duration</span>
                              <span className="font-medium text-gray-700 text-xs">
                                {service.duration ? `${service.duration}min` : displayAppointment.duration || '60min'}
                              </span>
                            </div>
                            <div>
                              <span className="text-pink-600 block text-[10px]">Branch</span>
                              <span className="font-medium text-gray-700 text-xs truncate">{service.branch || displayAppointment.branch}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total Amount */}
                      <div className="border-t border-pink-200 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium text-sm">Total</span>
                          <span className="text-pink-600 font-bold">
                            {formatCurrency(displayAppointment.totalAmount || displayAppointment.servicePrice || displayAppointment.price || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>


                  

                  {/* PROCEED TO CHECKOUT WITH MORE OPTIONS - SAME LINE */}
<div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
  <div className="flex items-center gap-3">
    {/* More Options Button */}
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowMoreOptions(!showMoreOptions)}
        className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white hover:text-white px-4 py-3 text-sm rounded-xl flex items-center gap-2 shadow-md flex-1"
      >
        <Settings className="w-4 h-4" />
        <span>More Options</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
      </Button>
      
      
      {showMoreOptions && (
  <div className="absolute left-0 bottom-full mb-1 w-48 bg-white rounded-lg shadow-lg border border-pink-100 z-50">
    <div className="py-1">
      <button 
        onClick={() => handleMoreOptionClick('edit')} 
        className="w-full px-3 py-2 text-left hover:bg-pink-50 flex items-center gap-2 text-xs text-gray-700 border-b border-pink-50 last:border-b-0"
      >
        <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
          <Scissors className="w-3 h-3 text-pink-600" />
        </div>
        <span className="font-medium">Edit Appointment</span>
      </button>
      
      <button 
        onClick={() => handleMoreOptionClick('reschedule')} 
        className="w-full px-3 py-2 text-left hover:bg-pink-50 flex items-center gap-2 text-xs text-gray-700 border-b border-pink-50 last:border-b-0"
      >
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <RotateCcw className="w-3 h-3 text-blue-600" />
        </div>
        <span className="font-medium">Reschedule</span>
      </button>
      
      <button 
        onClick={() => handleMoreOptionClick('cancel')} 
        className="w-full px-3 py-2 text-left hover:bg-pink-50 flex items-center gap-2 text-xs text-gray-700 border-b border-pink-50 last:border-b-0"
      >
        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
          <X className="w-3 h-3 text-orange-600" />
        </div>
        <span className="font-medium">Cancel</span>
      </button>
      
      <button 
        onClick={() => handleMoreOptionClick('noshow')} 
        className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-xs text-red-600"
      >
        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 className="w-3 h-3 text-red-600" />
        </div>
        <span className="font-medium">No Show & Delete</span>
      </button>
    </div>
  </div>
)}
    </div>

    {/* Proceed to Checkout Button */}
    <Button
      onClick={() => setShowCheckoutPopup(true)}
      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3 text-sm gap-2 shadow-md rounded-xl"
    >
      <Receipt className="w-4 h-4" />
      Proceed to Checkout
    </Button>
  </div>
</div>
                  
                 

                  {/* Notes if any - COMPRESSED */}
                  {displayAppointment.notes && (
                    <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
                      <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-1">
                        <FileText className="w-4 h-4 text-pink-500" />
                        Notes
                      </h3>
                      <p className="text-sm text-gray-700 bg-pink-50 p-2 rounded-lg">{displayAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Checkout Popup */}
      {showCheckoutPopup && (
        <CheckoutPopup
          appointment={displayAppointment}
          onClose={() => setShowCheckoutPopup(false)}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Cancel Dialog */}
      <Sheet open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <SheetContent className="w-full sm:max-w-md p-6">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold text-red-600">Cancel Appointment</SheetTitle>
            <SheetDescription>Please provide a reason</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)} size="sm" className="flex-1">Back</Button>
              <Button onClick={handleCancelWithReason} disabled={!cancelReason.trim()} className="bg-red-600 flex-1" size="sm">Confirm</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      <Sheet open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <SheetContent className="w-full sm:max-w-md p-6">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold text-red-600">Confirm Delete</SheetTitle>
            <SheetDescription>This action cannot be undone</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <p className="text-sm text-red-600">Permanently delete this appointment?</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} size="sm" className="flex-1">Cancel</Button>
              <Button onClick={handleDeleteAppointment} className="bg-red-600 flex-1" size="sm">Delete</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reschedule Dialog */}
      <Sheet open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <SheetContent className="w-full sm:max-w-md p-6">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">Reschedule</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="text-sm h-9" />
            <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="text-sm h-9" />
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => setShowRescheduleDialog(false)} size="sm" className="flex-1">Cancel</Button>
              <Button onClick={handleRescheduleSave} disabled={rescheduling} size="sm" className="flex-1">Reschedule</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
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

// NEW FUNCTION: Fetch branches from Firebase (sirf naam fetch karna hai)
const fetchBranchesFromFirebase = async (): Promise<Branch[]> => {
  try {
    const branchesRef = collection(db, "branches");
    const querySnapshot = await getDocs(branchesRef);
    
    const branches: Branch[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      branches.push({
        id: doc.id,
        name: data.name || "Unknown Branch", // SIRF NAAM CHAHIYE
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        phone: data.phone || "",
        email: data.email || "",
        status: data.status || "active",
        openingTime: data.openingTime || "09:00",
        closingTime: data.closingTime || "18:00",
        weeklyTimings: data.weeklyTimings || {}
      });
    });
    
    console.log("🏢 Branches fetched:", branches.map(b => b.name));
    return branches;
  } catch (error) {
    console.error("Error fetching branches:", error);
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
  // NEW: Selected branch for filtering
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
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
  
  // Load staff data
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

  // NEW: Load branches data
  useEffect(() => {
    const loadBranches = async () => {
      const branchesData = await fetchBranchesFromFirebase();
      setBranches(branchesData);
    };
    
    loadBranches();
  }, []);

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

  // ==================== MAIN FILTER LOGIC - EXACT BRANCH MATCH ====================
 // ==================== MAIN FILTER LOGIC - FIXED BRANCH MATCH ====================
const filteredAppointments = useMemo(() => {
  console.log("========== BRANCH FILTER DEBUG ==========");
  console.log("1️⃣ Selected Branch from Dropdown:", selectedBranch);
  console.log("2️⃣ Total Appointments Received:", appointments.length);
  
  // List all unique branches in appointments
  const uniqueBranches = [...new Set(appointments.map(apt => apt.branch))];
  console.log("3️⃣ Unique Branches in Appointments:", uniqueBranches);
  
  // First filter by date and barber
  const dateAndBarberFiltered = appointments.filter(apt => {
    const aptDate = typeof apt.date === 'string' ? parseISO(apt.date) : new Date(apt.date);
    const isSameDate = isSameDay(aptDate, selectedDate);
    const isSameBarber = selectedBarber === 'all' || apt.barber === selectedBarber;
    
    return isSameDate && isSameBarber;
  });
  
  console.log(`4️⃣ After Date/Barber filter: ${dateAndBarberFiltered.length} bookings`);
  
  // AGAR "ALL BRANCHES" SELECT HAI TO SAB DIKHAO
  if (selectedBranch === 'all') {
    console.log("5️⃣ Showing ALL branches - NO branch filter applied");
    return dateAndBarberFiltered;
  }
  
  // SPECIFIC BRANCH SELECT HAI - SIRF EXACT MATCH WALI BOOKINGS DIKHAO
  console.log(`5️⃣ Filtering for branch: "${selectedBranch}"`);
  
  const filtered = dateAndBarberFiltered.filter(apt => {
    // EXACT MATCH - Booking mein branch "Mubaraka" hai aur selected branch "Mubaraka" hai
    const aptBranch = apt.branch || '';
    
    // Convert both to strings and trim for exact comparison
    const aptBranchStr = String(aptBranch).trim();
    const selectedBranchStr = String(selectedBranch).trim();
    
    // Exact match comparison
    const isSameBranch = aptBranchStr === selectedBranchStr;
    
    console.log(`   🔸 ${apt.customerName || apt.customer}: branch="${aptBranchStr}" | match=${isSameBranch}`);
    
    return isSameBranch;
  });
  
  console.log(`6️⃣ Final Filtered Count: ${filtered.length} bookings for branch "${selectedBranch}"`);
  console.log("==========================================");
  
  return filtered;
}, [appointments, selectedDate, selectedBarber, selectedBranch]);

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
      case "rescheduled": return "bg-indigo-500"; // New rescheduled status
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
  <Calendar className="w-6 h-6 text-pink-600 " />
  <span className="text-xl font-extrabold bg-gradient-to-r from-pink-600 to-pink-600 bg-clip-text text-pink-600">
     Booking Calendar
  </span>
 
</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {/* NEW: Branch Filter Dropdown */}
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches ({branches.length})</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.name}>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{branch.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>



  
                 
              

               




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
                          
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>















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
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>Rescheduled</span>
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

