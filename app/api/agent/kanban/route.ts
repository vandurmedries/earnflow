import { NextRequest, NextResponse } from 'next/server';
import { getKanbanBoard, createVibeCard, moveVibeCard, deleteVibeCard, getUserById } from '../../../../lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  const board = getKanbanBoard(userId);
  return NextResponse.json(board);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, ...data } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    if (action === 'create') {
      const card = createVibeCard(userId, data);
      return NextResponse.json({ success: true, card });
    } else if (action === 'move') {
      const { cardId, toColumn } = data;
      const card = moveVibeCard(userId, cardId, toColumn);
      return NextResponse.json({ success: true, card });
    } else if (action === 'delete') {
      const { cardId } = data;
      deleteVibeCard(userId, cardId);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
