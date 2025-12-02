import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Service {
  id: string;
  name: string;
  category?: string;
  duration?: number;
  price?: number;
  branches?: string[];
}

interface ServicesStore {
  services: Service[];
  getServicesByBranch: (branchId?: string) => Service[];
  addService: (service: Omit<Service, 'id'>) => void;
}

export const useServicesStore = create<ServicesStore>()(
  persist((set, get) => ({
    services: [
      { id: 'haircut', name: 'Classic Haircut', category: 'haircut', price: 35, duration: 30, branches: ['branch1', 'branch2', 'branch3'] },
      { id: 'beard', name: 'Beard Trim', category: 'beard', price: 25, duration: 20, branches: ['branch1', 'branch2'] },
      { id: 'premium', name: 'Premium Package', category: 'packages', price: 85, duration: 90, branches: ['branch2', 'branch3'] },
      { id: 'color', name: 'Hair Color', category: 'color', price: 70, duration: 90, branches: ['branch1', 'branch3'] },
      { id: 'shave', name: 'Hot Towel Shave', category: 'shaving', price: 45, duration: 30, branches: ['branch1'] },
    ],
    getServicesByBranch: (branchId) => {
      if (!branchId) return get().services;
      return get().services.filter(s => !s.branches || s.branches.includes(branchId));
    },
    addService: (service) => {
      const newService: Service = { ...service, id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` };
      set(state => ({ services: [...state.services, newService] }));
    }
  }), { name: 'services-storage' })
);

export default useServicesStore;
