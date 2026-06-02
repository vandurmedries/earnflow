'use server';

import { redirect } from 'next/navigation';
import {
  registerUser, loginUser, claimDaily, completeTask, completeOffer,
  requestWithdrawal, getUserDashboard, getUserEarnings, getReferralStats,
  sanitizeUser, getUserById, creditPassive
} from '../lib/store';
import { setSessionCookie, clearSessionCookie, getCurrentUserId } from '../lib/auth';
import { getBaseUrl } from '../lib/store';

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
