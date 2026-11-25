import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const draws = db.getDraws();
    return NextResponse.json({ success: true, data: draws });
  } catch (error) {
    console.error('Error fetching draws:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch draws' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.drawNumber) {
      return NextResponse.json(
        { success: false, error: 'Draw number is required' },
        { status: 400 }
      );
    }

    if (!body.drawDate) {
      return NextResponse.json(
        { success: false, error: 'Draw date is required' },
        { status: 400 }
      );
    }

    if (!body.grandPrize || !body.grandPrize.trim()) {
      return NextResponse.json(
        { success: false, error: 'Grand prize is required' },
        { status: 400 }
      );
    }

    const draw = db.createDraw({
      drawNumber: Number(body.drawNumber),
      drawDate: body.drawDate,
      grandPrize: body.grandPrize,
      additionalPrizes: body.additionalPrizes || [],
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: draw }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating draw:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create draw' },
      { status: 400 }
    );
  }
}

