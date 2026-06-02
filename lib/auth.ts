import { cookies } from 'next/headers';
import { verifySessionToken } from './store';

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('earnflow_session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser() {
  const id = await getCurrentUserId();
  if (!id) {
    throw new Error('Unauthorized');
  }
  return id;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('earnflow_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('earnflow_session');
}
