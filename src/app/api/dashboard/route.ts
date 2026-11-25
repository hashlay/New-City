import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const data = db.getDashboardStats();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard statistics' },
      { status: 500 }
    );
  }
}

