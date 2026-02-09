// lib/firebase-messages.ts
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, Timestamp, orderBy, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  managerId?: string;
  managerName?: string;
}

export interface FirebaseMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'admin' | 'super_admin';
  senderEmail?: string;
  senderPhone?: string;
  branchId: string;
  branchName?: string;
  timestamp: Timestamp;
  read: boolean;
  conversationId: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export interface FirebaseConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  branchId: string;
  branchName?: string;
  unreadCount: number;
  lastMessage?: FirebaseMessage;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'archived' | 'resolved';
}

export interface FirebaseFeedback {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceOrProduct: string;
  serviceId?: string;
  productId?: string;
  rating: number;
  comment: string;
  branchId: string;
  branchName: string;
  type: 'service' | 'product';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'approved' | 'pending' | 'rejected';
  replies: FeedbackReply[];
  bookingId?: string;
}

export interface FeedbackReply {
  id: string;
  text: string;
  author: string;
  authorId: string;
  authorType: 'admin' | 'super_admin' | 'branch_admin';
  createdAt: Timestamp;
}

// BRANCHES FUNCTIONS
export const fetchBranchesFromFirebase = async (): Promise<Branch[]> => {
  try {
    const branchesRef = collection(db, "branches");
    const q = query(branchesRef, where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    
    const branches: Branch[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      branches.push({
        id: doc.id,
        name: data.name || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        status: data.status || "active",
        managerId: data.managerId || "",
        managerName: data.managerName || "",
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now()
      });
    });
    
    return branches.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching branches from Firebase:", error);
    return [];
  }
};

// MESSAGES FUNCTIONS
export const fetchConversationsFromFirebase = async (branchId?: string): Promise<FirebaseConversation[]> => {
  try {
    const conversationsRef = collection(db, "conversations");
    let q;
    
    if (branchId && branchId !== 'all') {
      q = query(conversationsRef, where("branchId", "==", branchId));
    } else {
      q = query(conversationsRef);
    }
    
    const querySnapshot = await getDocs(q);
    const conversations: FirebaseConversation[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // Fetch last message for each conversation
      const messagesRef = collection(db, "conversations", docSnap.id, "messages");
      const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      let lastMessage: FirebaseMessage | undefined;
      if (!messagesSnapshot.empty) {
        const msgDoc = messagesSnapshot.docs[0];
        const msgData = msgDoc.data();
        lastMessage = {
          id: msgDoc.id,
          content: msgData.content || "",
          senderId: msgData.senderId || "",
          senderName: msgData.senderName || "",
          senderType: msgData.senderType || "customer",
          senderEmail: msgData.senderEmail || "",
          senderPhone: msgData.senderPhone || "",
          branchId: msgData.branchId || data.branchId || "",
          branchName: msgData.branchName || data.branchName || "",
          timestamp: msgData.timestamp || Timestamp.now(),
          read: msgData.read || false,
          conversationId: docSnap.id,
          type: msgData.type || "text",
          fileUrl: msgData.fileUrl || ""
        };
      }
      
      // Count unread messages
      const unreadQuery = query(
        messagesRef, 
        where("read", "==", false),
        where("senderType", "in", ["customer", "branch_admin"])
      );
      const unreadSnapshot = await getDocs(unreadQuery);
      const unreadCount = unreadSnapshot.size;
      
      conversations.push({
        id: docSnap.id,
        customerId: data.customerId || "",
        customerName: data.customerName || "Unknown Customer",
        customerPhone: data.customerPhone || "",
        customerEmail: data.customerEmail || "",
        branchId: data.branchId || "",
        branchName: data.branchName || "",
        unreadCount,
        lastMessage,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        status: data.status || "active"
      });
    }
    
    // Sort by last message timestamp or updatedAt
    return conversations.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp?.toMillis() || a.updatedAt.toMillis();
      const timeB = b.lastMessage?.timestamp?.toMillis() || b.updatedAt.toMillis();
      return timeB - timeA; // Descending order (newest first)
    });
  } catch (error) {
    console.error("Error fetching conversations from Firebase:", error);
    return [];
  }
};

export const fetchMessagesFromFirebase = async (conversationId: string): Promise<FirebaseMessage[]> => {
  try {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    
    const messages: FirebaseMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        content: data.content || "",
        senderId: data.senderId || "",
        senderName: data.senderName || "",
        senderType: data.senderType || "customer",
        senderEmail: data.senderEmail || "",
        senderPhone: data.senderPhone || "",
        branchId: data.branchId || "",
        branchName: data.branchName || "",
        timestamp: data.timestamp || Timestamp.now(),
        read: data.read || false,
        conversationId,
        type: data.type || "text",
        fileUrl: data.fileUrl || ""
      });
    });
    
    return messages;
  } catch (error) {
    console.error("Error fetching messages from Firebase:", error);
    return [];
  }
};

