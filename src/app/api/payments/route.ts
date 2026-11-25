import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const schemeCardId = searchParams.get('schemeCardId') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;

    const payments = db.getPayments({
      search,
      customerId,
      schemeCardId,
      paymentMethod,
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer is required' },
        { status: 400 }
      );
    }

    if (!body.schemeCardId) {
      return NextResponse.json(
        { success: false, error: 'Scheme card is required' },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid payment amount greater than zero' },
        { status: 400 }
      );
    }

    const result = db.recordPayment({
      customerId: body.customerId,
      schemeCardId: body.schemeCardId,
      amount,
      paymentDate: body.paymentDate || new Date().toISOString(),
      paymentMethod: body.paymentMethod || 'Cash',
      notes: body.notes,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.payment,
        allocations: result.allocationResult,
        message: `Payment of ₹${amount} recorded and allocated to installments ${result.allocationResult.installmentsCoveredNumbers.join(', ')}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Payment recording error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unable to record payment. Please try again.' },
      { status: 400 }
    );
  }
}

