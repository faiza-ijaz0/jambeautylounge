'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { BranchProvider } from '@/contexts/BranchContext';
import { LanguageProvider } from '@/contexts/LanguageContext';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <BranchProvider>
        <AuthProvider>
          {children}
         
        </AuthProvider>
      </BranchProvider>
    </LanguageProvider>
  );
}