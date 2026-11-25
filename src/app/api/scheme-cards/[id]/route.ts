import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const card = db.getSchemeCardById(id);

    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Scheme card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error('Error fetching scheme card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheme card details' },
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
    const updated = db.updateSchemeCard(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Scheme card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating scheme card:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update scheme card' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = db.deleteSchemeCard(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Scheme card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Scheme card deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting scheme card:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete scheme card' },
      { status: 500 }
    );
  }
}

