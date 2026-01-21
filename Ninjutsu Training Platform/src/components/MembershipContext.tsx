import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type MembershipTier = 'free' | 'basic' | 'premium' | 'elite';

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  color: string;
  popular?: boolean;
}

export interface UserMembership {
  userId: string;
  tier: MembershipTier;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  paymentHistory: MembershipPayment[];
}

export interface MembershipPayment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  tier: MembershipTier;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  billingInfo: {
    name: string;
    email: string;
    cardLast4?: string;
  };
}

interface MembershipContextType {
  membershipPlans: MembershipPlan[];
  userMemberships: UserMembership[];
  getUserMembership: (userId: string) => UserMembership | undefined;
  subscribeToPlan: (userId: string, userName: string, planId: MembershipTier, billingInfo: any) => void;
  cancelMembership: (userId: string) => void;
  hasMembership: (userId: string, requiredTier: MembershipTier) => boolean;
  getMembershipPayments: (userId: string) => MembershipPayment[];
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free Training',
    price: 0,
    billingPeriod: 'monthly',
    color: 'gray',
    features: [
      'Access to basic training modules',
      'Limited technique library (10 techniques)',
      'Community forum access',
      'Weekly newsletter',
      'Basic progress tracking'
    ]
  },
  {
    id: 'basic',
    name: 'Student',
    price: 29.99,
    billingPeriod: 'monthly',
    color: 'blue',
    features: [
      'All Free features',
      'Full access to training modules',
      'Complete technique library',
      'Monthly live group sessions',
      'Video lessons library',
      'Progress analytics',
      'Certificate of completion',
      '10% discount on marketplace items'
    ]
  },
  {
    id: 'premium',
    name: 'Advanced Warrior',
    price: 59.99,
    billingPeriod: 'monthly',
    color: 'purple',
    popular: true,
    features: [
      'All Student features',
      'Unlimited 1-on-1 teacher sessions',
      'Advanced kata training',
      'Weapon mastery courses',
      'Personalized training plans',
      'Priority support',
      'Exclusive advanced techniques',
      '20% discount on marketplace items',
      'Access to master classes',
      'Training gear included'
    ]
  },
  {
    id: 'elite',
    name: 'Master Path',
    price: 99.99,
    billingPeriod: 'monthly',
    color: 'red',
    features: [
      'All Advanced Warrior features',
      'Unlimited private sessions',
      'Personal sensei assignment',
      'Custom curriculum development',
      'Access to all master workshops',
      'Lifetime technique library access',
      'Competition preparation',
      '30% discount on marketplace items',
      'Exclusive digital art collection',
      'Premium training equipment kit',
      'Direct lineage certification',
      'Instructor training pathway'
    ]
  }
];

// Sample memberships
const initialMemberships: UserMembership[] = [
  {
    userId: '1',
    tier: 'premium',
    startDate: '2025-12-01T00:00:00Z',
    expiryDate: '2026-12-01T00:00:00Z',
    autoRenew: true,
    paymentHistory: []
  },
  {
    userId: '2',
    tier: 'basic',
    startDate: '2026-01-01T00:00:00Z',
    expiryDate: '2027-01-01T00:00:00Z',
    autoRenew: true,
    paymentHistory: []
  }
];

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>(initialMemberships);
  const [payments, setPayments] = useState<MembershipPayment[]>([]);

  const getUserMembership = (userId: string) => {
    return userMemberships.find(m => m.userId === userId);
  };

  const subscribeToPlan = (userId: string, userName: string, planId: MembershipTier, billingInfo: any) => {
    const plan = membershipPlans.find(p => p.id === planId);
    if (!plan) return;

    // Create payment record
    const payment: MembershipPayment = {
      id: Date.now().toString(),
      userId,
      userName,
      amount: plan.price,
      tier: planId,
      date: new Date().toISOString(),
      status: 'completed',
      billingInfo: {
        name: billingInfo.name,
        email: billingInfo.email,
        cardLast4: billingInfo.cardNumber?.slice(-4)
      }
    };
    setPayments(prev => [...prev, payment]);

    // Create or update membership
    const existingMembership = getUserMembership(userId);
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    if (existingMembership) {
      setUserMemberships(prev => prev.map(m => 
        m.userId === userId 
          ? {
              ...m,
              tier: planId,
              startDate: startDate.toISOString(),
              expiryDate: expiryDate.toISOString(),
              autoRenew: true,
              paymentHistory: [...m.paymentHistory, payment]
            }
          : m
      ));
    } else {
      const newMembership: UserMembership = {
        userId,
        tier: planId,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        autoRenew: true,
        paymentHistory: [payment]
      };
      setUserMemberships(prev => [...prev, newMembership]);
    }
  };

  const cancelMembership = (userId: string) => {
    setUserMemberships(prev => prev.map(m => 
      m.userId === userId ? { ...m, autoRenew: false } : m
    ));
  };

  const hasMembership = (userId: string, requiredTier: MembershipTier) => {
    const membership = getUserMembership(userId);
    if (!membership) return requiredTier === 'free';
    
    const tierHierarchy: MembershipTier[] = ['free', 'basic', 'premium', 'elite'];
    const userTierIndex = tierHierarchy.indexOf(membership.tier);
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
    
    // Check if membership is active
    const now = new Date();
    const expiry = new Date(membership.expiryDate);
    if (now > expiry) return false;
    
    return userTierIndex >= requiredTierIndex;
  };

  const getMembershipPayments = (userId: string) => {
    const membership = getUserMembership(userId);
    return membership?.paymentHistory || [];
  };

  return (
    <MembershipContext.Provider value={{
      membershipPlans,
      userMemberships,
      getUserMembership,
      subscribeToPlan,
      cancelMembership,
      hasMembership,
      getMembershipPayments
    }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}