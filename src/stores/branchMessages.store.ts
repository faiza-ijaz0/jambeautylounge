// stores/branchMessages.store.ts - COMPLETELY FIXED

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
  orderBy 
} from 'firebase/firestore';

export interface BranchMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'branch_admin' | 'super_admin';
  senderBranchId: string;      // Kis branch se bheja
  senderBranchName: string;
  recipientRole: 'super_admin' | 'branch_admin';
  recipientBranchId?: string;  // Agar branch ko bheja hai toh
  recipientEmail?: string;
  timestamp: Timestamp | any;
  read: boolean;
  readBy?: string[];
  readAt?: Timestamp | any;
  status: 'sent' | 'delivered' | 'seen';
  messageType: 'to_super_admin' | 'to_branch' | 'internal';
}

interface BranchMessagesStore {
  messages: BranchMessage[];
  loading: boolean;
  error: string | null;
  currentBranchId: string | null;
  
  // Actions
  sendMessage: (message: Omit<BranchMessage, 'id' | 'timestamp' | 'status' | 'read'>) => Promise<void>;
  fetchMessagesForBranch: (branchId: string) => Promise<void>;
  fetchMessagesFromSuperAdmin: (branchId: string) => Promise<void>;
  markMessageAsRead: (messageId: string, userId: string) => Promise<void>;
  markAllMessagesAsRead: (branchId: string, userId: string) => Promise<void>;
  setCurrentBranchId: (branchId: string | null) => void;
  subscribeToBranchMessages: (branchId: string) => () => void;
}

export const useBranchMessagesStore = create<BranchMessagesStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  currentBranchId: null,

  sendMessage: async (messageData) => {
    try {
      set({ loading: true, error: null });
      
      const messageRef = collection(db, 'branchMessages');
      await addDoc(messageRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        read: false,
        readBy: [],
        status: 'sent',
        readAt: null
      });
      
      console.log('✅ Branch message sent:', messageData.recipientRole);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      set({ error: 'Failed to send message' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  markMessageAsRead: async (messageId, userId) => {
    try {
      const messageRef = doc(db, 'branchMessages', messageId);
      const message = get().messages.find(m => m.id === messageId);
      
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
      const messagesRef = collection(db, 'branchMessages');
      
      const q = query(
        messagesRef,
        where('recipientBranchId', '==', branchId),
        where('read', '==', false),
        where('senderRole', '==', 'super_admin')
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

  setCurrentBranchId: (branchId) => {
    set({ currentBranchId: branchId });
  },

  // ✅ FIXED: Complete data mapping with ALL fields
  fetchMessagesForBranch: async (branchId) => {
    try {
      set({ loading: true, error: null });
      
      const messagesRef = collection(db, 'branchMessages');
      const q = query(
        messagesRef,
        where('senderBranchId', '==', branchId)
      );
      
      const querySnapshot = await getDocs(q);
      
      // ✅ Complete mapping with ALL fields
      let messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || '',
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          senderRole: data.senderRole || 'branch_admin',
          senderBranchId: data.senderBranchId || branchId,
          senderBranchName: data.senderBranchName || '',
          recipientRole: data.recipientRole || 'super_admin',
          recipientBranchId: data.recipientBranchId || '',
          recipientEmail: data.recipientEmail || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt?.toDate() || null,
          status: data.status || 'sent',
          messageType: data.messageType || 'to_super_admin'
        } as BranchMessage;
      });
      
      // ✅ Client-side sorting
      messages = messages.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return timeA.getTime() - timeB.getTime();
      });
      
      set({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: 'Failed to fetch messages' });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ FIXED: Complete data mapping with ALL fields
  fetchMessagesFromSuperAdmin: async (branchId) => {
    try {
      set({ loading: true, error: null });
      
      const messagesRef = collection(db, 'branchMessages');
      const q = query(
        messagesRef,
        where('recipientBranchId', '==', branchId),
        where('senderRole', '==', 'super_admin')
      );
      
      const querySnapshot = await getDocs(q);
      
      // ✅ Complete mapping with ALL fields
      let messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || '',
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          senderRole: data.senderRole || 'super_admin',
          senderBranchId: data.senderBranchId || '',
          senderBranchName: data.senderBranchName || 'Super Admin',
          recipientRole: data.recipientRole || 'branch_admin',
          recipientBranchId: data.recipientBranchId || branchId,
          recipientEmail: data.recipientEmail || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt?.toDate() || null,
          status: data.status || 'sent',
          messageType: data.messageType || 'to_branch'
        } as BranchMessage;
      });
      
      // ✅ Client-side sorting
      messages = messages.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return timeA.getTime() - timeB.getTime();
      });
      
      set({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: 'Failed to fetch messages' });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ FIXED: Complete data mapping with ALL fields for realtime
  subscribeToBranchMessages: (branchId) => {
    const messagesRef = collection(db, 'branchMessages');
    
    const q = query(
      messagesRef,
      where('senderBranchId', '==', branchId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // ✅ Complete mapping with ALL fields
      let messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || '',
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          senderRole: data.senderRole || 'branch_admin',
          senderBranchId: data.senderBranchId || branchId,
          senderBranchName: data.senderBranchName || '',
          recipientRole: data.recipientRole || 'super_admin',
          recipientBranchId: data.recipientBranchId || '',
          recipientEmail: data.recipientEmail || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt?.toDate() || null,
          status: data.status || 'sent',
          messageType: data.messageType || 'to_super_admin'
        } as BranchMessage;
      });
      
      // ✅ Client-side sorting
      messages = messages.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return timeA.getTime() - timeB.getTime();
      });
      
      set({ messages });
    }, (error) => {
      console.error('Snapshot error:', error);
      set({ error: 'Failed to listen for messages' });
    });

    return unsubscribe;
  }
}));