import {
  allocatePayment,
  calculatePendingAmount,
  calculateAdvanceInstallments,
  calculateRemainingBalance,
  generateInstallmentSchedule,
  normalizeInstallmentStatus,
} from '../src/lib/paymentLogic.js';

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

console.log('--- Testing Payment Allocation Business Logic ---\n');

// Test 1: Installment Schedule Generation
console.log('1. Schedule Generation:');
const schedule = generateInstallmentSchedule('card-test-1', 20, 500, '2026-05-01T00:00:00Z');
assert(schedule.length === 20, 'Generates exactly 20 installments');
assert(schedule[0].installmentNumber === 1, 'First installment is #1');
assert(schedule[19].installmentNumber === 20, 'Last installment is #20');
assert(schedule[0].dueAmount === 500, 'Due amount is ₹500');
assert(schedule[0].paidAmount === 0, 'Initial paid amount is 0');
assert(schedule[0].status === 'Pending', 'Initial status is Pending');

// Test 2: Scenario 1 - Regular Monthly Payment of ₹500
console.log('\n2. Scenario 1: Regular Monthly Payment (₹500):');
const mockInstallments = schedule.map((inst, idx) => ({
  ...inst,
  _id: `inst-test-${idx + 1}`,
}));

const result1 = allocatePayment(mockInstallments, 500, '2026-05-15T00:00:00Z');
assert(result1.totalAllocated === 500, 'Allocated ₹500');
assert(result1.remainingUnallocated === 0, 'No unallocated remaining amount');
assert(result1.installmentsCoveredNumbers.length === 1, 'Covers 1 installment');
assert(result1.installmentsCoveredNumbers[0] === 1, 'Covers installment #1');
assert(result1.installmentsToUpdate[0].newPaidAmount === 500, 'Installment #1 paid amount is ₹500');
assert(result1.installmentsToUpdate[0].newStatus === 'Paid', 'Installment #1 status is Paid');

// Test 3: Scenario 2 - Two-Month Advance Payment of ₹1,000
console.log('\n3. Scenario 2: Two-Month Advance Payment (₹1,000):');
// Suppose installment 1 is paid, customer pays ₹1,000 covering #2 and #3 ahead of schedule
mockInstallments[0].paidAmount = 500;
mockInstallments[0].status = 'Paid';

const result2 = allocatePayment(mockInstallments, 1000, '2026-05-20T00:00:00Z');
assert(result2.totalAllocated === 1000, 'Allocated ₹1,000');
assert(result2.installmentsCoveredNumbers.length === 2, 'Covers 2 installments');
assert(result2.installmentsCoveredNumbers[0] === 2, 'Covers installment #2');
assert(result2.installmentsCoveredNumbers[1] === 3, 'Covers installment #3');
assert(result2.installmentsToUpdate[0].newPaidAmount === 500, 'Installment #2 paid amount is ₹500');
assert(result2.installmentsToUpdate[1].newPaidAmount === 500, 'Installment #3 paid amount is ₹500');
assert(result2.installmentsToUpdate[1].newStatus === 'Advance', 'Installment #3 marked as Advance');

// Test 4: Scenario 4 - Late Payment (Customer missed month 2, pays ₹1,000 in month 3)
console.log('\n4. Scenario 4: Late Payment (clears oldest pending first):');
const lateMockInstallments = [
  { _id: 'i1', installmentNumber: 1, dueDate: '2026-05-01', dueAmount: 500, paidAmount: 500, status: 'Paid' },
  { _id: 'i2', installmentNumber: 2, dueDate: '2026-06-01', dueAmount: 500, paidAmount: 0, status: 'Overdue' },
  { _id: 'i3', installmentNumber: 3, dueDate: '2026-07-01', dueAmount: 500, paidAmount: 0, status: 'Pending' },
  { _id: 'i4', installmentNumber: 4, dueDate: '2026-08-01', dueAmount: 500, paidAmount: 0, status: 'Pending' },
];

const resultLate = allocatePayment(lateMockInstallments, 1000, '2026-07-05');
assert(resultLate.installmentsCoveredNumbers[0] === 2, 'Clears oldest overdue installment #2 first');
assert(resultLate.installmentsCoveredNumbers[1] === 3, 'Clears current installment #3 second');
assert(resultLate.installmentsToUpdate[0].newPaidAmount === 500, 'Installment #2 fully paid');
assert(resultLate.installmentsToUpdate[1].newPaidAmount === 500, 'Installment #3 fully paid');

// Test 5: Scenario 5 - Multiple Advance Payments (₹1,500 pays 3 installments)
console.log('\n5. Scenario 5: Multiple Advance Payments (₹1,500):');
const advanceMock = [
  { _id: 'a1', installmentNumber: 1, dueDate: '2026-05-01', dueAmount: 500, paidAmount: 0, status: 'Pending' },
  { _id: 'a2', installmentNumber: 2, dueDate: '2026-06-01', dueAmount: 500, paidAmount: 0, status: 'Pending' },
  { _id: 'a3', installmentNumber: 3, dueDate: '2026-07-01', dueAmount: 500, paidAmount: 0, status: 'Pending' },
  { _id: 'a4', installmentNumber: 4, dueDate: '2026-08-01', dueAmount: 500, paidAmount: 0, status: 'Pending' },
];

const resultAdv = allocatePayment(advanceMock, 1500, '2026-05-01');
assert(resultAdv.installmentsCoveredNumbers.length === 3, 'Allocates across 3 installments');
assert(resultAdv.installmentsCoveredNumbers.join(',') === '1,2,3', 'Covers installments 1, 2, 3');

// Test 6: Scenario 6 - Partial Payment (₹250)
console.log('\n6. Scenario 6: Partial Payment (₹250):');
const partialMock = [
  { _id: 'p1', installmentNumber: 1, dueDate: '2026-05-01', dueAmount: 500, paidAmount: 0, status: 'Pending' },
];
const resultPartial = allocatePayment(partialMock, 250, '2026-05-05');
assert(resultPartial.installmentsToUpdate[0].newPaidAmount === 250, 'Paid amount is 250');
assert(resultPartial.installmentsToUpdate[0].newStatus === 'Partially Paid', 'Status is Partially Paid');
assert(!resultPartial.installmentsToUpdate[0].isFullyPaidNow, 'isFullyPaidNow is false');

// Test 7: Balance and Pending calculations
console.log('\n7. Calculation Helpers:');
const remaining = calculateRemainingBalance(10000, 3500);
assert(remaining === 6500, 'Remaining balance ₹6,500 for ₹10,000 - ₹3,500');

console.log(`\n========================================`);
console.log(`Total tests: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
console.log(`========================================\n`);

