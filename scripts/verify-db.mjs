import { db } from '../src/lib/db.ts';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('--- Testing Unified Database Service & Workflows ---\n');

// 1. Demo Data
console.log('1. Demo Data Initialization:');
const resetResult = db.resetToDemoData();
assert(resetResult.customers.length >= 15, `At least 15 demo customers present (${resetResult.customers.length})`);
assert(resetResult.schemeCards.length >= 10, `Multiple active scheme cards present (${resetResult.schemeCards.length})`);
assert(resetResult.draws.length >= 10, `Draws present (${resetResult.draws.length})`);
assert(resetResult.winners.length > 0, `Sample winners present (${resetResult.winners.length})`);

// 2. Customer Management
console.log('\n2. Customer Operations:');
const createdCustomer = db.createCustomer({
  name: 'Test Customer Alpha',
  phone: '99999 88888',
  address: 'Test Address 123',
});
assert(createdCustomer._id.startsWith('cust-'), 'Customer created with ID');
assert(createdCustomer.name === 'Test Customer Alpha', 'Customer name stored correctly');

const fetchedCust = db.getCustomerById(createdCustomer._id);
assert(fetchedCust !== null && fetchedCust.name === 'Test Customer Alpha', 'Fetched customer by ID');

const updatedCust = db.updateCustomer(createdCustomer._id, { notes: 'Verified VIP member' });
assert(updatedCust.notes === 'Verified VIP member', 'Updated customer notes');

// 3. Scheme Card Management
console.log('\n3. Scheme Card Operations:');
const newCard = db.createSchemeCard({
  customerId: createdCustomer._id,
  schemeName: '20-Month Gold Scheme',
  cardNumber: 'SC-TEST-999',
  monthlyInstallment: 500,
  totalInstallments: 20,
  totalAmount: 10000,
  startDate: '2026-05-01T00:00:00Z',
});
assert(newCard.cardNumber === 'SC-TEST-999', 'Scheme card created with unique number');

const cardDetails = db.getSchemeCardById(newCard._id);
assert(cardDetails !== null, 'Fetched scheme card details');
assert(cardDetails.installments.length === 20, 'Automatically generated 20 installments schedule');
assert(cardDetails.installments[0].installmentNumber === 1, 'First installment exists');
assert(cardDetails.installments[19].installmentNumber === 20, '20th installment exists');

// 4. Payment Recording & Automatic Allocation
console.log('\n4. Payment Recording & Automatic Allocation:');
const payResult = db.recordPayment({
  customerId: createdCustomer._id,
  schemeCardId: newCard._id,
  amount: 1000,
  paymentDate: '2026-05-10T00:00:00Z',
  paymentMethod: 'UPI',
  notes: 'Test initial payment of 2 installments',
});
assert(payResult.payment.amount === 1000, 'Recorded payment amount is ₹1,000');
assert(payResult.allocationResult.installmentsCoveredNumbers.length === 2, 'Allocated across 2 installments (#1 and #2)');

// Verify card reflection
const updatedCard = db.getSchemeCardById(newCard._id);
assert(updatedCard.totalPaid === 1000, 'Card totalPaid reflected as ₹1,000');
assert(updatedCard.remainingAmount === 9000, 'Card remainingAmount reflected as ₹9,000');
assert(updatedCard.paidInstallmentsCount === 2, '2 installments paid');

// 5. Draws & Winner Recording
console.log('\n5. Draws & Winner Recording:');
const newDraw = db.createDraw({
  drawNumber: 99,
  drawDate: '2026-12-31T00:00:00Z',
  grandPrize: 'Pure Silver Coin 100g',
});
assert(newDraw.drawNumber === 99, 'Created draw #99');

const recordedWinner = db.recordWinner({
  drawId: newDraw._id,
  customerId: createdCustomer._id,
  schemeCardId: newCard._id,
  prize: 'Pure Silver Coin 100g',
  winnerInformation: 'Selected via bumper draw',
});
assert(recordedWinner.prize === 'Pure Silver Coin 100g', 'Winner recorded successfully');

const drawAfterWinner = db.getDrawById(newDraw._id);
assert(drawAfterWinner.status === 'Completed', 'Draw marked as Completed upon winner recording');
assert(drawAfterWinner.winners.length === 1, 'Winner linked to draw');

// 6. Dashboard Statistics
console.log('\n6. Dashboard Stats:');
const dashboard = db.getDashboardStats();
assert(dashboard.stats.totalCustomers >= 16, 'Total customers counted in stats');
assert(dashboard.stats.activeSchemeCards >= 11, 'Active scheme cards counted');
assert(dashboard.stats.totalCollection > 0, 'Total collections calculated');
assert(Array.isArray(dashboard.recentPayments), 'Recent payments array returned');
assert(Array.isArray(dashboard.duePayments), 'Due payments array returned');

// Cleanup
db.deleteCustomer(createdCustomer._id);
assert(db.getCustomerById(createdCustomer._id) === null, 'Customer and cascading data deleted cleanly');

console.log(`\n========================================`);
console.log(`Total tests: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
console.log(`========================================\n`);

