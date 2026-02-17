// stores/customerMessages.store.ts - Customer to Branch Chat System

import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc,
  writeBatch,
  orderBy,
  limit
} from 'firebase/firestore';

export interface CustomerMessage {
  id: string;
  content: string;
  
  // Sender Info (Customer)
  senderId: string;              // Customer UID
  senderName: string;            // Customer Name
  senderEmail: string;           // Customer Email
  senderRole: 'customer';         // Always 'customer'
  senderPhone?: string;           // Optional phone number
  
  // Recipient Info (Branch)
  recipientBranchId: string;      // Target branch ID
  recipientBranchName: string;    // Target branch name
  recipientRole: 'branch_admin';   // Always 'branch_admin'
  
  // Message Metadata
  timestamp: Timestamp | any;
  read: boolean;                   // Read by branch admin?
  readBy?: string[];               // Array of user IDs who read it
  readAt?: Timestamp | any;
  
  // Status Tracking
  status: 'sent' | 'delivered' | 'seen';
  
  // Message Features
  imageBase64?: string;            // Optional image attachment
  imageName?: string;
  
  // Delete/Edit Features
  deletedFor?: string[];           // Array of user IDs who deleted it
  deletedForEveryone?: boolean;    // Hard delete flag
  edited?: boolean;                // Was message edited?
  editedAt?: Timestamp | any;
  
  // Reply Feature
  replyToId?: string;              // Original message ID being replied to
  replyToContent?: string;         // Content of original message
  replyToSender?: string;          // Sender name of original message
  replyToImage?: string;           // Image of original message
  
  // Collection name (for internal use)
  collection: 'customerMessages';
}

interface CustomerMessagesStore {
  messages: CustomerMessage[];
  loading: boolean;
  error: string | null;
  selectedBranchId: string | null;
  customerId: string | null;
  
  // Actions
  sendMessage: (message: Omit<CustomerMessage, 'id' | 'timestamp' | 'status' | 'read' | 'collection'>) => Promise<void>;
  fetchMessagesForCustomer: (customerId: string, branchId?: string) => Promise<void>;
  fetchMessagesForBranch: (branchId: string) => Promise<void>;
  markMessageAsRead: (messageId: string, userId: string, role: 'customer' | 'branch_admin') => Promise<void>;
  markAllMessagesAsRead: (branchId: string, userId: string) => Promise<void>;
  deleteMessageForMe: (messageId: string, userId: string) => Promise<void>;
  deleteMessageForEveryone: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  
  setSelectedBranchId: (branchId: string | null) => void;
  setCustomerId: (customerId: string | null) => void;
  subscribeToCustomerMessages: (customerId: string, branchId?: string) => () => void;
  subscribeToBranchMessages: (branchId: string) => () => void;
  clearMessages: () => void;
}

