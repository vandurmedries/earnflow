import { User, Task, Earning, WithdrawalRequest, Referral, Offer, LeaderboardEntry, KanbanCard, KanbanColumnId } from './types';
import bcrypt from 'bcryptjs';

// In-memory store (persists for the lifetime of the server instance / deployment replica)
// For production persistence, connect Vercel KV, Upstash, or a real DB.
let users = new Map<string, User>();
let earnings = new Map<string, Earning[]>();
let withdrawals = new Map<string, WithdrawalRequest[]>();
let referrals = new Map<string, Referral[]>();
let completedTasks = new Map<string, Set<string>>(); // userId -> set of taskId completed today
let lastDailyClaim = new Map<string, string>(); // userId -> date
let kanbanBoards = new Map<string, KanbanCard[]>(); // userId -> all cards (column lives on the card)

// Predefined high-quality microtasks (realistic rewards for micro-work platforms)
const DEFAULT_TASKS: Task[] = [
  { id: 't1', title: 'AI Image Labeling', description: 'Label 20 images with correct categories for ML training data. Takes ~8 minutes.', reward: 1.85, category: 'AI Data', estMinutes: 8, icon: '🖼️' },
  { id: 't2', title: 'Product Review Survey', description: 'Answer 12 quick questions about recent online shopping experiences.', reward: 2.40, category: 'Survey', estMinutes: 6, icon: '📋' },
  { id: 't3', title: 'Short Audio Transcription', description: 'Transcribe a 45-second customer support call accurately.', reward: 3.10, category: 'Transcription', estMinutes: 9, icon: '🎙️' },
  { id: 't4', title: 'Sentiment Analysis', description: 'Rate the sentiment of 15 social media comments (positive/neutral/negative).', reward: 1.55, category: 'AI Data', estMinutes: 5, icon: '📊' },
  { id: 't5', title: 'Local Business Verification', description: 'Verify 3 local business details (phone, hours, website) from public sources.', reward: 2.90, category: 'Research', estMinutes: 11, icon: '🔍' },
  { id: 't6', title: 'Captcha & Form Test', description: 'Complete a series of accessibility captcha tests for web research.', reward: 0.95, category: 'Micro Work', estMinutes: 4, icon: '✅' },
  { id: 't7', title: 'Video Clip Tagging', description: 'Watch a 60s clip and tag key objects/actions for training data.', reward: 2.15, category: 'AI Data', estMinutes: 7, icon: '🎬' },
  { id: 't8', title: 'Quick Opinion Poll', description: 'Give your honest opinion on 8 new app feature concepts.', reward: 1.70, category: 'Survey', estMinutes: 5, icon: '💬' },
];

const DEFAULT_OFFERS: Offer[] = [
  { id: 'o1', title: 'Free Stock Trading Account', description: 'Open a free brokerage account and make a small deposit to unlock bonus.', reward: 8.50, category: 'Finance', timeEst: '12 min', icon: '📈', link: 'https://www.google.com/search?q=best+online+broker+sign+up+bonus' },
  { id: 'o2', title: 'Newsletter Signup + Confirm', description: 'Join a popular tech/finance newsletter and confirm email.', reward: 1.25, category: 'Signups', timeEst: '2 min', icon: '✉️' },
  { id: 'o3', title: 'Cashback App Install', description: 'Install a reputable cashback browser extension and activate it.', reward: 4.75, category: 'Apps', timeEst: '5 min', icon: '💰' },
  { id: 'o4', title: 'Survey Panel Registration', description: 'Create profile on a high-paying survey site (Swagbucks style).', reward: 3.90, category: 'Research', timeEst: '9 min', icon: '🗳️', link: 'https://www.google.com/search?q=paid+surveys+sign+up' },
  { id: 'o5', title: 'Crypto Wallet Demo', description: 'Create a free non-custodial wallet and complete basic security setup.', reward: 6.25, category: 'Crypto', timeEst: '7 min', icon: '🪙' },
];

let tasks = [...DEFAULT_TASKS];
let offers = [...DEFAULT_OFFERS];

