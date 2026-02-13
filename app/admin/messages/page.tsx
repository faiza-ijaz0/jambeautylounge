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
//   serverTimestamp
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

// export default function BranchMessages() {
//   const { user, logout } = useAuth();
//   const router = useRouter();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [newMessage, setNewMessage] = useState('');
//   const [selectedBranchId, setSelectedBranchId] = useState<string>('');
//   const [branches, setBranches] = useState<any[]>([]);
//   const [loadingBranches, setLoadingBranches] = useState(true);
//   const [myBranchId, setMyBranchId] = useState<string | null>(null);
//   const [myBranchName, setMyBranchName] = useState<string>('');
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Fetch my branch
//   useEffect(() => {
//     const fetchMyBranch = async () => {
//       try {
//         const adminBranchId = 'uBqBBB2yL7PS1ODmWT9A'; // Your branch ID
//         setMyBranchId(adminBranchId);
        
//         const branchRef = doc(db, 'branches', adminBranchId);
//         const branchSnap = await getDoc(branchRef);
        
//         if (branchSnap.exists()) {
//           setMyBranchName(branchSnap.data().name || 'My Branch');
//         }
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     };
//     fetchMyBranch();
//   }, []);

//   // Fetch all branches
// useEffect(() => {
//   const fetchAllBranches = async () => {
//     try {
//       setLoadingBranches(true);
//       const branchesRef = collection(db, 'branches');
//       const q = query(branchesRef, where('status', '==', 'active'));
//       const snapshot = await getDocs(q);
      
//       // ✅ FIX 1: Type define karo
//       let branchesData = snapshot.docs.map(doc => ({ 
//         id: doc.id, 
//         ...doc.data() 
//       })) as { id: string; name: string; [key: string]: any }[]; // 👈 YEH ADD KIYA!
      
//       // ✅ FIX 2: Sort with type safety
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
//   fetchAllBranches();
// }, []);

//   // Fetch messages from BOTH collections
//   useEffect(() => {
//     if (!selectedBranchId || !myBranchId) return;

//     setLoadingMessages(true);

//     // 1. Messages Super Admin ne bheje (adminMessages)
//     const adminSentQuery = query(
//       collection(db, 'adminMessages'),
//       where('recipientBranchId', '==', selectedBranchId),
//       where('senderRole', '==', 'super_admin')
//     );

//     // 2. Messages MERI BRANCH ne bheje (branchMessages)
//     const myBranchSentQuery = query(
//       collection(db, 'branchMessages'),
//       where('senderBranchId', '==', myBranchId),
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
//         const myMsgs = prev.filter(m => m.collection === 'branchMessages');
//         const allMsgs = [...adminMsgs, ...myMsgs].sort((a, b) => 
//           (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
//           (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
//         );
//         return allMsgs;
//       });
//       setLoadingMessages(false);
//     });

//     const unsubscribeMyBranch = onSnapshot(myBranchSentQuery, (snapshot) => {
//       const myMsgs = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         timestamp: doc.data().timestamp?.toDate() || new Date(),
//         collection: 'branchMessages' as const
//       })) as Message[];
      
//       setMessages(prev => {
//         const adminMsgs = prev.filter(m => m.collection === 'adminMessages');
//         const allMsgs = [...adminMsgs, ...myMsgs].sort((a, b) => 
//           (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
//           (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
//         );
//         return allMsgs;
//       });
//     });

//     return () => {
//       unsubscribeAdmin();
//       unsubscribeMyBranch();
//     };
//   }, [selectedBranchId, myBranchId]);

//   // Send reply (branchMessages collection)
//   const handleSendReply = async () => {
//     if (!newMessage.trim() || !selectedBranchId || !myBranchId || !myBranchName) return;

//     const selectedBranch = branches.find(b => b.id === selectedBranchId);
//     if (!selectedBranch) return;

