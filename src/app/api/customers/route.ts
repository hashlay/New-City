import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const customers = db.getCustomers(search);
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const customer = db.createCustomer({
      name: body.name,
      phone: body.phone,
      address: body.address,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unable to add customer. Please try again.' },
      { status: 500 }
    );
  }
}