export const sendMessageToFirebase = async (
  conversationId: string, 
  message: Omit<FirebaseMessage, 'id' | 'timestamp'>
): Promise<string> => {
  try {
    // Check if conversation exists
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      throw new Error("Conversation not found");
    }
    
    // Add message to conversation
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const messageData = {
      ...message,
      timestamp: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(messagesRef, messageData);
    
    // Update conversation's updatedAt
    await updateDoc(conversationRef, {
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error sending message to Firebase:", error);
    throw error;
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, where("read", "==", false), where("senderId", "!=", userId));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(docSnap =>
      updateDoc(docSnap.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
    
    // Update conversation's unread count
    const conversationRef = doc(db, "conversations", conversationId);
    const unreadQuery = query(messagesRef, where("read", "==", false));
    const unreadSnapshot = await getDocs(unreadQuery);
    
    await updateDoc(conversationRef, {
      unreadCount: unreadSnapshot.size,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

// Create new conversation
export const createConversation = async (
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  branchId: string,
  branchName: string
): Promise<string> => {
  try {
    const conversationsRef = collection(db, "conversations");
    const conversationData = {
      customerId: `cust_${Date.now()}`,
      customerName,
      customerEmail,
      customerPhone,
      branchId,
      branchName,
      unreadCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active"
    };
    
    const docRef = await addDoc(conversationsRef, conversationData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// FEEDBACKS FUNCTIONS
export const fetchFeedbacksFromFirebase = async (branchId?: string): Promise<FirebaseFeedback[]> => {
  try {
    const feedbacksRef = collection(db, "feedbacks");
    let q;
    
    if (branchId && branchId !== 'all') {
      q = query(feedbacksRef, where("branchId", "==", branchId));
    } else {
      q = query(feedbacksRef);
    }
    
    const querySnapshot = await getDocs(q);
    const feedbacks: FirebaseFeedback[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      feedbacks.push({
        id: doc.id,
        customerName: data.customerName || "",
        customerEmail: data.customerEmail || "",
        customerPhone: data.customerPhone || "",
        serviceOrProduct: data.serviceOrProduct || "",
        serviceId: data.serviceId || "",
        productId: data.productId || "",
        rating: data.rating || 0,
        comment: data.comment || "",
        branchId: data.branchId || "",
        branchName: data.branchName || "",
        type: data.type || "service",
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        status: data.status || "pending",
        replies: data.replies || [],
        bookingId: data.bookingId || ""
      });
    });
    
    return feedbacks.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error("Error fetching feedbacks from Firebase:", error);
    return [];
  }
};

export const updateFeedbackStatus = async (
  feedbackId: string, 
  status: 'approved' | 'pending' | 'rejected',
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const feedbackRef = doc(db, "feedbacks", feedbackId);
    await updateDoc(feedbackRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      updatedByName: userName
    });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    throw error;
  }
};

export const addFeedbackReply = async (
  feedbackId: string,
  text: string,
  author: string,
  authorId: string,
  authorType: 'admin' | 'super_admin' | 'branch_admin'
): Promise<void> => {
  try {
    const feedbackRef = doc(db, "feedbacks", feedbackId);
    const feedbackSnap = await getDoc(feedbackRef);
    
    if (!feedbackSnap.exists()) {
      throw new Error("Feedback not found");
    }
    
    const feedbackData = feedbackSnap.data();
    const replies = feedbackData.replies || [];
    
    const newReply: FeedbackReply = {
      id: `reply_${Date.now()}`,
      text,
      author,
      authorId,
      authorType,
      createdAt: Timestamp.now()
    };
    
    await updateDoc(feedbackRef, {
      replies: [...replies, newReply],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding feedback reply:", error);
    throw error;
  }
};

export const deleteFeedback = async (feedbackId: string): Promise<void> => {
  try {
    const feedbackRef = doc(db, "feedbacks", feedbackId);
    await deleteDoc(feedbackRef);
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw error;
  }
};

export const createFeedback = async (feedback: Omit<FirebaseFeedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const feedbacksRef = collection(db, "feedbacks");
    const feedbackData = {
      ...feedback,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      replies: [],
      status: 'pending'
    };
    
    const docRef = await addDoc(feedbacksRef, feedbackData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating feedback:", error);
    throw error;
  }
};

// Helper function for limit
const limit = (limit: number) => {
  return (ref: any) => {
    return query(ref, orderBy('timestamp', 'desc'), limitToLast(limit));
  };
};

const limitToLast = (limit: number) => {
  // This is a simplified implementation
  // In real Firebase, you'd use limitToLast
  return (ref: any) => ref;
};

// REALTIME LISTENERS
export const listenToConversations = (
  branchId: string,
  callback: (conversations: FirebaseConversation[]) => void
): () => void => {
  const conversationsRef = collection(db, "conversations");
  let q;
  
  if (branchId && branchId !== 'all') {
    q = query(conversationsRef, where("branchId", "==", branchId));
  } else {
    q = query(conversationsRef);
  }
  
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const conversations: FirebaseConversation[] = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Fetch last message
      const messagesRef = collection(db, "conversations", docSnap.id, "messages");
      const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      let lastMessage: FirebaseMessage | undefined;
      if (!messagesSnapshot.empty) {
        const msgDoc = messagesSnapshot.docs[0];
        const msgData = msgDoc.data();
        lastMessage = {
          id: msgDoc.id,
          content: msgData.content || "",
          senderId: msgData.senderId || "",
          senderName: msgData.senderName || "",
          senderType: msgData.senderType || "customer",
          senderEmail: msgData.senderEmail || "",
          senderPhone: msgData.senderPhone || "",
          branchId: msgData.branchId || data.branchId || "",
          branchName: msgData.branchName || data.branchName || "",
          timestamp: msgData.timestamp || Timestamp.now(),
          read: msgData.read || false,
          conversationId: docSnap.id,
          type: msgData.type || "text",
          fileUrl: msgData.fileUrl || ""
        };
      }
      
      // Count unread messages
      const unreadQuery = query(
        messagesRef, 
        where("read", "==", false),
        where("senderType", "in", ["customer", "branch_admin"])
      );
      const unreadSnapshot = await getDocs(unreadQuery);
      const unreadCount = unreadSnapshot.size;
      
      conversations.push({
        id: docSnap.id,
        customerId: data.customerId || "",
        customerName: data.customerName || "Unknown Customer",
        customerPhone: data.customerPhone || "",
        customerEmail: data.customerEmail || "",
        branchId: data.branchId || "",
        branchName: data.branchName || "",
        unreadCount,
        lastMessage,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        status: data.status || "active"
      });
    }
    
    // Sort by last message timestamp or updatedAt
    const sorted = conversations.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp?.toMillis() || a.updatedAt.toMillis();
      const timeB = b.lastMessage?.timestamp?.toMillis() || b.updatedAt.toMillis();
      return timeB - timeA;
    });
    
    callback(sorted);
  }, (error) => {
    console.error("Error listening to conversations:", error);
  });
  
  return unsubscribe;
};

export const listenToMessages = (
  conversationId: string,
  callback: (messages: FirebaseMessage[]) => void
): () => void => {
  if (!conversationId) return () => {};
  
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages: FirebaseMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        content: data.content || "",
        senderId: data.senderId || "",
        senderName: data.senderName || "",
        senderType: data.senderType || "customer",
        senderEmail: data.senderEmail || "",
        senderPhone: data.senderPhone || "",
        branchId: data.branchId || "",
        branchName: data.branchName || "",
        timestamp: data.timestamp || Timestamp.now(),
        read: data.read || false,
        conversationId,
        type: data.type || "text",
        fileUrl: data.fileUrl || ""
      });
    });
    callback(messages);
  }, (error) => {
    console.error("Error listening to messages:", error);
  });
  
  return unsubscribe;
};

export const listenToFeedbacks = (
  branchId: string,
  callback: (feedbacks: FirebaseFeedback[]) => void
): () => void => {
  const feedbacksRef = collection(db, "feedbacks");
  let q;
  
  if (branchId && branchId !== 'all') {
    q = query(feedbacksRef, where("branchId", "==", branchId));
  } else {
    q = query(feedbacksRef);
  }
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const feedbacks: FirebaseFeedback[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      feedbacks.push({
        id: doc.id,
        customerName: data.customerName || "",
        customerEmail: data.customerEmail || "",
        customerPhone: data.customerPhone || "",
        serviceOrProduct: data.serviceOrProduct || "",
        serviceId: data.serviceId || "",
        productId: data.productId || "",
        rating: data.rating || 0,
        comment: data.comment || "",
        branchId: data.branchId || "",
        branchName: data.branchName || "",
        type: data.type || "service",
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        status: data.status || "pending",
        replies: data.replies || [],
        bookingId: data.bookingId || ""
      });
    });
    
    const sorted = feedbacks.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    callback(sorted);
  }, (error) => {
    console.error("Error listening to feedbacks:", error);
  });
  
  return unsubscribe;
};