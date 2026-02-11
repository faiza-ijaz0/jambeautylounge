'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  status: string;
  createdAt?: any;
}

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  isLoading: boolean;
  fetchBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const branchesRef = collection(db, 'branches');
      const q = query(branchesRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const branchesData: Branch[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        branchesData.push({
          id: doc.id,
          name: data.name || 'Unknown Branch',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          imageUrl: data.imageUrl || '',
          status: data.status || 'active',
          createdAt: data.createdAt,
        });
      });
      
      setBranches(branchesData);
      
      // Set first active branch as default
      const activeBranch = branchesData.find(b => b.status === 'active');
      if (activeBranch) {
        setSelectedBranch(activeBranch);
        localStorage.setItem('selectedBranchId', activeBranch.id);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetSelectedBranch = (branch: Branch | null) => {
    setSelectedBranch(branch);
    if (branch) {
      localStorage.setItem('selectedBranchId', branch.id);
    } else {
      localStorage.removeItem('selectedBranchId');
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <BranchContext.Provider 
      value={{ 
        branches, 
        selectedBranch, 
        setSelectedBranch: handleSetSelectedBranch,
        isLoading,
        fetchBranches
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
}
