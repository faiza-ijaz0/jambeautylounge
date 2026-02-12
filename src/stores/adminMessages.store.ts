// stores/adminMessages.store.ts - UPDATED VERSION WITHOUT INDEX

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
  writeBatch
} from 'firebase/firestore'; // ⚠️ orderBy HATAYA

export interface AdminMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'super_admin' | 'branch_admin';
  recipientBranchId: string;
  recipientBranchName: string;
  recipientEmail?: string;
  timestamp: Timestamp | any;
  read: boolean;
  readBy?: string[];
  readAt?: Timestamp | any;
  status: 'sent' | 'delivered' | 'seen';
  isSystemMessage?: boolean;
}

interface AdminMessagesStore {
  messages: AdminMessage[];
  loading: boolean;
  error: string | null;
  selectedBranchId: string | null;
  
  sendMessage: (message: Omit<AdminMessage, 'id' | 'timestamp' | 'status' | 'read'>) => Promise<void>;
  fetchMessagesForBranch: (branchId: string) => Promise<void>;
  markMessageAsRead: (messageId: string, userId: string) => Promise<void>;
  markAllMessagesAsRead: (branchId: string, userId: string) => Promise<void>;
  setSelectedBranchId: (branchId: string | null) => void;
  subscribeToBranchMessages: (branchId: string) => () => void;
}

export const useAdminMessagesStore = create<AdminMessagesStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  selectedBranchId: null,

  sendMessage: async (messageData) => {
    try {
      set({ loading: true, error: null });
      
      const messageRef = collection(db, 'adminMessages');
      await addDoc(messageRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        read: false,
        readBy: [],
        status: 'sent',
        readAt: null
      });
      
      console.log('✅ Admin message sent');
    } catch (error) {
      console.error('❌ Error:', error);
      set({ error: 'Failed to send message' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  markMessageAsRead: async (messageId, userId) => {
    try {
      const messageRef = doc(db, 'adminMessages', messageId);
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
      const messagesRef = collection(db, 'adminMessages');
      
      // 🔥 FIX: Without orderBy
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

  setSelectedBranchId: (branchId) => {
    set({ selectedBranchId: branchId });
  },

  fetchMessagesForBranch: async (branchId) => {
    try {
      set({ loading: true, error: null });
      
      const messagesRef = collection(db, 'adminMessages');
      
      // 🔥 FIX: Sirf where clause, orderBy nahi
      const q = query(
        messagesRef,
        where('recipientBranchId', '==', branchId)
      );
      
      const querySnapshot = await getDocs(q);
      let messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      // 🔥 FIX: Client-side sorting
      messages = messages.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return timeA - timeB;
      });
      
      set({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: 'Failed to fetch messages' });
    } finally {
      set({ loading: false });
    }
  },

  subscribeToBranchMessages: (branchId) => {
    const messagesRef = collection(db, 'adminMessages');
    
    // 🔥 FIX: Without orderBy
    const q = query(
      messagesRef,
      where('recipientBranchId', '==', branchId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate() || null
      }));
      
      // 🔥 FIX: Client-side sorting
      messages = messages.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return timeA - timeB;
      });
      
      set({ messages });
    }, (error) => {
      console.error('Snapshot error:', error);
      set({ error: 'Failed to listen for messages' });
    });

    return unsubscribe;
  }
}));