// Seed demo data for instant impressive experience
function seedDemoData() {
  if (users.size > 0) return;

  const demoUsers: User[] = [
    { id: 'u_demo1', email: 'demo@earnflow.app', name: 'Alex Rivera', passwordHash: '', balance: 47.85, totalEarned: 184.3, referralCode: 'EF-ALEX', referredBy: null, level: 'Gold', streak: 12, lastClaimDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], tasksCompleted: 87, joinedAt: '2025-04-12', isPro: false },
    { id: 'u_demo2', email: 'sam@demo.io', name: 'Sam Chen', passwordHash: '', balance: 29.4, totalEarned: 97.65, referralCode: 'EF-SAM', referredBy: 'EF-ALEX', level: 'Silver', streak: 5, lastClaimDate: new Date().toISOString().split('T')[0], tasksCompleted: 41, joinedAt: '2025-05-01', isPro: false },
    { id: 'u_demo3', email: 'jordan@demo.dev', name: 'Jordan Lee', passwordHash: '', balance: 112.9, totalEarned: 312.8, referralCode: 'EF-JORD', referredBy: null, level: 'Platinum', streak: 28, lastClaimDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], tasksCompleted: 156, joinedAt: '2025-03-08', isPro: false },
  ];

  for (const u of demoUsers) {
    users.set(u.id, u);
    earnings.set(u.id, [
      { id: 'e1', userId: u.id, amount: 2.4, source: 'task', description: 'Product Review Survey', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'e2', userId: u.id, amount: 1.85, source: 'task', description: 'AI Image Labeling', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'e3', userId: u.id, amount: 0.95, source: 'daily', description: 'Daily streak bonus (day 12)', createdAt: new Date(Date.now() - 86400000).toISOString() },
    ]);
    withdrawals.set(u.id, []);
    referrals.set(u.id, []);
    completedTasks.set(u.id, new Set());
  }

  // Seed some referrals
  referrals.get('u_demo1')!.push({
    id: 'r1', referrerId: 'u_demo1', referredUserId: 'u_demo2', signupBonus: 1.5, createdAt: '2025-05-01T10:00:00Z'
  });

  // Global earnings for demo2 from referral
  const demo2Earnings = earnings.get('u_demo2')!;
  demo2Earnings.push({ id: 'e_ref', userId: 'u_demo2', amount: 0.35, source: 'referral', description: 'Referral bonus (10% of referred earnings)', createdAt: new Date(Date.now() - 1800000).toISOString() });

  // Seed Vibe Kanban demo data (beautiful earning pipeline vibes)
  const now = new Date().toISOString();
  kanbanBoards.set('u_demo1', [
    { id: 'k1', title: 'Launch affiliate site for Belgian brands', description: 'Research 5 local brands + set up landing', reward: 12, vibe: 'grind', column: 'flow', createdAt: now },
    { id: 'k2', title: 'Record 3 short Reels about microtasks', reward: 7.5, vibe: 'creative', column: 'ship', createdAt: now },
    { id: 'k3', title: 'Optimize referral copy for Twitter', description: 'Test 2 hooks', reward: 4, vibe: 'chill', column: 'ideate', createdAt: now },
    { id: 'k4', title: 'Finish Upwork proposal template', reward: 9, vibe: 'grind', column: 'flow', createdAt: now },
  ]);

  kanbanBoards.set('u_demo3', [
    { id: 'k5', title: 'Daily LinkedIn value posts for 7 days', reward: 15, vibe: 'social', column: 'banked', createdAt: now },
    { id: 'k6', title: 'Build simple Notion earning tracker', reward: 6, vibe: 'creative', column: 'ship', createdAt: now },
  ]);
}

seedDemoData();

