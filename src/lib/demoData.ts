import { Customer, SchemeCard, Installment, Payment, PaymentAllocation, Draw, Winner, Settings } from '@/types';

export const initialSettings: Settings = {
  shopName: 'New City Scheme',
  shopLogoUrl: '',
  phone: '+91 98450 12345',
  address: 'New City Commercial Complex, Main Road',
  currency: '₹',
  defaultSchemeName: 'New City Scheme',
  defaultMonthlyInstallment: 500,
  defaultTotalInstallments: 20,
  defaultDurationMonths: 20,
};

// 16 Realistic customers
export const initialCustomers: Customer[] = [
  { _id: 'cust-01', name: 'Aarav Patel', phone: '98201 11223', address: 'B-204, Shanti Heights, Ring Road', createdAt: '2026-05-10T10:00:00Z' },
  { _id: 'cust-02', name: 'Priya Sharma', phone: '98452 33445', address: '45, Silver Oak Apartments, Civil Lines', createdAt: '2026-05-12T11:30:00Z' },
  { _id: 'cust-03', name: 'Rajesh Kumar Verma', phone: '97110 55667', address: 'Plot 12, Krishna Nagar, Sector 4', createdAt: '2026-05-15T09:15:00Z' },
  { _id: 'cust-04', name: 'Sunita Devi', phone: '99234 77889', address: '102, Royal Residency, Station Road', createdAt: '2026-05-18T14:20:00Z' },
  { _id: 'cust-05', name: 'Vikram Malhotra', phone: '98331 99001', address: '78, Model Town, Near Clock Tower', createdAt: '2026-05-20T16:45:00Z' },
  { _id: 'cust-06', name: 'Ananya Deshmukh', phone: '98765 12340', address: '301, Gulmohar Avenue, Gandhi Chowk', createdAt: '2026-05-22T12:00:00Z' },
  { _id: 'cust-07', name: 'Manoj Tiwari', phone: '94567 89012', address: 'Near Hanuman Temple, Subhash Nagar', createdAt: '2026-05-25T15:30:00Z' },
  { _id: 'cust-08', name: 'Kavita Joshi', phone: '91234 56780', address: 'Flat 12, Sunshine Enclave', createdAt: '2026-06-01T10:10:00Z' },
  { _id: 'cust-09', name: 'Deepak Singhania', phone: '98980 12345', address: 'Shop 5, New Cloth Market', createdAt: '2026-06-05T11:00:00Z' },
  { _id: 'cust-10', name: 'Meera Nambiar', phone: '97890 23456', address: '88, Lake View Layout, 2nd Cross', createdAt: '2026-06-10T17:15:00Z' },
  { _id: 'cust-11', name: 'Sanjay Gupta', phone: '98101 34567', address: 'B-14, Industrial Area, Phase 1', createdAt: '2026-06-15T13:40:00Z' },
  { _id: 'cust-12', name: 'Pooja Agarwal', phone: '99450 45678', address: 'C-7, Vaishali Nagar, By-pass Road', createdAt: '2026-06-18T14:10:00Z' },
  { _id: 'cust-13', name: 'Harish Reddy', phone: '98480 56789', address: '15/2, Balaji Colony, Tirupati Road', createdAt: '2026-06-20T10:30:00Z' },
  { _id: 'cust-14', name: 'Sneha Kulkarni', phone: '98220 67890', address: '402, Shivshankar Park, Kothrud', createdAt: '2026-06-25T16:00:00Z' },
  { _id: 'cust-15', name: 'Rohan Mehta', phone: '98700 78901', address: '55, Marine Lines, West Street', createdAt: '2026-07-01T11:45:00Z' },
  { _id: 'cust-16', name: 'Geeta Choudhary', phone: '94140 89012', address: 'Near Railway Crossing, Old City', createdAt: '2026-07-05T12:20:00Z' },
];