export const useCustomerMessagesStore = create<CustomerMessagesStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  selectedBranchId: null,
  customerId: null,

  sendMessage: async (messageData) => {
    try {
      set({ loading: true, error: null });
      
      const messageRef = collection(db, 'customerMessages');
      await addDoc(messageRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        read: false,
        readBy: [],
        status: 'sent',
        readAt: null,
        deletedFor: [],
        deletedForEveryone: false,
        edited: false,
        collection: 'customerMessages'
      });
      
      console.log('✅ Customer message sent to branch:', messageData.recipientBranchName);
    } catch (error) {
      console.error('❌ Error sending customer message:', error);
      set({ error: 'Failed to send message' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  markMessageAsRead: async (messageId, userId, role) => {
    try {
      const messageRef = doc(db, 'customerMessages', messageId);
      const message = get().messages.find(m => m.id === messageId);
      
      // Only mark as read if not already read
      if (!message?.read) {
        await updateDoc(messageRef, {
          read: true,
          readBy: [...(message?.readBy || []), userId],
          readAt: serverTimestamp(),
          status: 'seen'
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  markAllMessagesAsRead: async (branchId, userId) => {
    try {
      const batch = writeBatch(db);
      const messagesRef = collection(db, 'customerMessages');
      
      // Mark all unread messages for this branch as read
      const q = query(
        messagesRef,
        where('recipientBranchId', '==', branchId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readBy: [userId],
          readAt: serverTimestamp(),
          status: 'seen'
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  deleteMessageForMe: async (messageId, userId) => {
    try {
      const messageRef = doc(db, 'customerMessages', messageId);
      const message = get().messages.find(m => m.id === messageId);
      const deletedFor = message?.deletedFor || [];
      
      if (!deletedFor.includes(userId)) {
        deletedFor.push(userId);
        await updateDoc(messageRef, { deletedFor });
      }
    } catch (error) {
      console.error('Error deleting message for me:', error);
    }
  },

  deleteMessageForEveryone: async (messageId) => {
    try {
      const messageRef = doc(db, 'customerMessages', messageId);
      await updateDoc(messageRef, { deletedForEveryone: true });
      // OR use deleteDoc for hard delete:
      // await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message for everyone:', error);
    }
  },

  editMessage: async (messageId, newContent) => {
    try {
      const messageRef = doc(db, 'customerMessages', messageId);
      await updateDoc(messageRef, {
        content: newContent,
        edited: true,
        editedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  },

  setSelectedBranchId: (branchId) => {
    set({ selectedBranchId: branchId });
  },

  setCustomerId: (customerId) => {
    set({ customerId });
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  fetchMessagesForCustomer: async (customerId, branchId) => {
    try {
      set({ loading: true, error: null });
      
      const messagesRef = collection(db, 'customerMessages');
      
      // Build query based on whether branch filter is provided
      let q;
      if (branchId) {
        // Messages between this customer and specific branch
        q = query(
          messagesRef,
          where('senderId', '==', customerId),
          where('recipientBranchId', '==', branchId),
          orderBy('timestamp', 'asc')
        );
      } else {
        // All messages from this customer
        q = query(
          messagesRef,
          where('senderId', '==', customerId),
          orderBy('timestamp', 'asc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      let messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || '',
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          senderRole: 'customer',
          senderPhone: data.senderPhone || '',
          recipientBranchId: data.recipientBranchId || '',
          recipientBranchName: data.recipientBranchName || '',
          recipientRole: 'branch_admin',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt?.toDate() || null,
          status: data.status || 'sent',
          imageBase64: data.imageBase64 || null,
          imageName: data.imageName || null,
          deletedFor: data.deletedFor || [],
          deletedForEveryone: data.deletedForEveryone || false,
          edited: data.edited || false,
          editedAt: data.editedAt?.toDate() || null,
          replyToId: data.replyToId || null,
          replyToContent: data.replyToContent || null,
          replyToSender: data.replyToSender || null,
          replyToImage: data.replyToImage || null,
          collection: 'customerMessages'
        } as CustomerMessage;
      });
      
      // Filter out deleted messages
      messages = messages.filter(msg => 
        !msg.deletedForEveryone && 
        !msg.deletedFor?.includes(customerId)
      );
      
      set({ messages });
    } catch (error) {
      console.error('Error fetching customer messages:', error);
      set({ error: 'Failed to fetch messages' });
    } finally {
      set({ loading: false });
    }
  },

  fetchMessagesForBranch: async (branchId) => {
    try {
      set({ loading: true, error: null });
      
      const messagesRef = collection(db, 'customerMessages');
      const q = query(
        messagesRef,
        where('recipientBranchId', '==', branchId),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      let messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || '',
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          senderRole: 'customer',
          senderPhone: data.senderPhone || '',
          recipientBranchId: data.recipientBranchId || '',
          recipientBranchName: data.recipientBranchName || '',
          recipientRole: 'branch_admin',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt?.toDate() || null,
          status: data.status || 'sent',
          imageBase64: data.imageBase64 || null,
          imageName: data.imageName || null,
          deletedFor: data.deletedFor || [],
          deletedForEveryone: data.deletedForEveryone || false,
          edited: data.edited || false,
          editedAt: data.editedAt?.toDate() || null,
          replyToId: data.replyToId || null,
          replyToContent: data.replyToContent || null,
          replyToSender: data.replyToSender || null,
          replyToImage: data.replyToImage || null,
          collection: 'customerMessages'
        } as CustomerMessage;
      });
      
      // Filter out messages deleted for everyone
      messages = messages.filter(msg => !msg.deletedForEveryone);
      
      set({ messages });
    } catch (error) {
      console.error('Error fetching branch messages:', error);
      set({ error: 'Failed to fetch messages' });
    } finally {
      set({ loading: false });
    }
  },

  subscribeToCustomerMessages: (customerId, branchId) => {
    const messagesRef = collection(db, 'customerMessages');
    
    // Build query
    let q;
    if (branchId) {
      q = query(
        messagesRef,
        where('senderId', '==', customerId),
        where('recipientBranchId', '==', branchId),
        orderBy('timestamp', 'asc')
      );
    } else {
      q = query(
        messagesRef,
        where('senderId', '==', customerId),
        orderBy('timestamp', 'asc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || '',
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          senderRole: 'customer',
          senderPhone: data.senderPhone || '',
          recipientBranchId: data.recipientBranchId || '',
          recipientBranchName: data.recipientBranchName || '',
          recipientRole: 'branch_admin',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt?.toDate() || null,
          status: data.status || 'sent',
          imageBase64: data.imageBase64 || null,
          imageName: data.imageName || null,
          deletedFor: data.deletedFor || [],
          deletedForEveryone: data.deletedForEveryone || false,
          edited: data.edited || false,
          editedAt: data.editedAt?.toDate() || null,
          replyToId: data.replyToId || null,
          replyToContent: data.replyToContent || null,
          replyToSender: data.replyToSender || null,
          replyToImage: data.replyToImage || null,
          collection: 'customerMessages'
        } as CustomerMessage;
      });
      
      // Filter out deleted messages
      messages = messages.filter(msg => 
        !msg.deletedForEveryone && 
        !msg.deletedFor?.includes(customerId)
      );
      
      set({ messages });
    }, (error) => {
      console.error('Snapshot error:', error);
      set({ error: 'Failed to listen for messages' });
    });

    return unsubscribe;
  },

  subscribeToBranchMessages: (branchId) => {
    const messagesRef = collection(db, 'customerMessages');
    
    const q = query(
      messagesRef,
      where('recipientBranchId', '==', branchId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || '',
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          senderRole: 'customer',
          senderPhone: data.senderPhone || '',
          recipientBranchId: data.recipientBranchId || '',
          recipientBranchName: data.recipientBranchName || '',
          recipientRole: 'branch_admin',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt?.toDate() || null,
          status: data.status || 'sent',
          imageBase64: data.imageBase64 || null,
          imageName: data.imageName || null,
          deletedFor: data.deletedFor || [],
          deletedForEveryone: data.deletedForEveryone || false,
          edited: data.edited || false,
          editedAt: data.editedAt?.toDate() || null,
          replyToId: data.replyToId || null,
          replyToContent: data.replyToContent || null,
          replyToSender: data.replyToSender || null,
          replyToImage: data.replyToImage || null,
          collection: 'customerMessages'
        } as CustomerMessage;
      });
      
      // Filter out messages deleted for everyone
      messages = messages.filter(msg => !msg.deletedForEveryone);
      
      set({ messages });
    }, (error) => {
      console.error('Snapshot error:', error);
      set({ error: 'Failed to listen for messages' });
    });

    return unsubscribe;
  }
}));