//     try {
//       await addDoc(collection(db, 'branchMessages'), {
//         content: newMessage,
//         senderId: (user as any)?.uid || 'branch-admin',
//         senderName: myBranchName,
//         senderRole: 'branch_admin',
//         senderBranchId: myBranchId,
//         senderBranchName: myBranchName,
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
//     <div role="admin">
//       <div className="flex h-screen bg-gray-100">
//         <AdminSidebar role="branch_admin" onLogout={logout} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
//         <div className="flex-1 flex flex-col">
//           <header className="bg-white border-b px-4 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <AdminMobileSidebar role="branch_admin" onLogout={logout} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
//                 <div>
//                   <h1 className="text-xl font-semibold">Branch Chat</h1>
//                   <p className="text-xs text-gray-500">{myBranchName}</p>
//                 </div>
//               </div>
//               <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
//             </div>
//           </header>

//           <div className="flex-1 overflow-hidden p-4">
//             <Card className="h-full shadow-lg">
//               <CardContent className="p-0 h-full flex flex-col">
                 
// <div className="bg-white px-4 py-3 border-b">
//   <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={loadingBranches}>
//     <SelectTrigger className="w-full md:w-96">
//       <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select branch to chat"} />
//     </SelectTrigger>
//     <SelectContent>
//       {branches.map(branch => (
//         <SelectItem key={branch.id} value={branch.id}>
//           <div className="flex items-center gap-2">
//             <Building className="w-4 h-4" />
//             <span>{branch.name}</span>
//             {branch.id === myBranchId && (
//               <></>
//             )}
//           </div>
//         </SelectItem>
//       ))}
//     </SelectContent>
//   </Select>
// </div>

//                 {selectedBranchId ? (
//                   <div className="flex-1 flex flex-col bg-[#e5ded8]">
                    
//                     {/* Header - Super Admin */}
//                     <div className="bg-white px-4 py-2 border-b flex items-center gap-3">
//                       <Avatar className="w-8 h-8">
//                         <AvatarFallback className="bg-blue-600 text-white">
//                           SA
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <h3 className="font-semibold">Super Admin</h3>
//                         <p className="text-xs text-gray-500">Head Office</p>
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
//                                   const isMe = msg.senderRole === 'branch_admin' && msg.senderBranchId === myBranchId;
//                                   const isSuperAdmin = msg.senderRole === 'super_admin';
                                  
//                                   return (
//                                     <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                                      
//                                       {/* Avatar for received messages (Super Admin) */}
//                                       {isSuperAdmin && (
//                                         <Avatar className="w-7 h-7 mb-1">
//                                           <AvatarFallback className="bg-blue-600 text-white text-xs">
//                                             SA
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
//                                           {isSuperAdmin && (
//                                             <p className="text-xs font-medium text-blue-600 mb-1">
//                                               Super Admin
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
//                                           <AvatarFallback className="bg-green-600 text-white text-xs">
//                                             {myBranchName?.charAt(0) || 'B'}
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
//                             placeholder="Reply to Super Admin..."
//                             onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
//                             className="border-0 bg-transparent px-0 focus-visible:ring-0"
//                           />
//                         </div>
//                         <Button 
//                           onClick={handleSendReply} 
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
//                     <p className="text-gray-500">Select your branch to chat with Super Admin</p>
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

// new
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
  doc, 
  getDoc,
  onSnapshot,
  addDoc,
  serverTimestamp
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

