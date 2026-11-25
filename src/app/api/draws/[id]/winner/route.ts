import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.customerId) {
      return NextResponse.json(
        { success: false, error: 'Winner customer is required' },
        { status: 400 }
      );
    }

    if (!body.schemeCardId) {
      return NextResponse.json(
        { success: false, error: 'Winner scheme card is required' },
        { status: 400 }
      );
    }

    if (!body.prize || !body.prize.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prize description is required' },
        { status: 400 }
      );
    }

    const winner = db.recordWinner({
      drawId: id,
      customerId: body.customerId,
      schemeCardId: body.schemeCardId,
      prize: body.prize,
      winnerInformation: body.winnerInformation,
    });

    return NextResponse.json({ success: true, data: winner }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording winner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record winner' },
      { status: 400 }
    );
  }
}

