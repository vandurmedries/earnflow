import { NextRequest, NextResponse } from 'next/server';
import { claimDaily, getUserById, getUserEarnings, getUserDashboard, getPlatformBalance, payoutToBank } from '../../../../lib/store';

export async function POST(request: NextRequest) {
  try {
    const { userId, action, amount } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    if (action === 'daily') {
      const res = claimDaily(userId);
      return NextResponse.json({ success: true, ...res });
    }
    if (action === 'payout') {
      if (!amount) return NextResponse.json({ error: 'amount required' }, { status: 400 });
      const res = await payoutToBank(amount);
      return NextResponse.json({ success: true, ...res });
    }
    if (action === 'reinvest') {
      if (!amount) return NextResponse.json({ error: 'amount required' }, { status: 400 });
      const { reinvestPlatform } = await import('../../../../lib/store');
      const res = reinvestPlatform(amount);
      return NextResponse.json({ success: true, ...res });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  const dashboard = getUserDashboard(userId);
  const earnings = getUserEarnings(userId, 5);
  const platform = getPlatformBalance();
  return NextResponse.json({ dashboard, recentEarnings: earnings, platformBalance: platform });
}
