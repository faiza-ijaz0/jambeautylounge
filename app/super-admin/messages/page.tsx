'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  User,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Building,
  Filter
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useChatStore, type Message, type Conversation } from "@/stores/chat.store";
import { formatDistanceToNow } from "date-fns";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";

export default function SuperAdminMessages() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    activeConversation,
    isLoading,
    setActiveConversation,
    addMessage,
    markConversationAsRead,
    getConversationMessages,
    getBranchConversations,
    getUnreadCount
  } = useChatStore();

  const { playNotificationSound } = useMessageNotifications();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mock data for demonstration
  useEffect(() => {
    if (conversations.length === 0) {
      const mockConversations: Conversation[] = [
        {
          id: '1',
          customerId: 'cust1',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
          customerEmail: 'john@example.com',
          branchId: 'branch1',
          unreadCount: 2,
          createdAt: new Date('2025-12-01T10:00:00'),
          updatedAt: new Date('2025-12-01T14:30:00')
        },
        {
          id: '2',
          customerId: 'cust2',
          customerName: 'Jane Smith',
          customerPhone: '+1234567891',
          customerEmail: 'jane@example.com',
          branchId: 'branch2',
          unreadCount: 1,
          createdAt: new Date('2025-11-30T09:00:00'),
          updatedAt: new Date('2025-12-01T12:00:00')
        },
        {
          id: '3',
          customerId: 'cust3',
          customerName: 'Mike Johnson',
          customerPhone: '+1234567892',
          customerEmail: 'mike@example.com',
          branchId: 'branch1',
          unreadCount: 0,
          createdAt: new Date('2025-11-29T08:00:00'),
          updatedAt: new Date('2025-12-01T11:00:00')
        }
      ];

      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hi, I would like to book an appointment for tomorrow',
          senderId: 'cust1',
          senderName: 'John Doe',
          senderType: 'customer',
          branchId: 'branch1',
          timestamp: new Date('2025-12-01T14:00:00'),
          read: false,
          conversationId: '1'
        },
        {
          id: '2',
          content: 'Hello John! I can help you with that. What time works best for you?',
          senderId: 'admin1',
          senderName: 'Branch Admin',
          senderType: 'admin',
          branchId: 'branch1',
          timestamp: new Date('2025-12-01T14:15:00'),
          read: true,
          conversationId: '1'
        },
        {
          id: '3',
          content: 'Around 2 PM would be great',
          senderId: 'cust1',
          senderName: 'John Doe',
          senderType: 'customer',
          branchId: 'branch1',
          timestamp: new Date('2025-12-01T14:30:00'),
          read: false,
          conversationId: '1'
        },
        {
          id: '4',
          content: 'I need to reschedule my haircut appointment',
          senderId: 'cust2',
          senderName: 'Jane Smith',
          senderType: 'customer',
          branchId: 'branch2',
          timestamp: new Date('2025-12-01T12:00:00'),
          read: false,
          conversationId: '2'
        }
      ];

      // Set mock data
      useChatStore.getState().setConversations(mockConversations);
      mockMessages.forEach(msg => useChatStore.getState().addMessage(msg));
    }
  }, [conversations.length]);

  // Play notification sound for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Super admin gets notified for all customer messages across all branches
      if (message.senderType === 'customer') {
        playNotificationSound();
      }
    };

    // Listen for new messages (in a real app, this would be from WebSocket or similar)
    // For now, we'll check for unread messages periodically
    const checkForNewMessages = () => {
      const currentUnreadCount = getUnreadCount();
      if (currentUnreadCount > 0) {
        // This is a simplified approach - in real implementation,
        // you'd track which messages are new vs already notified
        playNotificationSound();
      }
    };

    // Check every 5 seconds for new messages (simplified polling)
    const interval = setInterval(checkForNewMessages, 5000);

    return () => clearInterval(interval);
  }, [playNotificationSound, getUnreadCount]);

  // Mock branches data
  const branches = [
    { id: 'branch1', name: 'Downtown Branch' },
    { id: 'branch2', name: 'Uptown Branch' },
    { id: 'branch3', name: 'Mall Branch' }
  ];

  const filteredConversations = selectedBranch === 'all'
    ? conversations
    : conversations.filter(c => c.branchId === selectedBranch);

  const activeMessages = activeConversation ? getConversationMessages(activeConversation) : [];
  const unreadCount = getUnreadCount();

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user?.id || 'super-admin',
      senderName: 'Super Admin',
      senderType: 'admin',
      timestamp: new Date(),
      read: true,
      conversationId: activeConversation
    };

    addMessage(message);
    setNewMessage('');

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    markConversationAsRead(conversationId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'Unassigned';
    return branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar role="super_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-0" : "lg:ml-0"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar role="super_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">All Messages</h1>
                  <p className="text-sm text-gray-600">Monitor conversations across all branches</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="px-2 py-1">
                    {unreadCount} new messages
                  </Badge>
                )}
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex">
              {/* Conversations List */}
              <div className="w-80 border-r bg-white">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold">All Conversations</h2>
                  </div>

                  {/* Branch Filter */}
                  <div className="mb-4">
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleConversationClick(conversation.id)}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer mb-2 transition-colors",
                          activeConversation === conversation.id
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(conversation.customerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {conversation.customerName}
                              </p>
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessage
                                  ? formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })
                                  : formatDistanceToNow(conversation.createdAt, { addSuffix: true })
                                }
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Building className="w-3 h-3" />
                                <span>{getBranchName(conversation.branchId)}</span>
                              </div>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {activeConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-white">
                      {(() => {
                        const conversation = conversations.find(c => c.id === activeConversation);
                        return conversation ? (
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {getInitials(conversation.customerName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-medium">{conversation.customerName}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {getBranchName(conversation.branchId)}
                                </span>
                                {conversation.customerPhone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {conversation.customerPhone}
                                  </span>
                                )}
                                {conversation.customerEmail && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {conversation.customerEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {conversation.unreadCount} unread
                            </Badge>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {activeMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-3",
                              message.senderType === 'admin' ? "justify-end" : "justify-start"
                            )}
                          >
                            {message.senderType === 'customer' && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {getInitials(message.senderName)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                                message.senderType === 'admin'
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              )}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs opacity-70">
                                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                                </span>
                                {message.branchId && (
                                  <span className="text-xs opacity-70 bg-white/20 px-2 py-0.5 rounded">
                                    {getBranchName(message.branchId)}
                                  </span>
                                )}
                                {message.senderType === 'admin' && (
                                  <CheckCheck className="w-3 h-3 opacity-70" />
                                )}
                              </div>
                            </div>
                            {message.senderType === 'admin' && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                  SA
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t bg-white">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message as Super Admin..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-600">Choose a customer conversation to view messages from all branches</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}