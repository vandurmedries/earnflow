export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  balance: number;
  totalEarned: number;
  referralCode: string;
  referredBy: string | null;
  level: string;
  streak: number;
  lastClaimDate: string | null; // YYYY-MM-DD
  tasksCompleted: number;
  joinedAt: string;
  isPro: boolean; // Pro boost for 2x earnings + instant cashouts etc.
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  estMinutes: number;
  icon: string;
  maxDaily?: number;
}

export interface Earning {
  id: string;
  userId: string;
  amount: number;
  source: 'task' | 'daily' | 'referral' | 'offer' | 'bonus' | 'passive' | 'vibe';
  description: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: 'paypal' | 'crypto' | 'bank' | 'venmo';
  destination: string;
  status: 'pending' | 'processing' | 'paid' | 'rejected';
  createdAt: string;
  processedAt?: string;
  note?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  signupBonus: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  timeEst: string;
  link?: string;
  icon: string;
}

export type LeaderboardEntry = {
  id: string;
  name: string;
  totalEarned: number;
  tasksCompleted: number;
  level: string;
};

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  reward?: number; // bonus earned when moved to 'banked'
  vibe?: string; // chill | grind | creative | social | hustle
  column: KanbanColumnId;
  createdAt: string;
}

export interface KanbanBoard {
  cards: KanbanCard[];
  // columns are fixed for "vibe" feel:
  // 'ideate' | 'flow' | 'ship' | 'banked'
}

export type KanbanColumnId = 'ideate' | 'flow' | 'ship' | 'banked';
