import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '../../../../lib/store';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, ref } = await request.json();
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const result = await registerUser(email, name, password, ref || null);
    return NextResponse.json({ success: true, user: result.user, token: result.token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
  }
}
