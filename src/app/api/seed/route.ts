import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const store = db.resetToDemoData();
    return NextResponse.json({
      success: true,
      message: 'Demo data re-seeded successfully with realistic customers, cards, and draws',
      data: {
        customersCount: store.customers.length,
        schemeCardsCount: store.schemeCards.length,
        paymentsCount: store.payments.length,
        drawsCount: store.draws.length,
      },
    });
  } catch (error: any) {
    console.error('Error resetting demo data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to re-seed demo data' },
      { status: 500 }
    );
  }
}

