import { NextRequest, NextResponse } from 'next/server';
import { getTasks, completeTask, getUserById } from '../../../../lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'demo';
  // For demo, allow without strict auth; in prod add token check
  const tasks = getTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, taskId } = await request.json();
    if (!userId || !taskId) {
      return NextResponse.json({ error: 'Missing userId or taskId' }, { status: 400 });
    }
    const result = completeTask(userId, taskId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
