import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Membership Types
export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Membership {
  id: string;
  name: string;
  tier: MembershipTier;
  description: string;
  price: number;
  duration: number; // in months
  benefits: string[];
  branchId?: string; // undefined for global memberships
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Offers
export interface Offer {
  id: string;
  title: string;
  description: string;
  type: 'service' | 'product' | 'combo' | 'birthday' | 'first_time_registration' | 'promotional_package';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableItems: string[]; // legacy - kept for backward compatibility
  applicableServices?: string[]; // service IDs for service-specific offers (single or series)
  offerFor?: 'single' | 'series';
  image?: string; // optional image (Data URL or URL) to showcase the offer
  membershipRequired?: MembershipTier[];
  branchId?: string;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Promo Codes
export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  applicableCategories: string[]; // category IDs
  membershipRequired?: MembershipTier[];
  branchId?: string;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Loyalty Points
export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerDollar: number;
  redemptionRate: number; // points per dollar for redemption
  minimumPoints: number;
  maximumPoints?: number;
  expiryDays: number;
  branchId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cashback Programs
export interface CashbackProgram {
  id: string;
  name: string;
  description: string;
  cashbackType: 'percentage' | 'fixed';
  cashbackValue: number;
  minimumPurchase?: number;
  applicableCategories: string[];
  membershipRequired?: MembershipTier[];
  branchId?: string;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Membership
export interface CustomerMembership {
  id: string;
  customerId: string;
  membershipId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MembershipStore {
  // State
  memberships: Membership[];
  offers: Offer[];
  promoCodes: PromoCode[];
  loyaltyPrograms: LoyaltyProgram[];
  cashbackPrograms: CashbackProgram[];
  customerMemberships: CustomerMembership[];

  // Membership Actions
  addMembership: (membership: Omit<Membership, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMembership: (id: string, updates: Partial<Membership>) => void;
  deleteMembership: (id: string) => void;

  // Offer Actions
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>) => void;
  updateOffer: (id: string, updates: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  incrementOfferUsage: (id: string) => void;

  // Promo Code Actions
  addPromoCode: (promoCode: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>) => void;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;
  incrementPromoUsage: (id: string) => void;

  // Loyalty Program Actions
  addLoyaltyProgram: (program: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLoyaltyProgram: (id: string, updates: Partial<LoyaltyProgram>) => void;
  deleteLoyaltyProgram: (id: string) => void;

  // Cashback Program Actions
  addCashbackProgram: (program: Omit<CashbackProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCashbackProgram: (id: string, updates: Partial<CashbackProgram>) => void;
  deleteCashbackProgram: (id: string) => void;

  // Customer Membership Actions
  addCustomerMembership: (membership: Omit<CustomerMembership, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomerMembership: (id: string, updates: Partial<CustomerMembership>) => void;
  deleteCustomerMembership: (id: string) => void;

  // Getters
  getMembershipsByBranch: (branchId?: string) => Membership[];
  getOffersByBranch: (branchId?: string) => Offer[];
  getPromoCodesByBranch: (branchId?: string) => PromoCode[];
  getLoyaltyProgramsByBranch: (branchId?: string) => LoyaltyProgram[];
  getCashbackProgramsByBranch: (branchId?: string) => CashbackProgram[];
  getActiveOffers: (branchId?: string) => Offer[];
  getActivePromoCodes: (branchId?: string) => PromoCode[];
  getCustomerMembershipsByCustomer: (customerId: string) => CustomerMembership[];
  getMembershipById: (id: string) => Membership | undefined;
  getOfferById: (id: string) => Offer | undefined;
  getPromoCodeById: (id: string) => PromoCode | undefined;
}

export const useMembershipStore = create<MembershipStore>()(
  persist(
    (set, get) => ({
      // Initial state
      memberships: [],
      offers: [],
      promoCodes: [],
      loyaltyPrograms: [],
      cashbackPrograms: [],
      customerMemberships: [],

      // Membership Actions
      addMembership: (membershipData) => {
        const newMembership: Membership = {
          ...membershipData,
          id: `membership-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          memberships: [...state.memberships, newMembership]
        }));
      },

      updateMembership: (id, updates) => {
        set((state) => ({
          memberships: state.memberships.map(membership =>
            membership.id === id
              ? { ...membership, ...updates, updatedAt: new Date() }
              : membership
          )
        }));
      },

      deleteMembership: (id) => {
        set((state) => ({
          memberships: state.memberships.filter(membership => membership.id !== id)
        }));
      },

      // Offer Actions
      addOffer: (offerData) => {
        const newOffer: Offer = {
          ...offerData,
          id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          usedCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          offers: [...state.offers, newOffer]
        }));
      },

      updateOffer: (id, updates) => {
        set((state) => ({
          offers: state.offers.map(offer =>
            offer.id === id
              ? { ...offer, ...updates, updatedAt: new Date() }
              : offer
          )
        }));
      },

      deleteOffer: (id) => {
        set((state) => ({
          offers: state.offers.filter(offer => offer.id !== id)
        }));
      },

      incrementOfferUsage: (id) => {
        set((state) => ({
          offers: state.offers.map(offer =>
            offer.id === id
              ? { ...offer, usedCount: offer.usedCount + 1, updatedAt: new Date() }
              : offer
          )
        }));
      },

      // Promo Code Actions
      addPromoCode: (promoCodeData) => {
        const newPromoCode: PromoCode = {
          ...promoCodeData,
          id: `promo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          usedCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          promoCodes: [...state.promoCodes, newPromoCode]
        }));
      },

      updatePromoCode: (id, updates) => {
        set((state) => ({
          promoCodes: state.promoCodes.map(promo =>
            promo.id === id
              ? { ...promo, ...updates, updatedAt: new Date() }
              : promo
          )
        }));
      },

      deletePromoCode: (id) => {
        set((state) => ({
          promoCodes: state.promoCodes.filter(promo => promo.id !== id)
        }));
      },

      incrementPromoUsage: (id) => {
        set((state) => ({
          promoCodes: state.promoCodes.map(promo =>
            promo.id === id
              ? { ...promo, usedCount: promo.usedCount + 1, updatedAt: new Date() }
              : promo
          )
        }));
      },

      // Loyalty Program Actions
      addLoyaltyProgram: (programData) => {
        const newProgram: LoyaltyProgram = {
          ...programData,
          id: `loyalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          loyaltyPrograms: [...state.loyaltyPrograms, newProgram]
        }));
      },

      updateLoyaltyProgram: (id, updates) => {
        set((state) => ({
          loyaltyPrograms: state.loyaltyPrograms.map(program =>
            program.id === id
              ? { ...program, ...updates, updatedAt: new Date() }
              : program
          )
        }));
      },

      deleteLoyaltyProgram: (id) => {
        set((state) => ({
          loyaltyPrograms: state.loyaltyPrograms.filter(program => program.id !== id)
        }));
      },

      // Cashback Program Actions
      addCashbackProgram: (programData) => {
        const newProgram: CashbackProgram = {
          ...programData,
          id: `cashback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          cashbackPrograms: [...state.cashbackPrograms, newProgram]
        }));
      },

      updateCashbackProgram: (id, updates) => {
        set((state) => ({
          cashbackPrograms: state.cashbackPrograms.map(program =>
            program.id === id
              ? { ...program, ...updates, updatedAt: new Date() }
              : program
          )
        }));
      },

      deleteCashbackProgram: (id) => {
        set((state) => ({
          cashbackPrograms: state.cashbackPrograms.filter(program => program.id !== id)
        }));
      },

      // Customer Membership Actions
      addCustomerMembership: (membershipData) => {
        const newCustomerMembership: CustomerMembership = {
          ...membershipData,
          id: `customer-membership-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          customerMemberships: [...state.customerMemberships, newCustomerMembership]
        }));
      },

      updateCustomerMembership: (id, updates) => {
        set((state) => ({
          customerMemberships: state.customerMemberships.map(membership =>
            membership.id === id
              ? { ...membership, ...updates, updatedAt: new Date() }
              : membership
          )
        }));
      },

      deleteCustomerMembership: (id) => {
        set((state) => ({
          customerMemberships: state.customerMemberships.filter(membership => membership.id !== id)
        }));
      },

      // Getters
      getMembershipsByBranch: (branchId) => {
        if (!branchId) {
          return get().memberships;
        }
        return get().memberships.filter(membership =>
          membership.branchId === branchId || !membership.branchId
        );
      },

      getOffersByBranch: (branchId) => {
        if (!branchId) {
          return get().offers;
        }
        return get().offers.filter(offer =>
          offer.branchId === branchId || !offer.branchId
        );
      },

      getPromoCodesByBranch: (branchId) => {
        if (!branchId) {
          return get().promoCodes;
        }
        return get().promoCodes.filter(promo =>
          promo.branchId === branchId || !promo.branchId
        );
      },

      getLoyaltyProgramsByBranch: (branchId) => {
        if (!branchId) {
          return get().loyaltyPrograms;
        }
        return get().loyaltyPrograms.filter(program =>
          program.branchId === branchId || !program.branchId
        );
      },

      getCashbackProgramsByBranch: (branchId) => {
        if (!branchId) {
          return get().cashbackPrograms;
        }
        return get().cashbackPrograms.filter(program =>
          program.branchId === branchId || !program.branchId
        );
      },

      getActiveOffers: (branchId) => {
        const now = new Date();
        return get().getOffersByBranch(branchId).filter(offer =>
          offer.isActive &&
          offer.validFrom <= now &&
          offer.validTo >= now &&
          (!offer.usageLimit || offer.usedCount < offer.usageLimit)
        );
      },

      getActivePromoCodes: (branchId) => {
        const now = new Date();
        return get().getPromoCodesByBranch(branchId).filter(promo =>
          promo.isActive &&
          promo.validFrom <= now &&
          promo.validTo >= now &&
          (!promo.usageLimit || promo.usedCount < promo.usageLimit)
        );
      },

      getCustomerMembershipsByCustomer: (customerId) => {
        return get().customerMemberships.filter(membership =>
          membership.customerId === customerId
        );
      },

      getMembershipById: (id) => {
        return get().memberships.find(membership => membership.id === id);
      },

      getOfferById: (id) => {
        return get().offers.find(offer => offer.id === id);
      },

      getPromoCodeById: (id) => {
        return get().promoCodes.find(promo => promo.id === id);
      },
    }),
    {
      name: 'membership-storage',
      partialize: (state) => ({
        memberships: state.memberships,
        offers: state.offers,
        promoCodes: state.promoCodes,
        loyaltyPrograms: state.loyaltyPrograms,
        cashbackPrograms: state.cashbackPrograms,
        customerMemberships: state.customerMemberships,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects after rehydration
          state.memberships = state.memberships.map(membership => ({
            ...membership,
            createdAt: new Date(membership.createdAt),
            updatedAt: new Date(membership.updatedAt),
          }));

          state.offers = state.offers.map(offer => ({
            ...offer,
            validFrom: new Date(offer.validFrom),
            validTo: new Date(offer.validTo),
            createdAt: new Date(offer.createdAt),
            updatedAt: new Date(offer.updatedAt),
          }));

          state.promoCodes = state.promoCodes.map(promo => ({
            ...promo,
            validFrom: new Date(promo.validFrom),
            validTo: new Date(promo.validTo),
            createdAt: new Date(promo.createdAt),
            updatedAt: new Date(promo.updatedAt),
          }));

          state.loyaltyPrograms = state.loyaltyPrograms.map(program => ({
            ...program,
            createdAt: new Date(program.createdAt),
            updatedAt: new Date(program.updatedAt),
          }));

          state.cashbackPrograms = state.cashbackPrograms.map(program => ({
            ...program,
            validFrom: new Date(program.validFrom),
            validTo: new Date(program.validTo),
            createdAt: new Date(program.createdAt),
            updatedAt: new Date(program.updatedAt),
          }));

          state.customerMemberships = state.customerMemberships.map(membership => ({
            ...membership,
            startDate: new Date(membership.startDate),
            endDate: new Date(membership.endDate),
            createdAt: new Date(membership.createdAt),
            updatedAt: new Date(membership.updatedAt),
          }));
        }
      }
    }
  )
);