// Scheme Cards representing realistic scenarios under "New City Scheme"
export const initialSchemeCards: SchemeCard[] = [
  // 1. Aarav Patel: Regular 6 installments paid
  {
    _id: 'card-01',
    customerId: 'cust-01',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1001',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-05-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-05-10T10:00:00Z',
  },
  // 2. Priya Sharma: Paid 2 months together in advance (Paid installments 1-8, with 7 & 8 paid early)
  {
    _id: 'card-02',
    customerId: 'cust-02',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1002',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-05-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-05-12T11:30:00Z',
  },
  // 3. Rajesh Kumar: Missed payments after month 3
  {
    _id: 'card-03',
    customerId: 'cust-03',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1003',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-05-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-05-15T09:15:00Z',
  },
  // 4. Sunita Devi: Missed earlier, then paid 2 installments together to clear backlog
  {
    _id: 'card-04',
    customerId: 'cust-04',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1004',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-05-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-05-18T14:20:00Z',
  },
  // 5. Vikram Malhotra: Paid 1-5 + 3 installments advance (₹1,500 advance)
  {
    _id: 'card-05',
    customerId: 'cust-05',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1005',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-05-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-05-20T16:45:00Z',
  },
  // 6. Ananya Deshmukh: Partially paid installment #5
  {
    _id: 'card-06',
    customerId: 'cust-06',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1006',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-05-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-05-22T12:00:00Z',
  },
  // 7. Manoj Tiwari: Regular payments
  {
    _id: 'card-07',
    customerId: 'cust-07',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1007',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-05-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-05-25T15:30:00Z',
  },
  // 8. Kavita Joshi: Regular payments
  {
    _id: 'card-08',
    customerId: 'cust-08',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1008',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-06-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-06-01T10:10:00Z',
  },
  // 9. Deepak Singhania: Has 2 scheme cards
  {
    _id: 'card-09',
    customerId: 'cust-09',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1009',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-06-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-06-05T11:00:00Z',
  },
  {
    _id: 'card-10',
    customerId: 'cust-09',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1010',
    monthlyInstallment: 1000,
    totalInstallments: 20,
    totalAmount: 20000,
    startDate: '2026-06-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-06-05T11:30:00Z',
  },
  // 10. Meera Nambiar
  {
    _id: 'card-11',
    customerId: 'cust-10',
    schemeName: 'New City Scheme',
    cardNumber: 'NC-1011',
    monthlyInstallment: 500,
    totalInstallments: 20,
    totalAmount: 10000,
    startDate: '2026-06-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-06-10T17:15:00Z',
  },
];

