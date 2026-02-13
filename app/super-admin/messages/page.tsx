// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   MessageCircle,
//   Send,
//   Phone,
//   Mail,
//   Building,
//   Check,
//   CheckCheck,
//   Loader2
// } from "lucide-react";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/contexts/AuthContext";
// import { useRouter } from "next/navigation";
// import { format, isToday, isYesterday } from "date-fns";
// import { db } from '@/lib/firebase';
// import { 
//   collection, 
//   query, 
//   where, 
//   getDocs, 
//   doc, 
//   getDoc,
//   onSnapshot,
//   addDoc,
//   serverTimestamp,
//   updateDoc
// } from 'firebase/firestore';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface Message {
//   id: string;
//   content: string;
//   senderId: string;
//   senderName: string;
//   senderRole: 'super_admin' | 'branch_admin';
//   senderBranchId?: string;
//   senderBranchName?: string;
//   recipientBranchId: string;
//   recipientBranchName: string;
//   timestamp: any;
//   read: boolean;
//   status: 'sent' | 'delivered' | 'seen';
//   collection: 'adminMessages' | 'branchMessages';
// }

// export default function SuperAdminMessages() {
//   const { user, logout } = useAuth();
//   const router = useRouter();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [newMessage, setNewMessage] = useState('');
//   const [selectedBranchId, setSelectedBranchId] = useState<string>('');
//   const [branches, setBranches] = useState<any[]>([]);
//   const [loadingBranches, setLoadingBranches] = useState(true);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Fetch branches
//   useEffect(() => {
//   const fetchBranches = async () => {
//     try {
//       setLoadingBranches(true);
//       const branchesRef = collection(db, 'branches');
//       const q = query(branchesRef, where('status', '==', 'active'));
//       const snapshot = await getDocs(q);
      
//       // ✅ FIX: Type assertion
//       let branchesData = snapshot.docs.map(doc => ({ 
//         id: doc.id, 
//         ...doc.data() 
//       })) as { id: string; name: string; [key: string]: any }[];
      
//       // ✅ AB ERROR NAHI AYEGA!
//       branchesData = branchesData.sort((a, b) => 
//         (a.name || '').localeCompare(b.name || '')
//       );
      
//       setBranches(branchesData);
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoadingBranches(false);
//     }
//   };
//   fetchBranches();
// }, []);

//   // Fetch messages from BOTH collections
//   useEffect(() => {
//     if (!selectedBranchId) return;

//     setLoadingMessages(true);

//     // 1. Messages Super Admin ne bheje (adminMessages)
//     const adminSentQuery = query(
//       collection(db, 'adminMessages'),
//       where('recipientBranchId', '==', selectedBranchId),
//       where('senderRole', '==', 'super_admin')
//     );

//     // 2. Messages Branch ne bheje (branchMessages)
//     const branchReceivedQuery = query(
//       collection(db, 'branchMessages'),
//       where('recipientBranchId', '==', selectedBranchId),
//       where('senderRole', '==', 'branch_admin')
//     );

//     const unsubscribeAdmin = onSnapshot(adminSentQuery, (snapshot) => {
//       const adminMsgs = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         timestamp: doc.data().timestamp?.toDate() || new Date(),
//         collection: 'adminMessages' as const
//       })) as Message[];
      
//       setMessages(prev => {
//         const branchMsgs = prev.filter(m => m.collection === 'branchMessages');
//         const allMsgs = [...adminMsgs, ...branchMsgs].sort((a, b) => 
//           (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
//           (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
//         );
//         return allMsgs;
//       });
//       setLoadingMessages(false);
//     });

//     const unsubscribeBranch = onSnapshot(branchReceivedQuery, (snapshot) => {
//       const branchMsgs = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         timestamp: doc.data().timestamp?.toDate() || new Date(),
//         collection: 'branchMessages' as const
//       })) as Message[];
      
//       setMessages(prev => {
//         const adminMsgs = prev.filter(m => m.collection === 'adminMessages');
//         const allMsgs = [...adminMsgs, ...branchMsgs].sort((a, b) => 
//           (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
//           (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
//         );
//         return allMsgs;
//       });
//     });

//     return () => {
//       unsubscribeAdmin();
//       unsubscribeBranch();
//     };
//   }, [selectedBranchId]);

//   // Send message to branch (adminMessages collection)
//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || !selectedBranchId) return;