export default function BranchMessages() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [myBranchId, setMyBranchId] = useState<string | null>(null);
  const [myBranchDetails, setMyBranchDetails] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedBranchDetails, setSelectedBranchDetails] = useState<any>(null);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  
  // ✅ SCROLL FIX - Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Fetch my branch
  useEffect(() => {
    const fetchMyBranch = async () => {
      try {
        const adminBranchId = 'uBqBBB2yL7PS1ODmWT9A'; // Your branch ID
        setMyBranchId(adminBranchId);
        
        const branchRef = doc(db, 'branches', adminBranchId);
        const branchSnap = await getDoc(branchRef);
        
        if (branchSnap.exists()) {
          setMyBranchDetails({
            id: branchSnap.id,
            ...branchSnap.data()
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchMyBranch();
  }, []);

  // Fetch all branches
  useEffect(() => {
    const fetchAllBranches = async () => {
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
    fetchAllBranches();
  }, []);

  // Update selected branch details
  useEffect(() => {
    if (selectedBranchId) {
      const branch = branches.find(b => b.id === selectedBranchId);
      setSelectedBranchDetails(branch || null);
    } else {
      setSelectedBranchDetails(null);
    }
  }, [selectedBranchId, branches]);

  // ✅ FIXED: Branch select - Page TOP pe rahega
  useEffect(() => {
    if (selectedBranchId && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedBranchId]);

  // ✅ FIXED: Auto-scroll SIRF TAB jab user already bottom pe ho
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      
      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Fetch messages
  useEffect(() => {
    if (!selectedBranchId || !myBranchId) return;

    setLoadingMessages(true);

    const adminSentQuery = query(
      collection(db, 'adminMessages'),
      where('recipientBranchId', '==', selectedBranchId),
      where('senderRole', '==', 'super_admin')
    );

    const myBranchSentQuery = query(
      collection(db, 'branchMessages'),
      where('senderBranchId', '==', myBranchId),
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
        const myMsgs = prev.filter(m => m.collection === 'branchMessages');
        const allMsgs = [...adminMsgs, ...myMsgs].sort((a, b) => 
          (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
          (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
        );
        return allMsgs;
      });
      setLoadingMessages(false);
    });

    const unsubscribeMyBranch = onSnapshot(myBranchSentQuery, (snapshot) => {
      const myMsgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        collection: 'branchMessages' as const
      })) as Message[];
      
      setMessages(prev => {
        const adminMsgs = prev.filter(m => m.collection === 'adminMessages');
        const allMsgs = [...adminMsgs, ...myMsgs].sort((a, b) => 
          (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
          (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
        );
        return allMsgs;
      });
    });

    return () => {
      unsubscribeAdmin();
      unsubscribeMyBranch();
    };
  }, [selectedBranchId, myBranchId]);

  // ✅ FIXED: Send message - Page move nahi hoga
  const handleSendReply = async () => {
    if (!newMessage.trim() || !selectedBranchId || !myBranchId || !myBranchDetails) return;

    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    if (!selectedBranch) return;

    try {
      await addDoc(collection(db, 'branchMessages'), {
        content: newMessage,
        senderId: (user as any)?.uid || 'branch-admin',
        senderName: myBranchDetails.name,
        senderRole: 'branch_admin',
        senderBranchId: myBranchId,
        senderBranchName: myBranchDetails.name,
        recipientBranchId: selectedBranchId,
        recipientBranchName: selectedBranch.name,
        timestamp: serverTimestamp(),
        read: false,
        status: 'sent'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isToday(date)) return format(date, 'hh:mm a');
    if (isYesterday(date)) return `Yesterday ${format(date, 'hh:mm a')}`;
    return format(date, 'dd/MM/yy hh:mm a');
  };

  // Group messages
  const groupedMessages = messages.reduce((groups: any, msg) => {
    const date = msg.timestamp?.toDate 
      ? format(msg.timestamp.toDate(), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Filter branches (hide my own branch)
 // Filter branches - SARI BRANCHES SHOW KARO (apni branch bhi)
const filteredBranches = branches.filter(branch => 
  branch.name?.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
  branch.city?.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
  branch.managerName?.toLowerCase().includes(branchSearchQuery.toLowerCase())
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen bg-gray-50/50">
        <AdminSidebar 
          role="branch_admin" 
          onLogout={logout} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Main Content - NO SCROLL */}
        <div 
          ref={mainContentRef}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Header - Sticky at top */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 px-6 py-4 sticky top-0 z-30 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar 
                  role="branch_admin" 
                  onLogout={logout} 
                  isOpen={sidebarOpen} 
                  onToggle={() => setSidebarOpen(!sidebarOpen)} 
                />
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FA9DB7] to-[#B84A68] flex items-center justify-center shadow-lg">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-serif font-bold text-gray-900">Branch Communications</h1>
                      <p className="text-xs text-gray-500 mt-0.5">{myBranchDetails?.name || 'Branch'} • Super Admin</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-4 py-2 border-[#FA9DB7]/30 text-[#B84A68] bg-white rounded-full">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  {myBranchDetails?.name || 'Branch'}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-red-50 hover:text-red-600"
                  onClick={logout}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">
                      {myBranchDetails?.name?.charAt(0) || 'B'}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden p-6">
            <Card className="h-full border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
              <CardContent className="p-0 h-full flex flex-col">
                
                {/* Branch Selector */}
                <div className="bg-gradient-to-r from-white to-gray-50/80 px-6 py-5 border-b border-gray-200/80 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 block">
                        Select Branch to Chat
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
                              <span>{loadingBranches ? "Loading branches..." : "Choose a branch to chat with Super Admin"}</span>
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
                            {filteredBranches.length > 0 ? (
                              filteredBranches.map(branch => (
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
                              ))
                            ) : (
                              <div className="py-8 text-center text-gray-500">
                                No other branches available
                              </div>
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedBranchDetails && (
                      <div className="flex items-center gap-4 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-200 shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <span className="text-xs font-medium text-blue-700">Super Admin</span>
                        </div>
                        <div className="h-4 w-px bg-blue-200"></div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs text-blue-700">Head Office</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBranchId && selectedBranchDetails ? (
                  <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white min-h-0">
                    
                    {/* Super Admin Profile Header */}
                    <div className="bg-white border-b border-gray-200/80 px-6 py-5 shrink-0">
                      <div className="flex items-start gap-5">
                        {/* Super Admin Avatar */}
                        <div className="relative">
                          <Avatar className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-2xl font-serif">
                              SA
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 border-4 border-white rounded-full"></div>
                        </div>
                        
                        {/* Super Admin Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-serif font-bold text-gray-900">
                              Super Admin
                            </h2>
                            <Badge className="bg-blue-50 text-blue-700 border-0 rounded-full px-4 py-1">
                              Head Office
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600">Corporate Office</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600">Management Team</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600">+971 54 715 8690</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600">info@jambeautylounge.com</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-200 hover:border-blue-500 hover:bg-blue-50">
                            <Phone className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-200 hover:border-blue-500 hover:bg-blue-50">
                            <Mail className="w-4 h-4 text-gray-600" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area - SIRF YAHI SCROLL HOGA */}
                    <ScrollArea 
                      ref={scrollContainerRef}
                      className="flex-1 p-6 bg-[#f3f2f1]"
                    >
                      {loadingMessages ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-[#FA9DB7]" />
                            <span className="text-sm text-gray-600">Loading conversation...</span>
                          </div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-24 h-24 bg-gradient-to-br from-[#FA9DB7]/20 to-[#B84A68]/10 rounded-3xl flex items-center justify-center mb-4">
                            <MessageCircle className="w-12 h-12 text-[#B84A68]" />
                          </div>
                          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No messages yet</h3>
                          <p className="text-gray-500 text-center max-w-md">
                            Start a conversation with Super Admin. Your messages will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
                            <div key={date}>
                              <div className="flex justify-center mb-6 sticky top-0 z-10">
                                <span className="bg-gray-900/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-lg">
                                  {formatDateHeader(date)}
                                </span>
                              </div>
                              
                              <div className="space-y-3">
                                {(dateMessages as Message[]).map((msg) => {
                                  const isMe = msg.senderRole === 'branch_admin' && msg.senderBranchId === myBranchId;
                                  const isSuperAdmin = msg.senderRole === 'super_admin';
                                  
                                  return (
                                    <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                                      
                                      {/* Avatar for Super Admin */}
                                      {isSuperAdmin && (
                                        <div className="relative group shrink-0">
                                          <Avatar className="w-8 h-8 mb-1 ring-2 ring-white shadow-md">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs">
                                              SA
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50">
                                            <p className="font-bold">Super Admin</p>
                                            <p className="text-gray-300">Head Office</p>
                                            <div className="absolute bottom-[-4px] left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Message Bubble */}
                                      <div className={cn("max-w-xs lg:max-w-md relative group", isMe ? "order-2" : "order-1")}>
                                        <div className={cn(
                                          "px-4 py-3 rounded-2xl text-sm shadow-md transition-all hover:shadow-lg",
                                          isMe 
                                            ? "bg-gradient-to-br from-[#dcf8c6] to-[#c8e6b5] text-gray-800 rounded-br-none" 
                                            : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                                        )}>
                                          
                                          {/* Sender Name */}
                                          {isSuperAdmin && (
                                            <p className="text-xs font-bold text-blue-600 mb-1.5">
                                              Super Admin
                                            </p>
                                          )}
                                          
                                          {/* Message Content */}
                                          <p className="whitespace-pre-wrap break-words pr-8 leading-relaxed">
                                            {msg.content}
                                          </p>
                                          
                                          {/* Time & Status */}
                                          <div className={cn(
                                            "flex items-center justify-end gap-1.5 mt-1.5 text-[10px]",
                                            isMe ? "text-gray-600" : "text-gray-400"
                                          )}>
                                            <span>{formatMessageTime(msg.timestamp)}</span>
                                            {isMe && msg.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                                            {isMe && msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5" />}
                                            {isMe && msg.status === 'seen' && <CheckCheck className="w-3.5 h-3.5 text-blue-600" />}
                                          </div>
                                        </div>
                                        
                                        {/* Bubble Tail */}
                                        <div className={cn(
                                          "absolute bottom-0 w-3 h-3",
                                          isMe 
                                            ? "right-[-6px] text-[#dcf8c6]" 
                                            : "left-[-6px] text-white"
                                        )}>
                                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                                            className={isMe ? "rotate-[45deg]" : "rotate-[-135deg]"}>
                                            <path d="M0 0 L12 0 L0 12 Z" />
                                          </svg>
                                        </div>
                                      </div>
                                      
                                      {/* Avatar for My Branch */}
                                      {isMe && (
                                        <div className="relative group shrink-0">
                                          <Avatar className="w-8 h-8 mb-1 ring-2 ring-white shadow-md">
                                            <AvatarFallback className="bg-gradient-to-br from-[#FA9DB7] to-[#B84A68] text-white text-xs">
                                              {myBranchDetails?.name?.charAt(0) || 'B'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50">
                                            <p className="font-bold">{myBranchDetails?.name}</p>
                                            <p className="text-gray-300">You</p>
                                            <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                          </div>
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
                    </ScrollArea>

                    {/* Message Input - Fixed at bottom */}
                    <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/80 px-6 py-4 shrink-0">
                      <div className="flex items-center gap-3 max-w-5xl mx-auto">
                        <div className="flex-1 bg-gray-100/80 rounded-2xl border border-gray-200/50 hover:border-[#FA9DB7]/30 focus-within:border-[#FA9DB7]/50 focus-within:ring-2 focus-within:ring-[#FA9DB7]/20">
                          <div className="flex items-center px-4">
                            <MessageCircle className="w-5 h-5 text-gray-400" />
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder={`Reply to Super Admin...`}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                              className="border-0 bg-transparent px-3 py-6 focus-visible:ring-0 text-sm"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleSendReply} 
                          disabled={!newMessage.trim()}
                          className="h-14 px-6 bg-gradient-to-r from-[#FA9DB7] to-[#B84A68] hover:from-[#E87A9B] hover:to-[#9C3852] text-white rounded-2xl shadow-lg disabled:opacity-50 shrink-0"
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
                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                        Welcome, {myBranchDetails?.name || 'Branch'}
                      </h3>
                      <p className="text-gray-500 mb-8">
                        Select a branch from the dropdown above to chat with Super Admin.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-[#B84A68] bg-[#FA9DB7]/10 px-6 py-3 rounded-2xl">
                        <Sparkles className="w-4 h-4" />
                        <span>{filteredBranches.length} branches available to chat</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}