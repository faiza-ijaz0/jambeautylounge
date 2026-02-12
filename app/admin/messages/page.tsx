'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Building,
  Check,
  CheckCheck,
  Loader2
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [myBranchId, setMyBranchId] = useState<string | null>(null);
  const [myBranchName, setMyBranchName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch my branch
  useEffect(() => {
    const fetchMyBranch = async () => {
      try {
        const adminBranchId = 'uBqBBB2yL7PS1ODmWT9A'; // Your branch ID
        setMyBranchId(adminBranchId);
        
        const branchRef = doc(db, 'branches', adminBranchId);
        const branchSnap = await getDoc(branchRef);
        
        if (branchSnap.exists()) {
          setMyBranchName(branchSnap.data().name || 'My Branch');
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
      
      // ✅ FIX 1: Type define karo
      let branchesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as { id: string; name: string; [key: string]: any }[]; // 👈 YEH ADD KIYA!
      
      // ✅ FIX 2: Sort with type safety
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

  // Fetch messages from BOTH collections
  useEffect(() => {
    if (!selectedBranchId || !myBranchId) return;

    setLoadingMessages(true);

    // 1. Messages Super Admin ne bheje (adminMessages)
    const adminSentQuery = query(
      collection(db, 'adminMessages'),
      where('recipientBranchId', '==', selectedBranchId),
      where('senderRole', '==', 'super_admin')
    );

    // 2. Messages MERI BRANCH ne bheje (branchMessages)
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

  // Send reply (branchMessages collection)
  const handleSendReply = async () => {
    if (!newMessage.trim() || !selectedBranchId || !myBranchId || !myBranchName) return;

    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    if (!selectedBranch) return;

    try {
      await addDoc(collection(db, 'branchMessages'), {
        content: newMessage,
        senderId: (user as any)?.uid || 'branch-admin',
        senderName: myBranchName,
        senderRole: 'branch_admin',
        senderBranchId: myBranchId,
        senderBranchName: myBranchName,
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isToday(date)) return format(date, 'hh:mm a');
    if (isYesterday(date)) return `Yesterday ${format(date, 'hh:mm a')}`;
    return format(date, 'dd/MM/yy hh:mm a');
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
  };

  // Group messages by date
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

  return (
    <div role="admin">
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar role="branch_admin" onLogout={logout} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AdminMobileSidebar role="branch_admin" onLogout={logout} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-xl font-semibold">Branch Chat</h1>
                  <p className="text-xs text-gray-500">{myBranchName}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden p-4">
            <Card className="h-full shadow-lg">
              <CardContent className="p-0 h-full flex flex-col">
                 
<div className="bg-white px-4 py-3 border-b">
  <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={loadingBranches}>
    <SelectTrigger className="w-full md:w-96">
      <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select branch to chat"} />
    </SelectTrigger>
    <SelectContent>
      {branches.map(branch => (
        <SelectItem key={branch.id} value={branch.id}>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>{branch.name}</span>
            {branch.id === myBranchId && (
              <></>
            )}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

                {selectedBranchId ? (
                  <div className="flex-1 flex flex-col bg-[#e5ded8]">
                    
                    {/* Header - Super Admin */}
                    <div className="bg-white px-4 py-2 border-b flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white">
                          SA
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">Super Admin</h3>
                        <p className="text-xs text-gray-500">Head Office</p>
                      </div>
                    </div>

                    {/* Messages - WHATSAPP STYLE */}
                    <ScrollArea className="flex-1 p-4">
                      {loadingMessages ? (
                        <div className="flex justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No messages yet</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
                            <div key={date}>
                              <div className="flex justify-center mb-4">
                                <span className="bg-gray-200/80 text-xs px-3 py-1.5 rounded-full">
                                  {formatDateHeader(date)}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                {(dateMessages as Message[]).map((msg) => {
                                  const isMe = msg.senderRole === 'branch_admin' && msg.senderBranchId === myBranchId;
                                  const isSuperAdmin = msg.senderRole === 'super_admin';
                                  
                                  return (
                                    <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                                      
                                      {/* Avatar for received messages (Super Admin) */}
                                      {isSuperAdmin && (
                                        <Avatar className="w-7 h-7 mb-1">
                                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                                            SA
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                      
                                      {/* Message Bubble */}
                                      <div className={cn("max-w-xs lg:max-w-md relative", isMe ? "order-2" : "order-1")}>
                                        <div className={cn(
                                          "px-3.5 py-2 rounded-2xl text-sm shadow-sm",
                                          isMe 
                                            ? "bg-[#dcf8c6] text-gray-800 rounded-br-none"  // GREEN - Sent by YOU
                                            : "bg-white text-gray-800 rounded-bl-none border border-gray-100" // WHITE - Received
                                        )}>
                                          
                                          {/* Sender Name */}
                                          {isSuperAdmin && (
                                            <p className="text-xs font-medium text-blue-600 mb-1">
                                              Super Admin
                                            </p>
                                          )}
                                          
                                          {/* Message */}
                                          <p className="whitespace-pre-wrap break-words pr-8">{msg.content}</p>
                                          
                                          {/* Time & Status */}
                                          <div className={cn(
                                            "flex items-center justify-end gap-1 mt-0.5 text-[10px]",
                                            isMe ? "text-gray-500" : "text-gray-400"
                                          )}>
                                            <span>{formatMessageTime(msg.timestamp)}</span>
                                            {isMe && msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-gray-400" />}
                                            {isMe && msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-gray-500" />}
                                            {isMe && msg.status === 'seen' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
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
                                      
                                      {/* Avatar for sent messages (YOU) */}
                                      {isMe && (
                                        <Avatar className="w-7 h-7 mb-1">
                                          <AvatarFallback className="bg-green-600 text-white text-xs">
                                            {myBranchName?.charAt(0) || 'B'}
                                          </AvatarFallback>
                                        </Avatar>
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

                    {/* Message Input */}
                    <div className="bg-white px-4 py-3 border-t">
                      <div className="flex gap-2">
                        <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-1.5">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Reply to Super Admin..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                            className="border-0 bg-transparent px-0 focus-visible:ring-0"
                          />
                        </div>
                        <Button 
                          onClick={handleSendReply} 
                          disabled={!newMessage.trim()}
                          className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <p className="text-gray-500">Select your branch to chat with Super Admin</p>
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