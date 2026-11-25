import { db } from '../src/lib/db.ts';

db.resetToDemoData();
console.log('Successfully re-seeded realistic demo data: 16 customers, active 20-month cards, payments, and draws.');