//     const selectedBranch = branches.find(b => b.id === selectedBranchId);
//     if (!selectedBranch) return;

//     try {
//       await addDoc(collection(db, 'adminMessages'), {
//         content: newMessage,
//        senderId: (user as any)?.uid || 'super-admin',
//         senderName: 'Super Admin',
//         senderRole: 'super_admin',
//         recipientBranchId: selectedBranchId,
//         recipientBranchName: selectedBranch.name,
//         timestamp: serverTimestamp(),
//         read: false,
//         status: 'sent'
//       });
//       setNewMessage('');
//     } catch (error) {
//       console.error('Send error:', error);
//     }
//   };

//   // Auto-scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const formatMessageTime = (timestamp: any) => {
//     if (!timestamp) return '';
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//     if (isToday(date)) return format(date, 'hh:mm a');
//     if (isYesterday(date)) return `Yesterday ${format(date, 'hh:mm a')}`;
//     return format(date, 'dd/MM/yy hh:mm a');
//   };

//   const getBranchName = (branchId: string) => {
//     return branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
//   };

//   // Group messages by date
//   const groupedMessages = messages.reduce((groups: any, msg) => {
//     const date = msg.timestamp?.toDate 
//       ? format(msg.timestamp.toDate(), 'yyyy-MM-dd')
//       : format(new Date(), 'yyyy-MM-dd');
//     if (!groups[date]) groups[date] = [];
//     groups[date].push(msg);
//     return groups;
//   }, {});

//   const formatDateHeader = (dateStr: string) => {
//     const date = new Date(dateStr);
//     if (isToday(date)) return 'Today';
//     if (isYesterday(date)) return 'Yesterday';
//     return format(date, 'MMMM d, yyyy');
//   };

//   return (
//     <div role="super_admin">
//       <div className="flex h-screen bg-gray-100">
//         <AdminSidebar role="super_admin" onLogout={logout} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
//         <div className="flex-1 flex flex-col">
//           <header className="bg-white border-b px-4 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <AdminMobileSidebar role="super_admin" onLogout={logout} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
//                 <h1 className="text-xl font-semibold">Super Admin Chat</h1>
//               </div>
//               <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
//             </div>
//           </header>

//           <div className="flex-1 overflow-hidden p-4">
//             <Card className="h-full shadow-lg">
//               <CardContent className="p-0 h-full flex flex-col">
                
//                 {/* Branch Selector */}
//                 <div className="bg-white px-4 py-3 border-b">
//                   <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={loadingBranches}>
//                     <SelectTrigger className="w-full md:w-96">
//                       <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select a branch to chat"} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {branches.map(branch => (
//                         <SelectItem key={branch.id} value={branch.id}>
//                           <div className="flex items-center gap-2">
//                             <Building className="w-4 h-4" />
//                             {branch.name}
//                           </div>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {selectedBranchId ? (
//                   <div className="flex-1 flex flex-col bg-[#e5ded8]">
                    
//                     {/* Branch Header */}
//                     <div className="bg-white px-4 py-2 border-b flex items-center gap-3">
//                       <Avatar className="w-8 h-8">
//                         <AvatarFallback className="bg-blue-600 text-white">
//                           {getBranchName(selectedBranchId).charAt(0)}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <h3 className="font-semibold">{getBranchName(selectedBranchId)}</h3>
//                         <p className="text-xs text-gray-500">Branch Admin</p>
//                       </div>
//                     </div>

//                     {/* Messages - WHATSAPP STYLE */}
//                     <ScrollArea className="flex-1 p-4">
//                       {loadingMessages ? (
//                         <div className="flex justify-center">
//                           <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//                         </div>
//                       ) : messages.length === 0 ? (
//                         <div className="text-center text-gray-500 mt-10">
//                           <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
//                           <p>No messages yet</p>
//                         </div>
//                       ) : (
//                         <div className="space-y-6">
//                           {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
//                             <div key={date}>
//                               <div className="flex justify-center mb-4">
//                                 <span className="bg-gray-200/80 text-xs px-3 py-1.5 rounded-full">
//                                   {formatDateHeader(date)}
//                                 </span>
//                               </div>
                              
//                               <div className="space-y-2">
//                                 {(dateMessages as Message[]).map((msg) => {
//                                   const isMe = msg.senderRole === 'super_admin';
                                  
