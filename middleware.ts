import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/store';

const PROTECTED = ['/dashboard', '/tasks', '/referrals', '/wallet', '/offers', '/leaderboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get('earnflow_session')?.value;
    const userId = token ? await verifySessionToken(token) : null;

    if (!userId) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Also protect register with ref if wanted, but allow
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|register|login).*)'],
};