function generateId(prefix: string) {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

function getLevel(total: number): string {
  if (total >= 250) return 'Platinum';
  if (total >= 100) return 'Gold';
  if (total >= 35) return 'Silver';
  return 'Bronze';
}

export function getTasks(): Task[] {
  return tasks;
}

export function getOffers(): Offer[] {
  return offers;
}

// AUTH
export async function registerUser(email: string, name: string, password: string, refCode?: string | null): Promise<{ user: User; token: string }> {
  seedDemoData();
  const existing = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = generateId('u');
  const referralCode = 'EF-' + name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) + Math.floor(Math.random() * 900 + 100);

  let referredBy: string | null = null;
  if (refCode) {
    const referrer = Array.from(users.values()).find(u => u.referralCode.toUpperCase() === refCode.toUpperCase());
    if (referrer) referredBy = referrer.id;
  }

  const user: User = {
    id,
    email: email.toLowerCase(),
    name: name.trim(),
    passwordHash,
    balance: 0.5, // instant welcome bonus
    totalEarned: 0.5,
    referralCode,
    referredBy,
    level: 'Bronze',
    streak: 0,
    lastClaimDate: null,
    tasksCompleted: 0,
    joinedAt: new Date().toISOString().split('T')[0],
    isPro: false,
  };

  users.set(id, user);
  earnings.set(id, []);
  withdrawals.set(id, []);
  referrals.set(id, []);
  completedTasks.set(id, new Set());
  kanbanBoards.set(id, []); // fresh vibe kanban for new user

  // Welcome earning
  addEarning(id, 0.5, 'bonus', 'Welcome bonus - start earning now!');

  // Handle referral
  if (referredBy) {
    const refBonus = 1.5;
    const refUser = users.get(referredBy)!;
    refUser.balance += refBonus;
    refUser.totalEarned += refBonus;

    const refList = referrals.get(referredBy) || [];
    refList.push({
      id: generateId('ref'),
      referrerId: referredBy,
      referredUserId: id,
      signupBonus: refBonus,
      createdAt: new Date().toISOString(),
    });
    referrals.set(referredBy, refList);

    addEarning(referredBy, refBonus, 'referral', `Referral signup bonus for ${name}`);
  }

  const token = await createSessionToken(user.id);
  return { user: sanitizeUser(user), token };
}

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  seedDemoData();
  const user = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('Invalid credentials');

  // Allow demo login without real password check for the seeded demo account
  const isDemo = user.email === 'demo@earnflow.app';
  const valid = isDemo ? (password === 'demo123' || await bcrypt.compare(password, user.passwordHash)) : await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = await createSessionToken(user.id);
  return { user: sanitizeUser(user), token };
}

async function createSessionToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'earnflow-demo-secret-change-in-prod');
  const { SignJWT } = await import('jose');
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  return token;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'earnflow-demo-secret-change-in-prod');
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, secret);
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

export function getUserById(id: string): User | null {
  const u = users.get(id);
  return u ? sanitizeUser(u) : null;
}

export function sanitizeUser(u: User) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = u;
  return { ...rest, level: getLevel(u.totalEarned) } as any;
}

function addEarning(userId: string, amount: number, source: Earning['source'], description: string) {
  const user = users.get(userId)!;
  let finalAmount = amount;
  // Pro boost: 2x earnings on most sources (except withdrawals/bonuses sometimes)
  if (user.isPro && ['task', 'daily', 'offer', 'vibe'].includes(source)) {
    finalAmount = Math.round(amount * 2 * 100) / 100;
    description = `${description} (Pro 2x boost)`;
  }

  const list = earnings.get(userId) || [];
  const e: Earning = {
    id: generateId('earn'),
    userId,
    amount: finalAmount,
    source,
    description,
    createdAt: new Date().toISOString(),
  };
  list.unshift(e);
  earnings.set(userId, list.slice(0, 200)); // cap history

  user.balance += finalAmount;
  user.totalEarned += finalAmount;
  user.level = getLevel(user.totalEarned);
}

