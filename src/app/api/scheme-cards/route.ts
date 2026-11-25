import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const cards = db.getSchemeCards(search);
    return NextResponse.json({ success: true, data: cards });
  } catch (error) {
    console.error('Error fetching scheme cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheme cards' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customerId) {
      return NextResponse.json(
        { success: false, error: 'Please select a customer' },
        { status: 400 }
      );
    }

    if (!body.cardNumber || !body.cardNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'Card number is required' },
        { status: 400 }
      );
    }

    const card = db.createSchemeCard({
      customerId: body.customerId,
      schemeName: body.schemeName || '20-Month Scheme',
      cardNumber: body.cardNumber,
      monthlyInstallment: Number(body.monthlyInstallment) || 500,
      totalInstallments: Number(body.totalInstallments) || 20,
      totalAmount: Number(body.totalAmount) || 10000,
      startDate: body.startDate || new Date().toISOString(),
      status: body.status || 'Active',
    });

    return NextResponse.json({ success: true, data: card }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating scheme card:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Scheme card creation failed' },
      { status: 400 }
    );
  }
}

