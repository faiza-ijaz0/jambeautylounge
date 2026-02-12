// stores/branchMessages.store.ts
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

  fetchMessagesForBranch: async (branchId) => {
    try {
      set({ loading: true, error: null });
      
      const messagesRef = collection(db, 'branchMessages');
      const q = query(
        messagesRef,
        where('senderBranchId', '==', branchId)
      );
      
      const querySnapshot = await getDocs(q);
      let messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
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
      let messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
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
    const messagesRef = collection(db, 'branchMessages');
    
    // Messages jisme branch sender hai ya recipient hai
    const q = query(
      messagesRef,
      where('senderBranchId', '==', branchId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate() || null
      }));
      
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