//                                   return (
//                                     <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                                      
//                                       {/* Avatar for received messages (Branch Admin) */}
//                                       {!isMe && (
//                                         <Avatar className="w-7 h-7 mb-1">
//                                           <AvatarFallback className="bg-green-600 text-white text-xs">
//                                             {msg.senderBranchName?.charAt(0) || 'B'}
//                                           </AvatarFallback>
//                                         </Avatar>
//                                       )}
                                      
//                                       {/* Message Bubble */}
//                                       <div className={cn("max-w-xs lg:max-w-md relative", isMe ? "order-2" : "order-1")}>
//                                         <div className={cn(
//                                           "px-3.5 py-2 rounded-2xl text-sm shadow-sm",
//                                           isMe 
//                                             ? "bg-[#dcf8c6] text-gray-800 rounded-br-none"  // GREEN - Sent by YOU
//                                             : "bg-white text-gray-800 rounded-bl-none border border-gray-100" // WHITE - Received
//                                         )}>
                                          
//                                           {/* Sender Name */}
//                                           {!isMe && (
//                                             <p className="text-xs font-medium text-green-600 mb-1">
//                                               {msg.senderBranchName || 'Branch Admin'}
//                                             </p>
//                                           )}
                                          
//                                           {/* Message */}
//                                           <p className="whitespace-pre-wrap break-words pr-8">{msg.content}</p>
                                          
//                                           {/* Time & Status */}
//                                           <div className={cn(
//                                             "flex items-center justify-end gap-1 mt-0.5 text-[10px]",
//                                             isMe ? "text-gray-500" : "text-gray-400"
//                                           )}>
//                                             <span>{formatMessageTime(msg.timestamp)}</span>
//                                             {isMe && msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-gray-400" />}
//                                             {isMe && msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-gray-500" />}
//                                             {isMe && msg.status === 'seen' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
//                                           </div>
//                                         </div>
                                        
//                                         {/* Bubble Tail */}
//                                         <div className={cn(
//                                           "absolute bottom-0 w-3 h-3",
//                                           isMe 
//                                             ? "right-[-6px] text-[#dcf8c6]" 
//                                             : "left-[-6px] text-white"
//                                         )}>
//                                           <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
//                                             className={isMe ? "rotate-[45deg]" : "rotate-[-135deg]"}>
//                                             <path d="M0 0 L12 0 L0 12 Z" />
//                                           </svg>
//                                         </div>
//                                       </div>
                                      
//                                       {/* Avatar for sent messages (YOU) */}
//                                       {isMe && (
//                                         <Avatar className="w-7 h-7 mb-1">
//                                           <AvatarFallback className="bg-blue-600 text-white text-xs">
//                                             SA
//                                           </AvatarFallback>
//                                         </Avatar>
//                                       )}
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           ))}
//                           <div ref={messagesEndRef} />
//                         </div>
//                       )}
//                     </ScrollArea>

//                     {/* Message Input */}
//                     <div className="bg-white px-4 py-3 border-t">
//                       <div className="flex gap-2">
//                         <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-1.5">
//                           <Input
//                             value={newMessage}
//                             onChange={(e) => setNewMessage(e.target.value)}
//                             placeholder={`Message ${getBranchName(selectedBranchId)}...`}
//                             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                             className="border-0 bg-transparent px-0 focus-visible:ring-0"
//                           />
//                         </div>
//                         <Button 
//                           onClick={handleSendMessage} 
//                           disabled={!newMessage.trim()}
//                           className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600"
//                         >
//                           <Send className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex-1 flex items-center justify-center bg-gray-50">
//                     <p className="text-gray-500">Select a branch to start chatting</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// new code
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  Building,
  MapPin,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Search,
  Users,
  Sparkles
} from "lucide-react";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isYesterday } from "date-fns";
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: 'super_admin' | 'branch_admin';
  senderBranchId?: string;
  senderBranchName?: string;
  recipientBranchId: string;
  recipientBranchName: string;
  timestamp: any;
  read: boolean;
  status: 'sent' | 'delivered' | 'seen';
  collection: 'adminMessages' | 'branchMessages';
}

