'use server';

import { redirect } from 'next/navigation';
import {
  registerUser, loginUser, claimDaily, completeTask, completeOffer,
  requestWithdrawal, getUserDashboard, getUserEarnings, getReferralStats,
  sanitizeUser, getUserById, creditPassive,
  getKanbanBoard, createVibeCard, moveVibeCard, deleteVibeCard, getKanbanStats
} from '../lib/store';
import { setSessionCookie, clearSessionCookie, getCurrentUserId } from '../lib/auth';
import { getBaseUrl } from '../lib/store';
import { stripe, PRO_BOOST_AMOUNT } from '../lib/stripe';

export async function registerAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const password = String(formData.get('password') || '');
  const ref = String(formData.get('ref') || '').trim() || null;

  if (!email || !name || !password || password.length < 4) {
    return { error: 'Please provide valid name, email and password (min 4 chars)' };
  }

  try {
    const { user, token } = await registerUser(email, name, password, ref);
    await setSessionCookie(token);
    return { success: true, user };
  } catch (e: any) {
    return { error: e.message || 'Registration failed' };
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  try {
    const { user, token } = await loginUser(email, password);
    await setSessionCookie(token);
    return { success: true, user };
  } catch (e: any) {
    return { error: e.message || 'Login failed' };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/');
}

export async function claimDailyAction() {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };
  try {
    const res = claimDaily(userId);
    return { success: true, ...res };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function completeTaskAction(taskId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };
  try {
    const res = completeTask(userId, taskId);
    return { success: true, ...res };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function completeOfferAction(offerId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };
  try {
    const res = completeOffer(userId, offerId);
    return { success: true, ...res };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function requestWithdrawAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };

  const amount = parseFloat(String(formData.get('amount') || '0'));
  const method = String(formData.get('method')) as any;
  const destination = String(formData.get('destination') || '').trim();

  if (!amount || !method || !destination) return { error: 'All fields required' };

  try {
    const wd = requestWithdrawal(userId, amount, method, destination);
    return { success: true, withdrawal: wd };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function creditPassiveAction(amount: number, reason: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };
  creditPassive(userId, amount, reason);
  return { success: true };
}

export async function getDashboardData() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return getUserDashboard(userId);
}

export async function getEarningsHistory() {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  return getUserEarnings(userId);
}

export async function getMyReferrals() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const stats = getReferralStats(userId);
  // Inject correct public base
  stats.link = `${getBaseUrl()}/register?ref=${stats.code}`;
  return stats;
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return getUserById(userId);
}

// ========== VIBE KANBAN ACTIONS ==========

export async function getVibeKanban() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return getKanbanBoard(userId);
}

export async function createVibeCardAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim() || undefined;
  const rewardStr = String(formData.get('reward') || '');
  const vibe = String(formData.get('vibe') || 'chill');

  if (!title) return { error: 'Title is required' };

  const reward = rewardStr ? parseFloat(rewardStr) : undefined;

  try {
    const card = createVibeCard(userId, { title, description, reward, vibe });
    return { success: true, card };
  } catch (e: any) {
    return { error: e.message || 'Failed to create vibe' };
  }
}

export async function moveVibeCardAction(cardId: string, toColumn: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };
  try {
    const card = moveVibeCard(userId, cardId, toColumn as any);
    return { success: true, card };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteVibeCardAction(cardId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };
  try {
    deleteVibeCard(userId, cardId);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getVibeKanbanStats() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return getKanbanStats(userId);
}

export async function createProBoostCheckoutAction() {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not logged in' };

  try {
    const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'EarnFlow Pro Boost',
              description: 'Unlock 2x earnings on all tasks, offers & vibes for 30 days + instant cashouts (min $1)',
            },
            unit_amount: PRO_BOOST_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wallet`,
      metadata: { userId, type: 'pro_boost' },
    });

    return { success: true, url: session.url };
  } catch (e: any) {
    return { error: e.message || 'Failed to create checkout' };
  }
}

export async function verifyProPurchase(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return { error: 'Payment not completed' };
    }
    const userId = session.metadata?.userId;
    if (!userId) return { error: 'Invalid session' };

    // Use the store function (imported at top of file via other imports? Wait, add import if needed)
    // For now call via dynamic or assume
    const { upgradeUserToPro } = await import('../lib/store');
    upgradeUserToPro(userId);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

