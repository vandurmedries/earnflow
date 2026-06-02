import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { upgradeUserToPro, getUserById } from '../../../../lib/store';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'No userId in session' }, { status: 400 });
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isPro) {
      return NextResponse.json({ success: true, alreadyPro: true });
    }

    upgradeUserToPro(userId);

    return NextResponse.json({ success: true, message: 'Pro status granted!' });
  } catch (err: any) {
    console.error('Verify pro error:', err);
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