export default function SuperAdminMessages() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedBranchDetails, setSelectedBranchDetails] = useState<any>(null);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBranchId && messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = 0;
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (messagesScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesScrollRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const branchesRef = collection(db, 'branches');
        const q = query(branchesRef, where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        
        let branchesData = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as { id: string; name: string; [key: string]: any }[];
        
        branchesData = branchesData.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        
        setBranches(branchesData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // ✅ CRITICAL FIX: Selected branch details - KABHI RESET NAHI HOGA
  useEffect(() => {
    if (selectedBranchId) {
      const branch = branches.find(b => b.id === selectedBranchId);
      if (branch) {
        setSelectedBranchDetails(branch);
      }
    }
  }, [selectedBranchId, branches]);

  // Fetch messages - WITHOUT affecting selectedBranchDetails
  useEffect(() => {
    if (!selectedBranchId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    const adminSentQuery = query(
      collection(db, 'adminMessages'),
      where('recipientBranchId', '==', selectedBranchId),
      where('senderRole', '==', 'super_admin')
    );

    const branchReceivedQuery = query(
      collection(db, 'branchMessages'),
      where('recipientBranchId', '==', selectedBranchId),
      where('senderRole', '==', 'branch_admin')
    );

    const unsubscribeAdmin = onSnapshot(adminSentQuery, (snapshot) => {
      const adminMsgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        collection: 'adminMessages' as const
      })) as Message[];
      
      setMessages(prev => {
        const branchMsgs = prev.filter(m => m.collection === 'branchMessages');
        const allMsgs = [...adminMsgs, ...branchMsgs].sort((a, b) => 
          (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
          (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
        );
        return allMsgs;
      });
      setLoadingMessages(false);
    });

    const unsubscribeBranch = onSnapshot(branchReceivedQuery, (snapshot) => {
      const branchMsgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        collection: 'branchMessages' as const
      })) as Message[];
      
      setMessages(prev => {
        const adminMsgs = prev.filter(m => m.collection === 'adminMessages');
        const allMsgs = [...adminMsgs, ...branchMsgs].sort((a, b) => 
          (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
          (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
        );
        return allMsgs;
      });
    });

    return () => {
      unsubscribeAdmin();
      unsubscribeBranch();
    };
  }, [selectedBranchId]);

  // Send message - WITHOUT affecting selectedBranchDetails
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedBranchId) return;

    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    if (!selectedBranch) return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'adminMessages'), {
        content: messageContent,
        senderId: (user as any)?.uid || 'super-admin',
        senderName: 'Super Admin',
        senderRole: 'super_admin',
        recipientBranchId: selectedBranchId,
        recipientBranchName: selectedBranch.name,
        timestamp: serverTimestamp(),
        read: false,
        status: 'sent'
      });
    } catch (error) {
      console.error('Send error:', error);
      setNewMessage(messageContent);
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isToday(date)) return format(date, 'hh:mm a');
      if (isYesterday(date)) return `Yesterday ${format(date, 'hh:mm a')}`;
      return format(date, 'dd/MM/yy hh:mm a');
    } catch {
      return '';
    }
  };

  const groupedMessages = messages.reduce((groups: any, msg) => {
    try {
      const date = msg.timestamp?.toDate 
        ? format(msg.timestamp.toDate(), 'yyyy-MM-dd')
        : format(new Date(msg.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    } catch {
      const date = format(new Date(), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    }
    return groups;
  }, {});

  const formatDateHeader = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const filteredBranches = branches.filter(branch => 
    branch.name?.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
    branch.city?.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
    branch.managerName?.toLowerCase().includes(branchSearchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar 
        role="super_admin" 
        onLogout={logout} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* SUPER ADMIN HEADER - FIXED */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AdminMobileSidebar 
                role="super_admin" 
                onLogout={logout} 
                isOpen={sidebarOpen} 
                onToggle={() => setSidebarOpen(!sidebarOpen)} 
              />
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FA9DB7] to-[#B84A68] flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Executive Communications</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Super Admin • Branch Management</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-4 py-2 border-[#FA9DB7]/30 text-[#B84A68] bg-white rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                {branches.length} Active Branches
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-red-50 hover:text-red-600"
                onClick={logout}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">SA</span>
                </div>
              </Button>
            </div>
          </div>
        </header>

        {/* CARD CONTAINER */}
        <div className="flex-1 overflow-hidden p-6 pt-0">
          <Card className="h-full border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col">
            
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* BRANCH SELECTOR - FIXED */}
              <div className="bg-gradient-to-r from-white to-gray-50/80 px-6 py-5 border-b border-gray-200/80 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 block">
                      Select Branch
                    </label>
                    <Select 
                      value={selectedBranchId} 
                      onValueChange={setSelectedBranchId} 
                      disabled={loadingBranches}
                    >
                      <SelectTrigger className="w-full md:w-[400px] h-14 border-2 border-gray-200/80 hover:border-[#FA9DB7]/50 focus:ring-2 focus:ring-[#FA9DB7]/30 rounded-2xl bg-white/80">
                        <SelectValue placeholder={
                          <div className="flex items-center gap-3 text-gray-500">
                            <Building className="w-5 h-5 text-[#FA9DB7]" />
                            <span>{loadingBranches ? "Loading branches..." : "Choose a branch to start conversation"}</span>
                          </div>
                        } />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-0 shadow-2xl p-2 bg-white/95">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="Search by branch, city, or manager..."
                              value={branchSearchQuery}
                              onChange={(e) => setBranchSearchQuery(e.target.value)}
                              className="pl-9 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FA9DB7]/30"
                            />
                          </div>
                        </div>
                        <ScrollArea className="h-[280px]">
                          {filteredBranches.map(branch => (
                            <SelectItem 
                              key={branch.id} 
                              value={branch.id}
                              className="rounded-xl py-3 px-3 cursor-pointer hover:bg-[#FA9DB7]/5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FA9DB7]/20 to-[#B84A68]/10 flex items-center justify-center">
                                  <Building className="w-5 h-5 text-[#B84A68]" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{branch.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{branch.city}, {branch.country}</span>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedBranchDetails && (
                    <div className="flex items-center gap-4 px-4 py-2 bg-[#FA9DB7]/5 rounded-2xl border border-[#FA9DB7]/20 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-600">Active</span>
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600">{selectedBranchDetails.openingTime} - {selectedBranchDetails.closingTime}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ CRITICAL FIX: Sirf tab show karo jab branch details exist karein */}
              {selectedBranchId && selectedBranchDetails ? (
                <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-gray-50 to-white">
                  
                  {/* ✅ BRANCH PROFILE HEADER - ALWAYS VISIBLE, KABHI HIDE NAHI HOGA */}
                  <div className="bg-white border-b border-gray-200/80 px-6 py-5 shrink-0">
                    <div className="flex items-start gap-5">
                      {/* Branch Avatar */}
                      <div className="relative">
                        <Avatar className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl">
                          <AvatarImage src={selectedBranchDetails.image} />
                          <AvatarFallback className="bg-gradient-to-br from-[#FA9DB7] to-[#B84A68] text-white text-2xl font-serif">
                            {selectedBranchDetails.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                      </div>
                      
                      {/* Branch Details - FULL INFO ALWAYS SHOWING */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h2 className="text-2xl font-serif font-bold text-gray-900">
                            {selectedBranchDetails.name}
                          </h2>
                          <Badge className="bg-[#FA9DB7]/10 text-[#B84A68] border-0 rounded-full px-4 py-1">
                            Branch Admin
                          </Badge>
                        </div>
                        
                        {/* Branch Information Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                          {/* Address */}
                          <div className="flex items-center gap-2 text-sm col-span-2">
                            <MapPin className="w-4 h-4 text-[#FA9DB7] shrink-0" />
                            <span className="text-gray-600">
                              {selectedBranchDetails.address || ''}, {selectedBranchDetails.city || ''}, {selectedBranchDetails.country || ''}
                            </span>
                          </div>
                          
                          {/* Phone */}
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-[#FA9DB7] shrink-0" />
                            <span className="text-gray-600">{selectedBranchDetails.phone || 'N/A'}</span>
                          </div>
                          
                          {/* Email */}
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-[#FA9DB7] shrink-0" />
                            <span className="text-gray-600">{selectedBranchDetails.email || 'N/A'}</span>
                          </div>
                          
                          {/* Manager */}
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-[#FA9DB7] shrink-0" />
                            <span className="text-gray-600">Manager: {selectedBranchDetails.managerName || 'N/A'}</span>
                          </div>
                          
                          {/* Hours */}
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-[#FA9DB7] shrink-0" />
                            <span className="text-gray-600">{selectedBranchDetails.openingTime || '09:00'} - {selectedBranchDetails.closingTime || '18:00'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-200 hover:border-[#FA9DB7] hover:bg-[#FA9DB7]/5">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-200 hover:border-[#FA9DB7] hover:bg-[#FA9DB7]/5">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* MESSAGES AREA - SIRF YAHI SCROLL HOGA */}
                  <div className="flex-1 bg-[#f3f2f1] relative min-h-0">
                    <ScrollArea 
                      ref={messagesScrollRef}
                      className="absolute inset-0 w-full h-full"
                    >
                      <div className="px-6 py-6">
                        {loadingMessages ? (
                          <div className="flex justify-center items-center h-40">
                            <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-[#FA9DB7]" />
                              <span className="text-sm text-gray-600">Loading conversation...</span>
                            </div>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-[300px]">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#FA9DB7]/20 to-[#B84A68]/10 rounded-3xl flex items-center justify-center mb-4">
                              <MessageCircle className="w-12 h-12 text-[#B84A68]" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-gray-500 text-center max-w-md">
                              Start a conversation with {selectedBranchDetails.name}. Your messages will appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
                              <div key={date}>
                                <div className="flex justify-center mb-4">
                                  <span className="bg-gray-900/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-lg">
                                    {formatDateHeader(date)}
                                  </span>
                                </div>
                                
                                <div className="space-y-3">
                                  {(dateMessages as Message[]).map((msg) => {
                                    const isMe = msg.senderRole === 'super_admin';
                                    
                                    return (
                                      <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                                        
                                        {!isMe && (
                                          <div className="relative group shrink-0">
                                            <Avatar className="w-8 h-8 ring-2 ring-white shadow-md">
                                              <AvatarFallback className="bg-gradient-to-br from-[#FA9DB7] to-[#B84A68] text-white text-xs">
                                                {msg.senderBranchName?.charAt(0) || 'B'}
                                              </AvatarFallback>
                                            </Avatar>
                                          </div>
                                        )}
                                        
                                        <div className={cn("max-w-xs lg:max-w-md", isMe ? "order-2" : "order-1")}>
                                          <div className={cn(
                                            "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                            isMe 
                                              ? "bg-gradient-to-br from-[#dcf8c6] to-[#c8e6b5] text-gray-800 rounded-br-none" 
                                              : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                                          )}>
                                            {!isMe && (
                                              <p className="text-xs font-semibold text-[#B84A68] mb-1">
                                                {msg.senderBranchName || 'Branch Admin'}
                                              </p>
                                            )}
                                            
                                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                                              {msg.content}
                                            </p>
                                            
                                            <div className={cn(
                                              "flex items-center justify-end gap-1 mt-1 text-[10px]",
                                              isMe ? "text-gray-600" : "text-gray-400"
                                            )}>
                                              <span>{formatMessageTime(msg.timestamp)}</span>
                                              {isMe && msg.status === 'sent' && <Check className="w-3 h-3" />}
                                              {isMe && msg.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                                              {isMe && msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-blue-600" />}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {isMe && (
                                          <div className="relative group shrink-0">
                                            <Avatar className="w-8 h-8 ring-2 ring-white shadow-md">
                                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs">
                                                SA
                                              </AvatarFallback>
                                            </Avatar>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* MESSAGE INPUT - FIXED BOTTOM */}
                  <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/80 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100/80 rounded-2xl border border-gray-200/50 hover:border-[#FA9DB7]/30 focus-within:border-[#FA9DB7]/50 focus-within:ring-2 focus-within:ring-[#FA9DB7]/20">
                        <div className="flex items-center px-4">
                          <MessageCircle className="w-5 h-5 text-gray-400" />
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message ${selectedBranchDetails?.name || 'branch'}...`}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="border-0 bg-transparent px-3 py-5 focus-visible:ring-0 text-sm"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim()}
                        className="h-12 px-6 bg-gradient-to-r from-[#FA9DB7] to-[#B84A68] hover:from-[#E87A9B] hover:to-[#9C3852] text-white rounded-2xl shadow-lg disabled:opacity-50 shrink-0"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                  <div className="text-center max-w-md px-6">
                    <div className="w-28 h-28 bg-gradient-to-br from-[#FA9DB7]/20 to-[#B84A68]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Building className="w-14 h-14 text-[#B84A68]/40" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Welcome to Executive Communications</h3>
                    <p className="text-gray-500 mb-8">
                      Select a branch from the dropdown above to start managing your communications.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-[#B84A68] bg-[#FA9DB7]/10 px-6 py-3 rounded-2xl">
                      <Sparkles className="w-4 h-4" />
                      <span>{branches.length} active branches available</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}