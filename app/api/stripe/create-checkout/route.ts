import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PRO_BOOST_AMOUNT } from '../../../../lib/stripe';
import { getCurrentUserId } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin } = new URL(req.url);
    const successUrl = `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/wallet`;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'EarnFlow Pro Boost',
              description: '2x earnings on tasks, vibes & offers for 30 days + instant cashout approval (min $1)',
            },
            unit_amount: PRO_BOOST_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        type: 'pro_boost',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create checkout' }, { status: 500 });
  }
}