// Helper to generate full demo installments and payments
export function generateDemoInstallmentsAndPayments(): {
  installments: Installment[];
  payments: Payment[];
  allocations: PaymentAllocation[];
} {
  const installments: Installment[] = [];
  const payments: Payment[] = [];
  const allocations: PaymentAllocation[] = [];

  let paySeq = 1;
  let allocSeq = 1;

  for (const card of initialSchemeCards) {
    const start = new Date(card.startDate);

    for (let i = 1; i <= card.totalInstallments; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      const instId = `inst-${card._id}-${i}`;

      let paidAmount = 0;
      let status: Installment['status'] = 'Pending';
      let paidDate: string | null = null;

      // Card-specific realistic payment histories
      if (card._id === 'card-01') {
        if (i <= 6) {
          paidAmount = 500;
          status = 'Paid';
          paidDate = dueDate.toISOString();
        } else if (i === 7) {
          status = 'Pending';
        }
      } else if (card._id === 'card-02') {
        if (i <= 6) {
          paidAmount = 500;
          status = 'Paid';
          paidDate = dueDate.toISOString();
        } else if (i <= 8) {
          paidAmount = 500;
          status = 'Advance';
          paidDate = '2026-10-15T10:00:00Z';
        }
      } else if (card._id === 'card-03') {
        if (i <= 3) {
          paidAmount = 500;
          status = 'Paid';
          paidDate = dueDate.toISOString();
        } else if (i <= 6) {
          status = 'Overdue';
        }
      } else if (card._id === 'card-04') {
        if (i <= 6) {
          paidAmount = 500;
          status = 'Paid';
          paidDate = dueDate.toISOString();
        }
      } else if (card._id === 'card-05') {
        if (i <= 5) {
          paidAmount = 500;
          status = 'Paid';
          paidDate = dueDate.toISOString();
        } else if (i <= 8) {
          paidAmount = 500;
          status = 'Advance';
          paidDate = '2026-09-20T10:00:00Z';
        }
      } else if (card._id === 'card-06') {
        if (i <= 4) {
          paidAmount = 500;
          status = 'Paid';
          paidDate = dueDate.toISOString();
        } else if (i === 5) {
          paidAmount = 250;
          status = 'Partially Paid';
          paidDate = dueDate.toISOString();
        }
      } else {
        if (i <= 4) {
          paidAmount = card.monthlyInstallment;
          status = 'Paid';
          paidDate = dueDate.toISOString();
        }
      }

      installments.push({
        _id: instId,
        schemeCardId: card._id,
        installmentNumber: i,
        dueDate: dueDate.toISOString(),
        dueAmount: card.monthlyInstallment,
        paidAmount,
        status,
        paidDate,
      });

      if (paidAmount > 0) {
        const payId = `pay-${paySeq++}`;
        payments.push({
          _id: payId,
          customerId: card.customerId,
          schemeCardId: card._id,
          amount: paidAmount,
          paymentDate: paidDate || new Date().toISOString(),
          paymentMethod: i % 2 === 0 ? 'UPI' : 'Cash',
          notes: `Installment #${i} payment`,
          createdAt: paidDate || new Date().toISOString(),
          installmentsCovered: [i],
        });

        allocations.push({
          _id: `alloc-${allocSeq++}`,
          paymentId: payId,
          schemeCardId: card._id,
          installmentId: instId,
          installmentNumber: i,
          amount: paidAmount,
          allocatedDate: paidDate || new Date().toISOString(),
        });
      }
    }
  }

  return { installments, payments, allocations };
}

