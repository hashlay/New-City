import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draw = db.getDrawById(id);

    if (!draw) {
      return NextResponse.json(
        { success: false, error: 'Draw not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: draw });
  } catch (error) {
    console.error('Error fetching draw:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch draw details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = db.updateDraw(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Draw not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating draw:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update draw' },
      { status: 500 }
    );
  }
}