// DAILY CLAIM
export function claimDaily(userId: string): { amount: number; newStreak: number; newBalance: number } {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const today = new Date().toISOString().split('T')[0];
  if (user.lastClaimDate === today) {
    throw new Error('Daily already claimed today');
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = user.lastClaimDate === yesterday ? Math.min(user.streak + 1, 30) : 1;

  const base = 0.65;
  const streakBonus = Math.min(newStreak, 14) * 0.18;
  const amount = Math.round((base + streakBonus) * 100) / 100;

  user.streak = newStreak;
  user.lastClaimDate = today;

  addEarning(userId, amount, 'daily', `Daily login bonus (streak ${newStreak} days)`);

  return { amount, newStreak, newBalance: user.balance };
}

// TASKS
export function completeTask(userId: string, taskId: string): { amount: number; newBalance: number; earning: Earning } {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const task = tasks.find(t => t.id === taskId);
  if (!task) throw new Error('Task not found');

  // Daily limit enforcement (1 per task per day for realism)
  const key = `${userId}:${taskId}:${new Date().toISOString().split('T')[0]}`;
  const todaySet = completedTasks.get(userId) || new Set();
  if (todaySet.has(key)) {
    throw new Error('You already completed this task today');
  }
  todaySet.add(key);
  completedTasks.set(userId, todaySet);

  const amount = task.reward;
  addEarning(userId, amount, 'task', task.title);

  user.tasksCompleted += 1;

  // If this user was referred, credit referrer 8% of task earnings (passive referral income)
  if (user.referredBy) {
    const ref = users.get(user.referredBy);
    if (ref) {
      const refShare = Math.round(amount * 0.08 * 100) / 100;
      if (refShare > 0.05) {
        ref.balance += refShare;
        ref.totalEarned += refShare;
        addEarning(user.referredBy, refShare, 'referral', `8% referral earnings from ${user.name}`);
      }
    }
  }

  const latest = (earnings.get(userId) || [])[0];
  return { amount, newBalance: user.balance, earning: latest };
}

// OFFERS
export function completeOffer(userId: string, offerId: string): { amount: number; newBalance: number } {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const offer = offers.find(o => o.id === offerId);
  if (!offer) throw new Error('Offer not found');

  // One time per offer per user
  const doneKey = `offer:${offerId}`;
  const set = completedTasks.get(userId) || new Set();
  if (set.has(doneKey)) throw new Error('Offer already completed');
  set.add(doneKey);
  completedTasks.set(userId, set);

  addEarning(userId, offer.reward, 'offer', offer.title);

  return { amount: offer.reward, newBalance: user.balance };
}

// REFERRALS
export function getReferralStats(userId: string) {
  const refs = referrals.get(userId) || [];
  const user = users.get(userId)!;
  const totalBonus = refs.reduce((s, r) => s + r.signupBonus, 0);

  // Count additional earnings from referred (we added some in earnings)
  const refEarnings = (earnings.get(userId) || []).filter(e => e.source === 'referral').reduce((s, e) => s + e.amount, 0);

  return {
    code: user.referralCode,
    totalReferred: refs.length,
    signupBonuses: totalBonus,
    earningsFromRefs: Math.round(refEarnings * 100) / 100,
    link: `https://your-deployed-url.com/register?ref=${user.referralCode}`, // will be updated client side
  };
}

// WITHDRAWALS (simulated real flow)
export function requestWithdrawal(userId: string, amount: number, method: WithdrawalRequest['method'], destination: string): WithdrawalRequest {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');
  const min = user.isPro ? 1 : 5;
  if (amount < min) throw new Error(`Minimum withdrawal is $${min}.00${user.isPro ? ' (Pro benefit)' : ''}`);
  if (amount > user.balance) throw new Error('Insufficient balance');

  user.balance -= amount;

  const req: WithdrawalRequest = {
    id: generateId('wd'),
    userId,
    amount,
    method,
    destination,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const list = withdrawals.get(userId) || [];
  list.unshift(req);
  withdrawals.set(userId, list);

  // Record negative earning entry for history
  const listE = earnings.get(userId) || [];
  listE.unshift({
    id: generateId('wd'),
    userId,
    amount: -amount,
    source: 'bonus',
    description: `Withdrawal request #${req.id.slice(-6)} (${method})`,
    createdAt: req.createdAt,
  });
  earnings.set(userId, listE);

  return req;
}

export function getUserWithdrawals(userId: string): WithdrawalRequest[] {
  return withdrawals.get(userId) || [];
}

// HISTORY & STATS
export function getUserEarnings(userId: string, limit = 50): Earning[] {
  return (earnings.get(userId) || []).slice(0, limit);
}

export function getUserDashboard(userId: string) {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const userEarnings = earnings.get(userId) || [];
  const recent = userEarnings.slice(0, 8);
  const totalThisWeek = userEarnings
    .filter(e => new Date(e.createdAt) > new Date(Date.now() - 7 * 86400000))
    .reduce((s, e) => s + e.amount, 0);

  return {
    user: sanitizeUser(user),
    recentEarnings: recent,
    weeklyEarned: Math.max(0, Math.round(totalThisWeek * 100) / 100),
    pendingWithdrawals: (withdrawals.get(userId) || []).filter(w => w.status === 'pending').length,
  };
}

export function getLeaderboard(limit = 10): LeaderboardEntry[] {
  const all = Array.from(users.values())
    .map(u => ({
      id: u.id,
      name: u.name,
      totalEarned: Math.round(u.totalEarned * 100) / 100,
      tasksCompleted: u.tasksCompleted,
      level: getLevel(u.totalEarned),
    }))
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, limit);
  return all;
}

// Admin helpers (demo)
export function getAllUsersForAdmin() {
  return Array.from(users.values()).map(sanitizeUser);
}

export function getAllWithdrawalsForAdmin() {
  const all: any[] = [];
  withdrawals.forEach((list, uid) => {
    const u = users.get(uid);
    list.forEach(w => all.push({ ...w, userName: u?.name || 'Unknown', userEmail: u?.email }));
  });
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function processWithdrawalAdmin(id: string, status: 'paid' | 'rejected', note?: string) {
  for (const [uid, list] of withdrawals.entries()) {
    const w = list.find(x => x.id === id);
    if (w) {
      w.status = status;
      w.processedAt = new Date().toISOString();
      if (note) w.note = note;
      // If rejected, refund
      if (status === 'rejected') {
        const u = users.get(uid)!;
        u.balance += w.amount;
      }
      return true;
    }
  }
  return false;
}

// Passive / fun auto earn helper (used by client polling in demo)
export function creditPassive(userId: string, amount: number, reason: string) {
  const u = users.get(userId);
  if (!u) return;
  addEarning(userId, amount, 'passive', reason);
}

// For live link in UI
export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

export function upgradeUserToPro(userId: string) {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');
  user.isPro = true;
  return user;
}

export function isUserPro(userId: string): boolean {
  const user = users.get(userId);
  return !!user?.isPro;
}

// ========== VIBE KANBAN (the good vibes edition) ==========

export const VIBE_COLUMNS = [
  { id: 'ideate' as const, label: 'Ideate', icon: '🌱', vibeColor: 'violet' },
  { id: 'flow' as const, label: 'In the Flow', icon: '⚡', vibeColor: 'amber' },
  { id: 'ship' as const, label: 'Ship It', icon: '🚀', vibeColor: 'sky' },
  { id: 'banked' as const, label: 'Banked', icon: '🏦', vibeColor: 'emerald' },
] as const;

export type VibeColumn = typeof VIBE_COLUMNS[number];

export function getKanbanBoard(userId: string) {
  const cards = (kanbanBoards.get(userId) || []).slice(); // copy
  return { cards, columns: VIBE_COLUMNS };
}

export function createVibeCard(
  userId: string,
  input: { title: string; description?: string; reward?: number; vibe?: string }
) {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const card: KanbanCard = {
    id: generateId('vibe'),
    title: input.title.trim().slice(0, 80),
    description: input.description ? input.description.trim().slice(0, 200) : undefined,
    reward: input.reward ? Math.max(0.5, Math.round(input.reward * 100) / 100) : undefined,
    vibe: input.vibe || 'chill',
    column: 'ideate',
    createdAt: new Date().toISOString(),
  };

  const list = kanbanBoards.get(userId) || [];
  list.unshift(card);
  kanbanBoards.set(userId, list);
  return card;
}

export function moveVibeCard(userId: string, cardId: string, toColumn: KanbanColumnId) {
  const list = kanbanBoards.get(userId) || [];
  const card = list.find((c) => c.id === cardId);
  if (!card) throw new Error('Vibe card not found');

  const previousColumn = card.column;
  card.column = toColumn;

  // Cash the vibe when it reaches banked (one time reward + tiny bonus for using the tool)
  if (toColumn === 'banked' && previousColumn !== 'banked' && card.reward) {
    addEarning(userId, card.reward, 'vibe', `Vibe cashed: ${card.title}`);
    // Using the Kanban itself is an earning activity
    addEarning(userId, 0.4, 'bonus', 'Vibe Kanban flow bonus');
  }

  return card;
}

export function deleteVibeCard(userId: string, cardId: string) {
  const list = kanbanBoards.get(userId) || [];
  const idx = list.findIndex((c) => c.id === cardId);
  if (idx >= 0) {
    list.splice(idx, 1);
    kanbanBoards.set(userId, list);
  }
}

export function getKanbanStats(userId: string) {
  const cards = kanbanBoards.get(userId) || [];
  const banked = cards.filter((c) => c.column === 'banked');
  const earnedFromVibes = banked.reduce((sum, c) => sum + (c.reward || 0), 0);
  return {
    totalCards: cards.length,
    banked: banked.length,
    earnedFromVibes: Math.round(earnedFromVibes * 100) / 100,
  };
}