// 20 Draws
export const initialDraws: Draw[] = [
  {
    _id: 'draw-01',
    drawNumber: 1,
    drawDate: '2026-05-31T18:00:00Z',
    grandPrize: '2 Gram 24K Gold Coin',
    additionalPrizes: ['Prestige Mixer Grinder', 'Cello Dinner Set (32 Pcs)'],
    status: 'Completed',
    notes: 'Inaugural draw conducted for New City Scheme subscribers.',
  },
  {
    _id: 'draw-02',
    drawNumber: 2,
    drawDate: '2026-06-30T18:00:00Z',
    grandPrize: 'Samsung 32" Smart LED TV',
    additionalPrizes: ['Bajaj Induction Cooktop', 'Milton Thermosteel Flask'],
    status: 'Completed',
    notes: 'Draw #2 completed successfully.',
  },
  {
    _id: 'draw-03',
    drawNumber: 3,
    drawDate: '2026-07-31T18:00:00Z',
    grandPrize: 'Hero Electric Scooter (Special Bumper)',
    additionalPrizes: ['Silver Coin 50g', 'Titan Watch Pair'],
    status: 'Completed',
    notes: 'Bumper monsoon festival draw.',
  },
  {
    _id: 'draw-04',
    drawNumber: 4,
    drawDate: '2026-08-31T18:00:00Z',
    grandPrize: '5 Gram 22K Gold Chain',
    additionalPrizes: ['Microwave Oven', 'Iron Press'],
    status: 'Completed',
    notes: 'August Independence scheme draw.',
  },
  {
    _id: 'draw-05',
    drawNumber: 5,
    drawDate: '2026-09-30T18:00:00Z',
    grandPrize: 'Apple iPad 9th Gen 64GB',
    additionalPrizes: ['Air Fryer', 'Bluetooth Speaker'],
    status: 'Completed',
    notes: 'Festive season kick-off draw.',
  },
  {
    _id: 'draw-06',
    drawNumber: 6,
    drawDate: '2026-10-31T18:00:00Z',
    grandPrize: 'Dhanteras Mega Gold Bar 10g',
    additionalPrizes: ['Silver Thali Set (250g)', 'Smart Watch'],
    status: 'Completed',
    notes: 'Diwali special draw with highest attendance.',
  },
  {
    _id: 'draw-07',
    drawNumber: 7,
    drawDate: '2026-11-30T18:00:00Z',
    grandPrize: 'OnePlus 12R 5G Smartphone',
    additionalPrizes: ['Kent Water Purifier', 'Suitcase Trolley'],
    status: 'Upcoming',
    notes: 'Next scheduled draw at the end of the month.',
  },
  {
    _id: 'draw-08',
    drawNumber: 8,
    drawDate: '2026-12-31T18:00:00Z',
    grandPrize: 'Double Door Refrigerator 260L',
    additionalPrizes: ['Microwave', 'Sandwich Maker'],
    status: 'Upcoming',
  },
  {
    _id: 'draw-09',
    drawNumber: 9,
    drawDate: '2027-01-31T18:00:00Z',
    grandPrize: 'Whirlpool Front Load Washing Machine',
    additionalPrizes: ['Hand Blender', 'Toaster'],
    status: 'Upcoming',
  },
  {
    _id: 'draw-10',
    drawNumber: 10,
    drawDate: '2027-02-28T18:00:00Z',
    grandPrize: '5 Gram Gold Coin',
    additionalPrizes: ['Vacuum Cleaner', 'Dinner Set'],
    status: 'Upcoming',
  },
];

// Sample Winners for Completed Draws
export const initialWinners: Winner[] = [
  {
    _id: 'win-01',
    drawId: 'draw-01',
    customerId: 'cust-01',
    schemeCardId: 'card-01',
    prize: '2 Gram 24K Gold Coin',
    winnerInformation: 'Token #42 drawn. Winner Aarav Patel felicitated under New City Scheme.',
    wonDate: '2026-05-31T19:00:00Z',
  },
  {
    _id: 'win-02',
    drawId: 'draw-02',
    customerId: 'cust-04',
    schemeCardId: 'card-04',
    prize: 'Samsung 32" Smart LED TV',
    winnerInformation: 'Handed over on 2nd July at showroom.',
    wonDate: '2026-06-30T19:00:00Z',
  },
  {
    _id: 'win-03',
    drawId: 'draw-03',
    customerId: 'cust-05',
    schemeCardId: 'card-05',
    prize: 'Hero Electric Scooter (Special Bumper)',
    winnerInformation: 'Winner Vikram Malhotra received vehicle keys.',
    wonDate: '2026-07-31T19:00:00Z',
  },
  {
    _id: 'win-04',
    drawId: 'draw-04',
    customerId: 'cust-08',
    schemeCardId: 'card-08',
    prize: '5 Gram 22K Gold Chain',
    winnerInformation: 'Verified installment receipt and handed over.',
    wonDate: '2026-08-31T19:00:00Z',
  },
  {
    _id: 'win-05',
    drawId: 'draw-05',
    customerId: 'cust-02',
    schemeCardId: 'card-02',
    prize: 'Apple iPad 9th Gen 64GB',
    winnerInformation: 'Customer Priya Sharma felicitated at store.',
    wonDate: '2026-09-30T19:00:00Z',
  },
  {
    _id: 'win-06',
    drawId: 'draw-06',
    customerId: 'cust-07',
    schemeCardId: 'card-07',
    prize: 'Dhanteras Mega Gold Bar 10g',
    winnerInformation: 'Diwali special bumper prize winner.',
    wonDate: '2026-10-31T19:00:00Z',
  },
];
