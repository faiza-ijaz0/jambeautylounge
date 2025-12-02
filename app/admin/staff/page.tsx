'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Star,
  Clock,
  Phone,
  Mail,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarDays,
  TrendingUp,
  UserCheck,
  UserX,
  Timer,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserPlus,
  Upload,
  ArrowLeft,
  ArrowRight,
  X
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  rating: number;
  reviews: number;
  specialties: string[];
  experience: string;
  status: 'active' | 'inactive' | 'on-leave';
  avatar: string;
  schedule: Record<string, string>;
  specialtyInput?: string; // For editing purposes
}

export default function AdminStaff() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'attendance'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'on-leave'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, 'present' | 'absent' | 'late'>>>({});

  // Staff sidebar state
  const [staffSidebarOpen, setStaffSidebarOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState<Partial<StaffMember>>({});
  const [imageUploadType, setImageUploadType] = useState<'url' | 'file'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mock staff data
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: 1,
      name: "Mike Johnson",
      role: "Master Barber",
      email: "mike@premiumcuts.com",
      phone: "(555) 123-4567",
      rating: 4.9,
      reviews: 247,
      specialties: ["Fades", "Classic Cuts", "Beard Trimming"],
      experience: "8 years",
      status: "active",
      avatar: "/api/placeholder/100/100",
      schedule: {
        monday: "9AM-7PM",
        tuesday: "9AM-7PM",
        wednesday: "9AM-7PM",
        thursday: "9AM-7PM",
        friday: "9AM-7PM",
        saturday: "8AM-5PM",
        sunday: "Closed"
      }
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Senior Stylist",
      email: "sarah@premiumcuts.com",
      phone: "(555) 234-5678",
      rating: 4.8,
      reviews: 189,
      specialties: ["Color", "Styling", "Hair Treatments"],
      experience: "6 years",
      status: "active",
      avatar: "/api/placeholder/100/100",
      schedule: {
        monday: "10AM-6PM",
        tuesday: "10AM-6PM",
        wednesday: "10AM-6PM",
        thursday: "10AM-6PM",
        friday: "10AM-6PM",
        saturday: "9AM-4PM",
        sunday: "Closed"
      }
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      role: "Barber",
      email: "alex@premiumcuts.com",
      phone: "(555) 345-6789",
      rating: 4.7,
      reviews: 156,
      specialties: ["Beard Care", "Modern Cuts", "Hot Towel Shave"],
      experience: "5 years",
      status: "active",
      avatar: "/api/placeholder/100/100",
      schedule: {
        monday: "9AM-7PM",
        tuesday: "9AM-7PM",
        wednesday: "9AM-7PM",
        thursday: "9AM-7PM",
        friday: "9AM-7PM",
        saturday: "8AM-5PM",
        sunday: "Closed"
      }
    },
    {
      id: 4,
      name: "Emma Davis",
      role: "Apprentice",
      email: "emma@premiumcuts.com",
      phone: "(555) 456-7890",
      rating: 4.5,
      reviews: 23,
      specialties: ["Basic Cuts", "Shampoo"],
      experience: "1 year",
      status: "active",
      avatar: "/api/placeholder/100/100",
      schedule: {
        monday: "10AM-4PM",
        tuesday: "10AM-4PM",
        wednesday: "10AM-4PM",
        thursday: "10AM-4PM",
        friday: "10AM-4PM",
        saturday: "Closed",
        sunday: "Closed"
      }
    }
  ]);

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    experience: '',
    specialties: [] as string[],
    specialtyInput: '',
    status: 'active' as 'active' | 'inactive' | 'on-leave',
    avatar: '',
    schedule: {
      monday: '9AM-7PM',
      tuesday: '9AM-7PM',
      wednesday: '9AM-7PM',
      thursday: '9AM-7PM',
      friday: '9AM-7PM',
      saturday: '8AM-5PM',
      sunday: 'Closed'
    }
  });

  // Add staff form state
  const [addStaffImageUploadType, setAddStaffImageUploadType] = useState<'url' | 'file'>('url');
  const [addStaffImageFile, setAddStaffImageFile] = useState<File | null>(null);
  const [addStaffCurrentStep, setAddStaffCurrentStep] = useState(1);
  const [addStaffFormErrors, setAddStaffFormErrors] = useState<Record<string, string>>({});

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      case "on-leave": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-3 h-3" />;
      case "inactive": return <XCircle className="w-3 h-3" />;
      case "on-leave": return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const markAttendance = (staffId: number, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [staffId]: status
      }
    }));
  };

  const getAttendanceStatus = (staffId: number) => {
    return attendanceData[selectedDate]?.[staffId] || null;
  };

  const getAttendanceStats = () => {
    const todayData = attendanceData[selectedDate] || {};
    const present = Object.values(todayData).filter(status => status === 'present').length;
    const absent = Object.values(todayData).filter(status => status === 'absent').length;
    const late = Object.values(todayData).filter(status => status === 'late').length;
    const total = staff.length;

    return { present, absent, late, total };
  };

  const getAttendanceColor = (status: string | null) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getAttendanceIcon = (status: string | null) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-3 h-3" />;
      case 'absent': return <XCircle className="w-3 h-3" />;
      case 'late': return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const addSpecialty = () => {
    if (newStaff.specialtyInput.trim() && !newStaff.specialties.includes(newStaff.specialtyInput.trim())) {
      setNewStaff(prev => ({
        ...prev,
        specialties: [...prev.specialties, prev.specialtyInput.trim()],
        specialtyInput: ''
      }));
    }
  };

  const removeSpecialty = (specialty: string) => {
    setNewStaff(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  // Enhanced add staff functions
  const validateAddStaffForm = () => {
    const errors: Record<string, string> = {};

    if (!newStaff.name.trim()) errors.name = 'Full name is required';
    if (!newStaff.role) errors.role = 'Role is required';
    if (!newStaff.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newStaff.email)) errors.email = 'Email is invalid';
    if (!newStaff.phone.trim()) errors.phone = 'Phone number is required';

    setAddStaffFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStaffEnhanced = () => {
    if (!validateAddStaffForm()) {
      setAddStaffCurrentStep(1); // Go back to first step if validation fails
      return;
    }

    // Handle image upload
    let avatarUrl = newStaff.avatar || '/api/placeholder/100/100';
    if (addStaffImageUploadType === 'file' && addStaffImageFile) {
      // In a real app, you'd upload the file to a server and get back a URL
      // For now, we'll create a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        createNewStaffMember(dataUrl);
      };
      reader.readAsDataURL(addStaffImageFile);
    } else {
      createNewStaffMember(avatarUrl);
    }
  };

  const createNewStaffMember = (avatarUrl: string) => {
    const staffMember: StaffMember = {
      id: staff.length + 1,
      name: newStaff.name,
      role: newStaff.role,
      email: newStaff.email,
      phone: newStaff.phone,
      rating: 0,
      reviews: 0,
      specialties: newStaff.specialties,
      experience: newStaff.experience,
      status: newStaff.status,
      avatar: avatarUrl,
      schedule: newStaff.schedule
    };

    setStaff(prev => [...prev, staffMember]);

    // Reset form
    setNewStaff({
      name: '',
      role: '',
      email: '',
      phone: '',
      experience: '',
      specialties: [],
      specialtyInput: '',
      status: 'active',
      avatar: '',
      schedule: {
        monday: '9AM-7PM',
        tuesday: '9AM-7PM',
        wednesday: '9AM-7PM',
        thursday: '9AM-7PM',
        friday: '9AM-7PM',
        saturday: '8AM-5PM',
        sunday: 'Closed'
      }
    });
    setAddStaffImageFile(null);
    setAddStaffImageUploadType('url');
    setAddStaffCurrentStep(1);
    setAddStaffFormErrors({});
    setShowAddDialog(false);
  };

  const updateSchedule = (day: string, hours: string) => {
    setNewStaff(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: hours
      }
    }));
  };

  const resetAddStaffForm = () => {
    setNewStaff({
      name: '',
      role: '',
      email: '',
      phone: '',
      experience: '',
      specialties: [],
      specialtyInput: '',
      status: 'active',
      avatar: '',
      schedule: {
        monday: '9AM-7PM',
        tuesday: '9AM-7PM',
        wednesday: '9AM-7PM',
        thursday: '9AM-7PM',
        friday: '9AM-7PM',
        saturday: '8AM-5PM',
        sunday: 'Closed'
      }
    });
    setAddStaffImageFile(null);
    setAddStaffImageUploadType('url');
    setAddStaffCurrentStep(1);
    setAddStaffFormErrors({});
  };

  // Staff sidebar functions
  const openStaffSidebar = (staff: StaffMember, edit: boolean = false) => {
    setSelectedStaff(staff);
    setIsEditing(edit);
    if (edit) {
      setEditedStaff({
        ...staff,
        specialties: [...staff.specialties]
      });
    }
    setStaffSidebarOpen(true);
  };

  const closeStaffSidebar = () => {
    setStaffSidebarOpen(false);
    setSelectedStaff(null);
    setIsEditing(false);
    setEditedStaff({});
    setImageFile(null);
    setImageUploadType('url');
  };

  const handleSaveStaff = () => {
    if (!selectedStaff || !editedStaff.name || !editedStaff.role || !editedStaff.email || !editedStaff.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Handle image upload
    let avatarUrl = editedStaff.avatar;
    if (imageUploadType === 'file' && imageFile) {
      // In a real app, you'd upload the file to a server and get back a URL
      // For now, we'll create a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        updateStaffWithAvatar(dataUrl);
      };
      reader.readAsDataURL(imageFile);
    } else {
      updateStaffWithAvatar(avatarUrl || selectedStaff.avatar);
    }
  };

  const updateStaffWithAvatar = (avatarUrl: string) => {
    const updatedStaff: StaffMember = {
      ...selectedStaff!,
      ...editedStaff,
      avatar: avatarUrl,
      specialties: editedStaff.specialties || []
    };

    setStaff(prev => prev.map(member =>
      member.id === selectedStaff!.id ? updatedStaff : member
    ));

    closeStaffSidebar();
  };

  const handleDeleteStaff = () => {
    if (!selectedStaff) return;

    if (confirm(`Are you sure you want to remove ${selectedStaff.name}?`)) {
      setStaff(prev => prev.filter(member => member.id !== selectedStaff.id));
      closeStaffSidebar();
    }
  };

  const addEditedSpecialty = () => {
    if (editedStaff.specialtyInput?.trim() && !editedStaff.specialties?.includes(editedStaff.specialtyInput.trim())) {
      setEditedStaff(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), prev.specialtyInput!.trim()],
        specialtyInput: ''
      }));
    }
  };

  const removeEditedSpecialty = (specialty: string) => {
    setEditedStaff(prev => ({
      ...prev,
      specialties: prev.specialties?.filter(s => s !== specialty) || []
    }));
  };

  const stats = getAttendanceStats();

  return (
    <ProtectedRoute requiredRole="branch_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar
          role="branch_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-0" : "lg:ml-0"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar
                  role="branch_admin"
                  onLogout={handleLogout}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                  <p className="text-sm text-gray-600">Manage your team members and track attendance</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between">
                  <TabsList className="grid w-fit grid-cols-3">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Staff
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Attendance
                    </TabsTrigger>
                  </TabsList>

                  <Sheet open={showAddDialog} onOpenChange={(open) => {
                    if (!open) resetAddStaffForm();
                    setShowAddDialog(open);
                  }}>
                    <SheetTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Staff
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-5xl max-h-[100vh] overflow-hidden flex flex-col bg-white border-l-2 border-gray-200 shadow-2xl">
                      {/* Header with better spacing */}
                      <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <SheetHeader className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <UserPlus className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <SheetTitle className="text-2xl font-bold text-gray-900">Add New Staff Member</SheetTitle>
                              <SheetDescription className="text-gray-600 mt-1">
                                Complete the form below to add a new team member to your staff.
                              </SheetDescription>
                            </div>
                          </div>
                        </SheetHeader>

                        {/* Enhanced Progress Indicator */}
                        <div className="mt-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Step {addStaffCurrentStep} of 3</span>
                            <span className="text-sm text-gray-500 font-medium">
                              {addStaffCurrentStep === 1 ? 'Basic Information' :
                               addStaffCurrentStep === 2 ? 'Professional Details' : 'Schedule & Finalize'}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                                style={{ width: `${(addStaffCurrentStep / 3) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-2">
                              {[1, 2, 3].map((step) => (
                                <div key={step} className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                    step <= addStaffCurrentStep
                                      ? 'bg-primary text-white shadow-md'
                                      : 'bg-gray-200 text-gray-400'
                                  }`}>
                                    {step}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Content Area */}
                      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                        {/* Step 1: Basic Information */}
                        {addStaffCurrentStep === 1 && (
                          <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg">
                                1
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                                <p className="text-sm text-gray-600">Enter the essential details for the new staff member</p>
                              </div>
                            </div>

                            {/* Enhanced Profile Image Section */}
                            <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <UserPlus className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg text-gray-900">Profile Picture</CardTitle>
                                    <CardDescription className="text-gray-600">Upload a profile image or provide an image URL</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                  <div className="flex-shrink-0">
                                    <Avatar className="w-24 h-24 ring-4 ring-gray-100 shadow-lg">
                                      <AvatarImage
                                        src={addStaffImageUploadType === 'file' && addStaffImageFile
                                          ? URL.createObjectURL(addStaffImageFile)
                                          : newStaff.avatar || undefined}
                                        alt="Preview"
                                        className="object-cover"
                                      />
                                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-gray-100 to-gray-200">
                                        {newStaff.name ? newStaff.name.split(' ').map(n => n[0]).join('') : 'NS'}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="flex-1 space-y-4 w-full">
                                    <div className="flex flex-wrap gap-3">
                                      <Button
                                        type="button"
                                        variant={addStaffImageUploadType === 'url' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setAddStaffImageUploadType('url')}
                                        className="flex-1 sm:flex-none"
                                      >
                                        <Mail className="w-4 h-4 mr-2" />
                                        URL
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={addStaffImageUploadType === 'file' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setAddStaffImageUploadType('file')}
                                        className="flex-1 sm:flex-none"
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload File
                                      </Button>
                                    </div>

                                    {addStaffImageUploadType === 'url' ? (
                                      <div className="space-y-2">
                                        <Label htmlFor="image-url" className="text-sm font-medium">Image URL</Label>
                                        <Input
                                          id="image-url"
                                          placeholder="https://example.com/image.jpg"
                                          value={newStaff.avatar}
                                          onChange={(e) => setNewStaff({...newStaff, avatar: e.target.value})}
                                          className="border-2 focus:border-primary"
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <Label htmlFor="image-file" className="text-sm font-medium">Select Image File</Label>
                                        <Input
                                          id="image-file"
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setAddStaffImageFile(file);
                                            }
                                          }}
                                          className="border-2 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                                        />
                                        {addStaffImageFile && (
                                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <p className="text-sm text-green-700 font-medium">
                                              Selected: {addStaffImageFile.name} ({(addStaffImageFile.size / 1024).toFixed(1)} KB)
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Enhanced Basic Info Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label htmlFor="add-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <UserPlus className="w-4 h-4" />
                                  Full Name *
                                  {addStaffFormErrors.name && <span className="text-red-500 text-xs font-normal">({addStaffFormErrors.name})</span>}
                                </Label>
                                <Input
                                  id="add-name"
                                  placeholder="Enter full name"
                                  value={newStaff.name}
                                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                                  className={`h-12 border-2 transition-all duration-200 ${
                                    addStaffFormErrors.name
                                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                                  }`}
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="add-role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Star className="w-4 h-4" />
                                  Role *
                                  {addStaffFormErrors.role && <span className="text-red-500 text-xs font-normal">({addStaffFormErrors.role})</span>}
                                </Label>
                                <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value})}>
                                  <SelectTrigger className={`h-12 border-2 ${
                                    addStaffFormErrors.role
                                      ? 'border-red-300 focus:border-red-500'
                                      : 'border-gray-200 focus:border-primary'
                                  }`}>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent className="border-2">
                                    <SelectItem value="Master Barber">Master Barber</SelectItem>
                                    <SelectItem value="Senior Stylist">Senior Stylist</SelectItem>
                                    <SelectItem value="Barber">Barber</SelectItem>
                                    <SelectItem value="Stylist">Stylist</SelectItem>
                                    <SelectItem value="Apprentice">Apprentice</SelectItem>
                                    <SelectItem value="Receptionist">Receptionist</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="add-email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Email Address *
                                  {addStaffFormErrors.email && <span className="text-red-500 text-xs font-normal">({addStaffFormErrors.email})</span>}
                                </Label>
                                <Input
                                  id="add-email"
                                  type="email"
                                  placeholder="staff@premiumcuts.com"
                                  value={newStaff.email}
                                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                                  className={`h-12 border-2 transition-all duration-200 ${
                                    addStaffFormErrors.email
                                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                                  }`}
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="add-phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  Phone Number *
                                  {addStaffFormErrors.phone && <span className="text-red-500 text-xs font-normal">({addStaffFormErrors.phone})</span>}
                                </Label>
                                <Input
                                  id="add-phone"
                                  placeholder="(555) 123-4567"
                                  value={newStaff.phone}
                                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                                  className={`h-12 border-2 transition-all duration-200 ${
                                    addStaffFormErrors.phone
                                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step 2: Professional Details */}
                        {addStaffCurrentStep === 2 && (
                          <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg">
                                2
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">Professional Details</h3>
                                <p className="text-sm text-gray-600">Add professional experience and specialties</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <Card className="border-2 border-gray-100 shadow-sm">
                                  <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <Clock className="w-5 h-5 text-blue-600" />
                                      Experience
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                      <Label htmlFor="add-experience" className="text-sm font-semibold text-gray-700">Years of Experience</Label>
                                      <Input
                                        id="add-experience"
                                        placeholder="e.g., 5 years"
                                        value={newStaff.experience}
                                        onChange={(e) => setNewStaff({...newStaff, experience: e.target.value})}
                                        className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                                      />
                                    </div>

                                    <div className="space-y-3">
                                      <Label htmlFor="add-status" className="text-sm font-semibold text-gray-700">Initial Status</Label>
                                      <Select value={newStaff.status} onValueChange={(value: 'active' | 'inactive' | 'on-leave') => setNewStaff({...newStaff, status: value})}>
                                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-2">
                                          <SelectItem value="active">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                              Active
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="inactive">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                              Inactive
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="on-leave">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                              On Leave
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              <div className="space-y-6">
                                <Card className="border-2 border-gray-100 shadow-sm">
                                  <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <Star className="w-5 h-5 text-purple-600" />
                                      Specialties
                                    </CardTitle>
                                    <CardDescription>Add the services this staff member specializes in</CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="flex gap-3">
                                      <Input
                                        placeholder="Add a specialty (e.g., Fades, Haircuts)"
                                        value={newStaff.specialtyInput}
                                        onChange={(e) => setNewStaff({...newStaff, specialtyInput: e.target.value})}
                                        onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                                        className="flex-1 h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                                      />
                                      <Button
                                        type="button"
                                        onClick={addSpecialty}
                                        variant="outline"
                                        size="lg"
                                        className="px-6 border-2 hover:bg-primary hover:text-white hover:border-primary"
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add
                                      </Button>
                                    </div>
                                    {newStaff.specialties.length > 0 && (
                                      <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700">Added Specialties:</Label>
                                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg border-2 border-gray-100">
                                          {newStaff.specialties.map((specialty, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="cursor-pointer hover:bg-red-100 hover:text-red-700 px-3 py-1 text-sm font-medium transition-colors duration-200 border border-gray-200"
                                              onClick={() => removeSpecialty(specialty)}
                                            >
                                              {specialty} ×
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step 3: Schedule & Finalize */}
                        {addStaffCurrentStep === 3 && (
                          <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg">
                                3
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">Schedule & Finalize</h3>
                                <p className="text-sm text-gray-600">Set working hours and review all information</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                              <Card className="border-2 border-gray-100 shadow-sm">
                                <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                    Weekly Schedule
                                  </CardTitle>
                                  <CardDescription>Set the working hours for each day of the week</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                  {Object.entries(newStaff.schedule).map(([day, hours]) => (
                                    <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                                      <Label className="w-24 capitalize text-sm font-semibold text-gray-700 flex-shrink-0">{day}:</Label>
                                      <Input
                                        value={hours}
                                        onChange={(e) => updateSchedule(day, e.target.value)}
                                        placeholder="e.g., 9AM-7PM or Closed"
                                        className="flex-1 h-10 border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                                      />
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>

                              <Card className="border-2 border-gray-100 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                                <CardHeader className="pb-6">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                    Review Information
                                  </CardTitle>
                                  <CardDescription>Please review all entered information before adding the staff member</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                      <span className="font-semibold text-gray-600">Name:</span>
                                      <span className="font-medium text-gray-900">{newStaff.name || 'Not provided'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                      <span className="font-semibold text-gray-600">Role:</span>
                                      <span className="font-medium text-gray-900">{newStaff.role || 'Not selected'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                      <span className="font-semibold text-gray-600">Email:</span>
                                      <span className="font-medium text-gray-900">{newStaff.email || 'Not provided'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                      <span className="font-semibold text-gray-600">Phone:</span>
                                      <span className="font-medium text-gray-900">{newStaff.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                      <span className="font-semibold text-gray-600">Experience:</span>
                                      <span className="font-medium text-gray-900">{newStaff.experience || 'Not provided'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                      <span className="font-semibold text-gray-600">Status:</span>
                                      <Badge className={`capitalize ${getStatusColor(newStaff.status)}`}>
                                        {getStatusIcon(newStaff.status)}
                                        <span className="ml-1">{newStaff.status}</span>
                                      </Badge>
                                    </div>
                                  </div>
                                  {newStaff.specialties.length > 0 && (
                                    <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                                      <span className="font-semibold text-gray-600 block mb-2">Specialties:</span>
                                      <div className="flex flex-wrap gap-2">
                                        {newStaff.specialties.map((specialty, index) => (
                                          <Badge key={index} variant="outline" className="border-gray-300">
                                            {specialty}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Navigation Footer */}
                      <div className="flex-shrink-0 px-6 py-6 border-t-2 border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-3">
                            {addStaffCurrentStep > 1 && (
                              <Button
                                variant="outline"
                                onClick={() => setAddStaffCurrentStep(prev => prev - 1)}
                                className="px-6 py-3 border-2 hover:bg-gray-100 transition-colors duration-200"
                              >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Previous
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowAddDialog(false)}
                              className="px-6 py-3 border-2 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            {addStaffCurrentStep < 3 ? (
                              <Button
                                onClick={() => setAddStaffCurrentStep(prev => prev + 1)}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            ) : (
                              <Button
                                onClick={handleAddStaffEnhanced}
                                className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                              >
                                <UserPlus className="w-5 h-5 mr-2" />
                                Add Staff Member
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{staff.length}</div>
                        <p className="text-xs text-muted-foreground">
                          Active members
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                        <p className="text-xs text-muted-foreground">
                          Out of {stats.total}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                        <UserX className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                        <p className="text-xs text-muted-foreground">
                          Need attention
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Today's rate
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest staff updates and attendance records</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">Mike Johnson marked present</p>
                            <p className="text-sm text-gray-600">Today at 9:15 AM</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                          <UserPlus className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">New staff member added</p>
                            <p className="text-sm text-gray-600">Sarah Chen joined the team</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium">Alex Rodriguez running late</p>
                            <p className="text-sm text-gray-600">Expected arrival: 9:30 AM</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Staff Tab */}
                <TabsContent value="staff" className="space-y-6">
                  {/* Filters */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search staff members..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                          <SelectTrigger className="w-full sm:w-48">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="on-leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Staff Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaff.map((member) => (
                      <Card key={member.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">{member.name}</CardTitle>
                                <CardDescription>{member.role}</CardDescription>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openStaffSidebar(member, false)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openStaffSidebar(member, true)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
                                      setStaff(prev => prev.filter(m => m.id !== member.id));
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{member.rating}</span>
                              <span className="text-gray-500">({member.reviews})</span>
                            </div>
                            <Badge className={getStatusColor(member.status)}>
                              {getStatusIcon(member.status)}
                              <span className="ml-1 capitalize">{member.status}</span>
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{member.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{member.experience}</span>
                            </div>
                          </div>

                          {member.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {member.specialties.slice(0, 3).map((specialty, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                              {member.specialties.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.specialties.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredStaff.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first staff member'
                          }
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                          <Button onClick={() => setShowAddDialog(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Staff Member
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance" className="space-y-6">
                  {/* Date Controls */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Label htmlFor="date-select" className="text-sm font-medium">Select Date:</Label>
                          <Input
                            id="date-select"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-auto"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                          >
                            Today
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const date = new Date(selectedDate);
                              date.setDate(date.getDate() - 1);
                              setSelectedDate(date.toISOString().split('T')[0]);
                            }}
                          >
                            Previous Day
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const date = new Date(selectedDate);
                              date.setDate(date.getDate() + 1);
                              setSelectedDate(date.toISOString().split('T')[0]);
                            }}
                          >
                            Next Day
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attendance Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                        <p className="text-xs text-muted-foreground">
                          Marked present
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                        <UserX className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                        <p className="text-xs text-muted-foreground">
                          Not present
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late</CardTitle>
                        <Timer className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                        <p className="text-xs text-muted-foreground">
                          Arrived late
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Overall rate
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Attendance Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Daily Attendance - {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <CardDescription>
                        Mark attendance for each staff member. Changes are saved automatically.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {staff.map((member) => {
                          const attendanceStatus = getAttendanceStatus(member.id);
                          return (
                            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={member.avatar} alt={member.name} />
                                  <AvatarFallback>
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                                  <p className="text-sm text-gray-600">{member.role}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {attendanceStatus && (
                                  <Badge className={getAttendanceColor(attendanceStatus)}>
                                    {getAttendanceIcon(attendanceStatus)}
                                    <span className="ml-1 capitalize">{attendanceStatus}</span>
                                  </Badge>
                                )}

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={attendanceStatus === 'present' ? 'default' : 'outline'}
                                    onClick={() => markAttendance(member.id, 'present')}
                                    className="h-8 px-3"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Present
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={attendanceStatus === 'late' ? 'default' : 'outline'}
                                    onClick={() => markAttendance(member.id, 'late')}
                                    className="h-8 px-3"
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    Late
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={attendanceStatus === 'absent' ? 'destructive' : 'outline'}
                                    onClick={() => markAttendance(member.id, 'absent')}
                                    className="h-8 px-3"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Absent
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {staff.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No staff members found. Add staff members first.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Staff Details Sidebar */}
        <Sheet open={staffSidebarOpen} onOpenChange={setStaffSidebarOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="pb-6">
              <SheetTitle className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Edit className="w-5 h-5" />
                    Edit Staff Member
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    Staff Details
                  </>
                )}
              </SheetTitle>
              <SheetDescription>
                {isEditing
                  ? "Update staff member information and settings."
                  : "View detailed information about this staff member."
                }
              </SheetDescription>
            </SheetHeader>

            {selectedStaff && (
              <div className="space-y-6">
                {/* Profile Image Section */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Profile Image</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src={isEditing ? editedStaff.avatar || selectedStaff.avatar : selectedStaff.avatar}
                        alt={selectedStaff.name}
                      />
                      <AvatarFallback className="text-lg">
                        {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={imageUploadType === 'url' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setImageUploadType('url')}
                          >
                            URL
                          </Button>
                          <Button
                            type="button"
                            variant={imageUploadType === 'file' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setImageUploadType('file')}
                          >
                            Upload File
                          </Button>
                        </div>

                        {imageUploadType === 'url' ? (
                          <Input
                            placeholder="Enter image URL"
                            value={editedStaff.avatar || ''}
                            onChange={(e) => setEditedStaff({...editedStaff, avatar: e.target.value})}
                          />
                        ) : (
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setImageFile(file);
                                  // Preview the image
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setEditedStaff({...editedStaff, avatar: e.target?.result as string});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {imageFile && (
                              <p className="text-sm text-gray-600">
                                Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Basic Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name *</Label>
                      {isEditing ? (
                        <Input
                          id="edit-name"
                          value={editedStaff.name || ''}
                          onChange={(e) => setEditedStaff({...editedStaff, name: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm font-medium p-2 bg-gray-50 rounded-md">{selectedStaff.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Role *</Label>
                      {isEditing ? (
                        <Select
                          value={editedStaff.role || ''}
                          onValueChange={(value) => setEditedStaff({...editedStaff, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Master Barber">Master Barber</SelectItem>
                            <SelectItem value="Senior Stylist">Senior Stylist</SelectItem>
                            <SelectItem value="Barber">Barber</SelectItem>
                            <SelectItem value="Stylist">Stylist</SelectItem>
                            <SelectItem value="Apprentice">Apprentice</SelectItem>
                            <SelectItem value="Receptionist">Receptionist</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-medium p-2 bg-gray-50 rounded-md">{selectedStaff.role}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email *</Label>
                      {isEditing ? (
                        <Input
                          id="edit-email"
                          type="email"
                          value={editedStaff.email || ''}
                          onChange={(e) => setEditedStaff({...editedStaff, email: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedStaff.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone *</Label>
                      {isEditing ? (
                        <Input
                          id="edit-phone"
                          value={editedStaff.phone || ''}
                          onChange={(e) => setEditedStaff({...editedStaff, phone: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedStaff.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-experience">Years of Experience</Label>
                      {isEditing ? (
                        <Input
                          id="edit-experience"
                          value={editedStaff.experience || ''}
                          onChange={(e) => setEditedStaff({...editedStaff, experience: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedStaff.experience}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Status</Label>
                  {isEditing ? (
                    <Select
                      value={editedStaff.status || 'active'}
                      onValueChange={(value: 'active' | 'inactive' | 'on-leave') =>
                        setEditedStaff({...editedStaff, status: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(selectedStaff.status)}>
                      {getStatusIcon(selectedStaff.status)}
                      <span className="ml-1 capitalize">{selectedStaff.status}</span>
                    </Badge>
                  )}
                </div>

                {/* Specialties */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Specialties</Label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a specialty"
                          value={editedStaff.specialtyInput || ''}
                          onChange={(e) => setEditedStaff({...editedStaff, specialtyInput: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && addEditedSpecialty()}
                        />
                        <Button type="button" onClick={addEditedSpecialty} variant="outline">
                          Add
                        </Button>
                      </div>
                      {editedStaff.specialties && editedStaff.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {editedStaff.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeEditedSpecialty(specialty)}>
                              {specialty} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.specialties.length > 0 ? (
                        selectedStaff.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline">
                            {specialty}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No specialties listed</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Performance Metrics</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-yellow-700">{selectedStaff.rating}</span>
                      </div>
                      <p className="text-xs text-yellow-600">Average Rating</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-700">{selectedStaff.reviews}</div>
                      <p className="text-xs text-blue-600">Total Reviews</p>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Weekly Schedule</Label>
                  <div className="space-y-2">
                    {Object.entries(selectedStaff.schedule).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                        <span className="font-medium capitalize text-sm">{day}</span>
                        <span className="text-sm text-gray-600">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-3 pt-6 border-t">
                  <Button variant="outline" onClick={closeStaffSidebar}>
                    Close
                  </Button>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel Edit
                        </Button>
                        <Button onClick={handleSaveStaff}>
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handleDeleteStaff} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Staff
                        </Button>
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </ProtectedRoute>
  );
}