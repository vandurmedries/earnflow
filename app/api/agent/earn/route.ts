import { NextRequest, NextResponse } from 'next/server';
import { claimDaily, getUserById, getUserEarnings, getUserDashboard } from '../../../../lib/store';

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    if (action === 'daily') {
      const res = claimDaily(userId);
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
  return NextResponse.json({ dashboard, recentEarnings: earnings });
}
